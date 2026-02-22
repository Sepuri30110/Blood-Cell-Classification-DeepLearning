const mongoose = require('mongoose');

const uploadModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageData: {
        type: String, // Base64 encoded image data (e.g., data:image/png;base64,...)
        required: true
    },
    imagePath: {
        type: String,
        required: false
    },
    imageOriginalName: {
        type: String,
        required: true
    },
    imageSize: {
        type: Number,
        required: false
    },
    imageMimeType: {
        type: String,
        required: false
    },
    prediction: {
        cellType: {
            type: String,
            required: true
        },
        confidence: {
            type: Number,
            required: true
        },
        modelUsed: {
            type: String,
            required: true,
            default: 'DefaultModel'
        }
    },
    processingTime: {
        type: Number, // in milliseconds
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    metadata: {
        imageWidth: Number,
        imageHeight: Number,
        fileFormat: String
    }
}, { timestamps: true });

// Index for faster queries
uploadModel.index({ userId: 1, createdAt: -1 });
uploadModel.index({ 'prediction.cellType': 1 });

module.exports = mongoose.model('Upload', uploadModel);
