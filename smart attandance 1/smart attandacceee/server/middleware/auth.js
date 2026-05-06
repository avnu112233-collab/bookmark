require('dotenv').config();

// Simple session-based authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
};

// Admin login handler
const login = (req, res) => {
    const { username, password } = req.body;

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUsername && password === adminPassword) {
        req.session.isAuthenticated = true;
        req.session.username = username;
        return res.json({
            success: true,
            message: 'Login successful',
            user: { username }
        });
    }

    return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
    });
};

// Logout handler
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
};

// Check auth status
const checkAuth = (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        return res.json({
            authenticated: true,
            user: { username: req.session.username }
        });
    }
    return res.json({ authenticated: false });
};

module.exports = {
    requireAuth,
    login,
    logout,
    checkAuth
};
