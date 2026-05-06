import React, { useState, useEffect } from 'react';
import { Table, DatePicker, Input, Button, Card, message, Dropdown, Menu, Space } from 'antd';
import {
    SearchOutlined,
    DownloadOutlined,
    DownOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { attendanceAPI } from '../services/api';

const { RangePicker } = DatePicker;

const AttendanceLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        usn: '',
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            if (filters.usn) params.usn = filters.usn;

            const response = await attendanceAPI.getLogs(params);
            if (response.data.success) {
                setLogs(response.data.data);
            }
        } catch (error) {
            message.error('Failed to fetch attendance logs');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (dates) => {
        if (dates) {
            setFilters({
                ...filters,
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD'),
            });
        } else {
            setFilters({
                ...filters,
                startDate: null,
                endDate: null,
            });
        }
    };

    const handleUSNChange = (e) => {
        setFilters({
            ...filters,
            usn: e.target.value,
        });
    };

    const calculateDuration = (login, logout) => {
        if (!logout) return '—';
        const loginTime = new Date(login);
        const logoutTime = new Date(logout);
        const diff = logoutTime - loginTime;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    const handleExport = (type) => {
        if (logs.length === 0) {
            message.warning('No data to export');
            return;
        }

        switch (type) {
            case 'csv':
                exportToCSV();
                break;
            case 'excel':
                message.info('Export to Excel feature coming soon');
                break;
            case 'pdf':
                message.info('Export to PDF feature coming soon');
                break;
            case 'word':
                message.info('Export to Word feature coming soon');
                break;
            default:
                break;
        }
    };

    const exportToCSV = () => {
        const headers = ['USN', 'Name', 'Login Time', 'Logout Time', 'Duration', 'Date'];
        const rows = logs.map(log => [
            log.usn,
            log.name,
            new Date(log.login_time).toLocaleString(),
            log.logout_time ? new Date(log.logout_time).toLocaleString() : '—',
            calculateDuration(log.login_time, log.logout_time),
            log.session_date,
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        message.success('CSV exported successfully');
    };

    const exportMenu = (
        <Menu onClick={({ key }) => handleExport(key)}>
            <Menu.Item key="csv" icon={<FileTextOutlined />}>
                Export as CSV
            </Menu.Item>
            <Menu.Item key="excel" icon={<FileExcelOutlined />}>
                Export as Excel
            </Menu.Item>
            <Menu.Item key="pdf" icon={<FilePdfOutlined />}>
                Export as PDF
            </Menu.Item>
            <Menu.Item key="word" icon={<FileWordOutlined />}>
                Export as Word
            </Menu.Item>
        </Menu>
    );

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
            title: 'Login Time',
            dataIndex: 'login_time',
            key: 'login_time',
            render: (time) => new Date(time).toLocaleString(),
        },
        {
            title: 'Logout Time',
            dataIndex: 'logout_time',
            key: 'logout_time',
            render: (time) => time ? new Date(time).toLocaleString() : '—',
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (_, record) => calculateDuration(record.login_time, record.logout_time),
        },
        {
            title: 'Date',
            dataIndex: 'session_date',
            key: 'session_date',
        },
    ];

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>Attendance Logs</h2>

            <Card className="form-container">
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                    <RangePicker onChange={handleDateChange} />
                    <Input
                        placeholder="Search by USN"
                        prefix={<SearchOutlined />}
                        value={filters.usn}
                        onChange={handleUSNChange}
                        style={{ width: 200 }}
                    />
                    <Button type="primary" onClick={fetchLogs} style={{ backgroundColor: '#1b463e', borderColor: '#1b463e' }}>
                        Search
                    </Button>
                    <Dropdown overlay={exportMenu} trigger={['click']}>
                        <Button icon={<DownloadOutlined />}>
                            <Space>
                                Export Data
                                <DownOutlined />
                            </Space>
                        </Button>
                    </Dropdown>
                </div>
            </Card>

            <Card className="table-container">
                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 15 }}
                />
            </Card>
        </div>
    );
};

export default AttendanceLogs;
