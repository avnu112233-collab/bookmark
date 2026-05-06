const express = require('express');
const router = express.Router();
const { query, run, get } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// GET /api/students - Get all students
router.get('/', requireAuth, async (req, res) => {
    try {
        const students = await query('SELECT * FROM students ORDER BY created_at DESC');
        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/students/:finger_id - Get student by finger_id (for ESP32 debugging)
router.get('/:finger_id', async (req, res) => {
    try {
        const { finger_id } = req.params;
        const student = await get(
            'SELECT * FROM students WHERE finger_id = ?',
            [finger_id]
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({ success: true, data: student });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/students - Create new student
router.post('/', requireAuth, async (req, res) => {
    try {
        const { usn, name, finger_id, branch, semester } = req.body;

        // Validation
        if (!usn || !name || !finger_id) {
            return res.status(400).json({
                error: 'USN, Name, and Finger ID are required'
            });
        }

        // Check if USN or finger_id already exists
        const existingUSN = await get('SELECT * FROM students WHERE usn = ?', [usn]);
        if (existingUSN) {
            return res.status(400).json({ error: 'USN already exists' });
        }

        const existingFingerId = await get(
            'SELECT * FROM students WHERE finger_id = ?',
            [finger_id]
        );
        if (existingFingerId) {
            return res.status(400).json({ error: 'Finger ID already exists' });
        }

        // Insert student
        const result = await run(
            `INSERT INTO students (usn, name, finger_id, branch, semester) 
       VALUES (?, ?, ?, ?, ?)`,
            [usn, name, finger_id, branch || null, semester || null]
        );

        res.json({
            success: true,
            message: 'Student registered successfully',
            id: result.lastID
        });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/students/:id - Update student
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { usn, name, finger_id, branch, semester } = req.body;

        // Validation
        if (!usn || !name || !finger_id) {
            return res.status(400).json({
                error: 'USN, Name, and Finger ID are required'
            });
        }

        // Check if student exists
        const student = await get('SELECT * FROM students WHERE id = ?', [id]);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Check if USN or finger_id conflicts with other students
        const existingUSN = await get(
            'SELECT * FROM students WHERE usn = ? AND id != ?',
            [usn, id]
        );
        if (existingUSN) {
            return res.status(400).json({ error: 'USN already exists' });
        }

        const existingFingerId = await get(
            'SELECT * FROM students WHERE finger_id = ? AND id != ?',
            [finger_id, id]
        );
        if (existingFingerId) {
            return res.status(400).json({ error: 'Finger ID already exists' });
        }

        // Update student
        await run(
            `UPDATE students 
       SET usn = ?, name = ?, finger_id = ?, branch = ?, semester = ? 
       WHERE id = ?`,
            [usn, name, finger_id, branch || null, semester || null, id]
        );

        res.json({
            success: true,
            message: 'Student updated successfully'
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/students/:id - Delete student
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await run('DELETE FROM students WHERE id = ?', [id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
