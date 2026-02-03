import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
import { Card, Row, Col } from 'react-bootstrap';
import IconButton from '../../elements/button';
import { Form, Button, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import '../../../styles/shared-styles.css';
import StandardModal from '../../../components/StandardModal';

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
        roleType: 'user',
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

    // Define modal buttons
    const modalButtons = [
        {
            label: loading ? 'Saving...' : 'Save',
            variant: 'primary',
            icon: 'ri-save-line',
            onClick: handleSave,
            disabled: loading
        },
        {
            label: 'Back',
            variant: 'secondary',
            icon: 'ri-arrow-left-line',
            onClick: handleClose,
            disabled: loading
        },
        {
            label: 'Clear',
            className: 'btn-clear',
            icon: 'ri-refresh-line',
            onClick: handleClear,
            disabled: loading
        }
    ];

    return (
        <StandardModal
            show={show}
            onClose={handleClose}
            title={title}
            icon="ri-shield-user-line"
            buttons={modalButtons}
            loading={loading}
            maxWidth="1200px"
        >
            <style>
                {`
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
                `}
            </style>

            {errors.submit && (
                <div className="submit-error">
                    <i className="ri-error-warning-line"></i>
                    <span>{errors.submit}</span>
                </div>
            )}

            <div className="horizontal-form-group">
                <Form.Label className="form-label">
                    Role Name <span className="text-danger">*</span>
                </Form.Label>
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

            <div className="horizontal-form-group">
                <Form.Label className="form-label">
                    Role Type <span className="text-danger">*</span>
                </Form.Label>
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

            <div className="horizontal-form-group">
                <Form.Label className="form-label">Description</Form.Label>
                <div className="form-input-wrapper">
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        placeholder="Enter remarks or description"
                        disabled={loading}
                        style={{ height: 'auto' }}
                    />
                </div>
            </div>
        </StandardModal>
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
    const [originalAccessRights, setOriginalAccessRights] = useState('');
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
                    view: true,
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
                setLoadingRoleData(false);
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
                setOriginalAccessRights(accessRights);

                if (roleType === 'user') {
                    const parsedPermissions = parseAccessRights(accessRights);

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
                const resultCode = Number(result.data?.result_code);

                if (resultCode === 2) {
                    if (onUpdate) {
                        onUpdate(result.data);
                    }

                    showSuccessAlert(result.message || 'Role updated successfully!');
                } else if (resultCode === 4) {
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
                } else if (resultCode === 0) {
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
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Failed to update role',
                    confirmButtonText: 'OK'
                });
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

    // Define modal buttons
    const modalButtons = [
        {
            label: loading ? 'Updating...' : 'Update',
            variant: 'primary',
            icon: 'ri-save-line',
            onClick: handleUpdate,
            disabled: loading || !hasChanges() || loadingRoleData
        },
        {
            label: 'Back',
            variant: 'secondary',
            icon: 'ri-arrow-left-line',
            onClick: handleClose,
            disabled: loading || loadingRoleData
        },
        {
            label: 'Reset',
            className: 'btn-clear',
            icon: 'ri-refresh-line',
            onClick: handleReset,
            disabled: loading || !hasChanges() || loadingRoleData
        }
    ];

    return (
        <StandardModal
            show={show}
            onClose={handleClose}
            title={title}
            icon="ri-edit-line"
            buttons={modalButtons}
            loading={loadingRoleData || loading}
            maxWidth="1200px"
        >
            <style>
                {`
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
                `}
            </style>

            {!loadingRoleData && (
                <>
                    <div className="horizontal-form-group">
                        <Form.Label className="form-label">
                            Role Name <span className="text-danger">*</span>
                        </Form.Label>
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

                    <div className="horizontal-form-group">
                        <Form.Label className="form-label">
                            Role Type <span className="text-danger">*</span>
                        </Form.Label>
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

                    <div className="horizontal-form-group">
                        <Form.Label className="form-label">Description</Form.Label>
                        <div className="form-input-wrapper">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                placeholder="Enter remarks or description"
                                disabled={loading}
                                style={{ height: 'auto' }}
                            />
                        </div>
                    </div>
                </>
            )}
        </StandardModal>
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
        setShowAddForm(false);
        fetchRoleData();
        setGridKey(prev => prev + 1);
    };

    const handleUpdate = (data) => {
        setShowEditForm(false);
        setEditRoleId(null);

        setTimeout(() => {
            fetchRoleData();
        }, 500);

        setGridKey(prev => prev + 1);
    };

    const handleEdit = (id) => {
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
                    .page-header-title {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                    }

                    .page-header-title .header-text {
                        display: flex;
                        align-items: center;
                        font-size: 18px;
                        font-weight: 600;
                        color: #333;
                        gap: 8px;
                    }

                    .page-header-title .header-text i {
                        font-size: 20px;
                    }

                    .badge-primary {
                        background: #0d6efd;
                        color: #fff;
                        padding: 6px 12px;
                        border-radius: 4px;
                        font-size: 14px;
                        font-weight: 500;
                    }

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
                    #grid-role-table .btn-action-group {
                        display: inline-flex;
                        gap: 10px;
                        align-items: center;
                    }
                    #grid-role-table .btn-action-group .btn {
                        margin: 0 !important;
                    }
                    .loading-container, .error-container {
                        text-align: center;
                        padding: 40px;
                        color: #6c757d;
                    }
                    .error-container {
                        color: #dc3545;
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

            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>
                                <div className="page-header-title">
                                    <div className="header-text">
                                        <i className="ri-shield-user-line"></i>
                                        <span>Role Master</span>
                                    </div>
                                    <div className="d-flex gap-2 align-items-center">
                                        <span className="badge badge-primary">
                                            Total Records: {totalRecords}
                                        </span>
                                        <IconButton.IconButton
                                            variant="primary"
                                            icon="ri-add-line"
                                            onClick={handleAdd}
                                            title="Add New"
                                        />
                                    </div>
                                </div>

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
                                        <p className="mt-3">{error}</p>
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
                                            // sort={true}
                                            search={{
                                                enabled: true,
                                                placeholder: 'Search roles...'
                                            }}
                                            columns={[
                                                {
                                                    name: 'Sr',
                                                    width: '20px',
                                                    // sort: true
                                                },
                                                {
                                                    name: 'Role Name',
                                                    width: '120px',
                                                    // sort: true
                                                },
                                                {
                                                    name: 'Role Type',
                                                    width: '100px',
                                                    // sort: true
                                                },
                                                {
                                                    name: 'Remarks',
                                                    width: '300px',
                                                    // sort: true
                                                },
                                                {
                                                    name: 'Action',
                                                    width: '40px',
                                                    // sort: true,
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
            </div>
        </Fragment>
    );
};

export default RoleTable;