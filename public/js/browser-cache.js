// Browser cache utility for localStorage and sessionStorage
// Provides type-safe methods with automatic JSON handling and expiration support

const BrowserCache = {
    /**
     * Set item in localStorage with optional expiration
     * @param {string} key - Cache key
     * @param {any} value - Value to cache (will be JSON stringified)
     * @param {number} ttlMinutes - Time to live in minutes (optional)
     */
    setLocal(key, value, ttlMinutes = null) {
        try {
            const item = {
                value: value,
                timestamp: Date.now(),
                expires: ttlMinutes ? Date.now() + (ttlMinutes * 60 * 1000) : null
            };
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.error('Error setting localStorage:', error);
            return false;
        }
    },

    /**
     * Get item from localStorage
     * @param {string} key - Cache key
     * @returns {any} Cached value or null if expired/not found
     */
    getLocal(key) {
        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);

            // Check expiration
            if (item.expires && Date.now() > item.expires) {
                localStorage.removeItem(key);
                return null;
            }

            return item.value;
        } catch (error) {
            console.error('Error getting localStorage:', error);
            return null;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Cache key
     */
    removeLocal(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing localStorage:', error);
            return false;
        }
    },

    /**
     * Clear all localStorage
     */
    clearLocal() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    /**
     * Get all localStorage keys
     * @returns {Array} Array of key names
     */
    getAllLocalKeys() {
        try {
            return Object.keys(localStorage);
        } catch (error) {
            console.error('Error getting localStorage keys:', error);
            return [];
        }
    },

    /**
     * Get localStorage item info (metadata)
     * @param {string} key - Cache key
     * @returns {Object} Item metadata
     */
    getLocalInfo(key) {
        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);
            const size = new Blob([itemStr]).size;

            return {
                key,
                size: `${(size / 1024).toFixed(2)} KB`,
                timestamp: new Date(item.timestamp).toLocaleString(),
                expires: item.expires ? new Date(item.expires).toLocaleString() : 'Never',
                isExpired: item.expires ? Date.now() > item.expires : false
            };
        } catch (error) {
            console.error('Error getting localStorage info:', error);
            return null;
        }
    },

    /**
     * Set item in sessionStorage
     * @param {string} key - Cache key
     * @param {any} value - Value to cache (will be JSON stringified)
     */
    setSession(key, value) {
        try {
            const item = {
                value: value,
                timestamp: Date.now()
            };
            sessionStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.error('Error setting sessionStorage:', error);
            return false;
        }
    },

    /**
     * Get item from sessionStorage
     * @param {string} key - Cache key
     * @returns {any} Cached value or null if not found
     */
    getSession(key) {
        try {
            const itemStr = sessionStorage.getItem(key);
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);
            return item.value;
        } catch (error) {
            console.error('Error getting sessionStorage:', error);
            return null;
        }
    },

    /**
     * Remove item from sessionStorage
     * @param {string} key - Cache key
     */
    removeSession(key) {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing sessionStorage:', error);
            return false;
        }
    },

    /**
     * Clear all sessionStorage
     */
    clearSession() {
        try {
            sessionStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing sessionStorage:', error);
            return false;
        }
    },

    /**
     * Get all sessionStorage keys
     * @returns {Array} Array of key names
     */
    getAllSessionKeys() {
        try {
            return Object.keys(sessionStorage);
        } catch (error) {
            console.error('Error getting sessionStorage keys:', error);
            return [];
        }
    },

    /**
     * Get sessionStorage item info (metadata)
     * @param {string} key - Cache key
     * @returns {Object} Item metadata
     */
    getSessionInfo(key) {
        try {
            const itemStr = sessionStorage.getItem(key);
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);
            const size = new Blob([itemStr]).size;

            return {
                key,
                size: `${(size / 1024).toFixed(2)} KB`,
                timestamp: new Date(item.timestamp).toLocaleString()
            };
        } catch (error) {
            console.error('Error getting sessionStorage info:', error);
            return null;
        }
    }
};

// Make it available globally
window.BrowserCache = BrowserCache;
