// // src/utils/accessControl.js
// /**
//  * Access Control Utility
//  * 
//  * Parses access rights string format: "[100]111,[101]110,[102]111"
//  * Each module has 3 permission flags: [Add][Edit][Delete]
//  * 
//  * @module accessControl
//  */

// /**
//  * Check if user has access to a specific module
//  * 
//  * @param {string} accessRights - Full access rights string from sessionStorage
//  * @param {string} moduleId - Module ID to check (e.g., "102" for Mumin Master)
//  * @returns {Object} Permission object
//  * @returns {boolean} return.canAdd - User can add records
//  * @returns {boolean} return.canEdit - User can edit records
//  * @returns {boolean} return.canDelete - User can delete records
//  * @returns {boolean} return.hasAccess - User has access to module
//  * 
//  * @example
//  * const rights = "[100]111,[101]110,[102]111";
//  * const permissions = checkModuleAccess(rights, "102");
//  * // Returns: { canAdd: true, canEdit: true, canDelete: true, hasAccess: true }
//  */
// export const checkModuleAccess = (accessRights, moduleId) => {
//     // Default: No access
//     const noAccess = {
//         canAdd: false,
//         canEdit: false,
//         canDelete: false,
//         hasAccess: false
//     };
    
//     // Validate inputs
//     if (!accessRights || !moduleId) {
//         return noAccess;
//     }
    
//     // Check if user is admin (bypass all checks)
//     const isAdmin = sessionStorage.getItem('is_admin');
//     if (isAdmin === 'true' || isAdmin === true) {
//         return {
//             canAdd: true,
//             canEdit: true,
//             canDelete: true,
//             hasAccess: true
//         };
//     }
    
//     // Pattern to match: [102]111
//     const regex = new RegExp(`\\[${moduleId}\\](\\d{3})`);
//     const match = accessRights.match(regex);
    
//     // Module not found in access rights
//     if (!match) {
//         return noAccess;
//     }
    
//     // Extract permission flags
//     const permissions = match[1]; // e.g., "111"
    
//     return {
//         canAdd: permissions[0] === '1',      // First position
//         canEdit: permissions[1] === '1',     // Second position
//         canDelete: permissions[2] === '1',   // Third position
//         hasAccess: true
//     };
// };

// /**
//  * Check if user is admin
//  * 
//  * @returns {boolean} True if user is admin
//  */
// export const isAdmin = () => {
//     const isAdminFlag = sessionStorage.getItem('is_admin');
//     return isAdminFlag === 'true' || isAdminFlag === true;
// };

// /**
//  * Get all session data
//  * 
//  * @returns {Object} Session data object
//  */
// export const getSessionData = () => {
//     return {
//         access_rights: sessionStorage.getItem('access_rights'),
//         access_token: sessionStorage.getItem('access_token'),
//         user_id: sessionStorage.getItem('user_id'),
//         its_id: sessionStorage.getItem('its_id'),
//         full_name: sessionStorage.getItem('full_name'),
//         is_admin: sessionStorage.getItem('is_admin'),
//         role_id: sessionStorage.getItem('role_id'),
//     };
// };

// /**
//  * Clear all session data
//  */
// export const clearSession = () => {
//     sessionStorage.clear();
// };


// src/utils/accessControl.js
/**
 * Access Control Utility - FIXED VERSION
 * 
 * Parses access rights string format: "[100]111,[101]110,[102]111"
 * Each module has 3 permission flags: [Add][Edit][Delete]
 * 
 * @module accessControl
 */

/**
 * Check if user has access to a specific module
 * 
 * @param {string} accessRights - Full access rights string from sessionStorage
 * @param {string} moduleId - Module ID to check (e.g., "102" for Mumin Master)
 * @returns {Object} Permission object
 * @returns {boolean} return.canAdd - User can add records
 * @returns {boolean} return.canEdit - User can edit records
 * @returns {boolean} return.canDelete - User can delete records
 * @returns {boolean} return.hasAccess - User has access to module
 * 
 * @example
 * const rights = "[100]111,[101]110,[102]111";
 * const permissions = checkModuleAccess(rights, "102");
 * // Returns: { canAdd: true, canEdit: true, canDelete: true, hasAccess: true }
 */
export const checkModuleAccess = (accessRights, moduleId) => {
    // Default: No access
    const noAccess = {
        canAdd: false,
        canEdit: false,
        canDelete: false,
        hasAccess: false
    };
    
    // Validate inputs
    if (!moduleId) {
        console.warn('Module ID is required for access check');
        return noAccess;
    }
    
    // Check if user is admin (bypass all checks)
    // FIXED: Handle multiple formats of is_admin flag
    const isAdminFlag = sessionStorage.getItem('is_admin');
    
    // Check for admin - handle string 'true', boolean true, or number 1
    if (isAdminFlag === 'true' || 
        isAdminFlag === true || 
        isAdminFlag === 1 || 
        isAdminFlag === '1') {
        console.log('Admin user detected - granting full access');
        return {
            canAdd: true,
            canEdit: true,
            canDelete: true,
            hasAccess: true
        };
    }
    
    // Check access rights
    if (!accessRights || accessRights.trim() === '') {
        console.warn('No access rights found in session');
        return noAccess;
    }
    
    // Pattern to match: [102]111
    const regex = new RegExp(`\\[${moduleId}\\](\\d{3})`);
    const match = accessRights.match(regex);
    
    // Module not found in access rights
    if (!match) {
        console.log(`Module ${moduleId} not found in access rights: ${accessRights}`);
        return noAccess;
    }
    
    // Extract permission flags
    const permissions = match[1]; // e.g., "111"
    
    const result = {
        canAdd: permissions[0] === '1',      // First position
        canEdit: permissions[1] === '1',     // Second position
        canDelete: permissions[2] === '1',   // Third position
        hasAccess: true
    };
    
    console.log(`Module ${moduleId} permissions:`, result);
    return result;
};

/**
 * Check if user is admin
 * FIXED: Handles multiple formats
 * 
 * @returns {boolean} True if user is admin
 */
export const isAdmin = () => {
    const isAdminFlag = sessionStorage.getItem('is_admin');
    return isAdminFlag === 'true' || 
           isAdminFlag === true || 
           isAdminFlag === 1 || 
           isAdminFlag === '1';
};

/**
 * Get all session data
 * 
 * @returns {Object} Session data object
 */
export const getSessionData = () => {
    return {
        access_rights: sessionStorage.getItem('access_rights'),
        access_token: sessionStorage.getItem('access_token'),
        user_id: sessionStorage.getItem('user_id'),
        its_id: sessionStorage.getItem('its_id'),
        full_name: sessionStorage.getItem('full_name'),
        is_admin: sessionStorage.getItem('is_admin'),
        role_id: sessionStorage.getItem('role_id'),
    };
};

/**
 * Clear all session data
 */
export const clearSession = () => {
    sessionStorage.clear();
};