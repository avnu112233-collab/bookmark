import React, { useState, useEffect } from 'react';
import { Card, Button, Form, message, Steps, Spin, Descriptions, Alert, Tag } from 'antd';
import { ScanOutlined, UserOutlined, BookOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { studentsAPI, booksAPI } from '../services/api';
import axios from 'axios';
import dayjs from 'dayjs';

const { Step } = Steps;

const NewBorrowing = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false); // New state for scanning control
    const [studentData, setStudentData] = useState(null);
    const [studentBooks, setStudentBooks] = useState([]);
    const [bookCode, setBookCode] = useState('');
    const [form] = Form.useForm();
    const [pollingInterval, setPollingInterval] = useState(null);
    const [useManualUSN, setUseManualUSN] = useState(false);

    const handleManualUSNSubmit = async (values) => {
        setLoading(true);
        try {
            // We need to implement a getByUSN endpoint or filter on the client side if not available
            // For now, let's assume we can search by USN
            const response = await studentsAPI.getAll();
            if (response.data.success) {
                const student = response.data.data.find(s => s.usn.toLowerCase() === values.usn.toLowerCase());
                if (student) {
                    setStudentData(student);
                    setCurrentStep(1);
                    setLoading(false);
                    message.success('Student found! Please enter book code.');
                } else {
                    message.error('Student not found with this USN');
                    setLoading(false);
                }
            }
        } catch (error) {
            message.error('Failed to fetch student details');
            setLoading(false);
        }
    };

    // Poll for fingerprint scans only when scanning is enabled
    useEffect(() => {
        if (currentStep === 0 && scanning) {
            // Start polling for fingerprint scans
            const interval = setInterval(async () => {
                try {
                    const response = await axios.get('/api/fingerprint/pending');
                    if (response.data.success && response.data.data) {
                        const fingerId = response.data.data.finger_id;
                        console.log('Fingerprint detected:', fingerId);
                        setScanning(false); // Stop scanning
                        await fetchStudentData(fingerId);
                        clearInterval(interval);
                    }
                } catch (error) {
                    // Silently continue polling
                }
            }, 1000); // Poll every second

            setPollingInterval(interval);

            return () => {
                if (interval) clearInterval(interval);
            };
        } else {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
            }
        }
    }, [currentStep, scanning]);

    const fetchStudentData = async (fingerId) => {
        try {
            const response = await studentsAPI.getByFingerId(fingerId);
            if (response.data.success && response.data.data) {
                const student = response.data.data;
                setStudentData(student);

                if (mode === 'return') {
                    // Fetch all books and filter for this student
                    // Ideally, backend should have an endpoint for this
                    const booksResponse = await booksAPI.getAll();
                    if (booksResponse.data.success) {
                        const allBooks = booksResponse.data.data;
                        const borrowed = allBooks.filter(b =>
                            b.name.toLowerCase() === student.name.toLowerCase()
                        );
                        setStudentBooks(borrowed);
                    }
                }

                setCurrentStep(1);
                setLoading(false);
                message.success(`Student found: ${student.name}`);
            } else {
                message.error('No student found with this fingerprint ID');
                setLoading(true); // Continue polling
            }
        } catch (error) {
            message.error(error.response?.data?.error || 'Student not found. Please register first.');
            setLoading(true); // Continue polling
        }
    };

    const handleReturnBook = async (bookId) => {
        try {
            await booksAPI.delete(bookId);
            message.success('Book returned successfully');

            // Update local state
            const updatedBooks = studentBooks.filter(b => b.id !== bookId);
            setStudentBooks(updatedBooks);

            // If no more books, maybe reset or show success message
            if (updatedBooks.length === 0) {
                message.info('No more books to return for this student.');
            }
        } catch (error) {
            message.error('Failed to return book');
        }
    };

    const calculateDaysRemaining = (borrowDate) => {
        if (!borrowDate) return 0;
        const borrow = dayjs(borrowDate);
        const dueDate = borrow.add(14, 'days');
        const today = dayjs();
        return dueDate.diff(today, 'days');
    };

    const handleSubmitBorrowing = async (values) => {
        setLoading(true);
        try {
            const borrowData = {
                name: studentData.name,
                branch: studentData.branch,
                semester: studentData.semester,
                book_code: values.book_code,
                borrow_date: new Date().toISOString().split('T')[0],
            };

            await booksAPI.create(borrowData);
            setBookCode(values.book_code);
            message.success('Book borrowed successfully!');
            setCurrentStep(2);
            setLoading(false);

            // Reset after 3 seconds
            setTimeout(() => {
                resetForm();
            }, 2000);
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to record borrowing');
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCurrentStep(0);
        setStudentData(null);
        setStudentBooks([]);
        setBookCode('');
        setLoading(false);
        setScanning(false); // Stop scanning
        form.resetFields();
    };

    const startScanning = () => {
        setScanning(true);
        setLoading(true);
        message.info('Scanning started. Please scan your fingerprint.');
    };

    const [mode, setMode] = useState('borrow'); // 'borrow' or 'return'

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2>
                    <BookOutlined style={{ marginRight: 8, color: '#1b463e' }} />
                    Shelf
                </h2>
                <p style={{ color: '#1b463e', marginTop: 8 }}>
                    Select an action and scan fingerprint to proceed
                </p>
            </div>

            <div style={{ display: 'flex', gap: 24, marginBottom: 32, maxWidth: 800, margin: '0 auto 32px' }}>
                <Button
                    size="large"
                    block
                    onClick={() => setMode('borrow')}
                    style={{
                        height: 60,
                        fontSize: 20,
                        fontWeight: 'bold',
                        backgroundColor: mode === 'borrow' ? '#1b463e' : 'white',
                        color: mode === 'borrow' ? 'white' : '#1b463e',
                        borderColor: '#1b463e',
                        boxShadow: mode === 'borrow' ? '0 4px 14px 0 rgba(27, 70, 62, 0.39)' : 'none'
                    }}
                >
                    BORROW
                </Button>
                <Button
                    size="large"
                    block
                    onClick={() => setMode('return')}
                    style={{
                        height: 60,
                        fontSize: 20,
                        fontWeight: 'bold',
                        backgroundColor: mode === 'return' ? '#1b463e' : 'white',
                        color: mode === 'return' ? 'white' : '#1b463e',
                        borderColor: '#1b463e',
                        boxShadow: mode === 'return' ? '0 4px 14px 0 rgba(27, 70, 62, 0.39)' : 'none'
                    }}
                >
                    RETURN
                </Button>
            </div>

            <Card style={{ maxWidth: 800, margin: '0 auto' }}>
                <Steps current={currentStep} style={{ marginBottom: 32 }}>
                    <Step title="Scan Fingerprint" icon={<ScanOutlined />} />
                    <Step title={mode === 'borrow' ? "Enter Book Code" : "Select Book"} icon={<BookOutlined />} />
                    <Step title="Complete" icon={<CheckCircleOutlined />} />
                </Steps>

                {/* Step 0: Fingerprint Scan */}
                {currentStep === 0 && (
                    <div style={{ textAlign: 'center', padding: '50px 30px' }}>
                        <ScanOutlined
                            style={{
                                fontSize: 64,
                                color: scanning ? '#0B2B26' : '#1b463e',
                                marginBottom: 24,
                                animation: scanning ? 'pulse 1.5s ease-in-out infinite' : 'none'
                            }}
                        />
                        <h3 style={{ marginBottom: 24 }}>
                            {scanning ? 'Waiting for Fingerprint...' : 'Ready to Scan'}
                        </h3>
                        <p style={{ color: '#163832', marginBottom: 32 }}>
                            {scanning
                                ? 'Please place your finger on the scanner'
                                : useManualUSN
                                    ? 'Enter Student USN manually'
                                    : 'Click the button below to start fingerprint scanning'}
                        </p>

                        {useManualUSN ? (
                            <div style={{ maxWidth: 400, margin: '0 auto' }}>
                                <Form onFinish={handleManualUSNSubmit} layout="vertical">
                                    <Form.Item
                                        name="usn"
                                        rules={[{ required: true, message: 'Please enter USN' }]}
                                    >
                                        <input
                                            placeholder="Enter USN (e.g., 1MS21CS001)"
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                fontSize: '16px',
                                                border: '1px solid #d9d9d9',
                                                borderRadius: '4px',
                                                marginBottom: 16
                                            }}
                                            autoFocus
                                        />
                                    </Form.Item>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <Button
                                            size="large"
                                            onClick={() => setUseManualUSN(false)}
                                            style={{ flex: 1 }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            loading={loading}
                                            style={{ flex: 1 }}
                                        >
                                            Find Student
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        ) : !scanning ? (
                            <div style={{ maxWidth: 400, margin: '0 auto' }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    onClick={startScanning}
                                    icon={<ScanOutlined style={{ fontSize: 20 }} />}
                                    style={{
                                        marginBottom: 24,
                                        height: 60,
                                        fontSize: 20,
                                        backgroundColor: '#1b463e',
                                        borderColor: '#1b463e'
                                    }}
                                >
                                    Start Scanning
                                </Button>

                                <Button
                                    size="large"
                                    block
                                    onClick={() => setUseManualUSN(true)}
                                    icon={<UserOutlined style={{ fontSize: 20 }} />}
                                    style={{
                                        marginBottom: 24,
                                        backgroundColor: 'white',
                                        borderColor: '#1b463e',
                                        color: '#1b463e',
                                        height: 60,
                                        fontSize: 20
                                    }}
                                >
                                    Use USN
                                </Button>


                            </div>
                        ) : (
                            <div>
                                <Alert
                                    message="Scanning Active"
                                    description="The system is now listening for fingerprint scans. Place your finger on the sensor."
                                    type="success"
                                    showIcon
                                    style={{ marginTop: 24, textAlign: 'left', maxWidth: 500, margin: '0 auto 24px' }}
                                />

                                <div style={{ marginTop: 32 }}>
                                    <Spin size="large" tip="Listening for fingerprint scan..." />
                                </div>

                                <Button
                                    size="large"
                                    onClick={() => {
                                        setScanning(false);
                                        setLoading(false);
                                        message.info('Scanning stopped');
                                    }}
                                    style={{ marginTop: 24 }}
                                >
                                    Stop Scanning
                                </Button>
                            </div>
                        )}

                        <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.1); }
              }
            `}</style>
                    </div>
                )}

                {/* Step 1: Show Student Details and Enter Book Code */}
                {currentStep === 1 && studentData && (
                    <div>
                        <Alert
                            message="Student Found!"
                            description={mode === 'borrow'
                                ? "Please verify the details below and enter the book code."
                                : "Select a book from the list below to return it."}
                            type="success"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />

                        <Card
                            title={<span><UserOutlined /> Student Information</span>}
                            style={{ marginBottom: 24, backgroundColor: '#f9f9f9' }}
                        >
                            <Descriptions column={1} bordered>
                                <Descriptions.Item label="Name">
                                    <strong>{studentData.name}</strong>
                                </Descriptions.Item>
                                <Descriptions.Item label="USN">
                                    {studentData.usn}
                                </Descriptions.Item>
                                <Descriptions.Item label="Semester">
                                    {studentData.semester || '—'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Branch">
                                    {studentData.branch || '—'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Finger ID">
                                    <code style={{ color: '#1b463e' }}>{studentData.finger_id}</code>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmitBorrowing}
                            style={{ display: mode === 'borrow' ? 'block' : 'none' }}
                        >
                            <Form.Item
                                name="book_code"
                                label="Book Code (6 digits)"
                                rules={[
                                    { required: true, message: 'Please enter book code!' },
                                    { pattern: /^\d{6}$/, message: 'Book code must be exactly 6 digits!' }
                                ]}
                            >
                                <input
                                    size="large"
                                    placeholder="Enter 6-digit book code"
                                    maxLength={6}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        fontSize: '16px',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '4px'
                                    }}
                                    autoFocus
                                />
                            </Form.Item>

                            <div style={{ display: 'flex', gap: 16 }}>
                                <Button size="large" onClick={resetForm} style={{ flex: 1 }}>
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    htmlType="submit"
                                    loading={loading}
                                    style={{ flex: 1 }}
                                    icon={<CheckCircleOutlined />}
                                >
                                    Confirm Borrowing
                                </Button>
                            </div>
                        </Form>

                        {mode === 'return' && (
                            <div style={{ marginTop: 32 }}>
                                <h3>Borrowed Books ({studentBooks.length})</h3>
                                {studentBooks.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c', background: '#f5f5f5', borderRadius: 8 }}>
                                        No borrowed books found for this student.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {studentBooks.map(book => (
                                            <Card key={book.id} size="small" type="inner">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontSize: 16, fontWeight: 'bold' }}>Book Code: {book.book_code}</div>
                                                        <div style={{ color: '#8c8c8c' }}>
                                                            Borrowed: {dayjs(book.borrow_date).format('DD MMM YYYY')}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                        <Tag color={calculateDaysRemaining(book.borrow_date) < 0 ? 'red' : 'green'}>
                                                            {calculateDaysRemaining(book.borrow_date) < 0 ? 'Overdue' : 'Active'}
                                                        </Tag>
                                                        <Button
                                                            type="primary"
                                                            danger
                                                            onClick={() => handleReturnBook(book.id)}
                                                        >
                                                            Return Book
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                <Button size="large" onClick={resetForm} style={{ marginTop: 24, width: '100%' }}>
                                    Done / Scan Another
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Success */}
                {currentStep === 2 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <CheckCircleOutlined style={{ fontSize: 64, color: '#1b463e', marginBottom: 24 }} />
                        <h3 style={{ color: '#1b463e', marginBottom: 16 }}>
                            Book Borrowed Successfully!
                        </h3>
                        <p style={{ color: '#1b463e', marginBottom: 32 }}>
                            The borrowing has been recorded in the system.
                        </p>

                        {studentData && (
                            <Card style={{ maxWidth: 400, margin: '0 auto 24px', backgroundColor: '#DAF1DE' }}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Student">{studentData.name}</Descriptions.Item>
                                    <Descriptions.Item label="USN">{studentData.usn}</Descriptions.Item>
                                    <Descriptions.Item label="Book Code">
                                        <code style={{ color: '#1b463e', fontWeight: 'bold' }}>{bookCode}</code>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Date">
                                        {new Date().toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        )}

                        <Button type="primary" size="large" onClick={resetForm}>
                            Record Another Borrowing
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default NewBorrowing;
