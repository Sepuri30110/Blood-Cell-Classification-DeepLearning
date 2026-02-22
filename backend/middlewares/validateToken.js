const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
/**
 * Validate Token Function
 * Validates JWT token from localStorage and cookies
 */
const validateToken = async (req, res) => {
    try {
        const { token: localStorageToken } = req.body;
        const cookieToken = req.cookies.token;

        // Check if both tokens exist
        if (!localStorageToken || !cookieToken) {
            return res.status(401).json({
                success: false,
                message: 'Token not found in localStorage or cookies'
            });
        }

        // Check if tokens match
        if (localStorageToken !== cookieToken) {
            return res.status(401).json({
                success: false,
                message: 'Token mismatch between localStorage and cookies'
            });
        }

        // Verify token
        const decoded = jwt.verify(localStorageToken, JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Token is valid
        res.status(200).json({
            success: true,
            message: 'Token is valid',
            user: {
                id: user._id,
                username: user.uname,
                email: user.email
            }
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        console.error('Token Validation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    validateToken
}