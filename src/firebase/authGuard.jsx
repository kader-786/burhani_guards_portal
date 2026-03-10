import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import appStorage from '../utils/storage';


// AUTH UTILITY FUNCTIONS

// Check if session is valid
export const isSessionValid = () => {
    const isLoggedIn = appStorage.getItem('isLoggedIn');
    const sessionExpiry = appStorage.getItem('session_expiry');

    if (!isLoggedIn || !sessionExpiry) {
        return false;
    }

    const currentTime = Date.now();
    const expiryTime = parseInt(sessionExpiry, 10);

    // Check if session has expired
    if (currentTime >= expiryTime) {
        clearSession();
        return false;
    }

    return true;
};

// Clear all session data
export const clearSession = () => {
    appStorage.clear();
};

// Get access token (returns null if session expired)
export const getAccessToken = () => {
    if (!isSessionValid()) {
        return null;
    }
    return appStorage.getItem('access_token');
};

// Get all user data as an object
export const getUserData = () => {
    if (!isSessionValid()) {
        return null;
    }
    return {
        its_id: appStorage.getItem('its_id'),
        full_name: appStorage.getItem('full_name'),
        team_id: appStorage.getItem('team_id'),
        position_id: appStorage.getItem('position_id'),
        jamaat_id: appStorage.getItem('jamaat_id'),
        jamaat_name: appStorage.getItem('jamaat_name'),
        role_id: appStorage.getItem('role_id'),
        is_admin: appStorage.getItem('is_admin') === 'true',
        access_rights: appStorage.getItem('access_rights'),
    };
};

// Get remaining session time in seconds
export const getRemainingSessionTime = () => {
    const sessionExpiry = appStorage.getItem('session_expiry');
    if (!sessionExpiry) return 0;

    const remaining = parseInt(sessionExpiry, 10) - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
};

// Check if user is admin
export const isAdmin = () => {
    if (!isSessionValid()) {
        return false;
    }
    return appStorage.getItem('is_admin') === 'true';
};

// ============================================
// AUTH GUARD COMPONENT
// ============================================

const AuthGuard = ({ children }) => {
    const navigate = useNavigate();

    const handleSessionExpiry = useCallback(() => {
        clearSession();
        navigate(`${import.meta.env.BASE_URL}firebase/login`, { replace: true });
    }, [navigate]);

    useEffect(() => {
        // Check session validity on mount
        if (!isSessionValid()) {
            handleSessionExpiry();
            return;
        }

        // Set up interval to check session expiry every 30 seconds
        const checkInterval = setInterval(() => {
            if (!isSessionValid()) {
                handleSessionExpiry();
            }
        }, 30000); // Check every 30 seconds

        // Set up timeout to auto-logout at exact expiry time
        const sessionExpiry = appStorage.getItem('session_expiry');
        let expiryTimeout;

        if (sessionExpiry) {
            const timeUntilExpiry = parseInt(sessionExpiry, 10) - Date.now();
            if (timeUntilExpiry > 0) {
                expiryTimeout = setTimeout(() => {
                    handleSessionExpiry();
                }, timeUntilExpiry);
            } else {
                // Session already expired
                handleSessionExpiry();
            }
        }

        // Cleanup function
        return () => {
            clearInterval(checkInterval);
            if (expiryTimeout) {
                clearTimeout(expiryTimeout);
            }
        };
    }, [handleSessionExpiry]);

    // If session is not valid, don't render children
    if (!isSessionValid()) {
        return null;
    }

    return children;
};

export default AuthGuard;
