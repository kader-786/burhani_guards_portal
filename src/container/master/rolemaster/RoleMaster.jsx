import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
import { Card, Row, Col } from 'react-bootstrap';
import IconButton from '../../elements/button';
import { Form, Button, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ============================================================================
// ADD ROLE COMPONENT
// ============================================================================
const AddRole = ({ 
    show, 
    onClose, 
    onSave,
    title = "Add New Role"
}) => {
    const [formData, setFormData] = useState({
        roleName: '',
        roleType: 'user', // 'admin' or 'user'
        remarks: ''
    });

    const [modules, setModules] = useState([]);
    const [modulePermissions, setModulePermissions] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingModules, setLoadingModules] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (show) {
            fetchModules();
        }
    }, [show]);

    const fetchModules = async () => {
        setLoadingModules(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                console.error('Access token not found');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Role/GetAllModules`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setModules(result.data);
                    // Initialize permissions for all modules
                    const initialPermissions = {};
                    result.data.forEach(module => {
                        initialPermissions[module.module_id] = {
                            view: false,
                            add: false,
                            edit: false,
                            delete: false,
                            all: false
                        };
                    });
                    setModulePermissions(initialPermissions);
                }
            }
        } catch (error) {
            console.error('Error fetching modules:', error);
        } finally {
            setLoadingModules(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleRoleTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            roleType: type
        }));
    };

    const handlePermissionChange = (moduleId, permissionType) => {
        setModulePermissions(prev => {
            const currentPerms = prev[moduleId] || {};
            
            if (permissionType === 'all') {
                // If "all" is being toggled
                const newAllState = !currentPerms.all;
                return {
                    ...prev,
                    [moduleId]: {
                        view: newAllState,
                        add: newAllState,
                        edit: newAllState,
                        delete: newAllState,
                        all: newAllState
                    }
                };
            } else if (permissionType === 'view') {
                // If view is unchecked, uncheck everything
                if (currentPerms.view) {
                    return {
                        ...prev,
                        [moduleId]: {
                            view: false,
                            add: false,
                            edit: false,
                            delete: false,
                            all: false
                        }
                    };
                } else {
                    // If view is being checked, just check view
                    return {
                        ...prev,
                        [moduleId]: {
                            ...currentPerms,
                            view: true,
                            all: false
                        }
                    };
                }
            } else {
                // For add, edit, delete
                const newState = !currentPerms[permissionType];
                const updatedPerms = {
                    ...currentPerms,
                    [permissionType]: newState,
                    view: true // Ensure view is checked when any other permission is checked
                };
                
                // Check if all permissions are now true
                const allChecked = updatedPerms.view && updatedPerms.add && 
                                 updatedPerms.edit && updatedPerms.delete;
                updatedPerms.all = allChecked;
                
                return {
                    ...prev,
                    [moduleId]: updatedPerms
                };
            }
        });
    };

    const buildAccessRights = () => {
        if (formData.roleType === 'admin') {
            return ''; // Admin has all access
        }

        const accessRightsArray = [];
        Object.keys(modulePermissions).forEach(moduleId => {
            const perms = modulePermissions[moduleId];
            if (perms.view) {
                // Format: [moduleId]Add(0/1)Edit(0/1)Delete(0/1)
                const permString = `[${moduleId}]${perms.add ? '1' : '0'}${perms.edit ? '1' : '0'}${perms.delete ? '1' : '0'}`;
                accessRightsArray.push(permString);
            }
        });

        return accessRightsArray.join(',');
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.roleName.trim()) {
            newErrors.roleName = 'Role Name is required';
        }

        if (formData.roleType === 'user') {
            // Check if at least one module has view permission
            const hasAnyPermission = Object.values(modulePermissions).some(perm => perm.view);
            if (!hasAnyPermission) {
                newErrors.modules = 'Please select at least one module permission';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const showSuccessAlert = (message) => {
        Swal.fire({
            title: 'Success!',
            text: message,
            icon: 'success',
            timer: 2000,
            timerProgressBar: false,
            showConfirmButton: false,
            allowOutsideClick: false,
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                handleClose();
            }
        });
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const accessRights = buildAccessRights();

            const requestBody = {
                role_name: formData.roleName.trim(),
                access_rights: accessRights,
                is_admin: formData.roleType === 'admin',
                remarks: formData.remarks.trim() || null
            };

            console.log('Sending request:', requestBody);

            const response = await fetch(`${API_BASE_URL}/Role/InsertRole`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                if (onSave) {
                    onSave(result.data);
                }
                showSuccessAlert(result.message || 'Role added successfully!');
            } else {
                if (result.data && result.data.result_code === 4) {
                    setErrors({ roleName: 'Role name already exists' });
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Role name already exists',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(result.message || 'Failed to add role');
                }
            }
        } catch (error) {
            console.error('Error saving role:', error);
            setErrors({ submit: error.message });
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while saving the role',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        handleClear();
        if (onClose) {
            onClose();
        }
    };

    const handleClear = () => {
        setFormData({
            roleName: '',
            roleType: 'user',
            remarks: ''
        });
        setErrors({});
        // Reset all permissions
        const clearedPermissions = {};
        modules.forEach(module => {
            clearedPermissions[module.module_id] = {
                view: false,
                add: false,
                edit: false,
                delete: false,
                all: false
            };
        });
        setModulePermissions(clearedPermissions);
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <style>
                {`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1050;
                        animation: fadeIn 0.2s ease;
                        padding: 20px;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .modal-form-container {
                        background: #fff;
                        border-radius: 12px;
                        padding: 25px;
                        width: 100%;
                        max-width: 1200px;
                        max-height: 95vh;
                        overflow-y: auto;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                        animation: slideIn 0.3s ease;
                        position: relative;
                    }

                    .modal-form-container .form-title {
                        font-size: 20px;
                        font-weight: 600;
                        margin-bottom: 20px;
                        color: #333;
                        border-bottom: 2px solid #0d6efd;
                        padding-bottom: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }

                    .modal-form-container .form-title .close-btn {
                        background: none;
                        border: none;
                        font-size: 24px;
                        color: #666;
                        cursor: pointer;
                        padding: 0;
                        line-height: 1;
                        transition: color 0.2s;
                    }

                    .modal-form-container .form-title .close-btn:hover {
                        color: #dc3545;
                    }

                    .modal-form-container .form-buttons {
                        display: flex;
                        gap: 10px;
                        margin-top: 25px;
                        justify-content: center;
                        padding-top: 15px;
                        border-top: 1px solid #e9ecef;
                        flex-wrap: wrap;
                    }

                    .horizontal-form-group {
                        margin-bottom: 20px;
                        display: flex;
                        align-items: flex-start;
                    }

                    .horizontal-form-group .form-label {
                        min-width: 160px;
                        margin-bottom: 0;
                        margin-right: 15px;
                        font-weight: 500;
                        color: #333;
                        font-size: 14px;
                        text-align: right;
                        padding-top: 8px;
                    }

                    .horizontal-form-group .form-input-wrapper {
                        flex: 1;
                    }

                    .form-row-inline {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 0;
                    }

                    .form-row-inline .horizontal-form-group {
                        flex: 1;
                    }

                    .error-text {
                        color: #dc3545;
                        font-size: 12px;
                        margin-top: 4px;
                    }

                    .submit-error {
                        background: #f8d7da;
                        border: 1px solid #f5c2c7;
                        border-radius: 6px;
                        padding: 12px;
                        margin-bottom: 15px;
                        color: #842029;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    .form-control.is-invalid {
                        border-color: #dc3545;
                    }

                    .btn-clear {
                        background-color: #6c757d !important;
                        border-color: #6c757d !important;
                        color: #fff !important;
                    }

                    .btn-clear:hover {
                        background-color: #5c636a !important;
                        border-color: #565e64 !important;
                    }

                    .btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }

                    .loading-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(255, 255, 255, 0.9);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 12px;
                        z-index: 10;
                    }

                    .spinner-border {
                        width: 3rem;
                        height: 3rem;
                        border-width: 0.3em;
                    }

                    .role-type-radio {
                        display: flex;
                        gap: 20px;
                        padding-top: 8px;
                    }

                    .role-type-radio .form-check {
                        margin-bottom: 0;
                    }

                    .role-type-radio .form-check-input {
                        cursor: pointer;
                    }

                    .role-type-radio .form-check-label {
                        cursor: pointer;
                        margin-left: 5px;
                    }

                    .modules-section {
                        margin-top: 20px;
                        margin-bottom: 20px;
                    }

                    .modules-section-title {
                        font-size: 16px;
                        font-weight: 600;
                        margin-bottom: 15px;
                        color: #333;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #e9ecef;
                    }

                    .modules-table {
                        width: 100%;
                        margin-bottom: 0;
                    }

                    .modules-table thead th {
                        background-color: #f8f9fa;
                        border: 1px solid #dee2e6;
                        padding: 10px;
                        text-align: center;
                        font-weight: 600;
                        font-size: 13px;
                    }

                    .modules-table tbody td {
                        border: 1px solid #dee2e6;
                        padding: 8px;
                        vertical-align: middle;
                    }

                    .modules-table tbody td:first-child {
                        text-align: center;
                        width: 50px;
                    }

                    .modules-table tbody td:nth-child(2),
                    .modules-table tbody td:nth-child(3) {
                        text-align: left;
                    }

                    .modules-table tbody td:not(:first-child):not(:nth-child(2)):not(:nth-child(3)) {
                        text-align: center;
                        width: 80px;
                    }

                    .modules-table .form-check {
                        display: flex;
                        justify-content: center;
                        margin-bottom: 0;
                    }

                    .modules-table .form-check-input {
                        cursor: pointer;
                        width: 18px;
                        height: 18px;
                    }

                    .table-responsive {
                        max-height: 400px;
                        overflow-y: auto;
                    }

                    @media (max-width: 768px) {
                        .modal-form-container {
                            padding: 20px;
                            max-width: 100%;
                        }

                        .horizontal-form-group {
                            flex-direction: column;
                            align-items: stretch;
                        }

                        .horizontal-form-group .form-label {
                            text-align: left;
                            margin-bottom: 8px;
                            margin-right: 0;
                            padding-top: 0;
                            min-width: auto;
                        }

                        .form-row-inline {
                            flex-direction: column;
                            gap: 0;
                        }

                        .modal-form-container .form-buttons {
                            flex-direction: column;
                        }

                        .modal-form-container .form-buttons .btn {
                            width: 100%;
                        }
                    }
                `}
            </style>

            <div className="modal-form-container" onClick={(e) => e.stopPropagation()}>
                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                <div className="form-title">
                    <span>
                        <i className="ri-add-circle-line me-2"></i>
                        {title}
                    </span>
                    <button className="close-btn" onClick={handleClose} title="Close" disabled={loading}>
                        &times;
                    </button>
                </div>
                
                {errors.submit && (
                    <div className="submit-error">
                        <i className="ri-error-warning-line"></i>
                        <span>{errors.submit}</span>
                    </div>
                )}

                {/* Role Name */}
                <div className="horizontal-form-group">
                    <Form.Label>Role Name <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Control
                            type="text"
                            name="roleName"
                            value={formData.roleName}
                            onChange={handleInputChange}
                            placeholder="Enter Role Name"
                            className={errors.roleName ? 'is-invalid' : ''}
                            disabled={loading}
                        />
                        {errors.roleName && <div className="error-text">{errors.roleName}</div>}
                    </div>
                </div>

                {/* Role Type */}
                <div className="horizontal-form-group">
                    <Form.Label>Role Type <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <div className="role-type-radio">
                            <Form.Check
                                type="radio"
                                id="roleTypeAdmin"
                                name="roleType"
                                label="Admin"
                                checked={formData.roleType === 'admin'}
                                onChange={() => handleRoleTypeChange('admin')}
                                disabled={loading}
                            />
                            <Form.Check
                                type="radio"
                                id="roleTypeUser"
                                name="roleType"
                                label="User"
                                checked={formData.roleType === 'user'}
                                onChange={() => handleRoleTypeChange('user')}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Modules Section - Only show for User type */}
                {formData.roleType === 'user' && (
                    <div className="modules-section">
                        <div className="modules-section-title">
                            <i className="ri-list-check me-2"></i>
                            Select Modules
                        </div>
                        {errors.modules && <div className="error-text mb-2">{errors.modules}</div>}
                        <div className="table-responsive">
                            <Table className="modules-table" bordered>
                                <thead>
                                    <tr>
                                        <th>Sr.</th>
                                        <th>Parent</th>
                                        <th>Module</th>
                                        <th>All</th>
                                        <th>View</th>
                                        <th>Add</th>
                                        <th>Edit</th>
                                        <th>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingModules ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <span className="ms-2">Loading modules...</span>
                                            </td>
                                        </tr>
                                    ) : modules.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4">
                                                No modules available
                                            </td>
                                        </tr>
                                    ) : (
                                        modules.map((module, index) => (
                                            <tr key={module.module_id}>
                                                <td>{index + 1}</td>
                                                <td>{module.parent_name || '-'}</td>
                                                <td>{module.module_name}</td>
                                                <td>
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={modulePermissions[module.module_id]?.all || false}
                                                        onChange={() => handlePermissionChange(module.module_id, 'all')}
                                                        disabled={loading}
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={modulePermissions[module.module_id]?.view || false}
                                                        onChange={() => handlePermissionChange(module.module_id, 'view')}
                                                        disabled={loading}
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={modulePermissions[module.module_id]?.add || false}
                                                        onChange={() => handlePermissionChange(module.module_id, 'add')}
                                                        disabled={loading}
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={modulePermissions[module.module_id]?.edit || false}
                                                        onChange={() => handlePermissionChange(module.module_id, 'edit')}
                                                        disabled={loading}
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={modulePermissions[module.module_id]?.delete || false}
                                                        onChange={() => handlePermissionChange(module.module_id, 'delete')}
                                                        disabled={loading}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Remarks */}
                <div className="horizontal-form-group">
                    <Form.Label>Description</Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleInputChange}
                            placeholder="Enter remarks or description"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="form-buttons">
                    <Button variant="primary" onClick={handleSave} disabled={loading}>
                        <i className="ri-save-line me-1"></i> {loading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        <i className="ri-arrow-left-line me-1"></i> Back
                    </Button>
                    <Button className="btn-clear" onClick={handleClear} disabled={loading}>
                        <i className="ri-refresh-line me-1"></i> Clear
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// EDIT ROLE COMPONENT
// ============================================================================
const EditRole = ({ 
    show, 
    onClose, 
    onUpdate, 
    roleId,
    title = "Edit Role"
}) => {
    const [formData, setFormData] = useState({
        roleName: '',
        roleType: 'user',
        remarks: ''
    });

    const [modules, setModules] = useState([]);
    const [modulePermissions, setModulePermissions] = useState({});
    const [originalData, setOriginalData] = useState(null);
    const [originalAccessRights, setOriginalAccessRights] = useState(''); // Store original access rights
    const [loading, setLoading] = useState(false);
    const [loadingRoleData, setLoadingRoleData] = useState(false);
    const [loadingModules, setLoadingModules] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (show && roleId) {
            const fetchAllData = async () => {
                await Promise.all([
                    fetchModules(),
                    fetchRoleData(roleId)
                ]);
            };
            fetchAllData();
        }
    }, [show, roleId]);

    const fetchModules = async () => {
        setLoadingModules(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                console.error('Access token not found');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Role/GetAllModules`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setModules(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching modules:', error);
        } finally {
            setLoadingModules(false);
        }
    };

    const parseAccessRights = (accessRightsString) => {
        if (!accessRightsString) return {};
        
        const permissions = {};
        const parts = accessRightsString.split(',');
        
        parts.forEach(part => {
            const match = part.match(/\[(\d+)\](\d)(\d)(\d)/);
            if (match) {
                const [, moduleId, add, edit, del] = match;
                permissions[moduleId] = {
                    view: true, // If it's in the list, view is always true
                    add: add === '1',
                    edit: edit === '1',
                    delete: del === '1',
                    all: add === '1' && edit === '1' && del === '1'
                };
            }
        });
        
        return permissions;
    };

    const fetchRoleData = async (id) => {
        setLoadingRoleData(true);
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Authentication token not found. Please login again.',
                    confirmButtonText: 'OK'
                });
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Role/GetRoleById`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    role_id: id
                })
            });

            const result = await response.json();

            if (response.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'Session Expired',
                    text: 'Please login again.',
                    confirmButtonText: 'OK'
                });
                return;
            }

            if (response.ok && result.success && result.data && result.data.length > 0) {
                const roleData = result.data[0];
                
                const roleType = roleData.is_admin ? 'admin' : 'user';
                const accessRights = roleData.access_rights || '';
                
                const initialFormData = {
                    roleName: roleData.role_name || '',
                    roleType: roleType,
                    remarks: roleData.remarks || ''
                };
                
                setFormData(initialFormData);
                setOriginalData(initialFormData);
                setOriginalAccessRights(accessRights); // Store original access rights

                if (roleType === 'user') {
                    const parsedPermissions = parseAccessRights(accessRights);
                    
                    // Initialize all modules with false permissions
                    const allPermissions = {};
                    modules.forEach(module => {
                        allPermissions[module.module_id] = parsedPermissions[module.module_id] || {
                            view: false,
                            add: false,
                            edit: false,
                            delete: false,
                            all: false
                        };
                    });
                    
                    setModulePermissions(allPermissions);
                } else {
                    // For admin, set all permissions to false (won't be shown anyway)
                    const allPermissions = {};
                    modules.forEach(module => {
                        allPermissions[module.module_id] = {
                            view: false,
                            add: false,
                            edit: false,
                            delete: false,
                            all: false
                        };
                    });
                    setModulePermissions(allPermissions);
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Failed to load role data',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error fetching role data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error loading role data. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoadingRoleData(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleRoleTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            roleType: type
        }));
    };

    const handlePermissionChange = (moduleId, permissionType) => {
        setModulePermissions(prev => {
            const currentPerms = prev[moduleId] || {};
            
            if (permissionType === 'all') {
                const newAllState = !currentPerms.all;
                return {
                    ...prev,
                    [moduleId]: {
                        view: newAllState,
                        add: newAllState,
                        edit: newAllState,
                        delete: newAllState,
                        all: newAllState
                    }
                };
            } else if (permissionType === 'view') {
                if (currentPerms.view) {
                    return {
                        ...prev,
                        [moduleId]: {
                            view: false,
                            add: false,
                            edit: false,
                            delete: false,
                            all: false
                        }
                    };
                } else {
                    return {
                        ...prev,
                        [moduleId]: {
                            ...currentPerms,
                            view: true,
                            all: false
                        }
                    };
                }
            } else {
                const newState = !currentPerms[permissionType];
                const updatedPerms = {
                    ...currentPerms,
                    [permissionType]: newState,
                    view: true
                };
                
                const allChecked = updatedPerms.view && updatedPerms.add && 
                                 updatedPerms.edit && updatedPerms.delete;
                updatedPerms.all = allChecked;
                
                return {
                    ...prev,
                    [moduleId]: updatedPerms
                };
            }
        });
    };

    const buildAccessRights = () => {
        if (formData.roleType === 'admin') {
            return '';
        }

        const accessRightsArray = [];
        Object.keys(modulePermissions).forEach(moduleId => {
            const perms = modulePermissions[moduleId];
            if (perms.view) {
                const permString = `[${moduleId}]${perms.add ? '1' : '0'}${perms.edit ? '1' : '0'}${perms.delete ? '1' : '0'}`;
                accessRightsArray.push(permString);
            }
        });

        return accessRightsArray.join(',');
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.roleName.trim()) {
            newErrors.roleName = 'Role Name is required';
        }

        if (formData.roleType === 'user') {
            const hasAnyPermission = Object.values(modulePermissions).some(perm => perm.view);
            if (!hasAnyPermission) {
                newErrors.modules = 'Please select at least one module permission';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const hasChanges = () => {
        if (!originalData) return false;

        const currentAccessRights = buildAccessRights();

        return (
            formData.roleName !== originalData.roleName ||
            formData.roleType !== originalData.roleType ||
            formData.remarks !== originalData.remarks ||
            currentAccessRights !== originalAccessRights
        );
    };

    const showSuccessAlert = (message) => {
        Swal.fire({
            title: 'Success!',
            text: message,
            icon: 'success',
            timer: 2000,
            timerProgressBar: false,
            showConfirmButton: false,
            allowOutsideClick: false,
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                handleClose();
            }
        });
    };

    const handleUpdate = async () => {
        if (!validateForm()) {
            return;
        }

        if (!hasChanges()) {
            Swal.fire({
                icon: 'info',
                title: 'No Changes',
                text: 'No changes to update',
                confirmButtonText: 'OK'
            });
            return;
        }

        setLoading(true);

        try {
            const token = sessionStorage.getItem('access_token');

            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Authentication token not found. Please login again.',
                    confirmButtonText: 'OK'
                });
                return;
            }

            const accessRights = buildAccessRights();

            const payload = {
                role_id: roleId,
                role_name: formData.roleName.trim(),
                access_rights: accessRights,
                is_admin: formData.roleType === 'admin',
                remarks: formData.remarks.trim() || null
            };

            console.log('Sending update request:', payload);

            const response = await fetch(`${API_BASE_URL}/Role/UpdateRole`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'Session Expired',
                    text: 'Please login again.',
                    confirmButtonText: 'OK'
                });
                return;
            }

            if (response.ok && result.success) {
                if (onUpdate) {
                    onUpdate(result.data);
                }
                
                showSuccessAlert(result.message || 'Role updated successfully!');
            } else {
                if (result.data?.result_code === 4) {
                    setErrors(prev => ({
                        ...prev,
                        roleName: 'Role name already exists'
                    }));
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Role name already exists',
                        confirmButtonText: 'OK'
                    });
                } else if (result.data?.result_code === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Role not found or update failed',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: result.message || 'Failed to update role',
                        confirmButtonText: 'OK'
                    });
                }
            }
        } catch (error) {
            console.error('Error updating role:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while updating the role. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            roleName: '',
            roleType: 'user',
            remarks: ''
        });
        setErrors({});
        setOriginalData(null);
        setOriginalAccessRights('');
        setModulePermissions({});
        
        if (onClose) {
            onClose();
        }
    };

    const handleReset = () => {
        if (originalData) {
            setFormData({ ...originalData });
            setErrors({});
            
            // Re-fetch the original data to reset permissions
            fetchRoleData(roleId);
            
            Swal.fire({
                icon: 'info',
                title: 'Form Reset',
                text: 'Form reset to original values',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <style>
                {`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1050;
                        animation: fadeIn 0.2s ease;
                        padding: 20px;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .modal-form-container {
                        background: #fff;
                        border-radius: 12px;
                        padding: 25px;
                        width: 100%;
                        max-width: 1200px;
                        max-height: 95vh;
                        overflow-y: auto;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                        animation: slideIn 0.3s ease;
                        position: relative;
                    }

                    .modal-form-container .form-title {
                        font-size: 20px;
                        font-weight: 600;
                        margin-bottom: 20px;
                        color: #333;
                        border-bottom: 2px solid #0d6efd;
                        padding-bottom: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }

                    .modal-form-container .form-title .close-btn {
                        background: none;
                        border: none;
                        font-size: 24px;
                        color: #666;
                        cursor: pointer;
                        padding: 0;
                        line-height: 1;
                        transition: color 0.2s;
                    }

                    .modal-form-container .form-title .close-btn:hover {
                        color: #dc3545;
                    }

                    .modal-form-container .form-buttons {
                        display: flex;
                        gap: 10px;
                        margin-top: 25px;
                        justify-content: center;
                        padding-top: 15px;
                        border-top: 1px solid #e9ecef;
                        flex-wrap: wrap;
                    }

                    .horizontal-form-group {
                        margin-bottom: 20px;
                        display: flex;
                        align-items: flex-start;
                    }

                    .horizontal-form-group .form-label {
                        min-width: 160px;
                        margin-bottom: 0;
                        margin-right: 15px;
                        font-weight: 500;
                        color: #333;
                        font-size: 14px;
                        text-align: right;
                        padding-top: 8px;
                    }

                    .horizontal-form-group .form-input-wrapper {
                        flex: 1;
                    }

                    .error-text {
                        color: #dc3545;
                        font-size: 12px;
                        margin-top: 4px;
                    }

                    .form-control.is-invalid {
                        border-color: #dc3545;
                    }

                    .btn-reset {
                        background-color: #6c757d !important;
                        border-color: #6c757d !important;
                        color: #fff !important;
                    }

                    .btn-reset:hover {
                        background-color: #5c636a !important;
                        border-color: #565e64 !important;
                    }

                    .btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }

                    .loading-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(255, 255, 255, 0.9);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        border-radius: 12px;
                        z-index: 10;
                    }

                    .spinner-border {
                        width: 3rem;
                        height: 3rem;
                        border-width: 0.3em;
                    }

                    .loading-text {
                        margin-top: 15px;
                        color: #6c757d;
                        font-weight: 500;
                    }

                    .role-type-radio {
                        display: flex;
                        gap: 20px;
                        padding-top: 8px;
                    }

                    .role-type-radio .form-check {
                        margin-bottom: 0;
                    }

                    .role-type-radio .form-check-input {
                        cursor: pointer;
                    }

                    .role-type-radio .form-check-label {
                        cursor: pointer;
                        margin-left: 5px;
                    }

                    .modules-section {
                        margin-top: 20px;
                        margin-bottom: 20px;
                    }

                    .modules-section-title {
                        font-size: 16px;
                        font-weight: 600;
                        margin-bottom: 15px;
                        color: #333;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #e9ecef;
                    }

                    .modules-table {
                        width: 100%;
                        margin-bottom: 0;
                    }

                    .modules-table thead th {
                        background-color: #f8f9fa;
                        border: 1px solid #dee2e6;
                        padding: 10px;
                        text-align: center;
                        font-weight: 600;
                        font-size: 13px;
                    }

                    .modules-table tbody td {
                        border: 1px solid #dee2e6;
                        padding: 8px;
                        vertical-align: middle;
                    }

                    .modules-table tbody td:first-child {
                        text-align: center;
                        width: 50px;
                    }

                    .modules-table tbody td:nth-child(2),
                    .modules-table tbody td:nth-child(3) {
                        text-align: left;
                    }

                    .modules-table tbody td:not(:first-child):not(:nth-child(2)):not(:nth-child(3)) {
                        text-align: center;
                        width: 80px;
                    }

                    .modules-table .form-check {
                        display: flex;
                        justify-content: center;
                        margin-bottom: 0;
                    }

                    .modules-table .form-check-input {
                        cursor: pointer;
                        width: 18px;
                        height: 18px;
                    }

                    .table-responsive {
                        max-height: 400px;
                        overflow-y: auto;
                    }

                    @media (max-width: 768px) {
                        .modal-form-container {
                            padding: 20px;
                            max-width: 100%;
                        }

                        .horizontal-form-group {
                            flex-direction: column;
                            align-items: stretch;
                        }

                        .horizontal-form-group .form-label {
                            text-align: left;
                            margin-bottom: 8px;
                            margin-right: 0;
                            padding-top: 0;
                            min-width: auto;
                        }

                        .modal-form-container .form-buttons {
                            flex-direction: column;
                        }

                        .modal-form-container .form-buttons .btn {
                            width: 100%;
                        }
                    }
                `}
            </style>

            <div className="modal-form-container" onClick={(e) => e.stopPropagation()}>
                {(loadingRoleData || loading) && (
                    <div className="loading-overlay">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="loading-text">
                            {loadingRoleData ? 'Loading role data...' : 'Updating...'}
                        </p>
                    </div>
                )}

                <div className="form-title">
                    <span>
                        <i className="ri-edit-line me-2"></i>
                        {title}
                    </span>
                    <button 
                        className="close-btn" 
                        onClick={handleClose} 
                        title="Close" 
                        disabled={loading || loadingRoleData}
                    >
                        &times;
                    </button>
                </div>
                
                {!loadingRoleData && (
                    <>
                        {/* Role Name */}
                        <div className="horizontal-form-group">
                            <Form.Label>Role Name <span className="text-danger">*</span></Form.Label>
                            <div className="form-input-wrapper">
                                <Form.Control
                                    type="text"
                                    name="roleName"
                                    value={formData.roleName}
                                    onChange={handleInputChange}
                                    placeholder="Enter Role Name"
                                    className={errors.roleName ? 'is-invalid' : ''}
                                    disabled={loading}
                                />
                                {errors.roleName && <div className="error-text">{errors.roleName}</div>}
                            </div>
                        </div>

                        {/* Role Type */}
                        <div className="horizontal-form-group">
                            <Form.Label>Role Type <span className="text-danger">*</span></Form.Label>
                            <div className="form-input-wrapper">
                                <div className="role-type-radio">
                                    <Form.Check
                                        type="radio"
                                        id="editRoleTypeAdmin"
                                        name="roleType"
                                        label="Admin"
                                        checked={formData.roleType === 'admin'}
                                        onChange={() => handleRoleTypeChange('admin')}
                                        disabled={loading}
                                    />
                                    <Form.Check
                                        type="radio"
                                        id="editRoleTypeUser"
                                        name="roleType"
                                        label="User"
                                        checked={formData.roleType === 'user'}
                                        onChange={() => handleRoleTypeChange('user')}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modules Section - Only show for User type */}
                        {formData.roleType === 'user' && (
                            <div className="modules-section">
                                <div className="modules-section-title">
                                    <i className="ri-list-check me-2"></i>
                                    Select Modules
                                </div>
                                {errors.modules && <div className="error-text mb-2">{errors.modules}</div>}
                                <div className="table-responsive">
                                    <Table className="modules-table" bordered>
                                        <thead>
                                            <tr>
                                                <th>Sr.</th>
                                                <th>Parent</th>
                                                <th>Module</th>
                                                <th>All</th>
                                                <th>View</th>
                                                <th>Add</th>
                                                <th>Edit</th>
                                                <th>Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingModules ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-4">
                                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        <span className="ms-2">Loading modules...</span>
                                                    </td>
                                                </tr>
                                            ) : modules.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-4">
                                                        No modules available
                                                    </td>
                                                </tr>
                                            ) : (
                                                modules.map((module, index) => (
                                                    <tr key={module.module_id}>
                                                        <td>{index + 1}</td>
                                                        <td>{module.parent_name || '-'}</td>
                                                        <td>{module.module_name}</td>
                                                        <td>
                                                            <Form.Check
                                                                type="checkbox"
                                                                checked={modulePermissions[module.module_id]?.all || false}
                                                                onChange={() => handlePermissionChange(module.module_id, 'all')}
                                                                disabled={loading}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Check
                                                                type="checkbox"
                                                                checked={modulePermissions[module.module_id]?.view || false}
                                                                onChange={() => handlePermissionChange(module.module_id, 'view')}
                                                                disabled={loading}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Check
                                                                type="checkbox"
                                                                checked={modulePermissions[module.module_id]?.add || false}
                                                                onChange={() => handlePermissionChange(module.module_id, 'add')}
                                                                disabled={loading}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Check
                                                                type="checkbox"
                                                                checked={modulePermissions[module.module_id]?.edit || false}
                                                                onChange={() => handlePermissionChange(module.module_id, 'edit')}
                                                                disabled={loading}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Check
                                                                type="checkbox"
                                                                checked={modulePermissions[module.module_id]?.delete || false}
                                                                onChange={() => handlePermissionChange(module.module_id, 'delete')}
                                                                disabled={loading}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {/* Remarks */}
                        <div className="horizontal-form-group">
                            <Form.Label>Description</Form.Label>
                            <div className="form-input-wrapper">
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleInputChange}
                                    placeholder="Enter remarks or description"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="form-buttons">
                    <Button 
                        variant="primary" 
                        onClick={handleUpdate} 
                        disabled={loading || !hasChanges() || loadingRoleData}
                    >
                        <i className="ri-save-line me-1"></i> 
                        {loading ? 'Updating...' : 'Update'}
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={handleClose} 
                        disabled={loading || loadingRoleData}
                    >
                        <i className="ri-arrow-left-line me-1"></i> Back
                    </Button>
                    <Button 
                        className="btn-reset" 
                        onClick={handleReset} 
                        disabled={loading || !hasChanges() || loadingRoleData}
                    >
                        <i className="ri-refresh-line me-1"></i> Reset
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN ROLE TABLE COMPONENT
// ============================================================================
const RoleTable = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editRoleId, setEditRoleId] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gridKey, setGridKey] = useState(0);

    const fetchRoleData = async () => {
        try {
            setLoading(true);
            setError(null);

            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const apiUrl = `${API_BASE_URL}/Role/GetAllRoles`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('Non-JSON response received:', textResponse.substring(0, 200));
                throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                const transformedData = result.data.map((item, index) => ({
                    id: item.role_id,
                    srNo: index + 1,
                    roleName: item.role_name,
                    roleType: item.role_type || (item.is_admin ? 'Admin' : 'User'),
                    remarks: item.remarks || '-',
                    status: item.r_status || 'Active'
                }));
                setTableData(transformedData);
            } else {
                throw new Error(result.message || 'Failed to fetch role data');
            }
        } catch (err) {
            console.error('Error fetching role data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoleData();
    }, []);

    const totalRecords = tableData.length;

    const handleAdd = () => {
        setShowAddForm(true);
    };

    const handleCloseAddModal = () => {
        setShowAddForm(false);
    };

    const handleCloseEditModal = () => {
        setShowEditForm(false);
        setEditRoleId(null);
    };

    const handleSave = (data) => {
        console.log('Saved Data:', data);
        setShowAddForm(false);
        fetchRoleData();
        setGridKey(prev => prev + 1);
    };

    const handleUpdate = (data) => {
        console.log('Updated Data:', data);
        setShowEditForm(false);
        setEditRoleId(null);
        
        setTimeout(() => {
            fetchRoleData();
        }, 500);
        
        setGridKey(prev => prev + 1);
    };

    const handleEdit = (id) => {
        console.log('Editing role ID:', id);
        setEditRoleId(id);
        setShowEditForm(true);
    };

    const handleDelete = async (id) => {
        const roleToDelete = tableData.find(item => item.id === id);
        const roleName = roleToDelete ? roleToDelete.roleName : 'this role';
        
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${roleName}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const response = await fetch(`${API_BASE_URL}/Role/DeleteRole`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    role_id: id
                })
            });

            const apiResult = await response.json();

            if (response.ok && apiResult.success) {
                const resultCode = Number(apiResult.data?.result_code);
                
                if (resultCode === 3) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: apiResult.message || 'Role has been deleted successfully.',
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: false,
                        showConfirmButton: false
                    });

                    setTableData(prevData => {
                        const filtered = prevData.filter(item => item.id !== id);
                        return filtered.map((item, index) => ({
                            ...item,
                            srNo: index + 1
                        }));
                    });
                    
                    setGridKey(prev => prev + 1);
                    
                    setTimeout(async () => {
                        try {
                            await fetchRoleData();
                            console.log('Table synced with server');
                        } catch (error) {
                            console.error('Background sync failed:', error);
                        }
                    }, 500);

                } else if (resultCode === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed',
                        text: 'Role not found or already deleted',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(apiResult.message || 'Failed to delete role');
                }
            } else {
                throw new Error(apiResult.message || `Server error: ${response.status}`);
            }

        } catch (error) {
            console.error('Error deleting role:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while deleting',
                confirmButtonText: 'OK'
            });
        }
    };

    useEffect(() => {
        window.handleEditClick = handleEdit;
        window.handleDeleteClick = handleDelete;

        return () => {
            delete window.handleEditClick;
            delete window.handleDeleteClick;
        };
    }, [tableData]);

    const gridData = useMemo(() => {
        return tableData.map(item => [
            item.srNo,
            item.roleName,
            item.roleType,
            item.remarks,
            item.id
        ]);
    }, [tableData]);

    return (
        <Fragment>
            <style>
                {`
                    #grid-role-table .gridjs-search {
                        width: 100%;
                        margin-bottom: 1rem;
                    }
                    #grid-role-table .gridjs-search-input {
                        width: 100%;
                        padding: 8px 12px;
                        border: 1px solid #dee2e6;
                        border-radius: 6px;
                        font-size: 14px;
                    }
                    #grid-role-table .gridjs-search-input:focus {
                        outline: none;
                        border-color: #0d6efd;
                        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                    }
                    #grid-role-table .gridjs-wrapper {
                        margin-top: 0.5rem;
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                    #grid-role-table .gridjs-table {
                        min-width: 800px;
                    }
                    #grid-role-table .gridjs-container {
                        padding: 0;
                    }
                    #grid-role-table .gridjs-th-sort {
                        position: relative;
                        cursor: pointer;
                    }
                    #grid-role-table .gridjs-th-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                    }
                    #grid-role-table button.gridjs-sort {
                        background: none;
                        border: none;
                        width: 20px;
                        height: 20px;
                        position: relative;
                        cursor: pointer;
                        float: right;
                        margin-left: 8px;
                    }
                    #grid-role-table button.gridjs-sort::before,
                    #grid-role-table button.gridjs-sort::after {
                        content: '';
                        position: absolute;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 0;
                        height: 0;
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                    }
                    #grid-role-table button.gridjs-sort::before {
                        top: 2px;
                        border-bottom: 6px solid #bbb;
                    }
                    #grid-role-table button.gridjs-sort::after {
                        bottom: 2px;
                        border-top: 6px solid #bbb;
                    }
                    #grid-role-table button.gridjs-sort-asc::before {
                        border-bottom-color: #333;
                    }
                    #grid-role-table button.gridjs-sort-asc::after {
                        border-top-color: #bbb;
                    }
                    #grid-role-table button.gridjs-sort-desc::before {
                        border-bottom-color: #bbb;
                    }
                    #grid-role-table button.gridjs-sort-desc::after {
                        border-top-color: #333;
                    }
                    #grid-role-table .gridjs-sort-neutral,
                    #grid-role-table .gridjs-sort-asc,
                    #grid-role-table .gridjs-sort-desc {
                        background-image: none !important;
                    }
                    #grid-role-table .gridjs-footer {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 0;
                        border-top: 1px solid #e9ecef;
                        margin-top: 1rem;
                    }
                    #grid-role-table .gridjs-pagination {
                        display: flex;
                        width: 100%;
                        justify-content: space-between;
                        align-items: center;
                    }
                    #grid-role-table .gridjs-summary {
                        order: 1;
                        color: #6c757d;
                        font-size: 14px;
                    }
                    #grid-role-table .gridjs-pages {
                        order: 2;
                        display: flex;
                        gap: 5px;
                    }
                    #grid-role-table .gridjs-pages button {
                        min-width: 35px;
                        height: 35px;
                        border: 1px solid #dee2e6;
                        background: #fff;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-size: 14px;
                    }
                    #grid-role-table .gridjs-pages button:hover:not(:disabled) {
                        background: #e9ecef;
                        border-color: #adb5bd;
                    }
                    #grid-role-table .gridjs-pages button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    #grid-role-table .gridjs-pages button.gridjs-currentPage {
                        background: var(--primary-color, #0d6efd);
                        color: #fff;
                        border-color: var(--primary-color, #0d6efd);
                    }
                    #grid-role-table .btn-action-group {
                        display: inline-flex;
                        gap: 10px;
                        align-items: center;
                    }
                    #grid-role-table .btn-action-group .btn {
                        margin: 0 !important;
                    }
                    #grid-role-table .gridjs-wrapper::-webkit-scrollbar {
                        height: 8px;
                    }
                    #grid-role-table .gridjs-wrapper::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 4px;
                    }
                    #grid-role-table .gridjs-wrapper::-webkit-scrollbar-thumb {
                        background: #c1c1c1;
                        border-radius: 4px;
                    }
                    #grid-role-table .gridjs-wrapper::-webkit-scrollbar-thumb:hover {
                        background: #a1a1a1;
                    }
                    .loading-container, .error-container {
                        text-align: center;
                        padding: 40px;
                        color: #6c757d;
                    }
                    .error-container {
                        color: #dc3545;
                    }
                    .error-container .error-message {
                        background: #fff3cd;
                        border: 1px solid #ffc107;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 20px auto;
                        max-width: 600px;
                        text-align: left;
                    }
                    .error-container .error-title {
                        font-weight: 600;
                        color: #856404;
                        margin-bottom: 10px;
                    }
                    .error-container .error-details {
                        color: #856404;
                        font-size: 14px;
                        word-break: break-word;
                    }
                    .spinner-border {
                        width: 3rem;
                        height: 3rem;
                        border-width: 0.3em;
                    }
                `}
            </style>

            <AddRole
                show={showAddForm}
                onClose={handleCloseAddModal}
                onSave={handleSave}
            />

            <EditRole
                show={showEditForm}
                onClose={handleCloseEditModal}
                onUpdate={handleUpdate}
                roleId={editRoleId}
            />

            <Row>
                <Col xl={12}>
                    <Card className="custom-card">
                        <Card.Header className="d-flex align-items-center justify-content-between">
                            <div>
                                <Card.Title className="mb-1">
                                    Role Master
                                </Card.Title>
                                <span className="badge bg-primary-transparent">
                                    Total Records: {totalRecords}
                                </span>
                            </div>
                            <div className="d-flex gap-2">
                                <IconButton.IconButton
                                    variant="primary"
                                    icon="ri-add-line"
                                    onClick={handleAdd}
                                    title="Add New"
                                />
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <div className="loading-container">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-3">Loading role data...</p>
                                </div>
                            ) : error ? (
                                <div className="error-container">
                                    <i className="ri-error-warning-line" style={{ fontSize: '48px' }}></i>
                                    <div className="error-message">
                                        <div className="error-title">⚠️ Error Loading Roles</div>
                                        <div className="error-details">{error}</div>
                                    </div>
                                    <button 
                                        className="btn btn-primary mt-3" 
                                        onClick={fetchRoleData}
                                    >
                                        <i className="ri-refresh-line me-2"></i>
                                        Retry
                                    </button>
                                </div>
                            ) : tableData.length === 0 ? (
                                <div className="loading-container">
                                    <i className="ri-inbox-line" style={{ fontSize: '48px' }}></i>
                                    <p className="mt-3">No role records found</p>
                                    <button 
                                        className="btn btn-primary mt-2" 
                                        onClick={handleAdd}
                                    >
                                        <i className="ri-add-line me-2"></i>
                                        Add First Role
                                    </button>
                                </div>
                            ) : (
                                <div id="grid-role-table">
                                    <Grid
                                        key={gridKey}
                                        data={gridData}
                                        sort={true}
                                        search={{
                                            enabled: true,
                                            placeholder: 'Search roles...'
                                        }}
                                        columns={[
                                            { 
                                                name: 'Sr',
                                                width: '80px',
                                                sort: true
                                            }, 
                                            { 
                                                name: 'Role Name',
                                                width: '250px',
                                                sort: true
                                            }, 
                                            { 
                                                name: 'Role Type',
                                                width: '150px',
                                                sort: true
                                            },
                                            { 
                                                name: 'Remarks',
                                                width: '300px',
                                                sort: true
                                            },
                                            {
                                                name: 'Action',
                                                width: '150px',
                                                sort: true,
                                                formatter: (cell, row) => {
                                                    const id = row.cells[4].data;
                                                    
                                                    return html(`
                                                        <div class="btn-action-group">
                                                            <button 
                                                                class="btn btn-sm btn-info-transparent btn-icon btn-wave" 
                                                                title="Edit"
                                                                onclick="handleEditClick(${id})"
                                                            >
                                                                <i class="ri-edit-line"></i>
                                                            </button>
                                                            <button 
                                                                class="btn btn-sm btn-danger-transparent btn-icon btn-wave" 
                                                                title="Delete"
                                                                onclick="handleDeleteClick(${id})"
                                                            >
                                                                <i class="ri-delete-bin-line"></i>
                                                            </button>
                                                        </div>
                                                    `);
                                                },
                                                hidden: false
                                            }
                                        ]} 
                                        pagination={{
                                            limit: 10,
                                            summary: true
                                        }}
                                        className={{
                                            table: 'table table-bordered',
                                            search: 'gridjs-search mb-3',
                                        }}
                                    />
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Fragment>
    );
};

export default RoleTable;