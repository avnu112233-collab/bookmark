const express = require('express');
const router = express.Router();

// Store for pending fingerprint scans
let pendingScan = {
    fingerId: null,
    timestamp: null,
    sessionId: null
};

// POST /api/fingerprint/scan - Called by ESP32 when fingerprint is scanned
router.post('/scan', async (req, res) => {
    try {
        const { finger_id } = req.body;

        if (!finger_id) {
            return res.status(400).json({
                success: false,
                message: 'finger_id is required'
            });
        }

        // Store the scanned finger ID
        pendingScan = {
            fingerId: finger_id,
            timestamp: new Date().toISOString(),
            sessionId: Date.now().toString()
        };

        console.log(`📍 Fingerprint scanned: ID ${finger_id}`);

        res.json({
            success: true,
            message: 'Fingerprint received',
            finger_id: finger_id
        });
    } catch (error) {
        console.error('Error processing fingerprint scan:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// GET /api/fingerprint/pending - Called by frontend to check for scanned fingerprint
router.get('/pending', (req, res) => {
    try {
        if (pendingScan.fingerId) {
            const scan = { ...pendingScan };

            // Clear the pending scan after 10 seconds to prevent reuse
            const scanAge = Date.now() - new Date(pendingScan.timestamp).getTime();
            if (scanAge > 10000) {
                pendingScan = { fingerId: null, timestamp: null, sessionId: null };
                return res.json({
                    success: false,
                    message: 'No recent scan available'
                });
            }

            // Return the scan and clear it
            pendingScan = { fingerId: null, timestamp: null, sessionId: null };

            res.json({
                success: true,
                data: {
                    finger_id: scan.fingerId,
                    timestamp: scan.timestamp
                }
            });
        } else {
            res.json({
                success: false,
                message: 'No scan available'
            });
        }
    } catch (error) {
        console.error('Error fetching pending scan:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// GET /api/fingerprint/status - Check if system is ready for scanning
router.get('/status', (req, res) => {
    res.json({
        success: true,
        ready: true,
        message: 'System ready for fingerprint scanning'
    });
});

module.exports = router;
