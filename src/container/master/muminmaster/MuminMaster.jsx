// src/container/master/muminmaster/MuminMaster.jsx
import { Fragment, useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Form, Button, Spinner } from 'react-bootstrap';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
import Select from 'react-select';
import IconButton from '../../elements/button'; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

// API Base URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ============================================================================
// ADD MUMIN COMPONENT
// ============================================================================
const AddMumin = ({ 
    show,
    onClose,
    onSave,
    title = "Add New Mumin"
}) => {
    
    // Form state
    const [formData, setFormData] = useState({
        // ITS API Data (View Only)
        its_id: '',
        full_name: '',
        full_name_arabic: '',
        prefix: '',
        age: null,
        gender: '',
        marital_status: '',
        misaq: false,
        idara: '',
        category: '',
        organization: '',
        email: '',
        mobile: '',
        whatsapp_mobile: '',
        address: '',
        jamaat_id: null,
        jamaat: '',
        jamiaat_id: null,
        jamiaat: '',
        nationality: '',
        vatan: '',
        city: '',
        country: '',
        
        // User Input Data (Editable)
        team_id: null,
        position_id: null,
        role_id: null,
        password: ''
    });

    // Validation errors state
    const [errors, setErrors] = useState({});

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingITS, setIsLoadingITS] = useState(false);
    const [isLoadingTeams, setIsLoadingTeams] = useState(false);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);
    const [isLoadingPositions, setIsLoadingPositions] = useState(false);

    // Options state
    const [teamOptions, setTeamOptions] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);
    const [positionOptions, setPositionOptions] = useState([]);

    // ITS Data fetched flag
    const [isITSDataFetched, setIsITSDataFetched] = useState(false);

    // Auto-close success alert using SweetAlert2
    const showSuccessAlert = (message) => {
        Swal.fire({
            title: 'Success!',
            text: `${message}`,
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

    // Fetch Roles and Positions on component mount
    useEffect(() => {
        if (show) {
            fetchAllRoles();
            fetchAllPositions();
        }
    }, [show]);

    // Fetch Roles from API
    const fetchAllRoles = async () => {
        setIsLoadingRoles(true);
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                setIsLoadingRoles(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Mumin/GetAllRoles`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.status === 401) {
                toast.error('Session expired. Please login again.');
                return;
            }

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.role_id,
                    label: item.role_name
                }));
                setRoleOptions(options);
            } else {
                toast.error(result.message || 'Failed to load Roles');
            }
        } catch (error) {
            console.error('Error fetching Roles:', error);
            toast.error('Error loading Roles. Please try again.');
        } finally {
            setIsLoadingRoles(false);
        }
    };

    // Fetch Positions from API
    const fetchAllPositions = async () => {
        setIsLoadingPositions(true);
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                setIsLoadingPositions(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Mumin/GetAllPositions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.status === 401) {
                toast.error('Session expired. Please login again.');
                return;
            }

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.position_id,
                    label: item.position_name
                }));
                setPositionOptions(options);
            } else {
                toast.error(result.message || 'Failed to load Positions');
            }
        } catch (error) {
            console.error('Error fetching Positions:', error);
            toast.error('Error loading Positions. Please try again.');
        } finally {
            setIsLoadingPositions(false);
        }
    };

    // Fetch Teams based on Jamiaat ID
    const fetchTeamsByJamiaat = async (jamiaatId) => {
        setIsLoadingTeams(true);
        setTeamOptions([]);
        
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                setIsLoadingTeams(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Duty/GetTeamsByJamiaat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    jamiaat_id: jamiaatId
                })
            });

            const result = await response.json();

            if (response.status === 401) {
                toast.error('Session expired. Please login again.');
                return;
            }

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.team_id,
                    label: item.team_name
                }));
                setTeamOptions(options);
            } else {
                toast.error(result.message || 'Failed to load Teams for selected Jamiaat');
                setTeamOptions([]);
            }
        } catch (error) {
            console.error('Error fetching Teams:', error);
            toast.error('Error loading Teams. Please try again.');
            setTeamOptions([]);
        } finally {
            setIsLoadingTeams(false);
        }
    };

    // Fetch ITS Data from HandlerB2
    const fetchITSData = async (itsId) => {
        if (!itsId || itsId.trim() === '') {
            toast.error('Please enter a valid ITS ID');
            return;
        }

        setIsLoadingITS(true);
        try {
            const response = await fetch(`${API_BASE_URL}/ITS-API/HandlerB2`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    its_id: itsId.trim()
                })
            });

            const result = await response.json();

            if (response.ok && result.success && result.data?.Table && result.data.Table.length > 0) {
                const itsData = result.data.Table[0];
                
                setFormData(prev => ({
                    ...prev,
                    its_id: itsData.ITS_ID || itsId,
                    full_name: itsData.Fullname || '',
                    full_name_arabic: itsData.Arabic_Fullname || '',
                    prefix: itsData.Prefix || '',
                    age: itsData.Age || null,
                    gender: itsData.Gender || '',
                    marital_status: itsData.Marital_Status || '',
                    misaq: itsData.Misaq === 'Done' ? true : false,
                    idara: itsData.Idara || '',
                    category: itsData.Category || '',
                    organization: itsData.Organization || '',
                    email: itsData.Email || '',
                    mobile: itsData.Mobile || '',
                    whatsapp_mobile: itsData.WhatsApp_No || '',
                    address: itsData.Address || '',
                    jamaat_id: itsData.Jamaat_ID || null,
                    jamaat: itsData.Jamaat || '',
                    jamiaat_id: itsData.Jamiaat_ID || null,
                    jamiaat: itsData.Jamiaat || '',
                    nationality: itsData.Nationality || '',
                    vatan: itsData.Vatan || '',
                    city: itsData.City || '',
                    country: itsData.Country || ''
                }));

                setIsITSDataFetched(true);
                toast.success('ITS data loaded successfully');

                // Fetch teams based on Jamiaat ID
                if (itsData.Jamiaat_ID) {
                    fetchTeamsByJamiaat(itsData.Jamiaat_ID);
                }
            } else {
                toast.error(result.message || 'ITS ID not found or invalid');
                setIsITSDataFetched(false);
            }
        } catch (error) {
            console.error('Error fetching ITS data:', error);
            toast.error('Error loading ITS data. Please try again.');
            setIsITSDataFetched(false);
        } finally {
            setIsLoadingITS(false);
        }
    };

    // Handle ITS ID input change
    const handleITSIdChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            its_id: value
        }));
        
        // Reset ITS data fetched flag when ITS ID changes
        if (isITSDataFetched) {
            setIsITSDataFetched(false);
        }
        
        if (errors.its_id) {
            setErrors(prev => ({
                ...prev,
                its_id: ''
            }));
        }
    };

    // Handle Fetch ITS Data button click
    const handleFetchITSData = () => {
        fetchITSData(formData.its_id);
    };

    // Handle form input changes (for editable fields)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle Team select change
    const handleTeamChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            team_id: selectedOption
        }));
        
        if (errors.team_id) {
            setErrors(prev => ({
                ...prev,
                team_id: ''
            }));
        }
    };

    // Handle Position select change
    const handlePositionChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            position_id: selectedOption
        }));
        
        if (errors.position_id) {
            setErrors(prev => ({
                ...prev,
                position_id: ''
            }));
        }
    };

    // Handle Role select change
    const handleRoleChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            role_id: selectedOption
        }));
        
        if (errors.role_id) {
            setErrors(prev => ({
                ...prev,
                role_id: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.its_id || formData.its_id.trim() === '') {
            newErrors.its_id = 'ITS ID is required';
            isValid = false;
        }

        if (!isITSDataFetched) {
            newErrors.its_id = 'Please fetch ITS data first';
            isValid = false;
        }

        if (!formData.team_id) {
            newErrors.team_id = 'Team is required';
            isValid = false;
        }

        if (!formData.position_id) {
            newErrors.position_id = 'Position is required';
            isValid = false;
        }

        if (!formData.role_id) {
            newErrors.role_id = 'Role is required';
            isValid = false;
        }

        if (!formData.password || formData.password.trim() === '') {
            newErrors.password = 'Password is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Handle Save
const handleSave = async () => {
    if (!validateForm()) {
        return;
    }

    setIsLoading(true);

    try {
        const token = sessionStorage.getItem('access_token');

        if (!token) {
            throw new Error('Authentication token not found. Please login again.');
        }

        const payload = {
            its_id: parseInt(formData.its_id),
            full_name: formData.full_name,
            full_name_arabic: formData.full_name_arabic,
            prefix: formData.prefix,
            age: formData.age,
            gender: formData.gender,
            marital_status: formData.marital_status,
            misaq: formData.misaq,
            idara: formData.idara,
            category: formData.category,
            organization: formData.organization,
            email: formData.email,
            mobile: formData.mobile,
            whatsapp_mobile: formData.whatsapp_mobile,
            address: formData.address,
            jamaat_id: formData.jamaat_id,
            jamaat_name: formData.jamaat,
            jamiaat_id: formData.jamiaat_id,
            jamiaat_name: formData.jamiaat,
            nationality: formData.nationality,
            vatan: formData.vatan,
            city: formData.city,
            country: formData.country,
            team_id: formData.team_id?.value || 0,
            position_id: formData.position_id?.value || 0,
            joining_date: new Date().toISOString().split('T')[0],
            role_id: formData.role_id?.value || 0,
            password: formData.password
        };
        
        const response = await fetch(`${API_BASE_URL}/Mumin/InsertMumin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('Insert Mumin Payload:', payload);
        console.log('Insert Mumin Result:', result);
        
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
            const result_code = Number(result.data?.result_code || 0);
            
            if (result_code === 1 || result_code === 2) {
                // Call onSave callback before showing alert
                if (onSave) {
                    onSave(formData);
                }
                
                // Show auto-close success alert with appropriate message
                const message = result_code === 1 
                    ? (result.message || 'Mumin added successfully!')
                    : (result.message || 'Mumin data updated successfully!');
                
                showSuccessAlert(message);
            } else {
                throw new Error(result.message || 'Failed to save mumin');
            }
        } else {
            throw new Error(result.message || 'Failed to save mumin');
        }
    } catch (error) {
        console.error('Error saving mumin:', error);
        setErrors({ submit: error.message });
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'An error occurred while saving the mumin. Please try again.',
            confirmButtonText: 'OK'
        });
    } finally {
        setIsLoading(false);
    }
};

    // Handle Close
    const handleClose = () => {
        handleClear();
        if (onClose) {
            onClose();
        }
    };

    // Handle Clear
    const handleClear = () => {
        setFormData({
            its_id: '',
            full_name: '',
            full_name_arabic: '',
            prefix: '',
            age: null,
            gender: '',
            marital_status: '',
            misaq: false,
            idara: '',
            category: '',
            organization: '',
            email: '',
            mobile: '',
            whatsapp_mobile: '',
            address: '',
            jamaat_id: null,
            jamaat: '',
            jamiaat_id: null,
            jamiaat: '',
            nationality: '',
            vatan: '',
            city: '',
            country: '',
            team_id: null,
            position_id: null,
            role_id: null,
            password: ''
        });
        setErrors({});
        setTeamOptions([]);
        setIsITSDataFetched(false);
    };

    // Custom styles for react-select
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '38px',
            borderColor: state.selectProps.error ? '#dc3545' : '#dee2e6',
            '&:hover': {
                borderColor: state.selectProps.error ? '#dc3545' : '#86b7fe'
            }
        }),
        valueContainer: (base) => ({
            ...base,
            minHeight: '38px',
            padding: '2px 8px'
        }),
        input: (base) => ({
            ...base,
            margin: '0',
            padding: '0'
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
            maxHeight: '200px',
            overflowY: 'auto'
        }),
        menuList: (base) => ({
            ...base,
            maxHeight: '200px',
            overflowY: 'auto'
        }),
        menuPortal: (base) => ({ 
            ...base, 
            zIndex: 9999 
        }),
        placeholder: (base) => ({
            ...base,
            color: '#6c757d'
        })
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
                        -webkit-backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1050;
                        animation: fadeIn 0.2s ease;
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
                        width: 90%;
                        max-width: 900px;
                        max-height: 90vh;
                        overflow-y: auto;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                        animation: slideIn 0.3s ease;
                        position: relative;
                    }

                    @media (max-width: 768px) {
                        .modal-form-container {
                            width: 95%;
                            max-width: 100%;
                            padding: 20px;
                            max-height: 95vh;
                        }
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
                    }

                    .horizontal-form-group {
                        display: flex;
                        align-items: flex-start;
                        margin-bottom: 15px;
                    }
                    .horizontal-form-group .form-label {
                        min-width: 150px;
                        margin-bottom: 0;
                        margin-right: 10px;
                        font-weight: 500;
                        text-align: right;
                        white-space: nowrap;
                        padding-top: 8px;
                    }
                    .horizontal-form-group .form-input-wrapper {
                        flex: 1;
                    }

                    .form-row-inline {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 15px;
                    }
                    .form-row-inline .horizontal-form-group {
                        flex: 1;
                        margin-bottom: 0;
                    }

                    .section-divider {
                        margin: 20px 0;
                        padding: 10px 0;
                        border-top: 2px solid #e9ecef;
                        border-bottom: 1px solid #e9ecef;
                    }
                    
                    .section-title {
                        font-size: 16px;
                        font-weight: 600;
                        color: #0d6efd;
                        margin: 0;
                    }

                    @media (max-width: 768px) {
                        .form-row-inline {
                            flex-direction: column;
                            gap: 15px;
                        }
                        
                        .horizontal-form-group {
                            flex-direction: row !important;
                            align-items: flex-start !important;
                        }
                        
                        .horizontal-form-group .form-label {
                            min-width: 120px !important;
                            font-size: 13px;
                            padding-top: 10px;
                        }
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

                    .form-control:disabled, .form-control[readonly] {
                        background-color: #e9ecef;
                        opacity: 1;
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

                    .its-fetch-section {
                        display: flex;
                        gap: 10px;
                        align-items: flex-start;
                    }
                    
                    .its-fetch-section .form-control {
                        flex: 1;
                    }
                    
                    .its-fetch-section .btn {
                        white-space: nowrap;
                    }
                `}
            </style>

            <div className="modal-form-container" onClick={(e) => e.stopPropagation()}>
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                <div className="form-title">
                    <span>
                        <i className="ri-user-add-line me-2"></i>
                        {title}
                    </span>
                    <button className="close-btn" onClick={handleClose} title="Close" disabled={isLoading}>
                        &times;
                    </button>
                </div>
                
                {/* Submit Error */}
                {errors.submit && (
                    <div className="submit-error">
                        <i className="ri-error-warning-line"></i>
                        <span>{errors.submit}</span>
                    </div>
                )}

                {/* ITS ID Fetch Section */}
                <div className="horizontal-form-group">
                    <Form.Label>ITS ID <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <div className="its-fetch-section">
                            <Form.Control
                                type="text"
                                name="its_id"
                                value={formData.its_id}
                                onChange={handleITSIdChange}
                                placeholder="Enter ITS ID"
                                className={errors.its_id ? 'is-invalid' : ''}
                                disabled={isLoading || isITSDataFetched}
                            />
                            <Button 
                                variant="primary" 
                                onClick={handleFetchITSData}
                                disabled={isLoading || isLoadingITS || !formData.its_id || isITSDataFetched}
                            >
                                {isLoadingITS ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-1"
                                        />
                                        Fetching...
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-search-line me-1"></i>
                                        Fetch Data
                                    </>
                                )}
                            </Button>
                        </div>
                        {errors.its_id && <div className="error-text">{errors.its_id}</div>}
                    </div>
                </div>

                {/* ITS Data Section (View Only) */}
                {isITSDataFetched && (
                    <>
                        <div className="section-divider">
                            <h6 className="section-title">
                                <i className="ri-information-line me-2"></i>
                                ITS Data (View Only)
                            </h6>
                        </div>

                        {/* Row 1: Full Name and Arabic Name */}
                        <div className="form-row-inline">
                            <div className="horizontal-form-group">
                                <Form.Label>Full Name</Form.Label>
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        type="text"
                                        value={formData.full_name}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="horizontal-form-group">
                                <Form.Label>Arabic Name</Form.Label>
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        type="text"
                                        value={formData.full_name_arabic}
                                        readOnly
                                        disabled
                                        style={{ direction: 'rtl' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Age, Gender, Marital Status */}
                        <div className="form-row-inline">
                            <div className="horizontal-form-group">
                                <Form.Label>Age</Form.Label>
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        type="text"
                                        value={formData.age || ''}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="horizontal-form-group">
                                <Form.Label>Gender</Form.Label>
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        type="text"
                                        value={formData.gender}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="horizontal-form-group">
                                <Form.Label>Marital Status</Form.Label>
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        type="text"
                                        value={formData.marital_status}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Email and Mobile */}
                        <div className="form-row-inline">
                            <div className="horizontal-form-group">
                                <Form.Label>Email</Form.Label>
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        type="text"
                                        value={formData.email}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="horizontal-form-group">
                                <Form.Label>Mobile</Form.Label>
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        type="text"
                                        value={formData.mobile}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 4: Jamaat and Jamiaat */}
                        <div className="form-row-inline">
                            <div className="horizontal-form-group">
                                <Form.Label>Jamaat</Form.Label>
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        type="text"
                                        value={formData.jamaat}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="horizontal-form-group">
                                <Form.Label>Jamiaat</Form.Label>
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        type="text"
                                        value={formData.jamiaat}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 5: Organization */}
                        <div className="horizontal-form-group">
                            <Form.Label>Organization</Form.Label>
                            <div className="form-input-wrapper">
                                <Form.Control
                                    type="text"
                                    value={formData.organization}
                                    readOnly
                                    disabled
                                />
                            </div>
                        </div>

                        {/* User Input Section */}
                        <div className="section-divider">
                            <h6 className="section-title">
                                <i className="ri-user-settings-line me-2"></i>
                                Assignment Details (Required)
                            </h6>
                        </div>

                        {/* Row 6: Team, Position, Role */}
                        <div className="form-row-inline">
                            <div className="horizontal-form-group">
                                <Form.Label>Team <span className="text-danger">*</span></Form.Label>
                                <div className="form-input-wrapper">
                                    <Select
                                        options={teamOptions}
                                        value={formData.team_id}
                                        onChange={handleTeamChange}
                                        placeholder={isLoadingTeams ? "Loading teams..." : "Select team"}
                                        isClearable
                                        isDisabled={isLoading || isLoadingTeams}
                                        isLoading={isLoadingTeams}
                                        styles={selectStyles}
                                        error={errors.team_id}
                                        noOptionsMessage={() => "No teams available"}
                                    />
                                    {errors.team_id && <div className="error-text">{errors.team_id}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="form-row-inline">
                            <div className="horizontal-form-group">
                                <Form.Label>Position <span className="text-danger">*</span></Form.Label>
                                <div className="form-input-wrapper">
                                    <Select
                                        options={positionOptions}
                                        value={formData.position_id}
                                        onChange={handlePositionChange}
                                        placeholder="Select position"
                                        isClearable
                                        isDisabled={isLoading || isLoadingPositions}
                                        isLoading={isLoadingPositions}
                                        styles={selectStyles}
                                        error={errors.position_id}
                                        noOptionsMessage={() => "No positions available"}
                                    />
                                    {errors.position_id && <div className="error-text">{errors.position_id}</div>}
                                </div>
                            </div>

                            <div className="horizontal-form-group">
                                <Form.Label>Role <span className="text-danger">*</span></Form.Label>
                                <div className="form-input-wrapper">
                                    <Select
                                        options={roleOptions}
                                        value={formData.role_id}
                                        onChange={handleRoleChange}
                                        placeholder="Select role"
                                        isClearable
                                        isDisabled={isLoading || isLoadingRoles}
                                        isLoading={isLoadingRoles}
                                        styles={selectStyles}
                                        error={errors.role_id}
                                        noOptionsMessage={() => "No roles available"}
                                    />
                                    {errors.role_id && <div className="error-text">{errors.role_id}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Row 7: Password */}
                        <div className="horizontal-form-group">
                            <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                            <div className="form-input-wrapper">
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter password"
                                    className={errors.password ? 'is-invalid' : ''}
                                    disabled={isLoading}
                                />
                                {errors.password && <div className="error-text">{errors.password}</div>}
                            </div>
                        </div>
                    </>
                )}

                <div className="form-buttons">
                    {isITSDataFetched && (
                        <Button variant="primary" onClick={handleSave} disabled={isLoading}>
                            <i className="ri-save-line me-1"></i> {isLoading ? 'Saving...' : 'Save'}
                        </Button>
                    )}
                    <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
                        <i className="ri-arrow-left-line me-1"></i> Back
                    </Button>
                    <Button className="btn-clear" onClick={handleClear} disabled={isLoading}>
                        <i className="ri-refresh-line me-1"></i> Clear
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// EDIT MUMIN COMPONENT - WITH PROPER VALIDATIONS
// ============================================================================
const EditMumin = ({ 
    show, 
    onClose, 
    onUpdate, 
    itsId,
    title = "Edit Mumin"
}) => {
    
    // Form state
    const [formData, setFormData] = useState({
        // ITS API Data (View Only)
        its_id: '',
        full_name: '',
        full_name_arabic: '',
        prefix: '',
        age: null,
        gender: '',
        marital_status: '',
        misaq: false,
        idara: '',
        category: '',
        organization: '',
        email: '',
        mobile: '',
        whatsapp_mobile: '',
        address: '',
        jamaat_id: null,
        jamaat: '',
        jamiaat_id: null,
        jamiaat: '',
        nationality: '',
        vatan: '',
        city: '',
        country: '',
        
        // User Input Data (Editable)
        team_id: null,
        position_id: null,
        role_id: null,
        password: ''
    });

    // Validation errors state
    const [errors, setErrors] = useState({});

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMuminData, setIsLoadingMuminData] = useState(false);
    const [isLoadingTeams, setIsLoadingTeams] = useState(false);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);
    const [isLoadingPositions, setIsLoadingPositions] = useState(false);

    // Options state
    const [teamOptions, setTeamOptions] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);
    const [positionOptions, setPositionOptions] = useState([]);

    // Original data for comparison
    const [originalData, setOriginalData] = useState(null);

    // Auto-close success alert using SweetAlert2
    const showSuccessAlert = (message) => {
        Swal.fire({
            title: 'Success!',
            text: `${message}`,
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

    // Fetch mumin data by ID when component shows
    useEffect(() => {
        if (show && itsId) {
            fetchMuminData(itsId);
            fetchAllRoles();
            fetchAllPositions();
        }
    }, [show, itsId]);

    // Fetch Mumin Data by ITS ID
    const fetchMuminData = async (id) => {
        setIsLoadingMuminData(true);
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Authentication token not found. Please login again.',
                    confirmButtonText: 'OK'
                });
                setIsLoadingMuminData(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Mumin/GetMuminById`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    its_id: id
                })
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

            if (response.ok && result.success && result.data && result.data.length > 0) {
                const muminData = result.data[0];
                
                const teamObj = muminData.team_id ? {
                    value: muminData.team_id,
                    label: muminData.team_name
                } : null;

                const positionObj = muminData.position_id ? {
                    value: muminData.position_id,
                    label: muminData.position_name
                } : null;

                const roleObj = muminData.role_id ? {
                    value: muminData.role_id,
                    label: muminData.role_name
                } : null;

                const initialFormData = {
                    its_id: muminData.its_id || '',
                    full_name: muminData.full_name || '',
                    full_name_arabic: muminData.full_name_arabic || '',
                    prefix: muminData.prefix || '',
                    age: muminData.age || null,
                    gender: muminData.gender || '',
                    marital_status: muminData.marital_status || '',
                    misaq: muminData.misaq || false,
                    idara: muminData.idara || '',
                    category: muminData.category || '',
                    organization: muminData.organization || '',
                    email: muminData.email || '',
                    mobile: muminData.mobile || '',
                    whatsapp_mobile: muminData.whatsapp_mobile || '',
                    address: muminData.address || '',
                    jamaat_id: muminData.jamaat_id || null,
                    jamaat: muminData.jamaat_name || '',
                    jamiaat_id: muminData.jamiaat_id || null,
                    jamiaat: muminData.jamiaat_name || '',
                    nationality: muminData.nationality || '',
                    vatan: muminData.vatan || '',
                    city: muminData.city || '',
                    country: muminData.country || '',
                    team_id: teamObj,
                    position_id: positionObj,
                    role_id: roleObj,
                    password: muminData.password || ''
                };

                setFormData(initialFormData);
                setOriginalData(initialFormData);

                // Fetch teams for the jamiaat
                if (muminData.jamiaat_id) {
                    await fetchTeamsByJamiaat(muminData.jamiaat_id);
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Failed to load mumin data',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error fetching mumin data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error loading mumin data. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoadingMuminData(false);
        }
    };

    // Fetch Roles from API
    const fetchAllRoles = async () => {
        setIsLoadingRoles(true);
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                setIsLoadingRoles(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Mumin/GetAllRoles`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.role_id,
                    label: item.role_name
                }));
                setRoleOptions(options);
            }
        } catch (error) {
            console.error('Error fetching Roles:', error);
        } finally {
            setIsLoadingRoles(false);
        }
    };

    // Fetch Positions from API
    const fetchAllPositions = async () => {
        setIsLoadingPositions(true);
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                setIsLoadingPositions(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Mumin/GetAllPositions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.position_id,
                    label: item.position_name
                }));
                setPositionOptions(options);
            }
        } catch (error) {
            console.error('Error fetching Positions:', error);
        } finally {
            setIsLoadingPositions(false);
        }
    };

    // Fetch Teams based on Jamiaat ID
    const fetchTeamsByJamiaat = async (jamiaatId) => {
        setIsLoadingTeams(true);
        
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                setIsLoadingTeams(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Duty/GetTeamsByJamiaat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    jamiaat_id: jamiaatId
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.team_id,
                    label: item.team_name
                }));
                setTeamOptions(options);
            } else {
                setTeamOptions([]);
            }
        } catch (error) {
            console.error('Error fetching Teams:', error);
            setTeamOptions([]);
        } finally {
            setIsLoadingTeams(false);
        }
    };

    // Handle form input changes (for editable fields)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle Team select change
    const handleTeamChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            team_id: selectedOption
        }));
        
        if (errors.team_id) {
            setErrors(prev => ({
                ...prev,
                team_id: ''
            }));
        }
    };

    // Handle Position select change
    const handlePositionChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            position_id: selectedOption
        }));
        
        if (errors.position_id) {
            setErrors(prev => ({
                ...prev,
                position_id: ''
            }));
        }
    };

    // Handle Role select change
    const handleRoleChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            role_id: selectedOption
        }));
        
        if (errors.role_id) {
            setErrors(prev => ({
                ...prev,
                role_id: ''
            }));
        }
    };

    // Validate form - NOW WITH PROPER VALIDATIONS
    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Validate Team (Required)
        if (!formData.team_id || !formData.team_id.value) {
            newErrors.team_id = 'Team is required';
            isValid = false;
        }

        // Validate Position (Required)
        if (!formData.position_id || !formData.position_id.value) {
            newErrors.position_id = 'Position is required';
            isValid = false;
        }

        // Validate Role (Required)
        if (!formData.role_id || !formData.role_id.value) {
            newErrors.role_id = 'Role is required';
            isValid = false;
        }

        // Password is optional in edit mode - no validation needed
        // User can leave it blank to keep the current password

        setErrors(newErrors);
        return isValid;
    };

    // Check if form has changes
    const hasChanges = () => {
        if (!originalData) return false;

        const teamChanged = formData.team_id?.value !== originalData.team_id?.value;
        const positionChanged = formData.position_id?.value !== originalData.position_id?.value;
        const roleChanged = formData.role_id?.value !== originalData.role_id?.value;
        const passwordChanged = formData.password !== originalData.password;

        return teamChanged || positionChanged || roleChanged || passwordChanged;
    };

    // Handle Update using PUT API
    const handleUpdate = async () => {
        // First validate the form
        if (!validateForm()) {
            // Show validation errors to user
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please fill in all required fields before updating.',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Then check if there are any changes
        if (!hasChanges()) {
            Swal.fire({
                icon: 'info',
                title: 'No Changes',
                text: 'No changes detected to update.',
                confirmButtonText: 'OK'
            });
            return;
        }

        setIsLoading(true);

        try {
            const token = sessionStorage.getItem('access_token');

            if (!token) {
                throw new Error('Authentication token not found. Please login again.');
            }

            const payload = {
                its_id: parseInt(formData.its_id),
                team_id: formData.team_id?.value || null,
                position_id: formData.position_id?.value || null,
                role_id: formData.role_id?.value || null,
                password: formData.password || null
            };

            const response = await fetch(`${API_BASE_URL}/Mumin/UpdateMumin`, {
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
                    title: 'Error',
                    text: 'Session expired. Please login again.',
                    confirmButtonText: 'OK'
                });
                return;
            }

            if (response.ok && result.success) {
                const result_code = Number(result.data?.result_code || 0);
                
                if (result_code === 2) {
                    // Call onUpdate callback before showing alert
                    if (onUpdate) {
                        const dataToUpdate = {
                            its_id: formData.its_id,
                            team_id: formData.team_id,
                            position_id: formData.position_id,
                            role_id: formData.role_id
                        };
                        onUpdate(dataToUpdate);
                    }
                    
                    // Show auto-close success alert
                    showSuccessAlert(result.message || 'Mumin updated successfully!');
                } else if (result_code === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Mumin not found or update failed',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(result.message || 'Failed to update mumin');
                }
            } else {
                throw new Error(result.message || 'Failed to update mumin');
            }
        } catch (error) {
            console.error('Error updating mumin:', error);
            setErrors({ submit: error.message });
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while updating the mumin. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Close
    const handleClose = () => {
        setFormData({
            its_id: '',
            full_name: '',
            full_name_arabic: '',
            prefix: '',
            age: null,
            gender: '',
            marital_status: '',
            misaq: false,
            idara: '',
            category: '',
            organization: '',
            email: '',
            mobile: '',
            whatsapp_mobile: '',
            address: '',
            jamaat_id: null,
            jamaat: '',
            jamiaat_id: null,
            jamiaat: '',
            nationality: '',
            vatan: '',
            city: '',
            country: '',
            team_id: null,
            position_id: null,
            role_id: null,
            password: ''
        });
        setErrors({});
        setOriginalData(null);
        setTeamOptions([]);
        
        if (onClose) {
            onClose();
        }
    };

    // Handle Reset
    const handleReset = () => {
        if (originalData) {
            setFormData({ ...originalData });
            setErrors({});
            Swal.fire({
                icon: 'info',
                title: 'Reset',
                text: 'Form reset to original values',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    // Custom styles for react-select
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '38px',
            borderColor: state.selectProps.error ? '#dc3545' : '#dee2e6',
            '&:hover': {
                borderColor: state.selectProps.error ? '#dc3545' : '#86b7fe'
            }
        }),
        valueContainer: (base) => ({
            ...base,
            minHeight: '38px',
            padding: '2px 8px'
        }),
        input: (base) => ({
            ...base,
            margin: '0',
            padding: '0'
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
            maxHeight: '200px',
            overflowY: 'auto'
        }),
        menuList: (base) => ({
            ...base,
            maxHeight: '200px',
            overflowY: 'auto'
        }),
        menuPortal: (base) => ({ 
            ...base, 
            zIndex: 9999 
        }),
        placeholder: (base) => ({
            ...base,
            color: '#6c757d'
        })
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
                        -webkit-backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1050;
                        animation: fadeIn 0.2s ease;
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
                        width: 90%;
                        max-width: 900px;
                        max-height: 90vh;
                        overflow-y: auto;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                        animation: slideIn 0.3s ease;
                        position: relative;
                    }

                    @media (max-width: 768px) {
                        .modal-form-container {
                            width: 95%;
                            max-width: 100%;
                            padding: 20px;
                            max-height: 95vh;
                        }
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
                    }

                    .horizontal-form-group {
                        display: flex;
                        align-items: flex-start;
                        margin-bottom: 15px;
                    }
                    .horizontal-form-group .form-label {
                        min-width: 150px;
                        margin-bottom: 0;
                        margin-right: 10px;
                        font-weight: 500;
                        text-align: right;
                        white-space: nowrap;
                        padding-top: 8px;
                    }
                    .horizontal-form-group .form-input-wrapper {
                        flex: 1;
                    }

                    .form-row-inline {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 15px;
                    }
                    .form-row-inline .horizontal-form-group {
                        flex: 1;
                        margin-bottom: 0;
                    }

                    .section-divider {
                        margin: 20px 0;
                        padding: 10px 0;
                        border-top: 2px solid #e9ecef;
                        border-bottom: 1px solid #e9ecef;
                    }
                    
                    .section-title {
                        font-size: 16px;
                        font-weight: 600;
                        color: #0d6efd;
                        margin: 0;
                    }

                    @media (max-width: 768px) {
                        .form-row-inline {
                            flex-direction: column;
                            gap: 15px;
                        }
                        
                        .horizontal-form-group {
                            flex-direction: row !important;
                            align-items: flex-start !important;
                        }
                        
                        .horizontal-form-group .form-label {
                            min-width: 120px !important;
                            font-size: 13px;
                            padding-top: 10px;
                        }
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

                    .form-control:disabled, .form-control[readonly] {
                        background-color: #e9ecef;
                        opacity: 1;
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
                `}
            </style>

            <div className="modal-form-container" onClick={(e) => e.stopPropagation()}>
                {/* Loading Overlay */}
                {(isLoading || isLoadingMuminData) && (
                    <div className="loading-overlay">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                <div className="form-title">
                    <span>
                        <i className="ri-edit-line me-2"></i>
                        {title}
                    </span>
                    <button className="close-btn" onClick={handleClose} title="Close" disabled={isLoading || isLoadingMuminData}>
                        &times;
                    </button>
                </div>
                
                {/* Submit Error */}
                {errors.submit && (
                    <div className="submit-error">
                        <i className="ri-error-warning-line"></i>
                        <span>{errors.submit}</span>
                    </div>
                )}

                {/* ITS Data Section (View Only) */}
                <div className="section-divider">
                    <h6 className="section-title">
                        <i className="ri-information-line me-2"></i>
                        Mumin Information (View Only)
                    </h6>
                </div>

                {/* ITS ID */}
                <div className="horizontal-form-group">
                    <Form.Label>ITS ID</Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Control
                            type="text"
                            value={formData.its_id}
                            readOnly
                            disabled
                        />
                    </div>
                </div>

                {/* Row 1: Full Name and Arabic Name */}
                <div className="form-row-inline">
                    <div className="horizontal-form-group">
                        <Form.Label>Full Name</Form.Label>
                        <div className="form-input-wrapper">
                            <Form.Control
                                type="text"
                                value={formData.full_name}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    <div className="horizontal-form-group">
                        <Form.Label>Arabic Name</Form.Label>
                        <div className="form-input-wrapper">
                            <Form.Control
                                type="text"
                                value={formData.full_name_arabic}
                                readOnly
                                disabled
                                style={{ direction: 'rtl' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Row 2: Email and Mobile */}
                <div className="form-row-inline">
                    <div className="horizontal-form-group">
                        <Form.Label>Email</Form.Label>
                        <div className="form-input-wrapper">
                            <Form.Control
                                type="text"
                                value={formData.email}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    <div className="horizontal-form-group">
                        <Form.Label>Mobile</Form.Label>
                        <div className="form-input-wrapper">
                            <Form.Control
                                type="text"
                                value={formData.mobile}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>
                </div>

                {/* Row 3: Jamaat and Jamiaat */}
                <div className="form-row-inline">
                    <div className="horizontal-form-group">
                        <Form.Label>Jamaat</Form.Label>
                        <div className="form-input-wrapper">
                            <Form.Control
                                type="text"
                                value={formData.jamaat}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    <div className="horizontal-form-group">
                        <Form.Label>Jamiaat</Form.Label>
                        <div className="form-input-wrapper">
                            <Form.Control
                                type="text"
                                value={formData.jamiaat}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>
                </div>

                {/* User Input Section (Editable) */}
                <div className="section-divider">
                    <h6 className="section-title">
                        <i className="ri-user-settings-line me-2"></i>
                        Assignment Details (Editable - Required)
                    </h6>
                </div>

                {/* Team */}
                <div className="horizontal-form-group">
                    <Form.Label>Team <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <Select
                            options={teamOptions}
                            value={formData.team_id}
                            onChange={handleTeamChange}
                            placeholder={isLoadingTeams ? "Loading teams..." : "Select team"}
                            isClearable
                            isDisabled={isLoading || isLoadingTeams || isLoadingMuminData}
                            isLoading={isLoadingTeams}
                            styles={selectStyles}
                            error={errors.team_id}
                            noOptionsMessage={() => "No teams available"}
                        />
                        {errors.team_id && <div className="error-text">{errors.team_id}</div>}
                    </div>
                </div>

                {/* Row: Position and Role */}
                <div className="form-row-inline">
                    <div className="horizontal-form-group">
                        <Form.Label>Position <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Select
                                options={positionOptions}
                                value={formData.position_id}
                                onChange={handlePositionChange}
                                placeholder="Select position"
                                isClearable
                                isDisabled={isLoading || isLoadingPositions || isLoadingMuminData}
                                isLoading={isLoadingPositions}
                                styles={selectStyles}
                                error={errors.position_id}
                                noOptionsMessage={() => "No positions available"}
                            />
                            {errors.position_id && <div className="error-text">{errors.position_id}</div>}
                        </div>
                    </div>

                    <div className="horizontal-form-group">
                        <Form.Label>Role <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Select
                                options={roleOptions}
                                value={formData.role_id}
                                onChange={handleRoleChange}
                                placeholder="Select role"
                                isClearable
                                isDisabled={isLoading || isLoadingRoles || isLoadingMuminData}
                                isLoading={isLoadingRoles}
                                styles={selectStyles}
                                error={errors.role_id}
                                noOptionsMessage={() => "No roles available"}
                            />
                            {errors.role_id && <div className="error-text">{errors.role_id}</div>}
                        </div>
                    </div>
                </div>

                {/* Password */}
                <div className="horizontal-form-group">
                    <Form.Label>Password</Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter new password (leave blank to keep current)"
                            className={errors.password ? 'is-invalid' : ''}
                            disabled={isLoading || isLoadingMuminData}
                        />
                        {errors.password && <div className="error-text">{errors.password}</div>}
                        <small className="text-muted">Leave blank to keep current password</small>
                    </div>
                </div>

                <div className="form-buttons">
                    <Button 
                        variant="primary" 
                        onClick={handleUpdate} 
                        disabled={isLoading || !hasChanges() || isLoadingMuminData}
                    >
                        <i className="ri-save-line me-1"></i> {isLoading ? 'Updating...' : 'Update'}
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={handleClose} 
                        disabled={isLoading || isLoadingMuminData}
                    >
                        <i className="ri-arrow-left-line me-1"></i> Back
                    </Button>
                    <Button 
                        className="btn-clear" 
                        onClick={handleReset} 
                        disabled={isLoading || !hasChanges() || isLoadingMuminData}
                    >
                        <i className="ri-refresh-line me-1"></i> Reset
                    </Button>
                </div>
            </div>
        </div>
    );
};

// export default EditMumin;

// ============================================================================
// MUMIN TABLE COMPONENT (MAIN)
// ============================================================================
const MuminTable = () => {
    // State management
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editItsId, setEditItsId] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Force Grid refresh
    const [gridKey, setGridKey] = useState(0);

    // Fetch mumins data from API
    const fetchMumins = async () => {
        try {
            setLoading(true);
            setError(null);

            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const apiUrl = `${API_BASE_URL}/Mumin/GetAllMumin`;

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
                    id: item.its_id,
                    srNo: index + 1,
                    itsId: item.its_id,
                    fullName: item.full_name,
                    email: item.email,
                    mobile: item.mobile,
                    teamName: item.team_name,
                    positionName: item.position_name,
                    jamiaatName: item.jamiaat_name
                }));
                setTableData(transformedData);
            } else {
                throw new Error(result.message || 'Failed to fetch mumins');
            }
        } catch (err) {
            console.error('Error fetching mumins:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchMumins();
    }, []);

    // Total records count
    const totalRecords = tableData.length;

    // Handle Add button click
    const handleAdd = () => {
        setShowAddForm(true);
    };

    // Handle Close Add modal
    const handleCloseAddModal = () => {
        setShowAddForm(false);
    };

    // Handle Close Edit modal
    const handleCloseEditModal = () => {
        setShowEditForm(false);
        setEditItsId(null);
    };

    // Handle Save (for Add)
    const handleSave = (data) => {
        setShowAddForm(false);
        
        // Refresh the table
        fetchMumins();
        
        // Force grid refresh
        setGridKey(prev => prev + 1);
    };

    // Handle Update (for Edit)
    const handleUpdate = (data) => {
        setShowEditForm(false);
        setEditItsId(null);
        
        // Refresh the table
        fetchMumins();
        
        // Force grid refresh
        setGridKey(prev => prev + 1);
    };

    // Handle Edit
    const handleEdit = (itsId) => {
        setEditItsId(itsId);
        setShowEditForm(true);
    };

    // Make functions globally accessible for Grid.js buttons
    useEffect(() => {
        window.handleEditMuminClick = handleEdit;

        return () => {
            delete window.handleEditMuminClick;
        };
    }, [tableData]);

    // ✅ Format data for Grid.js with useMemo
    const gridData = useMemo(() => {
        return tableData.map(item => [
            item.srNo,
            item.itsId,
            item.fullName,
            item.email,
            item.mobile,
            item.teamName,
            item.positionName,
            item.jamiaatName,
            item.itsId
        ]);
    }, [tableData]);

    return (
        <Fragment>
            {/* Custom styles */}
            <style>
                {`
                    /* Search bar styles */
                    #grid-mumin-table .gridjs-search {
                        width: 100%;
                        margin-bottom: 1rem;
                    }
                    #grid-mumin-table .gridjs-search-input {
                        width: 100%;
                        padding: 8px 12px;
                        border: 1px solid #dee2e6;
                        border-radius: 6px;
                        font-size: 14px;
                    }
                    #grid-mumin-table .gridjs-search-input:focus {
                        outline: none;
                        border-color: #0d6efd;
                        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                    }
                    #grid-mumin-table .gridjs-wrapper {
                        margin-top: 0.5rem;
                    }
                    #grid-mumin-table .gridjs-container {
                        padding: 0;
                    }

                    /* Sorting arrow styles */
                    #grid-mumin-table .gridjs-th-sort {
                        position: relative;
                        cursor: pointer;
                    }
                    #grid-mumin-table .gridjs-th-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                    }
                    #grid-mumin-table button.gridjs-sort {
                        background: none;
                        border: none;
                        width: 20px;
                        height: 20px;
                        position: relative;
                        cursor: pointer;
                        float: right;
                        margin-left: 8px;
                    }
                    #grid-mumin-table button.gridjs-sort::before,
                    #grid-mumin-table button.gridjs-sort::after {
                        content: '';
                        position: absolute;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 0;
                        height: 0;
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                    }
                    #grid-mumin-table button.gridjs-sort::before {
                        top: 2px;
                        border-bottom: 6px solid #bbb;
                    }
                    #grid-mumin-table button.gridjs-sort::after {
                        bottom: 2px;
                        border-top: 6px solid #bbb;
                    }
                    #grid-mumin-table button.gridjs-sort-asc::before {
                        border-bottom-color: #333;
                    }
                    #grid-mumin-table button.gridjs-sort-asc::after {
                        border-top-color: #bbb;
                    }
                    #grid-mumin-table button.gridjs-sort-desc::before {
                        border-bottom-color: #bbb;
                    }
                    #grid-mumin-table button.gridjs-sort-desc::after {
                        border-top-color: #333;
                    }
                    #grid-mumin-table .gridjs-sort-neutral,
                    #grid-mumin-table .gridjs-sort-asc,
                    #grid-mumin-table .gridjs-sort-desc {
                        background-image: none !important;
                    }

                    /* Pagination styles */
                    #grid-mumin-table .gridjs-footer {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 0;
                        border-top: 1px solid #e9ecef;
                        margin-top: 1rem;
                    }
                    #grid-mumin-table .gridjs-pagination {
                        display: flex;
                        width: 100%;
                        justify-content: space-between;
                        align-items: center;
                    }
                    #grid-mumin-table .gridjs-summary {
                        order: 1;
                        color: #6c757d;
                        font-size: 14px;
                    }
                    #grid-mumin-table .gridjs-pages {
                        order: 2;
                        display: flex;
                        gap: 5px;
                    }
                    #grid-mumin-table .gridjs-pages button {
                        min-width: 35px;
                        height: 35px;
                        border: 1px solid #dee2e6;
                        background: #fff;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-size: 14px;
                    }
                    #grid-mumin-table .gridjs-pages button:hover:not(:disabled) {
                        background: #e9ecef;
                        border-color: #adb5bd;
                    }
                    #grid-mumin-table .gridjs-pages button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    #grid-mumin-table .gridjs-pages button.gridjs-currentPage {
                        background: var(--primary-color, #0d6efd);
                        color: #fff;
                        border-color: var(--primary-color, #0d6efd);
                    }

                    /* Action buttons spacing */
                    #grid-mumin-table .btn-action-group {
                        display: inline-flex;
                        gap: 10px;
                        align-items: center;
                    }
                    #grid-mumin-table .btn-action-group .btn {
                        margin: 0 !important;
                    }

                    /* Loading and Error styles */
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

            {/* AddMumin Modal - For Creating New Mumins */}
            <AddMumin
                show={showAddForm}
                onClose={handleCloseAddModal}
                onSave={handleSave}
            />

            {/* EditMumin Modal - For Editing Existing Mumins */}
            <EditMumin
                show={showEditForm}
                onClose={handleCloseEditModal}
                onUpdate={handleUpdate}
                itsId={editItsId}
            />

            {/* Main Table */}
            <Row>
                <Col xl={12}>
                    <Card className="custom-card">
                        <Card.Header className="d-flex align-items-center justify-content-between">
                            <div>
                                <Card.Title className="mb-1">
                                    Mumin Master
                                </Card.Title>
                                <span className="badge bg-primary-transparent">
                                    Total Records: {totalRecords}
                                </span>
                            </div>
                            <div>
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
                                    <p className="mt-3">Loading mumins data...</p>
                                </div>
                            ) : error ? (
                                <div className="error-container">
                                    <i className="ri-error-warning-line" style={{ fontSize: '48px' }}></i>
                                    <div className="error-message">
                                        <div className="error-title">⚠️ Error Loading Mumins</div>
                                        <div className="error-details">{error}</div>
                                    </div>
                                    <button 
                                        className="btn btn-primary mt-3" 
                                        onClick={fetchMumins}
                                    >
                                        <i className="ri-refresh-line me-2"></i>
                                        Retry
                                    </button>
                                    <div className="mt-3">
                                        <small className="text-muted">
                                            Check browser console (F12) for more details
                                        </small>
                                    </div>
                                </div>
                            ) : tableData.length === 0 ? (
                                <div className="loading-container">
                                    <i className="ri-inbox-line" style={{ fontSize: '48px' }}></i>
                                    <p className="mt-3">No mumins found</p>
                                    <button 
                                        className="btn btn-primary mt-2" 
                                        onClick={handleAdd}
                                    >
                                        <i className="ri-add-line me-2"></i>
                                        Add First Mumin
                                    </button>
                                </div>
                            ) : (
                                <div id="grid-mumin-table">
                                    <Grid
                                        key={gridKey}
                                        data={gridData}
                                        sort={true}
                                        search={{
                                            enabled: true,
                                            placeholder: 'Search mumins...'
                                        }}
                                        columns={[
                                            { 
                                                name: 'Sr',
                                                width: '60px',
                                                sort: true
                                            }, 
                                            { 
                                                name: 'ITS ID',
                                                width: '100px',
                                                sort: true
                                            }, 
                                            { 
                                                name: 'Full Name',
                                                width: '200px',
                                                sort: true
                                            }, 
                                            { 
                                                name: 'Email',
                                                width: '180px',
                                                sort: true
                                            }, 
                                            { 
                                                name: 'Mobile',
                                                width: '130px',
                                                sort: true
                                            },
                                            { 
                                                name: 'Team',
                                                width: '150px',
                                                sort: true
                                            },
                                            { 
                                                name: 'Position',
                                                width: '120px',
                                                sort: true
                                            },
                                            { 
                                                name: 'Jamiaat',
                                                width: '120px',
                                                sort: true
                                            },
                                            {
                                                name: 'Action',
                                                width: '100px',
                                                sort: true,
                                                formatter: (cell) => html(`
                                                    <div class="btn-action-group">
                                                        <button 
                                                            class="btn btn-sm btn-info-transparent btn-icon btn-wave" 
                                                            title="Edit"
                                                            onclick="handleEditMuminClick(${cell})"
                                                        >
                                                            <i class="ri-edit-line"></i>
                                                        </button>
                                                    </div>
                                                `)
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

export default MuminTable;