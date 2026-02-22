/**
 * Prediction Controller
 * Handles classification, detection, and count predictions
 * Currently returning static data as models are not yet implemented
 */

const Upload = require('../models/upload.model');

/**
 * Predict image based on selected options
 * @route POST /api/predict
 */
const predictImage = async (req, res) => {
    try {
        const { image, options, classificationModel, fileName, fileSize, mimeType } = req.body;
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

        // Static response data (will be replaced with actual model predictions)
        const response = {};

        // Classification result
        if (options.classification) {
            const cellTypes = ['Lymphocyte', 'Monocyte', 'Neutrophil', 'Eosinophil', 'Basophil'];
            const randomCellType = cellTypes[Math.floor(Math.random() * cellTypes.length)];
            const randomConfidence = (85 + Math.random() * 13).toFixed(1); // 85-98%

            response.classification = {
                cellType: randomCellType,
                confidence: parseFloat(randomConfidence),
                model: classificationModel || 'MobileNet'
            };
        }

        // Detection result (returning a static annotated image - in practice, this would be the model output)
        if (options.detection) {
            // For now, return the original image as detection result
            // In production, this would be the image with bounding boxes drawn
            response.detection = {
                image: image, // In reality, this would be the annotated image
                detectedCount: Math.floor(Math.random() * 8) + 3, // Random 3-10 cells
                boundingBoxes: [
                    // Example bounding box format (will be used by actual model)
                    { x: 120, y: 150, width: 80, height: 80, confidence: 0.95, class: 'WBC' },
                    { x: 300, y: 200, width: 75, height: 75, confidence: 0.92, class: 'RBC' }
                ]
            };
        }

        // Count result
        if (options.count) {
            const wbcCount = Math.floor(Math.random() * 15) + 5; // Random 5-20
            const rbcCount = Math.floor(Math.random() * 50) + 100; // Random 100-150

            response.count = {
                image: image, // In reality, this would be the annotated image with counts
                wbc: wbcCount,
                rbc: rbcCount,
                total: wbcCount + rbcCount
            };
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
                        confidence: response.classification.confidence,
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
        const models = {
            classification: [
                { name: 'ResNet', status: 'active', accuracy: '94.2%' },
                { name: 'DenseNet', status: 'active', accuracy: '93.8%' },
                { name: 'MobileNet', status: 'active', accuracy: '95.1%', recommended: true },
                { name: 'ViT', status: 'active', accuracy: '92.7%' }
            ],
            detection: { name: 'YOLO v8', status: 'active', mAP: '89.5%' },
            count: { name: 'Cell Counter', status: 'active', accuracy: '96.3%' }
        };

        return res.status(200).json({
            success: true,
            data: models
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
