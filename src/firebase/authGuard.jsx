import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';


// AUTH UTILITY FUNCTIONS

// Check if session is valid
export const isSessionValid = () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const sessionExpiry = sessionStorage.getItem('session_expiry');
    
    if (!isLoggedIn || !sessionExpiry) {
        return false;
    }
    
    // const currentTime = Date.now();
    // const expiryTime = parseInt(sessionExpiry, 10);
    
    const currentTime = Date.now();
    const expiryTime = parseInt(sessionExpiry, 60);
    
    // Check if session has expired
    if (currentTime >= expiryTime) {
        clearSession();
        return false;
    }
    
    return true;
};

// Clear all session data
export const clearSession = () => {
    sessionStorage.removeItem('its_id');
    sessionStorage.removeItem('full_name');
    sessionStorage.removeItem('team_id');
    sessionStorage.removeItem('position_id');
    sessionStorage.removeItem('jamaat_id');
    sessionStorage.removeItem('jamaat_name');
    sessionStorage.removeItem('role_id');
    sessionStorage.removeItem('is_admin');
    sessionStorage.removeItem('access_rights');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('session_expiry');
    sessionStorage.removeItem('isLoggedIn');
};

// Get access token (returns null if session expired)
export const getAccessToken = () => {
    if (!isSessionValid()) {
        return null;
    }
    return sessionStorage.getItem('access_token');
};

// Get all user data as an object
export const getUserData = () => {
    if (!isSessionValid()) {
        return null;
    }
    return {
        its_id: sessionStorage.getItem('its_id'),
        full_name: sessionStorage.getItem('full_name'),
        team_id: sessionStorage.getItem('team_id'),
        position_id: sessionStorage.getItem('position_id'),
        jamaat_id: sessionStorage.getItem('jamaat_id'),
        jamaat_name: sessionStorage.getItem('jamaat_name'),
        role_id: sessionStorage.getItem('role_id'),
        is_admin: sessionStorage.getItem('is_admin') === 'true',
        access_rights: sessionStorage.getItem('access_rights'),
    };
};

// Get remaining session time in seconds
export const getRemainingSessionTime = () => {
    const sessionExpiry = sessionStorage.getItem('session_expiry');
    if (!sessionExpiry) return 0;
    
    const remaining = parseInt(sessionExpiry, 10) - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
};

// Check if user is admin
export const isAdmin = () => {
    if (!isSessionValid()) {
        return false;
    }
    return sessionStorage.getItem('is_admin') === 'true';
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
        const sessionExpiry = sessionStorage.getItem('session_expiry');
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
