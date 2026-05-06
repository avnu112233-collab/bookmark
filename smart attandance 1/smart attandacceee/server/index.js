const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();

const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const studentsRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const booksRoutes = require('./routes/books');
const fingerprintRoutes = require('./routes/fingerprint');

const app = express();
const PORT = process.env.SERVER_PORT || 5000;
const HOST = process.env.SERVER_IP || '0.0.0.0';

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/fingerprint', fingerprintRoutes);

// System info endpoint
app.get('/api/system/info', (req, res) => {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    const addresses = [];

    for (const name of Object.keys(networkInterfaces)) {
        for (const net of networkInterfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (net.family === 'IPv4' && !net.internal) {
                addresses.push(net.address);
            }
        }
    }

    res.json({
        success: true,
        data: {
            serverIP: addresses[0] || 'localhost',
            serverPort: PORT,
            apiEndpoint: `http://${addresses[0] || 'localhost'}:${PORT}/api/attendance`,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database and start server
initDatabase()
    .then(() => {
        app.listen(PORT, HOST, () => {
            console.log('\n╔════════════════════════════════════════════════════════╗');
            console.log('║  Library Smart Biometric Attendance System            ║');
            console.log('╚════════════════════════════════════════════════════════╝\n');
            console.log(`✓ Server running on http://${HOST}:${PORT}`);
            console.log(`✓ API endpoint: http://${HOST}:${PORT}/api`);
            console.log(`✓ Database initialized successfully\n`);
            console.log('Available endpoints:');
            console.log('  - POST /api/attendance (ESP32)');
            console.log('  - GET  /api/attendance/today');
            console.log('  - GET  /api/attendance/logs');
            console.log('  - GET  /api/students');
            console.log('  - GET  /api/books');
            console.log('  - POST /api/auth/login');
            console.log('  - GET  /api/system/info\n');
        });
    })
    .catch((err) => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });

module.exports = app;
