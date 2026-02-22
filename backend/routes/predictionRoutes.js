const express = require("express");
const router = express.Router();
const { predictImage, getAvailableModels } = require("../controllers/predictionController");
const { validateTokenMiddleware } = require("../middlewares/validateToken");

// All prediction routes require authentication
router.use(validateTokenMiddleware);

/**
 * @route   POST /api/predict
 * @desc    Predict image with selected options (classification, detection, count)
 * @access  Private
 */
router.post("/", predictImage);

/**
 * @route   GET /api/predict/models
 * @desc    Get list of available models
 * @access  Private
 */
router.get("/models", getAvailableModels);

module.exports = router;
