import React, { useState, useEffect, Fragment } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkModuleAccess } from '../../utils/accessControl';
import '../../styles/shared-styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MODULE_ID = '108';

const MiqaatTeamForm = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [checkingPermissions, setCheckingPermissions] = useState(true);
    const [permissions, setPermissions] = useState({ canAdd: false, canEdit: false, canDelete: false, hasAccess: false });

    // Form data
    const [formData, setFormData] = useState({
        miqaat: null,
        jamiaat: null,
        team: [], // Array for multi-select (add mode) or single object (edit mode)
        location: null,
        quota: ''
    });

    // Edit mode states
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingDutyId, setEditingDutyId] = useState(null);
    const [originalQuota, setOriginalQuota] = useState(0);

    // Pending duties (not yet saved to DB)
    const [pendingDuties, setPendingDuties] = useState([]);
    const [tempIdCounter, setTempIdCounter] = useState(1);

    // Saved duties (from DB)
    const [savedDuties, setSavedDuties] = useState([]);

    // Dropdown options
    const [miqaatOptions, setMiqaatOptions] = useState([]);
    const [jamiaatOptions, setJamiaatOptions] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [loadingMiqaat, setLoadingMiqaat] = useState(false);
    const [loadingJamiaat, setLoadingJamiaat] = useState(false);
    const [loadingTeam, setLoadingTeam] = useState(false);
    const [loadingSavedDuties, setLoadingSavedDuties] = useState(false);
    const [loadingRemainingQuota, setLoadingRemainingQuota] = useState(false);
    const [loadingTeamCount, setLoadingTeamCount] = useState(false);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [loadingMiqaatInfo, setLoadingMiqaatInfo] = useState(false);

    const [errors, setErrors] = useState({});
    const [showDutiesTable, setShowDutiesTable] = useState(false);
    const [remainingQuota, setRemainingQuota] = useState(null);
    const [totalQuota, setTotalQuota] = useState(null);
    const [teamCount, setTeamCount] = useState(null);
    const [showFormSections, setShowFormSections] = useState(false);

    // Navigation and miqaat info states
    const [incomingMiqaat, setIncomingMiqaat] = useState(null);
    const [showInfoBanner, setShowInfoBanner] = useState(false);
    const [miqaatInfo, setMiqaatInfo] = useState(null);
    const [showBackButton, setShowBackButton] = useState(false);
    const [isMiqaatLocked, setIsMiqaatLocked] = useState(false); // Lock miqaat dropdown when coming from MiqaatIncharge

    // Store team counts for pending duties validation
    const [teamCountsCache, setTeamCountsCache] = useState({});

    // Store location reporting time
    const [locationReportingTime, setLocationReportingTime] = useState(null);

    // Navigation detection
    useEffect(() => {
        if (location.state?.fromMiqaatCreation && location.state?.miqaatId) {
            setIncomingMiqaat({
                miqaatId: location.state.miqaatId,
                miqaatName: location.state.miqaatName,
                venueId: location.state.venueId
            });
            setShowInfoBanner(true);
            setShowBackButton(true);
            setIsMiqaatLocked(true); // Lock miqaat dropdown when coming from MiqaatIncharge
        }
    }, [location.state]);

    // Preselect miqaat when options load
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

    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = () => {
        setCheckingPermissions(true);
        const isAdminValue = sessionStorage.getItem('is_admin');
        if (isAdminValue === 'true' || isAdminValue === true || isAdminValue === '1') {
            setPermissions({ canAdd: true, canEdit: true, canDelete: true, hasAccess: true });
            setCheckingPermissions(false);
            return;
        }
        const accessRights = sessionStorage.getItem('access_rights');
        if (!accessRights) {
            Swal.fire({ icon: 'error', title: 'Session Expired', text: 'Your session has expired. Please log in again.', confirmButtonText: 'OK' }).then(() => { window.location.href = '/login'; });
            return;
        }
        const modulePermissions = checkModuleAccess(accessRights, MODULE_ID);
        if (!modulePermissions.hasAccess) {
            Swal.fire({ icon: 'warning', title: 'Access Denied', text: 'You do not have permission to access this module.', confirmButtonText: 'OK' }).then(() => { window.location.href = '/dashboard'; });
            return;
        }
        setPermissions(modulePermissions);
        setCheckingPermissions(false);
    };

    const getEffectiveRemainingQuota = () => {
        if (remainingQuota === null) return null;

        // Subtract pending duties quota from remaining quota
        const pendingTotal = pendingDuties.reduce((sum, duty) => sum + duty.quota, 0);

        // If in edit mode, add back the original quota
        return isEditMode ? remainingQuota - pendingTotal + originalQuota : remainingQuota - pendingTotal;
    };

    useEffect(() => {
        if (!checkingPermissions && permissions.hasAccess) {
            fetchMiqaatOptions();
        }
    }, [checkingPermissions, permissions]);

    const fetchMiqaatOptions = async () => {
        try {
            setLoadingMiqaat(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { console.error('Access token not found'); return; }
            const response = await fetch(`${API_BASE_URL}/Duty/GetListOfActiveMiqaat`, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const options = result.data.map(item => ({
                        value: item.miqaat_id,
                        label: item.miqaat_name,
                        quantity: item.quantity,
                        venue_id: item.venue_id
                    }));
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
        try {
            setLoadingJamiaat(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { console.error('Access token not found'); return; }
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
        try {
            setLoadingTeam(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { console.error('Access token not found'); return; }

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
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            };

            if (body) {
                fetchOptions.body = body;
            }

            const response = await fetch(url, fetchOptions);

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const options = result.data.map(item => {
                        let label;
                        let count = null;

                        if (jamiaatId) {
                            if (item.count_team !== undefined && item.count_team !== null) {
                                count = item.count_team;
                            } else if (item.team_count !== undefined && item.team_count !== null) {
                                count = item.team_count;
                            } else if (item.member_count !== undefined && item.member_count !== null) {
                                count = item.member_count;
                            }

                            if (count !== null) {
                                label = `${item.team_name} | Members: ${count}`;
                            } else {
                                label = item.team_name;
                            }
                        } else {
                            label = item.team_name;
                        }

                        return {
                            value: item.team_id,
                            label: label,
                            jamiaat_id: item.jamiaat_id,
                            member_count: count
                        };
                    });
                    setTeamOptions(options);
                } else {
                    setTeamOptions([]);
                }
            }
        } catch (error) {
            console.error('Error fetching team options:', error);
            setTeamOptions([]);
        } finally {
            setLoadingTeam(false);
        }
    };

    const fetchLocationsByVenue = async (venueId, miqaatId) => {
        try {
            setLoadingLocations(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { console.error('Access token not found'); return; }
            const response = await fetch(`${API_BASE_URL}/Duty/GetLocationsWithIncharges`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify({ venue_id: venueId, miqaat_id: miqaatId })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const options = result.data.map(item => ({ value: item.location_id, label: item.location_name, reporting_time: item.reporting_time }));
                    setLocationOptions(options);
                } else {
                    setLocationOptions([]);
                }
            }
        } catch (error) {
            console.error('Error fetching location options:', error);
            setLocationOptions([]);
        } finally {
            setLoadingLocations(false);
        }
    };

    const fetchTeamCount = async (teamId) => {
        try {
            setLoadingTeamCount(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { console.error('Access token not found'); return; }
            const response = await fetch(`${API_BASE_URL}/Duty/GetTeamCountByTeam`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify({ team_id: teamId })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const count = result.data.team_count;
                    setTeamCount(count);

                    // Cache the team count
                    setTeamCountsCache(prev => ({
                        ...prev,
                        [teamId]: count
                    }));

                    return count;
                } else {
                    setTeamCount(null);
                    return null;
                }
            }
        } catch (error) {
            console.error('Error fetching team count:', error);
            setTeamCount(null);
            return null;
        } finally {
            setLoadingTeamCount(false);
        }
    };

    const fetchRemainingQuota = async (miqaatId) => {
        try {
            setLoadingRemainingQuota(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { console.error('Access token not found'); return; }
            const response = await fetch(`${API_BASE_URL}/Duty/GetRemainingQuotaByMiqaat`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify({ miqaat_id: miqaatId })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setRemainingQuota(result.data.remaining_quota);
                } else {
                    setRemainingQuota(null);
                }
            }
        } catch (error) {
            console.error('Error fetching remaining quota:', error);
            setRemainingQuota(null);
        } finally {
            setLoadingRemainingQuota(false);
        }
    };

    const fetchSavedDutiesByMiqaat = async (miqaatId) => {
        try {
            setLoadingSavedDuties(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { console.error('Access token not found'); return; }
            const response = await fetch(`${API_BASE_URL}/Duty/GetDutiesByMiqaat`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify({ miqaat_id: miqaatId })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setSavedDuties(result.data);
                    setShowDutiesTable(true);
                } else {
                    setSavedDuties([]);
                    setShowDutiesTable(true);
                }
            }
        } catch (error) {
            console.error('Error fetching duties:', error);
            setSavedDuties([]);
            setShowDutiesTable(false);
        } finally {
            setLoadingSavedDuties(false);
        }
    };

    const fetchMiqaatInfo = async (miqaatId) => {
        try {
            setLoadingMiqaatInfo(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { console.error('Access token not found'); return; }

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

    const handleMiqaatChange = (selectedOption) => {
        if (showInfoBanner && formData.miqaat !== null) {
            setShowInfoBanner(false);
        }

        setFormData(prev => ({ ...prev, miqaat: selectedOption }));
        if (errors.miqaat) { setErrors(prev => ({ ...prev, miqaat: '' })); }

        // Clear pending duties when changing miqaat
        setPendingDuties([]);
        setTeamCountsCache({});
        setLocationReportingTime(null); // Clear location reporting time when miqaat changes

        if (selectedOption?.value) {
            setTotalQuota(selectedOption.quantity || null);
            setShowFormSections(true);
            if (selectedOption.venue_id) { fetchLocationsByVenue(selectedOption.venue_id, selectedOption.value); }

            fetchJamiaatOptions();
            fetchTeamOptions(null);
            fetchSavedDutiesByMiqaat(selectedOption.value);
            fetchRemainingQuota(selectedOption.value);
            fetchMiqaatInfo(selectedOption.value);
        } else {
            setShowFormSections(false);
            setSavedDuties([]);
            setShowDutiesTable(false);
            setRemainingQuota(null);
            setTotalQuota(null);
            setJamiaatOptions([]);
            setTeamOptions([]);
            setLocationOptions([]);
            setTeamCount(null);
            setMiqaatInfo(null);
        }
    };

    const handleJamiaatChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, jamiaat: selectedOption, team: isEditMode ? prev.team : [] }));
        if (errors.jamiaat) { setErrors(prev => ({ ...prev, jamiaat: '' })); }
        setTeamCount(null);

        if (selectedOption?.value) {
            fetchTeamOptions(selectedOption.value);
        } else {
            fetchTeamOptions(null);
        }
    };

    const handleTeamChange = (selectedOptions) => {
        if (isEditMode) {
            // In edit mode, only single selection
            setFormData(prev => ({ ...prev, team: selectedOptions }));
            if (selectedOptions?.value) {
                fetchTeamCount(selectedOptions.value);
            } else {
                setTeamCount(null);
            }
        } else {
            // In add mode, multi-selection
            setFormData(prev => ({ ...prev, team: selectedOptions || [] }));
        }

        if (errors.team) { setErrors(prev => ({ ...prev, team: '' })); }
    };

    const handleLocationChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, location: selectedOption }));
        if (errors.location) { setErrors(prev => ({ ...prev, location: '' })); }

        // Check if location has a valid reporting time (not null and not 00:00:00)
        if (selectedOption?.reporting_time && selectedOption.reporting_time !== '00:00:00') {
            setLocationReportingTime(selectedOption.reporting_time);
        } else {
            setLocationReportingTime(null);
        }
    };

    const handleQuotaChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, quota: value }));
        if (errors.quota) { setErrors(prev => ({ ...prev, quota: '' })); }

        // Validate in real-time
        const effectiveRemaining = getEffectiveRemainingQuota();
        if (value && effectiveRemaining !== null && parseInt(value) > effectiveRemaining) {
            setErrors(prev => ({ ...prev, quota: `Quota cannot exceed available capacity of ${effectiveRemaining}` }));
        } else if (value && teamCount !== null && parseInt(value) > teamCount) {
            setErrors(prev => ({ ...prev, quota: `Quota cannot exceed team member count of ${teamCount}` }));
        }
    };

    const validateAddTeamsForm = () => {
        const newErrors = {};

        if (!formData.miqaat) {
            newErrors.miqaat = 'Please select a Miqaat';
        }

        if (!formData.team || formData.team.length === 0) {
            newErrors.team = 'Please select at least one Team';
        }

        if (!formData.location) {
            newErrors.location = 'Please select a Location';
        }

        if (!formData.quota) {
            newErrors.quota = 'Please enter quota';
        } else if (formData.quota <= 0) {
            newErrors.quota = 'Quota must be greater than 0';
        } else {
            const effectiveRemaining = getEffectiveRemainingQuota();
            const totalNewQuota = formData.team.length * parseInt(formData.quota);

            if (effectiveRemaining !== null && totalNewQuota > effectiveRemaining) {
                newErrors.quota = `Total quota (${totalNewQuota}) exceeds available capacity of ${effectiveRemaining}`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateEditForm = () => {
        const newErrors = {};

        if (!formData.miqaat) {
            newErrors.miqaat = 'Please select a Miqaat';
        }

        if (!formData.team) {
            newErrors.team = 'Please select a Team';
        }

        if (!formData.location) {
            newErrors.location = 'Please select a Location';
        }

        if (!formData.quota) {
            newErrors.quota = 'Please enter quota';
        } else if (formData.quota <= 0) {
            newErrors.quota = 'Quota must be greater than 0';
        } else {
            const effectiveRemaining = getEffectiveRemainingQuota();

            if (effectiveRemaining !== null && parseInt(formData.quota) > effectiveRemaining) {
                newErrors.quota = `Quota cannot exceed available capacity of ${effectiveRemaining}`;
            } else if (teamCount !== null && parseInt(formData.quota) > teamCount) {
                newErrors.quota = `Quota cannot exceed team member count of ${teamCount}`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddTeamsToList = async () => {
        if (!validateAddTeamsForm()) {
            return;
        }

        // Check for duplicate teams
        const duplicateTeams = formData.team.filter(team =>
            pendingDuties.some(duty => duty.team_id === team.value) ||
            savedDuties.some(duty => duty.team_id === team.value)
        );

        if (duplicateTeams.length > 0) {
            const duplicateNames = duplicateTeams.map(t => t.label).join(', ');
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Teams',
                text: `The following teams already have duties assigned: ${duplicateNames}`,
                confirmButtonText: 'OK'
            });
            return;
        }

        // Fetch team counts for all selected teams
        const teamsWithCounts = [];
        for (const team of formData.team) {
            let memberCount = teamCountsCache[team.value];

            if (!memberCount) {
                memberCount = await fetchTeamCount(team.value);
            }

            teamsWithCounts.push({
                ...team,
                member_count: memberCount
            });
        }

        // Validate quota against team member counts
        const invalidTeams = teamsWithCounts.filter(team =>
            team.member_count !== null && parseInt(formData.quota) > team.member_count
        );

        if (invalidTeams.length > 0) {
            const invalidList = invalidTeams.map(team =>
                `${team.label} (Members: ${team.member_count}, Quota: ${formData.quota})`
            ).join('<br/>');

            Swal.fire({
                icon: 'error',
                title: 'Invalid Quota',
                html: `<div style="text-align: left;">Quota exceeds team member count for:<br/><br/>${invalidList}</div>`,
                confirmButtonText: 'OK'
            });
            return;
        }

        // Create pending duty entries
        const newPendingDuties = teamsWithCounts.map((team, index) => ({
            tempId: tempIdCounter + index,
            team_id: team.value,
            team_name: team.label,
            jamiaat_id: formData.jamiaat?.value || null,
            jamiaat_name: formData.jamiaat?.label || 'N/A',
            location_id: formData.location.value,
            location_name: formData.location.label,
            quota: parseInt(formData.quota),
            member_count: team.member_count,
            venue_id: formData.miqaat?.venue_id,
            miqaat_id: formData.miqaat.value
        }));

        setPendingDuties(prev => [...prev, ...newPendingDuties]);
        setTempIdCounter(prev => prev + newPendingDuties.length);

        // Clear form fields except miqaat
        setFormData(prev => ({
            ...prev,
            team: [],
            location: null,
            quota: ''
        }));
        setErrors({});
        setTeamCount(null);

        Swal.fire({
            icon: 'success',
            title: 'Teams Added',
            text: `${newPendingDuties.length} team(s) added to pending list`,
            timer: 1500,
            showConfirmButton: false
        });
    };

    const handleEditPendingQuota = (tempId, newQuota) => {
        const quota = parseInt(newQuota);

        if (isNaN(quota) || quota <= 0) {
            return;
        }

        // Find the duty to get its member count
        const duty = pendingDuties.find(d => d.tempId === tempId);
        if (duty && duty.member_count !== null && quota > duty.member_count) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Quota',
                text: `Quota (${quota}) cannot exceed team member count (${duty.member_count})`,
                confirmButtonText: 'OK'
            });
            return;
        }

        // Update only the specific duty with this tempId
        setPendingDuties(prev => prev.map(d =>
            d.tempId === tempId ? { ...d, quota } : d
        ));
    };

    const handleDeletePending = (tempId) => {
        Swal.fire({
            title: 'Remove Team?',
            text: "Remove this team from the pending list?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, remove it',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                setPendingDuties(prev => prev.filter(duty => duty.tempId !== tempId));
            }
        });
    };

    const handleSaveAllDuties = async () => {
        if (isEditMode) {
            // Handle single duty update
            return handleUpdateDuty();
        }

        // Handle bulk insert
        if (!permissions.canAdd) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to add duties.',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (pendingDuties.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No Pending Duties',
                text: 'Please add teams to the list before saving',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Final validation before saving
        const effectiveRemaining = getEffectiveRemainingQuota();
        const totalPendingQuota = pendingDuties.reduce((sum, duty) => sum + duty.quota, 0);

        if (effectiveRemaining !== null && totalPendingQuota > effectiveRemaining) {
            Swal.fire({
                icon: 'error',
                title: 'Insufficient Quota',
                text: `Total pending quota (${totalPendingQuota}) exceeds available capacity (${effectiveRemaining})`,
                confirmButtonText: 'OK'
            });
            return;
        }

        setLoading(true);

        try {
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            let successCount = 0;
            let failCount = 0;
            const errors = [];

            for (const duty of pendingDuties) {
                try {
                    const requestBody = {
                        team_id: duty.team_id,
                        miqaat_id: duty.miqaat_id,
                        quota: duty.quota,
                        location_id: duty.location_id
                    };

                    const response = await fetch(`${API_BASE_URL}/Duty/InsertDuty`, {
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
                        const resultCode = Number(result.data?.result_code);
                        if (resultCode === 1) {
                            successCount++;
                        } else if (resultCode === 4) {
                            errors.push(`${duty.team_name}: Duplicate duty`);
                            failCount++;
                        } else {
                            errors.push(`${duty.team_name}: Failed to save`);
                            failCount++;
                        }
                    } else {
                        errors.push(`${duty.team_name}: ${result.message || 'Server error'}`);
                        failCount++;
                    }
                } catch (error) {
                    console.error(`Error saving duty for team ${duty.team_name}:`, error);
                    errors.push(`${duty.team_name}: ${error.message}`);
                    failCount++;
                }
            }

            // Show summary
            if (successCount > 0 && failCount === 0) {
                Swal.fire({
                    title: 'Success!',
                    text: `All ${successCount} duties saved successfully!`,
                    icon: 'success',
                    timer: 2000,
                    timerProgressBar: false,
                    showConfirmButton: false,
                    allowOutsideClick: false
                });

                // Clear pending duties and refresh
                setPendingDuties([]);
                if (formData.miqaat?.value) {
                    await fetchSavedDutiesByMiqaat(formData.miqaat.value);
                    await fetchRemainingQuota(formData.miqaat.value);
                }
            } else if (successCount > 0 && failCount > 0) {
                Swal.fire({
                    title: 'Partial Success',
                    html: `
                        <p>Saved: ${successCount}</p>
                        <p>Failed: ${failCount}</p>
                        <hr/>
                        <p style="text-align: left; max-height: 200px; overflow-y: auto;">
                            ${errors.join('<br/>')}
                        </p>
                    `,
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });

                // Remove successful duties from pending
                setPendingDuties(prev => prev.filter((duty, index) => {
                    return index >= successCount;
                }));

                if (formData.miqaat?.value) {
                    await fetchSavedDutiesByMiqaat(formData.miqaat.value);
                    await fetchRemainingQuota(formData.miqaat.value);
                }
            } else {
                Swal.fire({
                    title: 'Failed',
                    html: `
                        <p>All duties failed to save</p>
                        <hr/>
                        <p style="text-align: left; max-height: 200px; overflow-y: auto;">
                            ${errors.join('<br/>')}
                        </p>
                    `,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }

        } catch (error) {
            console.error('Error saving duties:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while saving duties',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDuty = async () => {
        if (!permissions.canEdit) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to edit duties.',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!validateEditForm()) {
            return;
        }

        setLoading(true);

        try {
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const requestBody = {
                duty_id: editingDutyId,
                team_id: formData.team.value,
                miqaat_id: formData.miqaat.value,
                quota: parseInt(formData.quota),
                location_id: formData.location.value
            };

            const response = await fetch(`${API_BASE_URL}/Duty/UpdateDuty`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const resultCode = Number(result.data?.result_code);
                if (resultCode === 2) {
                    Swal.fire({
                        title: 'Success!',
                        text: result.message || 'Duty updated successfully!',
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: false,
                        showConfirmButton: false,
                        allowOutsideClick: false
                    });

                    if (formData.miqaat?.value) {
                        await fetchSavedDutiesByMiqaat(formData.miqaat.value);
                        await fetchRemainingQuota(formData.miqaat.value);
                    }

                    setTimeout(() => {
                        handleCancelEdit();
                    }, 2000);
                } else if (resultCode === 4) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Duplicate Duty',
                        text: 'This duty assignment already exists (same team, miqaat, and location)',
                        confirmButtonText: 'OK'
                    });
                } else if (resultCode === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed',
                        text: result.message || 'Failed to update duty',
                        confirmButtonText: 'OK'
                    });
                }
            } else {
                throw new Error(result.message || `Server error: ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating duty:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while updating',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditSavedDuty = async (duty) => {
        if (!permissions.canEdit) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to edit duties.',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            if (!showFormSections) {
                setShowFormSections(true);
            }

            // Load jamiaat options if not already loaded
            if (jamiaatOptions.length === 0) {
                await fetchJamiaatOptions();
            }

            // Load teams for the duty's jamiaat
            await fetchTeamOptions(duty.jamiaat_id);

            // Fetch team count
            await fetchTeamCount(duty.team_id);

            // Load locations for the venue
            if (duty.venue_id) {
                await fetchLocationsByVenue(duty.venue_id, duty.miqaat_id);
            }

            // Populate form with duty data
            setFormData({
                miqaat: {
                    value: duty.miqaat_id,
                    label: duty.miqaat_name,
                    quantity: totalQuota,
                    venue_id: duty.venue_id
                },
                jamiaat: {
                    value: duty.jamiaat_id,
                    label: duty.jamiaat_name
                },
                team: {
                    value: duty.team_id,
                    label: duty.team_name
                },
                location: {
                    value: duty.location_id,
                    label: duty.location_name
                },
                quota: duty.quota.toString()
            });

            setIsEditMode(true);
            setEditingDutyId(duty.duty_id);
            setOriginalQuota(duty.quota);
            setShowInfoBanner(false);

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Error loading duty for edit:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load duty details',
                confirmButtonText: 'OK'
            });
        }
    };

    // Navigate back to MiqaatIncharge page with miqaat pre-selected
    const handleBackToMiqaat = () => {
        navigate(`${import.meta.env.BASE_URL}backoffice/locationincharge`, {
            state: {
                fromDuties: true,
                miqaatId: formData.miqaat?.value,
                miqaatName: formData.miqaat?.label,
                venueId: formData.miqaat?.venue_id
            }
        });
    };

    const handleDeleteSavedDuty = async (dutyId) => {
        if (!permissions.canDelete) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to delete duties.',
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

        if (!result.isConfirmed) {
            return;
        }

        setLoading(true);

        try {
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const response = await fetch(`${API_BASE_URL}/Duty/DeleteDuty`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ duty_id: dutyId })
            });

            const apiResult = await response.json();

            if (response.ok && apiResult.success) {
                const resultCode = Number(apiResult.data?.result_code);
                if (resultCode === 3) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: apiResult.message || 'Duty has been deleted successfully.',
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: false,
                        showConfirmButton: false
                    });

                    if (formData.miqaat?.value) {
                        await fetchSavedDutiesByMiqaat(formData.miqaat.value);
                        await fetchRemainingQuota(formData.miqaat.value);
                    }
                } else {
                    throw new Error(apiResult.message || 'Failed to delete duty');
                }
            } else {
                throw new Error(apiResult.message || `Server error: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting duty:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while deleting',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setFormData(prev => ({
            ...prev,
            jamiaat: null,
            team: [],
            location: null,
            quota: ''
        }));
        setErrors({});
        setIsEditMode(false);
        setEditingDutyId(null);
        setOriginalQuota(0);
        setTeamCount(null);
    };

    const handleClear = () => {
        setFormData({ miqaat: null, jamiaat: null, team: [], location: null, quota: '' });
        setErrors({});
        setPendingDuties([]);
        setTeamOptions([]);
        setLocationOptions([]);
        setSavedDuties([]);
        setShowDutiesTable(false);
        setIsEditMode(false);
        setEditingDutyId(null);
        setRemainingQuota(null);
        setTotalQuota(null);
        setOriginalQuota(0);
        setShowFormSections(false);
        setJamiaatOptions([]);
        setTeamCount(null);
        setShowInfoBanner(false);
        setMiqaatInfo(null);
        setTempIdCounter(1);
        setTeamCountsCache({});
        setLocationReportingTime(null);
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
        multiValue: (base) => ({ ...base, backgroundColor: '#e7f3ff', borderRadius: '4px' }),
        multiValueLabel: (base) => ({ ...base, color: '#0d6efd', fontSize: '14px' }),
        multiValueRemove: (base) => ({ ...base, color: '#0d6efd', ':hover': { backgroundColor: '#0d6efd', color: 'white' } }),
        dropdownIndicator: (base) => ({ ...base, color: '#0d6efd', '&:hover': { color: '#0b5ed7' } }),
        menu: (base) => ({ ...base, zIndex: 1000 })
    };

    const displayRemainingQuota = getEffectiveRemainingQuota();

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

    if (checkingPermissions) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', gap: '20px' }}>
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}><span className="visually-hidden">Loading...</span></div>
                <p style={{ fontSize: '16px', color: '#666' }}>Checking access permissions...</p>
            </div>
        );
    }

    if (!permissions.hasAccess) { return null; }

    return (
        <Fragment>
            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>
                                <style>{`
                                    .info-banner {
                                        background: linear-gradient(135deg, #d4edff 0%, #e8f5ff 100%);
                                        border: 2px solid #0d6efd;
                                        border-radius: 8px;
                                        padding: 15px 20px;
                                        margin-bottom: 25px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: space-between;
                                        box-shadow: 0 2px 8px rgba(13, 110, 253, 0.1);
                                    }
                                    
                                    .info-banner-content {
                                        display: flex;
                                        align-items: center;
                                        gap: 12px;
                                        flex: 1;
                                    }
                                    
                                    .info-banner-icon {
                                        font-size: 24px;
                                        color: #0d6efd;
                                    }
                                    
                                    .info-banner-text {
                                        font-size: 15px;
                                        color: #084298;
                                        font-weight: 500;
                                    }
                                    
                                    .info-banner-text strong {
                                        font-weight: 700;
                                        color: #052c65;
                                    }
                                    
                                    .info-banner-close {
                                        background: none;
                                        border: none;
                                        font-size: 20px;
                                        color: #084298;
                                        cursor: pointer;
                                        padding: 5px 10px;
                                        transition: all 0.2s;
                                        border-radius: 4px;
                                    }
                                    
                                    .info-banner-close:hover {
                                        background: rgba(13, 110, 253, 0.1);
                                        color: #052c65;
                                    }

                                    .edit-mode-badge {
                                        background: #ffc107;
                                        color: #000;
                                        padding: 6px 15px;
                                        border-radius: 20px;
                                        font-size: 14px;
                                        font-weight: 500;
                                    }

                                    .miqaat-info-card {
                                        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                                        border: 2px solid #dee2e6;
                                        border-radius: 12px;
                                        padding: 20px;
                                        margin-bottom: 25px;
                                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                                    }

                                    .miqaat-info-header {
                                        display: flex;
                                        align-items: center;
                                        gap: 10px;
                                        margin-bottom: 15px;
                                        padding-bottom: 12px;
                                        border-bottom: 2px solid #dee2e6;
                                    }

                                    .miqaat-info-header i {
                                        font-size: 22px;
                                        color: #0d6efd;
                                    }

                                    .miqaat-info-title {
                                        font-size: 17px;
                                        font-weight: 700;
                                        color: #212529;
                                        margin: 0;
                                    }

                                    .miqaat-info-grid {
                                        display: grid;
                                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                                        gap: 15px;
                                    }

                                    .miqaat-info-item {
                                        display: flex;
                                        flex-direction: column;
                                        gap: 4px;
                                    }

                                    .miqaat-info-label {
                                        font-size: 12px;
                                        font-weight: 600;
                                        color: #6c757d;
                                        text-transform: uppercase;
                                        letter-spacing: 0.5px;
                                    }

                                    .miqaat-info-value {
                                        font-size: 15px;
                                        font-weight: 500;
                                        color: #212529;
                                        display: flex;
                                        align-items: center;
                                        gap: 6px;
                                    }

                                    .miqaat-info-value i {
                                        font-size: 16px;
                                        color: #0d6efd;
                                    }

                                    .miqaat-info-loading {
                                        text-align: center;
                                        padding: 30px;
                                        color: #6c757d;
                                    }

                                    .miqaat-info-loading-spinner {
                                        width: 30px;
                                        height: 30px;
                                        border: 3px solid rgba(13, 110, 253, 0.1);
                                        border-top-color: #0d6efd;
                                        border-radius: 50%;
                                        animation: spin 0.8s linear infinite;
                                        margin: 0 auto 10px;
                                    }

                                    @keyframes spin {
                                        to { transform: rotate(360deg); }
                                    }

                                    .back-button{padding:0 20px;background:#6c757d;border:none;border-radius:8px;color:#fff;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;height:38px;display:inline-flex;align-items:center;gap:8px;justify-content:center}.back-button:hover:not(:disabled){background:#5c636a;transform:translateY(-1px);box-shadow:0 4px 8px rgba(108,117,125,.3)}.back-button:disabled{opacity:.6;cursor:not-allowed}

                                    .quota-container{width:100%}.quota-display{height:38px;padding:0 15px;border:2px solid #dee2e6;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;background:#f8f9fa}.quota-loading{display:flex;align-items:center;gap:8px;color:#0d6efd}.quota-value{font-weight:600;font-size:16px;color:#495057;display:flex;align-items:center}.quota-placeholder{color:#6c757d;font-style:italic}.form-label{font-weight:500;font-size:14px;color:#495057;margin-bottom:8px;display:block}.form-label .text-danger{color:#dc3545;margin-left:4px}.error-text{color:#dc3545;font-size:13px;margin-top:6px;display:block}.form-input{width:100%;height:38px;padding:0 15px;border:2px solid #dee2e6;border-radius:8px;font-size:15px;transition:all .2s}.form-input:focus{outline:none;border-color:#0d6efd;box-shadow:0 0 0 .2rem rgba(13,110,253,.15)}.form-input.is-invalid{border-color:#dc3545}.button-row{display:flex;gap:15px;margin-top:20px;justify-content:center;align-items:center}.save-button{height:38px;padding:0 35px;background:#0d6efd;border:none;border-radius:8px;color:#fff;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;justify-content:center}.save-button:hover:not(:disabled){background:#0b5ed7;transform:translateY(-1px);box-shadow:0 4px 12px rgba(13,110,253,.3)}.save-button:active:not(:disabled){transform:translateY(0)}.save-button:disabled{opacity:.6;cursor:not-allowed}.save-button.save-all-mode{background:#28a745}.save-button.save-all-mode:hover:not(:disabled){background:#218838}.save-button.update-mode{background:#28a745}.save-button.update-mode:hover:not(:disabled){background:#218838}.cancel-edit-button{height:38px;padding:0 35px;background:#ffc107;border:none;border-radius:8px;color:#000;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;justify-content:center}.cancel-edit-button:hover:not(:disabled){background:#e0a800}.clear-button{padding:0 20px;background:#6c757d;border:none;border-radius:8px;color:#fff;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;height:38px}.clear-button:hover:not(:disabled){background:#5c636a}.clear-button:disabled{opacity:.6;cursor:not-allowed}.team-count-info{margin-top:8px;font-size:13px;color:#6c757d;display:flex;align-items:center;gap:5px}.team-count-info.loading{color:#0d6efd}.spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite}

                                    .pending-duties-section{margin-top:30px;margin-bottom:30px;border:2px solid #ffc107;border-radius:12px;padding:20px;background:linear-gradient(135deg,#fff9e6 0%,#ffffff 100%)}.pending-section-title{font-size:18px;font-weight:600;margin-bottom:15px;color:#333;display:flex;align-items:center;gap:10px;padding-bottom:12px;border-bottom:2px solid #ffc107}.pending-section-title i{color:#ffc107}.pending-table-wrapper{overflow-x:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1)}.pending-table{width:100%;border-collapse:collapse;background:#fff;border:2px solid #dee2e6}.pending-table thead{background:#fff9e6;color:#000;border-bottom:2px solid #ffc107}.pending-table th{padding:12px;text-align:left;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.5px;border-right:1px solid #dee2e6}.pending-table th:last-child{border-right:none}.pending-table tbody tr{border-bottom:1px solid #dee2e6;transition:background-color .2s}.pending-table tbody tr:hover{background-color:#fffbf0}.pending-table tbody tr:last-child{border-bottom:none}.pending-table td{padding:12px;font-size:14px;color:#495057;border-right:1px solid #dee2e6;vertical-align:middle}.pending-table td:last-child{border-right:none}.quota-edit-input{width:80px;padding:6px 10px;border:2px solid #dee2e6;border-radius:6px;font-size:14px;text-align:center}.quota-edit-input:focus{outline:none;border-color:#0d6efd;box-shadow:0 0 0 .2rem rgba(13,110,253,.15)}.no-pending{text-align:center;padding:30px;color:#6c757d;font-style:italic}

                                    .duties-table-container{margin-top:40px;border-top:2px solid #dee2e6;padding-top:30px}.table-title{font-size:18px;font-weight:600;margin-bottom:20px;color:#333;display:flex;align-items:center;gap:10px}.duties-table-wrapper{overflow-x:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1)}.duties-table{width:100%;border-collapse:collapse;background:#fff;border:2px solid #dee2e6}.duties-table thead{background:#fff;color:#000;border-bottom:2px solid #dee2e6}.duties-table th{padding:15px;text-align:left;font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:.5px;border-right:1px solid #dee2e6}.duties-table th:last-child{border-right:none}.duties-table tbody tr{border-bottom:1px solid #dee2e6;transition:background-color .2s}.duties-table tbody tr:hover{background-color:#f8f9fa}.duties-table tbody tr:last-child{border-bottom:none}.duties-table td{padding:15px;font-size:14px;color:#495057;border-right:1px solid #dee2e6}.duties-table td:last-child{border-right:none}.action-buttons{display:flex;gap:10px;align-items:center}.icon-button{width:36px;height:36px;border:none;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .2s;font-size:16px}.edit-icon-button{background:#0d6efd;color:#fff}.edit-icon-button:hover{background:#0b5ed7;transform:translateY(-2px);box-shadow:0 4px 8px rgba(13,110,253,.3)}.delete-icon-button{background:#dc3545;color:#fff}.delete-icon-button:hover{background:#c82333;transform:translateY(-2px);box-shadow:0 4px 8px rgba(220,53,69,.3)}.no-duties-message{text-align:center;padding:40px 20px;color:#6c757d;font-size:15px}.no-duties-icon{font-size:48px;margin-bottom:15px;opacity:.5}.loading-duties{text-align:center;padding:40px 20px;color:#0d6efd}.loading-spinner{width:40px;height:40px;border:4px solid rgba(13,110,253,.1);border-top-color:#0d6efd;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 15px}@media (max-width:768px){.button-row{flex-direction:column;width:100%}.save-button,.cancel-edit-button,.clear-button{width:100%}.duties-table-wrapper,.pending-table-wrapper{overflow-x:scroll}.duties-table th,.duties-table td,.pending-table th,.pending-table td{padding:10px;font-size:13px}}
                                `}</style>

                                <div className="page-header-title">
                                    <div className="header-text"><i className="ri-file-list-3-line"></i><span>Duties Assign</span></div>
                                    {isEditMode && (<span className="edit-mode-badge"><i className="ri-edit-line me-1"></i>Edit Mode</span>)}
                                </div>

                                {/* Info Banner */}
                                {showInfoBanner && formData.miqaat && (
                                    <div className="info-banner">
                                        <div className="info-banner-content">
                                            <i className="ri-information-line info-banner-icon"></i>
                                            <div className="info-banner-text">
                                                Assign duties for <strong>{formData.miqaat.label}</strong>
                                            </div>
                                        </div>
                                        <button
                                            className="info-banner-close"
                                            onClick={() => setShowInfoBanner(false)}
                                            title="Dismiss"
                                        >
                                            <i className="ri-close-line"></i>
                                        </button>
                                    </div>
                                )}

                                {/* Miqaat Selection Row */}
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

                                    {showFormSections && (
                                        <>
                                            <Col md={3}>
                                                <div className="quota-container">
                                                    <label className="form-label">Total Quota</label>
                                                    <div className="quota-display">
                                                        {totalQuota !== null ? (<div className="quota-value">{totalQuota}</div>) : (<div className="quota-placeholder">N/A</div>)}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={3}>
                                                <div className="quota-container">
                                                    <label className="form-label">{isEditMode ? 'Available' : 'Available'}</label>
                                                    <div className="quota-display">
                                                        {loadingRemainingQuota ? (<div className="quota-loading"><span className="spinner"></span></div>) : displayRemainingQuota !== null ? (<div className="quota-value">{displayRemainingQuota}</div>) : (<div className="quota-placeholder">N/A</div>)}
                                                    </div>
                                                </div>
                                            </Col>
                                        </>
                                    )}
                                </Row>

                                {/* Miqaat Information Card */}
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
                                                    isDisabled={loading}
                                                    isLoading={loadingLocations}
                                                    noOptionsMessage={() => "No locations found"}
                                                />
                                                {errors.location && <span className="error-text">{errors.location}</span>}
                                                {locationReportingTime && (
                                                    <div className="location-reporting-time-info" style={{
                                                        marginTop: '8px',
                                                        padding: '8px 12px',
                                                        background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
                                                        border: '1px solid #81c784',
                                                        borderRadius: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontSize: '14px',
                                                        color: '#2e7d32'
                                                    }}>
                                                        <i className="ri-time-line" style={{ fontSize: '16px' }}></i>
                                                        <span><strong>Reporting Time:</strong> {
                                                            new Date(`2000-01-01T${locationReportingTime}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                                                        }</span>
                                                    </div>
                                                )}
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
                                                <label className="form-label">Team{!isEditMode && 's'} <span className="text-danger">*</span></label>
                                                <Select
                                                    options={teamOptions}
                                                    value={formData.team}
                                                    onChange={handleTeamChange}
                                                    placeholder={loadingTeam ? "Loading..." : isEditMode ? "Select Team" : "Select Teams"}
                                                    isClearable
                                                    isMulti={!isEditMode}
                                                    styles={selectStyles}
                                                    error={errors.team}
                                                    isDisabled={loading || loadingTeam}
                                                    isLoading={loadingTeam}
                                                    noOptionsMessage={() => "No teams found"}
                                                />
                                                {errors.team && <span className="error-text">{errors.team}</span>}
                                                {isEditMode && formData.team?.value && (
                                                    <div className={`team-count-info ${loadingTeamCount ? 'loading' : ''}`}>
                                                        {loadingTeamCount ? (
                                                            <><span className="spinner"></span>Loading count...</>
                                                        ) : teamCount !== null ? (
                                                            <><i className="ri-team-line"></i>Team Members: {teamCount}</>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </Col>
                                            <Col md={6}>
                                                <label className="form-label">Quota <span className="text-danger">*</span></label>
                                                <input
                                                    type="number"
                                                    className={`form-input ${errors.quota ? 'is-invalid' : ''}`}
                                                    placeholder="Enter quota"
                                                    value={formData.quota}
                                                    onChange={handleQuotaChange}
                                                    disabled={loading}
                                                    min="1"
                                                    max={Math.min(
                                                        displayRemainingQuota !== null ? displayRemainingQuota : Infinity,
                                                        teamCount !== null ? teamCount : Infinity
                                                    )}
                                                />
                                                {errors.quota && <span className="error-text">{errors.quota}</span>}
                                            </Col>
                                        </Row>

                                        <div className="button-row">
                                            {isEditMode ? (
                                                <>
                                                    <button
                                                        className="save-button update-mode"
                                                        onClick={handleSaveAllDuties}
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <><span className="spinner"></span>Updating...</>
                                                        ) : (
                                                            <><i className="ri-save-line"></i>Save</>
                                                        )}
                                                    </button>
                                                    <button
                                                        className="cancel-edit-button"
                                                        onClick={handleCancelEdit}
                                                        disabled={loading}
                                                    >
                                                        <i className="ri-close-line"></i>Cancel
                                                    </button>
                                                    {showBackButton && (
                                                        <button
                                                            className="back-button"
                                                            onClick={handleBackToMiqaat}
                                                            disabled={loading}
                                                        >
                                                            <i className="ri-arrow-left-line"></i>Back to Incharges
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="save-button"
                                                        onClick={handleAddTeamsToList}
                                                        disabled={loading || !permissions.canAdd}
                                                    >
                                                        <i className="ri-add-line"></i>Add Teams to List
                                                    </button>
                                                    {showBackButton && (
                                                        <button
                                                            className="back-button"
                                                            onClick={handleBackToMiqaat}
                                                            disabled={loading}
                                                        >
                                                            <i className="ri-arrow-left-line"></i>Back to Incharges
                                                        </button>
                                                    )}
                                                    <button
                                                        className="clear-button"
                                                        onClick={handleClear}
                                                        disabled={loading}
                                                    >
                                                        <i className="ri-refresh-line me-2"></i>Clear Form
                                                    </button>

                                                </>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Pending Duties Section */}
                                {pendingDuties.length > 0 && !isEditMode && (
                                    <div className="pending-duties-section">
                                        <div className="pending-section-title">
                                            <i className="ri-time-line"></i>
                                            Pending Duties ({pendingDuties.length})
                                        </div>
                                        <div className="pending-table-wrapper">
                                            <table className="pending-table">
                                                <thead>
                                                    <tr>
                                                        <th>SR NO</th>
                                                        <th>JAMIAAT</th>
                                                        <th>TEAM</th>
                                                        <th>LOCATION</th>
                                                        <th>QUOTA</th>
                                                        <th>MEMBERS</th>
                                                        <th>ACTIONS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingDuties.map((duty, index) => (
                                                        <tr key={duty.tempId}>
                                                            <td>{index + 1}</td>
                                                            <td>{duty.jamiaat_name}</td>
                                                            <td>{duty.team_name}</td>
                                                            <td>{duty.location_name}</td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="quota-edit-input"
                                                                    value={duty.quota}
                                                                    onChange={(e) => handleEditPendingQuota(duty.tempId, e.target.value)}
                                                                    min="1"
                                                                    max={duty.member_count || undefined}
                                                                    disabled={loading}
                                                                />
                                                            </td>
                                                            <td>{duty.member_count || 'N/A'}</td>
                                                            <td>
                                                                <div className="action-buttons">
                                                                    <button
                                                                        className="icon-button delete-icon-button"
                                                                        onClick={() => handleDeletePending(duty.tempId)}
                                                                        title="Remove"
                                                                        disabled={loading}
                                                                    >
                                                                        <i className="ri-delete-bin-line"></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="button-row" style={{ marginTop: '20px' }}>
                                            <button
                                                className="save-button save-all-mode"
                                                onClick={handleSaveAllDuties}
                                                disabled={loading || !permissions.canAdd}
                                            >
                                                {loading ? (
                                                    <><span className="spinner"></span>Saving...</>
                                                ) : (
                                                    <><i className="ri-save-line"></i>Save All Duties ({pendingDuties.length})</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Saved Duties Table */}
                                {showDutiesTable && (
                                    <div className="duties-table-container">
                                        <div className="table-title">
                                            <i className="ri-table-line"></i>
                                            Saved Duties for {formData.miqaat?.label}
                                        </div>
                                        {loadingSavedDuties ? (
                                            <div className="loading-duties">
                                                <div className="loading-spinner"></div>
                                                <div>Loading duties...</div>
                                            </div>
                                        ) : savedDuties.length > 0 ? (
                                            <div className="duties-table-wrapper">
                                                <table className="duties-table">
                                                    <thead>
                                                        <tr>
                                                            <th>SR NO</th>
                                                            <th>JAMIAAT</th>
                                                            <th>TEAM</th>
                                                            <th>LOCATION</th>
                                                            <th>QUOTA</th>
                                                            <th>ACTIONS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {savedDuties.map((duty, index) => (
                                                            <tr key={duty.duty_id || index}>
                                                                <td>{index + 1}</td>
                                                                <td>{duty.jamiaat_name}</td>
                                                                <td>{duty.team_name}</td>
                                                                <td>{duty.location_name}</td>
                                                                <td>{duty.quota}</td>
                                                                <td>
                                                                    <div className="action-buttons">
                                                                        {permissions.canEdit && (
                                                                            <button
                                                                                className="icon-button edit-icon-button"
                                                                                onClick={() => handleEditSavedDuty(duty)}
                                                                                title="Edit Duty"
                                                                                disabled={loading}
                                                                            >
                                                                                <i className="ri-edit-line"></i>
                                                                            </button>
                                                                        )}
                                                                        {permissions.canDelete && (
                                                                            <button
                                                                                className="icon-button delete-icon-button"
                                                                                onClick={() => handleDeleteSavedDuty(duty.duty_id)}
                                                                                title="Delete Duty"
                                                                                disabled={loading}
                                                                            >
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
                                                <div>No duties assigned for this miqaat yet.</div>
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

export default MiqaatTeamForm;