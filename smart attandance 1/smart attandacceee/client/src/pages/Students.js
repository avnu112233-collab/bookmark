import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { studentsAPI } from '../services/api';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await studentsAPI.getAll();
            if (response.data.success) {
                setStudents(response.data.data);
            }
        } catch (error) {
            message.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingStudent(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingStudent(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await studentsAPI.delete(id);
            message.success('Student deleted successfully');
            fetchStudents();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to delete student');
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editingStudent) {
                await studentsAPI.update(editingStudent.id, values);
                message.success('Student updated successfully');
            } else {
                await studentsAPI.create(values);
                message.success('Student registered successfully');
            }
            setModalVisible(false);
            form.resetFields();
            fetchStudents();
        } catch (error) {
            message.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const columns = [
        {
            title: 'USN',
            dataIndex: 'usn',
            key: 'usn',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Finger ID',
            dataIndex: 'finger_id',
            key: 'finger_id',
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            render: (text) => text || '—',
        },
        {
            title: 'Semester',
            dataIndex: 'semester',
            key: 'semester',
            render: (text) => text || '—',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this student?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2>Students Management</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Register Student
                </Button>
            </div>

            <Card className="table-container">
                <Table
                    columns={columns}
                    dataSource={students}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingStudent ? 'Edit Student' : 'Register New Student'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="usn"
                        label="USN"
                        rules={[{ required: true, message: 'Please input USN!' }]}
                    >
                        <Input placeholder="e.g., 1XX21EC001" />
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please input name!' }]}
                    >
                        <Input placeholder="Student Name" />
                    </Form.Item>

                    <Form.Item
                        name="finger_id"
                        label="Finger ID"
                        rules={[
                            { required: true, message: 'Please input Finger ID!' },
                            { pattern: /^\d+$/, message: 'Finger ID must be a number!' }
                        ]}
                        help="Must match the ID stored in R307 sensor"
                    >
                        <Input type="number" placeholder="e.g., 1" />
                    </Form.Item>

                    <Form.Item
                        name="branch"
                        label="Branch"
                    >
                        <Input placeholder="e.g., Computer Science" />
                    </Form.Item>

                    <Form.Item
                        name="semester"
                        label="Semester"
                    >
                        <Input placeholder="e.g., 5" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {editingStudent ? 'Update' : 'Register'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Students;
