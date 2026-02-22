const fs = require('fs');
const path = require('path');

// Load models data from JSON file
const loadModelsData = () => {
    try {
        const modelsPath = path.join(__dirname, '../data/models.json');
        const rawData = fs.readFileSync(modelsPath, 'utf-8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error loading models data:', error);
        throw new Error('Failed to load models data');
    }
};

/**
 * Get all models
 * @route GET /api/models
 */
const getAllModels = async (req, res) => {
    try {
        const modelsData = loadModelsData();
        
        return res.status(200).json({
            success: true,
            message: 'Models retrieved successfully',
            data: modelsData.models
        });
    } catch (error) {
        console.error('Get all models error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch models data',
            error: error.message
        });
    }
};

/**
 * Get specific model by ID
 * @route GET /api/models/:id
 */
const getModelById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const modelsData = loadModelsData();
        const model = modelsData.models.find(m => m.id === id);
        
        if (!model) {
            return res.status(404).json({
                success: false,
                message: 'Model not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Model retrieved successfully',
            data: model
        });
    } catch (error) {
        console.error('Get model by ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch model data',
            error: error.message
        });
    }
};

module.exports = {
    getAllModels,
    getModelById
};
