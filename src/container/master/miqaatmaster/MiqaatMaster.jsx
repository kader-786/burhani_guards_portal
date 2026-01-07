import React, { Fragment, useState, useEffect, useMemo, useRef} from 'react';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
import { Card, Row, Col } from 'react-bootstrap';
import IconButton from '../../elements/button'; 
import { Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import Swal from 'sweetalert2';
import HijriDate from 'hijri-converter';
 
import ConfirmDeleteModal from '../../../components/common/modalcloses/confirmdelete';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ========================================
// HELPER FUNCTIONS FOR HIJRI CONVERSION
// ========================================

/**
 * Convert Gregorian date to Hijri date
 * @param {string} gregorianDateString - Date in YYYY-MM-DD format
 * @returns {string} Hijri date in YYYY-MM-DD format
 */
// const gregorianToHijri = (gregorianDateString) => {
//     try {
//         if (!gregorianDateString) return '';
        
//         const date = new Date(gregorianDateString);
//         const year = date.getFullYear();
//         const month = date.getMonth() + 1; // JS months are 0-indexed
//         const day = date.getDate();
        
//         // Convert to Hijri using hijri-converter
//         const hijriDate = new HijriDate.toHijri(year, month, day);
        
//         // Format as YYYY-MM-DD for the date input
//         const hijriYear = hijriDate.hy;
//         const hijriMonth = String(hijriDate.hm).padStart(2, '0');
//         const hijriDay = String(hijriDate.hd).padStart(2, '0');
        
//         return `${hijriYear}-${hijriMonth}-${hijriDay}`;
//     } catch (error) {
//         console.error('Error converting to Hijri:', error);
//         return '';
//     }
// };

const gregorianToHijri = (gregorianDateString) => {
    try {
        if (!gregorianDateString) return '';
        
        const date = new Date(gregorianDateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // Convert to Hijri
        const hijriDate = new HijriDate.toHijri(year, month, day);
        
        // ADD 1 DAY OFFSET for Dawoodi Bohra calendar alignment
        let hijriYear = hijriDate.hy;
        let hijriMonth = hijriDate.hm;
        let hijriDay = hijriDate.hd + 1; // Add 1 day
        
        // Handle month/year overflow
        const daysInMonth = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29]; // Hijri months
        if (hijriDay > daysInMonth[hijriMonth - 1]) {
            hijriDay = 1;
            hijriMonth++;
            if (hijriMonth > 12) {
                hijriMonth = 1;
                hijriYear++;
            }
        }
        
        // Format as YYYY-MM-DD
        const formattedMonth = String(hijriMonth).padStart(2, '0');
        const formattedDay = String(hijriDay).padStart(2, '0');
        
        return `${hijriYear}-${formattedMonth}-${formattedDay}`;
    } catch (error) {
        console.error('Error converting to Hijri:', error);
        return '';
    }
};
/**
 * Convert Hijri date to Gregorian date (for validation if needed)
 * @param {string} hijriDateString - Hijri date in YYYY-MM-DD format
 * @returns {string} Gregorian date in YYYY-MM-DD format
 */
const hijriToGregorian = (hijriDateString) => {
    try {
        if (!hijriDateString) return '';
        
        const [year, month, day] = hijriDateString.split('-').map(Number);
        
        // Convert to Gregorian
        const gregorianDate = new HijriDate.toGregorian(year, month, day);
        
        // Format as YYYY-MM-DD
        const gregYear = gregorianDate.gy;
        const gregMonth = String(gregorianDate.gm).padStart(2, '0');
        const gregDay = String(gregorianDate.gd).padStart(2, '0');
        
        return `${gregYear}-${gregMonth}-${gregDay}`;
    } catch (error) {
        console.error('Error converting to Gregorian:', error);
        return '';
    }
};

// ========================================
// ADD MIQAAT COMPONENT
// ========================================

const AddMiqaat = ({ 
    show, 
    onClose, 
    onSave,
    editData = null,
    title = "Add New Miqaat"
}) => {
    
    const [formData, setFormData] = useState({
        miqaatName: '',
        miqaatType: null,
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        reportingTime: '',
        venue: null,
        jamaat: null,
        jamiaat: null,
        quantity: '',
        isActive: true,
        hijriStartDate: '',
        hijriEndDate: ''
    });

    const [miqaatTypeOptions, setMiqaatTypeOptions] = useState([]);
    const [jamiaatOptions, setJamiaatOptions] = useState([]);
    const [jamaatOptions, setJamaatOptions] = useState([]);
    const [venueOptions, setVenueOptions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingJamaat, setLoadingJamaat] = useState(false);
    const [loadingVenues, setLoadingVenues] = useState(false);
    const [errors, setErrors] = useState({});

    // Track whether Hijri dates are being manually edited
    // const [hijriManuallyEdited, setHijriManuallyEdited] = useState({
    //     start: false,
    //     end: false
    // });

    // Refs for date/time inputs to trigger pickers on click
    const startDateRef = useRef(null);
    const startTimeRef = useRef(null);
    const endDateRef = useRef(null);
    const endTimeRef = useRef(null);
    const reportingTimeRef = useRef(null);
    const hijriStartDateRef = useRef(null);
    const hijriEndDateRef = useRef(null);

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getCurrentTime = () => {
        const now = new Date();
        return now.toTimeString().slice(0, 5);
    };

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

    // Function to open date/time picker programmatically
    const openPicker = (ref) => {
        if (ref.current) {
            try {
                ref.current.showPicker();
            } catch (error) {
                // Fallback for browsers that don't support showPicker
                ref.current.focus();
                ref.current.click();
            }
        }
    };

    useEffect(() => {
        if (show) {
            fetchMiqaatTypes();
            fetchJamiaat();
            fetchVenues();
        }
    }, [show]);

    // Auto-calculate Hijri Start Date when English Start Date changes
    // useEffect(() => {
    //     if (formData.startDate && !hijriManuallyEdited.start) {
    //         const hijriDate = gregorianToHijri(formData.startDate);
    //         setFormData(prev => ({
    //             ...prev,
    //             hijriStartDate: hijriDate
    //         }));
    //     }
    // }, [formData.startDate, hijriManuallyEdited.start]);

    useEffect(() => {
    if (formData.startDate) {
        const hijriDate = gregorianToHijri(formData.startDate);
        setFormData(prev => ({ ...prev, hijriStartDate: hijriDate }));
    }
}, [formData.startDate]);

    // Auto-calculate Hijri End Date when English End Date changes
    // useEffect(() => {
    //     if (formData.endDate && !hijriManuallyEdited.end) {
    //         const hijriDate = gregorianToHijri(formData.endDate);
    //         setFormData(prev => ({
    //             ...prev,
    //             hijriEndDate: hijriDate
    //         }));
    //     }
    // }, [formData.endDate, hijriManuallyEdited.end]);
    useEffect(() => {
    if (formData.endDate) {
        const hijriDate = gregorianToHijri(formData.endDate);
        setFormData(prev => ({ ...prev, hijriEndDate: hijriDate }));
    }
}, [formData.endDate]);


    const fetchMiqaatTypes = async () => {
        try {
            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                console.error('Access token not found');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Miqaat/GetAllMiqaatTypes`, {
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
                    const options = result.data.map(item => ({
                        value: item.miqaat_type_id,
                        label: item.miqaat_type_name
                    }));
                    setMiqaatTypeOptions(options);
                }
            }
        } catch (error) {
            console.error('Error fetching miqaat types:', error);
        }
    };

    const fetchJamiaat = async () => {
        try {
            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                console.error('Access token not found');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Team/GetAllJamiaats`, {
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
                    const options = result.data.map(item => ({
                        value: item.jamiaat_id,
                        label: item.jamiaat_name
                    }));
                    setJamiaatOptions(options);
                }
            }
        } catch (error) {
            console.error('Error fetching jamiaat:', error);
        }
    };

    const fetchVenues = async () => {
        setLoadingVenues(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                console.error('Access token not found');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Venue/GetAllVenues`, {
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
                    const options = result.data.map(item => ({
                        value: item.venue_id,
                        label: item.venue_name
                    }));
                    setVenueOptions(options);
                }
            }
        } catch (error) {
            console.error('Error fetching venues:', error);
        } finally {
            setLoadingVenues(false);
        }
    };

    const fetchJamaatByJamiaat = async (jamiaatId) => {
        try {
            setLoadingJamaat(true);
            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                console.error('Access token not found');
                return;
            }

            const requestBody = {
                jamiaat_id: jamiaatId
            };

            const response = await fetch(`${API_BASE_URL}/Miqaat/GetJamaatsByJamiaat`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const options = result.data.map(item => ({
                        value: item.jamaat_id,
                        label: item.jamaat_name
                    }));
                    setJamaatOptions(options);
                } else {
                    setJamaatOptions([]);
                }
            } else {
                console.error('Failed to fetch jamaat:', response.status);
                setJamaatOptions([]);
            }
        } catch (error) {
            console.error('Error fetching jamaat:', error);
            setJamaatOptions([]);
        } finally {
            setLoadingJamaat(false);
        }
    };

    const handleJamiaatChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            jamiaat: selectedOption,
            jamaat: null
        }));
        
        if (errors.jamiaat) {
            setErrors(prev => ({ ...prev, jamiaat: '' }));
        }

        if (selectedOption) {
            fetchJamaatByJamiaat(selectedOption.value);
        } else {
            setJamaatOptions([]);
        }
    };

    useEffect(() => {
        if (editData) {
            setFormData({
                miqaatName: editData.miqaatName || '',
                miqaatType: editData.miqaatTypeId ? 
                    { value: editData.miqaatTypeId, label: editData.miqaatType } 
                    : null,
                startDate: editData.startDate || '',
                startTime: editData.startTime || '',
                endDate: editData.endDate || '',
                endTime: editData.endTime || '',
                reportingTime: editData.reportingTime || '',
                venue: editData.venue || null,
                jamaat: editData.jamaatId ? 
                    { value: editData.jamaatId, label: editData.jamaat }
                    : null,
                jamiaat: editData.jamiaatId ? 
                    { value: editData.jamiaatId, label: editData.jamiaat }
                    : null,
                quantity: editData.quantity || '',
                isActive: editData.isActive !== undefined ? editData.isActive : true,
                hijriStartDate: editData.hijriStartDate || '',
                hijriEndDate: editData.hijriEndDate || ''
            });
            setErrors({});
            // Mark as manually edited if edit data has Hijri dates
            // setHijriManuallyEdited({
            //     start: !!editData.hijriStartDate,
            //     end: !!editData.hijriEndDate
            // });
        } else {
            handleClear();
        }
    }, [editData, show]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Special handler for Hijri date changes (marks as manually edited)
    // const handleHijriDateChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData(prev => ({
    //         ...prev,
    //         [name]: value
    //     }));
        
    //     // Mark as manually edited
    //     if (name === 'hijriStartDate') {
    //         setHijriManuallyEdited(prev => ({ ...prev, start: true }));
    //     } else if (name === 'hijriEndDate') {
    //         setHijriManuallyEdited(prev => ({ ...prev, end: true }));
    //     }
        
    //     if (errors[name]) {
    //         setErrors(prev => ({ ...prev, [name]: '' }));
    //     }
    // };

    const handleSelectChange = (name, selectedOption) => {
        setFormData(prev => ({
            ...prev,
            [name]: selectedOption
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.miqaatName.trim()) {
            newErrors.miqaatName = 'Miqaat Name is required';
        }

        if (!formData.miqaatType) {
            newErrors.miqaatType = 'Miqaat Type is required';
        }

        if (!formData.jamiaat) {
            newErrors.jamiaat = 'Jamiaat is required';
        }

        if (!formData.venue) {
            newErrors.venue = 'Venue is required';
        }

        if (!formData.quantity) {
            newErrors.quantity = 'HR Requirement is required';
        } else if (formData.quantity <= 0) {
            newErrors.quantity = 'HR Requirement must be greater than 0';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Start Date is required';
        }

        if (!formData.startTime) {
            newErrors.startTime = 'Start Time is required';
        }

        if (!formData.endDate) {
            newErrors.endDate = 'End Date is required';
        }

        if (!formData.endTime) {
            newErrors.endTime = 'End Time is required';
        }

        if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
            const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
            
            if (endDateTime <= startDateTime) {
                newErrors.endDate = 'End Date & Time must be greater than Start Date & Time';
            }
        }

        if (!formData.hijriStartDate) {
            newErrors.hijriStartDate = 'Hijri Start Date is required';
        }

        if (!formData.hijriEndDate) {
            newErrors.hijriEndDate = 'Hijri End Date is required';
        }

        if (!formData.reportingTime) {
            newErrors.reportingTime = 'Reporting Time is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

            const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
            const endDateTime = `${formData.endDate}T${formData.endTime}:00`;
            
            const reportingTimeFormatted = formData.reportingTime ? 
                (formData.reportingTime.includes(':') && formData.reportingTime.split(':').length === 2 ?
                    `${formData.reportingTime}:00` : formData.reportingTime)
                : null;

            const requestBody = {
                miqaat_name: formData.miqaatName,
                miqaat_type_id: formData.miqaatType.value,
                start_date: startDateTime,
                end_date: endDateTime,
                reporting_time: reportingTimeFormatted,
                venue_id: formData.venue.value,
                jamaat_id: formData.jamaat ? formData.jamaat.value : null,
                jamiaat_id: formData.jamiaat.value,
                quantity: parseInt(formData.quantity),
                is_active: formData.isActive,
                hijri_start_date: formData.hijriStartDate,
                hijri_end_date: formData.hijriEndDate
            };

            console.log('Sending request:', requestBody);

            const response = await fetch(`${API_BASE_URL}/Miqaat/InsertMiqaat`, {
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
                showSuccessAlert(result.message || 'Miqaat added successfully!');
            } else {
                if (result.data && result.data.result_code === 4) {
                    setErrors({ miqaatName: 'Miqaat name already exists' });
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Miqaat name already exists',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(result.message || 'Failed to add miqaat');
                }
            }
        } catch (error) {
            console.error('Error saving miqaat:', error);
            setErrors({ submit: error.message });
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while saving the miqaat',
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
            miqaatName: '',
            miqaatType: null,
            startDate: '',
            startTime: '',
            endDate: '',
            endTime: '',
            reportingTime: '',
            venue: null,
            jamaat: null,
            jamiaat: null,
            quantity: '',
            isActive: true,
            hijriStartDate: '',
            hijriEndDate: ''
        });
        setErrors({});
        setJamaatOptions([]);
        // setHijriManuallyEdited({ start: false, end: false });
    };

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '38px',
            borderColor: state.selectProps.error ? '#dc3545' : '#dee2e6',
            '&:hover': {
                borderColor: state.selectProps.error ? '#dc3545' : '#86b7fe'
            }
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

                    .datetime-row {
                        display: flex;
                        gap: 10px;
                    }

                    .datetime-row .date-input {
                        flex: 1.5;
                    }

                    .datetime-row .time-input {
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

                    .form-control[type="date"],
                    .form-control[type="time"] {
                        cursor: pointer;
                    }

                    .checkbox-wrapper {
                        display: flex;
                        align-items: center;
                    }

                    .checkbox-wrapper .form-check {
                        margin-bottom: 0;
                    }

                    .checkbox-wrapper .form-check-input {
                        width: 18px;
                        height: 18px;
                        cursor: pointer;
                    }

                    .checkbox-wrapper .form-check-label {
                        cursor: pointer;
                        margin-left: 5px;
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

                    .hijri-date-indicator {
                        font-size: 11px;
                        color: #6c757d;
                        margin-top: 2px;
                        font-style: italic;
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

                        .datetime-row {
                            flex-direction: column;
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
                        <i className={`ri-${editData ? 'edit' : 'add-circle'}-line me-2`}></i>
                        {editData ? 'Edit Miqaat' : title}
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

                {/* Line 1: Miqaat Name, Miqaat Type */}
                <div className="form-row-inline">
                    <div className="horizontal-form-group">
                        <Form.Label>Miqaat Name <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Form.Control
                                type="text"
                                name="miqaatName"
                                value={formData.miqaatName}
                                onChange={handleInputChange}
                                placeholder="Enter Miqaat Name"
                                className={errors.miqaatName ? 'is-invalid' : ''}
                                disabled={loading}
                            />
                            {errors.miqaatName && <div className="error-text">{errors.miqaatName}</div>}
                        </div>
                    </div>

                    <div className="horizontal-form-group">
                        <Form.Label>Miqaat Type <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Select
                                options={miqaatTypeOptions}
                                value={formData.miqaatType}
                                onChange={(option) => handleSelectChange('miqaatType', option)}
                                placeholder="Select Miqaat Type"
                                isClearable
                                styles={selectStyles}
                                error={errors.miqaatType}
                                isDisabled={loading}
                            />
                            {errors.miqaatType && <div className="error-text">{errors.miqaatType}</div>}
                        </div>
                    </div>
                </div>

                {/* Line 2: Jamiaat, Jamaat */}
                <div className="form-row-inline">
                    <div className="horizontal-form-group">
                        <Form.Label>Jamiaat <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Select
                                options={jamiaatOptions}
                                value={formData.jamiaat}
                                onChange={handleJamiaatChange}
                                placeholder="Select Jamiaat"
                                isClearable
                                styles={selectStyles}
                                error={errors.jamiaat}
                                isDisabled={loading}
                            />
                            {errors.jamiaat && <div className="error-text">{errors.jamiaat}</div>}
                        </div>
                    </div>

                    <div className="horizontal-form-group">
                        <Form.Label>Jamaat</Form.Label>
                        <div className="form-input-wrapper">
                            <Select
                                options={jamaatOptions}
                                value={formData.jamaat}
                                onChange={(option) => handleSelectChange('jamaat', option)}
                                placeholder={loadingJamaat ? "Loading..." : "Select Jamaat"}
                                isClearable
                                styles={selectStyles}
                                error={errors.jamaat}
                                isDisabled={loading || loadingJamaat || !formData.jamiaat}
                                noOptionsMessage={() => formData.jamiaat ? "No jamaat found" : "Please select Jamiaat first"}
                            />
                            {errors.jamaat && <div className="error-text">{errors.jamaat}</div>}
                        </div>
                    </div>
                </div>

                {/* Line 3: Venue, HR Requirement */}
                <div className="form-row-inline">
                    <div className="horizontal-form-group">
                        <Form.Label>Venue <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Select
                                options={venueOptions}
                                value={formData.venue}
                                onChange={(option) => handleSelectChange('venue', option)}
                                placeholder={loadingVenues ? "Loading..." : "Select Venue"}
                                isClearable
                                styles={selectStyles}
                                error={errors.venue}
                                isDisabled={loading || loadingVenues}
                                isLoading={loadingVenues}
                                noOptionsMessage={() => "No venues available"}
                            />
                            {errors.venue && <div className="error-text">{errors.venue}</div>}
                        </div>
                    </div>

                    <div className="horizontal-form-group">
                        <Form.Label>HR Requirement <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Form.Control
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                placeholder="Enter HR Requirement"
                                min="1"
                                className={errors.quantity ? 'is-invalid' : ''}
                                disabled={loading}
                            />
                            {errors.quantity && <div className="error-text">{errors.quantity}</div>}
                        </div>
                    </div>
                </div>

                {/* Line 4: Start Date & Time, End Date & Time */}
                <div className="form-row-inline">
                    <div className="horizontal-form-group">
                        <Form.Label>Start Date & Time <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <div className="datetime-row">
                                <div className="date-input">
                                    <Form.Control
                                        ref={startDateRef}
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        onClick={() => openPicker(startDateRef)}
                                        className={errors.startDate ? 'is-invalid' : ''}
                                        disabled={loading}
                                    />
                                    {errors.startDate && <div className="error-text">{errors.startDate}</div>}
                                </div>
                                <div className="time-input">
                                    <Form.Control
                                        ref={startTimeRef}
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        onClick={() => openPicker(startTimeRef)}
                                        className={errors.startTime ? 'is-invalid' : ''}
                                        disabled={loading}
                                        step="300"
                                    />
                                    {errors.startTime && <div className="error-text">{errors.startTime}</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="horizontal-form-group">
                        <Form.Label>End Date & Time <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <div className="datetime-row">
                                <div className="date-input">
                                    <Form.Control
                                        ref={endDateRef}
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        onClick={() => openPicker(endDateRef)}
                                        className={errors.endDate ? 'is-invalid' : ''}
                                        disabled={loading}
                                    />
                                    {errors.endDate && <div className="error-text">{errors.endDate}</div>}
                                </div>
                                <div className="time-input">
                                    <Form.Control
                                        ref={endTimeRef}
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        onClick={() => openPicker(endTimeRef)}
                                        className={errors.endTime ? 'is-invalid' : ''}
                                        disabled={loading}
                                        step="300"
                                    />
                                    {errors.endTime && <div className="error-text">{errors.endTime}</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line 5: Hijri Start Date, Hijri End Date */}
                <div className="form-row-inline">
                    <div className="horizontal-form-group">
                        <Form.Label>Hijri Start Date <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Form.Control
                                ref={hijriStartDateRef}
                                type="date"
                                name="hijriStartDate"
                                value={formData.hijriStartDate}
                                // onChange={handleHijriDateChange}
                                onChange={handleInputChange}
                                onClick={() => openPicker(hijriStartDateRef)}
                                className={errors.hijriStartDate ? 'is-invalid' : ''}
                                disabled={loading}
                            />
                            {/* {!hijriManuallyEdited.start && formData.startDate && (
                                <div className="hijri-date-indicator">
                                    Auto-calculated from Start Date
                                </div>
                            )} */}
                            {errors.hijriStartDate && <div className="error-text">{errors.hijriStartDate}</div>}
                        </div>
                    </div>

                    <div className="horizontal-form-group">
                        <Form.Label>Hijri End Date <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Form.Control
                                ref={hijriEndDateRef}
                                type="date"
                                name="hijriEndDate"
                                value={formData.hijriEndDate}
                                // onChange={handleHijriDateChange}
                                onChange={handleInputChange}
                                onClick={() => openPicker(hijriEndDateRef)}
                                className={errors.hijriEndDate ? 'is-invalid' : ''}
                                disabled={loading}
                            />
                            {/* {!hijriManuallyEdited.end && formData.endDate && (
                                <div className="hijri-date-indicator">
                                    Auto-calculated from End Date
                                </div>
                            )} */}
                            {errors.hijriEndDate && <div className="error-text">{errors.hijriEndDate}</div>}
                        </div>
                    </div>
                </div>

                {/* Line 6: Reporting Time (TIME ONLY), Active Checkbox */}
                <div className="form-row-inline">
                    <div className="horizontal-form-group">
                        <Form.Label>Reporting Time <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <Form.Control
                                ref={reportingTimeRef}
                                type="time"
                                name="reportingTime"
                                value={formData.reportingTime}
                                onChange={handleInputChange}
                                onClick={() => openPicker(reportingTimeRef)}
                                className={errors.reportingTime ? 'is-invalid' : ''}
                                disabled={loading}
                                step="300"
                            />
                            {errors.reportingTime && <div className="error-text">{errors.reportingTime}</div>}
                        </div>
                    </div>

                    <div className="horizontal-form-group">
                        <Form.Label></Form.Label>
                        <div className="form-input-wrapper">
                            <div className="checkbox-wrapper">
                                <Form.Check
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    label="Active"
                                    disabled={loading}
                                />
                            </div>
                        </div>
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

// ========================================
// MIQAAT TABLE COMPONENT
// ========================================

const MiqaatTable = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editMiqaatId, setEditMiqaatId] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gridKey, setGridKey] = useState(0);

    const fetchMiqaatData = async () => {
        try {
            setLoading(true);
            setError(null);

            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const apiUrl = `${API_BASE_URL}/Miqaat/GetAllMiqaat`;

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
                    id: item.miqaat_id,
                    srNo: index + 1,
                    miqaatName: item.miqaat_name,
                    miqaatType: item.miqaat_type_name,
                    miqaatTypeId: item.miqaat_type_id,
                    startDate: formatDate(item.start_date),
                    startTime: extractTime(item.start_date),
                    endDate: formatDate(item.end_date),
                    endTime: extractTime(item.end_date),
                    endDateRaw: item.end_date,
                    venue: item.venue_name || '-',
                    venueId: item.venue_id,
                    jamaat: item.jamaat_name || '-',
                    jamaatId: item.jamaat_id,
                    jamiaat: item.jamiaat_name || '-',
                    jamiaatId: item.jamiaat_id,
                    quantity: item.quantity || 0,
                    isActive: item.is_active,
                    reportingTime: extractTime(item.reporting_time),
                    hijriStartDate: item.hijri_start_date || '-',
                    hijriEndDate: item.hijri_end_date || '-'
                }));
                setTableData(transformedData);
            } else {
                throw new Error(result.message || 'Failed to fetch miqaat data');
            }
        } catch (err) {
            console.error('Error fetching miqaat data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toISOString().split('T')[0];
    };

    const extractTime = (timeString) => {
        if (!timeString) return '-';
        
        if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
            const [hours, minutes] = timeString.split(':');
            return `${hours}:${minutes}`;
        }
        
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return '-';
        
        return date.toTimeString().slice(0, 5);
    };

    useEffect(() => {
        fetchMiqaatData();
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
        setEditMiqaatId(null);
    };

    const handleSave = (data) => {
        console.log('Saved Data:', data);
        setShowAddForm(false);
        fetchMiqaatData();
        setGridKey(prev => prev + 1);
    };

    const handleUpdate = (data) => {
        console.log('Updated Data:', data);
        setShowEditForm(false);
        setEditMiqaatId(null);
        
        setTableData(prevData => {
            return prevData.map(item => {
                if (item.id === data.miqaat_id) {
                    return {
                        ...item,
                        miqaatName: data.miqaat_name,
                        miqaatType: data.miqaat_type_name,
                        miqaatTypeId: data.miqaat_type_id,
                        startDate: formatDate(data.start_date),
                        startTime: extractTime(data.start_date),
                        endDate: formatDate(data.end_date),
                        endTime: extractTime(data.end_date),
                        endDateRaw: data.end_date,
                        venue: data.venue_name || '-',
                        venueId: data.venue_id,
                        jamaat: data.jamaat_name || '-',
                        jamaatId: data.jamaat_id,
                        jamiaat: data.jamiaat_name || '-',
                        jamiaatId: data.jamiaat_id,
                        quantity: data.quantity || 0,
                        isActive: data.is_active,
                        reportingTime: extractTime(data.reporting_time),
                        hijriStartDate: data.hijri_start_date || '-',
                        hijriEndDate: data.hijri_end_date || '-'
                    };
                }
                return item;
            });
        });
        
        setGridKey(prev => prev + 1);
        
        setTimeout(() => {
            fetchMiqaatData();
        }, 500);
    };

    const handleEdit = (id) => {
        console.log('Editing miqaat ID:', id);
        setEditMiqaatId(id);
        setShowEditForm(true);
    };

    const handleDelete = async (id) => {
        const miqaatToDelete = tableData.find(item => item.id === id);
        const miqaatName = miqaatToDelete ? miqaatToDelete.miqaatName : 'this miqaat';
        
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${miqaatName}".`,
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

            const response = await fetch(`${API_BASE_URL}/Miqaat/DeleteMiqaat`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    miqaat_id: id
                })
            });

            const apiResult = await response.json();

            if (response.ok && apiResult.success) {
                const resultCode = Number(apiResult.data?.result_code);
                
                if (resultCode === 3) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: apiResult.message || 'Miqaat has been deleted successfully.',
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
                            await fetchMiqaatData();
                            console.log('Table synced with server');
                        } catch (error) {
                            console.error('Background sync failed:', error);
                        }
                    }, 500);

                } else if (resultCode === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed',
                        text: 'Miqaat not found or already deleted',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(apiResult.message || 'Failed to delete miqaat');
                }
            } else {
                throw new Error(apiResult.message || `Server error: ${response.status}`);
            }

        } catch (error) {
            console.error('Error deleting miqaat:', error);
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
            item.miqaatName,
            item.miqaatType,
            item.venue,
            item.jamaat,
            item.quantity,
            item.isActive ? 'Active' : 'Inactive',
            item.reportingTime,
            item.id
        ]);
    }, [tableData]);

    return (
        <Fragment>
            <style>
                {`
                    #grid-miqaat-table .gridjs-search {
                        width: 100%;
                        margin-bottom: 1rem;
                    }
                    #grid-miqaat-table .gridjs-search-input {
                        width: 100%;
                        padding: 8px 12px;
                        border: 1px solid #dee2e6;
                        border-radius: 6px;
                        font-size: 14px;
                    }
                    #grid-miqaat-table .gridjs-search-input:focus {
                        outline: none;
                        border-color: #0d6efd;
                        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                    }
                    #grid-miqaat-table .gridjs-wrapper {
                        margin-top: 0.5rem;
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                    #grid-miqaat-table .gridjs-table {
                        min-width: 1200px;
                    }
                    #grid-miqaat-table .gridjs-container {
                        padding: 0;
                    }
                    #grid-miqaat-table .gridjs-th-sort {
                        position: relative;
                        cursor: pointer;
                    }
                    #grid-miqaat-table .gridjs-th-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                    }
                    #grid-miqaat-table button.gridjs-sort {
                        background: none;
                        border: none;
                        width: 20px;
                        height: 20px;
                        position: relative;
                        cursor: pointer;
                        float: right;
                        margin-left: 8px;
                    }
                    #grid-miqaat-table button.gridjs-sort::before,
                    #grid-miqaat-table button.gridjs-sort::after {
                        content: '';
                        position: absolute;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 0;
                        height: 0;
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                    }
                    #grid-miqaat-table button.gridjs-sort::before {
                        top: 2px;
                        border-bottom: 6px solid #bbb;
                    }
                    #grid-miqaat-table button.gridjs-sort::after {
                        bottom: 2px;
                        border-top: 6px solid #bbb;
                    }
                    #grid-miqaat-table button.gridjs-sort-asc::before {
                        border-bottom-color: #333;
                    }
                    #grid-miqaat-table button.gridjs-sort-asc::after {
                        border-top-color: #bbb;
                    }
                    #grid-miqaat-table button.gridjs-sort-desc::before {
                        border-bottom-color: #bbb;
                    }
                    #grid-miqaat-table button.gridjs-sort-desc::after {
                        border-top-color: #333;
                    }
                    #grid-miqaat-table .gridjs-sort-neutral,
                    #grid-miqaat-table .gridjs-sort-asc,
                    #grid-miqaat-table .gridjs-sort-desc {
                        background-image: none !important;
                    }
                    #grid-miqaat-table .gridjs-footer {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 0;
                        border-top: 1px solid #e9ecef;
                        margin-top: 1rem;
                    }
                    #grid-miqaat-table .gridjs-pagination {
                        display: flex;
                        width: 100%;
                        justify-content: space-between;
                        align-items: center;
                    }
                    #grid-miqaat-table .gridjs-summary {
                        order: 1;
                        color: #6c757d;
                        font-size: 14px;
                    }
                    #grid-miqaat-table .gridjs-pages {
                        order: 2;
                        display: flex;
                        gap: 5px;
                    }
                    #grid-miqaat-table .gridjs-pages button {
                        min-width: 35px;
                        height: 35px;
                        border: 1px solid #dee2e6;
                        background: #fff;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-size: 14px;
                    }
                    #grid-miqaat-table .gridjs-pages button:hover:not(:disabled) {
                        background: #e9ecef;
                        border-color: #adb5bd;
                    }
                    #grid-miqaat-table .gridjs-pages button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    #grid-miqaat-table .gridjs-pages button.gridjs-currentPage {
                        background: var(--primary-color, #0d6efd);
                        color: #fff;
                        border-color: var(--primary-color, #0d6efd);
                    }
                    #grid-miqaat-table .btn-action-group {
                        display: inline-flex;
                        gap: 10px;
                        align-items: center;
                    }
                    #grid-miqaat-table .btn-action-group .btn {
                        margin: 0 !important;
                    }
                    #grid-miqaat-table .gridjs-wrapper::-webkit-scrollbar {
                        height: 8px;
                    }
                    #grid-miqaat-table .gridjs-wrapper::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 4px;
                    }
                    #grid-miqaat-table .gridjs-wrapper::-webkit-scrollbar-thumb {
                        background: #c1c1c1;
                        border-radius: 4px;
                    }
                    #grid-miqaat-table .gridjs-wrapper::-webkit-scrollbar-thumb:hover {
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

            <AddMiqaat
                show={showAddForm}
                onClose={handleCloseAddModal}
                onSave={handleSave}
            />

            <EditMiqaat
                show={showEditForm}
                onClose={handleCloseEditModal}
                onUpdate={handleUpdate}
                miqaatId={editMiqaatId}
            />

            <Row>
                <Col xl={12}>
                    <Card className="custom-card">
                        <Card.Header className="d-flex align-items-center justify-content-between">
                            <div>
                                <Card.Title className="mb-1">
                                    Miqaat Master
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
                                    <p className="mt-3">Loading miqaat data...</p>
                                </div>
                            ) : error ? (
                                <div className="error-container">
                                    <i className="ri-error-warning-line" style={{ fontSize: '48px' }}></i>
                                    <div className="error-message">
                                        <div className="error-title">⚠️ Error Loading Miqaat</div>
                                        <div className="error-details">{error}</div>
                                    </div>
                                    <button 
                                        className="btn btn-primary mt-3" 
                                        onClick={fetchMiqaatData}
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
                                    <p className="mt-3">No miqaat records found</p>
                                    <button 
                                        className="btn btn-primary mt-2" 
                                        onClick={handleAdd}
                                    >
                                        <i className="ri-add-line me-2"></i>
                                        Add First Miqaat
                                    </button>
                                </div>
                            ) : (
                                <div id="grid-miqaat-table">
                                    <Grid
                                        key={gridKey}
                                        data={gridData}
                                        sort={true}
                                        search={{
                                            enabled: true,
                                            placeholder: 'Search miqaat...'
                                        }}
                                        columns={[
                                            { 
                                                name: 'Sr',
                                                width: '80px',
                                                sort: true
                                            }, 
                                            { 
                                                name: 'Miqaat Name',
                                                width: '220px',
                                                sort: true
                                            }, 
                                            { 
                                                name: 'Miqaat Type',
                                                width: '130px',
                                                sort: true
                                            },
                                            { 
                                                name: 'Venue',
                                                width: '180px',
                                                sort: true
                                            },
                                            { 
                                                name: 'Jamaat',
                                                width: '130px',
                                                sort: true
                                            },
                                            { 
                                                name: 'HR Requirement',
                                                width: '130px',
                                                sort: true
                                            },
                                            { 
                                                name: 'Is Active',
                                                width: '100px',
                                                sort: true
                                            },
                                            { 
                                                name: 'Reporting Time',
                                                width: '130px',
                                                sort: true
                                            },
                                            {
                                                name: 'Action',
                                                width: '150px',
                                                sort: true,
                                                formatter: (cell, row) => {
                                                    const id = row.cells[8].data;
                                                    
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

// ========================================
// EDIT MIQAAT COMPONENT
// ========================================

const EditMiqaat = ({ 
    show, 
    onClose, 
    onUpdate, 
    miqaatId,
    title = "Edit Miqaat"
}) => {
    
    const [formData, setFormData] = useState({
        miqaatName: '',
        miqaatType: null,
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        reportingTime: '',
        venue: null,
        jamaat: null,
        jamiaat: null,
        quantity: '',
        isActive: true,
        hijriStartDate: '',
        hijriEndDate: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMiqaatData, setIsLoadingMiqaatData] = useState(false);
    const [isLoadingMiqaatTypes, setIsLoadingMiqaatTypes] = useState(false);
    const [isLoadingJamiaats, setIsLoadingJamiaats] = useState(false);
    const [isLoadingJamaats, setIsLoadingJamaats] = useState(false);
    const [isLoadingVenues, setIsLoadingVenues] = useState(false);

    const [miqaatTypeOptions, setMiqaatTypeOptions] = useState([]);
    const [jamiaatOptions, setJamiaatOptions] = useState([]);
    const [jamaatOptions, setJamaatOptions] = useState([]);
    const [venueOptions, setVenueOptions] = useState([]);

    const [originalData, setOriginalData] = useState(null);

    // Track whether Hijri dates are being manually edited
    const [hijriManuallyEdited, setHijriManuallyEdited] = useState({
        start: false,
        end: false
    });

    // Refs for date/time inputs to trigger pickers on click
    const startDateRef = useRef(null);
    const startTimeRef = useRef(null);
    const endDateRef = useRef(null);
    const endTimeRef = useRef(null);
    const reportingTimeRef = useRef(null);
    const hijriStartDateRef = useRef(null);
    const hijriEndDateRef = useRef(null);

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getCurrentTime = () => {
        const now = new Date();
        return now.toTimeString().slice(0, 5);
    };

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

    // Function to open date/time picker programmatically
    const openPicker = (ref) => {
        if (ref.current) {
            try {
                ref.current.showPicker();
            } catch (error) {
                // Fallback for browsers that don't support showPicker
                ref.current.focus();
                ref.current.click();
            }
        }
    };

    useEffect(() => {
        if (show && miqaatId) {
            const fetchAllOptions = async () => {
                console.log('Starting to fetch dropdown options...');
                await Promise.all([
                    fetchMiqaatTypes(),
                    fetchAllJamiaats(),
                    fetchVenues()
                ]);
                console.log('All dropdown options fetched, now fetching miqaat data...');
                await fetchMiqaatData(miqaatId);
            };
            fetchAllOptions();
        }
    }, [show, miqaatId]);

    // Auto-calculate Hijri Start Date when English Start Date changes (ONLY if not manually edited)
    // useEffect(() => {
    //     if (formData.startDate && !hijriManuallyEdited.start && !isLoadingMiqaatData) {
    //         const hijriDate = gregorianToHijri(formData.startDate);
    //         setFormData(prev => ({
    //             ...prev,
    //             hijriStartDate: hijriDate
    //         }));
    //     }
    // }, [formData.startDate, hijriManuallyEdited.start, isLoadingMiqaatData]);

    useEffect(() => {
    if (formData.startDate && !isLoadingMiqaatData) {
        const hijriDate = gregorianToHijri(formData.startDate);
        setFormData(prev => ({ ...prev, hijriStartDate: hijriDate }));
    }
}, [formData.startDate, isLoadingMiqaatData]);


    // Auto-calculate Hijri End Date when English End Date changes (ONLY if not manually edited)
    useEffect(() => {
        if (formData.endDate && !hijriManuallyEdited.end && !isLoadingMiqaatData) {
            const hijriDate = gregorianToHijri(formData.endDate);
            setFormData(prev => ({
                ...prev,
                hijriEndDate: hijriDate
            }));
        }
    }, [formData.endDate, hijriManuallyEdited.end, isLoadingMiqaatData]);
 
    const fetchMiqaatData = async (id) => {
        setIsLoadingMiqaatData(true);
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Authentication token not found. Please login again.',
                    confirmButtonText: 'OK'
                });
                setIsLoadingMiqaatData(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Miqaat/GetMiqaatById`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    miqaat_id: id
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
                const miqaatData = result.data[0];
                
                console.log('Miqaat Data:', miqaatData);
                
                const startDateTime = new Date(miqaatData.start_date);
                const endDateTime = new Date(miqaatData.end_date);
                
                let reportingTimeValue = '';
                
                if (miqaatData.reporting_time) {
                    if (miqaatData.reporting_time.match(/^\d{2}:\d{2}:\d{2}$/)) {
                        reportingTimeValue = miqaatData.reporting_time.slice(0, 5);
                    } else {
                        const reportingDateTime = new Date(miqaatData.reporting_time);
                        if (!isNaN(reportingDateTime.getTime())) {
                            reportingTimeValue = reportingDateTime.toTimeString().slice(0, 5);
                        }
                    }
                }

                const miqaatTypeObj = miqaatData.miqaat_type_id ? {
                    value: miqaatData.miqaat_type_id,
                    label: miqaatData.miqaat_type_name
                } : null;

                const jamiaatObj = miqaatData.jamiaat_id ? {
                    value: miqaatData.jamiaat_id,
                    label: miqaatData.jamiaat_name
                } : null;

                const jamaatObj = miqaatData.jamaat_id ? {
                    value: miqaatData.jamaat_id,
                    label: miqaatData.jamaat_name
                } : null;

                const venueObj = miqaatData.venue_id ? {
                    value: miqaatData.venue_id,
                    label: miqaatData.venue_name
                } : null;

                const initialFormData = {
                    miqaatName: miqaatData.miqaat_name || '',
                    miqaatType: miqaatTypeObj,
                    startDate: startDateTime.toISOString().split('T')[0],
                    startTime: startDateTime.toTimeString().slice(0, 5),
                    endDate: endDateTime.toISOString().split('T')[0],
                    endTime: endDateTime.toTimeString().slice(0, 5),
                    reportingTime: reportingTimeValue,
                    venue: venueObj,
                    jamaat: jamaatObj,
                    jamiaat: jamiaatObj,
                    quantity: miqaatData.quantity?.toString() || '',
                    isActive: miqaatData.is_active !== undefined ? miqaatData.is_active : true,
                    hijriStartDate: miqaatData.hijri_start_date || '',
                    hijriEndDate: miqaatData.hijri_end_date || ''
                };
                
                console.log('Form Data Being Set:', initialFormData);
                
                setFormData(initialFormData);
                setOriginalData(initialFormData);

                // Mark as manually edited if Hijri dates exist
                // setHijriManuallyEdited({
                //     start: !!miqaatData.hijri_start_date,
                //     end: !!miqaatData.hijri_end_date
                // });



                if (miqaatData.jamiaat_id) {
                    await fetchJamaatsByJamiaat(miqaatData.jamiaat_id);
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Failed to load miqaat data',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error fetching miqaat data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error loading miqaat data. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoadingMiqaatData(false);
        }
    };

    const fetchMiqaatTypes = async () => {
        setIsLoadingMiqaatTypes(true);
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                console.error('Authentication token not found');
                setIsLoadingMiqaatTypes(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Miqaat/GetAllMiqaatTypes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.status === 401) {
                console.error('Session expired');
                return;
            }

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.miqaat_type_id,
                    label: item.miqaat_type_name
                }));
                setMiqaatTypeOptions(options);
                console.log('Miqaat Type Options Loaded:', options);
            }
        } catch (error) {
            console.error('Error fetching Miqaat Types:', error);
        } finally {
            setIsLoadingMiqaatTypes(false);
        }
    };

    const fetchAllJamiaats = async () => {
        setIsLoadingJamiaats(true);
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                console.error('Authentication token not found');
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
                console.error('Session expired');
                return;
            }

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.jamiaat_id,
                    label: item.jamiaat_name
                }));
                setJamiaatOptions(options);
                console.log('Jamiaat Options Loaded:', options);
            }
        } catch (error) {
            console.error('Error fetching Jamiaats:', error);
        } finally {
            setIsLoadingJamiaats(false);
        }
    };

    const fetchVenues = async () => {
        setIsLoadingVenues(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                console.error('Access token not found');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Venue/GetAllVenues`, {
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
                    const options = result.data.map(item => ({
                        value: item.venue_id,
                        label: item.venue_name
                    }));
                    setVenueOptions(options);
                    console.log('Venue Options Loaded:', options);
                }
            }
        } catch (error) {
            console.error('Error fetching venues:', error);
        } finally {
            setIsLoadingVenues(false);
        }
    };

    const fetchJamaatsByJamiaat = async (jamiaatId) => {
        setIsLoadingJamaats(true);
        
        try {
            const token = sessionStorage.getItem('access_token');
            
            if (!token) {
                console.error('Authentication token not found');
                setIsLoadingJamaats(false);
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/Miqaat/GetJamaatsByJamiaat`, {
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
                console.error('Session expired');
                return;
            }

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.jamaat_id,
                    label: item.jamaat_name
                }));
                setJamaatOptions(options);
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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Special handler for Hijri date changes (marks as manually edited)
    const handleHijriDateChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Mark as manually edited
        if (name === 'hijriStartDate') {
            setHijriManuallyEdited(prev => ({ ...prev, start: true }));
        } else if (name === 'hijriEndDate') {
            setHijriManuallyEdited(prev => ({ ...prev, end: true }));
        }
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSelectChange = (name, selectedOption) => {
        console.log(`${name} changed to:`, selectedOption);
        setFormData(prev => ({
            ...prev,
            [name]: selectedOption
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleJamiaatChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            jamiaat: selectedOption,
            jamaat: null
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

    const validateForm = () => {
        const newErrors = {};

        if (!formData.miqaatName.trim()) {
            newErrors.miqaatName = 'Miqaat Name is required';
        }

        if (!formData.miqaatType) {
            newErrors.miqaatType = 'Miqaat Type is required';
        }

        if (!formData.jamiaat) {
            newErrors.jamiaat = 'Jamiaat is required';
        }

        if (!formData.venue) {
            newErrors.venue = 'Venue is required';
        }

        if (!formData.quantity) {
            newErrors.quantity = 'HR Requirement is required';
        } else if (formData.quantity <= 0) {
            newErrors.quantity = 'HR Requirement must be greater than 0';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Start Date is required';
        }

        if (!formData.startTime) {
            newErrors.startTime = 'Start Time is required';
        }

        if (!formData.endDate) {
            newErrors.endDate = 'End Date is required';
        }

        if (!formData.endTime) {
            newErrors.endTime = 'End Time is required';
        }

        if (!formData.hijriStartDate) {
            newErrors.hijriStartDate = 'Hijri Start Date is required';
        }

        if (!formData.hijriEndDate) {
            newErrors.hijriEndDate = 'Hijri End Date is required';
        }

        if (!formData.reportingTime) {
            newErrors.reportingTime = 'Reporting Time is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const hasChanges = () => {
        if (!originalData) return false;

        return (
            formData.miqaatName !== originalData.miqaatName ||
            formData.miqaatType?.value !== originalData.miqaatType?.value ||
            formData.startDate !== originalData.startDate ||
            formData.startTime !== originalData.startTime ||
            formData.endDate !== originalData.endDate ||
            formData.endTime !== originalData.endTime ||
            formData.reportingTime !== originalData.reportingTime ||
            formData.venue?.value !== originalData.venue?.value ||
            formData.jamaat?.value !== originalData.jamaat?.value ||
            formData.jamiaat?.value !== originalData.jamiaat?.value ||
            formData.quantity !== originalData.quantity ||
            formData.isActive !== originalData.isActive ||
            formData.hijriStartDate !== originalData.hijriStartDate ||
            formData.hijriEndDate !== originalData.hijriEndDate
        );
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
                setIsLoading(false);
                return;
            }

            const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
            const endDateTime = `${formData.endDate}T${formData.endTime}:00`;
            
            const reportingTimeFormatted = formData.reportingTime ? 
                (formData.reportingTime.includes(':') && formData.reportingTime.split(':').length === 2 ?
                    `${formData.reportingTime}:00` : formData.reportingTime)
                : null;

            const payload = {
                miqaat_id: miqaatId,
                miqaat_name: formData.miqaatName.trim(),
                miqaat_type_id: formData.miqaatType.value,
                start_date: startDateTime,
                end_date: endDateTime,
                reporting_time: reportingTimeFormatted,
                venue_id: formData.venue.value,
                jamaat_id: formData.jamaat ? formData.jamaat.value : null,
                jamiaat_id: formData.jamiaat.value,
                quantity: parseInt(formData.quantity),
                is_active: formData.isActive,
                hijri_start_date: formData.hijriStartDate,
                hijri_end_date: formData.hijriEndDate
            };

            console.log('Sending update request:', payload);

            const response = await fetch(`${API_BASE_URL}/Miqaat/UpdateMiqaat`, {
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
                    const dataToUpdate = {
                        miqaat_id: miqaatId,
                        miqaat_name: formData.miqaatName,
                        miqaat_type_id: formData.miqaatType.value,
                        miqaat_type_name: formData.miqaatType.label,
                        start_date: startDateTime,
                        end_date: endDateTime,
                        reporting_time: formData.reportingTime,
                        venue_id: formData.venue.value,
                        venue_name: formData.venue.label,
                        jamaat_id: formData.jamaat ? formData.jamaat.value : null,
                        jamaat_name: formData.jamaat ? formData.jamaat.label : '-',
                        jamiaat_id: formData.jamiaat.value,
                        jamiaat_name: formData.jamiaat.label,
                        quantity: parseInt(formData.quantity),
                        is_active: formData.isActive,
                        hijri_start_date: formData.hijriStartDate,
                        hijri_end_date: formData.hijriEndDate
                    };
                    onUpdate(dataToUpdate);
                }
                
                showSuccessAlert(result.message || 'Miqaat updated successfully!');
            } else {
                if (result.data?.result_code === 4) {
                    setErrors(prev => ({
                        ...prev,
                        miqaatName: 'Miqaat name already exists'
                    }));
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Miqaat name already exists',
                        confirmButtonText: 'OK'
                    });
                } else if (result.data?.result_code === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Miqaat not found or update failed',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: result.message || 'Failed to update miqaat',
                        confirmButtonText: 'OK'
                    });
                }
            }
        } catch (error) {
            console.error('Error updating miqaat:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while updating the miqaat. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            miqaatName: '',
            miqaatType: null,
            startDate: '',
            startTime: '',
            endDate: '',
            endTime: '',
            reportingTime: '',
            venue: null,
            jamaat: null,
            jamiaat: null,
            quantity: '',
            isActive: true,
            hijriStartDate: '',
            hijriEndDate: ''
        });
        setErrors({});
        setOriginalData(null);
        setJamaatOptions([]);
        // setHijriManuallyEdited({ start: false, end: false });
        
        if (onClose) {
            onClose();
        }
    };

    const handleReset = () => {
        if (originalData) {
            setFormData({ ...originalData });
            setErrors({});
            // Reset manual edit tracking to original state
            // setHijriManuallyEdited({
            //     start: !!originalData.hijriStartDate,
            //     end: !!originalData.hijriEndDate
            // });
            Swal.fire({
                icon: 'info',
                title: 'Form Reset',
                text: 'Form reset to original values',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '38px',
            borderColor: state.selectProps.error ? '#dc3545' : '#dee2e6',
            '&:hover': {
                borderColor: state.selectProps.error ? '#dc3545' : '#86b7fe'
            }
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
                        display: flex;
                        align-items: flex-start;
                        margin-bottom: 20px;
                    }
                    .horizontal-form-group .form-label {
                        min-width: 160px;
                        margin-bottom: 0;
                        margin-right: 15px;
                        font-weight: 500;
                        text-align: right;
                        color: #333;
                        font-size: 14px;
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

                    .datetime-row {
                        display: flex;
                        gap: 10px;
                    }
                    .datetime-row .date-input {
                        flex: 1.5;
                    }
                    .datetime-row .time-input {
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

                    .form-control[type="date"],
                    .form-control[type="time"] {
                        cursor: pointer;
                    }

                    .checkbox-wrapper {
                        display: flex;
                        align-items: center;
                        padding-top: 8px;
                    }
                    .checkbox-wrapper .form-check {
                        margin-bottom: 0;
                    }
                    .checkbox-wrapper .form-check-input {
                        width: 18px;
                        height: 18px;
                        cursor: pointer;
                    }
                    .checkbox-wrapper .form-check-label {
                        cursor: pointer;
                        margin-left: 5px;
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

                    .hijri-date-indicator {
                        font-size: 11px;
                        color: #6c757d;
                        margin-top: 2px;
                        font-style: italic;
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

                        .datetime-row {
                            flex-direction: column;
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
                {(isLoadingMiqaatData || isLoading) && (
                    <div className="loading-overlay">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="loading-text">
                            {isLoadingMiqaatData ? 'Loading miqaat data...' : 'Updating...'}
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
                        disabled={isLoading || isLoadingMiqaatData}
                    >
                        &times;
                    </button>
                </div>
                
                {!isLoadingMiqaatData && (
                    <>
                        {/* Line 1: Miqaat Name, Miqaat Type */}
                        <div className="form-row-inline">
                            <div className="horizontal-form-group">
                                <Form.Label>Miqaat Name <span className="text-danger">*</span></Form.Label>
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        type="text"
                                        name="miqaatName"
                                        value={formData.miqaatName}
                                        onChange={handleInputChange}
                                        placeholder="Enter Miqaat Name"
                                        className={errors.miqaatName ? 'is-invalid' : ''}
                                        disabled={isLoading}
                                    />
                                    {errors.miqaatName && <div className="error-text">{errors.miqaatName}</div>}
                                </div>
                            </div>

                            <div className="horizontal-form-group">
                                <Form.Label>Miqaat Type <span className="text-danger">*</span></Form.Label>
                                <div className="form-input-wrapper">
                                    <Select
                                        key={`miqaat-type-select-${miqaatTypeOptions.length}-${formData.miqaatType?.value || 'empty'}`}
                                        options={miqaatTypeOptions}
                                        value={formData.miqaatType}
                                        onChange={(option) => handleSelectChange('miqaatType', option)}
                                        placeholder="Select Miqaat Type"
                                        isClearable
                                        styles={selectStyles}
                                        error={errors.miqaatType}
                                        isDisabled={isLoading || isLoadingMiqaatTypes}
                                        isLoading={isLoadingMiqaatTypes}
                                    />
                                    {errors.miqaatType && <div className="error-text">{errors.miqaatType}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Line 2: Jamiaat, Jamaat */}
                        <div className="form-row-inline">
                            <div className="horizontal-form-group">
                                <Form.Label>Jamiaat <span className="text-danger">*</span></Form.Label>
                                <div className="form-input-wrapper">
                                    <Select
                                        key={`jamiaat-select-${jamiaatOptions.length}-${formData.jamiaat?.value || 'empty'}`}
                                        options={jamiaatOptions}
                                        value={formData.jamiaat}
                                        onChange={handleJamiaatChange}
                                        placeholder="Select Jamiaat"
                                        isClearable
                                        styles={selectStyles}
                                        error={errors.jamiaat}
                                        isDisabled={isLoading || isLoadingJamiaats}
                                        isLoading={isLoadingJamiaats}
                                    />
                                    {errors.jamiaat && <div className="error-text">{errors.jamiaat}</div>}
                                </div>
                            </div>

                            <div className="horizontal-form-group">
                                <Form.Label>Jamaat</Form.Label>
                                <div className="form-input-wrapper">
                                    <Select
                                        key={`jamaat-select-${jamaatOptions.length}-${formData.jamaat?.value || 'empty'}`}
                                        options={jamaatOptions}
                                        value={formData.jamaat}
                                        onChange={(option) => handleSelectChange('jamaat', option)}
                                        placeholder={isLoadingJamaats ? "Loading..." : "Select Jamaat"}
                                        isClearable
                                        styles={selectStyles}
                                        error={errors.jamaat}
                                        isDisabled={isLoading || isLoadingJamaats || !formData.jamiaat}
                                        isLoading={isLoadingJamaats}
                                        noOptionsMessage={() => formData.jamiaat ? "No jamaat found" : "Please select Jamiaat first"}
                                    />
                                    {errors.jamaat && <div className="error-text">{errors.jamaat}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Line 3: Venue, HR Requirement */}
                        <div className="form-row-inline">
                            <div className="horizontal-form-group">
                                <Form.Label>Venue <span className="text-danger">*</span></Form.Label>
                                <div className="form-input-wrapper">
                                    <Select
                                        key={`venue-select-${venueOptions.length}-${formData.venue?.value || 'empty'}`}
                                        options={venueOptions}
                                        value={formData.venue}
                                        onChange={(option) => handleSelectChange('venue', option)}
                                        placeholder={isLoadingVenues ? "Loading..." : "Select Venue"}
                                        isClearable
                                        styles={selectStyles}
                                        error={errors.venue}
                                        isDisabled={isLoading || isLoadingVenues}
                                        isLoading={isLoadingVenues}
                                        noOptionsMessage={() => "No venues available"}
                                    />
                                    {errors.venue && <div className="error-text">{errors.venue}</div>}
                                </div>
                            </div>

                            <div className="horizontal-form-group">
                                <Form.Label>HR Requirement <span className="text-danger">*</span></Form.Label>
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        placeholder="Enter HR Requirement"
                                        min="1"
                                        className={errors.quantity ? 'is-invalid' : ''}
                                        disabled={isLoading}
                                    />
                                    {errors.quantity && <div className="error-text">{errors.quantity}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Line 4: Start Date & Time, End Date & Time */}
                        <div className="form-row-inline">
                            <div className="horizontal-form-group">
                                <Form.Label>Start Date & Time <span className="text-danger">*</span></Form.Label>
                                <div className="form-input-wrapper">
                                    <div className="datetime-row">
                                        <div className="date-input">
                                            <Form.Control
                                                ref={startDateRef}
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleInputChange}
                                                onClick={() => openPicker(startDateRef)}
                                                className={errors.startDate ? 'is-invalid' : ''}
                                                disabled={isLoading}
                                            />
                                            {errors.startDate && <div className="error-text">{errors.startDate}</div>}
                                        </div>
                                        <div className="time-input">
                                            <Form.Control
                                                ref={startTimeRef}
                                                type="time"
                                                name="startTime"
                                                value={formData.startTime}
                                                onChange={handleInputChange}
                                                onClick={() => openPicker(startTimeRef)}
                                                className={errors.startTime ? 'is-invalid' : ''}
                                                disabled={isLoading}
                                                step="300"
                                            />
                                            {errors.startTime && <div className="error-text">{errors.startTime}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="horizontal-form-group">
                                <Form.Label>End Date & Time <span className="text-danger">*</span></Form.Label>
                                <div className="form-input-wrapper">
                                    <div className="datetime-row">
                                        <div className="date-input">
                                            <Form.Control
                                                ref={endDateRef}
                                                type="date"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleInputChange}
                                                onClick={() => openPicker(endDateRef)}
                                                className={errors.endDate ? 'is-invalid' : ''}
                                                disabled={isLoading}
                                            />
                                            {errors.endDate && <div className="error-text">{errors.endDate}</div>}
                                        </div>
                                        <div className="time-input">
                                            <Form.Control
                                                ref={endTimeRef}
                                                type="time"
                                                name="endTime"
                                                value={formData.endTime}
                                                onChange={handleInputChange}
                                                onClick={() => openPicker(endTimeRef)}
                                                className={errors.endTime ? 'is-invalid' : ''}
                                                disabled={isLoading}
                                                step="300"
                                            />
                                            {errors.endTime && <div className="error-text">{errors.endTime}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Line 5: Hijri Start Date, Hijri End Date */}
                        <div className="form-row-inline">
                            <div className="horizontal-form-group">
                                <Form.Label>Hijri Start Date <span className="text-danger">*</span></Form.Label>
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        ref={hijriStartDateRef}
                                        type="date"
                                        name="hijriStartDate"
                                        value={formData.hijriStartDate}
                                        // onChange={handleHijriDateChange}
                                        onChange={handleInputChange}
                                        onClick={() => openPicker(hijriStartDateRef)}
                                        className={errors.hijriStartDate ? 'is-invalid' : ''}
                                        disabled={isLoading}
                                    />
                                    {/* {!hijriManuallyEdited.start && formData.startDate && (
                                        <div className="hijri-date-indicator">
                                            Auto-calculated from Start Date
                                        </div>
                                    )} */}
                                    {errors.hijriStartDate && <div className="error-text">{errors.hijriStartDate}</div>}
                                </div>
                            </div>

                            <div className="horizontal-form-group">
                                <Form.Label>Hijri End Date <span className="text-danger">*</span></Form.Label>
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        ref={hijriEndDateRef}
                                        type="date"
                                        name="hijriEndDate"
                                        value={formData.hijriEndDate}
                                        // onChange={handleHijriDateChange}
                                        onChange={handleInputChange}
                                        onClick={() => openPicker(hijriEndDateRef)}
                                        className={errors.hijriEndDate ? 'is-invalid' : ''}
                                        disabled={isLoading}
                                    />
                                    {/* {!hijriManuallyEdited.end && formData.endDate && (
                                        <div className="hijri-date-indicator">
                                            Auto-calculated from End Date
                                        </div>
                                    )} */}
                                    {errors.hijriEndDate && <div className="error-text">{errors.hijriEndDate}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Line 6: Reporting Time (TIME ONLY), Active Checkbox */}
                        <div className="form-row-inline">
                            <div className="horizontal-form-group">
                                <Form.Label>Reporting Time <span className="text-danger">*</span></Form.Label>
                                <div className="form-input-wrapper">
                                    <Form.Control
                                        ref={reportingTimeRef}
                                        type="time"
                                        name="reportingTime"
                                        value={formData.reportingTime}
                                        onChange={handleInputChange}
                                        onClick={() => openPicker(reportingTimeRef)}
                                        className={errors.reportingTime ? 'is-invalid' : ''}
                                        disabled={isLoading}
                                        step="300"
                                    />
                                    {errors.reportingTime && <div className="error-text">{errors.reportingTime}</div>}
                                </div>
                            </div>

                            <div className="horizontal-form-group">
                                <Form.Label></Form.Label>
                                <div className="form-input-wrapper">
                                    <div className="checkbox-wrapper">
                                        <Form.Check
                                            type="checkbox"
                                            id="isActive"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            label="Active"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="form-buttons">
                    <Button 
                        variant="primary" 
                        onClick={handleUpdate} 
                        disabled={isLoading || !hasChanges() || isLoadingMiqaatData}
                    >
                        <i className="ri-save-line me-1"></i> 
                        {isLoading ? 'Updating...' : 'Update'}
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={handleClose} 
                        disabled={isLoading || isLoadingMiqaatData}
                    >
                        <i className="ri-arrow-left-line me-1"></i> Back
                    </Button>
                    <Button 
                        className="btn-reset" 
                        onClick={handleReset} 
                        disabled={isLoading || !hasChanges() || isLoadingMiqaatData}
                    >
                        <i className="ri-refresh-line me-1"></i> Reset
                    </Button>
                </div>
            </div>
        </div>
    );
};

if (typeof window !== 'undefined') {
    window.handleEditClick = (id) => {
        console.log('Edit clicked for ID:', id);
        window.dispatchEvent(new CustomEvent('editRecord', { detail: { id } }));
    };
    
    window.handleDeleteClick = (id) => {
        console.log('Delete clicked for ID:', id);
        window.dispatchEvent(new CustomEvent('deleteRecord', { detail: { id } }));
    };
}

export default MiqaatTable;