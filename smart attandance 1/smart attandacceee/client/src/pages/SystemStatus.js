import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag } from 'antd';
import { systemAPI } from '../services/api';

const SystemStatus = () => {
    const [systemInfo, setSystemInfo] = useState(null);

    useEffect(() => {
        fetchSystemInfo();
        const interval = setInterval(fetchSystemInfo, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchSystemInfo = async () => {
        try {
            const response = await systemAPI.getInfo();
            if (response.data.success) {
                setSystemInfo(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch system info');
        }
    };

    const formatUptime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>System Status</h2>

            <Card title="Server Information" className="system-info-card">
                {systemInfo && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Server IP">
                            <code>{systemInfo.serverIP}</code>
                        </Descriptions.Item>
                        <Descriptions.Item label="Server Port">
                            <code>{systemInfo.serverPort}</code>
                        </Descriptions.Item>
                        <Descriptions.Item label="API Endpoint">
                            <code>{systemInfo.apiEndpoint}</code>
                        </Descriptions.Item>
                        <Descriptions.Item label="Server Uptime">
                            {formatUptime(systemInfo.uptime)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color="green">Online</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Updated">
                            {new Date(systemInfo.timestamp).toLocaleString()}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Card>

            <Card title="Hardware Integration Guide" className="hardware-guide">
                <h3>ESP32 Configuration</h3>
                <p>Configure your ESP32 to send HTTP POST requests to:</p>
                <pre>
                    <code>{systemInfo?.apiEndpoint || 'http://YOUR_SERVER_IP:5000/api/attendance'}</code>
                </pre>

                <h3>Request Format</h3>
                <p>The ESP32 should send a JSON payload with the fingerprint ID:</p>
                <pre>{`{
  "finger_id": 12,
  "scanner_ip": "192.168.1.50"
}`}</pre>

                <h3>Response Format</h3>
                <p><strong>On Login (first scan):</strong></p>
                <pre>{`{
  "status": "login",
  "student": {
    "name": "Student Name",
    "usn": "1XX21EC001"
  },
  "login_time": "2024-01-15T10:30:00.000Z",
  "logout_time": null
}`}</pre>

                <p><strong>On Logout (second scan):</strong></p>
                <pre>{`{
  "status": "logout",
  "student": {
    "name": "Student Name",
    "usn": "1XX21EC001"
  },
  "login_time": "2024-01-15T10:30:00.000Z",
  "logout_time": "2024-01-15T14:30:00.000Z"
}`}</pre>

                <h3>20x4 LCD Display Format</h3>
                <p><strong>On successful login scan:</strong></p>
                <pre>{`Line 1: LIBRARY ENTRY
Line 2: Name: Student Name
Line 3: USN: 1XX21EC001
Line 4: IN: 10:30`}</pre>

                <p><strong>On successful logout scan:</strong></p>
                <pre>{`Line 1: LIBRARY EXIT
Line 2: Name: Student Name
Line 3: USN: 1XX21EC001
Line 4: OUT: 14:30`}</pre>

                <h3>ESP32 Workflow</h3>
                <ol>
                    <li>R307S fingerprint sensor detects and matches fingerprint</li>
                    <li>ESP32 receives the template ID from R307S</li>
                    <li>ESP32 sends HTTP POST to server with finger_id</li>
                    <li>ESP32 receives JSON response from server</li>
                    <li>ESP32 parses response and displays on 20x4 LCD</li>
                </ol>
            </Card>
        </div>
    );
};

export default SystemStatus;
