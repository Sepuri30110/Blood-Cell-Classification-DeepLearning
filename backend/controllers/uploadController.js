const Upload = require('../models/upload.model');
const mongoose = require('mongoose');

/**
 * Create a new upload/prediction record
 */
const createUpload = async (req, res) => {
    try {
        const { 
            imageData, 
            imagePath, 
            imageOriginalName, 
            imageSize, 
            imageMimeType,
            prediction, 
            processingTime, 
            metadata 
        } = req.body;
        const userId = req.userId; // From auth middleware

        // Validation
        if (!imageData || !imageOriginalName || !prediction) {
            return res.status(400).json({
                success: false,
                message: 'Image data, name, and prediction are required'
            });
        }

        if (!prediction.cellType || prediction.confidence === undefined || !prediction.modelUsed) {
            return res.status(400).json({
                success: false,
                message: 'Prediction must include cellType, confidence, and modelUsed'
            });
        }

        // Validate base64 image if provided
        if (imageData && !imageData.startsWith('data:image/') && !imagePath) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image data format'
            });
        }

        // Create new upload record
        const newUpload = new Upload({
            userId,
            imageData,
            imagePath: imagePath || null,
            imageOriginalName,
            imageSize,
            imageMimeType,
            prediction: {
                cellType: prediction.cellType,
                confidence: prediction.confidence,
                modelUsed: prediction.modelUsed
            },
            processingTime,
            metadata,
            status: 'completed'
        });

        await newUpload.save();

        res.status(201).json({
            success: true,
            message: 'Upload record created successfully',
            data: {
                id: newUpload._id,
                userId: newUpload.userId,
                imageOriginalName: newUpload.imageOriginalName,
                prediction: newUpload.prediction,
                createdAt: newUpload.createdAt
            }
        });

    } catch (error) {
        console.error('Create Upload Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all uploads for a user
 */
const getUserUploads = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        const { 
            page = 1, 
            limit = 10, 
            sortBy = 'createdAt', 
            order = 'desc',
            includeImage = 'false' 
        } = req.query;

        const skip = (page - 1) * limit;
        const sortOrder = order === 'desc' ? -1 : 1;

        // Exclude imageData by default to reduce payload size
        const projection = includeImage === 'true' ? {} : { imageData: 0 };

        const uploads = await Upload.find({ userId }, projection)
            .sort({ [sortBy]: sortOrder })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        const total = await Upload.countDocuments({ userId });

        res.status(200).json({
            success: true,
            data: uploads,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get User Uploads Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get a single upload by ID
 */
const getUploadById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const upload = await Upload.findOne({ _id: id, userId });

        if (!upload) {
            return res.status(404).json({
                success: false,
                message: 'Upload not found'
            });
        }

        res.status(200).json({
            success: true,
            data: upload
        });

    } catch (error) {
        console.error('Get Upload By ID Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Delete an upload
 */
const deleteUpload = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const upload = await Upload.findOneAndDelete({ _id: id, userId });

        if (!upload) {
            return res.status(404).json({
                success: false,
                message: 'Upload not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Upload deleted successfully'
        });

    } catch (error) {
        console.error('Delete Upload Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get upload statistics for a user
 */
const getUploadStats = async (req, res) => {
    try {
        const userId = req.userId;

        // Total uploads
        const totalUploads = await Upload.countDocuments({ userId });

        // Uploads today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const uploadsToday = await Upload.countDocuments({
            userId,
            createdAt: { $gte: today }
        });

        // Most used model
        const modelStats = await Upload.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: '$prediction.modelUsed', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        const mostUsedModel = modelStats.length > 0 ? modelStats[0]._id : '-';

        // Detected cell types
        const cellTypeStats = await Upload.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: '$prediction.cellType', count: { $sum: 1 } } }
        ]);
        const uniqueCellTypes = cellTypeStats.length;

        // Cell type distribution
        const distribution = cellTypeStats.map(item => ({
            name: item._id,
            value: item.count
        }));

        res.status(200).json({
            success: true,
            data: {
                totalUploads,
                uploadsToday,
                mostUsedModel,
                uniqueCellTypes,
                distribution
            }
        });

    } catch (error) {
        console.error('Get Upload Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get image data for a specific upload
 */
const getUploadImage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const upload = await Upload.findOne({ _id: id, userId })
            .select('imageData imageMimeType imageOriginalName')
            .lean();

        if (!upload) {
            return res.status(404).json({
                success: false,
                message: 'Upload not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                imageData: upload.imageData,
                imageMimeType: upload.imageMimeType,
                imageOriginalName: upload.imageOriginalName
            }
        });

    } catch (error) {
        console.error('Get Upload Image Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    createUpload,
    getUserUploads,
    getUploadById,
    deleteUpload,
    getUploadStats,
    getUploadImage
};
