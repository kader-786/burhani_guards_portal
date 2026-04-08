// src/container/master/lavazammaster/LavazamMaster.jsx
import { Fragment, useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Form } from 'react-bootstrap';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';

import IconButton from '../../elements/button';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { checkModuleAccess } from '../../../utils/accessControl';
import '../../../styles/shared-styles.css';
import StandardModal from '../../../components/StandardModal';
import appStorage from '../../../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MODULE_ID = '120';

const LAVAZAM_TYPE_OPTIONS = [
    { value: 1, label: 'Old' },
    { value: 2, label: 'New' }
];



// ============================================================================
// LAVAZAM MODAL — handles both Add and Edit
// ============================================================================
const LavazamModal = ({
    show,
    onClose,
    onSave,
    mode = 'add',
    editData = null
}) => {
    const [formData, setFormData] = useState({
        lavazam_type: '',
        team_id: '',
        lavazam_amount: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [teamOptions, setTeamOptions] = useState([]);
    const [isLoadingTeams, setIsLoadingTeams] = useState(false);

    const title = mode === 'add' ? 'Add New Lavazam' : 'Edit Lavazam';

    useEffect(() => {
        if (show) {
            fetchTeams();
        }
    }, [show]);

    useEffect(() => {
        if (show && mode === 'edit' && editData) {
            setFormData({
                lavazam_type: editData.lavazam_type?.toString() || '',
                team_id: editData.team_id?.toString() || '',
                lavazam_amount: editData.lavazam_amount?.toString() || ''
            });
            setErrors({});
        } else if (show && mode === 'add') {
            handleClear();
        }
    }, [editData, show, mode]);

    const fetchTeams = async () => {
        setIsLoadingTeams(true);
        try {
            const token = appStorage.getItem('access_token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/Team/GetAllTeams`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success && result.data) {
                const options = [
                    { value: 0, label: 'All Teams' },
                    ...result.data.map(item => ({
                        value: item.team_id,
                        label: item.team_name
                    }))
                ];
                setTeamOptions(options);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
        } finally {
            setIsLoadingTeams(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.lavazam_type) {
            newErrors.lavazam_type = 'Lavazam type is required';
            isValid = false;
        }

        if (formData.team_id === '' || formData.team_id === null || formData.team_id === undefined) {
            newErrors.team_id = 'Team is required';
            isValid = false;
        }

        const amount = parseFloat(formData.lavazam_amount);
        if (!formData.lavazam_amount || isNaN(amount) || amount <= 0) {
            newErrors.lavazam_amount = 'Amount must be greater than 0';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const token = appStorage.getItem('access_token');
            if (!token) throw new Error('Authentication token not found. Please login again.');

            const isAdd = mode === 'add';
            const url = isAdd
                ? `${API_BASE_URL}/Lavazam/InsertLavazam`
                : `${API_BASE_URL}/Lavazam/UpdateLavazam`;
            const method = isAdd ? 'POST' : 'PUT';

            const payload = isAdd
                ? {
                    lavazam_type: parseInt(formData.lavazam_type),
                    team_id: parseInt(formData.team_id),
                    lavazam_amount: parseFloat(formData.lavazam_amount)
                }
                : {
                    lavazam_id: editData.lavazam_id,
                    lavazam_type: parseInt(formData.lavazam_type),
                    team_id: parseInt(formData.team_id),
                    lavazam_amount: parseFloat(formData.lavazam_amount)
                };

            const response = await fetch(url, {
                method,
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
                    title: 'Error',
                    text: 'Session expired. Please login again.',
                    confirmButtonText: 'OK'
                });
                return;
            }

            if (response.ok && result.success) {
                const resultCode = Number(result.data?.result_code);
                const successCode = isAdd ? 1 : 2;

                if (resultCode === successCode) {
                    Swal.fire({
                        title: 'Success!',
                        text: result.message || (isAdd ? 'Lavazam record added successfully!' : 'Lavazam record updated successfully!'),
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: false,
                        showConfirmButton: false,
                        allowOutsideClick: false,
                    }).then((r) => {
                        if (r.dismiss === Swal.DismissReason.timer) {
                            if (onSave) {
                                const selectedTeam = teamOptions.find(t => t.value === parseInt(formData.team_id));
                                onSave({
                                    lavazam_type: parseInt(formData.lavazam_type),
                                    team_id: parseInt(formData.team_id),
                                    team_name: selectedTeam?.label || '',
                                    lavazam_amount: parseFloat(formData.lavazam_amount),
                                    ...(mode === 'edit' && { lavazam_id: editData.lavazam_id })
                                });
                            }
                            handleClose();
                        }
                    });
                } else if (resultCode === 4) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Duplicate Record',
                        text: 'A lavazam record with the same type and team already exists.',
                        confirmButtonText: 'OK'
                    });
                } else if (!isAdd && resultCode === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Lavazam record not found or update failed',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(result.message || 'Operation failed');
                }
            } else {
                throw new Error(result.message || result.detail || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving lavazam:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        handleClear();
        if (onClose) onClose();
    };

    const handleClear = () => {
        setFormData({ lavazam_type: '', team_id: '', lavazam_amount: '' });
        setErrors({});
    };

    const modalButtons = [
        {
            label: isLoading
                ? (mode === 'add' ? 'Saving...' : 'Updating...')
                : (mode === 'add' ? 'Save' : 'Update'),
            variant: 'primary',
            icon: 'ri-save-line',
            onClick: handleSave,
            disabled: isLoading
        },
        {
            label: 'Back',
            variant: 'secondary',
            icon: 'ri-arrow-left-line',
            onClick: handleClose,
            disabled: isLoading
        },
        {
            label: 'Clear',
            className: 'btn-clear',
            icon: 'ri-refresh-line',
            onClick: handleClear,
            disabled: isLoading
        }
    ];

    return (
        <StandardModal
            show={show}
            onClose={handleClose}
            title={title}
            icon={mode === 'add' ? 'ri-add-line' : 'ri-edit-line'}
            buttons={modalButtons}
            loading={isLoading}
            maxWidth="1000px"
        >
            {/* Row 1: Lavazam Type and Team */}
            <div className="form-row-container">
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">
                        Lavazam Type <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Select
                            value={formData.lavazam_type}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, lavazam_type: e.target.value }));
                                if (errors.lavazam_type) setErrors(prev => ({ ...prev, lavazam_type: '' }));
                            }}
                            className={errors.lavazam_type ? 'is-invalid' : ''}
                            disabled={isLoading}
                        >
                            <option value="">Select Type</option>
                            {LAVAZAM_TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Form.Select>
                        {errors.lavazam_type && <div className="error-text">{errors.lavazam_type}</div>}
                    </div>
                </div>

                <div className="horizontal-form-group">
                    <Form.Label className="form-label">
                        Team <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Select
                            value={formData.team_id}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, team_id: e.target.value }));
                                if (errors.team_id) setErrors(prev => ({ ...prev, team_id: '' }));
                            }}
                            className={errors.team_id ? 'is-invalid' : ''}
                            disabled={isLoading || isLoadingTeams}
                        >
                            <option value="">
                                {isLoadingTeams ? 'Loading teams...' : 'Select Team'}
                            </option>
                            {teamOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Form.Select>
                        {errors.team_id && <div className="error-text">{errors.team_id}</div>}
                    </div>
                </div>
            </div>

            {/* Row 2: Amount */}
            <div className="form-row-container">
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">
                        Amount <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Control
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={formData.lavazam_amount}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, lavazam_amount: e.target.value }));
                                if (errors.lavazam_amount) setErrors(prev => ({ ...prev, lavazam_amount: '' }));
                            }}
                            placeholder="Enter amount"
                            className={errors.lavazam_amount ? 'is-invalid' : ''}
                            disabled={isLoading}
                        />
                        {errors.lavazam_amount && <div className="error-text">{errors.lavazam_amount}</div>}
                    </div>
                </div>
                {/* Empty second column to maintain grid balance */}
                <div className="horizontal-form-group" style={{ visibility: 'hidden' }} />
            </div>
        </StandardModal>
    );
};


// ============================================================================
// MAIN LAVAZAM TABLE COMPONENT
// ============================================================================
const LavazamMaster = () => {
    const navigate = useNavigate();

    // RBAC state
    const [checkingPermissions, setCheckingPermissions] = useState(true);
    const [permissions, setPermissions] = useState({
        canAdd: false,
        canEdit: false,
        canDelete: false,
        hasAccess: false
    });

    // Data and UI state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editData, setEditData] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gridKey, setGridKey] = useState(0);

    // RBAC check
    useEffect(() => {
        const checkAccess = async () => {
            setCheckingPermissions(true);

            const isAdminValue = appStorage.getItem('is_admin');
            if (isAdminValue === 'true' || isAdminValue === true || isAdminValue === '1') {
                setPermissions({ canAdd: true, canEdit: true, canDelete: true, hasAccess: true });
                setCheckingPermissions(false);
                return;
            }

            const accessRights = appStorage.getItem('access_rights');

            if (!accessRights) {
                Swal.fire({
                    icon: 'error',
                    title: 'Session Expired',
                    text: 'Please login again',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false
                }).then(() => {
                    navigate(`${import.meta.env.BASE_URL}login/`);
                });
                return;
            }

            const access = checkModuleAccess(accessRights, MODULE_ID);

            if (!access.hasAccess) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Access Denied',
                    text: 'You do not have permission to access this module.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate(`${import.meta.env.BASE_URL}dashboard/`);
                });
                return;
            }

            setPermissions(access);
            setCheckingPermissions(false);
        };

        checkAccess();
    }, [navigate]);

    const fetchLavazam = async () => {
        try {
            setLoading(true);
            setError(null);

            const accessToken = appStorage.getItem('access_token');
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const response = await fetch(`${API_BASE_URL}/Lavazam/GetAllLavazam`, {
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
                    id: item.lavazam_id,
                    srNo: index + 1,
                    lavazam_type: item.lavazam_type,
                    lavazam_type_label: item.lavazam_type === 1 ? 'Old' : 'New',
                    team_id: item.team_id,
                    team_name: item.team_name || (item.team_id === 0 ? 'All Teams' : `Team ${item.team_id}`),
                    lavazam_amount: item.lavazam_amount
                }));
                setTableData(transformedData);
            } else {
                throw new Error(result.message || 'Failed to fetch lavazam records');
            }
        } catch (err) {
            console.error('Error fetching lavazam:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLavazam();
    }, []);

    const totalRecords = tableData.length;

    const handleAdd = () => {
        if (!permissions.canAdd) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to add lavazam records',
                confirmButtonText: 'OK'
            });
            return;
        }
        setModalMode('add');
        setEditData(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditData(null);
    };

    const handleSave = () => {
        setShowModal(false);
        setEditData(null);
        fetchLavazam();
        setGridKey(prev => prev + 1);
    };

    const handleEdit = (id) => {
        if (!permissions.canEdit) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to edit lavazam records',
                confirmButtonText: 'OK'
            });
            return;
        }

        const record = tableData.find(item => item.id === id);
        if (!record) return;

        setEditData({
            lavazam_id: record.id,
            lavazam_type: record.lavazam_type,
            team_id: record.team_id,
            team_name: record.team_name,
            lavazam_amount: record.lavazam_amount
        });
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!permissions.canDelete) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to delete lavazam records',
                confirmButtonText: 'OK'
            });
            return;
        }

        const record = tableData.find(item => item.id === id);
        const label = record
            ? `${record.lavazam_type_label} / ${record.team_name}`
            : 'this record';

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${label}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        try {
            const accessToken = appStorage.getItem('access_token');
            if (!accessToken) throw new Error('Access token not found. Please login again.');

            const response = await fetch(`${API_BASE_URL}/Lavazam/DeleteLavazam`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ lavazam_id: id })
            });

            const apiResult = await response.json();

            if (response.ok && apiResult.success) {
                const resultCode = Number(apiResult.data?.result_code);

                if (resultCode === 3) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: apiResult.message || 'Lavazam record deleted successfully.',
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
                            await fetchLavazam();
                        } catch (e) {
                            console.error('Background sync failed:', e);
                        }
                    }, 500);

                } else if (resultCode === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed',
                        text: 'Lavazam record not found or already deleted',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(apiResult.message || 'Failed to delete lavazam record');
                }
            } else {
                throw new Error(apiResult.message || `Server error: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting lavazam:', error);
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
            item.lavazam_type_label,
            item.team_name,
            item.lavazam_amount,
            item.id
        ]);
    }, [tableData]);

    if (checkingPermissions) {
        return (
            <Fragment>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    textAlign: 'center'
                }}>
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Checking permissions...</p>
                </div>
            </Fragment>
        );
    }

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
                    #grid-lavazam-table .gridjs-search {
                        width: 100%;
                        margin-bottom: 1rem;
                    }
                    #grid-lavazam-table .gridjs-search-input {
                        width: 100%;
                        padding: 8px 12px;
                        border: 1px solid #dee2e6;
                        border-radius: 6px;
                        font-size: 14px;
                    }
                    #grid-lavazam-table .gridjs-search-input:focus {
                        outline: none;
                        border-color: #0d6efd;
                        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                    }
                    #grid-lavazam-table .gridjs-wrapper {
                        margin-top: 0.5rem;
                        overflow-x: auto;
                    }
                    #grid-lavazam-table .gridjs-table {
                        min-width: 600px;
                    }
                    #grid-lavazam-table .btn-action-group {
                        display: inline-flex;
                        gap: 10px;
                        align-items: center;
                    }
                    #grid-lavazam-table .btn-action-group .btn {
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

            <LavazamModal
                show={showModal}
                onClose={handleCloseModal}
                onSave={handleSave}
                mode={modalMode}
                editData={editData}
            />

            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>
                                <div className="page-header-title">
                                    <div className="header-text">
                                        <i className="ri-shield-star-line"></i>
                                        <span>Lavazam Master</span>
                                    </div>
                                    <div className="d-flex gap-2 align-items-center">
                                        <span className="badge badge-primary">
                                            Total Records: {totalRecords}
                                        </span>
                                        {permissions.canAdd && (
                                            <IconButton.IconButton
                                                variant="primary"
                                                icon="ri-add-line"
                                                onClick={handleAdd}
                                                title="Add New"
                                            />
                                        )}
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="loading-container">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3">Loading lavazam data...</p>
                                    </div>
                                ) : error ? (
                                    <div className="error-container">
                                        <i className="ri-error-warning-line" style={{ fontSize: '48px' }}></i>
                                        <p className="mt-3">{error}</p>
                                        <button
                                            className="btn btn-primary mt-3"
                                            onClick={fetchLavazam}
                                        >
                                            <i className="ri-refresh-line me-2"></i>
                                            Retry
                                        </button>
                                    </div>
                                ) : tableData.length === 0 ? (
                                    <div className="loading-container">
                                        <i className="ri-inbox-line" style={{ fontSize: '48px' }}></i>
                                        <p className="mt-3">No lavazam records found</p>
                                        {permissions.canAdd && (
                                            <button
                                                className="btn btn-primary mt-2"
                                                onClick={handleAdd}
                                            >
                                                <i className="ri-add-line me-2"></i>
                                                Add First Record
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div id="grid-lavazam-table">
                                        <Grid
                                            key={gridKey}
                                            data={gridData}
                                            search={{
                                                enabled: true,
                                                placeholder: 'Search lavazam records...'
                                            }}
                                            columns={[
                                                {
                                                    name: 'Sr',
                                                    width: '20px'
                                                },
                                                {
                                                    name: 'Lavazam Type',
                                                    width: '120px'
                                                },
                                                {
                                                    name: 'Team',
                                                    width: '150px'
                                                },
                                                {
                                                    name: 'Amount',
                                                    width: '100px'
                                                },
                                                {
                                                    name: 'Action',
                                                    width: '80px',
                                                    formatter: (cell) => {
                                                        if (!permissions.canEdit && !permissions.canDelete) {
                                                            return html(`<span class="text-muted">-</span>`);
                                                        }

                                                        let buttons = '<div class="btn-action-group">';

                                                        if (permissions.canEdit) {
                                                            buttons += `
                                                                <button
                                                                    class="btn btn-sm btn-info-transparent btn-icon btn-wave"
                                                                    title="Edit"
                                                                    onclick="handleEditClick(${cell})"
                                                                >
                                                                    <i class="ri-edit-line"></i>
                                                                </button>
                                                            `;
                                                        }

                                                        if (permissions.canDelete) {
                                                            buttons += `
                                                                <button
                                                                    class="btn btn-sm btn-danger-transparent btn-icon btn-wave"
                                                                    title="Delete"
                                                                    onclick="handleDeleteClick(${cell})"
                                                                >
                                                                    <i class="ri-delete-bin-line"></i>
                                                                </button>
                                                            `;
                                                        }

                                                        buttons += '</div>';
                                                        return html(buttons);
                                                    },
                                                    hidden: !permissions.canEdit && !permissions.canDelete
                                                }
                                            ]}
                                            pagination={{
                                                limit: 10,
                                                summary: true
                                            }}
                                            className={{
                                                table: 'table table-hover'
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

export default LavazamMaster;
