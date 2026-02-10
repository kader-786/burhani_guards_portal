// MiqaatMaster.jsx
import React, { Fragment, useState, useEffect, useMemo, useRef } from 'react';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import IconButton from '../../elements/button';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import Swal from 'sweetalert2';
import HijriDate from 'hijri-converter';
import { checkModuleAccess } from '../../../utils/accessControl';
import '../../../styles/shared-styles.css';
import StandardModal from '../../../components/StandardModal';
import { useNavigate } from 'react-router-dom';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ========================================
// MODULE CONFIGURATION
// ========================================
const MODULE_ID = '105'; // Miqaat Master module ID

// ========================================
// HELPER FUNCTIONS
// ========================================

const TimeSplitInput = ({ value, onChange, disabled, error }) => {
    // value is expected in "HH:mm" (24h) format

    const parseTime = (val) => {
        if (!val || typeof val !== 'string') return { hour: '', minute: '', period: 'AM' };

        try {
            const cleanVal = val.includes(':') ? val.split(':').slice(0, 2).join(':') : val;
            const [h, m] = cleanVal.split(':').map(Number);
            if (isNaN(h) || isNaN(m)) return { hour: '', minute: '', period: 'AM' };

            let period = h >= 12 ? 'PM' : 'AM';
            let hour = h % 12 || 12;
            return {
                hour: String(hour).padStart(2, '0'),
                minute: String(m).padStart(2, '0'),
                period
            };
        } catch (e) {
            console.error("Error parsing time:", val, e);
            return { hour: '', minute: '', period: 'AM' };
        }
    };

    const [localState, setLocalState] = useState(parseTime(value));

    useEffect(() => {
        setLocalState(parseTime(value));
    }, [value]);

    const handleChange = (field, val) => {
        const newState = { ...localState, [field]: val };
        setLocalState(newState);

        if (newState.hour && newState.minute && newState.period) {
            let h = parseInt(newState.hour);
            const m = newState.minute;
            const p = newState.period;

            if (p === 'PM' && h !== 12) h += 12;
            if (p === 'AM' && h === 12) h = 0;

            const time24 = `${String(h).padStart(2, '0')}:${m}`;
            onChange(time24);
        }
    };

    const hourOptions = Array.from({ length: 12 }, (_, i) => {
        const h = String(i + 1).padStart(2, '0');
        return { value: h, label: h };
    });

    const minuteOptions = ['00', '15', '30', '45'].map(m => ({ value: m, label: m }));

    const periodOptions = [
        { value: 'AM', label: 'AM' },
        { value: 'PM', label: 'PM' }
    ];

    const selectStylesSmall = {
        control: (base, state) => ({
            ...base, minHeight: '38px',
            borderColor: error ? '#dc3545' : (state.isFocused ? '#0d6efd' : '#dee2e6'),
            borderWidth: '2px', borderRadius: '8px',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.15)' : 'none',
            '&:hover': { borderColor: error ? '#dc3545' : '#adb5bd' }
        }),
        placeholder: (base) => ({ ...base, color: '#6c757d', fontSize: '14px' }),
        singleValue: (base) => ({ ...base, fontSize: '14px' }),
        dropdownIndicator: (base) => ({ ...base, padding: '4px' }),
        indicatorSeparator: () => ({ display: 'none' }),
        valueContainer: (base) => ({ ...base, padding: '0 8px' }),
        menu: (base) => ({ ...base, zIndex: 1000 })
    };

    return (
        <div style={{ display: 'flex', gap: '5px' }}>
            <div style={{ flex: 1, minWidth: '80px', maxWidth: '90px' }}>
                <Select
                    options={hourOptions}
                    value={hourOptions.find(o => o.value === localState.hour) || null}
                    onChange={(opt) => handleChange('hour', opt ? opt.value : '')}
                    placeholder="HH"
                    styles={selectStylesSmall}
                    isDisabled={disabled}
                    isSearchable={false}
                />
            </div>
            <div style={{ flex: 1, minWidth: '80px', maxWidth: '90px' }}>
                <Select
                    options={minuteOptions}
                    value={minuteOptions.find(o => o.value === localState.minute) || null}
                    onChange={(opt) => handleChange('minute', opt ? opt.value : '')}
                    placeholder="MM"
                    styles={selectStylesSmall}
                    isDisabled={disabled}
                    isSearchable={false}
                />
            </div>
            <div style={{ flex: 1, minWidth: '85px', maxWidth: '95px' }}>
                <Select
                    options={periodOptions}
                    value={periodOptions.find(o => o.value === localState.period) || null}
                    onChange={(opt) => handleChange('period', opt ? opt.value : '')}
                    placeholder="AM/PM"
                    styles={selectStylesSmall}
                    isDisabled={disabled}
                    isSearchable={false}
                />
            </div>
        </div>
    );
};



// ========================================
// HELPER FUNCTIONS FOR HIJRI CONVERSION
// ========================================

const gregorianToHijri = (gregorianDateString) => {
    try {
        if (!gregorianDateString) return '';

        const date = new Date(gregorianDateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const hijriDate = new HijriDate.toHijri(year, month, day);

        let hijriYear = hijriDate.hy;
        let hijriMonth = hijriDate.hm;
        let hijriDay = hijriDate.hd + 1;

        const daysInMonth = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
        if (hijriDay > daysInMonth[hijriMonth - 1]) {
            hijriDay = 1;
            hijriMonth++;
            if (hijriMonth > 12) {
                hijriMonth = 1;
                hijriYear++;
            }
        }

        const formattedMonth = String(hijriMonth).padStart(2, '0');
        const formattedDay = String(hijriDay).padStart(2, '0');

        return `${hijriYear}-${formattedMonth}-${formattedDay}`;
    } catch (error) {
        console.error('Error converting to Hijri:', error);
        return '';
    }
};

const hijriToGregorian = (hijriDateString) => {
    try {
        if (!hijriDateString) return '';

        const [year, month, day] = hijriDateString.split('-').map(Number);
        const gregorianDate = new HijriDate.toGregorian(year, month, day);

        const gregYear = gregorianDate.gy;
        const gregMonth = String(gregorianDate.gm).padStart(2, '0');
        const gregDay = String(gregorianDate.gd).padStart(2, '0');

        return `${gregYear}-${gregMonth}-${gregDay}`;
    } catch (error) {
        console.error('Error converting to Gregorian:', error);
        return '';
    }
};


const AddMiqaat = ({
    show,
    onClose,
    onSave,
    title = "Add New Miqaat",
    permissions
}) => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        miqaatGroup: null,
        miqaatName: '',
        miqaatType: null,
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        venue: null,
        jamaat: null,
        jamiaat: null,
        quantity: '',
        isActive: false,
        hijriStartDate: '',
        hijriEndDate: ''
    });

    // Clone-related states
    const [isCloneMode, setIsCloneMode] = useState(false);
    const [sourceMiqaatOptions, setSourceMiqaatOptions] = useState([]);
    const [selectedSourceMiqaat, setSelectedSourceMiqaat] = useState(null);
    const [loadingSourceMiqaats, setLoadingSourceMiqaats] = useState(false);

    const [miqaatTypeOptions, setMiqaatTypeOptions] = useState([]);
    const [jamiaatOptions, setJamiaatOptions] = useState([]);
    const [jamaatOptions, setJamaatOptions] = useState([]);
    const [miqaatGroupOptions, setMiqaatGroupOptions] = useState([]);

    const [allVenues, setAllVenues] = useState([]);
    const [venueOptions, setVenueOptions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingJamaat, setLoadingJamaat] = useState(false);
    const [loadingVenues, setLoadingVenues] = useState(false);
    const [loadingMiqaatGroups, setLoadingMiqaatGroups] = useState(false);
    const [errors, setErrors] = useState({});

    const startDateRef = useRef(null);
    const startTimeRef = useRef(null);
    const endDateRef = useRef(null);
    const endTimeRef = useRef(null);
    const hijriStartDateRef = useRef(null);
    const hijriEndDateRef = useRef(null);

    // UPDATED: Enhanced success alert with conditional button text based on clone mode
    const showSuccessAlertWithNavigation = (message, newMiqaatId, newMiqaatName, newVenueId) => {
        const isClone = isCloneMode;

        Swal.fire({
            title: 'Success! Miqaat Created',
            html: `
                <p style="margin-bottom: 15px;">Miqaat "<strong>${newMiqaatName}</strong>" has been ${isClone ? 'Cloned successfully along with the location incharges and duties' : 'created successfully'}.</p>
                <p style="font-size: 14px; color: #6c757d;">Click on Next to add Incharges</p>
            `,
            icon: 'success',
            // showDenyButton: true,
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            // denyButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `<i class="ri-user-add-line me-2"></i>${isClone ? 'Next' : 'Next'}`,
            // denyButtonText: `<i class="ri-shield-user-line me-2"></i>${isClone ? 'Show Duties' : 'Add Duties'}`,
            // cancelButtonText: 'Done',
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
                actions: 'swal-three-button-actions'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                handleClose();
                navigate(`${import.meta.env.BASE_URL}backoffice/locationincharge`, {
                    state: {
                        miqaatId: newMiqaatId,
                        miqaatName: newMiqaatName,
                        venueId: newVenueId,
                        fromMiqaatCreation: true
                    }
                });
            } else if (result.isDenied) {
                handleClose();
                navigate(`${import.meta.env.BASE_URL}backoffice/duties`, {
                    state: {
                        miqaatId: newMiqaatId,
                        miqaatName: newMiqaatName,
                        venueId: newVenueId,
                        fromMiqaatCreation: true
                    }
                });
            } else {
                handleClose();
            }
        });
    };

    const openPicker = (ref) => {
        if (ref.current) {
            try {
                ref.current.showPicker();
            } catch (error) {
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
            fetchSourceMiqaats();
            fetchMiqaatGroups();
        }
    }, [show]);

    useEffect(() => {
        if (formData.startDate) {
            const hijriDate = gregorianToHijri(formData.startDate);
            setFormData(prev => ({ ...prev, hijriStartDate: hijriDate }));
        }
    }, [formData.startDate]);

    useEffect(() => {
        if (formData.endDate) {
            const hijriDate = gregorianToHijri(formData.endDate);
            setFormData(prev => ({ ...prev, hijriEndDate: hijriDate }));
        }
    }, [formData.endDate]);

    useEffect(() => {
        if (allVenues.length > 0) {
            filterVenues();
        }
    }, [formData.jamiaat, formData.jamaat, allVenues]);

    const filterVenues = () => {
        let filtered = allVenues;

        if (formData.jamiaat) {
            filtered = filtered.filter(v => v.jamiaat_id === formData.jamiaat.value);
        }

        if (formData.jamiaat && formData.jamaat) {
            filtered = filtered.filter(v =>
                v.jamaat_id === formData.jamaat.value || v.jamaat_id === null
            );
        }

        const options = filtered.map(item => ({
            value: item.venue_id,
            label: item.venue_name,
            jamiaat_id: item.jamiaat_id,
            jamaat_id: item.jamaat_id
        }));

        setVenueOptions(options);

        if (formData.venue) {
            const isValid = options.find(o => o.value === formData.venue.value);
            if (!isValid) {
                setFormData(prev => ({ ...prev, venue: null }));
            }
        }
    };

    const fetchMiqaatTypes = async () => {
        try {
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) return;
            const response = await fetch(`${API_BASE_URL}/Miqaat/GetAllMiqaatTypes`, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setMiqaatTypeOptions(result.data.map(item => ({ value: item.miqaat_type_id, label: item.miqaat_type_name })));
                }
            }
        } catch (error) { console.error('Error fetching miqaat types:', error); }
    };

    const fetchJamiaat = async () => {
        try {
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) return;
            const response = await fetch(`${API_BASE_URL}/Team/GetAllJamiaats`, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setJamiaatOptions(result.data.map(item => ({ value: item.jamiaat_id, label: item.jamiaat_name })));
                }
            }
        } catch (error) { console.error('Error fetching jamiaat:', error); }
    };

    const fetchVenues = async () => {
        setLoadingVenues(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) return;
            const response = await fetch(`${API_BASE_URL}/Venue/GetAllVenues`, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setAllVenues(result.data);
                    const options = result.data.map(item => ({
                        value: item.venue_id, label: item.venue_name, jamiaat_id: item.jamiaat_id, jamaat_id: item.jamaat_id
                    }));
                    setVenueOptions(options);
                }
            }
        } catch (error) { console.error('Error fetching venues:', error); }
        finally { setLoadingVenues(false); }
    };

    const fetchSourceMiqaats = async () => {
        setLoadingSourceMiqaats(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) return;

            const response = await fetch(`${API_BASE_URL}/Miqaat/GetAllMiqaat`, {
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
                        value: item.miqaat_id,
                        label: item.miqaat_name,
                        fullData: item
                    }));
                    setSourceMiqaatOptions(options);
                }
            }
        } catch (error) {
            console.error('Error fetching source miqaats:', error);
        } finally {
            setLoadingSourceMiqaats(false);
        }
    };

    const fetchMiqaatGroups = async () => {
        setLoadingMiqaatGroups(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) return;

            const response = await fetch(`${API_BASE_URL}/Miqaat/GetMiqaatGroups`, {
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
                        value: item.miqaat_group,
                        label: item.miqaat_group
                    }));
                    setMiqaatGroupOptions(options);
                }
            }
        } catch (error) {
            console.error('Error fetching miqaat groups:', error);
        } finally {
            setLoadingMiqaatGroups(false);
        }
    };

    const fetchJamaatByJamiaat = async (jamiaatId) => {
        try {
            setLoadingJamaat(true);
            const accessToken = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Miqaat/GetJamaatsByJamiaat`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify({ jamiaat_id: jamiaatId })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const options = result.data.map(item => ({ value: item.jamaat_id, label: item.jamaat_name }));
                    setJamaatOptions(options);
                    return options;
                } else {
                    setJamaatOptions([]);
                    return [];
                }
            } else {
                setJamaatOptions([]);
                return [];
            }
        } catch (error) {
            console.error('Error fetching jamaat:', error);
            setJamaatOptions([]);
            return [];
        }
        finally { setLoadingJamaat(false); }
    };

    const handleJamiaatChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, jamiaat: selectedOption, jamaat: null, venue: null }));
        if (errors.jamiaat) setErrors(prev => ({ ...prev, jamiaat: '' }));
        if (selectedOption) fetchJamaatByJamiaat(selectedOption.value);
        else setJamaatOptions([]);
    };

    const handleJamaatChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, jamaat: selectedOption }));
        if (errors.jamaat) setErrors(prev => ({ ...prev, jamaat: '' }));
    };

    const handleVenueChange = async (selectedOption) => {
        if (selectedOption) {
            const venueDetails = allVenues.find(v => v.venue_id === selectedOption.value);
            if (venueDetails) {
                const updates = { venue: selectedOption };

                if (venueDetails.jamiaat_id && (!formData.jamiaat || formData.jamiaat.value !== venueDetails.jamiaat_id)) {
                    const jOpt = jamiaatOptions.find(x => x.value === venueDetails.jamiaat_id) || { value: venueDetails.jamiaat_id, label: 'Loading...' };
                    updates.jamiaat = jOpt;

                    const jamaatOpts = await fetchJamaatByJamiaat(venueDetails.jamiaat_id);

                    if (venueDetails.jamaat_id && venueDetails.jamaat_id !== 0) {
                        const jmOpt = jamaatOpts.find(x => x.value === venueDetails.jamaat_id);
                        if (jmOpt) {
                            updates.jamaat = jmOpt;
                        } else {
                            updates.jamaat = null;
                        }
                    } else {
                        updates.jamaat = null;
                    }
                } else if (!venueDetails.jamaat_id || venueDetails.jamaat_id === 0) {
                    updates.jamaat = null;
                } else if (venueDetails.jamaat_id && venueDetails.jamaat_id !== 0) {
                    const jmOpt = jamaatOptions.find(x => x.value === venueDetails.jamaat_id);
                    if (jmOpt) {
                        updates.jamaat = jmOpt;
                    } else {
                        updates.jamaat = null;
                    }
                }

                setFormData(prev => ({ ...prev, ...updates }));
            }
        } else {
            setFormData(prev => ({ ...prev, venue: null }));
        }
        if (errors.venue) setErrors(prev => ({ ...prev, venue: '' }));
    };

    const handleCloneModeChange = (e) => {
        const checked = e.target.checked;
        setIsCloneMode(checked);

        if (!checked) {
            setSelectedSourceMiqaat(null);
        }
    };

    const handleSourceMiqaatChange = async (selectedOption) => {
        setSelectedSourceMiqaat(selectedOption);

        if (!selectedOption) {
            return;
        }

        const sourceData = selectedOption.fullData;

        const startTime = sourceData.start_date ?
            new Date(sourceData.start_date).toTimeString().slice(0, 5) : '';
        const endTime = sourceData.end_date ?
            new Date(sourceData.end_date).toTimeString().slice(0, 5) : '';

        const miqaatTypeOption = sourceData.miqaat_type_id ? {
            value: sourceData.miqaat_type_id,
            label: sourceData.miqaat_type_name
        } : null;

        const jamiaatOption = sourceData.jamiaat_id ? {
            value: sourceData.jamiaat_id,
            label: sourceData.jamiaat_name
        } : null;

        const venueOption = sourceData.venue_id ? {
            value: sourceData.venue_id,
            label: sourceData.venue_name
        } : null;

        const miqaatGroupOption = sourceData.miqaat_group ? {
            value: sourceData.miqaat_group,
            label: sourceData.miqaat_group
        } : null;

        setFormData(prev => ({
            ...prev,
            miqaatGroup: miqaatGroupOption,
            miqaatName: '',
            miqaatType: miqaatTypeOption,
            startDate: '',
            startTime: startTime,
            endDate: '',
            endTime: endTime,
            venue: venueOption,
            jamiaat: jamiaatOption,
            jamaat: null,
            quantity: sourceData.quantity ? String(sourceData.quantity) : '',
            isActive: false,
            hijriStartDate: '',
            hijriEndDate: ''
        }));

        if (sourceData.jamiaat_id) {
            const jamaatOpts = await fetchJamaatByJamiaat(sourceData.jamiaat_id);

            if (sourceData.jamaat_id) {
                const jamaatOption = jamaatOpts.find(opt => opt.value === sourceData.jamaat_id);
                if (jamaatOption) {
                    setFormData(prev => ({ ...prev, jamaat: jamaatOption }));
                }
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSelectChange = (name, selectedOption) => {
        setFormData(prev => ({ ...prev, [name]: selectedOption }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleMiqaatGroupChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, miqaatGroup: selectedOption }));
        if (errors.miqaatGroup) setErrors(prev => ({ ...prev, miqaatGroup: '' }));
    };

    const handleTimeChange = (name, selectedOption) => {
        setFormData(prev => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : ''
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.miqaatName.trim()) newErrors.miqaatName = 'Miqaat Name is required';
        if (!formData.miqaatType) newErrors.miqaatType = 'Miqaat Type is required';
        if (!formData.jamiaat) newErrors.jamiaat = 'Jamiaat is required';
        if (!formData.venue) newErrors.venue = 'Venue is required';
        if (!formData.quantity) newErrors.quantity = 'HR Requirement is required';
        else if (formData.quantity <= 0) newErrors.quantity = 'HR Requirement must be greater than 0';
        if (!formData.startDate) newErrors.startDate = 'Start Date is required';
        if (!formData.startTime) newErrors.startTime = 'Start Time is required';
        if (!formData.endDate) newErrors.endDate = 'End Date is required';
        if (!formData.endTime) newErrors.endTime = 'End Time is required';

        if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
            const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
            if (endDateTime <= startDateTime) newErrors.endDate = 'End Date & Time must be greater than Start Date & Time';
        }
        if (!formData.hijriStartDate) newErrors.hijriStartDate = 'Hijri Start Date is required';
        if (!formData.hijriEndDate) newErrors.hijriEndDate = 'Hijri End Date is required';

        // Validate Start Date & Time >= Current Date & Time
        if (formData.startDate && formData.startTime) {
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
            const currentDateTime = new Date();
            if (startDateTime < currentDateTime) {
                newErrors.startDate = 'Start Date-Time must be greater than or equal to Current Date-Time';
            }
        }

        if (isCloneMode && !selectedSourceMiqaat) {
            newErrors.sourceMiqaat = 'Please select a miqaat to clone from';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) throw new Error('Access token not found. Please login again.');

            const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
            const endDateTime = `${formData.endDate}T${formData.endTime}:00`;

            const requestBody = {
                miqaat_name: formData.miqaatName,
                miqaat_type_id: formData.miqaatType.value,
                start_date: startDateTime,
                end_date: endDateTime,
                venue_id: formData.venue.value,
                jamaat_id: formData.jamaat ? formData.jamaat.value : null,
                jamiaat_id: formData.jamiaat.value,
                quantity: parseInt(formData.quantity),
                is_active: formData.isActive,
                hijri_start_date: formData.hijriStartDate,
                hijri_end_date: formData.hijriEndDate,
                source_miqaat_id: selectedSourceMiqaat ? selectedSourceMiqaat.value : null,
                miqaat_group: formData.miqaatGroup ? formData.miqaatGroup.value : null
            };

            const response = await fetch(`${API_BASE_URL}/Miqaat/InsertMiqaat`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify(requestBody)
            });
            const result = await response.json();

            if (response.ok && result.success) {
                if (onSave) onSave(result.data);

                showSuccessAlertWithNavigation(
                    result.message || 'Miqaat added successfully!',
                    result.data.miqaat_id,
                    formData.miqaatName,
                    formData.venue.value
                );
            } else {
                if (result.data && result.data.result_code === 4) {
                    setErrors({ miqaatName: 'Miqaat name already exists' });
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Miqaat name already exists', confirmButtonText: 'OK' });
                } else { throw new Error(result.message || 'Failed to add miqaat'); }
            }
        } catch (error) {
            console.error('Error saving miqaat:', error);
            setErrors({ submit: error.message });
            Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'An error occurred while saving the miqaat', confirmButtonText: 'OK' });
        } finally { setLoading(false); }
    };

    const handleClose = () => {
        handleClear();
        if (onClose) onClose();
    };

    const handleClear = () => {
        setFormData({
            miqaatGroup: null,
            miqaatName: '',
            miqaatType: null,
            startDate: '',
            startTime: '',
            endDate: '',
            endTime: '',
            venue: null,
            jamaat: null,
            jamiaat: null,
            quantity: '',
            isActive: false,
            hijriStartDate: '',
            hijriEndDate: ''
        });
        setErrors({});
        setJamaatOptions([]);

        setIsCloneMode(false);
        setSelectedSourceMiqaat(null);

        const options = allVenues.map(item => ({
            value: item.venue_id, label: item.venue_name, jamiaat_id: item.jamiaat_id, jamaat_id: item.jamaat_id
        }));
        setVenueOptions(options);
    };

    const selectStyles = {
        control: (base, state) => ({
            ...base, minHeight: '38px',
            borderColor: state.selectProps.error ? '#dc3545' : (state.isFocused ? '#0d6efd' : '#dee2e6'),
            borderWidth: '2px', borderRadius: '8px', boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.15)' : 'none',
            '&:hover': { borderColor: state.selectProps.error ? '#dc3545' : '#adb5bd' }
        }),
        placeholder: (base) => ({ ...base, color: '#6c757d', fontSize: '15px' }),
        singleValue: (base) => ({ ...base, fontSize: '15px' }),
        dropdownIndicator: (base) => ({ ...base, color: '#0d6efd', '&:hover': { color: '#0b5ed7' } }),
        menu: (base) => ({ ...base, zIndex: 1000 })
    };

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
            icon="ri-add-circle-line"
            buttons={modalButtons}
            loading={loading}
            maxWidth="1400px"
        >
            <style>
                {`
                    .clone-section {
                        background: #f8f9fa;
                        border: 2px dashed #dee2e6;
                        border-radius: 8px;
                        padding: 20px;
                        margin-bottom: 25px;
                    }

                    .clone-section-title {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 15px;
                        font-weight: 600;
                        color: #495057;
                        margin-bottom: 15px;
                    }

                    .clone-section-title i {
                        font-size: 18px;
                        color: #0d6efd;
                    }

                    .form-row-container {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 20px;
                    }

                    .form-row-container .horizontal-form-group {
                        flex: 1;
                        margin-bottom: 0;
                    }

                    .form-row-single {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 20px;
                    }

                    .form-row-single .horizontal-form-group {
                        flex: 1;
                        margin-bottom: 0;
                    }

                    .form-row-single .horizontal-form-group:last-child {
                        flex: 1;
                        visibility: hidden;
                    }

                    @media (max-width: 768px) {
                        .form-row-container {
                            flex-direction: column;
                            gap: 0;
                        }

                        .form-row-container .horizontal-form-group {
                            margin-bottom: 20px;
                        }

                        .form-row-single {
                            flex-direction: column;
                            gap: 0;
                        }

                        .form-row-single .horizontal-form-group:last-child {
                            display: none;
                        }
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

                    .swal-three-button-actions {
                        display: flex !important;
                        gap: 10px !important;
                        flex-wrap: wrap !important;
                        justify-content: center !important;
                    }

                    .swal-three-button-actions button {
                        margin: 0 !important;
                        min-width: 140px !important;
                    }
                `}
            </style>

            {errors.submit && (
                <div className="submit-error">
                    <i className="ri-error-warning-line"></i>
                    <span>{errors.submit}</span>
                </div>
            )}

            {/* Clone Section */}
            <div className="clone-section">
                <div className="form-row-container">
                    <div className="horizontal-form-group" style={{ maxWidth: '250px' }}>
                        <div className="form-input-wrapper">
                            <div className="checkbox-wrapper">
                                <Form.Check
                                    type="checkbox"
                                    id="cloneMode"
                                    checked={isCloneMode}
                                    onChange={handleCloneModeChange}
                                    disabled={loading}
                                />
                                <label
                                    htmlFor="cloneMode"
                                    style={{
                                        fontWeight: '600',
                                        fontSize: '15px',
                                        marginLeft: '8px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        verticalAlign: 'middle',
                                        display: 'inline-block',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    Clone from previous miqaat
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="horizontal-form-group">
                        <div className="form-input-wrapper" style={{ cursor: (!isCloneMode || loading) ? 'not-allowed' : 'default' }}>
                            <Select
                                options={sourceMiqaatOptions}
                                value={selectedSourceMiqaat}
                                onChange={handleSourceMiqaatChange}
                                placeholder="Select a miqaat to clone from"
                                isClearable
                                styles={{
                                    ...selectStyles,
                                    control: (base, state) => ({
                                        ...selectStyles.control(base, state),
                                        cursor: state.isDisabled ? 'not-allowed' : 'default',
                                    }),
                                    dropdownIndicator: (base, state) => ({
                                        ...selectStyles.dropdownIndicator(base, state),
                                        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
                                    }),
                                    indicatorSeparator: (base, state) => ({
                                        ...base,
                                        cursor: state.isDisabled ? 'not-allowed' : 'default',
                                    }),
                                    placeholder: (base) => ({
                                        ...selectStyles.placeholder(base),
                                        cursor: 'not-allowed',
                                    })
                                }}
                                error={errors.sourceMiqaat}
                                isDisabled={!isCloneMode || loading}
                                isLoading={loadingSourceMiqaats}
                                noOptionsMessage={() => "No miqaats available"}
                            />
                            {errors.sourceMiqaat && <div className="error-text">{errors.sourceMiqaat}</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Miqaat Group Row - Left Column Only */}
            <div className="form-row-single">
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">Miqaat Group</Form.Label>
                    <div className="form-input-wrapper">
                        <CreatableSelect
                            options={miqaatGroupOptions}
                            value={formData.miqaatGroup}
                            onChange={handleMiqaatGroupChange}
                            placeholder="Select or create miqaat group"
                            isClearable
                            styles={selectStyles}
                            error={errors.miqaatGroup}
                            isDisabled={loading}
                            isLoading={loadingMiqaatGroups}
                            formatCreateLabel={(inputValue) => `Create: "${inputValue}"`}
                            noOptionsMessage={() => "Type to create new group"}
                        />
                        {errors.miqaatGroup && <div className="error-text">{errors.miqaatGroup}</div>}
                    </div>
                </div>
                <div className="horizontal-form-group">
                    {/* Empty right column */}
                </div>
            </div>

            <div className="form-row-container">
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">Miqaat Name <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Control type="text" name="miqaatName" value={formData.miqaatName} onChange={handleInputChange} placeholder="Enter Miqaat Name" className={errors.miqaatName ? 'is-invalid' : ''} disabled={loading} />
                        {errors.miqaatName && <div className="error-text">{errors.miqaatName}</div>}
                    </div>
                </div>
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">Miqaat Type <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <Select options={miqaatTypeOptions} value={formData.miqaatType} onChange={(option) => handleSelectChange('miqaatType', option)} placeholder="Select Miqaat Type" isClearable styles={selectStyles} error={errors.miqaatType} isDisabled={loading} />
                        {errors.miqaatType && <div className="error-text">{errors.miqaatType}</div>}
                    </div>
                </div>
            </div>

            <div className="form-row-container">
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">Jamiaat <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <Select options={jamiaatOptions} value={formData.jamiaat} onChange={handleJamiaatChange} placeholder="Select Jamiaat" isClearable styles={selectStyles} error={errors.jamiaat} isDisabled={loading} />
                        {errors.jamiaat && <div className="error-text">{errors.jamiaat}</div>}
                    </div>
                </div>
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">Jamaat</Form.Label>
                    <div className="form-input-wrapper">
                        <Select options={jamaatOptions} value={formData.jamaat} onChange={handleJamaatChange} placeholder="Select Jamaat" isClearable styles={selectStyles} error={errors.jamaat} isDisabled={loading || loadingJamaat || !formData.jamiaat} noOptionsMessage={() => formData.jamiaat ? "No jamaat found" : "Please select Jamiaat first"} />
                        {errors.jamaat && <div className="error-text">{errors.jamaat}</div>}
                    </div>
                </div>
            </div>

            <div className="form-row-container">
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">Venue <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <Select options={venueOptions} value={formData.venue} onChange={handleVenueChange} placeholder="Select Venue" isClearable styles={selectStyles} error={errors.venue} isDisabled={loading || loadingVenues} isLoading={loadingVenues} noOptionsMessage={() => "No venues available"} />
                        {errors.venue && <div className="error-text">{errors.venue}</div>}
                    </div>
                </div>
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">HR Requirement <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} placeholder="Enter HR Requirement" min="1" className={errors.quantity ? 'is-invalid' : ''} disabled={loading} />
                        {errors.quantity && <div className="error-text">{errors.quantity}</div>}
                    </div>
                </div>
            </div>

            <div className="form-row-container">
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">Start Date-Time <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <div className="datetime-row">
                            <div className="date-input"><Form.Control ref={startDateRef} type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} onClick={() => openPicker(startDateRef)} className={errors.startDate ? 'is-invalid' : ''} disabled={loading} />{errors.startDate && <div className="error-text">{errors.startDate}</div>}</div>
                            <div className="time-input">
                                <TimeSplitInput
                                    value={formData.startTime}
                                    onChange={(val) => handleTimeChange('startTime', { value: val })}
                                    disabled={loading}
                                    error={errors.startTime}
                                />
                                {errors.startTime && <div className="error-text">{errors.startTime}</div>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">End Date-Time <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <div className="datetime-row">
                            <div className="date-input"><Form.Control ref={endDateRef} type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} onClick={() => openPicker(endDateRef)} className={errors.endDate ? 'is-invalid' : ''} disabled={loading} />{errors.endDate && <div className="error-text">{errors.endDate}</div>}</div>
                            <div className="time-input">
                                <TimeSplitInput
                                    value={formData.endTime}
                                    onChange={(val) => handleTimeChange('endTime', { value: val })}
                                    disabled={loading}
                                    error={errors.endTime}
                                />
                                {errors.endTime && <div className="error-text">{errors.endTime}</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-row-container">
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">Hijri Start Date <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Control ref={hijriStartDateRef} type="date" name="hijriStartDate" value={formData.hijriStartDate} onChange={handleInputChange} onClick={() => openPicker(hijriStartDateRef)} className={errors.hijriStartDate ? 'is-invalid' : ''} disabled={loading} />
                        {errors.hijriStartDate && <div className="error-text">{errors.hijriStartDate}</div>}
                    </div>
                </div>
                <div className="horizontal-form-group">
                    <Form.Label className="form-label">Hijri End Date <span className="text-danger">*</span></Form.Label>
                    <div className="form-input-wrapper">
                        <Form.Control ref={hijriEndDateRef} type="date" name="hijriEndDate" value={formData.hijriEndDate} onChange={handleInputChange} onClick={() => openPicker(hijriEndDateRef)} className={errors.hijriEndDate ? 'is-invalid' : ''} disabled={loading} />
                        {errors.hijriEndDate && <div className="error-text">{errors.hijriEndDate}</div>}
                    </div>
                </div>
            </div>

            <div className="form-row-container">
                <div className="horizontal-form-group">
                    <Form.Label className="form-label"></Form.Label>
                    <div className="form-input-wrapper">
                        <div className="checkbox-wrapper">
                            <Form.Check type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange} label="Active" disabled={loading} />
                        </div>
                    </div>
                </div>
                <div className="horizontal-form-group">
                    {/* Empty */}
                </div>
            </div>
        </StandardModal >
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
    title = "Edit Miqaat",
    permissions
}) => {
    const [formData, setFormData] = useState({
        miqaatGroup: null,
        miqaatName: '',
        miqaatType: null,
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        venue: null,
        jamaat: null,
        jamiaat: null,
        quantity: '',
        isActive: false,
        hijriStartDate: '',
        hijriEndDate: ''
    });
    const [originalData, setOriginalData] = useState(null);
    const [errors, setErrors] = useState({});

    const [miqaatTypeOptions, setMiqaatTypeOptions] = useState([]);
    const [jamiaatOptions, setJamiaatOptions] = useState([]);
    const [jamaatOptions, setJamaatOptions] = useState([]);
    const [miqaatGroupOptions, setMiqaatGroupOptions] = useState([]);

    const [allVenues, setAllVenues] = useState([]);
    const [venueOptions, setVenueOptions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingMiqaatData, setLoadingMiqaatData] = useState(false);
    const [loadingJamaat, setLoadingJamaat] = useState(false);
    const [loadingVenues, setLoadingVenues] = useState(false);
    const [loadingMiqaatGroups, setLoadingMiqaatGroups] = useState(false);

    const startDateRef = useRef(null);
    const startTimeRef = useRef(null);
    const endDateRef = useRef(null);
    const endTimeRef = useRef(null);
    const hijriStartDateRef = useRef(null);
    const hijriEndDateRef = useRef(null);

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

    const openPicker = (ref) => {
        if (ref.current) {
            try {
                ref.current.showPicker();
            } catch (error) {
                ref.current.focus();
                ref.current.click();
            }
        }
    };

    useEffect(() => {
        if (show && miqaatId) {
            fetchMiqaatTypes();
            fetchJamiaat();
            fetchVenues();
            fetchMiqaatGroups();
            fetchMiqaatData();
        }
    }, [show, miqaatId]);

    useEffect(() => {
        if (formData.startDate) {
            const hijriDate = gregorianToHijri(formData.startDate);
            setFormData(prev => ({ ...prev, hijriStartDate: hijriDate }));
        }
    }, [formData.startDate]);

    useEffect(() => {
        if (formData.endDate) {
            const hijriDate = gregorianToHijri(formData.endDate);
            setFormData(prev => ({ ...prev, hijriEndDate: hijriDate }));
        }
    }, [formData.endDate]);

    useEffect(() => {
        if (allVenues.length > 0) {
            let filtered = allVenues;

            if (formData.jamiaat) {
                filtered = filtered.filter(v => v.jamiaat_id === formData.jamiaat.value);
            }

            if (formData.jamiaat && formData.jamaat) {
                filtered = filtered.filter(v =>
                    v.jamaat_id === formData.jamaat.value || v.jamaat_id === null
                );
            }

            const options = filtered.map(item => ({
                value: item.venue_id,
                label: item.venue_name,
                jamiaat_id: item.jamiaat_id,
                jamaat_id: item.jamaat_id
            }));

            setVenueOptions(options);
        }
    }, [formData.jamiaat, formData.jamaat, allVenues]);

    const fetchMiqaatTypes = async () => {
        try {
            const accessToken = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Miqaat/GetAllMiqaatTypes`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setMiqaatTypeOptions(result.data.map(i => ({ value: i.miqaat_type_id, label: i.miqaat_type_name })));
                }
            }
        } catch (e) { console.error(e); }
    };

    const fetchJamiaat = async () => {
        try {
            const accessToken = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Team/GetAllJamiaats`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setJamiaatOptions(result.data.map(i => ({ value: i.jamiaat_id, label: i.jamiaat_name })));
                }
            }
        } catch (e) { console.error(e); }
    };

    const fetchVenues = async () => {
        setLoadingVenues(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Venue/GetAllVenues`, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setAllVenues(result.data);
                    const options = result.data.map(item => ({
                        value: item.venue_id, label: item.venue_name, jamiaat_id: item.jamiaat_id, jamaat_id: item.jamaat_id
                    }));
                    setVenueOptions(options);
                }
            }
        } catch (error) { console.error(error); }
        finally { setLoadingVenues(false); }
    };

    const fetchMiqaatGroups = async () => {
        setLoadingMiqaatGroups(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) return;

            const response = await fetch(`${API_BASE_URL}/Miqaat/GetMiqaatGroups`, {
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
                        value: item.miqaat_group,
                        label: item.miqaat_group
                    }));
                    setMiqaatGroupOptions(options);
                }
            }
        } catch (error) {
            console.error('Error fetching miqaat groups:', error);
        } finally {
            setLoadingMiqaatGroups(false);
        }
    };

    const fetchJamaatByJamiaat = async (jamiaatId) => {
        try {
            setLoadingJamaat(true);
            const accessToken = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Miqaat/GetJamaatsByJamiaat`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify({ jamiaat_id: jamiaatId })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const options = result.data.map(i => ({ value: i.jamaat_id, label: i.jamaat_name }));
                    setJamaatOptions(options);
                    return options;
                } else {
                    setJamaatOptions([]);
                    return [];
                }
            } else {
                setJamaatOptions([]);
                return [];
            }
        } catch (error) {
            console.error(error);
            setJamaatOptions([]);
            return [];
        }
        finally { setLoadingJamaat(false); }
    };

    const fetchMiqaatData = async () => {
        setLoadingMiqaatData(true);
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Miqaat/GetMiqaatById`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ miqaat_id: miqaatId })
            });
            const result = await response.json();
            if (response.ok && result.success && result.data && result.data.length > 0) {
                const miqaatData = result.data[0];

                const startDateTime = miqaatData.start_date ? new Date(miqaatData.start_date) : null;
                const startDate = startDateTime ? startDateTime.toISOString().split('T')[0] : '';
                const startTime = startDateTime ? startDateTime.toTimeString().slice(0, 5) : '';
                const endDateTime = miqaatData.end_date ? new Date(miqaatData.end_date) : null;
                const endDate = endDateTime ? endDateTime.toISOString().split('T')[0] : '';
                const endTime = endDateTime ? endDateTime.toTimeString().slice(0, 5) : '';

                const miqaatTypeObj = miqaatData.miqaat_type_id ? { value: miqaatData.miqaat_type_id, label: miqaatData.miqaat_type_name } : null;
                const jamiaatObj = miqaatData.jamiaat_id ? { value: miqaatData.jamiaat_id, label: miqaatData.jamiaat_name } : null;
                const jamaatObj = miqaatData.jamaat_id ? { value: miqaatData.jamaat_id, label: miqaatData.jamaat_name } : null;
                const venueObj = miqaatData.venue_id ? { value: miqaatData.venue_id, label: miqaatData.venue_name } : null;
                const miqaatGroupObj = miqaatData.miqaat_group ? { value: miqaatData.miqaat_group, label: miqaatData.miqaat_group } : null;

                const initialFormData = {
                    miqaatGroup: miqaatGroupObj,
                    miqaatName: miqaatData.miqaat_name || '',
                    miqaatType: miqaatTypeObj,
                    startDate, startTime, endDate, endTime,
                    venue: venueObj, jamiaat: jamiaatObj, jamaat: jamaatObj,
                    quantity: miqaatData.quantity ? String(miqaatData.quantity) : '',
                    isActive: miqaatData.is_active || false,
                    hijriStartDate: miqaatData.hijri_start_date || '',
                    hijriEndDate: miqaatData.hijri_end_date || ''
                };

                setFormData(initialFormData);
                setOriginalData(initialFormData);

                if (miqaatData.jamiaat_id) {
                    await fetchJamaatByJamiaat(miqaatData.jamiaat_id);
                }
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error loading data' });
            handleClose();
        } finally {
            setLoadingMiqaatData(false);
        }
    };

    const handleJamiaatChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            jamiaat: selectedOption,
            jamaat: null,
            venue: null
        }));
        if (selectedOption) fetchJamaatByJamiaat(selectedOption.value);
        else setJamaatOptions([]);
        if (errors.jamiaat) setErrors(prev => ({ ...prev, jamiaat: '' }));
    };

    const handleJamaatChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, jamaat: selectedOption }));
        if (errors.jamaat) setErrors(prev => ({ ...prev, jamaat: '' }));
    };

    const handleVenueChange = async (selectedOption) => {
        if (selectedOption) {
            const venueDetails = allVenues.find(v => v.venue_id === selectedOption.value);
            if (venueDetails) {
                const updates = { venue: selectedOption };

                if (venueDetails.jamiaat_id && (!formData.jamiaat || formData.jamiaat.value !== venueDetails.jamiaat_id)) {
                    const jOpt = jamiaatOptions.find(x => x.value === venueDetails.jamiaat_id) || { value: venueDetails.jamiaat_id, label: 'Loading...' };
                    updates.jamiaat = jOpt;

                    const jamaatOpts = await fetchJamaatByJamiaat(venueDetails.jamiaat_id);

                    if (venueDetails.jamaat_id && venueDetails.jamaat_id !== 0) {
                        const jmOpt = jamaatOpts.find(x => x.value === venueDetails.jamaat_id);
                        if (jmOpt) {
                            updates.jamaat = jmOpt;
                        } else {
                            updates.jamaat = null;
                        }
                    } else {
                        updates.jamaat = null;
                    }
                } else if (!venueDetails.jamaat_id || venueDetails.jamaat_id === 0) {
                    updates.jamaat = null;
                } else if (venueDetails.jamaat_id && venueDetails.jamaat_id !== 0) {
                    const jmOpt = jamaatOptions.find(x => x.value === venueDetails.jamaat_id);
                    if (jmOpt) {
                        updates.jamaat = jmOpt;
                    } else {
                        updates.jamaat = null;
                    }
                }

                setFormData(prev => ({ ...prev, ...updates }));
            }
        } else {
            setFormData(prev => ({ ...prev, venue: null }));
        }
        if (errors.venue) setErrors(prev => ({ ...prev, venue: '' }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleGenericSelectChange = (name, selectedOption) => {
        setFormData(prev => ({ ...prev, [name]: selectedOption }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleMiqaatGroupChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, miqaatGroup: selectedOption }));
        if (errors.miqaatGroup) setErrors(prev => ({ ...prev, miqaatGroup: '' }));
    };

    const handleTimeChange = (name, selectedOption) => {
        setFormData(prev => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : ''
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.miqaatName.trim()) newErrors.miqaatName = 'Miqaat Name is required';
        if (!formData.miqaatType) newErrors.miqaatType = 'Miqaat Type is required';
        if (!formData.jamiaat) newErrors.jamiaat = 'Jamiaat is required';
        if (!formData.venue) newErrors.venue = 'Venue is required';
        if (!formData.quantity) newErrors.quantity = 'HR Requirement is required';
        else if (formData.quantity <= 0) newErrors.quantity = 'HR Requirement must be greater than 0';
        if (!formData.startDate) newErrors.startDate = 'Start Date is required';
        if (!formData.startTime) newErrors.startTime = 'Start Time is required';
        if (!formData.endDate) newErrors.endDate = 'End Date is required';
        if (!formData.endTime) newErrors.endTime = 'End Time is required';

        if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
            const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
            if (endDateTime <= startDateTime) newErrors.endDate = 'End Date & Time must be greater than Start Date & Time';
        }
        if (!formData.hijriStartDate) newErrors.hijriStartDate = 'Hijri Start Date is required';
        if (!formData.hijriEndDate) newErrors.hijriEndDate = 'Hijri End Date is required';

        // Validate Start Date & Time >= Current Date & Time
        // if (formData.startDate && formData.startTime) {
        //     const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        //     const currentDateTime = new Date();
        //     if (startDateTime < currentDateTime) {
        //         newErrors.startDate = 'Start Date-Time must be greater than or equal to Current Date-Time';
        //     }
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const hasChanges = () => {
        if (!originalData) return false;
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    };

    const handleUpdate = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
            const endDateTime = `${formData.endDate}T${formData.endTime}:00`;

            const requestBody = {
                miqaat_id: miqaatId,
                miqaat_name: formData.miqaatName,
                miqaat_type_id: formData.miqaatType.value,
                start_date: startDateTime,
                end_date: endDateTime,
                venue_id: formData.venue.value,
                jamaat_id: formData.jamaat ? formData.jamaat.value : null,
                jamiaat_id: formData.jamiaat.value,
                quantity: parseInt(formData.quantity),
                is_active: formData.isActive,
                hijri_start_date: formData.hijriStartDate,
                hijri_end_date: formData.hijriEndDate,
                miqaat_group: formData.miqaatGroup ? formData.miqaatGroup.value : null
            };

            const response = await fetch(`${API_BASE_URL}/Miqaat/UpdateMiqaat`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify(requestBody)
            });
            const result = await response.json();

            if (response.ok && result.success) {
                if (onUpdate) onUpdate(result.data);
                showSuccessAlert(result.message || 'Updated successfully!');
            } else {
                if (result.data && result.data.result_code === 4) {
                    setErrors({ miqaatName: 'Miqaat name already exists' });
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Miqaat name already exists', confirmButtonText: 'OK' });
                } else {
                    throw new Error(result.message || 'Failed update');
                }
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            miqaatGroup: null,
            miqaatName: '',
            miqaatType: null,
            startDate: '',
            startTime: '',
            endDate: '',
            endTime: '',
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
        if (onClose) onClose();
    };

    const handleReset = () => {
        if (originalData) {
            setFormData({ ...originalData });
            if (originalData.jamiaat?.value) fetchJamaatByJamiaat(originalData.jamiaat.value);
        }
        setErrors({});
    };

    const selectStyles = {
        control: (base, state) => ({
            ...base, minHeight: '38px',
            borderColor: state.selectProps.error ? '#dc3545' : (state.isFocused ? '#0d6efd' : '#dee2e6'),
            borderWidth: '2px', borderRadius: '8px', boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.15)' : 'none',
            '&:hover': { borderColor: state.selectProps.error ? '#dc3545' : '#adb5bd' }
        }),
        placeholder: (base) => ({ ...base, color: '#6c757d', fontSize: '15px' }),
        singleValue: (base) => ({ ...base, fontSize: '15px' }),
        dropdownIndicator: (base) => ({ ...base, color: '#0d6efd' }),
        menu: (base) => ({ ...base, zIndex: 1000 })
    };

    const modalButtons = [
        {
            label: loading ? 'Updating...' : 'Update',
            variant: 'primary',
            icon: 'ri-save-line',
            onClick: handleUpdate,
            disabled: loading || !hasChanges() || loadingMiqaatData
        },
        {
            label: 'Back',
            variant: 'secondary',
            icon: 'ri-arrow-left-line',
            onClick: handleClose,
            disabled: loading || loadingMiqaatData
        },
        {
            label: 'Reset',
            className: 'btn-clear',
            icon: 'ri-refresh-line',
            onClick: handleReset,
            disabled: loading || !hasChanges() || loadingMiqaatData
        }
    ];

    return (
        <StandardModal
            show={show}
            onClose={handleClose}
            title={title}
            icon="ri-edit-line"
            buttons={modalButtons}
            loading={loadingMiqaatData || loading}
            maxWidth="1400px"
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

                    .form-row-single {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 20px;
                    }

                    .form-row-single .horizontal-form-group {
                        flex: 1;
                        margin-bottom: 0;
                    }

                    .form-row-single .horizontal-form-group:last-child {
                        flex: 1;
                        visibility: hidden;
                    }

                    @media (max-width: 768px) {
                        .form-row-container {
                            flex-direction: column;
                            gap: 0;
                        }

                        .form-row-container .horizontal-form-group {
                            margin-bottom: 20px;
                        }

                        .form-row-single {
                            flex-direction: column;
                            gap: 0;
                        }

                        .form-row-single .horizontal-form-group:last-child {
                            display: none;
                        }
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
                `}
            </style>

            {!loadingMiqaatData && (
                <>
                    {/* Miqaat Group Row - Left Column Only */}
                    <div className="form-row-single">
                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">Miqaat Group</Form.Label>
                            <div className="form-input-wrapper">
                                <CreatableSelect
                                    options={miqaatGroupOptions}
                                    value={formData.miqaatGroup}
                                    onChange={handleMiqaatGroupChange}
                                    placeholder="Select or create miqaat group"
                                    isClearable
                                    styles={selectStyles}
                                    error={errors.miqaatGroup}
                                    isDisabled={loading}
                                    isLoading={loadingMiqaatGroups}
                                    formatCreateLabel={(inputValue) => `Create: "${inputValue}"`}
                                    noOptionsMessage={() => "Type to create new group"}
                                />
                                {errors.miqaatGroup && <div className="error-text">{errors.miqaatGroup}</div>}
                            </div>
                        </div>
                        <div className="horizontal-form-group">
                            {/* Empty right column */}
                        </div>
                    </div>

                    <div className="form-row-container">
                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">Miqaat Name <span className="text-danger">*</span></Form.Label>
                            <div className="form-input-wrapper">
                                <Form.Control type="text" name="miqaatName" value={formData.miqaatName} onChange={handleInputChange} placeholder="Enter Miqaat Name" className={errors.miqaatName ? 'is-invalid' : ''} disabled={loading} />
                                {errors.miqaatName && <div className="error-text">{errors.miqaatName}</div>}
                            </div>
                        </div>
                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">Miqaat Type <span className="text-danger">*</span></Form.Label>
                            <div className="form-input-wrapper">
                                <Select options={miqaatTypeOptions} value={formData.miqaatType} onChange={(o) => handleGenericSelectChange('miqaatType', o)} placeholder="Select Miqaat Type" isClearable styles={selectStyles} error={errors.miqaatType} isDisabled={loading} />
                                {errors.miqaatType && <div className="error-text">{errors.miqaatType}</div>}
                            </div>
                        </div>
                    </div>

                    <div className="form-row-container">
                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">Jamiaat <span className="text-danger">*</span></Form.Label>
                            <div className="form-input-wrapper">
                                <Select options={jamiaatOptions} value={formData.jamiaat} onChange={handleJamiaatChange} placeholder="Select Jamiaat" isClearable styles={selectStyles} error={errors.jamiaat} isDisabled={loading} />
                                {errors.jamiaat && <div className="error-text">{errors.jamiaat}</div>}
                            </div>
                        </div>
                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">Jamaat</Form.Label>
                            <div className="form-input-wrapper">
                                <Select options={jamaatOptions} value={formData.jamaat} onChange={handleJamaatChange} placeholder="Select Jamaat" isClearable styles={selectStyles} error={errors.jamaat} isDisabled={loading || loadingJamaat || !formData.jamiaat} noOptionsMessage={() => formData.jamiaat ? "No jamaat found" : "Please select Jamiaat first"} />
                                {errors.jamaat && <div className="error-text">{errors.jamaat}</div>}
                            </div>
                        </div>
                    </div>

                    <div className="form-row-container">
                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">Venue <span className="text-danger">*</span></Form.Label>
                            <div className="form-input-wrapper">
                                <Select options={venueOptions} value={formData.venue} onChange={handleVenueChange} placeholder="Select Venue" isClearable styles={selectStyles} error={errors.venue} isDisabled={loading || loadingVenues} isLoading={loadingVenues} noOptionsMessage={() => "No venues available"} />
                                {errors.venue && <div className="error-text">{errors.venue}</div>}
                            </div>
                        </div>
                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">HR Requirement <span className="text-danger">*</span></Form.Label>
                            <div className="form-input-wrapper">
                                <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} placeholder="Enter HR Requirement" min="1" className={errors.quantity ? 'is-invalid' : ''} disabled={loading} />
                                {errors.quantity && <div className="error-text">{errors.quantity}</div>}
                            </div>
                        </div>
                    </div>

                    <div className="form-row-container">
                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">Start Date & Time <span className="text-danger">*</span></Form.Label>
                            <div className="form-input-wrapper">
                                <div className="datetime-row">
                                    <div className="date-input"><Form.Control ref={startDateRef} type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} onClick={() => openPicker(startDateRef)} className={errors.startDate ? 'is-invalid' : ''} disabled={loading} />{errors.startDate && <div className="error-text">{errors.startDate}</div>}</div>
                                    <div className="time-input">
                                        <TimeSplitInput
                                            value={formData.startTime}
                                            onChange={(val) => handleTimeChange('startTime', { value: val })}
                                            disabled={loading}
                                            error={errors.startTime}
                                        />
                                        {errors.startTime && <div className="error-text">{errors.startTime}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">End Date & Time <span className="text-danger">*</span></Form.Label>
                            <div className="form-input-wrapper">
                                <div className="datetime-row">
                                    <div className="date-input"><Form.Control ref={endDateRef} type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} onClick={() => openPicker(endDateRef)} className={errors.endDate ? 'is-invalid' : ''} disabled={loading} />{errors.endDate && <div className="error-text">{errors.endDate}</div>}</div>
                                    <div className="time-input">
                                        <TimeSplitInput
                                            value={formData.endTime}
                                            onChange={(val) => handleTimeChange('endTime', { value: val })}
                                            disabled={loading}
                                            error={errors.endTime}
                                        />
                                        {errors.endTime && <div className="error-text">{errors.endTime}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-row-container">
                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">Hijri Start Date <span className="text-danger">*</span></Form.Label>
                            <div className="form-input-wrapper">
                                <Form.Control ref={hijriStartDateRef} type="date" name="hijriStartDate" value={formData.hijriStartDate} onChange={handleInputChange} onClick={() => openPicker(hijriStartDateRef)} className={errors.hijriStartDate ? 'is-invalid' : ''} disabled={loading} />
                                {errors.hijriStartDate && <div className="error-text">{errors.hijriStartDate}</div>}
                            </div>
                        </div>
                        <div className="horizontal-form-group">
                            <Form.Label className="form-label">Hijri End Date <span className="text-danger">*</span></Form.Label>
                            <div className="form-input-wrapper">
                                <Form.Control ref={hijriEndDateRef} type="date" name="hijriEndDate" value={formData.hijriEndDate} onChange={handleInputChange} onClick={() => openPicker(hijriEndDateRef)} className={errors.hijriEndDate ? 'is-invalid' : ''} disabled={loading} />
                                {errors.hijriEndDate && <div className="error-text">{errors.hijriEndDate}</div>}
                            </div>
                        </div>
                    </div>

                    <div className="form-row-container">
                        <div className="horizontal-form-group">
                            <Form.Label className="form-label"></Form.Label>
                            <div className="form-input-wrapper">
                                <div className="checkbox-wrapper">
                                    <Form.Check type="checkbox" id="isActiveEdit" name="isActive" checked={formData.isActive} onChange={handleInputChange} label="Active" disabled={loading} />
                                </div>
                            </div>
                        </div>
                        <div className="horizontal-form-group">
                            {/* Empty */}
                        </div>
                    </div>
                </>
            )}
        </StandardModal>
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
            fetchMiqaatData();
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
                navigate(`${import.meta.env.BASE_URL}login/`);
            });
            return;
        }

        const modulePermissions = checkModuleAccess(accessRights, MODULE_ID);

        if (!modulePermissions.hasAccess) {
            Swal.fire({
                icon: 'error',
                title: 'Access Denied',
                text: 'You do not have permission to access Miqaat Master module',
                confirmButtonText: 'OK',
                allowOutsideClick: false
            }).then(() => {
                navigate(`${import.meta.env.BASE_URL}dashboard/`);
            });
            return;
        }

        setPermissions(modulePermissions);
        setCheckingPermissions(false);
        fetchMiqaatData();
    };

    const fetchMiqaatData = async () => {
        try {
            setLoading(true);
            setError(null);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) throw new Error('Access token not found. Please login again.');

            const response = await fetch(`${API_BASE_URL}/Miqaat/GetAllMiqaat`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();

            if (result.success && result.data) {
                const transformedData = result.data.map((item, index) => ({
                    id: item.miqaat_id,
                    srNo: index + 1,
                    miqaatName: item.miqaat_name,
                    miqaatType: item.miqaat_type_name,
                    miqaatGroup: item.miqaat_group || '-',
                    venue: item.venue_name || '-',
                    jamaat: item.jamaat_name || '-',
                    quantity: item.quantity || 0,
                    isActive: item.is_active,
                    startDateTime: item.start_date ? (() => {
                        const dt = new Date(item.start_date);
                        const date = dt.toLocaleDateString('en-GB');
                        const time = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                        return `${date}\n${time}`;
                    })() : '-'
                }));
                setTableData(transformedData);
            } else {
                throw new Error(result.message || 'Failed to fetch miqaat data');
            }
        } catch (err) {
            console.error(err);
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
                text: 'You do not have permission to add miqaat',
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
        setEditMiqaatId(null);
    };

    const handleSave = (data) => {
        setShowAddForm(false);
        fetchMiqaatData();
        setGridKey(prev => prev + 1);
    };

    const handleUpdate = (data) => {
        setShowEditForm(false);
        setEditMiqaatId(null);
        fetchMiqaatData();
        setGridKey(prev => prev + 1);
    };

    const handleEdit = (id) => {
        if (!permissions.canEdit) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to edit miqaat',
                confirmButtonText: 'OK'
            });
            return;
        }
        setEditMiqaatId(id);
        setShowEditForm(true);
    };

    const handleDelete = async (id) => {
        if (!permissions.canDelete) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to delete miqaat',
                confirmButtonText: 'OK'
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const accessToken = sessionStorage.getItem('access_token');
                const response = await fetch(`${API_BASE_URL}/Miqaat/DeleteMiqaat`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                    body: JSON.stringify({ miqaat_id: id })
                });
                const apiResult = await response.json();
                if (response.ok && apiResult.success) {
                    Swal.fire('Deleted!', 'Record has been deleted.', 'success');
                    fetchMiqaatData();
                    setGridKey(prev => prev + 1);
                } else {
                    Swal.fire('Error!', apiResult.message || 'Failed to delete.', 'error');
                }
            } catch (error) {
                Swal.fire('Error!', error.message, 'error');
            }
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

    const gridData = useMemo(() => tableData.map(item => [
        item.srNo, item.miqaatName, item.miqaatType, item.miqaatGroup, item.venue, item.jamaat,
        item.quantity, item.isActive ? 'Active' : 'Inactive', item.startDateTime, item.id
    ]), [tableData]);

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

                    #grid-miqaat-table .gridjs-search {
                        width: 100%;
                        margin-bottom: 1rem;
                    }
                    #grid-miqaat-table .gridjs-search-input {
                        width: 100%;
                        padding: 8px 12px;
                        border: 1px solid #dee2e6;
                        border-radius: 6px;
                    }
                    #grid-miqaat-table .gridjs-wrapper {
                        margin-top: 0.5rem;
                    }
                    .btn-action-group {
                        display: inline-flex;
                        gap: 10px;
                        align-items: center;
                    }
                    .btn-action-group .btn {
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

            <AddMiqaat
                show={showAddForm}
                onClose={handleCloseAddModal}
                onSave={handleSave}
                permissions={permissions}
            />

            <EditMiqaat
                show={showEditForm}
                onClose={handleCloseEditModal}
                onUpdate={handleUpdate}
                miqaatId={editMiqaatId}
                permissions={permissions}
            />

            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>
                                <div className="page-header-title">
                                    <div className="header-text">
                                        <i className="ri-calendar-event-line"></i>
                                        <span>Miqaat Master</span>
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
                                        <p className="mt-3">Loading miqaat data...</p>
                                    </div>
                                ) : error ? (
                                    <div className="error-container">
                                        <i className="ri-error-warning-line" style={{ fontSize: '48px' }}></i>
                                        <p className="mt-3">{error}</p>
                                        <button
                                            className="btn btn-primary mt-3"
                                            onClick={fetchMiqaatData}
                                        >
                                            <i className="ri-refresh-line me-2"></i>
                                            Retry
                                        </button>
                                    </div>
                                ) : tableData.length === 0 ? (
                                    <div className="loading-container">
                                        <i className="ri-inbox-line" style={{ fontSize: '48px' }}></i>
                                        <p className="mt-3">No miqaat found</p>
                                        {permissions.canAdd && (
                                            <button
                                                className="btn btn-primary mt-2"
                                                onClick={handleAdd}
                                            >
                                                <i className="ri-add-line me-2"></i>
                                                Add First Miqaat
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div id="grid-miqaat-table">
                                        <Grid
                                            key={gridKey}
                                            data={gridData}
                                            columns={[
                                                { name: 'Sr', width: '35px' },
                                                { name: 'Miqaat Name', width: '180px' },
                                                { name: 'Type', width: '90px' },
                                                { name: 'Group', width: '120px' },
                                                { name: 'Venue', width: '75px' },
                                                { name: 'Jamaat', width: '100px' },
                                                { name: 'HR Req', width: '65px' },
                                                { name: 'Status', width: '65px' },
                                                { name: 'Start Time', width: '90px', formatter: (cell) => html(cell.replace('\n', '<br>')) },
                                                {
                                                    name: 'Action',
                                                    width: '75px',
                                                    formatter: (cell, row) => {
                                                        const id = row.cells[9].data;

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
                                                    hidden: !permissions.canEdit && !permissions.canDelete
                                                }
                                            ]}
                                            search={true}
                                            pagination={{ limit: 10 }}
                                            className={{ table: 'table table-bordered' }}
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

export default MiqaatTable;