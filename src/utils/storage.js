// src/utils/storage.js
/**
 * Deployment-aware localStorage wrapper.
 * 
 * All keys are prefixed with the deployment name derived from Vite's BASE_URL,
 * e.g. "BURHANI_GUARDS_TEST_" or "BURHANI_GUARDS_".
 * 
 * This ensures:
 *  1. Sessions persist across browser tabs (localStorage is shared across tabs)
 *  2. Sessions are isolated between deployments on the same origin
 */

// Generate prefix from BASE_URL: "/BURHANI_GUARDS_TEST/" → "BURHANI_GUARDS_TEST_"
const PREFIX = import.meta.env.BASE_URL
    .replace(/\//g, '')           // Remove slashes
    .replace(/[^a-zA-Z0-9_]/g, '_') // Sanitize to safe characters
    + '_';

const appStorage = {
    getItem(key) {
        return localStorage.getItem(PREFIX + key);
    },

    setItem(key, value) {
        localStorage.setItem(PREFIX + key, value);
    },

    removeItem(key) {
        localStorage.removeItem(PREFIX + key);
    },

    /**
     * Clear only the keys belonging to this deployment (prefix-scoped).
     * Does NOT affect keys from other deployments.
     */
    clear() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(PREFIX)) {
                keysToRemove.push(k);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
    }
};

export default appStorage;
