import { Fragment, useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Form, Button } from 'react-bootstrap';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
import IconButton from '../../elements/button'; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';


// API Base URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const AddVenue = ({ 
    show,
    onClose,
    onSave,
    title = "Add New Venue"
}) => {
    
    // Form state
    const [formData, setFormData] = useState({
        venueName: ''
    });

    // Validation errors state
    const [errors, setErrors] = useState({
        venueName: ''
    });

    // Loading states
    const [isLoading, setIsLoading] = useState(false);

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

    // Reset form when modal shows
    useEffect(() => {
        if (show) {
            handleClear();
        }
    }, [show]);

    // Handle form input changes
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

    // Validate form
    const validateForm = () => {
        const newErrors = {
            venueName: ''
        };

        let isValid = true;

        if (!formData.venueName.trim()) {
            newErrors.venueName = 'Venue name is required';
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
                venue_name: formData.venueName.trim()
            };
            
            const response = await fetch(`${API_BASE_URL}/Venue/InsertVenue`, {
                method: 'POST',
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
                
                if (resultCode === 1) {
                    // Call onSave callback before showing alert
                    if (onSave) {
                        const dataToSave = {
                            venueName: formData.venueName
                        };
                        onSave(dataToSave);
                    }
                    
                    // Show auto-close success alert
                    showSuccessAlert(result.message || 'Venue added successfully!');
                } else if (resultCode === 4) {
                    setErrors(prev => ({
                        ...prev,
                        venueName: 'Venue name already exists'
                    }));
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Venue name already exists',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(result.message || 'Failed to add venue');
                }
            } else {
                throw new Error(result.message || 'Failed to add venue');
            }
        } catch (error) {
            console.error('Error saving venue:', error);
            setErrors({ submit: error.message });
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while saving the venue. Please try again.',
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
            venueName: ''
        });
        setErrors({
            venueName: ''
        });
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
                        max-width: 500px;
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
                        min-width: 120px;
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

                    @media (max-width: 768px) {
                        .horizontal-form-group {
                            flex-direction: row !important;
                            align-items: flex-start !important;
                        }
                        
                        .horizontal-form-group .form-label {
                            min-width: 100px !important;
                            font-size: 13px;
                            padding-top: 10px;
                        }
                        
                        .modal-form-container .form-title {
                            font-size: 18px;
                        }
                        
                        .modal-form-container .form-title .close-btn {
                            font-size: 20px;
                        }
                        
                        .form-buttons {
                            flex-wrap: wrap;
                            gap: 8px !important;
                        }
                        
                        .form-buttons .btn {
                            flex: 1;
                            min-width: calc(50% - 4px);
                            font-size: 13px;
                            padding: 8px 12px;
                        }
                        
                        .form-buttons .btn i {
                            font-size: 14px;
                        }
                    }

                    @media (max-width: 480px) {
                        .modal-form-container {
                            padding: 15px;
                        }
                        
                        .horizontal-form-group .form-label {
                            min-width: 85px !important;
                            font-size: 12px;
                        }
                        
                        .form-control, 
                        .form-control::placeholder {
                            font-size: 13px;
                        }
                        
                        .error-text {
                            font-size: 11px;
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
                {isLoading && (
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

                {/* Venue Name Field */}
                <div className="horizontal-form-group">
                    <Form.Label>Venue Name <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Control
                            type="text"
                            name="venueName"
                            value={formData.venueName}
                            onChange={handleInputChange}
                            placeholder="Enter venue name"
                            className={errors.venueName ? 'is-invalid' : ''}
                            disabled={isLoading}
                        />
                        {errors.venueName && <div className="error-text">{errors.venueName}</div>}
                    </div>
                </div>

                <div className="form-buttons">
                    <Button variant="primary" onClick={handleSave} disabled={isLoading}>
                        <i className="ri-save-line me-1"></i> {isLoading ? 'Saving...' : 'Save'}
                    </Button>
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


const EditVenue = ({ 
    show, 
    onClose, 
    onUpdate, 
    venueId,
    title = "Edit Venue"
}) => {
    
    // Form state
    const [formData, setFormData] = useState({
        venueName: ''
    });

    // Validation errors state
    const [errors, setErrors] = useState({
        venueName: ''
    });

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingVenueData, setIsLoadingVenueData] = useState(false);

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

    // Fetch venue data by ID when component shows
    useEffect(() => {
        if (show && venueId) {
            fetchVenueData(venueId);
        }
    }, [show, venueId]);

    // Fetch Venue Data by ID
    const fetchVenueData = async (id) => {
        setIsLoadingVenueData(true);
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Authentication token not found. Please login again.',
                    confirmButtonText: 'OK'
                });
                setIsLoadingVenueData(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Venue/GetVenueById`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    venue_id: id
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
                const venueData = result.data[0];
                
                const initialFormData = {
                    venueName: venueData.venue_name || ''
                };

                setFormData(initialFormData);
                setOriginalData(initialFormData);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Failed to load venue data',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error fetching venue data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error loading venue data. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoadingVenueData(false);
        }
    };

    // Handle form input changes
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

    // Validate form
    const validateForm = () => {
        const newErrors = {
            venueName: ''
        };

        let isValid = true;

        if (!formData.venueName.trim()) {
            newErrors.venueName = 'Venue name is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Check if form has changes
    const hasChanges = () => {
        if (!originalData) return false;
        return formData.venueName !== originalData.venueName;
    };

    // Handle Update using PUT API
    const handleUpdate = async () => {
        if (!validateForm()) {
            return;
        }

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
                venue_id: venueId,
                venue_name: formData.venueName.trim()
            };

            const response = await fetch(`${API_BASE_URL}/Venue/UpdateVenue`, {
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
                const resultCode = Number(result.data?.result_code);
                
                if (resultCode === 2) {
                    // Call onUpdate callback before showing alert
                    if (onUpdate) {
                        const dataToUpdate = {
                            venue_id: venueId,
                            venueName: formData.venueName
                        };
                        onUpdate(dataToUpdate);
                    }
                    
                    // Show auto-close success alert
                    showSuccessAlert(result.message || 'Venue updated successfully!');
                } else if (resultCode === 4) {
                    setErrors(prev => ({
                        ...prev,
                        venueName: 'Venue name already exists'
                    }));
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Venue name already exists',
                        confirmButtonText: 'OK'
                    });
                } else if (resultCode === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Venue not found or update failed',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(result.message || 'Failed to update venue');
                }
            } else {
                throw new Error(result.message || 'Failed to update venue');
            }
        } catch (error) {
            console.error('Error updating venue:', error);
            setErrors({ submit: error.message });
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while updating the venue. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Close
    const handleClose = () => {
        setFormData({
            venueName: ''
        });
        setErrors({
            venueName: ''
        });
        setOriginalData(null);
        
        if (onClose) {
            onClose();
        }
    };

    // Handle Reset
    const handleReset = () => {
        if (originalData) {
            setFormData({ ...originalData });
            setErrors({
                venueName: ''
            });
            Swal.fire({
                icon: 'info',
                title: 'Reset',
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
                        max-width: 500px;
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
                        min-width: 120px;
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

                    @media (max-width: 768px) {
                        .horizontal-form-group {
                            flex-direction: row !important;
                            align-items: flex-start !important;
                        }
                        
                        .horizontal-form-group .form-label {
                            min-width: 100px !important;
                            font-size: 13px;
                            padding-top: 10px;
                        }
                        
                        .modal-form-container .form-title {
                            font-size: 18px;
                        }
                        
                        .modal-form-container .form-title .close-btn {
                            font-size: 20px;
                        }
                        
                        .form-buttons {
                            flex-wrap: wrap;
                            gap: 8px !important;
                        }
                        
                        .form-buttons .btn {
                            flex: 1;
                            min-width: calc(50% - 4px);
                            font-size: 13px;
                            padding: 8px 12px;
                        }
                        
                        .form-buttons .btn i {
                            font-size: 14px;
                        }
                    }

                    @media (max-width: 480px) {
                        .modal-form-container {
                            padding: 15px;
                        }
                        
                        .horizontal-form-group .form-label {
                            min-width: 85px !important;
                            font-size: 12px;
                        }
                        
                        .form-control, 
                        .form-control::placeholder {
                            font-size: 13px;
                        }
                        
                        .error-text {
                            font-size: 11px;
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
                {(isLoading || isLoadingVenueData) && (
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
                    <button className="close-btn" onClick={handleClose} title="Close" disabled={isLoading || isLoadingVenueData}>
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

                {/* Venue Name Field */}
                <div className="horizontal-form-group">
                    <Form.Label>Venue Name <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Control
                            type="text"
                            name="venueName"
                            value={formData.venueName}
                            onChange={handleInputChange}
                            placeholder="Enter venue name"
                            className={errors.venueName ? 'is-invalid' : ''}
                            disabled={isLoading || isLoadingVenueData}
                        />
                        {errors.venueName && <div className="error-text">{errors.venueName}</div>}
                    </div>
                </div>

                <div className="form-buttons">
                    <Button 
                        variant="primary" 
                        onClick={handleUpdate} 
                        disabled={isLoading || !hasChanges() || isLoadingVenueData}
                    >
                        <i className="ri-save-line me-1"></i> {isLoading ? 'Updating...' : 'Update'}
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={handleClose} 
                        disabled={isLoading || isLoadingVenueData}
                    >
                        <i className="ri-arrow-left-line me-1"></i> Back
                    </Button>
                    <Button 
                        className="btn-clear" 
                        onClick={handleReset} 
                        disabled={isLoading || !hasChanges() || isLoadingVenueData}
                    >
                        <i className="ri-refresh-line me-1"></i> Reset
                    </Button>
                </div>
            </div>
        </div>
    );
};


const VenueTable = () => {
    // State management
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editVenueId, setEditVenueId] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Force Grid refresh
    const [gridKey, setGridKey] = useState(0);

    // Fetch venues data from API
    const fetchVenues = async () => {
        try {
            setLoading(true);
            setError(null);

            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const apiUrl = `${API_BASE_URL}/Venue/GetAllVenues`;

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
                    id: item.venue_id,
                    srNo: index + 1,
                    venueName: item.venue_name
                }));
                setTableData(transformedData);
            } else {
                throw new Error(result.message || 'Failed to fetch venues');
            }
        } catch (err) {
            console.error('Error fetching venues:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchVenues();
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
        setEditVenueId(null);
    };

    // Handle Save (for Add)
    const handleSave = (data) => {
        setShowAddForm(false);
        
        // Refresh the table
        fetchVenues();
        
        // Force grid refresh
        setGridKey(prev => prev + 1);
    };

    // Handle Update (for Edit)
    const handleUpdate = (data) => {
        setShowEditForm(false);
        setEditVenueId(null);
        
        // Optimistic update - update the specific row in the table
        setTableData(prevData => {
            return prevData.map(item => {
                if (item.id === data.venue_id) {
                    return {
                        ...item,
                        venueName: data.venueName
                    };
                }
                return item;
            });
        });
        
        // Force grid refresh
        setGridKey(prev => prev + 1);
        
        // Background sync with server
        setTimeout(() => {
            fetchVenues();
        }, 500);
    };

    // Handle Edit
    const handleEdit = (id) => {
        setEditVenueId(id);
        setShowEditForm(true);
    };

    // Handle Delete with SweetAlert2 confirmation
    const handleDelete = async (id) => {
        // Find the venue to get its name
        const venueToDelete = tableData.find(item => item.id === id);
        const venueName = venueToDelete ? venueToDelete.venueName : 'this venue';
        
        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${venueName}".`,
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

            const response = await fetch(`${API_BASE_URL}/Venue/DeleteVenue`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    venue_id: id
                })
            });

            const apiResult = await response.json();
            
            if (response.ok && apiResult.success) {
                const resultCode = Number(apiResult.data?.result_code);
                
                if (resultCode === 3) {
                    // Success
                    Swal.fire({
                        title: 'Deleted!',
                        text: apiResult.message || 'Venue has been deleted successfully.',
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: false,
                        showConfirmButton: false
                    });

                    // Optimistic update - instant UI change
                    setTableData(prevData => {
                        const filtered = prevData.filter(item => item.id !== id);
                        // Recalculate serial numbers
                        return filtered.map((item, index) => ({
                            ...item,
                            srNo: index + 1
                        }));
                    });
                    
                    // Force Grid to re-render
                    setGridKey(prev => prev + 1);
                    
                    // Background sync with server
                    setTimeout(async () => {
                        try {
                            await fetchVenues();
                        } catch (error) {
                            console.error('Background sync failed:', error);
                        }
                    }, 500);

                } else if (resultCode === 0) {
                    // Failure - Venue not found or already deleted
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed',
                        text: 'Venue not found or already deleted',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(apiResult.message || 'Failed to delete venue');
                }
            } else {
                throw new Error(apiResult.message || `Server error: ${response.status}`);
            }

        } catch (error) {
            console.error('Error deleting venue:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while deleting',
                confirmButtonText: 'OK'
            });
        }
    };

    // Make functions globally accessible for Grid.js buttons
    useEffect(() => {
        window.handleEditClick = handleEdit;
        window.handleDeleteClick = handleDelete;

        return () => {
            delete window.handleEditClick;
            delete window.handleDeleteClick;
        };
    }, [tableData]);

    // Format data for Grid.js with useMemo
    const gridData = useMemo(() => {
        return tableData.map(item => [
            item.srNo,
            item.venueName,
            item.id
        ]);
    }, [tableData]);

    return (
        <Fragment>
            {/* Custom styles */}
            <style>
                {`
                    /* Search bar styles */
                    #grid-venue-table .gridjs-search {
                        width: 100%;
                        margin-bottom: 1rem;
                    }
                    #grid-venue-table .gridjs-search-input {
                        width: 100%;
                        padding: 8px 12px;
                        border: 1px solid #dee2e6;
                        border-radius: 6px;
                        font-size: 14px;
                    }
                    #grid-venue-table .gridjs-search-input:focus {
                        outline: none;
                        border-color: #0d6efd;
                        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                    }
                    #grid-venue-table .gridjs-wrapper {
                        margin-top: 0.5rem;
                    }
                    #grid-venue-table .gridjs-container {
                        padding: 0;
                    }

                    /* Sorting arrow styles */
                    #grid-venue-table .gridjs-th-sort {
                        position: relative;
                        cursor: pointer;
                    }
                    #grid-venue-table .gridjs-th-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                    }
                    #grid-venue-table button.gridjs-sort {
                        background: none;
                        border: none;
                        width: 20px;
                        height: 20px;
                        position: relative;
                        cursor: pointer;
                        float: right;
                        margin-left: 8px;
                    }
                    #grid-venue-table button.gridjs-sort::before,
                    #grid-venue-table button.gridjs-sort::after {
                        content: '';
                        position: absolute;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 0;
                        height: 0;
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                    }
                    #grid-venue-table button.gridjs-sort::before {
                        top: 2px;
                        border-bottom: 6px solid #bbb;
                    }
                    #grid-venue-table button.gridjs-sort::after {
                        bottom: 2px;
                        border-top: 6px solid #bbb;
                    }
                    #grid-venue-table button.gridjs-sort-asc::before {
                        border-bottom-color: #333;
                    }
                    #grid-venue-table button.gridjs-sort-asc::after {
                        border-top-color: #bbb;
                    }
                    #grid-venue-table button.gridjs-sort-desc::before {
                        border-bottom-color: #bbb;
                    }
                    #grid-venue-table button.gridjs-sort-desc::after {
                        border-top-color: #333;
                    }
                    #grid-venue-table .gridjs-sort-neutral,
                    #grid-venue-table .gridjs-sort-asc,
                    #grid-venue-table .gridjs-sort-desc {
                        background-image: none !important;
                    }

                    /* Pagination styles */
                    #grid-venue-table .gridjs-footer {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 0;
                        border-top: 1px solid #e9ecef;
                        margin-top: 1rem;
                    }
                    #grid-venue-table .gridjs-pagination {
                        display: flex;
                        width: 100%;
                        justify-content: space-between;
                        align-items: center;
                    }
                    #grid-venue-table .gridjs-summary {
                        order: 1;
                        color: #6c757d;
                        font-size: 14px;
                    }
                    #grid-venue-table .gridjs-pages {
                        order: 2;
                        display: flex;
                        gap: 5px;
                    }
                    #grid-venue-table .gridjs-pages button {
                        min-width: 35px;
                        height: 35px;
                        border: 1px solid #dee2e6;
                        background: #fff;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-size: 14px;
                    }
                    #grid-venue-table .gridjs-pages button:hover:not(:disabled) {
                        background: #e9ecef;
                        border-color: #adb5bd;
                    }
                    #grid-venue-table .gridjs-pages button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    #grid-venue-table .gridjs-pages button.gridjs-currentPage {
                        background: var(--primary-color, #0d6efd);
                        color: #fff;
                        border-color: var(--primary-color, #0d6efd);
                    }

                    /* Action buttons spacing */
                    #grid-venue-table .btn-action-group {
                        display: inline-flex;
                        gap: 10px;
                        align-items: center;
                    }
                    #grid-venue-table .btn-action-group .btn {
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

            {/* AddVenue Modal - For Creating New Venues */}
            <AddVenue
                show={showAddForm}
                onClose={handleCloseAddModal}
                onSave={handleSave}
            />

            {/* EditVenue Modal - For Editing Existing Venues */}
            <EditVenue
                show={showEditForm}
                onClose={handleCloseEditModal}
                onUpdate={handleUpdate}
                venueId={editVenueId}
            />

            {/* Main Table */}
            <Row>
                <Col xl={12}>
                    <Card className="custom-card">
                        <Card.Header className="d-flex align-items-center justify-content-between">
                            <div>
                                <Card.Title className="mb-1">
                                    Venue Master
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
                                    <p className="mt-3">Loading venue data...</p>
                                </div>
                            ) : error ? (
                                <div className="error-container">
                                    <i className="ri-error-warning-line" style={{ fontSize: '48px' }}></i>
                                    <div className="error-message">
                                        <div className="error-title">⚠️ Error Loading Venues</div>
                                        <div className="error-details">{error}</div>
                                    </div>
                                    <button 
                                        className="btn btn-primary mt-3" 
                                        onClick={fetchVenues}
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
                                    <p className="mt-3">No venues found</p>
                                    <button 
                                        className="btn btn-primary mt-2" 
                                        onClick={handleAdd}
                                    >
                                        <i className="ri-add-line me-2"></i>
                                        Add First Venue
                                    </button>
                                </div>
                            ) : (
                                <div id="grid-venue-table">
                                    <Grid
                                        key={gridKey}
                                        data={gridData}
                                        sort={true}
                                        search={{
                                            enabled: true,
                                            placeholder: 'Search venues...'
                                        }}
                                        columns={[
                                            { 
                                                name: 'Sr',
                                                width: '100px',
                                                sort: true
                                            }, 
                                            { 
                                                name: 'Venue Name',
                                                width: '300px',
                                                sort: true
                                            }, 
                                            {
                                                name: 'Action',
                                                width: '150px',
                                                sort: true,
                                                formatter: (cell) => html(`
                                                    <div class="btn-action-group">
                                                        <button 
                                                            class="btn btn-sm btn-info-transparent btn-icon btn-wave" 
                                                            title="Edit"
                                                            onclick="handleEditClick(${cell})"
                                                        >
                                                            <i class="ri-edit-line"></i>
                                                        </button>
                                                        <button 
                                                            class="btn btn-sm btn-danger-transparent btn-icon btn-wave" 
                                                            title="Delete"
                                                            onclick="handleDeleteClick(${cell})"
                                                        >
                                                            <i class="ri-delete-bin-line"></i>
                                                        </button>
                                                    </div>
                                                `)
                                            }
                                        ]} 
                                        pagination={{
                                            limit: 5,
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


export default VenueTable;