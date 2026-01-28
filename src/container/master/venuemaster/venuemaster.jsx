// VenueMaster.jsx
import { Fragment, useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Form, Button, Table } from 'react-bootstrap';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
import IconButton from '../../elements/button'; 
import Swal from 'sweetalert2';
import { checkModuleAccess } from '../../../utils/accessControl';
import '../../../styles/shared-styles.css';
import StandardModal from '../../../components/StandardModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ========================================
// MODULE CONFIGURATION
// ========================================
const MODULE_ID = '104'; // Venue Master module ID

// ============================================================================
// ADD VENUE MODAL COMPONENT
// ============================================================================
const AddVenue = ({ 
    show,
    onClose,
    onSave,
    title = "Add New Venue",
    permissions
}) => {
    const [formData, setFormData] = useState({
        venueName: '',
        venueTypeId: '',
        jamiaatId: '',
        jamaatId: '',
        locationName: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [venueTypes, setVenueTypes] = useState([]);
    const [jamiaats, setJamiaats] = useState([]);
    const [jamaats, setJamaats] = useState([]);
    const [locations, setLocations] = useState([]);
    const [locationCounter, setLocationCounter] = useState(1);

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

    useEffect(() => {
        if (show) {
            fetchVenueTypes();
            fetchJamiaats();
            handleClear();
        }
    }, [show]);

    useEffect(() => {
        if (formData.jamiaatId) {
            fetchJamaats(formData.jamiaatId);
        } else {
            setJamaats([]);
            setFormData(prev => ({ ...prev, jamaatId: '' }));
        }
    }, [formData.jamiaatId]);

    const fetchVenueTypes = async () => {
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Venue/GetAllVenueTypes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setVenueTypes(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching venue types:', error);
        }
    };

    const fetchJamiaats = async () => {
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Venue/GetAllJamiaats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setJamiaats(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching jamiaats:', error);
        }
    };

    const fetchJamaats = async (jamiaatId) => {
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Venue/GetAllJamaatsByJamiaat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ jamiaat_id: parseInt(jamiaatId) })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setJamaats(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching jamaats:', error);
        }
    };

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

    const handleAddLocation = () => {
        const locationName = formData.locationName.trim();
        
        if (!locationName) {
            setErrors(prev => ({
                ...prev,
                locationName: 'Please enter a location name'
            }));
            return;
        }

        const isDuplicate = locations.some(
            loc => loc.location_name.toLowerCase() === locationName.toLowerCase()
        );

        if (isDuplicate) {
            setErrors(prev => ({
                ...prev,
                locationName: 'This location already exists'
            }));
            return;
        }

        const newLocation = {
            id: locationCounter,
            location_id: null,
            location_name: locationName,
            flag: 'I'
        };

        setLocations(prev => [...prev, newLocation]);
        setLocationCounter(prev => prev + 1);
        setFormData(prev => ({ ...prev, locationName: '' }));
        setErrors(prev => ({ ...prev, locationName: '', locations: '' }));
    };

    const handleDeleteLocation = (id) => {
        setLocations(prev => prev.filter(loc => loc.id !== id));
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.venueName.trim()) {
            newErrors.venueName = 'Venue name is required';
            isValid = false;
        }

        if (!formData.venueTypeId) {
            newErrors.venueTypeId = 'Venue type is required';
            isValid = false;
        }

        if (!formData.jamiaatId) {
            newErrors.jamiaatId = 'Jamiaat is required';
            isValid = false;
        }

        if (locations.length === 0) {
            newErrors.locations = 'At least one location is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

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
                venue_name: formData.venueName.trim(),
                venue_type_id: formData.venueTypeId ? parseInt(formData.venueTypeId) : null,
                jamiaat_id: formData.jamiaatId ? parseInt(formData.jamiaatId) : null,
                jamaat_id: formData.jamaatId ? parseInt(formData.jamaatId) : null,
                locations: locations.map(loc => ({
                    location_id: loc.location_id,
                    location_name: loc.location_name,
                    flag: loc.flag
                }))
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
                    if (onSave) {
                        onSave(formData);
                    }
                    
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

    const handleClose = () => {
        handleClear();
        if (onClose) {
            onClose();
        }
    };

    const handleClear = () => {
        setFormData({
            venueName: '',
            venueTypeId: '',
            jamiaatId: '',
            jamaatId: '',
            locationName: ''
        });
        setErrors({});
        setJamaats([]);
        setLocations([]);
        setLocationCounter(1);
    };

    const modalButtons = [
        {
            label: isLoading ? 'Saving...' : 'Save',
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
            icon="ri-map-pin-line"
            buttons={modalButtons}
            loading={isLoading}
            maxWidth="1000px"
        >
            <style>
                {`
                    .form-row-container {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 20px;
                    }

                    .form-row-container .horizontal-form-group {
                        flex: 1;
                        margin-bottom: 0;
                    }

                    @media (max-width: 768px) {
                        .form-row-container {
                            flex-direction: column;
                            gap: 0;
                        }

                        .form-row-container .horizontal-form-group {
                            margin-bottom: 20px;
                        }
                    }

                    .location-input-group {
                        display: flex;
                        gap: 10px;
                        align-items: flex-start;
                    }

                    .location-input-group .form-input-wrapper {
                        flex: 1;
                    }

                    .location-input-group .btn-add-location {
                        height: 38px;
                        width: 38px;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 8px;
                        flex-shrink: 0;
                    }

                    .locations-section {
                        margin-top: 20px;
                        margin-bottom: 20px;
                    }

                    .locations-section-title {
                        font-size: 16px;
                        font-weight: 600;
                        margin-bottom: 15px;
                        color: #333;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #e9ecef;
                    }

                    .locations-table {
                        width: 100%;
                        margin-bottom: 0;
                    }

                    .locations-table thead th {
                        background-color: #f8f9fa;
                        border: 1px solid #dee2e6;
                        padding: 10px;
                        text-align: center;
                        font-weight: 600;
                        font-size: 13px;
                    }

                    .locations-table tbody td {
                        border: 1px solid #dee2e6;
                        padding: 8px;
                        vertical-align: middle;
                    }

                    .locations-table tbody td:first-child {
                        text-align: center;
                        width: 50px;
                    }

                    .locations-table tbody td:nth-child(2) {
                        text-align: left;
                    }

                    .locations-table tbody td:last-child {
                        text-align: center;
                        width: 100px;
                    }

                    .table-responsive {
                        max-height: 300px;
                        overflow-y: auto;
                    }

                    .table-responsive::-webkit-scrollbar {
                        width: 8px;
                    }

                    .table-responsive::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 4px;
                    }

                    .table-responsive::-webkit-scrollbar-thumb {
                        background: #c1c1c1;
                        border-radius: 4px;
                    }

                    .table-responsive::-webkit-scrollbar-thumb:hover {
                        background: #a1a1a1;
                    }

                    .no-locations {
                        padding: 20px;
                        text-align: center;
                        color: #6c757d;
                        font-style: italic;
                    }
                `}
            </style>

            {errors.submit && (
                <div className="submit-error">
                    <i className="ri-error-warning-line"></i>
                    <span>{errors.submit}</span>
                </div>
            )}

            {/* Row 1: Venue Name and Venue Type */}
            <div className="form-row-container">
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">
                        Venue Name <span className="text-danger">*</span>
                    </Form.Label>
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

                <div className="horizontal-form-group">
                    <Form.Label className="form-label">
                        Venue Type <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Select
                            name="venueTypeId"
                            value={formData.venueTypeId}
                            onChange={handleInputChange}
                            className={errors.venueTypeId ? 'is-invalid' : ''}
                            disabled={isLoading}
                        >
                            <option value="">Select Venue Type</option>
                            {venueTypes.map(type => (
                                <option key={type.venue_type_id} value={type.venue_type_id}>
                                    {type.venue_type_name}
                                </option>
                            ))}
                        </Form.Select>
                        {errors.venueTypeId && <div className="error-text">{errors.venueTypeId}</div>}
                    </div>
                </div>
            </div>

            {/* Row 2: Jamiaat and Jamaat */}
            <div className="form-row-container">
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">
                        Jamiaat <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Select
                            name="jamiaatId"
                            value={formData.jamiaatId}
                            onChange={handleInputChange}
                            className={errors.jamiaatId ? 'is-invalid' : ''}
                            disabled={isLoading}
                        >
                            <option value="">Select Jamiaat</option>
                            {jamiaats.map(jamiaat => (
                                <option key={jamiaat.jamiaat_id} value={jamiaat.jamiaat_id}>
                                    {jamiaat.jamiaat_name}
                                </option>
                            ))}
                        </Form.Select>
                        {errors.jamiaatId && <div className="error-text">{errors.jamiaatId}</div>}
                    </div>
                </div>

                <div className="horizontal-form-group">
                    <Form.Label className="form-label">Jamaat</Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Select
                            name="jamaatId"
                            value={formData.jamaatId}
                            onChange={handleInputChange}
                            className={errors.jamaatId ? 'is-invalid' : ''}
                            disabled={isLoading || !formData.jamiaatId}
                        >
                            <option value="">
                                {formData.jamiaatId ? 'Select Jamaat' : 'First select Jamiaat'}
                            </option>
                            {jamaats.map(jamaat => (
                                <option key={jamaat.jamaat_id} value={jamaat.jamaat_id}>
                                    {jamaat.jamaat_name}
                                </option>
                            ))}
                        </Form.Select>
                        {errors.jamaatId && <div className="error-text">{errors.jamaatId}</div>}
                    </div>
                </div>
            </div>

            {/* Row 3: Location Name */}
            <div className="horizontal-form-group">
                <Form.Label className="form-label">Location Name</Form.Label>
                <div className="form-input-wrapper">
                    <div className="location-input-group">
                        <div className="form-input-wrapper">
                            <Form.Control
                                type="text"
                                name="locationName"
                                value={formData.locationName}
                                onChange={handleInputChange}
                                placeholder="Enter location name"
                                className={errors.locationName ? 'is-invalid' : ''}
                                disabled={isLoading}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddLocation();
                                    }
                                }}
                            />
                            {errors.locationName && <div className="error-text">{errors.locationName}</div>}
                        </div>
                        <Button 
                            variant="success" 
                            className="btn-add-location"
                            onClick={handleAddLocation}
                            disabled={isLoading}
                            title="Add Location"
                        >
                            <i className="ri-add-line"></i>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Locations Section */}
            {errors.locations && (
                <div className="error-text" style={{ marginTop: '-10px', marginBottom: '10px', textAlign: 'center' }}>
                    {errors.locations}
                </div>
            )}

            {locations.length > 0 ? (
                <div className="locations-section">
                    <div className="locations-section-title">
                        <i className="ri-map-pin-2-line me-2"></i>
                        Locations
                    </div>
                    <div className="table-responsive">
                        <Table className="locations-table" bordered>
                            <thead>
                                <tr>
                                    <th>Sr.</th>
                                    <th>Location Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locations.map((loc, index) => (
                                    <tr key={loc.id}>
                                        <td>{index + 1}</td>
                                        <td>{loc.location_name}</td>
                                        <td>
                                            <Button 
                                                variant="danger" 
                                                size="sm"
                                                onClick={() => handleDeleteLocation(loc.id)}
                                                disabled={isLoading}
                                            >
                                                <i className="ri-delete-bin-line"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            ) : (
                <div className="no-locations">
                    No locations added yet. Use the form above to add locations.
                </div>
            )}
        </StandardModal>
    );
};

// ============================================================================
// EDIT VENUE MODAL COMPONENT
// ============================================================================
const EditVenue = ({ 
    show, 
    onClose, 
    onUpdate, 
    venueId,
    title = "Edit Venue",
    permissions
}) => {
    const [formData, setFormData] = useState({
        venueName: '',
        venueTypeId: '',
        jamiaatId: '',
        jamaatId: '',
        locationName: ''
    });

    const [originalData, setOriginalData] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingVenueData, setLoadingVenueData] = useState(false);
    const [venueTypes, setVenueTypes] = useState([]);
    const [jamiaats, setJamiaats] = useState([]);
    const [jamaats, setJamaats] = useState([]);
    const [locations, setLocations] = useState([]);
    const [locationCounter, setLocationCounter] = useState(1);

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

    useEffect(() => {
        if (show && venueId) {
            fetchVenueTypes();
            fetchJamiaats();
            fetchVenueData();
        }
    }, [show, venueId]);

    useEffect(() => {
        if (formData.jamiaatId) {
            fetchJamaats(formData.jamiaatId);
        } else {
            setJamaats([]);
        }
    }, [formData.jamiaatId]);

    const fetchVenueTypes = async () => {
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Venue/GetAllVenueTypes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setVenueTypes(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching venue types:', error);
        }
    };

    const fetchJamiaats = async () => {
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Venue/GetAllJamiaats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setJamiaats(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching jamiaats:', error);
        }
    };

    const fetchJamaats = async (jamiaatId) => {
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Venue/GetAllJamaatsByJamiaat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ jamiaat_id: parseInt(jamiaatId) })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setJamaats(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching jamaats:', error);
        }
    };

    const fetchVenueData = async () => {
        setLoadingVenueData(true);
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
            
            const response = await fetch(`${API_BASE_URL}/Venue/GetVenueById`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    venue_id: venueId
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
                const venueData = result.data[0];
                
                const initialFormData = {
                    venueName: venueData.venue_name || '',
                    venueTypeId: venueData.venue_type_id ? String(venueData.venue_type_id) : '',
                    jamiaatId: venueData.jamiaat_id ? String(venueData.jamiaat_id) : '',
                    jamaatId: venueData.jamaat_id ? String(venueData.jamaat_id) : '',
                    locationName: ''
                };
                
                setFormData(initialFormData);
                setOriginalData(initialFormData);

                const loadedLocations = (venueData.locations || []).map((loc, index) => ({
                    id: index + 1,
                    location_id: loc.location_id,
                    location_name: loc.location_name,
                    flag: 'X'
                }));

                setLocations(loadedLocations);
                setLocationCounter(loadedLocations.length + 1);
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
            setLoadingVenueData(false);
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

    const handleAddLocation = () => {
        const locationName = formData.locationName.trim();
        
        if (!locationName) {
            setErrors(prev => ({
                ...prev,
                locationName: 'Please enter a location name'
            }));
            return;
        }

        const isDuplicate = locations.some(
            loc => loc.flag !== 'D' && loc.location_name.toLowerCase() === locationName.toLowerCase()
        );

        if (isDuplicate) {
            setErrors(prev => ({
                ...prev,
                locationName: 'This location already exists'
            }));
            return;
        }

        const newLocation = {
            id: locationCounter,
            location_id: null,
            location_name: locationName,
            flag: 'I'
        };

        setLocations(prev => [...prev, newLocation]);
        setLocationCounter(prev => prev + 1);
        setFormData(prev => ({ ...prev, locationName: '' }));
        setErrors(prev => ({ ...prev, locationName: '', locations: '' }));
    };

    const handleDeleteLocation = (id) => {
        setLocations(prev => prev.map(loc => {
            if (loc.id === id) {
                if (loc.flag === 'I') {
                    return null;
                }
                return { ...loc, flag: 'D' };
            }
            return loc;
        }).filter(loc => loc !== null));
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.venueName.trim()) {
            newErrors.venueName = 'Venue name is required';
            isValid = false;
        }

        if (!formData.venueTypeId) {
            newErrors.venueTypeId = 'Venue type is required';
            isValid = false;
        }

        if (!formData.jamiaatId) {
            newErrors.jamiaatId = 'Jamiaat is required';
            isValid = false;
        }

        // Check if at least one location exists (not deleted)
        const visibleLocations = locations.filter(loc => loc.flag !== 'D');
        if (visibleLocations.length === 0) {
            newErrors.locations = 'At least one location is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const hasChanges = () => {
        if (!originalData) return false;

        const formChanged = (
            formData.venueName !== originalData.venueName ||
            formData.venueTypeId !== originalData.venueTypeId ||
            formData.jamiaatId !== originalData.jamiaatId ||
            formData.jamaatId !== originalData.jamaatId
        );

        const locationsChanged = locations.some(loc => loc.flag !== 'X');

        return formChanged || locationsChanged;
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

        setIsLoading(true);

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

            const payload = {
                venue_id: venueId,
                venue_name: formData.venueName.trim(),
                venue_type_id: formData.venueTypeId ? parseInt(formData.venueTypeId) : null,
                jamiaat_id: formData.jamiaatId ? parseInt(formData.jamiaatId) : null,
                jamaat_id: formData.jamaatId ? parseInt(formData.jamaatId) : null,
                locations: locations.map(loc => ({
                    location_id: loc.location_id,
                    location_name: loc.location_name,
                    flag: loc.flag
                }))
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
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: result.message || 'Failed to update venue',
                        confirmButtonText: 'OK'
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Failed to update venue',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error updating venue:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while updating the venue. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            venueName: '',
            venueTypeId: '',
            jamiaatId: '',
            jamaatId: '',
            locationName: ''
        });
        setErrors({});
        setOriginalData(null);
        setJamaats([]);
        setLocations([]);
        setLocationCounter(1);
        
        if (onClose) {
            onClose();
        }
    };

    const handleReset = () => {
        if (originalData) {
            setFormData({ ...originalData, locationName: '' });
            setErrors({});
            
            fetchVenueData();
            
            Swal.fire({
                icon: 'info',
                title: 'Form Reset',
                text: 'Form reset to original values',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    const visibleLocations = locations.filter(loc => loc.flag !== 'D');

    const modalButtons = [
        {
            label: isLoading ? 'Updating...' : 'Update',
            variant: 'primary',
            icon: 'ri-save-line',
            onClick: handleUpdate,
            disabled: isLoading || !hasChanges() || loadingVenueData
        },
        {
            label: 'Back',
            variant: 'secondary',
            icon: 'ri-arrow-left-line',
            onClick: handleClose,
            disabled: isLoading || loadingVenueData
        },
        {
            label: 'Reset',
            className: 'btn-clear',
            icon: 'ri-refresh-line',
            onClick: handleReset,
            disabled: isLoading || !hasChanges() || loadingVenueData
        }
    ];

    return (
        <StandardModal
            show={show}
            onClose={handleClose}
            title={title}
            icon="ri-edit-line"
            buttons={modalButtons}
            loading={loadingVenueData || isLoading}
            maxWidth="1000px"
        >
            <style>
                {`
                    .form-row-container {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 20px;
                    }

                    .form-row-container .horizontal-form-group {
                        flex: 1;
                        margin-bottom: 0;
                    }

                    @media (max-width: 768px) {
                        .form-row-container {
                            flex-direction: column;
                            gap: 0;
                        }

                        .form-row-container .horizontal-form-group {
                            margin-bottom: 20px;
                        }
                    }

                    .location-input-group {
                        display: flex;
                        gap: 10px;
                        align-items: flex-start;
                    }

                    .location-input-group .form-input-wrapper {
                        flex: 1;
                    }

                    .location-input-group .btn-add-location {
                        height: 38px;
                        width: 38px;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 8px;
                        flex-shrink: 0;
                    }

                    .locations-section {
                        margin-top: 20px;
                        margin-bottom: 20px;
                    }

                    .locations-section-title {
                        font-size: 16px;
                        font-weight: 600;
                        margin-bottom: 15px;
                        color: #333;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #e9ecef;
                    }

                    .locations-table {
                        width: 100%;
                        margin-bottom: 0;
                    }

                    .locations-table thead th {
                        background-color: #f8f9fa;
                        border: 1px solid #dee2e6;
                        padding: 10px;
                        text-align: center;
                        font-weight: 600;
                        font-size: 13px;
                    }

                    .locations-table tbody td {
                        border: 1px solid #dee2e6;
                        padding: 8px;
                        vertical-align: middle;
                    }

                    .locations-table tbody td:first-child {
                        text-align: center;
                        width: 50px;
                    }

                    .locations-table tbody td:nth-child(2) {
                        text-align: left;
                    }

                    .locations-table tbody td:last-child {
                        text-align: center;
                        width: 100px;
                    }

                    .table-responsive {
                        max-height: 300px;
                        overflow-y: auto;
                    }

                    .table-responsive::-webkit-scrollbar {
                        width: 8px;
                    }

                    .table-responsive::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 4px;
                    }

                    .table-responsive::-webkit-scrollbar-thumb {
                        background: #c1c1c1;
                        border-radius: 4px;
                    }

                    .table-responsive::-webkit-scrollbar-thumb:hover {
                        background: #a1a1a1;
                    }

                    .no-locations {
                        padding: 20px;
                        text-align: center;
                        color: #6c757d;
                        font-style: italic;
                    }

                    .location-badge {
                        margin-left: 8px;
                        font-size: 11px;
                        color: #28a745;
                        font-weight: bold;
                    }
                `}
            </style>

            {!loadingVenueData && (
                <>
                    {/* Row 1: Venue Name and Venue Type */}
                    <div className="form-row-container">
                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">
                                Venue Name <span className="text-danger">*</span>
                            </Form.Label>
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

                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">
                                Venue Type <span className="text-danger">*</span>
                            </Form.Label>
                            <div className="form-input-wrapper">
                                <Form.Select
                                    name="venueTypeId"
                                    value={formData.venueTypeId}
                                    onChange={handleInputChange}
                                    className={errors.venueTypeId ? 'is-invalid' : ''}
                                    disabled={isLoading}
                                >
                                    <option value="">Select Venue Type</option>
                                    {venueTypes.map(type => (
                                        <option key={type.venue_type_id} value={type.venue_type_id}>
                                            {type.venue_type_name}
                                        </option>
                                    ))}
                                </Form.Select>
                                {errors.venueTypeId && <div className="error-text">{errors.venueTypeId}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Jamiaat and Jamaat */}
                    <div className="form-row-container">
                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">
                                Jamiaat <span className="text-danger">*</span>
                            </Form.Label>
                            <div className="form-input-wrapper">
                                <Form.Select
                                    name="jamiaatId"
                                    value={formData.jamiaatId}
                                    onChange={handleInputChange}
                                    className={errors.jamiaatId ? 'is-invalid' : ''}
                                    disabled={isLoading}
                                >
                                    <option value="">Select Jamiaat</option>
                                    {jamiaats.map(jamiaat => (
                                        <option key={jamiaat.jamiaat_id} value={jamiaat.jamiaat_id}>
                                            {jamiaat.jamiaat_name}
                                        </option>
                                    ))}
                                </Form.Select>
                                {errors.jamiaatId && <div className="error-text">{errors.jamiaatId}</div>}
                            </div>
                        </div>

                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">Jamaat</Form.Label>
                            <div className="form-input-wrapper">
                                <Form.Select
                                    name="jamaatId"
                                    value={formData.jamaatId}
                                    onChange={handleInputChange}
                                    className={errors.jamaatId ? 'is-invalid' : ''}
                                    disabled={isLoading || !formData.jamiaatId}
                                >
                                    <option value="">
                                        {formData.jamiaatId ? 'Select Jamaat' : 'First select Jamiaat'}
                                    </option>
                                    {jamaats.map(jamaat => (
                                        <option key={jamaat.jamaat_id} value={jamaat.jamaat_id}>
                                            {jamaat.jamaat_name}
                                        </option>
                                    ))}
                                </Form.Select>
                                {errors.jamaatId && <div className="error-text">{errors.jamaatId}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Location Name */}
                    <div className="horizontal-form-group">
                        <Form.Label className="form-label">Location Name</Form.Label>
                        <div className="form-input-wrapper">
                            <div className="location-input-group">
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        type="text"
                                        name="locationName"
                                        value={formData.locationName}
                                        onChange={handleInputChange}
                                        placeholder="Enter location name"
                                        className={errors.locationName ? 'is-invalid' : ''}
                                        disabled={isLoading}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddLocation();
                                            }
                                        }}
                                    />
                                    {errors.locationName && <div className="error-text">{errors.locationName}</div>}
                                </div>
                                <Button 
                                    variant="success" 
                                    className="btn-add-location"
                                    onClick={handleAddLocation}
                                    disabled={isLoading}
                                    title="Add Location"
                                >
                                    <i className="ri-add-line"></i>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Locations Section */}
                    {errors.locations && (
                        <div className="error-text" style={{ marginTop: '-10px', marginBottom: '10px', textAlign: 'center' }}>
                            {errors.locations}
                        </div>
                    )}

                    {visibleLocations.length > 0 ? (
                        <div className="locations-section">
                            <div className="locations-section-title">
                                <i className="ri-map-pin-2-line me-2"></i>
                                Locations
                            </div>
                            <div className="table-responsive">
                                <Table className="locations-table" bordered>
                                    <thead>
                                        <tr>
                                            <th>Sr.</th>
                                            <th>Location Name</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleLocations.map((loc, index) => (
                                            <tr key={loc.id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    {loc.location_name}
                                                    {loc.flag === 'I' && (
                                                        <span className="location-badge">NEW</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm"
                                                        onClick={() => handleDeleteLocation(loc.id)}
                                                        disabled={isLoading}
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <div className="no-locations">
                            No locations added yet. Use the form above to add locations.
                        </div>
                    )}
                </>
            )}
        </StandardModal>
    );
};

// ============================================================================
// VENUE TABLE COMPONENT
// ============================================================================
const VenueTable = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editVenueId, setEditVenueId] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gridKey, setGridKey] = useState(0);

    const [checkingPermissions, setCheckingPermissions] = useState(true);
    
    const [permissions, setPermissions] = useState({
        canAdd: false,
        canEdit: false,
        canDelete: false,
        hasAccess: false
    });

    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = () => {
        setCheckingPermissions(true);
        
        const isAdminValue = sessionStorage.getItem('is_admin');
        
        if (isAdminValue === 'true' || isAdminValue === true || isAdminValue === '1') {
            setPermissions({
                canAdd: true,
                canEdit: true,
                canDelete: true,
                hasAccess: true
            });
            setCheckingPermissions(false);
            fetchVenues();
            return;
        }
        
        const accessRights = sessionStorage.getItem('access_rights');
        
        if (!accessRights) {
            Swal.fire({
                icon: 'error',
                title: 'Session Expired',
                text: 'Please login again',
                confirmButtonText: 'OK',
                allowOutsideClick: false
            }).then(() => {
                window.location.href = '/login';
            });
            return;
        }
        
        const modulePermissions = checkModuleAccess(accessRights, MODULE_ID);
        
        if (!modulePermissions.hasAccess) {
            Swal.fire({
                icon: 'error',
                title: 'Access Denied',
                text: 'You do not have permission to access Venue Master module',
                confirmButtonText: 'OK',
                allowOutsideClick: false
            }).then(() => {
                window.location.href = '/dashboard';
            });
            return;
        }
        
        setPermissions(modulePermissions);
        setCheckingPermissions(false);
        fetchVenues();
    };

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
                    venueName: item.venue_name,
                    venueTypeId: item.venue_type_id,
                    jamiaatId: item.jamiaat_id,
                    jamaatId: item.jamaat_id
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

    const totalRecords = tableData.length;

    const handleAdd = () => {
        if (!permissions.canAdd) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to add venues',
                confirmButtonText: 'OK'
            });
            return;
        }
        setShowAddForm(true);
    };

    const handleCloseAddModal = () => {
        setShowAddForm(false);
    };

    const handleCloseEditModal = () => {
        setShowEditForm(false);
        setEditVenueId(null);
    };

    const handleSave = (data) => {
        setShowAddForm(false);
        fetchVenues();
        setGridKey(prev => prev + 1);
    };

    const handleUpdate = (data) => {
        setShowEditForm(false);
        setEditVenueId(null);
        
        setTimeout(() => {
            fetchVenues();
        }, 500);
        
        setGridKey(prev => prev + 1);
    };

    const handleEdit = (id) => {
        if (!permissions.canEdit) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to edit venues',
                confirmButtonText: 'OK'
            });
            return;
        }
        setEditVenueId(id);
        setShowEditForm(true);
    };

    const handleDelete = async (id) => {
        if (!permissions.canDelete) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to delete venues',
                confirmButtonText: 'OK'
            });
            return;
        }

        const venueToDelete = tableData.find(item => item.id === id);
        const venueName = venueToDelete ? venueToDelete.venueName : 'this venue';
        
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${venueName}". This will also delete all associated locations.`,
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
                    Swal.fire({
                        title: 'Deleted!',
                        text: apiResult.message || 'Venue and locations have been deleted successfully.',
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
                            await fetchVenues();
                        } catch (error) {
                            console.error('Background sync failed:', error);
                        }
                    }, 500);
                } else if (resultCode === 0) {
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

    useEffect(() => {
        window.handleEditClick = handleEdit;
        window.handleDeleteClick = handleDelete;

        return () => {
            delete window.handleEditClick;
            delete window.handleDeleteClick;
        };
    }, [tableData, permissions.canEdit, permissions.canDelete]);

    const gridData = useMemo(() => {
        return tableData.map(item => [
            item.srNo,
            item.venueName,
            item.id
        ]);
    }, [tableData]);

    if (checkingPermissions) {
        return (
            <Fragment>
                <div className="permission-loading" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px'
                }}>
                    <div className="spinner-border text-primary" role="status" style={{
                        width: '3.5rem',
                        height: '3.5rem',
                        marginBottom: '1rem'
                    }}>
                        <span className="visually-hidden">Checking permissions...</span>
                    </div>
                    <p className="mt-3 text-muted">Checking access permissions...</p>
                </div>
            </Fragment>
        );
    }

    if (!permissions.hasAccess) {
        return null;
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
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                    #grid-venue-table .gridjs-table {
                        min-width: 800px;
                    }
                    #grid-venue-table .btn-action-group {
                        display: inline-flex;
                        gap: 10px;
                        align-items: center;
                    }
                    #grid-venue-table .btn-action-group .btn {
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

            <AddVenue
                show={showAddForm}
                onClose={handleCloseAddModal}
                onSave={handleSave}
                permissions={permissions}
            />

            <EditVenue
                show={showEditForm}
                onClose={handleCloseEditModal}
                onUpdate={handleUpdate}
                venueId={editVenueId}
                permissions={permissions}
            />

            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>
                                <div className="page-header-title">
                                    <div className="header-text">
                                        <i className="ri-map-pin-line"></i>
                                        <span>Venue Master</span>
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
                                        <p className="mt-3">Loading venue data...</p>
                                    </div>
                                ) : error ? (
                                    <div className="error-container">
                                        <i className="ri-error-warning-line" style={{ fontSize: '48px' }}></i>
                                        <p className="mt-3">{error}</p>
                                        <button 
                                            className="btn btn-primary mt-3" 
                                            onClick={fetchVenues}
                                        >
                                            <i className="ri-refresh-line me-2"></i>
                                            Retry
                                        </button>
                                    </div>
                                ) : tableData.length === 0 ? (
                                    <div className="loading-container">
                                        <i className="ri-inbox-line" style={{ fontSize: '48px' }}></i>
                                        <p className="mt-3">No venues found</p>
                                        {permissions.canAdd && (
                                            <button 
                                                className="btn btn-primary mt-2" 
                                                onClick={handleAdd}
                                            >
                                                <i className="ri-add-line me-2"></i>
                                                Add First Venue
                                            </button>
                                        )}
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
                                                    width: '80px',
                                                    sort: true
                                                }, 
                                                { 
                                                    name: 'Venue Name',
                                                    width: '250px',
                                                    sort: true
                                                }, 
                                                {
                                                    name: 'Action',
                                                    width: '150px',
                                                    sort: false,
                                                    formatter: (cell, row) => {
                                                        const id = row.cells[2].data;
                                                        
                                                        if (!permissions.canEdit && !permissions.canDelete) {
                                                            return html(`<span class="text-muted">-</span>`);
                                                        }
                                                        
                                                        let buttons = '<div class="btn-action-group">';
                                                        
                                                        if (permissions.canEdit) {
                                                            buttons += `
                                                                <button 
                                                                    class="btn btn-sm btn-info-transparent btn-icon btn-wave" 
                                                                    title="Edit"
                                                                    onclick="handleEditClick(${id})"
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
                                                                    onclick="handleDeleteClick(${id})"
                                                                >
                                                                    <i class="ri-delete-bin-line"></i>
                                                                </button>
                                                            `;
                                                        }
                                                        
                                                        buttons += '</div>';
                                                        return html(buttons);
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

export default VenueTable;