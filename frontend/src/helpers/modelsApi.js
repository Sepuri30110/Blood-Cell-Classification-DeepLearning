import axios from 'axios';

// Environment variables
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost";
const PORT = import.meta.env.VITE_PORT || "9001";
const ENDPOINT = import.meta.env.VITE_ENDPOINT || "api";

const API_BASE_URL = `${SERVER_URL}:${PORT}/${ENDPOINT}`;

/**
 * Get all models
 */
export const getAllModels = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/models`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching all models:', error);
        throw error;
    }
};

/**
 * Get specific model by ID
 */
export const getModelById = async (id) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/models/${id}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching model ${id}:`, error);
        throw error;
    }
};
