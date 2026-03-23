// src/utils/menuService.js
/**
 * Dynamic Menu Service
 *
 * Fetches the role-based navigation menu from the API, transforms it
 * into the internal MenuItems format used by sidebar.jsx, and persists
 * it to appStorage so it survives page refreshes.
 *
 * Icons are stored as plain CSS class-name strings (iconClass) instead
 * of JSX elements, making them serialisable to JSON/localStorage.
 * sidebar.jsx / menuloop.jsx render them as <i className={iconClass} />.
 */

import appStorage from './storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_KEY = 'menu_items';

// ─── Icon lookup ─────────────────────────────────────────────────────────────
// Keyed by the module id returned by the API.
// Add a new entry here whenever a new parent module is introduced.
const ICON_MAP = {
    // ── known parent modules ──────────────────────────────────────────────────
    101: 'fe fe-grid',          // Master
    107: 'fe fe-briefcase',     // Back Office
    109: 'fe fe-bar-chart-2',   // Reports
    // ── special keys ─────────────────────────────────────────────────────────
    dashboard: 'fe fe-airplay', // Dashboard (top-level hardcoded entry)
    default: 'fe fe-circle',  // Fallback for unknown parent modules
};

// ─── API call + transform ────────────────────────────────────────────────────

/**
 * Calls the build-admin-menu API and transforms the response into
 * the MenuItems shape that sidebar.jsx already knows how to render.
 *
 * @param {number|string} role_id    - The logged-in user's role ID.
 * @param {string}        accessToken - JWT access token for the Bearer header.
 * @returns {Promise<Array>}          - Transformed MenuItems array.
 */
export const fetchAndBuildMenu = async (role_id, accessToken) => {
    const response = await fetch(
        `${API_BASE_URL}/common/build-admin-menu`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ role_id: Number(role_id) }),
        }
    );

    if (!response.ok) {
        throw new Error(`build-admin-menu returned ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
        throw new Error('build-admin-menu: unexpected response shape');
    }

    // Transform API tree → MenuItems format
    const transformed = result.data.map(parent => transformParent(parent));

    // Prepend the Dashboard entry (always present, role-independent)
    return [
        {
            id: 'dashboard',
            path: `${import.meta.env.BASE_URL}dashboard`,
            iconClass: ICON_MAP.dashboard,
            type: 'link',
            selected: false,
            active: false,
            title: 'Dashboard',
        },
        ...transformed,
    ];
};

// ─── Transformers ─────────────────────────────────────────────────────────────

function transformParent(item) {
    if (item.type === 'link') {
        // Top-level direct link (rare, but handle it)
        return transformLink(item);
    }

    // type === 'sub' — collapsible parent with children
    return {
        id: item.id,
        iconClass: ICON_MAP[item.id] ?? ICON_MAP.default,
        type: 'sub',
        active: false,
        selected: false,
        title: item.title,
        children: Array.isArray(item.children)
            ? item.children.map(child => transformChild(child))
            : [],
    };
}

function transformChild(item) {
    if (item.type === 'sub') {
        // Nested sub-menu
        return transformParent(item);
    }
    return transformLink(item);
}

function transformLink(item) {
    // Normalise path: strip leading slash then prepend BASE_URL
    // e.g. "/master/muminmaster" → BASE_URL + "master/muminmaster"
    const cleanPath = (item.path || '').replace(/^\//, '');
    return {
        id: item.id,
        path: `${import.meta.env.BASE_URL}${cleanPath}`,
        type: 'link',
        active: false,
        selected: false,
        title: item.title,
    };
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

/**
 * Persist the transformed menu to appStorage.
 * @param {Array} menuItems
 */
export const saveMenuToStorage = (menuItems) => {
    try {
        appStorage.setItem(STORAGE_KEY, JSON.stringify(menuItems));
    } catch (e) {
        console.warn('menuService: failed to save menu to storage', e);
    }
};

/**
 * Load the persisted menu from appStorage.
 * Returns null if nothing is stored or if parsing fails.
 * @returns {Array|null}
 */
export const loadMenuFromStorage = () => {
    try {
        const raw = appStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    } catch (e) {
        console.warn('menuService: failed to load menu from storage', e);
        return null;
    }
};
