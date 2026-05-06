import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#228B22',
                    colorSuccess: '#2E7D32',
                    colorInfo: '#228B22',
                    borderRadius: 4,
                },
            }}
        >
            <App />
        </ConfigProvider>
    </React.StrictMode>
);
