import axios from 'axios';

// Environment variables
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost";
const PORT = import.meta.env.VITE_PORT || "9001";
const ENDPOINT = import.meta.env.VITE_ENDPOINT || "api";

const API_BASE_URL = `${SERVER_URL}:${PORT}/${ENDPOINT}`;

/**
 * Get prediction history
 */
export const getHistory = async (options = {}) => {
    try {
        const {
            page = 1,
            limit = 50,
            sortBy = 'createdAt',
            order = 'desc'
        } = options;

        const response = await axios.get(
            `${API_BASE_URL}/history`,
            {
                params: { page, limit, sortBy, order },
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching history:', error);
        throw error;
    }
};

/**
 * Get history item by ID
 */
export const getHistoryById = async (id) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/history/${id}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching history item:', error);
        throw error;
    }
};

/**
 * Delete history item
 */
export const deleteHistoryItem = async (id) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/history/${id}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting history item:', error);
        throw error;
    }
};

/**
 * Get history statistics
 */
export const getHistoryStats = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/history/stats`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching history stats:', error);
        throw error;
    }
};
