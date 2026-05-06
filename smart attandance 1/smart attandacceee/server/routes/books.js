const express = require('express');
const router = express.Router();
const { query, run, get } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// GET /api/books - Get all borrowed books
router.get('/', requireAuth, async (req, res) => {
    try {
        const books = await query('SELECT * FROM borrowed_books ORDER BY borrow_date DESC');
        res.json({ success: true, data: books });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/books - Add new borrowed book
router.post('/', requireAuth, async (req, res) => {
    try {
        const { name, branch, semester, book_code, borrow_date } = req.body;

        // Validation
        if (!name || !branch || !semester || !book_code || !borrow_date) {
            return res.status(400).json({
                error: 'Name, Branch, Semester, Book Code, and Borrow Date are required'
            });
        }

        // Validate book code is 6 digits
        if (!/^\d{6}$/.test(book_code)) {
            return res.status(400).json({ error: 'Book code must be exactly 6 digits' });
        }

        // Insert book record
        const result = await run(
            `INSERT INTO borrowed_books (name, branch, semester, book_code, borrow_date) 
       VALUES (?, ?, ?, ?, ?)`,
            [name, branch, semester, book_code, borrow_date]
        );

        res.json({
            success: true,
            message: 'Book record added successfully',
            id: result.lastID
        });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/books/:id - Update borrowed book
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, branch, semester, book_code, borrow_date } = req.body;

        // Validation
        if (!name || !branch || !semester || !book_code || !borrow_date) {
            return res.status(400).json({
                error: 'Name, Branch, Semester, Book Code, and Borrow Date are required'
            });
        }

        // Validate book code is 6 digits
        if (!/^\d{6}$/.test(book_code)) {
            return res.status(400).json({ error: 'Book code must be exactly 6 digits' });
        }

        // Check if book exists
        const book = await get('SELECT * FROM borrowed_books WHERE id = ?', [id]);
        if (!book) {
            return res.status(404).json({ error: 'Book record not found' });
        }

        // Update book
        await run(
            `UPDATE borrowed_books 
       SET name = ?, branch = ?, semester = ?, book_code = ?, borrow_date = ? 
       WHERE id = ?`,
            [name, branch, semester, book_code, borrow_date, id]
        );

        res.json({
            success: true,
            message: 'Book record updated successfully'
        });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/books/:id - Delete (return) borrowed book
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await run('DELETE FROM borrowed_books WHERE id = ?', [id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Book record not found' });
        }

        res.json({
            success: true,
            message: 'Book returned successfully'
        });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
