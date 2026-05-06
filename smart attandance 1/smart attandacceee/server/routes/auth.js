const express = require('express');
const router = express.Router();
const { login, logout, checkAuth } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/check
router.get('/check', checkAuth);

module.exports = router;
