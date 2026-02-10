// MiqaatIncharge.jsx - COMPLETE UPDATED FILE WITH FIXES
import React, { useState, useEffect, Fragment } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkModuleAccess } from '../../utils/accessControl';
import '../../styles/shared-styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MODULE_ID = '111';

// ============================================================================
// TimeSplitInput Component (inline)
// ============================================================================
const TimeSplitInput = ({ value, onChange, disabled, error }) => {
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const MiqaatIncharge = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // RBAC State
    const [checkingPermissions, setCheckingPermissions] = useState(true);
    const [permissions, setPermissions] = useState({
        canAdd: false,
        canEdit: false,
        canDelete: false,
        hasAccess: false
    });

    const miqaatName = location.state?.miqaatName || 'Unknown Miqaat';
    const miqaatId = location.state?.miqaat_id || null;

    const [incomingMiqaat, setIncomingMiqaat] = useState(null);
    const [showInfoBanner, setShowInfoBanner] = useState(false);
    const [miqaatInfo, setMiqaatInfo] = useState(null);
    const [loadingMiqaatInfo, setLoadingMiqaatInfo] = useState(false);
    const [showBackButton, setShowBackButton] = useState(false);
    const [isMiqaatLocked, setIsMiqaatLocked] = useState(false); // Lock miqaat dropdown when coming from MiqaatMaster


    const [formData, setFormData] = useState({
        miqaat: null,
        jamiaat: null,
        location: null,
        team: null,
        member: null,
        reportingTime: ''
    });

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingInchargeId, setEditingInchargeId] = useState(null);
    const [showFormSections, setShowFormSections] = useState(false);
    const [showInchargesTable, setShowInchargesTable] = useState(false);

    const [isReportingTimeDisabled, setIsReportingTimeDisabled] = useState(false);
    const [locationReportingTimeMap, setLocationReportingTimeMap] = useState({});

    const [miqaatOptions, setMiqaatOptions] = useState([]);
    const [jamiaatOptions, setJamiaatOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [memberOptions, setMemberOptions] = useState([]);
    const [incharges, setIncharges] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingMiqaat, setLoadingMiqaat] = useState(false);
    const [loadingJamiaat, setLoadingJamiaat] = useState(false);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [loadingGrid, setLoadingGrid] = useState(false);

    const [errors, setErrors] = useState({});

    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    const convertTo12Hour = (time24) => {
        if (!time24) return '';

        const parts = time24.split(':');
        if (parts.length < 2) return '';

        let hour = parseInt(parts[0]);
        const minute = parts[1];

        if (isNaN(hour)) return '';

        const period = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;

        return `${String(hour).padStart(2, '0')}:${minute} ${period}`;
    };

    const convertTo24Hour = (time12) => {
        if (!time12) return null;

        const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!match) return null;

        let hour = parseInt(match[1]);
        const minute = match[2];
        const period = match[3].toUpperCase();

        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;

        return `${String(hour).padStart(2, '0')}:${minute}`;
    };

    const isDefaultTime = (timeStr) => {
        if (!timeStr) return true;
        const normalized = timeStr.split(':').slice(0, 2).join(':');
        return normalized === '00:00';
    };

    const getLocationReportingTime = (locationId) => {
        return locationReportingTimeMap[locationId] || null;
    };

    const buildLocationReportingTimeMap = (inchargesData) => {
        const map = {};

        if (!inchargesData || !Array.isArray(inchargesData)) return map;

        inchargesData.forEach(incharge => {
            const locId = incharge.location_id;
            const reportTime = incharge.reporting_time;

            // Only store if reporting_time is NOT null and NOT 00:00:00
            if (reportTime && !isDefaultTime(reportTime)) {
                if (!map[locId]) {
                    map[locId] = reportTime;
                }
            }
        });

        return map;
    };

    const formatDateTime = (dateString, showDate = true, showTime = true) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);

        let result = '';
        if (showDate) {
            result += date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
        if (showTime) {
            if (result) result += ' ';
            result += date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        }
        return result;
    };

    // ============================================================================
    // EFFECT: Auto-update reporting time when location or map changes
    // ============================================================================
    useEffect(() => {
        // Don't run if no location selected
        if (!formData.location?.value) {
            setIsReportingTimeDisabled(false);
            return;
        }

        // In edit mode, always enable the field
        if (isEditMode) {
            setIsReportingTimeDisabled(false);
            return;
        }

        // Get existing time for this location
        const existingTime = getLocationReportingTime(formData.location.value);

        if (existingTime && !isDefaultTime(existingTime)) {
            // Location has a reporting time - set it and disable
            const time24 = existingTime.split(':').slice(0, 2).join(':');
            const currentTime24 = formData.reportingTime ? formData.reportingTime.split(':').slice(0, 2).join(':') : '';

            // Only update if different to avoid unnecessary re-renders
            if (currentTime24 !== time24) {
                setFormData(prev => ({ ...prev, reportingTime: time24 }));
            }
            setIsReportingTimeDisabled(true);
        } else {
            // No existing time - clear and enable
            const currentTime24 = formData.reportingTime ? formData.reportingTime.split(':').slice(0, 2).join(':') : '';
            if (currentTime24 !== '') {
                setFormData(prev => ({ ...prev, reportingTime: '' }));
            }
            setIsReportingTimeDisabled(false);
        }
    }, [locationReportingTimeMap, formData.location?.value, isEditMode]);

    // ============================================================================
    // NAVIGATION HANDLING
    // ============================================================================
    useEffect(() => {
        if (location.state?.fromMiqaatCreation && location.state?.miqaatId) {
            setIncomingMiqaat({
                miqaatId: location.state.miqaatId,
                miqaatName: location.state.miqaatName,
                venueId: location.state.venueId
            });
            setShowInfoBanner(true);
            setShowBackButton(true);
            setIsMiqaatLocked(true); // Lock miqaat dropdown when coming from MiqaatMaster
        } else if (location.state?.fromDuties && location.state?.miqaatId) {
            // Coming back from Duties page - pre-select the miqaat but don't lock it
            setIncomingMiqaat({
                miqaatId: location.state.miqaatId,
                miqaatName: location.state.miqaatName,
                venueId: location.state.venueId
            });
            setShowInfoBanner(false);
            setShowBackButton(false);
            setIsMiqaatLocked(false); // Keep miqaat dropdown enabled
        }
    }, [location.state]);

    // RBAC Check
    useEffect(() => {
        const checkAccess = () => {
            setCheckingPermissions(true);

            const isAdminValue = sessionStorage.getItem('is_admin');
            if (isAdminValue === 'true' || isAdminValue === true || isAdminValue === '1') {
                setPermissions({ canAdd: true, canEdit: true, canDelete: true, hasAccess: true });
                setCheckingPermissions(false);
                fetchInitialData();
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

            const access = checkModuleAccess(accessRights, MODULE_ID);

            if (!access.hasAccess) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Access Denied',
                    text: 'You do not have permission to access this module.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    const redirectPath = `${import.meta.env.BASE_URL}dashboard/`;
                    console.log('Redirecting to:', redirectPath);
                    navigate(redirectPath);
                });
                return;
            }

            setPermissions(access);
            setCheckingPermissions(false);
            fetchInitialData(); // Fetch initial data only after permissions are checked
        };

        checkAccess();
    }, [navigate]);

    useEffect(() => {
        if (incomingMiqaat && miqaatOptions.length > 0) {
            const targetMiqaat = miqaatOptions.find(
                opt => opt.value == incomingMiqaat.miqaatId
            );

            if (targetMiqaat) {
                handleMiqaatChange(targetMiqaat);
                setIncomingMiqaat(null);
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Miqaat Not Found',
                    text: 'The miqaat may not be active. Please select it manually.',
                    confirmButtonText: 'OK'
                });
                setShowInfoBanner(false);
                setIncomingMiqaat(null);
            }
        }
    }, [incomingMiqaat, miqaatOptions]);

    // ============================================================================
    // AUTHENTICATION
    // ============================================================================
    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = () => {
        setCheckingPermissions(true);
        const isAdminValue = sessionStorage.getItem('is_admin');

        if (isAdminValue === 'true' || isAdminValue === true || isAdminValue === '1') {
            setPermissions({ canAdd: true, canEdit: true, canDelete: true, hasAccess: true });
            setCheckingPermissions(false);
            fetchInitialData();
            return;
        }

        const accessRights = sessionStorage.getItem('access_rights');
        if (!accessRights) {
            Swal.fire({
                icon: 'error',
                title: 'Session Expired',
                text: 'Your session has expired. Please log in again.',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate(`${import.meta.env.BASE_URL}login/`);
            });
            return;
        }

        const modulePermissions = checkModuleAccess(accessRights, MODULE_ID);

        if (!modulePermissions.hasAccess) {
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

        setPermissions(modulePermissions);
        setCheckingPermissions(false);
        fetchInitialData();
    };

    // Helper function to trigger background notifications
    const triggerBackgroundNotification = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/Notification/burhani_background_notification`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: ''
            });

            if (!response.ok) {
                console.warn('Background notification API returned non-OK status:', response.status);
            }
        } catch (error) {
            // Silently log error - don't interrupt user flow for notification failures
            console.error('Failed to trigger background notification:', error);
        }
    };

    // ============================================================================
    // API CALLS
    // ============================================================================
    const fetchInitialData = async () => {
        await fetchMiqaatOptions();
    };

    const fetchMiqaatOptions = async () => {
        setLoadingMiqaat(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Duty/GetListOfActiveMiqaat`, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const options = result.data.map(item => ({ value: item.miqaat_id, label: item.miqaat_name, venue_id: item.venue_id }));
                    setMiqaatOptions(options);
                }
            }
        } catch (error) {
            console.error('Error fetching miqaat options:', error);
        } finally {
            setLoadingMiqaat(false);
        }
    };

    const fetchJamiaatOptions = async () => {
        setLoadingJamiaat(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Team/GetAllJamiaats`, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const options = result.data.map(item => ({ value: item.jamiaat_id, label: item.jamiaat_name }));
                    setJamiaatOptions(options);
                } else {
                    setJamiaatOptions([]);
                }
            }
        } catch (error) {
            console.error('Error fetching jamiaat options:', error);
            setJamiaatOptions([]);
        } finally {
            setLoadingJamiaat(false);
        }
    };

    const fetchTeamOptions = async (jamiaatId = null) => {
        setLoadingTeams(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            let url, method, body;

            if (jamiaatId) {
                url = `${API_BASE_URL}/Duty/GetTeamsByJamiaat`;
                method = 'POST';
                body = JSON.stringify({ jamiaat_id: jamiaatId });
            } else {
                url = `${API_BASE_URL}/Duty/GetAllTeamsDuty`;
                method = 'GET';
                body = null;
            }

            const fetchOptions = {
                method: method,
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
            };
            if (body) fetchOptions.body = body;

            const response = await fetch(url, fetchOptions);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const options = result.data.map(item => ({ value: item.team_id, label: item.team_name, jamiaat_id: item.jamiaat_id }));
                    setTeamOptions(options);
                } else {
                    setTeamOptions([]);
                }
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
            setTeamOptions([]);
        } finally {
            setLoadingTeams(false);
        }
    };

    const fetchLocationsByVenue = async (venueId) => {
        setLoadingLocations(true);
        setFormData(prev => ({ ...prev, location: null }));
        try {
            const accessToken = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Duty/GetLocationsByVenue`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify({ venue_id: venueId })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const options = result.data.map(item => ({ value: item.location_id, label: item.location_name, venue_id: item.venue_id }));
                    setLocationOptions(options);
                } else {
                    setLocationOptions([]);
                }
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
            setLocationOptions([]);
        } finally {
            setLoadingLocations(false);
        }
    };

    const fetchTeamMembersForIncharge = async (teamId, miqaatId) => {
        setLoadingMembers(true);

        try {
            const accessToken = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Incharge/GetTeamMembersForIncharge`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify({ team_id: teamId, miqaat_id: miqaatId })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const options = result.data.map(item => ({
                        value: item.its_id,
                        label: `${item.full_name} (${item.its_id})`,
                        team_id: item.team_id
                    }));
                    setMemberOptions(options);
                } else {
                    setMemberOptions([]);
                }
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            setMemberOptions([]);
        } finally {
            setLoadingMembers(false);
        }
    };

    const fetchInchargesByMiqaat = async (miqaatId) => {
        setLoadingGrid(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Incharge/GetInchargesByMiqaat`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify({ miqaat_id: miqaatId })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setIncharges(result.data);
                    setShowInchargesTable(true);

                    // Build location reporting time map
                    const timeMap = buildLocationReportingTimeMap(result.data);
                    setLocationReportingTimeMap(timeMap);

                    console.log('Built location reporting time map:', timeMap);
                } else {
                    setIncharges([]);
                    setShowInchargesTable(true);
                    setLocationReportingTimeMap({});
                }
            }
        } catch (error) {
            console.error('Error fetching incharges:', error);
            setIncharges([]);
        } finally {
            setLoadingGrid(false);
        }
    };

    const fetchInchargeById = async (guardDutyId) => {
        try {
            const accessToken = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Incharge/GetInchargeById`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify({ guard_duty_id: guardDutyId })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data && result.data.length > 0) return result.data[0];
            }
            return null;
        } catch (error) {
            console.error('Error fetching incharge details:', error);
            return null;
        }
    };

    const fetchMiqaatInfo = async (miqaatId) => {
        try {
            setLoadingMiqaatInfo(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) {
                console.error('Access token not found');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Miqaat/GetMiqaatById`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ miqaat_id: miqaatId })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data && result.data.length > 0) {
                    setMiqaatInfo(result.data[0]);
                } else {
                    setMiqaatInfo(null);
                }
            }
        } catch (error) {
            console.error('Error fetching miqaat info:', error);
            setMiqaatInfo(null);
        } finally {
            setLoadingMiqaatInfo(false);
        }
    };

    // ============================================================================
    // HANDLERS
    // ============================================================================

    const handleMiqaatChange = (selectedOption) => {
        if (showInfoBanner && formData.miqaat !== null) {
            setShowInfoBanner(false);
        }

        setFormData(prev => ({
            ...prev,
            miqaat: selectedOption,
            jamiaat: null,
            location: null,
            team: null,
            member: null,
            reportingTime: ''
        }));
        setErrors({});
        setLocationOptions([]);
        setMemberOptions([]);
        setIsReportingTimeDisabled(false);

        if (selectedOption?.value) {
            setShowFormSections(true);
            fetchJamiaatOptions();
            fetchTeamOptions(null);

            if (selectedOption.venue_id) {
                fetchLocationsByVenue(selectedOption.venue_id);
                fetchInchargesByMiqaat(selectedOption.value);
                fetchMiqaatInfo(selectedOption.value);
            }
        } else {
            setShowFormSections(false);
            setIncharges([]);
            setShowInchargesTable(false);
            setJamiaatOptions([]);
            setTeamOptions([]);
            setMiqaatInfo(null);
            setLocationReportingTimeMap({});
        }
    };

    const handleJamiaatChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, jamiaat: selectedOption, team: null, member: null }));
        setMemberOptions([]);
        if (errors.jamiaat) setErrors(prev => ({ ...prev, jamiaat: '' }));

        if (selectedOption?.value) {
            fetchTeamOptions(selectedOption.value);
        } else {
            fetchTeamOptions(null);
        }
    };

    const handleTeamChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, team: selectedOption, member: null }));
        setMemberOptions([]);
        if (errors.team) setErrors(prev => ({ ...prev, team: '' }));

        if (selectedOption?.value && formData.miqaat?.value) {
            fetchTeamMembersForIncharge(selectedOption.value, formData.miqaat.value);
        }
    };

    const handleLocationChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, location: selectedOption, reportingTime: '' }));
        if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
        if (errors.reportingTime) setErrors(prev => ({ ...prev, reportingTime: '' }));

        // The useEffect will handle the rest automatically
    };

    const handleMemberChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, member: selectedOption }));
        if (errors.member) setErrors(prev => ({ ...prev, member: '' }));
    };

    const handleReportingTimeChange = (time24) => {
        setFormData(prev => ({ ...prev, reportingTime: time24 }));
        if (errors.reportingTime) setErrors(prev => ({ ...prev, reportingTime: '' }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.miqaat) newErrors.miqaat = 'Please select a Miqaat';
        if (!formData.team) newErrors.team = 'Please select a Team';
        if (!formData.location) newErrors.location = 'Please select a Location';
        if (!formData.member) newErrors.member = 'Please select a Member';

        // Reporting time validation for INSERT mode only
        if (!isEditMode && formData.location?.value) {
            const existingTime = getLocationReportingTime(formData.location.value);

            if (existingTime && !isDefaultTime(existingTime)) {
                // Location has existing reporting time
                if (!formData.reportingTime) {
                    newErrors.reportingTime = 'Reporting time is required for this location';
                } else {
                    // Check if times match
                    const existingTime24 = existingTime.split(':').slice(0, 2).join(':');
                    const currentTime24 = formData.reportingTime.split(':').slice(0, 2).join(':');

                    if (existingTime24 !== currentTime24) {
                        const existingTime12 = convertTo12Hour(existingTime24);
                        newErrors.reportingTime = `Reporting time must match existing incharges (${existingTime12})`;
                    }
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!isEditMode && !permissions.canAdd) {
            Swal.fire({ icon: 'warning', title: 'Permission Denied', text: 'You do not have permission to add.', confirmButtonText: 'OK' });
            return;
        }
        if (isEditMode && !permissions.canEdit) {
            Swal.fire({ icon: 'warning', title: 'Permission Denied', text: 'You do not have permission to edit.', confirmButtonText: 'OK' });
            return;
        }

        if (!validateForm()) return;

        setLoading(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            let response, apiEndpoint, requestBody;

            // Prepare reporting_time for API
            let reportingTimeForAPI = null;
            if (formData.reportingTime) {
                // Check if it's still placeholder or actually set
                const hasHour = formData.reportingTime.includes(':');
                if (hasHour) {
                    reportingTimeForAPI = formData.reportingTime; // Send as HH:mm
                }
            }

            if (isEditMode) {
                apiEndpoint = `${API_BASE_URL}/Incharge/UpdateIncharge`;
                requestBody = {
                    guard_duty_id: editingInchargeId,
                    miqaat_id: formData.miqaat.value,
                    its_id: formData.member.value,
                    location_id: formData.location.value,
                    reporting_time: reportingTimeForAPI
                };
                response = await fetch(apiEndpoint, {
                    method: 'PUT',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                    body: JSON.stringify(requestBody)
                });
            } else {
                apiEndpoint = `${API_BASE_URL}/Incharge/InsertIncharge`;
                requestBody = {
                    miqaat_id: formData.miqaat.value,
                    its_id: formData.member.value,
                    location_id: formData.location.value,
                    reporting_time: reportingTimeForAPI
                };
                response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                    body: JSON.stringify(requestBody)
                });
            }

            const result = await response.json();

            if (response.ok) {
                const resultCode = Number(result.data?.result_code);

                if ((isEditMode && (resultCode === 2 || resultCode === 6)) || (!isEditMode && resultCode === 1)) {
                    let successMessage = result.message;

                    Swal.fire({
                        title: 'Success!',
                        text: successMessage,
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: false,
                        showConfirmButton: false
                    });

                    // Trigger background notifications for push
                    await triggerBackgroundNotification();

                    // Refresh incharges list and rebuild map
                    if (formData.miqaat?.value) {
                        await fetchInchargesByMiqaat(formData.miqaat.value);
                    }

                    if (isEditMode) {
                        setTimeout(() => handleCancel(), 2000);
                    } else {
                        // For INSERT mode, keep location (useEffect will handle reporting time)
                        setFormData(prev => ({
                            ...prev,
                            member: null
                        }));

                        if (formData.team?.value && formData.miqaat?.value) {
                            fetchTeamMembersForIncharge(formData.team.value, formData.miqaat.value);
                        }
                    }

                } else if (resultCode === 4) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Duplicate Entry',
                        text: 'This member is already an incharge for this miqaat',
                        confirmButtonText: 'OK'
                    });
                } else if (resultCode === 5) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Reporting Time Mismatch',
                        text: result.message || 'This location already has incharges with a different reporting time',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed',
                        text: result.message || 'Operation failed',
                        confirmButtonText: 'OK'
                    });
                }
            } else {
                throw new Error(result.message || `Server error: ${response.status}`);
            }
        } catch (error) {
            console.error('Error saving:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (incharge) => {
        if (!permissions.canEdit) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to edit.',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const inchargeDetails = await fetchInchargeById(incharge.guard_duty_id);
            if (!inchargeDetails) throw new Error("Details not found");

            if (!showFormSections) setShowFormSections(true);
            if (jamiaatOptions.length === 0) await fetchJamiaatOptions();

            const selectedMiqaat = miqaatOptions.find(opt => opt.value === inchargeDetails.miqaat_id);
            if (selectedMiqaat && selectedMiqaat.venue_id) {
                await fetchLocationsByVenue(selectedMiqaat.venue_id);
            }

            await fetchTeamOptions(null);
            const selectedTeam = teamOptions.find(opt => opt.value === inchargeDetails.team_id)
                || { value: inchargeDetails.team_id, label: inchargeDetails.team_name };

            if (selectedTeam) {
                await fetchTeamMembersForIncharge(inchargeDetails.team_id, inchargeDetails.miqaat_id);
            }

            // Handle reporting time
            let reportingTime24 = '';
            if (inchargeDetails.reporting_time && !isDefaultTime(inchargeDetails.reporting_time)) {
                reportingTime24 = inchargeDetails.reporting_time.split(':').slice(0, 2).join(':');
            }

            setFormData({
                miqaat: selectedMiqaat,
                jamiaat: null,
                team: selectedTeam,
                location: { value: inchargeDetails.location_id, label: inchargeDetails.location_name },
                member: { value: inchargeDetails.its_id, label: `${inchargeDetails.full_name} (${inchargeDetails.its_id})` },
                reportingTime: reportingTime24
            });

            setIsEditMode(true);
            setEditingInchargeId(incharge.guard_duty_id);

            setShowInfoBanner(false);

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Error loading edit:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load details',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleDelete = async (guardDutyId) => {
        if (!permissions.canDelete) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to delete.',
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
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        try {
            const accessToken = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Incharge/DeleteIncharge`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify({ guard_duty_id: guardDutyId })
            });
            const apiResult = await response.json();

            if (response.ok && apiResult.success && Number(apiResult.data?.result_code) === 3) {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Incharge has been removed.',
                    icon: 'success',
                    timer: 2000,
                    timerProgressBar: false,
                    showConfirmButton: false
                });

                // Refresh the grid - this will rebuild the map
                if (formData.miqaat?.value) {
                    await fetchInchargesByMiqaat(formData.miqaat.value);
                }

                // Refresh members list
                if (formData.team?.value && formData.miqaat?.value) {
                    fetchTeamMembersForIncharge(formData.team.value, formData.miqaat.value);
                }

                // The useEffect will automatically update the reporting time state

            } else {
                throw new Error(apiResult.message || 'Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleCancel = () => {
        setFormData(prev => ({
            ...prev,
            jamiaat: null,
            location: null,
            team: null,
            member: null,
            reportingTime: ''
        }));
        setIsEditMode(false);
        setEditingInchargeId(null);
        setErrors({});
        setMemberOptions([]);
        setIsReportingTimeDisabled(false);

        if (jamiaatOptions.length > 0) fetchTeamOptions(null);
    };

    const handleClear = () => {
        setFormData({
            miqaat: null,
            jamiaat: null,
            location: null,
            team: null,
            member: null,
            reportingTime: ''
        });
        setErrors({});
        setLocationOptions([]);
        setMemberOptions([]);
        setTeamOptions([]);
        setIncharges([]);
        setShowInchargesTable(false);
        setShowFormSections(false);
        setIsEditMode(false);
        setEditingInchargeId(null);
        setShowInfoBanner(false);
        setMiqaatInfo(null);
        setLocationReportingTimeMap({});
        setIsReportingTimeDisabled(false);
    };

    const handleBackToMiqaat = () => {
        navigate(`${import.meta.env.BASE_URL}master/miqaatmaster`);
    };

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '38px',
            borderColor: state.selectProps.error ? '#dc3545' : (state.isFocused ? '#0d6efd' : '#dee2e6'),
            borderWidth: '2px',
            borderRadius: '8px',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.15)' : 'none',
            '&:hover': { borderColor: state.selectProps.error ? '#dc3545' : '#adb5bd' }
        }),
        placeholder: (base) => ({ ...base, color: '#6c757d', fontSize: '15px' }),
        singleValue: (base) => ({ ...base, fontSize: '15px' }),
        dropdownIndicator: (base) => ({ ...base, color: '#0d6efd', '&:hover': { color: '#0b5ed7' } }),
        menu: (base) => ({ ...base, zIndex: 1000 })
    };

    if (checkingPermissions) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', gap: '20px' }}>
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p style={{ fontSize: '16px', color: '#666' }}>Checking access permissions...</p>
            </div>
        );
    }

    if (!permissions.hasAccess) {
        return null;
    }

    return (
        <Fragment>
            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>
                                <style>{`
                                    .info-banner{background:linear-gradient(135deg,#d4edff 0%,#e8f5ff 100%);border:2px solid #0d6efd;border-radius:8px;padding:15px 20px;margin-bottom:25px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 8px rgba(13,110,253,.1)}.info-banner-content{display:flex;align-items:center;gap:12px;flex:1}.info-banner-icon{font-size:24px;color:#0d6efd}.info-banner-text{font-size:15px;color:#084298;font-weight:500}.info-banner-text strong{font-weight:700;color:#052c65}.info-banner-close{background:0 0;border:none;font-size:20px;color:#084298;cursor:pointer;padding:5px 10px;transition:all .2s;border-radius:4px}.info-banner-close:hover{background:rgba(13,110,253,.1);color:#052c65}.miqaat-info-card{background:linear-gradient(135deg,#f8f9fa 0%,#fff 100%);border:2px solid #dee2e6;border-radius:12px;padding:20px;margin-bottom:25px;box-shadow:0 2px 8px rgba(0,0,0,.05)}.miqaat-info-header{display:flex;align-items:center;gap:10px;margin-bottom:15px;padding-bottom:12px;border-bottom:2px solid #dee2e6}.miqaat-info-header i{font-size:22px;color:#0d6efd}.miqaat-info-title{font-size:17px;font-weight:700;color:#212529;margin:0}.miqaat-info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px}.miqaat-info-item{display:flex;flex-direction:column;gap:4px}.miqaat-info-label{font-size:12px;font-weight:600;color:#6c757d;text-transform:uppercase;letter-spacing:.5px}.miqaat-info-value{font-size:15px;font-weight:500;color:#212529;display:flex;align-items:center;gap:6px}.miqaat-info-value i{font-size:16px;color:#0d6efd}.miqaat-info-loading{text-align:center;padding:30px;color:#6c757d}.miqaat-info-loading-spinner{width:30px;height:30px;border:3px solid rgba(13,110,253,.1);border-top-color:#0d6efd;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 10px}@keyframes spin{to{transform:rotate(360deg)}}.back-button{padding:0 20px;background:#6c757d;border:none;border-radius:8px;color:#fff;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;height:38px;display:inline-flex;align-items:center;gap:8px;justify-content:center}.back-button:hover:not(:disabled){background:#5c636a;transform:translateY(-1px);box-shadow:0 4px 8px rgba(108,117,125,.3)}.back-button:disabled{opacity:.6;cursor:not-allowed}.edit-mode-badge{background:#ffc107;color:#000;padding:6px 15px;border-radius:20px;font-size:14px;font-weight:500}.form-label{font-weight:500;font-size:14px;color:#495057;margin-bottom:8px;display:block}.error-text{color:#dc3545;font-size:13px;margin-top:6px;display:block}.button-row{display:flex;gap:15px;margin-top:20px;justify-content:center;align-items:center}.save-button{height:38px;padding:0 35px;background:#0d6efd;border:none;border-radius:8px;color:#fff;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;justify-content:center}.save-button:hover:not(:disabled){background:#0b5ed7;transform:translateY(-1px);box-shadow:0 4px 12px rgba(13,110,253,.3)}.save-button:active:not(:disabled){transform:translateY(0)}.save-button:disabled{opacity:.6;cursor:not-allowed}.save-button.update-mode{background:#28a745}.save-button.update-mode:hover:not(:disabled){background:#218838}.cancel-edit-button{height:38px;padding:0 35px;background:#ffc107;border:none;border-radius:8px;color:#000;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;justify-content:center}.cancel-edit-button:hover:not(:disabled){background:#e0a800}.spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite}.clear-button{padding:0 20px;background:#6c757d;border:none;border-radius:8px;color:#fff;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;height:38px}.clear-button:hover:not(:disabled){background:#5c636a}.clear-button:disabled{opacity:.6;cursor:not-allowed}.duties-table-container{margin-top:40px;border-top:2px solid #dee2e6;padding-top:30px}.table-title{font-size:18px;font-weight:600;margin-bottom:20px;color:#333;display:flex;align-items:center;gap:10px}.duties-table-wrapper{overflow-x:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1)}.duties-table{width:100%;border-collapse:collapse;background:#fff;border:2px solid #dee2e6}.duties-table thead{background:#fff;color:#000;border-bottom:2px solid #dee2e6}.duties-table th{padding:15px;text-align:left;font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:.5px;border-right:1px solid #dee2e6}.duties-table th:last-child{border-right:none}.duties-table tbody tr{border-bottom:1px solid #dee2e6;transition:background-color .2s}.duties-table tbody tr:hover{background-color:#f8f9fa}.duties-table tbody tr:last-child{border-bottom:none}.duties-table td{padding:15px;font-size:14px;color:#495057;border-right:1px solid #dee2e6}.duties-table td:last-child{border-right:none}.action-buttons{display:flex;gap:10px;align-items:center}.icon-button{width:36px;height:36px;border:none;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .2s;font-size:16px}.edit-icon-button{background:#0d6efd;color:#fff}.edit-icon-button:hover{background:#0b5ed7;transform:translateY(-2px);box-shadow:0 4px 8px rgba(13,110,253,.3)}.delete-icon-button{background:#dc3545;color:#fff}.delete-icon-button:hover{background:#c82333;transform:translateY(-2px);box-shadow:0 4px 8px rgba(220,53,69,.3)}.no-duties-message{text-align:center;padding:40px 20px;color:#6c757d;font-size:15px}.no-duties-icon{font-size:48px;margin-bottom:15px;opacity:.5}.loading-duties{text-align:center;padding:40px 20px;color:#0d6efd}.loading-spinner{width:40px;height:40px;border:4px solid rgba(13,110,253,.1);border-top-color:#0d6efd;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 15px}@media (max-width:768px){.button-row{flex-direction:column;width:100%}.save-button,.cancel-edit-button,.clear-button{width:100%}.duties-table-wrapper{overflow-x:scroll}.duties-table th,.duties-table td{padding:10px;font-size:13px}}
                                `}</style>

                                <div className="page-header-title">
                                    <div className="header-text"><i className="ri-shield-user-line"></i><span>Location Incharge</span></div>
                                    {isEditMode && (<span className="edit-mode-badge"><i className="ri-edit-line me-1"></i>Edit Mode</span>)}
                                </div>

                                {showInfoBanner && formData.miqaat && (
                                    <div className="info-banner">
                                        <div className="info-banner-content">
                                            <i className="ri-information-line info-banner-icon"></i>
                                            <div className="info-banner-text">
                                                Add incharges for <strong>{formData.miqaat.label}</strong>
                                            </div>
                                        </div>
                                        <button className="info-banner-close" onClick={() => setShowInfoBanner(false)} title="Dismiss">
                                            <i className="ri-close-line"></i>
                                        </button>
                                    </div>
                                )}

                                {/* Miqaat Selection */}
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <div className="miqaat-dropdown-container">
                                            <label className="form-label">Miqaat <span className="text-danger">*</span></label>
                                            <Select
                                                options={miqaatOptions}
                                                value={formData.miqaat}
                                                onChange={handleMiqaatChange}
                                                placeholder="Select Miqaat"
                                                isClearable
                                                styles={selectStyles}
                                                error={errors.miqaat}
                                                isDisabled={loading || isEditMode || isMiqaatLocked}
                                                isLoading={loadingMiqaat}
                                            />
                                            {errors.miqaat && <span className="error-text">{errors.miqaat}</span>}
                                        </div>
                                    </Col>
                                </Row>

                                {/* Miqaat Info Card */}
                                {showFormSections && miqaatInfo && (
                                    <div className="miqaat-info-card">
                                        <div className="miqaat-info-header">
                                            <i className="ri-information-line"></i>
                                            <h3 className="miqaat-info-title">Miqaat Details</h3>
                                        </div>
                                        {loadingMiqaatInfo ? (
                                            <div className="miqaat-info-loading">
                                                <div className="miqaat-info-loading-spinner"></div>
                                                <div>Loading miqaat details...</div>
                                            </div>
                                        ) : (
                                            <div className="miqaat-info-grid">
                                                <div className="miqaat-info-item">
                                                    <div className="miqaat-info-label">Jamiaat</div>
                                                    <div className="miqaat-info-value">
                                                        <i className="ri-team-line"></i>
                                                        {miqaatInfo.jamiaat_name || 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="miqaat-info-item">
                                                    <div className="miqaat-info-label">Venue</div>
                                                    <div className="miqaat-info-value">
                                                        <i className="ri-map-pin-line"></i>
                                                        {miqaatInfo.venue_name || 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="miqaat-info-item">
                                                    <div className="miqaat-info-label">Start Date & Time</div>
                                                    <div className="miqaat-info-value">
                                                        <i className="ri-calendar-event-line"></i>
                                                        {formatDateTime(miqaatInfo.start_date)}
                                                    </div>
                                                </div>
                                                {/* <div className="miqaat-info-item">
                                                    <div className="miqaat-info-label">Reporting Time</div>
                                                    <div className="miqaat-info-value">
                                                        <i className="ri-time-line"></i>
                                                        {miqaatInfo.reporting_time ?
                                                            new Date(`2000-01-01T${miqaatInfo.reporting_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                                                            : 'N/A'}
                                                    </div>
                                                </div> */}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Form Sections */}
                                {showFormSections && (
                                    <>
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <label className="form-label">Location <span className="text-danger">*</span></label>
                                                <Select
                                                    options={locationOptions}
                                                    value={formData.location}
                                                    onChange={handleLocationChange}
                                                    placeholder={loadingLocations ? "Loading..." : "Select Location"}
                                                    isClearable
                                                    styles={selectStyles}
                                                    error={errors.location}
                                                    isDisabled={loading || !formData.miqaat}
                                                    isLoading={loadingLocations}
                                                    noOptionsMessage={() => "No locations found"}
                                                />
                                                {errors.location && <span className="error-text">{errors.location}</span>}
                                            </Col>

                                            <Col md={6}>
                                                <label className="form-label">Jamiaat</label>
                                                <Select
                                                    options={jamiaatOptions}
                                                    value={formData.jamiaat}
                                                    onChange={handleJamiaatChange}
                                                    placeholder={loadingJamiaat ? "Loading..." : "Select Jamiaat"}
                                                    isClearable
                                                    styles={selectStyles}
                                                    error={errors.jamiaat}
                                                    isDisabled={loading}
                                                    isLoading={loadingJamiaat}
                                                />
                                                {errors.jamiaat && <span className="error-text">{errors.jamiaat}</span>}
                                            </Col>
                                        </Row>

                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <label className="form-label">Team <span className="text-danger">*</span></label>
                                                <Select
                                                    options={teamOptions}
                                                    value={formData.team}
                                                    onChange={handleTeamChange}
                                                    placeholder={loadingTeams ? "Loading..." : "Select Team"}
                                                    isClearable
                                                    styles={selectStyles}
                                                    error={errors.team}
                                                    isDisabled={loading || loadingTeams || !formData.miqaat}
                                                    isLoading={loadingTeams}
                                                    noOptionsMessage={() => "No teams found"}
                                                />
                                                {errors.team && <span className="error-text">{errors.team}</span>}
                                            </Col>

                                            <Col md={6}>
                                                <label className="form-label">Member <span className="text-danger">*</span></label>
                                                <Select
                                                    options={memberOptions}
                                                    value={formData.member}
                                                    onChange={handleMemberChange}
                                                    placeholder={loadingMembers ? "Loading..." : "Select Member"}
                                                    isClearable
                                                    styles={selectStyles}
                                                    error={errors.member}
                                                    isDisabled={loading || !formData.team}
                                                    isLoading={loadingMembers}
                                                    noOptionsMessage={() => "No members found"}
                                                />
                                                {errors.member && <span className="error-text">{errors.member}</span>}
                                            </Col>
                                        </Row>

                                        {/* Reporting Time Row */}
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <label className="form-label">Reporting Time</label>
                                                <div className="time-input">
                                                    <TimeSplitInput
                                                        value={formData.reportingTime}
                                                        onChange={handleReportingTimeChange}
                                                        disabled={loading || isReportingTimeDisabled}
                                                        error={errors.reportingTime}
                                                    />
                                                    {errors.reportingTime && <div className="error-text">{errors.reportingTime}</div>}
                                                    {isReportingTimeDisabled && !isEditMode && (
                                                        <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <i className="ri-lock-line"></i>
                                                            <span>This location has a fixed reporting time</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>

                                        <div className="button-row">
                                            {isEditMode ? (
                                                <>
                                                    <button className="save-button update-mode" onClick={handleSave} disabled={loading}>
                                                        {loading ? (<><span className="spinner"></span>Updating...</>) : (<><i className="ri-save-line"></i>Update</>)}
                                                    </button>
                                                    <button className="cancel-edit-button" onClick={handleCancel} disabled={loading}>
                                                        <i className="ri-close-line"></i>Cancel
                                                    </button>
                                                    {showBackButton && (
                                                        <button className="back-button" onClick={handleBackToMiqaat} disabled={loading}>
                                                            <i className="ri-arrow-left-line"></i>Back to Miqaat
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <button className="save-button" onClick={handleSave} disabled={loading || !permissions.canAdd}>
                                                        {loading ? (<><span className="spinner"></span>Saving...</>) : (<><i className="ri-save-line"></i>Save Incharge</>)}
                                                    </button>
                                                    {formData.miqaat && (
                                                        <button
                                                            className="save-button"
                                                            onClick={() => navigate(`${import.meta.env.BASE_URL}backoffice/duties`, {
                                                                state: {
                                                                    fromMiqaatCreation: true,
                                                                    miqaatId: formData.miqaat.value,
                                                                    miqaatName: formData.miqaat.label,
                                                                    venueId: miqaatInfo?.venue_id || null
                                                                }
                                                            })}
                                                            disabled={loading}
                                                            style={{ background: '#4cc244ff' }}
                                                        >
                                                            <i className="ri-file-list-3-line"></i>Go to Duties
                                                        </button>
                                                    )}
                                                    <button className="clear-button" onClick={handleClear} disabled={loading}>
                                                        <i className="ri-refresh-line me-2"></i>Clear Form
                                                    </button>

                                                    {showBackButton && (
                                                        <button className="back-button" onClick={handleBackToMiqaat} disabled={loading}>
                                                            <i className="ri-arrow-left-line"></i>Back to Miqaat
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Data Grid */}
                                {showInchargesTable && (
                                    <div className="duties-table-container">
                                        <div className="table-title"><i className="ri-table-line"></i>Incharges List</div>
                                        {loadingGrid ? (
                                            <div className="loading-duties">
                                                <div className="loading-spinner"></div>
                                                <div>Loading incharges...</div>
                                            </div>
                                        ) : incharges.length > 0 ? (
                                            <div className="duties-table-wrapper">
                                                <table className="duties-table">
                                                    <thead>
                                                        <tr>
                                                            <th>SR NO</th>
                                                            <th>ITS ID</th>
                                                            <th>NAME</th>
                                                            <th>VENUE</th>
                                                            <th>LOCATION</th>
                                                            <th>REPORTING TIME</th>
                                                            <th>TEAM</th>
                                                            <th>ACTIONS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {incharges.map((incharge, index) => (
                                                            <tr key={incharge.guard_duty_id}>
                                                                <td>{index + 1}</td>
                                                                <td>{incharge.its_id}</td>
                                                                <td>{incharge.full_name}</td>
                                                                <td>{incharge.venue_name}</td>
                                                                <td>{incharge.location_name || 'N/A'}</td>
                                                                <td>
                                                                    {incharge.reporting_time && !isDefaultTime(incharge.reporting_time)
                                                                        ? convertTo12Hour(incharge.reporting_time)
                                                                        : ''}
                                                                </td>
                                                                <td>{incharge.team_name}</td>
                                                                <td>
                                                                    <div className="action-buttons">
                                                                        {permissions.canEdit && (
                                                                            <button className="icon-button edit-icon-button" onClick={() => handleEdit(incharge)} title="Edit">
                                                                                <i className="ri-edit-line"></i>
                                                                            </button>
                                                                        )}
                                                                        {permissions.canDelete && (
                                                                            <button className="icon-button delete-icon-button" onClick={() => handleDelete(incharge.guard_duty_id)} title="Delete">
                                                                                <i className="ri-delete-bin-line"></i>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="no-duties-message">
                                                <div className="no-duties-icon">📋</div>
                                                <div>No incharges found for this miqaat.</div>
                                            </div>
                                        )}
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

export default MiqaatIncharge;