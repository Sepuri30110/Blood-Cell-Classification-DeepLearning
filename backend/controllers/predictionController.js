/**
 * Prediction Controller
 * Handles classification, detection, and count predictions
 * Connects to DL FastAPI server for actual predictions
 */

const Upload = require('../models/upload.model');
const axios = require('axios');
const FormData = require('form-data');

// DL API configuration
const DL_API_URL = process.env.DL_API_URL || 'http://localhost:8000';

// Model name mapping: Frontend -> DL API
const MODEL_MAPPING = {
    'ResNet': 'resnet-50',
    'DenseNet': 'densenet-121',
    'MobileNet': 'mobilenet-v2',
    'EfficientNet': 'efficientnet-b0',
    'CNN': 'cnn',
    'ViT': 'vit-base'
};

/**
 * Convert base64 to buffer for FormData
 */
function base64ToBuffer(base64String) {
    // Remove data:image/xxx;base64, prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
}

/**
 * Predict image based on selected options
 * @route POST /api/predict
 */
const predictImage = async (req, res) => {
    try {
        const { image, options, classificationModel, fileName, fileSize, mimeType, showLabels = true } = req.body;
        const userId = req.userId; // From auth middleware
        const startTime = Date.now();

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            });
        }

        if (!options || (!options.classification && !options.detection && !options.count)) {
            return res.status(400).json({
                success: false,
                message: "At least one analysis option must be selected"
            });
        }

        const response = {};
        const imageBuffer = base64ToBuffer(image);

        try {
            // Classification
            if (options.classification) {
                const modelId = MODEL_MAPPING[classificationModel] || 'mobilenet-v2';
                
                const formData = new FormData();
                formData.append('image', imageBuffer, { filename: 'image.jpg' });
                formData.append('model_id', modelId);

                const classificationResponse = await axios.post(
                    `${DL_API_URL}/predict/classification`,
                    formData,
                    { headers: formData.getHeaders() }
                );

                if (classificationResponse.data.success) {
                    const result = classificationResponse.data.result;
                    response.classification = {
                        cellType: result.predicted_class,
                        confidence: (result.confidence * 100).toFixed(1),
                        model: classificationModel || 'MobileNet',
                        probabilities: result.probabilities
                    };
                } else {
                    throw new Error('Classification failed');
                }
            }

            // Detection
            if (options.detection) {
                const formData = new FormData();
                formData.append('image', imageBuffer, { filename: 'image.jpg' });
                formData.append('conf', '0.25');
                formData.append('show_labels', showLabels ? 'true' : 'false');

                const detectionResponse = await axios.post(
                    `${DL_API_URL}/predict/detection`,
                    formData,
                    { headers: formData.getHeaders() }
                );

                if (detectionResponse.data.success) {
                    const result = detectionResponse.data.result;
                    // Convert base64 back to data URL for frontend
                    response.detection = {
                        image: `data:image/jpeg;base64,${result.annotated_image}`,
                        detectedCount: result.count,
                        detections: result.detections
                    };
                } else {
                    throw new Error('Detection failed');
                }
            }

            // Count
            if (options.count) {
                const formData = new FormData();
                formData.append('image', imageBuffer, { filename: 'image.jpg' });
                formData.append('conf', '0.25');
                formData.append('show_labels', showLabels ? 'true' : 'false');

                const countResponse = await axios.post(
                    `${DL_API_URL}/predict/count`,
                    formData,
                    { headers: formData.getHeaders() }
                );

                if (countResponse.data.success) {
                    const result = countResponse.data.result;
                    // Convert base64 back to data URL for frontend
                    response.count = {
                        image: `data:image/jpeg;base64,${result.annotated_image}`,
                        wbc: result.counts.WBC,
                        rbc: result.counts.RBC,
                        total: result.total_cells,
                        detections: result.detections
                    };
                } else {
                    throw new Error('Cell counting failed');
                }
            }

        } catch (dlError) {
            console.error("DL API error:", dlError.message);
            // If DL API is not available, return error
            return res.status(503).json({
                success: false,
                message: "Deep Learning service is unavailable. Please ensure the DL server is running.",
                error: dlError.response?.data?.detail || dlError.message
            });
        }

        // Save to database if classification was performed
        let savedRecord = null;
        if (options.classification && response.classification) {
            const processingTime = Date.now() - startTime;
            
            try {
                const newUpload = new Upload({
                    userId,
                    imageData: image,
                    imageOriginalName: fileName || 'uploaded-image.jpg',
                    imageSize: fileSize,
                    imageMimeType: mimeType,
                    prediction: {
                        cellType: response.classification.cellType,
                        confidence: parseFloat(response.classification.confidence),
                        modelUsed: response.classification.model
                    },
                    processingTime,
                    status: 'completed'
                });

                savedRecord = await newUpload.save();
            } catch (dbError) {
                console.error("Database save error:", dbError);
                // Continue without failing the request
            }
        }

        return res.status(200).json({
            success: true,
            message: "Prediction completed successfully",
            data: response,
            recordId: savedRecord ? savedRecord._id : null
        });

    } catch (error) {
        console.error("Prediction error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process prediction",
            error: error.message
        });
    }
};

/**
 * Get available models
 * @route GET /api/predict/models
 */
const getAvailableModels = async (req, res) => {
    try {
        // Try to get models from DL API
        try {
            const dlModelsResponse = await axios.get(`${DL_API_URL}/models`);
            
            if (dlModelsResponse.data.success) {
                const dlModels = dlModelsResponse.data.models;
                
                // Map DL model IDs back to frontend names
                const reverseMapping = {
                    'resnet-50': 'ResNet',
                    'densenet-121': 'DenseNet',
                    'mobilenet-v2': 'MobileNet',
                    'vit-base': 'ViT'
                };
                
                const classificationModels = dlModels.classification.map(modelId => {
                    const name = reverseMapping[modelId] || modelId;
                    return {
                        name,
                        status: 'active',
                        recommended: modelId === 'mobilenet-v2'
                    };
                });
                
                return res.status(200).json({
                    success: true,
                    data: {
                        classification: classificationModels,
                        detection: dlModels.detection ? { name: 'YOLO v8', status: 'active' } : null,
                        count: dlModels.count ? { name: 'Cell Counter v2', status: 'active' } : null
                    }
                });
            }
        } catch (dlError) {
            console.warn("DL API unavailable, returning fallback models:", dlError.message);
        }
        
        // Fallback to static models if DL API is unavailable
        const models = {
            classification: [
                { name: 'ResNet', status: 'inactive' },
                { name: 'DenseNet', status: 'inactive' },
                { name: 'MobileNet', status: 'inactive', recommended: true },
                { name: 'ViT', status: 'inactive' }
            ],
            detection: { name: 'YOLO v8', status: 'inactive' },
            count: { name: 'Cell Counter v2', status: 'inactive' }
        };

        return res.status(200).json({
            success: true,
            data: models,
            warning: "DL service is unavailable. Models are not loaded."
        });
    } catch (error) {
        console.error("Get models error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch models",
            error: error.message
        });
    }
};

module.exports = {
    predictImage,
    getAvailableModels
};
