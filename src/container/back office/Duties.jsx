import React, { useState, useEffect, Fragment } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { checkModuleAccess } from '../../utils/accessControl';
import '../../styles/shared-styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MODULE_ID = '108';

const MiqaatTeamForm = () => {
    const [checkingPermissions, setCheckingPermissions] = useState(true);
    const [permissions, setPermissions] = useState({ canAdd: false, canEdit: false, canDelete: false, hasAccess: false });
    const [formData, setFormData] = useState({ miqaat: null, jamiaat: null, team: null, location: null, quota: '' });
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingDutyId, setEditingDutyId] = useState(null);
    const [originalQuota, setOriginalQuota] = useState(0);

    const [miqaatOptions, setMiqaatOptions] = useState([]);
    const [jamiaatOptions, setJamiaatOptions] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingMiqaat, setLoadingMiqaat] = useState(false);
    const [loadingJamiaat, setLoadingJamiaat] = useState(false);
    const [loadingTeam, setLoadingTeam] = useState(false);
    const [loadingDuties, setLoadingDuties] = useState(false);
    const [loadingRemainingQuota, setLoadingRemainingQuota] = useState(false);
    const [loadingTeamCount, setLoadingTeamCount] = useState(false);
    const [loadingLocations, setLoadingLocations] = useState(false);

    const [errors, setErrors] = useState({});
    const [duties, setDuties] = useState([]);
    const [showDutiesTable, setShowDutiesTable] = useState(false);
    const [remainingQuota, setRemainingQuota] = useState(null);
    const [totalQuota, setTotalQuota] = useState(null);
    const [teamCount, setTeamCount] = useState(null);
    const [showFormSections, setShowFormSections] = useState(false);

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

    const getEffectiveRemainingQuota = () => { if (remainingQuota === null) return null; return isEditMode ? remainingQuota + originalQuota : remainingQuota; };

    useEffect(() => { if (!checkingPermissions && permissions.hasAccess) { fetchMiqaatOptions(); } }, [checkingPermissions, permissions]);

    const fetchMiqaatOptions = async () => {
        try {
            setLoadingMiqaat(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { console.error('Access token not found'); return; }
            const response = await fetch(`${API_BASE_URL}/Duty/GetListOfActiveMiqaat`, { method: 'GET', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` } });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const options = result.data.map(item => ({ value: item.miqaat_id, label: item.miqaat_name, quantity: item.quantity, venue_id: item.venue_id }));
                    setMiqaatOptions(options);
                }
            }
        } catch (error) { console.error('Error fetching miqaat options:', error); } finally { setLoadingMiqaat(false); }
    };

    const fetchJamiaatOptions = async () => {
        try {
            setLoadingJamiaat(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { console.error('Access token not found'); return; }
            const response = await fetch(`${API_BASE_URL}/Team/GetAllJamiaats`, { method: 'GET', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` } });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) { const options = result.data.map(item => ({ value: item.jamiaat_id, label: item.jamiaat_name })); setJamiaatOptions(options); } else { setJamiaatOptions([]); }
            }
        } catch (error) { console.error('Error fetching jamiaat options:', error); setJamiaatOptions([]); } finally { setLoadingJamiaat(false); }
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
                            // Ensure backend sends jamiaat_id in GetAllTeamsDuty for auto-select to work
                            jamiaat_id: item.jamiaat_id 
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

    const fetchLocationsByVenue = async (venueId) => {
        try {
            setLoadingLocations(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { console.error('Access token not found'); return; }
            const response = await fetch(`${API_BASE_URL}/Duty/GetLocationsByVenue`, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: JSON.stringify({ venue_id: venueId }) });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) { const options = result.data.map(item => ({ value: item.location_id, label: item.location_name })); setLocationOptions(options); } else { setLocationOptions([]); }
            }
        } catch (error) { console.error('Error fetching location options:', error); setLocationOptions([]); } finally { setLoadingLocations(false); }
    };

    const fetchTeamCount = async (teamId) => {
        try {
            setLoadingTeamCount(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { console.error('Access token not found'); return; }
            const response = await fetch(`${API_BASE_URL}/Duty/GetTeamCountByTeam`, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: JSON.stringify({ team_id: teamId }) });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) { setTeamCount(result.data.team_count); } else { setTeamCount(null); }
            }
        } catch (error) { console.error('Error fetching team count:', error); setTeamCount(null); } finally { setLoadingTeamCount(false); }
    };

    const fetchRemainingQuota = async (miqaatId) => {
        try {
            setLoadingRemainingQuota(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { console.error('Access token not found'); return; }
            const response = await fetch(`${API_BASE_URL}/Duty/GetRemainingQuotaByMiqaat`, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: JSON.stringify({ miqaat_id: miqaatId }) });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) { setRemainingQuota(result.data.remaining_quota); } else { setRemainingQuota(null); }
            }
        } catch (error) { console.error('Error fetching remaining quota:', error); setRemainingQuota(null); } finally { setLoadingRemainingQuota(false); }
    };

    const fetchDutiesByMiqaat = async (miqaatId) => {
        try {
            setLoadingDuties(true);
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { console.error('Access token not found'); return; }
            const response = await fetch(`${API_BASE_URL}/Duty/GetDutiesByMiqaat`, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: JSON.stringify({ miqaat_id: miqaatId }) });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) { setDuties(result.data); setShowDutiesTable(true); } else { setDuties([]); setShowDutiesTable(true); }
            }
        } catch (error) { console.error('Error fetching duties:', error); setDuties([]); setShowDutiesTable(false); } finally { setLoadingDuties(false); }
    };

    const handleMiqaatChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, miqaat: selectedOption }));
        if (errors.miqaat) { setErrors(prev => ({ ...prev, miqaat: '' })); }
        if (selectedOption?.value) {
            setTotalQuota(selectedOption.quantity || null);
            setShowFormSections(true);
            if (selectedOption.venue_id) { fetchLocationsByVenue(selectedOption.venue_id); }
            
            fetchJamiaatOptions();
            fetchTeamOptions(null); 
            fetchDutiesByMiqaat(selectedOption.value);
            fetchRemainingQuota(selectedOption.value);
        } else { 
            setShowFormSections(false); 
            setDuties([]); 
            setShowDutiesTable(false); 
            setRemainingQuota(null); 
            setTotalQuota(null); 
            setJamiaatOptions([]); 
            setTeamOptions([]); 
            setLocationOptions([]); 
            setTeamCount(null); 
        }
    };

    const handleJamiaatChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, jamiaat: selectedOption, team: null }));
        if (errors.jamiaat) { setErrors(prev => ({ ...prev, jamiaat: '' })); }
        setTeamCount(null);
        
        if (selectedOption?.value) { 
            fetchTeamOptions(selectedOption.value); 
        } else { 
            fetchTeamOptions(null); 
        }
    };

    const handleTeamChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, team: selectedOption }));
        if (errors.team) { setErrors(prev => ({ ...prev, team: '' })); }
        
        // if (selectedOption?.value) { 
        //     fetchTeamCount(selectedOption.value); 
            
        //     // Auto-select Jamiaat if not already selected and team has mapping
        //     if (!formData.jamiaat && selectedOption.jamiaat_id) {
        //         const matchedJamiaat = jamiaatOptions.find(j => j.value === selectedOption.jamiaat_id);
        //         if (matchedJamiaat) {
        //             setFormData(prev => ({ ...prev, team: selectedOption, jamiaat: matchedJamiaat }));
        //         }
        //     }
        // } else { 
        //     setTeamCount(null); 
        // }
    };

    const handleLocationChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, location: selectedOption }));
        if (errors.location) { setErrors(prev => ({ ...prev, location: '' })); }
    };

    const handleQuotaChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, quota: value }));
        if (errors.quota) { setErrors(prev => ({ ...prev, quota: '' })); }
        const effectiveRemaining = getEffectiveRemainingQuota();
        if (value && effectiveRemaining !== null && parseInt(value) > effectiveRemaining) { setErrors(prev => ({ ...prev, quota: `Quota cannot exceed available capacity of ${effectiveRemaining}` })); } else if (value && teamCount !== null && parseInt(value) > teamCount) { setErrors(prev => ({ ...prev, quota: `Quota cannot exceed team member count of ${teamCount}` })); }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.miqaat) { newErrors.miqaat = 'Please select a Miqaat'; }
        
        // Removed compulsory Jamiaat validation as requested
        // if (!formData.jamiaat) { newErrors.jamiaat = 'Please select a Jamiaat'; } 
        
        if (!formData.team) { newErrors.team = 'Please select a Team'; }
        if (!formData.location) { newErrors.location = 'Please select a Location'; }
        if (!formData.quota) { newErrors.quota = 'Please enter quota'; } else if (formData.quota <= 0) { newErrors.quota = 'Quota must be greater than 0'; } else {
            const effectiveRemaining = getEffectiveRemainingQuota();
            if (effectiveRemaining !== null && parseInt(formData.quota) > effectiveRemaining) { newErrors.quota = `Quota cannot exceed available capacity of ${effectiveRemaining}`; } else if (teamCount !== null && parseInt(formData.quota) > teamCount) { newErrors.quota = `Quota cannot exceed team member count of ${teamCount}`; }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!isEditMode && !permissions.canAdd) { Swal.fire({ icon: 'warning', title: 'Permission Denied', text: 'You do not have permission to add duties.', confirmButtonText: 'OK' }); return; }
        if (isEditMode && !permissions.canEdit) { Swal.fire({ icon: 'warning', title: 'Permission Denied', text: 'You do not have permission to edit duties.', confirmButtonText: 'OK' }); return; }
        if (!validateForm()) { return; }
        setLoading(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { throw new Error('Access token not found. Please login again.'); }
            let response, apiEndpoint, requestBody;
            if (isEditMode) {
                apiEndpoint = `${API_BASE_URL}/Duty/UpdateDuty`;
                requestBody = { duty_id: editingDutyId, team_id: formData.team.value, miqaat_id: formData.miqaat.value, quota: parseInt(formData.quota), location_id: formData.location.value };
                response = await fetch(apiEndpoint, { method: 'PUT', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: JSON.stringify(requestBody) });
            } else {
                apiEndpoint = `${API_BASE_URL}/Duty/InsertDuty`;
                requestBody = { team_id: formData.team.value, miqaat_id: formData.miqaat.value, quota: parseInt(formData.quota), location_id: formData.location.value };
                response = await fetch(apiEndpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: JSON.stringify(requestBody) });
            }
            const result = await response.json();
            if (response.ok) {
                const resultCode = Number(result.data?.result_code);
                if (resultCode === 1) {
                    Swal.fire({ title: 'Success!', text: result.message || 'Duty created successfully!', icon: 'success', timer: 2000, timerProgressBar: false, showConfirmButton: false, allowOutsideClick: false });
                    if (formData.miqaat?.value) { fetchDutiesByMiqaat(formData.miqaat.value); fetchRemainingQuota(formData.miqaat.value); }
                    
                    setTimeout(() => { 
                        setFormData(prev => ({ 
                            ...prev, 
                            team: null, 
                            location: null, 
                            quota: '' 
                        })); 
                        setErrors({}); 
                        setTeamCount(null); 
                    }, 2000);

                } else if (resultCode === 2) {
                    Swal.fire({ title: 'Success!', text: result.message || 'Duty updated successfully!', icon: 'success', timer: 2000, timerProgressBar: false, showConfirmButton: false, allowOutsideClick: false });
                    if (formData.miqaat?.value) { fetchDutiesByMiqaat(formData.miqaat.value); fetchRemainingQuota(formData.miqaat.value); }
                    setTimeout(() => { handleCancelEdit(); }, 2000);
                } else if (resultCode === 4) { Swal.fire({ icon: 'warning', title: 'Duplicate Duty', text: 'This duty assignment already exists (same team, miqaat, and location)', confirmButtonText: 'OK' }); } else if (resultCode === 0) { Swal.fire({ icon: 'error', title: 'Failed', text: result.message || 'Failed to save duty', confirmButtonText: 'OK' }); }
            } else { throw new Error(result.message || `Server error: ${response.status}`); }
        } catch (error) { console.error('Error saving duty:', error); Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'An error occurred while saving', confirmButtonText: 'OK' }); } finally { setLoading(false); }
    };

    const handleEdit = async (duty) => {
        if (!permissions.canEdit) { Swal.fire({ icon: 'warning', title: 'Permission Denied', text: 'You do not have permission to edit duties.', confirmButtonText: 'OK' }); return; }
        try {
            if (!showFormSections) { setShowFormSections(true); }
            if (jamiaatOptions.length === 0) { await fetchJamiaatOptions(); }
            
            await fetchTeamOptions(duty.jamiaat_id);
            await fetchTeamCount(duty.team_id);
            if (duty.venue_id) { await fetchLocationsByVenue(duty.venue_id); }
            setFormData({ miqaat: { value: duty.miqaat_id, label: duty.miqaat_name }, jamiaat: { value: duty.jamiaat_id, label: duty.jamiaat_name }, team: { value: duty.team_id, label: duty.team_name }, location: { value: duty.location_id, label: duty.location_name }, quota: duty.quota.toString() });
            setIsEditMode(true);
            setEditingDutyId(duty.duty_id);
            setOriginalQuota(duty.quota);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) { console.error('Error loading duty for edit:', error); Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load duty details', confirmButtonText: 'OK' }); }
    };

    const handleDelete = async (dutyId) => {
        if (!permissions.canDelete) { Swal.fire({ icon: 'warning', title: 'Permission Denied', text: 'You do not have permission to delete duties.', confirmButtonText: 'OK' }); return; }
        const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc3545', cancelButtonColor: '#6c757d', confirmButtonText: 'Yes, delete it!', cancelButtonText: 'Cancel' });
        if (!result.isConfirmed) { return; }
        try {
            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) { throw new Error('Access token not found. Please login again.'); }
            const response = await fetch(`${API_BASE_URL}/Duty/DeleteDuty`, { method: 'DELETE', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: JSON.stringify({ duty_id: dutyId }) });
            const apiResult = await response.json();
            if (response.ok && apiResult.success) {
                const resultCode = Number(apiResult.data?.result_code);
                if (resultCode === 3) { Swal.fire({ title: 'Deleted!', text: apiResult.message || 'Duty has been deleted successfully.', icon: 'success', timer: 2000, timerProgressBar: false, showConfirmButton: false }); if (formData.miqaat?.value) { fetchDutiesByMiqaat(formData.miqaat.value); fetchRemainingQuota(formData.miqaat.value); } } else { throw new Error(apiResult.message || 'Failed to delete duty'); }
            } else { throw new Error(apiResult.message || `Server error: ${response.status}`); }
        } catch (error) { console.error('Error deleting duty:', error); Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'An error occurred while deleting', confirmButtonText: 'OK' }); }
    };

    const handleCancelEdit = () => {
        setFormData(prev => ({ ...prev, jamiaat: null, team: null, location: null, quota: '' }));
        setErrors({});
        setTeamOptions([]);
        setIsEditMode(false);
        setEditingDutyId(null);
        setOriginalQuota(0);
        setTeamCount(null);
    };

    const handleClear = () => {
        setFormData({ miqaat: null, jamiaat: null, team: null, location: null, quota: '' });
        setErrors({});
        setTeamOptions([]);
        setLocationOptions([]);
        setDuties([]);
        setShowDutiesTable(false);
        setIsEditMode(false);
        setEditingDutyId(null);
        setRemainingQuota(null);
        setTotalQuota(null);
        setOriginalQuota(0);
        setShowFormSections(false);
        setJamiaatOptions([]);
        setTeamCount(null);
    };

    const selectStyles = { control: (base, state) => ({ ...base, minHeight: '38px', borderColor: state.selectProps.error ? '#dc3545' : (state.isFocused ? '#0d6efd' : '#dee2e6'), borderWidth: '2px', borderRadius: '8px', boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.15)' : 'none', '&:hover': { borderColor: state.selectProps.error ? '#dc3545' : '#adb5bd' } }), placeholder: (base) => ({ ...base, color: '#6c757d', fontSize: '15px' }), singleValue: (base) => ({ ...base, fontSize: '15px' }), dropdownIndicator: (base) => ({ ...base, color: '#0d6efd', '&:hover': { color: '#0b5ed7' } }), menu: (base) => ({ ...base, zIndex: 1000 }) };

    const displayRemainingQuota = getEffectiveRemainingQuota();

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
                                <style>{`.edit-mode-badge{background:#ffc107;color:#000;padding:6px 15px;border-radius:20px;font-size:14px;font-weight:500}.quota-container{width:100%}.quota-display{height:38px;padding:0 15px;border:2px solid #dee2e6;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;background:#f8f9fa}.quota-loading{display:flex;align-items:center;gap:8px;color:#0d6efd}.quota-value{font-weight:600;font-size:16px;color:#495057;display:flex;align-items:center}.quota-placeholder{color:#6c757d;font-style:italic}.form-label{font-weight:500;font-size:14px;color:#495057;margin-bottom:8px;display:block}.form-label .text-danger{color:#dc3545;margin-left:4px}.error-text{color:#dc3545;font-size:13px;margin-top:6px;display:block}.form-input{width:100%;height:38px;padding:0 15px;border:2px solid #dee2e6;border-radius:8px;font-size:15px;transition:all .2s}.form-input:focus{outline:none;border-color:#0d6efd;box-shadow:0 0 0 .2rem rgba(13,110,253,.15)}.form-input.is-invalid{border-color:#dc3545}.button-row{display:flex;gap:15px;margin-top:20px;justify-content:center;align-items:center}.save-button{height:38px;padding:0 35px;background:#0d6efd;border:none;border-radius:8px;color:#fff;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;justify-content:center}.save-button:hover:not(:disabled){background:#0b5ed7;transform:translateY(-1px);box-shadow:0 4px 12px rgba(13,110,253,.3)}.save-button:active:not(:disabled){transform:translateY(0)}.save-button:disabled{opacity:.6;cursor:not-allowed}.save-button.update-mode{background:#28a745}.save-button.update-mode:hover:not(:disabled){background:#218838}.cancel-edit-button{height:38px;padding:0 35px;background:#ffc107;border:none;border-radius:8px;color:#000;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;justify-content:center}.cancel-edit-button:hover:not(:disabled){background:#e0a800}.spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.clear-button{padding:0 20px;background:#6c757d;border:none;border-radius:8px;color:#fff;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;height:38px}.clear-button:hover:not(:disabled){background:#5c636a}.clear-button:disabled{opacity:.6;cursor:not-allowed}.team-count-info{margin-top:8px;font-size:13px;color:#6c757d;display:flex;align-items:center;gap:5px}.team-count-info.loading{color:#0d6efd}.duties-table-container{margin-top:40px;border-top:2px solid #dee2e6;padding-top:30px}.table-title{font-size:18px;font-weight:600;margin-bottom:20px;color:#333;display:flex;align-items:center;gap:10px}.duties-table-wrapper{overflow-x:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1)}.duties-table{width:100%;border-collapse:collapse;background:#fff;border:2px solid #dee2e6}.duties-table thead{background:#fff;color:#000;border-bottom:2px solid #dee2e6}.duties-table th{padding:15px;text-align:left;font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:.5px;border-right:1px solid #dee2e6}.duties-table th:last-child{border-right:none}.duties-table tbody tr{border-bottom:1px solid #dee2e6;transition:background-color .2s}.duties-table tbody tr:hover{background-color:#f8f9fa}.duties-table tbody tr:last-child{border-bottom:none}.duties-table td{padding:15px;font-size:14px;color:#495057;border-right:1px solid #dee2e6}.duties-table td:last-child{border-right:none}.action-buttons{display:flex;gap:10px;align-items:center}.icon-button{width:36px;height:36px;border:none;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .2s;font-size:16px}.edit-icon-button{background:#0d6efd;color:#fff}.edit-icon-button:hover{background:#0b5ed7;transform:translateY(-2px);box-shadow:0 4px 8px rgba(13,110,253,.3)}.delete-icon-button{background:#dc3545;color:#fff}.delete-icon-button:hover{background:#c82333;transform:translateY(-2px);box-shadow:0 4px 8px rgba(220,53,69,.3)}.no-duties-message{text-align:center;padding:40px 20px;color:#6c757d;font-size:15px}.no-duties-icon{font-size:48px;margin-bottom:15px;opacity:.5}.loading-duties{text-align:center;padding:40px 20px;color:#0d6efd}.loading-spinner{width:40px;height:40px;border:4px solid rgba(13,110,253,.1);border-top-color:#0d6efd;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 15px}@media (max-width:768px){.button-row{flex-direction:column;width:100%}.save-button,.cancel-edit-button,.clear-button{width:100%}.duties-table-wrapper{overflow-x:scroll}.duties-table th,.duties-table td{padding:10px;font-size:13px}}`}</style>
                                
                                <div className="page-header-title">
                                    <div className="header-text"><i className="ri-file-list-3-line"></i><span>Duties Assign</span></div>
                                    {isEditMode && (<span className="edit-mode-badge"><i className="ri-edit-line me-1"></i>Edit Mode</span>)}
                                </div>

                                {/* Layout Fix: Miqaat is always md=6 so it doesn't jump */}
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <div className="miqaat-dropdown-container">
                                            <label className="form-label">Miqaat <span className="text-danger">*</span></label>
                                            <Select options={miqaatOptions} value={formData.miqaat} onChange={handleMiqaatChange} placeholder="Select Miqaat" isClearable styles={selectStyles} error={errors.miqaat} isDisabled={loading || isEditMode} isLoading={loadingMiqaat} />
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
                                                    <label className="form-label">{isEditMode ? 'Available' : 'Remaining'}</label>
                                                    <div className="quota-display">
                                                        {loadingRemainingQuota ? (<div className="quota-loading"><span className="spinner"></span></div>) : displayRemainingQuota !== null ? (<div className="quota-value">{displayRemainingQuota}</div>) : (<div className="quota-placeholder">N/A</div>)}
                                                    </div>
                                                </div>
                                            </Col>
                                        </>
                                    )}
                                </Row>

                                {showFormSections && (
                                    <>
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <label className="form-label">Jamiaat</label>
                                                <Select options={jamiaatOptions} value={formData.jamiaat} onChange={handleJamiaatChange} placeholder={loadingJamiaat ? "Loading..." : "Select Jamiaat"} isClearable styles={selectStyles} error={errors.jamiaat} isDisabled={loading} isLoading={loadingJamiaat} />
                                                {errors.jamiaat && <span className="error-text">{errors.jamiaat}</span>}
                                            </Col>
                                            <Col md={6}>
                                                <label className="form-label">Team <span className="text-danger">*</span></label>
                                                <Select options={teamOptions} value={formData.team} onChange={handleTeamChange} placeholder={loadingTeam ? "Loading..." : "Select Team"} isClearable styles={selectStyles} error={errors.team} isDisabled={loading || loadingTeam} isLoading={loadingTeam} noOptionsMessage={() => "No teams found"} />
                                                {errors.team && <span className="error-text">{errors.team}</span>}
                                                {formData.team && (<div className={`team-count-info ${loadingTeamCount ? 'loading' : ''}`}>{loadingTeamCount ? (<><span className="spinner"></span>Loading count...</>) : teamCount !== null ? (<><i className="ri-team-line"></i>Team Members: {teamCount}</>) : null}</div>)}
                                            </Col>
                                        </Row>

                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <label className="form-label">Location <span className="text-danger">*</span></label>
                                                <Select options={locationOptions} value={formData.location} onChange={handleLocationChange} placeholder={loadingLocations ? "Loading..." : "Select Location"} isClearable styles={selectStyles} error={errors.location} isDisabled={loading} isLoading={loadingLocations} noOptionsMessage={() => "No locations found"} />
                                                {errors.location && <span className="error-text">{errors.location}</span>}
                                            </Col>
                                            <Col md={6}>
                                                <label className="form-label">Quota <span className="text-danger">*</span></label>
                                                <input type="number" className={`form-input ${errors.quota ? 'is-invalid' : ''}`} placeholder="Enter quota" value={formData.quota} onChange={handleQuotaChange} disabled={loading} min="1" max={Math.min(displayRemainingQuota !== null ? displayRemainingQuota : Infinity, teamCount !== null ? teamCount : Infinity)} />
                                                {errors.quota && <span className="error-text">{errors.quota}</span>}
                                            </Col>
                                        </Row>

                                        <div className="button-row">
                                            {isEditMode ? (
                                                <>
                                                    <button className="save-button update-mode" onClick={handleSave} disabled={loading}>{loading ? (<><span className="spinner"></span>Updating...</>) : (<><i className="ri-save-line"></i>Save</>)}</button>
                                                    <button className="cancel-edit-button" onClick={handleCancelEdit} disabled={loading}><i className="ri-close-line"></i>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="save-button" onClick={handleSave} disabled={loading || !permissions.canAdd}>{loading ? (<><span className="spinner"></span>Saving...</>) : (<><i className="ri-save-line"></i>Save Duty</>)}</button>
                                                    <button className="clear-button" onClick={handleClear} disabled={loading}><i className="ri-refresh-line me-2"></i>Clear Form</button>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}

                                {showDutiesTable && (
                                    <div className="duties-table-container">
                                        <div className="table-title"><i className="ri-table-line"></i>Assigned Duties for {formData.miqaat?.label}</div>
                                        {loadingDuties ? (<div className="loading-duties"><div className="loading-spinner"></div><div>Loading duties...</div></div>) : duties.length > 0 ? (
                                            <div className="duties-table-wrapper">
                                                <table className="duties-table">
                                                    <thead><tr><th>SR NO</th><th>JAMIAAT</th><th>TEAM</th><th>LOCATION</th><th>QUOTA</th><th>ACTIONS</th></tr></thead>
                                                    <tbody>
                                                        {duties.map((duty, index) => (<tr key={duty.duty_id || index}>
                                                            <td>{index + 1}</td>
                                                            <td>{duty.jamiaat_name}</td>
                                                            <td>{duty.team_name}</td>
                                                            <td>{duty.location_name}</td>
                                                            <td>{duty.quota}</td>
                                                            <td>
                                                                <div className="action-buttons">
                                                                    {permissions.canEdit && (<button className="icon-button edit-icon-button" onClick={() => handleEdit(duty)} title="Edit Duty"><i className="ri-edit-line"></i></button>)}
                                                                    {permissions.canDelete && (<button className="icon-button delete-icon-button" onClick={() => handleDelete(duty.duty_id)} title="Delete Duty"><i className="ri-delete-bin-line"></i></button>)}
                                                                </div>
                                                            </td>
                                                        </tr>))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (<div className="no-duties-message"><div className="no-duties-icon">📋</div><div>No duties assigned for this miqaat yet.</div></div>)}
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