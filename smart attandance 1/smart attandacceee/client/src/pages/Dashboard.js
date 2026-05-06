import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, message } from 'antd';
import { LoginOutlined, TeamOutlined } from '@ant-design/icons';
import { attendanceAPI } from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        visitsToday: 0,
        currentlyInside: 0,
    });
    const [todayLogs, setTodayLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, logsRes] = await Promise.all([
                attendanceAPI.getStats(),
                attendanceAPI.getToday(),
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }

            if (logsRes.data.success) {
                setTodayLogs(logsRes.data.data);
            }
        } catch (error) {
            message.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
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
            title: 'Sem & Branch',
            key: 'sem_branch',
            render: (_, record) => {
                if (record.semester && record.branch) {
                    return `${record.semester}-${record.branch}`;
                }
                return '—';
            },
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
    ];

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>Dashboard</h2>

            <Row gutter={[16, 16]} className="dashboard-stats">
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Visits Today"
                            value={stats.visitsToday}
                            prefix={<LoginOutlined style={{ color: '#1b463e' }} />}
                            valueStyle={{ color: '#333333', fontSize: '48px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Currently Inside"
                            value={stats.currentlyInside}
                            prefix={<TeamOutlined style={{ color: '#1b463e' }} />}
                            valueStyle={{ color: '#333333', fontSize: '48px', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Recent Attendance" className="table-container">
                <Table
                    columns={columns}
                    dataSource={todayLogs}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default Dashboard;
