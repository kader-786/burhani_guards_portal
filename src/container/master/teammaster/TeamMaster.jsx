import { Fragment, useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Form, Button,Modal, Spinner } from 'react-bootstrap';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
import Select from 'react-select';
import IconButton from '../../elements/button'; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';


// API Base URL Configuration
// const API_BASE_URL = 'http://13.204.161.209:8080/BURHANI_GUARDS_API_TEST/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;




const AddJamaat = ({ 
    show,
    onClose,
    onSave,
    editData = null,
    title = "Add New Team"
}) => {
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        jamiaat: null,
        jamaat: []
    });

    // Validation errors state
    const [errors, setErrors] = useState({
        name: '',
        jamiaat: '',
        jamaat: ''
    });

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingJamiaats, setIsLoadingJamiaats] = useState(false);
    const [isLoadingJamaats, setIsLoadingJamaats] = useState(false);

    // Options state
    const [jamiaatOptions, setJamiaatOptions] = useState([]);
    const [jamaatOptions, setJamaatOptions] = useState([]);

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

    // Fetch all Jamiaats on component mount
    useEffect(() => {
        if (show) {
            fetchAllJamiaats();
        }
    }, [show]);

    // Fetch Jamiaats from API
    const fetchAllJamiaats = async () => {
        setIsLoadingJamiaats(true);
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                setIsLoadingJamiaats(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Team/GetAllJamiaats`, {
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
                    value: item.jamiaat_id,
                    label: item.jamiaat_name
                }));
                setJamiaatOptions(options);
            } else {
                toast.error(result.message || 'Failed to load Jamiaats');
            }
        } catch (error) {
            console.error('Error fetching Jamiaats:', error);
            toast.error('Error loading Jamiaats. Please try again.');
        } finally {
            setIsLoadingJamiaats(false);
        }
    };

    // Fetch Jamaats based on selected Jamiaat
    const fetchJamaatsByJamiaat = async (jamiaatId) => {
        setIsLoadingJamaats(true);
        setJamaatOptions([]);
        
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                setIsLoadingJamaats(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Team/GetAllJamaatsByJamiaat`, {
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
                    value: item.jamaat_id,
                    label: item.jamaat_name
                }));
                setJamaatOptions(options);
            } else {
                toast.error(result.message || 'Failed to load Jamaats for selected Jamiaat');
                setJamaatOptions([]);
            }
        } catch (error) {
            console.error('Error fetching Jamaats:', error);
            toast.error('Error loading Jamaats. Please try again.');
            setJamaatOptions([]);
        } finally {
            setIsLoadingJamaats(false);
        }
    };

    // Populate form when editing
    useEffect(() => {
        if (editData && show) {
            setFormData({
                name: editData.name || '',
                jamiaat: editData.jamiaat || null,
                jamaat: editData.jamaat || []
            });
            setErrors({ name: '', jamiaat: '', jamaat: '' });
            
            if (editData.jamiaat?.value) {
                fetchJamaatsByJamiaat(editData.jamiaat.value);
            }
        } else if (!editData && show) {
            handleClear();
        }
    }, [editData, show]);

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

    // Handle Jamiaat select change
    const handlejamiaatChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            jamiaat: selectedOption,
            jamaat: []
        }));
        
        if (errors.jamiaat) {
            setErrors(prev => ({
                ...prev,
                jamiaat: ''
            }));
        }
        
        if (selectedOption?.value) {
            fetchJamaatsByJamiaat(selectedOption.value);
        } else {
            setJamaatOptions([]);
        }
    };

    // Handle Jamaat select change
    const handleJamaatChange = (selectedOptions) => {
        setFormData(prev => ({
            ...prev,
            jamaat: selectedOptions || []
        }));
        if (errors.jamaat) {
            setErrors(prev => ({
                ...prev,
                jamaat: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {
            name: '',
            jamiaat: '',
            jamaat: ''
        };

        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        if (!formData.jamiaat) {
            newErrors.jamiaat = 'Jamiaat is required';
            isValid = false;
        }

        if (!formData.jamaat || formData.jamaat.length === 0) {
            newErrors.jamaat = 'At least one Jamaat must be selected';
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
                team_name: formData.name.trim(),
                jamiaat_id: formData.jamiaat.value,
                jamaat_ids: formData.jamaat.map(j => j.value)
            };
            
            const response = await fetch(`${API_BASE_URL}/Team/InsertTeam`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            const raw_code = result.data.result_code
            const result_code = Number(raw_code)
            
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
                if (result_code === 1) {
                    // Call onSave callback before showing alert
                    if (onSave) {
                        const dataToSave = {
                            name: formData.name,
                            jamiaatId: formData.jamiaat.value,
                            jamiaatName: formData.jamiaat.label,
                            jamaatIds: formData.jamaat.map(j => j.value),
                            jamaatNames: formData.jamaat.map(j => j.label),
                            jamiaat: formData.jamiaat,
                            jamaat: formData.jamaat
                        };
                        onSave(dataToSave);
                    }
                    
                    // Show auto-close success alert
                    showSuccessAlert(result.message || 'Team added successfully!');
                } else if (result.data?.result_code === 4) {
                    setErrors(prev => ({
                        ...prev,
                        name: 'Team name already exists'
                    }));
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Team name already exists',
                        confirmButtonText: 'OK'
                    });
                } else if (result.data?.result_code === 5) {
                    setErrors(prev => ({
                        ...prev,
                        jamaat: 'No jamaat IDs provided'
                    }));
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Please select at least one Jamaat',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(result.message || 'Failed to add team');
                }
            } else {
                throw new Error(result.message || 'Failed to add team');
            }
        } catch (error) {
            console.error('Error saving team:', error);
            setErrors({ submit: error.message });
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while saving the team. Please try again.',
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
            name: '',
            jamiaat: null,
            jamaat: []
        });
        setErrors({
            name: '',
            jamiaat: '',
            jamaat: ''
        });
        setJamaatOptions([]);
    };

    // Custom styles for react-select
    // const selectStyles = {
    //     control: (base, state) => ({
    //         ...base,
    //         minHeight: '38px',
    //         borderColor: state.selectProps.error ? '#dc3545' : '#dee2e6',
    //         '&:hover': {
    //             borderColor: state.selectProps.error ? '#dc3545' : '#86b7fe'
    //         }
    //     }),
    //     valueContainer: (base) => ({
    //         ...base,
    //         minHeight: '38px',
    //         padding: '2px 8px',
    //         maxHeight: '120px',
    //         overflowY: 'auto'
    //     }),
    //     input: (base) => ({
    //         ...base,
    //         margin: '0',
    //         padding: '0'
    //     }),
    //     indicatorsContainer: (base) => ({
    //         ...base,
    //         alignSelf: 'flex-start',
    //         paddingTop: '8px'
    //     }),
    //     menu: (base) => ({
    //         ...base,
    //         zIndex: 9999
    //     }),
    //     menuList: (base) => ({
    //         ...base,
    //         maxHeight: '380px', // 38px per option x 10 options
    //         overflowY: 'auto'
    //     }),
    //     placeholder: (base) => ({
    //         ...base,
    //         color: '#6c757d'
    //     }),
    //     multiValue: (base) => ({
    //         ...base,
    //         backgroundColor: '#e7f1ff',
    //         borderRadius: '0.25rem',
    //         margin: '2px'
    //     }),
    //     multiValueLabel: (base) => ({
    //         ...base,
    //         color: '#0d6efd',
    //         fontSize: '0.875rem',
    //         padding: '3px 6px'
    //     }),
    //     multiValueRemove: (base) => ({
    //         ...base,
    //         color: '#0d6efd',
    //         borderRadius: '0 0.25rem 0.25rem 0',
    //         '&:hover': {
    //             backgroundColor: '#0d6efd',
    //             color: '#fff',
    //         }
    //     })
    // };

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
        padding: '2px 8px',
        maxHeight: '120px',
        overflowY: 'auto'
    }),
    input: (base) => ({
        ...base,
        margin: '0',
        padding: '0'
    }),
    indicatorsContainer: (base) => ({
        ...base,
        alignSelf: 'flex-start',
        paddingTop: '8px'
    }),
    menu: (base) => ({
        ...base,
        zIndex: 9999,
        maxHeight: '200px', // Limit menu height
        overflowY: 'auto'
    }),
    menuList: (base) => ({
        ...base,
        maxHeight: '200px', // Match with menu maxHeight
        overflowY: 'auto'
    }),
    menuPortal: (base) => ({ 
        ...base, 
        zIndex: 9999 
    }),
    placeholder: (base) => ({
        ...base,
        color: '#6c757d'
    }),
    multiValue: (base) => ({
        ...base,
        backgroundColor: '#e7f1ff',
        borderRadius: '0.25rem',
        margin: '2px'
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: '#0d6efd',
        fontSize: '0.875rem',
        padding: '3px 6px'
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: '#0d6efd',
        borderRadius: '0 0.25rem 0.25rem 0',
        '&:hover': {
            backgroundColor: '#0d6efd',
            color: '#fff',
        }
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
                        max-width: 700px;
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

                    .form-row-inline {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 15px;
                    }
                    .form-row-inline .horizontal-form-group {
                        flex: 1;
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
                        <i className={`ri-${editData ? 'edit' : 'add-circle'}-line me-2`}></i>
                        {editData ? 'Edit Team' : title}
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

                {/* Row 1: Team Name and Jamiaat */}
                <div className="form-row-inline">
                    <div className="horizontal-form-group">
                        <Form.Label>Team Name <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter team name"
                                className={errors.name ? 'is-invalid' : ''}
                                disabled={isLoading}
                            />
                            {errors.name && <div className="error-text">{errors.name}</div>}
                        </div>
                    </div>

                    <div className="horizontal-form-group">
                        <Form.Label>Jamiaat <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Select
                                options={jamiaatOptions}
                                value={formData.jamiaat}
                                onChange={handlejamiaatChange}
                                placeholder="Select jamiaat"
                                isClearable
                                isDisabled={isLoading || isLoadingJamiaats}
                                isLoading={isLoadingJamiaats}
                                styles={selectStyles}
                                error={errors.jamiaat}
                                noOptionsMessage={() => "No jamiaats available"}
                            />
                            {errors.jamiaat && <div className="error-text">{errors.jamiaat}</div>}
                        </div>
                    </div>
                </div>

                {/* Row 2: Jamaat (Full Width) */}
                <div className="form-row-inline">
                    <div className="horizontal-form-group" style={{ width: '100%' }}>
                        <Form.Label>Jamaat <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Select
                                options={jamaatOptions}
                                value={formData.jamaat}
                                onChange={handleJamaatChange}
                                placeholder={
                                    !formData.jamiaat 
                                        ? "First select a jamiaat" 
                                        : isLoadingJamaats 
                                            ? "Loading jamaats..." 
                                            : "Select jamaat (multiple)"
                                }
                                isMulti
                                isClearable
                                isDisabled={isLoading || !formData.jamiaat || isLoadingJamaats}
                                isLoading={isLoadingJamaats}
                                styles={selectStyles}
                                error={errors.jamaat}
                                noOptionsMessage={() => 
                                    !formData.jamiaat 
                                        ? "Please select a jamiaat first" 
                                        : "No jamaats available for selected jamiaat"
                                }
                            />
                            {errors.jamaat && <div className="error-text">{errors.jamaat}</div>}
                        </div>
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



const EditJamaat = ({ 
    show, 
    onClose, 
    onUpdate, 
    teamId,
    title = "Edit Team"
}) => {
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        jamiaat: null,
        jamaat: []
    });

    // Validation errors state
    const [errors, setErrors] = useState({
        name: '',
        jamiaat: '',
        jamaat: ''
    });

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTeamData, setIsLoadingTeamData] = useState(false);
    const [isLoadingJamiaats, setIsLoadingJamiaats] = useState(false);
    const [isLoadingJamaats, setIsLoadingJamaats] = useState(false);

    // Options state
    const [jamiaatOptions, setJamiaatOptions] = useState([]);
    const [jamaatOptions, setJamaatOptions] = useState([]);

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

    // Fetch team data by ID when component shows
    useEffect(() => {
        if (show && teamId) {
            fetchTeamData(teamId);
            fetchAllJamiaats();
        }
    }, [show, teamId]);

    // Fetch Team Data by ID
    const fetchTeamData = async (id) => {
        setIsLoadingTeamData(true);
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Authentication token not found. Please login again.',
                    confirmButtonText: 'OK'
                });
                setIsLoadingTeamData(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Team/GetTeamById`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    team_id: id
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
                const teamData = result.data[0];
                
                const jamiaatObj = {
                    value: teamData.jamiaat_id,
                    label: teamData.jamiaat_name
                };

                const initialFormData = {
                    name: teamData.team_name || '',
                    jamiaat: jamiaatObj,
                    jamaat: [] // Will be populated by fetchJamaatsByJamiaat
                };

                setFormData(initialFormData);
                setOriginalData(initialFormData);

                // Fetch jamaats for the selected jamiaat and then load team's jamaats
                if (teamData.jamiaat_id) {
                    await fetchJamaatsByJamiaat(teamData.jamiaat_id, teamData.team_id);
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Failed to load team data',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error fetching team data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error loading team data. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoadingTeamData(false);
        }
    };

    // Fetch all Jamiaats
    const fetchAllJamiaats = async () => {
        setIsLoadingJamiaats(true);
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                setIsLoadingJamiaats(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Team/GetAllJamiaats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.jamiaat_id,
                    label: item.jamiaat_name
                }));
                setJamiaatOptions(options);
            }
        } catch (error) {
            console.error('Error fetching Jamiaats:', error);
        } finally {
            setIsLoadingJamiaats(false);
        }
    };

    // Fetch Jamaats based on selected Jamiaat and prefill selected jamaats for the team
    const fetchJamaatsByJamiaat = async (jamiaatId, currentTeamId = null) => {
        setIsLoadingJamaats(true);
        
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                setIsLoadingJamaats(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Team/GetAllJamaatsByJamiaat`, {
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
                    value: item.jamaat_id,
                    label: item.jamaat_name
                }));
                setJamaatOptions(options);

                // If loading initial team data, fetch and prefill selected jamaats
                if (currentTeamId) {
                    await fetchTeamJamaats(currentTeamId);
                }
            } else {
                setJamaatOptions([]);
            }
        } catch (error) {
            console.error('Error fetching Jamaats:', error);
            setJamaatOptions([]);
        } finally {
            setIsLoadingJamaats(false);
        }
    };

    // Fetch jamaats associated with the team (for prefilling)
    const fetchTeamJamaats = async (teamId) => {
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Team/GetJamaatsByTeamId`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    team_id: teamId
                })
            });

            const result = await response.json();

            if (response.ok && result.success && result.data) {
                const selectedJamaats = result.data.map(item => ({
                    value: item.jamaat_id,
                    label: item.jamaat_name
                }));

                setFormData(prev => ({
                    ...prev,
                    jamaat: selectedJamaats
                }));

                setOriginalData(prev => ({
                    ...prev,
                    jamaat: selectedJamaats
                }));
            }
        } catch (error) {
            console.error('Error fetching team jamaats:', error);
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

    // Handle Jamiaat select change
    const handlejamiaatChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            jamiaat: selectedOption,
            jamaat: [] // Clear jamaats when jamiaat changes
        }));
        
        if (errors.jamiaat) {
            setErrors(prev => ({
                ...prev,
                jamiaat: ''
            }));
        }
        
        if (selectedOption?.value) {
            fetchJamaatsByJamiaat(selectedOption.value);
        } else {
            setJamaatOptions([]);
        }
    };

    // Handle Jamaat select change
    const handleJamaatChange = (selectedOptions) => {
        setFormData(prev => ({
            ...prev,
            jamaat: selectedOptions || []
        }));
        
        if (errors.jamaat) {
            setErrors(prev => ({
                ...prev,
                jamaat: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {
            name: '',
            jamiaat: '',
            jamaat: ''
        };

        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = 'Team name is required';
            isValid = false;
        }

        if (!formData.jamiaat) {
            newErrors.jamiaat = 'Jamiaat is required';
            isValid = false;
        }

        if (!formData.jamaat || formData.jamaat.length === 0) {
            newErrors.jamaat = 'At least one Jamaat must be selected';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Check if form has changes
    const hasChanges = () => {
        if (!originalData) return false;

        const nameChanged = formData.name !== originalData.name;
        const jamiaatChanged = formData.jamiaat?.value !== originalData.jamiaat?.value;
        
        const currentJamaatIds = formData.jamaat.map(j => j.value).sort();
        const originalJamaatIds = (originalData.jamaat || []).map(j => j.value).sort();
        const jamaatChanged = JSON.stringify(currentJamaatIds) !== JSON.stringify(originalJamaatIds);

        return nameChanged || jamiaatChanged || jamaatChanged;
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
                team_id: teamId,
                team_name: formData.name.trim(),
                jamiaat_id: formData.jamiaat.value,
                jamaat_ids: formData.jamaat.map(j => j.value)
            };

            const response = await fetch(`${API_BASE_URL}/Team/UpdateTeam`, {
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
                // Call onUpdate callback before showing alert
                if (onUpdate) {
                    const dataToUpdate = {
                        team_id: teamId,
                        name: formData.name,
                        jamiaatId: formData.jamiaat.value,
                        jamiaatName: formData.jamiaat.label,
                        jamaatIds: formData.jamaat.map(j => j.value),
                        jamaatNames: formData.jamaat.map(j => j.label),
                        jamiaat: formData.jamiaat,
                        jamaat: formData.jamaat
                    };
                    onUpdate(dataToUpdate);
                }
                
                // Show auto-close success alert
                showSuccessAlert(result.message || 'Team updated successfully!');
            } else {
                if (result.data?.result_code === 4) {
                    setErrors(prev => ({
                        ...prev,
                        name: 'Team name already exists'
                    }));
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Team name already exists',
                        confirmButtonText: 'OK'
                    });
                } else if (result.data?.result_code === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Team not found or update failed',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(result.message || 'Failed to update team');
                }
            }
        } catch (error) {
            console.error('Error updating team:', error);
            setErrors({ submit: error.message });
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while updating the team. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Close
    const handleClose = () => {
        setFormData({
            name: '',
            jamiaat: null,
            jamaat: []
        });
        setErrors({
            name: '',
            jamiaat: '',
            jamaat: ''
        });
        setOriginalData(null);
        setJamaatOptions([]);
        
        if (onClose) {
            onClose();
        }
    };

    // Handle Reset
    const handleReset = () => {
        if (originalData) {
            setFormData({ ...originalData });
            setErrors({
                name: '',
                jamiaat: '',
                jamaat: ''
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

    // Custom styles for react-select
    // const selectStyles = {
    //     control: (base, state) => ({
    //         ...base,
    //         minHeight: '38px',
    //         borderColor: state.selectProps.error ? '#dc3545' : '#dee2e6',
    //         '&:hover': {
    //             borderColor: state.selectProps.error ? '#dc3545' : '#86b7fe'
    //         }
    //     }),
    //     valueContainer: (base) => ({
    //         ...base,
    //         minHeight: '38px',
    //         padding: '2px 8px',
    //         maxHeight: '120px',
    //         overflowY: 'auto'
    //     }),
    //     input: (base) => ({
    //         ...base,
    //         margin: '0',
    //         padding: '0'
    //     }),
    //     indicatorsContainer: (base) => ({
    //         ...base,
    //         alignSelf: 'flex-start',
    //         paddingTop: '8px'
    //     }),
    //     menu: (base) => ({
    //         ...base,
    //         zIndex: 9999
    //     }),
    //     menuList: (base) => ({
    //         ...base,
    //         maxHeight: '380px', // 38px per option x 10 options
    //         overflowY: 'auto'
    //     }),
    //     placeholder: (base) => ({
    //         ...base,
    //         color: '#6c757d'
    //     }),
    //     multiValue: (base) => ({
    //         ...base,
    //         backgroundColor: '#e7f1ff',
    //         borderRadius: '0.25rem',
    //         margin: '2px'
    //     }),
    //     multiValueLabel: (base) => ({
    //         ...base,
    //         color: '#0d6efd',
    //         fontSize: '0.875rem',
    //         padding: '3px 6px'
    //     }),
    //     multiValueRemove: (base) => ({
    //         ...base,
    //         color: '#0d6efd',
    //         borderRadius: '0 0.25rem 0.25rem 0',
    //         '&:hover': {
    //             backgroundColor: '#0d6efd',
    //             color: '#fff',
    //         }
    //     })
    // };

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
        padding: '2px 8px',
        maxHeight: '120px',
        overflowY: 'auto'
    }),
    input: (base) => ({
        ...base,
        margin: '0',
        padding: '0'
    }),
    indicatorsContainer: (base) => ({
        ...base,
        alignSelf: 'flex-start',
        paddingTop: '8px'
    }),
    menu: (base) => ({
        ...base,
        zIndex: 9999,
        maxHeight: '200px', // Limit menu height
        overflowY: 'auto'
    }),
    menuList: (base) => ({
        ...base,
        maxHeight: '200px', // Match with menu maxHeight
        overflowY: 'auto'
    }),
    menuPortal: (base) => ({ 
        ...base, 
        zIndex: 9999 
    }),
    placeholder: (base) => ({
        ...base,
        color: '#6c757d'
    }),
    multiValue: (base) => ({
        ...base,
        backgroundColor: '#e7f1ff',
        borderRadius: '0.25rem',
        margin: '2px'
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: '#0d6efd',
        fontSize: '0.875rem',
        padding: '3px 6px'
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: '#0d6efd',
        borderRadius: '0 0.25rem 0.25rem 0',
        '&:hover': {
            backgroundColor: '#0d6efd',
            color: '#fff',
        }
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
                        max-width: 700px;
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

                    .form-row-inline {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 15px;
                    }
                    .form-row-inline .horizontal-form-group {
                        flex: 1;
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
                {(isLoading || isLoadingTeamData) && (
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
                    <button className="close-btn" onClick={handleClose} title="Close" disabled={isLoading || isLoadingTeamData}>
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

                {/* Row 1: Team Name and Jamiaat */}
                <div className="form-row-inline">
                    <div className="horizontal-form-group">
                        <Form.Label>Team Name <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter team name"
                                className={errors.name ? 'is-invalid' : ''}
                                disabled={isLoading || isLoadingTeamData}
                            />
                            {errors.name && <div className="error-text">{errors.name}</div>}
                        </div>
                    </div>

                    <div className="horizontal-form-group">
                        <Form.Label>Jamiaat <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Select
                                options={jamiaatOptions}
                                value={formData.jamiaat}
                                onChange={handlejamiaatChange}
                                placeholder="Select jamiaat"
                                isClearable
                                isDisabled={isLoading || isLoadingJamiaats || isLoadingTeamData}
                                isLoading={isLoadingJamiaats}
                                styles={selectStyles}
                                error={errors.jamiaat}
                                noOptionsMessage={() => "No jamiaats available"}
                            />
                            {errors.jamiaat && <div className="error-text">{errors.jamiaat}</div>}
                        </div>
                    </div>
                </div>

                {/* Row 2: Jamaat (Full Width) */}
                <div className="form-row-inline">
                    <div className="horizontal-form-group" style={{ width: '100%' }}>
                        <Form.Label>Jamaat <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Select
                                options={jamaatOptions}
                                value={formData.jamaat}
                                onChange={handleJamaatChange}
                                placeholder={
                                    !formData.jamiaat 
                                        ? "First select a jamiaat" 
                                        : isLoadingJamaats 
                                            ? "Loading jamaats..." 
                                            : "Select jamaat (multiple)"
                                }
                                isMulti
                                isClearable
                                isDisabled={isLoading || !formData.jamiaat || isLoadingJamaats || isLoadingTeamData}
                                isLoading={isLoadingJamaats}
                                styles={selectStyles}
                                error={errors.jamaat}
                                noOptionsMessage={() => 
                                    !formData.jamiaat 
                                        ? "Please select a jamiaat first" 
                                        : "No jamaats available for selected jamiaat"
                                }
                            />
                            {errors.jamaat && <div className="error-text">{errors.jamaat}</div>}
                        </div>
                    </div>
                </div>

                <div className="form-buttons">
                    <Button 
                        variant="primary" 
                        onClick={handleUpdate} 
                        disabled={isLoading || !hasChanges() || isLoadingTeamData}
                    >
                        <i className="ri-save-line me-1"></i> {isLoading ? 'Updating...' : 'Update'}
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={handleClose} 
                        disabled={isLoading || isLoadingTeamData}
                    >
                        <i className="ri-arrow-left-line me-1"></i> Back
                    </Button>
                    <Button 
                        className="btn-clear" 
                        onClick={handleReset} 
                        disabled={isLoading || !hasChanges() || isLoadingTeamData}
                    >
                        <i className="ri-refresh-line me-1"></i> Reset
                    </Button>
                </div>
            </div>
        </div>
    );
};

const TeamTable = () => {
    // State management
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editTeamId, setEditTeamId] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Force Grid refresh
    const [gridKey, setGridKey] = useState(0);

    // Fetch teams data from API
    const fetchTeams = async () => {
        try {
            setLoading(true);
            setError(null);

            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const apiUrl = `${API_BASE_URL}/Team/GetAllTeams`;

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
                    id: item.team_id,
                    srNo: index + 1,
                    teamName: item.team_name,
                    jamiaat: item.jamiaat_name,
                    jamiaatId: item.jamiaat_id
                }));
                setTableData(transformedData);
            } else {
                throw new Error(result.message || 'Failed to fetch teams');
            }
        } catch (err) {
            console.error('Error fetching teams:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchTeams();
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
        setEditTeamId(null);
    };

    // Handle Save (for Add)
    const handleSave = (data) => {
        setShowAddForm(false);
        
        // Refresh the table
        fetchTeams();
        
        // Force grid refresh
        setGridKey(prev => prev + 1);
    };

    // Handle Update (for Edit)
    const handleUpdate = (data) => {
        setShowEditForm(false);
        setEditTeamId(null);
        
        // Optimistic update - update the specific row in the table
        setTableData(prevData => {
            return prevData.map(item => {
                if (item.id === data.team_id) {
                    return {
                        ...item,
                        teamName: data.name,
                        jamiaat: data.jamiaatName,
                        jamiaatId: data.jamiaatId
                    };
                }
                return item;
            });
        });
        
        // Force grid refresh
        setGridKey(prev => prev + 1);
        
        // Background sync with server
        setTimeout(() => {
            fetchTeams();
        }, 500);
    };

    // Handle Edit
    const handleEdit = (id) => {
        setEditTeamId(id);
        setShowEditForm(true);
    };

    // Handle Delete with SweetAlert2 confirmation
    const handleDelete = async (id) => {
        // Find the team to get its name
        const teamToDelete = tableData.find(item => item.id === id);
        const teamName = teamToDelete ? teamToDelete.teamName : 'this team';
        
        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${teamName}".`,
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

            const response = await fetch(`${API_BASE_URL}/Team/DeleteTeam`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    team_id: id
                })
            });

            const apiResult = await response.json();
            if (response.ok && apiResult.success) {
                const resultCode = Number(apiResult.data?.result_code);
                
                if (resultCode === 3) {
                    // Success
                    Swal.fire({
                        title: 'Deleted!',
                        text: apiResult.message || 'Team has been deleted successfully.',
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: false,
                        showConfirmButton: false
                    });

                    // ✅ Optimistic update - instant UI change
                    setTableData(prevData => {
                        const filtered = prevData.filter(item => item.id !== id);
                        // Recalculate serial numbers
                        return filtered.map((item, index) => ({
                            ...item,
                            srNo: index + 1
                        }));
                    });
                    
                    // ✅ Force Grid to re-render
                    setGridKey(prev => prev + 1);
                    
                    // ✅ Background sync with server
                    setTimeout(async () => {
                        try {
                            await fetchTeams();
                        } catch (error) {
                            console.error('Background sync failed:', error);
                        }
                    }, 500);

                } else if (resultCode === 0) {
                    // Failure - Team not found or already deleted
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed',
                        text: 'Team not found or already deleted',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(apiResult.message || 'Failed to delete team');
                }
            } else {
                throw new Error(apiResult.message || `Server error: ${response.status}`);
            }

        } catch (error) {
            console.error('Error deleting team:', error);
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

    // ✅ Format data for Grid.js with useMemo
    const gridData = useMemo(() => {
        return tableData.map(item => [
            item.srNo,
            item.teamName,
            item.jamiaat,
            item.id
        ]);
    }, [tableData]);

    return (
        <Fragment>
            {/* Custom styles */}
            <style>
                {`
                    /* Search bar styles */
                    #grid-team-table .gridjs-search {
                        width: 100%;
                        margin-bottom: 1rem;
                    }
                    #grid-team-table .gridjs-search-input {
                        width: 100%;
                        padding: 8px 12px;
                        border: 1px solid #dee2e6;
                        border-radius: 6px;
                        font-size: 14px;
                    }
                    #grid-team-table .gridjs-search-input:focus {
                        outline: none;
                        border-color: #0d6efd;
                        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                    }
                    #grid-team-table .gridjs-wrapper {
                        margin-top: 0.5rem;
                    }
                    #grid-team-table .gridjs-container {
                        padding: 0;
                    }

                    /* Sorting arrow styles */
                    #grid-team-table .gridjs-th-sort {
                        position: relative;
                        cursor: pointer;
                    }
                    #grid-team-table .gridjs-th-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                    }
                    #grid-team-table button.gridjs-sort {
                        background: none;
                        border: none;
                        width: 20px;
                        height: 20px;
                        position: relative;
                        cursor: pointer;
                        float: right;
                        margin-left: 8px;
                    }
                    #grid-team-table button.gridjs-sort::before,
                    #grid-team-table button.gridjs-sort::after {
                        content: '';
                        position: absolute;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 0;
                        height: 0;
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                    }
                    #grid-team-table button.gridjs-sort::before {
                        top: 2px;
                        border-bottom: 6px solid #bbb;
                    }
                    #grid-team-table button.gridjs-sort::after {
                        bottom: 2px;
                        border-top: 6px solid #bbb;
                    }
                    #grid-team-table button.gridjs-sort-asc::before {
                        border-bottom-color: #333;
                    }
                    #grid-team-table button.gridjs-sort-asc::after {
                        border-top-color: #bbb;
                    }
                    #grid-team-table button.gridjs-sort-desc::before {
                        border-bottom-color: #bbb;
                    }
                    #grid-team-table button.gridjs-sort-desc::after {
                        border-top-color: #333;
                    }
                    #grid-team-table .gridjs-sort-neutral,
                    #grid-team-table .gridjs-sort-asc,
                    #grid-team-table .gridjs-sort-desc {
                        background-image: none !important;
                    }

                    /* Pagination styles */
                    #grid-team-table .gridjs-footer {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 0;
                        border-top: 1px solid #e9ecef;
                        margin-top: 1rem;
                    }
                    #grid-team-table .gridjs-pagination {
                        display: flex;
                        width: 100%;
                        justify-content: space-between;
                        align-items: center;
                    }
                    #grid-team-table .gridjs-summary {
                        order: 1;
                        color: #6c757d;
                        font-size: 14px;
                    }
                    #grid-team-table .gridjs-pages {
                        order: 2;
                        display: flex;
                        gap: 5px;
                    }
                    #grid-team-table .gridjs-pages button {
                        min-width: 35px;
                        height: 35px;
                        border: 1px solid #dee2e6;
                        background: #fff;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-size: 14px;
                    }
                    #grid-team-table .gridjs-pages button:hover:not(:disabled) {
                        background: #e9ecef;
                        border-color: #adb5bd;
                    }
                    #grid-team-table .gridjs-pages button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    #grid-team-table .gridjs-pages button.gridjs-currentPage {
                        background: var(--primary-color, #0d6efd);
                        color: #fff;
                        border-color: var(--primary-color, #0d6efd);
                    }

                    /* Action buttons spacing */
                    #grid-team-table .btn-action-group {
                        display: inline-flex;
                        gap: 10px;
                        align-items: center;
                    }
                    #grid-team-table .btn-action-group .btn {
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

            {/* AddJamaat Modal - For Creating New Teams */}
            <AddJamaat
                show={showAddForm}
                onClose={handleCloseAddModal}
                onSave={handleSave}
            />

            {/* EditJamaat Modal - For Editing Existing Teams */}
            <EditJamaat
                show={showEditForm}
                onClose={handleCloseEditModal}
                onUpdate={handleUpdate}
                teamId={editTeamId}
            />

            {/* Main Table */}
            <Row>
                <Col xl={12}>
                    <Card className="custom-card">
                        <Card.Header className="d-flex align-items-center justify-content-between">
                            <div>
                                <Card.Title className="mb-1">
                                    Team Master
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
                                    <p className="mt-3">Loading teams data...</p>
                                </div>
                            ) : error ? (
                                <div className="error-container">
                                    <i className="ri-error-warning-line" style={{ fontSize: '48px' }}></i>
                                    <div className="error-message">
                                        <div className="error-title">⚠️ Error Loading Teams</div>
                                        <div className="error-details">{error}</div>
                                    </div>
                                    <button 
                                        className="btn btn-primary mt-3" 
                                        onClick={fetchTeams}
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
                                    <p className="mt-3">No teams found</p>
                                    <button 
                                        className="btn btn-primary mt-2" 
                                        onClick={handleAdd}
                                    >
                                        <i className="ri-add-line me-2"></i>
                                        Add First Team
                                    </button>
                                </div>
                            ) : (
                                <div id="grid-team-table">
                                    <Grid
                                        key={gridKey}
                                        data={gridData}
                                        sort={true}
                                        search={{
                                            enabled: true,
                                            placeholder: 'Search teams...'
                                        }}
                                        columns={[
                                            { 
                                                name: 'Sr',
                                                width: '100px',
                                                sort: true
                                            }, 
                                            { 
                                                name: 'Team Name',
                                                width: '200px',
                                                sort: true
                                            }, 
                                            { 
                                                name: 'Jamiaat',
                                                width: '200px',
                                                sort: true
                                            }, 
                                            {
                                                name: 'Action',
                                                width: '150px',
                                                sort: false,
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




    window.handleEditClick = (id) => {
        window.dispatchEvent(new CustomEvent('editRecord', { detail: { id } }));
    };
    
    window.handleDeleteClick = (id) => {
        window.dispatchEvent(new CustomEvent('deleteRecord', { detail: { id } }));
    };


export default TeamTable;