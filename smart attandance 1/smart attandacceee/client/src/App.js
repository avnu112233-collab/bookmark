import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown } from 'antd';
import {
    DashboardOutlined,
    BookOutlined,
    PlusCircleOutlined,
    FileTextOutlined,
    SettingOutlined,
    BgColorsOutlined,
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import BorrowedBooks from './pages/BorrowedBooks';
import NewBorrowing from './pages/NewBorrowing';
import AttendanceLogs from './pages/AttendanceLogs';
import SystemStatus from './pages/SystemStatus';
import './index.css';

const { Header, Content, Sider } = Layout;

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

function AppContent() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState('dashboard');

    const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'system');

    useEffect(() => {
        // Update current page based on URL
        const path = location.pathname.substring(1) || 'dashboard';
        setCurrentPage(path);
    }, [location]);

    useEffect(() => {
        const applyTheme = (targetTheme) => {
            const root = document.documentElement;
            const isDark = targetTheme === 'dark' ||
                (targetTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

            if (isDark) {
                root.classList.add('dark-theme');
            } else {
                root.classList.remove('dark-theme');
            }
            localStorage.setItem('app-theme', targetTheme);
        };

        applyTheme(theme);

        // Listener for system theme changes
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme('system');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const themeItems = [
        {
            key: 'light',
            label: 'Light Theme',
            onClick: () => setTheme('light'),
        },
        {
            key: 'dark',
            label: 'Dark Theme',
            onClick: () => setTheme('dark'),
        },
        {
            key: 'system',
            label: 'System Default',
            onClick: () => setTheme('system'),
        },
    ];

    const handleMenuClick = ({ key }) => {
        setCurrentPage(key);
        navigate(`/${key}`);
    };

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: 'new-borrowing',
            icon: <PlusCircleOutlined />,
            label: 'Shelf',
        },
        {
            key: 'books',
            icon: <BookOutlined />,
            label: 'Borrowed Books',
        },
        {
            key: 'attendance',
            icon: <FileTextOutlined />,
            label: 'Attendance Logs',
        },
        {
            key: 'system',
            icon: <SettingOutlined />,
            label: 'System Status',
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                width={280}
                breakpoint="lg"
                style={{
                    background: '#1b463e',
                }}
            >
                <div style={{
                    height: 80, // Increased to match Header
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28, // Increased to match Header
                    fontWeight: 600,
                    color: '#DAF1DE',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                    BookMark
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[currentPage]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{
                        borderRight: 0,
                        background: 'transparent',
                        color: 'white'
                    }}
                />
            </Sider>
            <Layout>
                <Header style={{
                    padding: '0 32px',
                    background: '#1b463e',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    height: 80, // Increased height
                    color: '#DAF1DE',
                }}>
                    <div style={{ fontSize: 28, fontWeight: 600 }}> {/* Increased font size */}
                        Library Smart Biometric Attendance
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <Dropdown menu={{ items: themeItems }} placement="bottomRight">
                            <Button
                                type="text"
                                icon={<BgColorsOutlined style={{ fontSize: 24, color: '#DAF1DE' }} />} // Increased icon size
                                style={{ height: 48, width: 48 }}
                            />
                        </Dropdown>
                    </div>
                </Header>
                <Content style={{ margin: '32px 32px 32px 40px', minHeight: 280 }}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/books" element={<BorrowedBooks />} />
                        <Route path="/new-borrowing" element={<NewBorrowing />} />
                        <Route path="/attendance" element={<AttendanceLogs />} />
                        <Route path="/system" element={<SystemStatus />} />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
}

export default App;
