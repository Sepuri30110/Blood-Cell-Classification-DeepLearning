const express = require('express');
const router = express.Router();
const {
    getHistory,
    getHistoryById,
    deleteHistoryItem,
    getHistoryStats
} = require('../controllers/historyController');
const { validateTokenMiddleware } = require('../middlewares/validateToken');

// All history routes require authentication
router.use(validateTokenMiddleware);

/**
 * @route   GET /api/history/stats
 * @desc    Get history statistics
 * @access  Private
 */
router.get('/stats', getHistoryStats);

/**
 * @route   GET /api/history
 * @desc    Get all prediction history for logged-in user
 * @access  Private
 */
router.get('/', getHistory);

/**
 * @route   GET /api/history/:id
 * @desc    Get single history item by ID
 * @access  Private
 */
router.get('/:id', getHistoryById);

/**
 * @route   DELETE /api/history/:id
 * @desc    Delete history item
 * @access  Private
 */
router.delete('/:id', deleteHistoryItem);

module.exports = router;
