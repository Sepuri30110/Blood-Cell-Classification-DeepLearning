const express = require('express');
const routes = express.Router();
const { 
    createUpload, 
    getUserUploads, 
    getUploadById, 
    deleteUpload,
    getUploadStats,
    getUploadImage
} = require('../controllers/uploadController');
const { validateTokenMiddleware } = require('../middlewares/validateToken');

// All upload routes require authentication
routes.use(validateTokenMiddleware);

// Create new upload
routes.post('/', createUpload);

// Get all uploads for logged-in user
routes.get('/', getUserUploads);

// Get upload statistics
routes.get('/stats', getUploadStats);

// Get single upload by ID
routes.get('/:id', getUploadById);

// Get image data for specific upload
routes.get('/:id/image', getUploadImage);

// Delete upload
routes.delete('/:id', deleteUpload);

module.exports = routes;
