const express = require('express');
const router = express.Router();
const { query, run, get } = require('../config/database');

// POST /api/attendance - Called by ESP32 on fingerprint scan
router.post('/', async (req, res) => {
    try {
        const { finger_id, scanner_ip } = req.body;

        if (!finger_id) {
            return res.status(400).json({
                status: 'error',
                message: 'finger_id is required'
            });
        }

        // Look up student by finger_id
        const student = await get(
            'SELECT * FROM students WHERE finger_id = ?',
            [finger_id]
        );

        if (!student) {
            return res.status(404).json({
                status: 'error',
                message: 'Unknown fingerprint'
            });
        }

        // Get current date
        const now = new Date();
        const sessionDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

        // Check for open session (logout_time IS NULL) for this student today
        const openSession = await get(
            `SELECT * FROM attendance_logs 
       WHERE student_id = ? AND logout_time IS NULL 
       ORDER BY login_time DESC LIMIT 1`,
            [student.id]
        );

        if (!openSession) {
            // No open session - CREATE LOGIN
            const loginTime = now.toISOString();

            const result = await run(
                `INSERT INTO attendance_logs 
         (student_id, usn, name, login_time, logout_time, session_date, mode) 
         VALUES (?, ?, ?, ?, NULL, ?, 'IN')`,
                [student.id, student.usn, student.name, loginTime, sessionDate]
            );

            return res.json({
                status: 'login',
                student: {
                    name: student.name,
                    usn: student.usn
                },
                login_time: loginTime,
                logout_time: null
            });
        } else {
            // Open session exists - UPDATE WITH LOGOUT
            const logoutTime = now.toISOString();

            await run(
                `UPDATE attendance_logs 
         SET logout_time = ?, mode = 'OUT' 
         WHERE id = ?`,
                [logoutTime, openSession.id]
            );

            return res.json({
                status: 'logout',
                student: {
                    name: student.name,
                    usn: student.usn
                },
                login_time: openSession.login_time,
                logout_time: logoutTime
            });
        }
    } catch (error) {
        console.error('Attendance API error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
});

// GET /api/attendance/today - Get today's attendance
router.get('/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const logs = await query(
            `SELECT a.*, s.branch, s.semester 
       FROM attendance_logs a
       LEFT JOIN students s ON a.student_id = s.id
       WHERE a.session_date = ? 
       ORDER BY a.login_time DESC`,
            [today]
        );

        res.json({ success: true, data: logs });
    } catch (error) {
        console.error('Error fetching today\'s attendance:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/attendance/logs - Get all attendance logs with filters
router.get('/logs', async (req, res) => {
    try {
        const { startDate, endDate, usn } = req.query;

        let sql = 'SELECT * FROM attendance_logs WHERE 1=1';
        const params = [];

        if (startDate) {
            sql += ' AND session_date >= ?';
            params.push(startDate);
        }

        if (endDate) {
            sql += ' AND session_date <= ?';
            params.push(endDate);
        }

        if (usn) {
            sql += ' AND usn LIKE ?';
            params.push(`%${usn}%`);
        }

        sql += ' ORDER BY login_time DESC';

        const logs = await query(sql, params);
        res.json({ success: true, data: logs });
    } catch (error) {
        console.error('Error fetching attendance logs:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/attendance/stats - Get statistics
router.get('/stats', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Total students
        const totalStudents = await get('SELECT COUNT(*) as count FROM students');

        // Visits today
        const visitsToday = await get(
            'SELECT COUNT(*) as count FROM attendance_logs WHERE session_date = ?',
            [today]
        );

        // Currently inside (open sessions)
        const currentlyInside = await get(
            'SELECT COUNT(*) as count FROM attendance_logs WHERE logout_time IS NULL'
        );

        res.json({
            success: true,
            data: {
                totalStudents: totalStudents.count,
                visitsToday: visitsToday.count,
                currentlyInside: currentlyInside.count
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
