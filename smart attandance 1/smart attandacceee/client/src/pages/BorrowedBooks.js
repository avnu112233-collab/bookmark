import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message, Card, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, BookOutlined } from '@ant-design/icons';
import { booksAPI } from '../services/api';
import dayjs from 'dayjs';

const BorrowedBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await booksAPI.getAll();
            if (response.data.success) {
                setBooks(response.data.data);
            }
        } catch (error) {
            message.error('Failed to fetch borrowed books');
        } finally {
            setLoading(false);
        }
    };



    const handleEdit = (record) => {
        setEditingBook(record);
        form.setFieldsValue({
            ...record,
            borrow_date: record.borrow_date ? dayjs(record.borrow_date) : null,
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await booksAPI.delete(id);
            message.success('Book record deleted successfully');
            fetchBooks();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to delete book record');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const formData = {
                ...values,
                borrow_date: values.borrow_date ? values.borrow_date.format('YYYY-MM-DD') : null,
            };

            if (editingBook) {
                await booksAPI.update(editingBook.id, formData);
                message.success('Book record updated successfully');
            } else {
                await booksAPI.create(formData);
                message.success('Book record added successfully');
            }
            setModalVisible(false);
            form.resetFields();
            fetchBooks();
        } catch (error) {
            message.error(error.response?.data?.error || 'Operation failed');
        }
    };



    const calculateDaysRemaining = (borrowDate) => {
        if (!borrowDate) return '—';

        const borrow = dayjs(borrowDate);
        const dueDate = borrow.add(14, 'days'); // 14 days borrowing period
        const today = dayjs();
        const daysRemaining = dueDate.diff(today, 'days');

        return daysRemaining;
    };

    const getDaysRemainingTag = (days) => {
        if (days === '—') return <Tag>—</Tag>;

        if (days < 0) {
            return <Tag color="red">Overdue by {Math.abs(days)} days</Tag>;
        } else if (days === 0) {
            return <Tag color="orange">Due Today</Tag>;
        } else if (days <= 3) {
            return <Tag color="orange">{days} days left</Tag>;
        } else {
            return <Tag color="green">{days} days left</Tag>;
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Branch & Semester',
            key: 'branch_sem',
            render: (_, record) => `${record.branch || '—'} - Sem ${record.semester || '—'}`,
            sorter: (a, b) => {
                const aVal = `${a.branch}-${a.semester}`;
                const bVal = `${b.branch}-${b.semester}`;
                return aVal.localeCompare(bVal);
            },
        },
        {
            title: 'Book Code',
            dataIndex: 'book_code',
            key: 'book_code',
            render: (code) => <code style={{ color: '#228B22', fontWeight: 500 }}>{code}</code>,
            sorter: (a, b) => a.book_code.localeCompare(b.book_code),
        },
        {
            title: 'Date of Borrowing',
            dataIndex: 'borrow_date',
            key: 'borrow_date',
            render: (date) => date ? dayjs(date).format('DD MMM YYYY') : '—',
            sorter: (a, b) => new Date(a.borrow_date) - new Date(b.borrow_date),
        },
        {
            title: 'Days Remaining',
            key: 'days_remaining',
            render: (_, record) => {
                const days = calculateDaysRemaining(record.borrow_date);
                return getDaysRemainingTag(days);
            },
            sorter: (a, b) => {
                const daysA = calculateDaysRemaining(a.borrow_date);
                const daysB = calculateDaysRemaining(b.borrow_date);
                if (daysA === '—') return 1;
                if (daysB === '—') return -1;
                return daysA - daysB;
            },
        },

    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2>
                    <BookOutlined style={{ marginRight: 8, color: '#228B22' }} />
                    Borrowed Books
                </h2>
            </div>

            <Card className="table-container">
                <Table
                    columns={columns}
                    dataSource={books}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingBook ? 'Edit Book Record' : 'Add Borrowed Book'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Student Name"
                        rules={[{ required: true, message: 'Please input student name!' }]}
                    >
                        <Input placeholder="e.g., Rajesh Kumar" />
                    </Form.Item>

                    <Form.Item
                        name="branch"
                        label="Branch"
                        rules={[{ required: true, message: 'Please input branch!' }]}
                    >
                        <Input placeholder="e.g., Computer Science" />
                    </Form.Item>

                    <Form.Item
                        name="semester"
                        label="Semester"
                        rules={[{ required: true, message: 'Please input semester!' }]}
                    >
                        <Input placeholder="e.g., 5" />
                    </Form.Item>

                    <Form.Item
                        name="book_code"
                        label="Book Code (6 digits)"
                        rules={[
                            { required: true, message: 'Please input book code!' },
                            { pattern: /^\d{6}$/, message: 'Book code must be exactly 6 digits!' }
                        ]}
                    >
                        <Input placeholder="e.g., 123456" maxLength={6} />
                    </Form.Item>

                    <Form.Item
                        name="borrow_date"
                        label="Date of Borrowing"
                        rules={[{ required: true, message: 'Please select borrowing date!' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {editingBook ? 'Update' : 'Add Book'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BorrowedBooks;
