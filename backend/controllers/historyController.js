const Upload = require('../models/upload.model');

/**
 * Get prediction history for a user
 * @route GET /api/history
 */
const getHistory = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        const { 
            page = 1, 
            limit = 50, 
            sortBy = 'createdAt', 
            order = 'desc'
        } = req.query;

        const skip = (page - 1) * limit;
        const sortOrder = order === 'desc' ? -1 : 1;

        // Exclude imageData to reduce payload size for history view
        const projection = { imageData: 0 };

        const history = await Upload.find({ userId }, projection)
            .sort({ [sortBy]: sortOrder })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        const total = await Upload.countDocuments({ userId });

        res.status(200).json({
            success: true,
            data: history,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get History Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch prediction history',
            error: error.message
        });
    }
};

/**
 * Get detailed history item by ID
 * @route GET /api/history/:id
 */
const getHistoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const historyItem = await Upload.findOne({ 
            _id: id, 
            userId 
        }).lean();

        if (!historyItem) {
            return res.status(404).json({
                success: false,
                message: 'History item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: historyItem
        });

    } catch (error) {
        console.error('Get History Item Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch history item',
            error: error.message
        });
    }
};

/**
 * Delete history item
 * @route DELETE /api/history/:id
 */
const deleteHistoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const deletedItem = await Upload.findOneAndDelete({ 
            _id: id, 
            userId 
        });

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: 'History item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'History item deleted successfully'
        });

    } catch (error) {
        console.error('Delete History Item Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete history item',
            error: error.message
        });
    }
};

/**
 * Get history statistics
 * @route GET /api/history/stats
 */
const getHistoryStats = async (req, res) => {
    try {
        const userId = req.userId;

        // Get total count
        const totalPredictions = await Upload.countDocuments({ userId });

        // Get predictions by cell type
        const cellTypeStats = await Upload.aggregate([
            { $match: { userId: userId } },
            { 
                $group: { 
                    _id: '$prediction.cellType',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get predictions by model
        const modelStats = await Upload.aggregate([
            { $match: { userId: userId } },
            { 
                $group: { 
                    _id: '$prediction.modelUsed',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentCount = await Upload.countDocuments({ 
            userId, 
            createdAt: { $gte: sevenDaysAgo } 
        });

        res.status(200).json({
            success: true,
            data: {
                totalPredictions,
                recentPredictions: recentCount,
                cellTypeDistribution: cellTypeStats.map(item => ({
                    cellType: item._id,
                    count: item.count
                })),
                modelUsage: modelStats.map(item => ({
                    model: item._id,
                    count: item.count
                }))
            }
        });

    } catch (error) {
        console.error('Get History Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch history statistics',
            error: error.message
        });
    }
};

module.exports = {
    getHistory,
    getHistoryById,
    deleteHistoryItem,
    getHistoryStats
};
