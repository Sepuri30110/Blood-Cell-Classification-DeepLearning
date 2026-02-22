import axios from 'axios';

// Environment variables
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost";
const PORT = import.meta.env.VITE_PORT || "9001";
const ENDPOINT = import.meta.env.VITE_ENDPOINT || "api";

const API_BASE_URL = `${SERVER_URL}:${PORT}/${ENDPOINT}`;

/**
 * Get upload statistics for dashboard
 */
export const getUploadStats = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/uploads/stats`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching upload stats:', error);
        throw error;
    }
};

/**
 * Get all uploads for a user with pagination
 */
export const getUserUploads = async (options = {}) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            order = 'desc',
            includeImage = false
        } = options;

        const response = await axios.get(
            `${API_BASE_URL}/uploads`,
            {
                params: { page, limit, sortBy, order, includeImage: includeImage.toString() },
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching user uploads:', error);
        throw error;
    }
};

/**
 * Get single upload by ID
 */
export const getUploadById = async (id) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/uploads/${id}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching upload by ID:', error);
        throw error;
    }
};

/**
 * Get upload image data
 */
export const getUploadImage = async (id) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/uploads/${id}/image`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching upload image:', error);
        throw error;
    }
};

/**
 * Create a new upload/prediction record
 */
export const createUpload = async (uploadData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/uploads`,
            uploadData,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating upload:', error);
        throw error;
    }
};

/**
 * Delete an upload
 */
export const deleteUpload = async (id) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/uploads/${id}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting upload:', error);
        throw error;
    }
};

/**
 * Predict image with selected options
 */
export const predictImage = async (data) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/predict`,
            data,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error predicting image:', error);
        throw error;
    }
};

/**
 * Get available models
 */
export const getAvailableModels = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/predict/models`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching models:', error);
        throw error;
    }
};
