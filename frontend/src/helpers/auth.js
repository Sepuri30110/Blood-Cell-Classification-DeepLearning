import axios from 'axios';
import cookie from 'react-cookies';

// Environment variables
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost";
const PORT = import.meta.env.VITE_PORT || "9001";
const ENDPOINT = import.meta.env.VITE_ENDPOINT || "api";

/**
 * Helper function to get cookie value
 */
export const getCookie = (name) => {
    return cookie.load(name);
};

/**
 * Helper function to set cookie
 */
export const setCookie = (name, value, options = {}) => {
    const defaultOptions = {
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        ...options
    };
    cookie.save(name, value, defaultOptions);
};

/**
 * Helper function to remove cookie
 * Also calls backend to clear httpOnly cookies
 */
export const removeCookie = async (name) => {
    try {
        // Call backend to clear httpOnly cookies
        await axios.post(
            `${SERVER_URL}:${PORT}/${ENDPOINT}/auth/logout`,
            {},
            { withCredentials: true }
        );
    } catch (error) {
        console.error('Backend cookie removal error:', error);
    }
    // Also remove client-side cookies
    cookie.remove(name, { path: '/' });
};

/**
 * Helper function to clear authentication
 * Note: httpOnly cookies (set by backend) cannot be removed via JavaScript
 * and are cleared by the backend logout endpoint
 */
export const clearAuth = async () => {
    localStorage.removeItem('token');
    // Remove cookies (including httpOnly via backend)
    await removeCookie('token');
};

/**
 * Helper function to logout user
 */
export const logout = async () => {
    try {
        // Clear local auth (also calls backend to remove cookies)
        await clearAuth();
    } catch (error) {
        console.error('Logout error:', error);
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    const localStorageToken = localStorage.getItem('token');
    return !!localStorageToken;
};

/**
 * Save current page to session storage
 */
export const savePreviousPage = (path) => {
    sessionStorage.setItem('previousPage', path);
};

/**
 * Get previous page from session storage
 */
export const getPreviousPage = () => {
    return sessionStorage.getItem('previousPage') || '/dashboard';
};
