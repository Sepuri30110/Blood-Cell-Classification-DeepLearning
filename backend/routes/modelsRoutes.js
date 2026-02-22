const express = require("express");
const router = express.Router();
const { 
    getAllModels, 
    getModelById
} = require("../controllers/modelsController");
const { validateTokenMiddleware } = require("../middlewares/validateToken");

// All model routes require authentication
router.use(validateTokenMiddleware);

/**
 * @route   GET /api/models/:id
 * @desc    Get specific model by ID
 * @access  Private
 */
router.get("/:id", getModelById);

/**
 * @route   GET /api/models
 * @desc    Get all models
 * @access  Private
 */
router.get("/", getAllModels);

module.exports = router;
