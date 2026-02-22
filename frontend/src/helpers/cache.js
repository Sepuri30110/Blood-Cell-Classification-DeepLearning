/**
 * Cache utility for storing and retrieving data
 */

const CACHE_KEYS = {
    DASHBOARD_STATS: 'dashboard_stats',
    USER_UPLOADS: 'user_uploads',
    PREDICTION_RESULTS: 'prediction_results',
    HISTORY: 'history',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Save data to cache with timestamp
 */
export const saveToCache = (key, data) => {
    try {
        const cacheData = {
            data,
            timestamp: Date.now()
        };
        sessionStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error saving to cache:', error);
    }
};

/**
 * Get data from cache if not expired
 */
export const getFromCache = (key, maxAge = CACHE_DURATION) => {
    try {
        const cached = sessionStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        // Check if cache is expired
        if (age > maxAge) {
            sessionStorage.removeItem(key);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error getting from cache:', error);
        return null;
    }
};

/**
 * Clear specific cache key
 */
export const clearCache = (key) => {
    try {
        sessionStorage.removeItem(key);
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
};

/**
 * Clear all cache keys that start with a specific prefix
 */
export const clearCacheByPrefix = (prefix) => {
    try {
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
            if (key.startsWith(prefix)) {
                sessionStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error('Error clearing cache by prefix:', error);
    }
};

/**
 * Clear all cache
 */
export const clearAllCache = () => {
    try {
        Object.values(CACHE_KEYS).forEach(key => {
            sessionStorage.removeItem(key);
        });
    } catch (error) {
        console.error('Error clearing all cache:', error);
    }
};

/**
 * Check if cache exists and is valid
 */
export const isCacheValid = (key, maxAge = CACHE_DURATION) => {
    const cached = getFromCache(key, maxAge);
    return cached !== null;
};

export { CACHE_KEYS };
