// import React, { useState, useEffect, Fragment } from 'react';
// import { Card, Col, Row } from 'react-bootstrap';
// import Select from 'react-select';
// import Swal from 'sweetalert2';
// import '../../styles/shared-styles.css'; 

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
// const MODULE_ID = '111';

// const MiqaatIncharge = () => {
//     // ============================================================================
//     // STATE MANAGEMENT
//     // ============================================================================
//     const [checkingPermissions, setCheckingPermissions] = useState(true);
//     const [permissions, setPermissions] = useState({ canAdd: false, canEdit: false, canDelete: false, hasAccess: false });
    
//     // Form Data
//     const [formData, setFormData] = useState({ miqaat: null, jamiaat: null, location: null, team: null, member: null });
    
//     // UI State
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editingInchargeId, setEditingInchargeId] = useState(null);
//     const [showFormSections, setShowFormSections] = useState(false);
//     const [showInchargesTable, setShowInchargesTable] = useState(false);

//     // Data & Options
//     const [miqaatOptions, setMiqaatOptions] = useState([]);
//     const [jamiaatOptions, setJamiaatOptions] = useState([]); 
//     const [locationOptions, setLocationOptions] = useState([]);
//     const [teamOptions, setTeamOptions] = useState([]);
//     const [memberOptions, setMemberOptions] = useState([]);
//     const [incharges, setIncharges] = useState([]);

//     // Loading States
//     const [loading, setLoading] = useState(false);
//     const [loadingMiqaat, setLoadingMiqaat] = useState(false);
//     const [loadingJamiaat, setLoadingJamiaat] = useState(false);
//     const [loadingLocations, setLoadingLocations] = useState(false);
//     const [loadingTeams, setLoadingTeams] = useState(false);
//     const [loadingMembers, setLoadingMembers] = useState(false);
//     const [loadingGrid, setLoadingGrid] = useState(false);

//     const [errors, setErrors] = useState({});

//     // ============================================================================
//     // AUTHENTICATION & PERMISSIONS
//     // ============================================================================
//     useEffect(() => {
//         checkAccess();
//     }, []);

//     const checkAccess = () => {
//         setCheckingPermissions(true);
//         const isAdminValue = sessionStorage.getItem('is_admin');
        
//         if (isAdminValue === 'true' || isAdminValue === true || isAdminValue === '1') {
//             setPermissions({ canAdd: true, canEdit: true, canDelete: true, hasAccess: true });
//             setCheckingPermissions(false);
//             fetchInitialData();
//             return;
//         }
        
//         const accessRights = sessionStorage.getItem('access_rights');
//         if (!accessRights) {
//             Swal.fire({ icon: 'error', title: 'Session Expired', text: 'Your session has expired. Please log in again.', confirmButtonText: 'OK' }).then(() => { window.location.href = '/login'; });
//             return;
//         }

//         const checkModuleAccessLocal = (accessRightsString, moduleId) => {
//             try {
//                 const rights = JSON.parse(accessRightsString);
//                 const moduleAccess = rights.find(module => module.module_id === moduleId);
//                 if (!moduleAccess) return { hasAccess: false, canAdd: false, canEdit: false, canDelete: false };
//                 return {
//                     hasAccess: true,
//                     canAdd: moduleAccess.can_add === true || moduleAccess.can_add === 1,
//                     canEdit: moduleAccess.can_edit === true || moduleAccess.can_edit === 1,
//                     canDelete: moduleAccess.can_delete === true || moduleAccess.can_delete === 1
//                 };
//             } catch (error) {
//                 console.error('Error parsing rights', error);
//                 return { hasAccess: false, canAdd: false, canEdit: false, canDelete: false };
//             }
//         };

//         const modulePermissions = checkModuleAccessLocal(accessRights, MODULE_ID);
        
//         if (!modulePermissions.hasAccess) {
//              Swal.fire({ icon: 'warning', title: 'Access Denied', text: 'You do not have permission to access this module.', confirmButtonText: 'OK' }).then(() => { window.location.href = '/dashboard'; });
//              return;
//         }
        
//         setPermissions(modulePermissions);
//         setCheckingPermissions(false);
//         fetchInitialData();
//     };

//     // ============================================================================
//     // API CALLS
//     // ============================================================================
//     const fetchInitialData = async () => {
//         await fetchMiqaatOptions();
//     };

//     const fetchMiqaatOptions = async () => {
//         setLoadingMiqaat(true);
//         try {
//             const accessToken = sessionStorage.getItem('access_token');
//             const response = await fetch(`${API_BASE_URL}/Duty/GetListOfActiveMiqaat`, {
//                 method: 'GET',
//                 headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
//             });
//             if (response.ok) {
//                 const result = await response.json();
//                 if (result.success && result.data) {
//                     const options = result.data.map(item => ({ value: item.miqaat_id, label: item.miqaat_name, venue_id: item.venue_id }));
//                     setMiqaatOptions(options);
//                 }
//             }
//         } catch (error) { console.error('Error fetching miqaat options:', error); } 
//         finally { setLoadingMiqaat(false); }
//     };

//     const fetchJamiaatOptions = async () => {
//         setLoadingJamiaat(true);
//         try {
//             const accessToken = sessionStorage.getItem('access_token');
//             const response = await fetch(`${API_BASE_URL}/Team/GetAllJamiaats`, {
//                 method: 'GET',
//                 headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
//             });
//             if (response.ok) {
//                 const result = await response.json();
//                 if (result.success && result.data) {
//                     const options = result.data.map(item => ({ value: item.jamiaat_id, label: item.jamiaat_name }));
//                     setJamiaatOptions(options);
//                 } else { setJamiaatOptions([]); }
//             }
//         } catch (error) { console.error('Error fetching jamiaat options:', error); setJamiaatOptions([]); } 
//         finally { setLoadingJamiaat(false); }
//     };

//     const fetchTeamOptions = async (jamiaatId = null) => {
//         setLoadingTeams(true);
//         try {
//             const accessToken = sessionStorage.getItem('access_token');
//             let url, method, body;

//             if (jamiaatId) {
//                 url = `${API_BASE_URL}/Duty/GetTeamsByJamiaat`;
//                 method = 'POST';
//                 body = JSON.stringify({ jamiaat_id: jamiaatId });
//             } else {
//                 url = `${API_BASE_URL}/Duty/GetAllTeamsDuty`;
//                 method = 'GET';
//                 body = null;
//             }

//             const fetchOptions = {
//                 method: method,
//                 headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
//             };
//             if (body) fetchOptions.body = body;

//             const response = await fetch(url, fetchOptions);
//             if (response.ok) {
//                 const result = await response.json();
//                 if (result.success && result.data) {
//                     const options = result.data.map(item => ({ value: item.team_id, label: item.team_name, jamiaat_id: item.jamiaat_id }));
//                     setTeamOptions(options);
//                 } else { setTeamOptions([]); }
//             }
//         } catch (error) { console.error('Error fetching teams:', error); setTeamOptions([]); } 
//         finally { setLoadingTeams(false); }
//     };

//     const fetchLocationsByVenue = async (venueId) => {
//         setLoadingLocations(true);
//         setFormData(prev => ({ ...prev, location: null }));
//         try {
//             const accessToken = sessionStorage.getItem('access_token');
//             const response = await fetch(`${API_BASE_URL}/Duty/GetLocationsByVenue`, {
//                 method: 'POST',
//                 headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
//                 body: JSON.stringify({ venue_id: venueId })
//             });
//             if (response.ok) {
//                 const result = await response.json();
//                 if (result.success && result.data) {
//                     const options = result.data.map(item => ({ value: item.location_id, label: item.location_name, venue_id: item.venue_id }));
//                     setLocationOptions(options);
//                 } else { setLocationOptions([]); }
//             }
//         } catch (error) { console.error('Error fetching locations:', error); setLocationOptions([]); } 
//         finally { setLoadingLocations(false); }
//     };

//     const fetchTeamMembersForIncharge = async (teamId, miqaatId) => {
//         setLoadingMembers(true);
//         // Note: We don't necessarily want to clear formData.member here if it's a refresh call, 
//         // but typically selecting a team clears the member. In refresh scenario, member is likely null/deleted anyway.
//         // setFormData(prev => ({ ...prev, member: null })); // Removed to be safe for refreshes, handled by caller if needed
        
//         try {
//             const accessToken = sessionStorage.getItem('access_token');
//             const response = await fetch(`${API_BASE_URL}/Incharge/GetTeamMembersForIncharge`, {
//                 method: 'POST',
//                 headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
//                 body: JSON.stringify({ team_id: teamId, miqaat_id: miqaatId })
//             });
//             if (response.ok) {
//                 const result = await response.json();
//                 if (result.success && result.data) {
//                     const options = result.data.map(item => ({ 
//                         value: item.its_id, 
//                         label: `${item.full_name} (${item.its_id})`,
//                         team_id: item.team_id 
//                     }));
//                     setMemberOptions(options);
//                 } else { setMemberOptions([]); }
//             }
//         } catch (error) { console.error('Error fetching members:', error); setMemberOptions([]); } 
//         finally { setLoadingMembers(false); }
//     };

//     const fetchInchargesByMiqaat = async (miqaatId) => {
//         setLoadingGrid(true);
//         try {
//             const accessToken = sessionStorage.getItem('access_token');
//             const response = await fetch(`${API_BASE_URL}/Incharge/GetInchargesByMiqaat`, {
//                 method: 'POST',
//                 headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
//                 body: JSON.stringify({ miqaat_id: miqaatId })
//             });
//             if (response.ok) {
//                 const result = await response.json();
//                 if (result.success && result.data) { 
//                     setIncharges(result.data); 
//                     setShowInchargesTable(true); 
//                 } else { 
//                     setIncharges([]); 
//                     setShowInchargesTable(true); 
//                 }
//             }
//         } catch (error) { console.error('Error fetching incharges:', error); setIncharges([]); } 
//         finally { setLoadingGrid(false); }
//     };

//     const fetchInchargeById = async (guardDutyId) => {
//         try {
//             const accessToken = sessionStorage.getItem('access_token');
//             const response = await fetch(`${API_BASE_URL}/Incharge/GetInchargeById`, {
//                 method: 'POST',
//                 headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
//                 body: JSON.stringify({ guard_duty_id: guardDutyId })
//             });
//             if (response.ok) {
//                 const result = await response.json();
//                 if (result.success && result.data && result.data.length > 0) return result.data[0];
//             }
//             return null;
//         } catch (error) { console.error('Error fetching incharge details:', error); return null; }
//     };

//     // ============================================================================
//     // HANDLERS
//     // ============================================================================

//     const handleMiqaatChange = (selectedOption) => {
//         setFormData(prev => ({ ...prev, miqaat: selectedOption, jamiaat: null, location: null, team: null, member: null }));
//         setErrors({});
//         setLocationOptions([]);
//         setMemberOptions([]);
        
//         if (selectedOption?.value) {
//             setShowFormSections(true);
//             fetchJamiaatOptions();
//             fetchTeamOptions(null); 

//             if (selectedOption.venue_id) {
//                 fetchLocationsByVenue(selectedOption.venue_id);
//                 fetchInchargesByMiqaat(selectedOption.value);
//             }
//         } else {
//             setShowFormSections(false);
//             setIncharges([]);
//             setShowInchargesTable(false);
//             setJamiaatOptions([]);
//             setTeamOptions([]);
//         }
//     };

//     const handleJamiaatChange = (selectedOption) => {
//         setFormData(prev => ({ ...prev, jamiaat: selectedOption, team: null, member: null }));
//         setMemberOptions([]);
//         if (errors.jamiaat) setErrors(prev => ({ ...prev, jamiaat: '' }));

//         if (selectedOption?.value) {
//             fetchTeamOptions(selectedOption.value);
//         } else {
//             fetchTeamOptions(null); 
//         }
//     };

//     const handleTeamChange = (selectedOption) => {
//         setFormData(prev => ({ ...prev, team: selectedOption, member: null }));
//         setMemberOptions([]); // Clear existing options while loading
//         if (errors.team) setErrors(prev => ({ ...prev, team: '' }));

//         if (selectedOption?.value && formData.miqaat?.value) {
//             fetchTeamMembersForIncharge(selectedOption.value, formData.miqaat.value);
//         }
//     };

//     const handleLocationChange = (selectedOption) => {
//         setFormData(prev => ({ ...prev, location: selectedOption }));
//         if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
//     };

//     const handleMemberChange = (selectedOption) => {
//         setFormData(prev => ({ ...prev, member: selectedOption }));
//         if (errors.member) setErrors(prev => ({ ...prev, member: '' }));
//     };

//     const validateForm = () => {
//         const newErrors = {};
//         if (!formData.miqaat) newErrors.miqaat = 'Please select a Miqaat';
//         if (!formData.team) newErrors.team = 'Please select a Team';
//         if (!formData.location) newErrors.location = 'Please select a Location';
//         if (!formData.member) newErrors.member = 'Please select a Member';
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSave = async () => {
//         if (!isEditMode && !permissions.canAdd) { Swal.fire({ icon: 'warning', title: 'Permission Denied', text: 'You do not have permission to add.', confirmButtonText: 'OK' }); return; }
//         if (isEditMode && !permissions.canEdit) { Swal.fire({ icon: 'warning', title: 'Permission Denied', text: 'You do not have permission to edit.', confirmButtonText: 'OK' }); return; }
//         if (!validateForm()) return;

//         setLoading(true);
//         try {
//             const accessToken = sessionStorage.getItem('access_token');
//             let response, apiEndpoint, requestBody;

//             if (isEditMode) {
//                 apiEndpoint = `${API_BASE_URL}/Incharge/UpdateIncharge`;
//                 requestBody = {
//                     guard_duty_id: editingInchargeId,
//                     miqaat_id: formData.miqaat.value,
//                     its_id: formData.member.value,
//                     location_id: formData.location.value
//                 };
//                 response = await fetch(apiEndpoint, { method: 'PUT', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: JSON.stringify(requestBody) });
//             } else {
//                 apiEndpoint = `${API_BASE_URL}/Incharge/InsertIncharge`;
//                 requestBody = {
//                     miqaat_id: formData.miqaat.value,
//                     its_id: formData.member.value,
//                     location_id: formData.location.value
//                 };
//                 response = await fetch(apiEndpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: JSON.stringify(requestBody) });
//             }

//             const result = await response.json();
//             if (response.ok) {
//                 const resultCode = Number(result.data?.result_code);
                
//                 if ((isEditMode && resultCode === 2) || (!isEditMode && resultCode === 1)) {
//                     Swal.fire({ title: 'Success!', text: result.message || (isEditMode ? 'Updated successfully!' : 'Added successfully!'), icon: 'success', timer: 2000, timerProgressBar: false, showConfirmButton: false });
                    
//                     if (formData.miqaat?.value) fetchInchargesByMiqaat(formData.miqaat.value);

//                     if (isEditMode) {
//                         setTimeout(() => handleCancel(), 2000);
//                     } else {
//                         setFormData(prev => ({ ...prev, member: null }));
//                         if (formData.team?.value && formData.miqaat?.value) {
//                              fetchTeamMembersForIncharge(formData.team.value, formData.miqaat.value);
//                         }
//                     }

//                 } else if (resultCode === 4) {
//                     Swal.fire({ icon: 'warning', title: 'Duplicate Entry', text: 'This member is already an incharge for this miqaat', confirmButtonText: 'OK' });
//                 } else {
//                     Swal.fire({ icon: 'error', title: 'Failed', text: result.message || 'Operation failed', confirmButtonText: 'OK' });
//                 }
//             } else { throw new Error(result.message || `Server error: ${response.status}`); }
//         } catch (error) { console.error('Error saving:', error); Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'An error occurred', confirmButtonText: 'OK' }); } 
//         finally { setLoading(false); }
//     };

//     const handleEdit = async (incharge) => {
//         if (!permissions.canEdit) { Swal.fire({ icon: 'warning', title: 'Permission Denied', text: 'You do not have permission to edit.', confirmButtonText: 'OK' }); return; }
        
//         try {
//             const inchargeDetails = await fetchInchargeById(incharge.guard_duty_id);
//             if (!inchargeDetails) throw new Error("Details not found");

//             if (!showFormSections) setShowFormSections(true);
//             if (jamiaatOptions.length === 0) await fetchJamiaatOptions();

//             // Set Miqaat
//             const selectedMiqaat = miqaatOptions.find(opt => opt.value === inchargeDetails.miqaat_id);
//             if (selectedMiqaat && selectedMiqaat.venue_id) {
//                  await fetchLocationsByVenue(selectedMiqaat.venue_id);
//             }

//             // Set Team
//             await fetchTeamOptions(null); 
//             const selectedTeam = teamOptions.find(opt => opt.value === inchargeDetails.team_id) 
//                               || { value: inchargeDetails.team_id, label: inchargeDetails.team_name };
            
//             if (selectedTeam) {
//                 await fetchTeamMembersForIncharge(inchargeDetails.team_id, inchargeDetails.miqaat_id);
//             }

//             setFormData({
//                 miqaat: selectedMiqaat,
//                 jamiaat: null, 
//                 team: selectedTeam,
//                 location: { value: inchargeDetails.location_id, label: inchargeDetails.location_name },
//                 member: { value: inchargeDetails.its_id, label: `${inchargeDetails.full_name} (${inchargeDetails.its_id})` }
//             });

//             setIsEditMode(true);
//             setEditingInchargeId(incharge.guard_duty_id);
//             window.scrollTo({ top: 0, behavior: 'smooth' });

//         } catch (error) { console.error('Error loading edit:', error); Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load details', confirmButtonText: 'OK' }); }
//     };

//     const handleDelete = async (guardDutyId) => {
//         if (!permissions.canDelete) { Swal.fire({ icon: 'warning', title: 'Permission Denied', text: 'You do not have permission to delete.', confirmButtonText: 'OK' }); return; }
//         const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc3545', cancelButtonColor: '#6c757d', confirmButtonText: 'Yes, delete it!', cancelButtonText: 'Cancel' });
//         if (!result.isConfirmed) return;

//         try {
//             const accessToken = sessionStorage.getItem('access_token');
//             const response = await fetch(`${API_BASE_URL}/Incharge/DeleteIncharge`, { 
//                 method: 'DELETE', 
//                 headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, 
//                 body: JSON.stringify({ guard_duty_id: guardDutyId }) 
//             });
//             const apiResult = await response.json();
            
//             if (response.ok && apiResult.success && Number(apiResult.data?.result_code) === 3) {
//                 Swal.fire({ title: 'Deleted!', text: 'Incharge has been removed.', icon: 'success', timer: 2000, timerProgressBar: false, showConfirmButton: false });
                
//                 // 1. Refresh Grid
//                 if (formData.miqaat?.value) fetchInchargesByMiqaat(formData.miqaat.value);

//                 // 2. Refresh Members Dropdown if a team is selected (so the deleted member reappears in the list)
//                 if (formData.team?.value && formData.miqaat?.value) {
//                     fetchTeamMembersForIncharge(formData.team.value, formData.miqaat.value);
//                 }

//             } else { throw new Error(apiResult.message || 'Failed to delete'); }
//         } catch (error) { console.error('Error deleting:', error); Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'An error occurred', confirmButtonText: 'OK' }); }
//     };

//     const handleCancel = () => {
//         setFormData(prev => ({ ...prev, jamiaat: null, location: null, team: null, member: null }));
//         setIsEditMode(false);
//         setEditingInchargeId(null);
//         setErrors({});
//         setMemberOptions([]);
        
//         if (jamiaatOptions.length > 0) fetchTeamOptions(null);
//     };

//     const handleClear = () => {
//         setFormData({ miqaat: null, jamiaat: null, location: null, team: null, member: null });
//         setErrors({});
//         setLocationOptions([]);
//         setMemberOptions([]);
//         setTeamOptions([]);
//         setIncharges([]);
//         setShowInchargesTable(false);
//         setShowFormSections(false);
//         setIsEditMode(false);
//         setEditingInchargeId(null);
//     };

//     const selectStyles = { control: (base, state) => ({ ...base, minHeight: '38px', borderColor: state.selectProps.error ? '#dc3545' : (state.isFocused ? '#0d6efd' : '#dee2e6'), borderWidth: '2px', borderRadius: '8px', boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.15)' : 'none', '&:hover': { borderColor: state.selectProps.error ? '#dc3545' : '#adb5bd' } }), placeholder: (base) => ({ ...base, color: '#6c757d', fontSize: '15px' }), singleValue: (base) => ({ ...base, fontSize: '15px' }), dropdownIndicator: (base) => ({ ...base, color: '#0d6efd', '&:hover': { color: '#0b5ed7' } }), menu: (base) => ({ ...base, zIndex: 1000 }) };

//     if (checkingPermissions) {
//         return (
//             <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', gap: '20px' }}>
//                 <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}><span className="visually-hidden">Loading...</span></div>
//                 <p style={{ fontSize: '16px', color: '#666' }}>Checking access permissions...</p>
//             </div>
//         );
//     }

//     if (!permissions.hasAccess) { return null; }

//     return (
//         <Fragment>
//             <div style={{ margin: '20px auto', maxWidth: '100%' }}>
//                 <Row>
//                     <Col xl={12}>
//                         <Card className="custom-card">
//                             <Card.Body>
//                                 <style>{`.edit-mode-badge{background:#ffc107;color:#000;padding:6px 15px;border-radius:20px;font-size:14px;font-weight:500}.quota-container{width:100%}.quota-display{height:38px;padding:0 15px;border:2px solid #dee2e6;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;background:#f8f9fa}.quota-loading{display:flex;align-items:center;gap:8px;color:#0d6efd}.quota-value{font-weight:600;font-size:16px;color:#495057;display:flex;align-items:center}.quota-placeholder{color:#6c757d;font-style:italic}.form-label{font-weight:500;font-size:14px;color:#495057;margin-bottom:8px;display:block}.form-label .text-danger{color:#dc3545;margin-left:4px}.error-text{color:#dc3545;font-size:13px;margin-top:6px;display:block}.form-input{width:100%;height:38px;padding:0 15px;border:2px solid #dee2e6;border-radius:8px;font-size:15px;transition:all .2s}.form-input:focus{outline:none;border-color:#0d6efd;box-shadow:0 0 0 .2rem rgba(13,110,253,.15)}.form-input.is-invalid{border-color:#dc3545}.button-row{display:flex;gap:15px;margin-top:20px;justify-content:center;align-items:center}.save-button{height:38px;padding:0 35px;background:#0d6efd;border:none;border-radius:8px;color:#fff;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;justify-content:center}.save-button:hover:not(:disabled){background:#0b5ed7;transform:translateY(-1px);box-shadow:0 4px 12px rgba(13,110,253,.3)}.save-button:active:not(:disabled){transform:translateY(0)}.save-button:disabled{opacity:.6;cursor:not-allowed}.save-button.update-mode{background:#28a745}.save-button.update-mode:hover:not(:disabled){background:#218838}.cancel-edit-button{height:38px;padding:0 35px;background:#ffc107;border:none;border-radius:8px;color:#000;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;justify-content:center}.cancel-edit-button:hover:not(:disabled){background:#e0a800}.spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.clear-button{padding:0 20px;background:#6c757d;border:none;border-radius:8px;color:#fff;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;height:38px}.clear-button:hover:not(:disabled){background:#5c636a}.clear-button:disabled{opacity:.6;cursor:not-allowed}.team-count-info{margin-top:8px;font-size:13px;color:#6c757d;display:flex;align-items:center;gap:5px}.team-count-info.loading{color:#0d6efd}.duties-table-container{margin-top:40px;border-top:2px solid #dee2e6;padding-top:30px}.table-title{font-size:18px;font-weight:600;margin-bottom:20px;color:#333;display:flex;align-items:center;gap:10px}.duties-table-wrapper{overflow-x:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1)}.duties-table{width:100%;border-collapse:collapse;background:#fff;border:2px solid #dee2e6}.duties-table thead{background:#fff;color:#000;border-bottom:2px solid #dee2e6}.duties-table th{padding:15px;text-align:left;font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:.5px;border-right:1px solid #dee2e6}.duties-table th:last-child{border-right:none}.duties-table tbody tr{border-bottom:1px solid #dee2e6;transition:background-color .2s}.duties-table tbody tr:hover{background-color:#f8f9fa}.duties-table tbody tr:last-child{border-bottom:none}.duties-table td{padding:15px;font-size:14px;color:#495057;border-right:1px solid #dee2e6}.duties-table td:last-child{border-right:none}.action-buttons{display:flex;gap:10px;align-items:center}.icon-button{width:36px;height:36px;border:none;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .2s;font-size:16px}.edit-icon-button{background:#0d6efd;color:#fff}.edit-icon-button:hover{background:#0b5ed7;transform:translateY(-2px);box-shadow:0 4px 8px rgba(13,110,253,.3)}.delete-icon-button{background:#dc3545;color:#fff}.delete-icon-button:hover{background:#c82333;transform:translateY(-2px);box-shadow:0 4px 8px rgba(220,53,69,.3)}.no-duties-message{text-align:center;padding:40px 20px;color:#6c757d;font-size:15px}.no-duties-icon{font-size:48px;margin-bottom:15px;opacity:.5}.loading-duties{text-align:center;padding:40px 20px;color:#0d6efd}.loading-spinner{width:40px;height:40px;border:4px solid rgba(13,110,253,.1);border-top-color:#0d6efd;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 15px}@media (max-width:768px){.button-row{flex-direction:column;width:100%}.save-button,.cancel-edit-button,.clear-button{width:100%}.duties-table-wrapper{overflow-x:scroll}.duties-table th,.duties-table td{padding:10px;font-size:13px}}`}</style>

//                                 <div className="page-header-title">
//                                     <div className="header-text"><i className="ri-shield-user-line"></i><span>Miqaat Incharge</span></div>
//                                     {isEditMode && (<span className="edit-mode-badge"><i className="ri-edit-line me-1"></i>Edit Mode</span>)}
//                                 </div>

//                                 {/* Miqaat Selection Row */}
//                                 <Row className="mb-3">
//                                     <Col md={6}>
//                                         <div className="miqaat-dropdown-container">
//                                             <label className="form-label">Miqaat <span className="text-danger">*</span></label>
//                                             <Select options={miqaatOptions} value={formData.miqaat} onChange={handleMiqaatChange} placeholder="Select Miqaat" isClearable styles={selectStyles} error={errors.miqaat} isDisabled={loading || isEditMode} isLoading={loadingMiqaat} />
//                                             {errors.miqaat && <span className="error-text">{errors.miqaat}</span>}
//                                         </div>
//                                     </Col>
//                                 </Row>

//                                 {/* Form Sections */}
//                                 {showFormSections && (
//                                     <>
//                                         {/* Row 2: Jamiaat and Team */}
//                                         <Row className="mb-3">
//                                             <Col md={6}>
//                                                 <label className="form-label">Jamiaat</label>
//                                                 <Select options={jamiaatOptions} value={formData.jamiaat} onChange={handleJamiaatChange} placeholder={loadingJamiaat ? "Loading..." : "Select Jamiaat"} isClearable styles={selectStyles} error={errors.jamiaat} isDisabled={loading} isLoading={loadingJamiaat} />
//                                                 {errors.jamiaat && <span className="error-text">{errors.jamiaat}</span>}
//                                             </Col>

//                                             <Col md={6}>
//                                                 <label className="form-label">Team <span className="text-danger">*</span></label>
//                                                 <Select options={teamOptions} value={formData.team} onChange={handleTeamChange} placeholder={loadingTeams ? "Loading..." : "Select Team"} isClearable styles={selectStyles} error={errors.team} isDisabled={loading || loadingTeams || !formData.miqaat} isLoading={loadingTeams} noOptionsMessage={() => "No teams found"} />
//                                                 {errors.team && <span className="error-text">{errors.team}</span>}
//                                             </Col>
//                                         </Row>

//                                         {/* Row 3: Location and Member */}
//                                         <Row className="mb-3">
//                                             <Col md={6}>
//                                                 <label className="form-label">Location <span className="text-danger">*</span></label>
//                                                 <Select options={locationOptions} value={formData.location} onChange={handleLocationChange} placeholder={loadingLocations ? "Loading..." : "Select Location"} isClearable styles={selectStyles} error={errors.location} isDisabled={loading || !formData.miqaat} isLoading={loadingLocations} noOptionsMessage={() => "No locations found"} />
//                                                 {errors.location && <span className="error-text">{errors.location}</span>}
//                                             </Col>

//                                             <Col md={6}>
//                                                 <label className="form-label">Member <span className="text-danger">*</span></label>
//                                                 <Select options={memberOptions} value={formData.member} onChange={handleMemberChange} placeholder={loadingMembers ? "Loading..." : "Select Member"} isClearable styles={selectStyles} error={errors.member} isDisabled={loading || !formData.team} isLoading={loadingMembers} noOptionsMessage={() => "No members found"} />
//                                                 {errors.member && <span className="error-text">{errors.member}</span>}
//                                             </Col>
//                                         </Row>

//                                         <div className="button-row">
//                                             {isEditMode ? (
//                                                 <>
//                                                     <button className="save-button update-mode" onClick={handleSave} disabled={loading}>{loading ? (<><span className="spinner"></span>Updating...</>) : (<><i className="ri-save-line"></i>Update</>)}</button>
//                                                     <button className="cancel-edit-button" onClick={handleCancel} disabled={loading}><i className="ri-close-line"></i>Cancel</button>
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <button className="save-button" onClick={handleSave} disabled={loading || !permissions.canAdd}>{loading ? (<><span className="spinner"></span>Saving...</>) : (<><i className="ri-save-line"></i>Save Incharge</>)}</button>
//                                                     <button className="clear-button" onClick={handleClear} disabled={loading}><i className="ri-refresh-line me-2"></i>Clear Form</button>
//                                                 </>
//                                             )}
//                                         </div>
//                                     </>
//                                 )}

//                                 {/* Data Grid */}
//                                 {showInchargesTable && (
//                                     <div className="duties-table-container">
//                                         <div className="table-title"><i className="ri-table-line"></i>Incharges List</div>
//                                         {loadingGrid ? (<div className="loading-duties"><div className="loading-spinner"></div><div>Loading incharges...</div></div>) : incharges.length > 0 ? (
//                                             <div className="duties-table-wrapper">
//                                                 <table className="duties-table">
//                                                     <thead><tr><th>SR NO</th><th>ITS ID</th><th>NAME</th><th>VENUE</th><th>LOCATION</th><th>TEAM</th><th>ACTIONS</th></tr></thead>
//                                                     <tbody>
//                                                         {incharges.map((incharge, index) => (
//                                                             <tr key={incharge.guard_duty_id}>
//                                                                 <td>{index + 1}</td>
//                                                                 <td>{incharge.its_id}</td>
//                                                                 <td>{incharge.full_name}</td>
//                                                                 <td>{incharge.venue_name}</td>
//                                                                 <td>{incharge.location_name || 'N/A'}</td>
//                                                                 <td>{incharge.team_name}</td>
//                                                                 <td>
//                                                                     <div className="action-buttons">
//                                                                         {permissions.canEdit && (<button className="icon-button edit-icon-button" onClick={() => handleEdit(incharge)} title="Edit"><i className="ri-edit-line"></i></button>)}
//                                                                         {permissions.canDelete && (<button className="icon-button delete-icon-button" onClick={() => handleDelete(incharge.guard_duty_id)} title="Delete"><i className="ri-delete-bin-line"></i></button>)}
//                                                                     </div>
//                                                                 </td>
//                                                             </tr>
//                                                         ))}
//                                                     </tbody>
//                                                 </table>
//                                             </div>
//                                         ) : (<div className="no-duties-message"><div className="no-duties-icon">📋</div><div>No incharges found for this miqaat.</div></div>)}
//                                     </div>
//                                 )}
//                             </Card.Body>
//                         </Card>
//                     </Col>
//                 </Row>
//             </div>
//         </Fragment>
//     );
// };

// export default MiqaatIncharge;


import React, { useState, useEffect, Fragment } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom'; // ADD THIS
import '../../styles/shared-styles.css'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
const MODULE_ID = '111';

const MiqaatIncharge = () => {
    // ============================================================================
    // ROUTER HOOKS
    // ============================================================================
    const location = useLocation();
    const navigate = useNavigate();

    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    const [checkingPermissions, setCheckingPermissions] = useState(true);
    const [permissions, setPermissions] = useState({ canAdd: false, canEdit: false, canDelete: false, hasAccess: false });
    
    // NEW: Incoming miqaat from navigation
    const [incomingMiqaat, setIncomingMiqaat] = useState(null);
    const [showInfoBanner, setShowInfoBanner] = useState(false);
    
    // Form Data
    const [formData, setFormData] = useState({ miqaat: null, jamiaat: null, location: null, team: null, member: null });
    
    // UI State
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingInchargeId, setEditingInchargeId] = useState(null);
    const [showFormSections, setShowFormSections] = useState(false);
    const [showInchargesTable, setShowInchargesTable] = useState(false);

    // Data & Options
    const [miqaatOptions, setMiqaatOptions] = useState([]);
    const [jamiaatOptions, setJamiaatOptions] = useState([]); 
    const [locationOptions, setLocationOptions] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [memberOptions, setMemberOptions] = useState([]);
    const [incharges, setIncharges] = useState([]);

    // Loading States
    const [loading, setLoading] = useState(false);
    const [loadingMiqaat, setLoadingMiqaat] = useState(false);
    const [loadingJamiaat, setLoadingJamiaat] = useState(false);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [loadingGrid, setLoadingGrid] = useState(false);

    const [errors, setErrors] = useState({});

    // ============================================================================
    // NEW: DETECT INCOMING NAVIGATION
    // ============================================================================
    // useEffect(() => {
    //     // Check if we received miqaat data from navigation
    //     if (location.state?.fromMiqaatCreation && location.state?.miqaatId) {
    //         setIncomingMiqaat({
    //             miqaatId: location.state.miqaatId,
    //             miqaatName: location.state.miqaatName,
    //             venueId: location.state.venueId
    //         });
    //         setShowInfoBanner(true);
    //     }
    // }, [location.state]);

//     useEffect(() => {
//     // Check if we received miqaat data from navigation
//     if (location.state?.fromMiqaatCreation && location.state?.miqaatId) {
//         console.log('🎯 Navigation detected from Miqaat creation!');
//         console.log('📦 Incoming miqaat ID:', location.state.miqaatId);
        
//         setIncomingMiqaat({
//             miqaatId: location.state.miqaatId,
//             miqaatName: location.state.miqaatName,
//             venueId: location.state.venueId
//         });
//         setShowInfoBanner(true);
        
//         // 🔥 CRITICAL: Refresh miqaat options to include the newly created miqaat
//         console.log('🔄 Refreshing miqaat options...');
//         fetchMiqaatOptions();
//     }
// }, [location.state]);\

useEffect(() => {
    console.log('🚀 Navigation detection useEffect triggered');
    console.log('📦 location.state:', location.state);
    console.log('   - fromMiqaatCreation:', location.state?.fromMiqaatCreation);
    console.log('   - miqaatId:', location.state?.miqaatId);
    console.log('   - miqaatName:', location.state?.miqaatName);
    console.log('   - venueId:', location.state?.venueId);
    
    // Check if we received miqaat data from navigation
    if (location.state?.fromMiqaatCreation && location.state?.miqaatId) {
        console.log('✅ Navigation state detected! Setting incomingMiqaat...');
        
        setIncomingMiqaat({
            miqaatId: location.state.miqaatId,
            miqaatName: location.state.miqaatName,
            venueId: location.state.venueId
        });
        // setShowInfoBanner(true);
        
        // Refresh miqaat options to include the newly created miqaat
        console.log('🔄 Calling fetchMiqaatOptions...');
        fetchMiqaatOptions();
        
        console.log('✅ incomingMiqaat state should be set now');
    } else {
        console.log('❌ Navigation state NOT detected or incomplete');
        console.log('   Condition check:', {
            hasFromMiqaatCreation: !!location.state?.fromMiqaatCreation,
            hasMiqaatId: !!location.state?.miqaatId,
            bothTrue: !!(location.state?.fromMiqaatCreation && location.state?.miqaatId)
        });
    }
}, [location.state]);

    // ============================================================================
    // NEW: PRESELECT MIQAAT WHEN OPTIONS LOAD
    // ============================================================================
    // useEffect(() => {
    //     if (incomingMiqaat && miqaatOptions.length > 0) {
    //         // Find the miqaat in options
    //         const targetMiqaat = miqaatOptions.find(
    //             opt => opt.value === incomingMiqaat.miqaatId
    //         );
            
    //         if (targetMiqaat) {
    //             // Trigger the miqaat change handler
    //             handleMiqaatChange(targetMiqaat);
                
    //             // Clear incoming state so it doesn't re-trigger
    //             setIncomingMiqaat(null);
    //         } else {
    //             // Miqaat not found
    //             Swal.fire({
    //                 icon: 'warning',
    //                 title: 'Miqaat Not Found',
    //                 text: 'The selected miqaat was not found. Please select a miqaat manually.',
    //                 confirmButtonText: 'OK'
    //             });
    //             setShowInfoBanner(false);
    //             setIncomingMiqaat(null);
    //         }
    //     }
    // }, [incomingMiqaat, miqaatOptions]);

    useEffect(() => {
    console.log('🔍 Preselection useEffect triggered');
    console.log('   - incomingMiqaat:', incomingMiqaat);
    console.log('   - miqaatOptions:', miqaatOptions);
    
    if (incomingMiqaat && miqaatOptions.length > 0) {
        console.log('✅ Both conditions met, searching...');
        console.log('🔎 Looking for miqaat_id:', incomingMiqaat.miqaatId, 'Type:', typeof incomingMiqaat.miqaatId);
        
        // Find the miqaat in options (use == for type coercion)
        const targetMiqaat = miqaatOptions.find(
            opt => {
                console.log('  Comparing:', opt.value, 'vs', incomingMiqaat.miqaatId);
                return opt.value == incomingMiqaat.miqaatId; // Use == instead of ===
            }
        );
        
        console.log('🎯 Target miqaat found:', targetMiqaat);
        
        if (targetMiqaat) {
            console.log('✅ Calling handleMiqaatChange');
            handleMiqaatChange(targetMiqaat);
            setIncomingMiqaat(null);
            console.log('✅ Preselection complete!');
        } else {
            console.log('❌ Miqaat not found!');
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
    // AUTHENTICATION & PERMISSIONS
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
            Swal.fire({ icon: 'error', title: 'Session Expired', text: 'Your session has expired. Please log in again.', confirmButtonText: 'OK' }).then(() => { window.location.href = '/login'; });
            return;
        }

        const checkModuleAccessLocal = (accessRightsString, moduleId) => {
            try {
                const rights = JSON.parse(accessRightsString);
                const moduleAccess = rights.find(module => module.module_id === moduleId);
                if (!moduleAccess) return { hasAccess: false, canAdd: false, canEdit: false, canDelete: false };
                return {
                    hasAccess: true,
                    canAdd: moduleAccess.can_add === true || moduleAccess.can_add === 1,
                    canEdit: moduleAccess.can_edit === true || moduleAccess.can_edit === 1,
                    canDelete: moduleAccess.can_delete === true || moduleAccess.can_delete === 1
                };
            } catch (error) {
                console.error('Error parsing rights', error);
                return { hasAccess: false, canAdd: false, canEdit: false, canDelete: false };
            }
        };

        const modulePermissions = checkModuleAccessLocal(accessRights, MODULE_ID);
        
        if (!modulePermissions.hasAccess) {
             Swal.fire({ icon: 'warning', title: 'Access Denied', text: 'You do not have permission to access this module.', confirmButtonText: 'OK' }).then(() => { window.location.href = '/dashboard'; });
             return;
        }
        
        setPermissions(modulePermissions);
        setCheckingPermissions(false);
        fetchInitialData();
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
        } catch (error) { console.error('Error fetching miqaat options:', error); } 
        finally { setLoadingMiqaat(false); }
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
                } else { setJamiaatOptions([]); }
            }
        } catch (error) { console.error('Error fetching jamiaat options:', error); setJamiaatOptions([]); } 
        finally { setLoadingJamiaat(false); }
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
                } else { setTeamOptions([]); }
            }
        } catch (error) { console.error('Error fetching teams:', error); setTeamOptions([]); } 
        finally { setLoadingTeams(false); }
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
                } else { setLocationOptions([]); }
            }
        } catch (error) { console.error('Error fetching locations:', error); setLocationOptions([]); } 
        finally { setLoadingLocations(false); }
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
                } else { setMemberOptions([]); }
            }
        } catch (error) { console.error('Error fetching members:', error); setMemberOptions([]); } 
        finally { setLoadingMembers(false); }
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
                } else { 
                    setIncharges([]); 
                    setShowInchargesTable(true); 
                }
            }
        } catch (error) { console.error('Error fetching incharges:', error); setIncharges([]); } 
        finally { setLoadingGrid(false); }
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
        } catch (error) { console.error('Error fetching incharge details:', error); return null; }
    };

    // ============================================================================
    // HANDLERS
    // ============================================================================

    const handleMiqaatChange = (selectedOption) => {
        // NEW: Clear info banner when user manually changes miqaat
        if (showInfoBanner && formData.miqaat !== null) {
            setShowInfoBanner(false);
        }

        setFormData(prev => ({ ...prev, miqaat: selectedOption, jamiaat: null, location: null, team: null, member: null }));
        setErrors({});
        setLocationOptions([]);
        setMemberOptions([]);
        
        if (selectedOption?.value) {
            setShowFormSections(true);
            fetchJamiaatOptions();
            fetchTeamOptions(null); 

            if (selectedOption.venue_id) {
                fetchLocationsByVenue(selectedOption.venue_id);
                fetchInchargesByMiqaat(selectedOption.value);
            }
        } else {
            setShowFormSections(false);
            setIncharges([]);
            setShowInchargesTable(false);
            setJamiaatOptions([]);
            setTeamOptions([]);
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
        setFormData(prev => ({ ...prev, location: selectedOption }));
        if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
    };

    const handleMemberChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, member: selectedOption }));
        if (errors.member) setErrors(prev => ({ ...prev, member: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.miqaat) newErrors.miqaat = 'Please select a Miqaat';
        if (!formData.team) newErrors.team = 'Please select a Team';
        if (!formData.location) newErrors.location = 'Please select a Location';
        if (!formData.member) newErrors.member = 'Please select a Member';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!isEditMode && !permissions.canAdd) { Swal.fire({ icon: 'warning', title: 'Permission Denied', text: 'You do not have permission to add.', confirmButtonText: 'OK' }); return; }
        if (isEditMode && !permissions.canEdit) { Swal.fire({ icon: 'warning', title: 'Permission Denied', text: 'You do not have permission to edit.', confirmButtonText: 'OK' }); return; }
        if (!validateForm()) return;

        setLoading(true);
        try {
            const accessToken = sessionStorage.getItem('access_token');
            let response, apiEndpoint, requestBody;

            if (isEditMode) {
                apiEndpoint = `${API_BASE_URL}/Incharge/UpdateIncharge`;
                requestBody = {
                    guard_duty_id: editingInchargeId,
                    miqaat_id: formData.miqaat.value,
                    its_id: formData.member.value,
                    location_id: formData.location.value
                };
                response = await fetch(apiEndpoint, { method: 'PUT', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: JSON.stringify(requestBody) });
            } else {
                apiEndpoint = `${API_BASE_URL}/Incharge/InsertIncharge`;
                requestBody = {
                    miqaat_id: formData.miqaat.value,
                    its_id: formData.member.value,
                    location_id: formData.location.value
                };
                response = await fetch(apiEndpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: JSON.stringify(requestBody) });
            }

            const result = await response.json();
            if (response.ok) {
                const resultCode = Number(result.data?.result_code);
                
                if ((isEditMode && resultCode === 2) || (!isEditMode && resultCode === 1)) {
                    Swal.fire({ title: 'Success!', text: result.message || (isEditMode ? 'Updated successfully!' : 'Added successfully!'), icon: 'success', timer: 2000, timerProgressBar: false, showConfirmButton: false });
                    
                    if (formData.miqaat?.value) fetchInchargesByMiqaat(formData.miqaat.value);

                    if (isEditMode) {
                        setTimeout(() => handleCancel(), 2000);
                    } else {
                        setFormData(prev => ({ ...prev, member: null }));
                        if (formData.team?.value && formData.miqaat?.value) {
                             fetchTeamMembersForIncharge(formData.team.value, formData.miqaat.value);
                        }
                    }

                } else if (resultCode === 4) {
                    Swal.fire({ icon: 'warning', title: 'Duplicate Entry', text: 'This member is already an incharge for this miqaat', confirmButtonText: 'OK' });
                } else {
                    Swal.fire({ icon: 'error', title: 'Failed', text: result.message || 'Operation failed', confirmButtonText: 'OK' });
                }
            } else { throw new Error(result.message || `Server error: ${response.status}`); }
        } catch (error) { console.error('Error saving:', error); Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'An error occurred', confirmButtonText: 'OK' }); } 
        finally { setLoading(false); }
    };

    const handleEdit = async (incharge) => {
        if (!permissions.canEdit) { Swal.fire({ icon: 'warning', title: 'Permission Denied', text: 'You do not have permission to edit.', confirmButtonText: 'OK' }); return; }
        
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

            setFormData({
                miqaat: selectedMiqaat,
                jamiaat: null, 
                team: selectedTeam,
                location: { value: inchargeDetails.location_id, label: inchargeDetails.location_name },
                member: { value: inchargeDetails.its_id, label: `${inchargeDetails.full_name} (${inchargeDetails.its_id})` }
            });

            setIsEditMode(true);
            setEditingInchargeId(incharge.guard_duty_id);
            
            // NEW: Clear info banner when editing
            setShowInfoBanner(false);
            
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) { console.error('Error loading edit:', error); Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load details', confirmButtonText: 'OK' }); }
    };

    const handleDelete = async (guardDutyId) => {
        if (!permissions.canDelete) { Swal.fire({ icon: 'warning', title: 'Permission Denied', text: 'You do not have permission to delete.', confirmButtonText: 'OK' }); return; }
        const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc3545', cancelButtonColor: '#6c757d', confirmButtonText: 'Yes, delete it!', cancelButtonText: 'Cancel' });
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
                Swal.fire({ title: 'Deleted!', text: 'Incharge has been removed.', icon: 'success', timer: 2000, timerProgressBar: false, showConfirmButton: false });
                
                if (formData.miqaat?.value) fetchInchargesByMiqaat(formData.miqaat.value);

                if (formData.team?.value && formData.miqaat?.value) {
                    fetchTeamMembersForIncharge(formData.team.value, formData.miqaat.value);
                }

            } else { throw new Error(apiResult.message || 'Failed to delete'); }
        } catch (error) { console.error('Error deleting:', error); Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'An error occurred', confirmButtonText: 'OK' }); }
    };

    const handleCancel = () => {
        setFormData(prev => ({ ...prev, jamiaat: null, location: null, team: null, member: null }));
        setIsEditMode(false);
        setEditingInchargeId(null);
        setErrors({});
        setMemberOptions([]);
        
        if (jamiaatOptions.length > 0) fetchTeamOptions(null);
    };

    const handleClear = () => {
        setFormData({ miqaat: null, jamiaat: null, location: null, team: null, member: null });
        setErrors({});
        setLocationOptions([]);
        setMemberOptions([]);
        setTeamOptions([]);
        setIncharges([]);
        setShowInchargesTable(false);
        setShowFormSections(false);
        setIsEditMode(false);
        setEditingInchargeId(null);
        setShowInfoBanner(false); // NEW: Clear banner on form clear
    };

    const selectStyles = { control: (base, state) => ({ ...base, minHeight: '38px', borderColor: state.selectProps.error ? '#dc3545' : (state.isFocused ? '#0d6efd' : '#dee2e6'), borderWidth: '2px', borderRadius: '8px', boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.15)' : 'none', '&:hover': { borderColor: state.selectProps.error ? '#dc3545' : '#adb5bd' } }), placeholder: (base) => ({ ...base, color: '#6c757d', fontSize: '15px' }), singleValue: (base) => ({ ...base, fontSize: '15px' }), dropdownIndicator: (base) => ({ ...base, color: '#0d6efd', '&:hover': { color: '#0b5ed7' } }), menu: (base) => ({ ...base, zIndex: 1000 }) };

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
                                    
                                    .edit-mode-badge{background:#ffc107;color:#000;padding:6px 15px;border-radius:20px;font-size:14px;font-weight:500}.quota-container{width:100%}.quota-display{height:38px;padding:0 15px;border:2px solid #dee2e6;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;background:#f8f9fa}.quota-loading{display:flex;align-items:center;gap:8px;color:#0d6efd}.quota-value{font-weight:600;font-size:16px;color:#495057;display:flex;align-items:center}.quota-placeholder{color:#6c757d;font-style:italic}.form-label{font-weight:500;font-size:14px;color:#495057;margin-bottom:8px;display:block}.form-label .text-danger{color:#dc3545;margin-left:4px}.error-text{color:#dc3545;font-size:13px;margin-top:6px;display:block}.form-input{width:100%;height:38px;padding:0 15px;border:2px solid #dee2e6;border-radius:8px;font-size:15px;transition:all .2s}.form-input:focus{outline:none;border-color:#0d6efd;box-shadow:0 0 0 .2rem rgba(13,110,253,.15)}.form-input.is-invalid{border-color:#dc3545}.button-row{display:flex;gap:15px;margin-top:20px;justify-content:center;align-items:center}.save-button{height:38px;padding:0 35px;background:#0d6efd;border:none;border-radius:8px;color:#fff;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;justify-content:center}.save-button:hover:not(:disabled){background:#0b5ed7;transform:translateY(-1px);box-shadow:0 4px 12px rgba(13,110,253,.3)}.save-button:active:not(:disabled){transform:translateY(0)}.save-button:disabled{opacity:.6;cursor:not-allowed}.save-button.update-mode{background:#28a745}.save-button.update-mode:hover:not(:disabled){background:#218838}.cancel-edit-button{height:38px;padding:0 35px;background:#ffc107;border:none;border-radius:8px;color:#000;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;justify-content:center}.cancel-edit-button:hover:not(:disabled){background:#e0a800}.spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.clear-button{padding:0 20px;background:#6c757d;border:none;border-radius:8px;color:#fff;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;height:38px}.clear-button:hover:not(:disabled){background:#5c636a}.clear-button:disabled{opacity:.6;cursor:not-allowed}.team-count-info{margin-top:8px;font-size:13px;color:#6c757d;display:flex;align-items:center;gap:5px}.team-count-info.loading{color:#0d6efd}.duties-table-container{margin-top:40px;border-top:2px solid #dee2e6;padding-top:30px}.table-title{font-size:18px;font-weight:600;margin-bottom:20px;color:#333;display:flex;align-items:center;gap:10px}.duties-table-wrapper{overflow-x:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1)}.duties-table{width:100%;border-collapse:collapse;background:#fff;border:2px solid #dee2e6}.duties-table thead{background:#fff;color:#000;border-bottom:2px solid #dee2e6}.duties-table th{padding:15px;text-align:left;font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:.5px;border-right:1px solid #dee2e6}.duties-table th:last-child{border-right:none}.duties-table tbody tr{border-bottom:1px solid #dee2e6;transition:background-color .2s}.duties-table tbody tr:hover{background-color:#f8f9fa}.duties-table tbody tr:last-child{border-bottom:none}.duties-table td{padding:15px;font-size:14px;color:#495057;border-right:1px solid #dee2e6}.duties-table td:last-child{border-right:none}.action-buttons{display:flex;gap:10px;align-items:center}.icon-button{width:36px;height:36px;border:none;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .2s;font-size:16px}.edit-icon-button{background:#0d6efd;color:#fff}.edit-icon-button:hover{background:#0b5ed7;transform:translateY(-2px);box-shadow:0 4px 8px rgba(13,110,253,.3)}.delete-icon-button{background:#dc3545;color:#fff}.delete-icon-button:hover{background:#c82333;transform:translateY(-2px);box-shadow:0 4px 8px rgba(220,53,69,.3)}.no-duties-message{text-align:center;padding:40px 20px;color:#6c757d;font-size:15px}.no-duties-icon{font-size:48px;margin-bottom:15px;opacity:.5}.loading-duties{text-align:center;padding:40px 20px;color:#0d6efd}.loading-spinner{width:40px;height:40px;border:4px solid rgba(13,110,253,.1);border-top-color:#0d6efd;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 15px}@media (max-width:768px){.button-row{flex-direction:column;width:100%}.save-button,.cancel-edit-button,.clear-button{width:100%}.duties-table-wrapper{overflow-x:scroll}.duties-table th,.duties-table td{padding:10px;font-size:13px}}
                                `}</style>

                                <div className="page-header-title">
                                    <div className="header-text"><i className="ri-shield-user-line"></i><span>Miqaat Incharge</span></div>
                                    {isEditMode && (<span className="edit-mode-badge"><i className="ri-edit-line me-1"></i>Edit Mode</span>)}
                                </div>

                                {/* NEW: Info Banner */}
                                {showInfoBanner && formData.miqaat && (
                                    <div className="info-banner">
                                        <div className="info-banner-content">
                                            <i className="ri-information-line info-banner-icon"></i>
                                            <div className="info-banner-text">
                                                Add incharges for <strong>{formData.miqaat.label}</strong>
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
                                            <Select options={miqaatOptions} value={formData.miqaat} onChange={handleMiqaatChange} placeholder="Select Miqaat" isClearable styles={selectStyles} error={errors.miqaat} isDisabled={loading || isEditMode} isLoading={loadingMiqaat} />
                                            {errors.miqaat && <span className="error-text">{errors.miqaat}</span>}
                                        </div>
                                    </Col>
                                </Row>

                                {/* Form Sections */}
                                {showFormSections && (
                                    <>
                                        {/* Row 2: Jamiaat and Team */}
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <label className="form-label">Location <span className="text-danger">*</span></label>
                                                <Select options={locationOptions} value={formData.location} onChange={handleLocationChange} placeholder={loadingLocations ? "Loading..." : "Select Location"} isClearable styles={selectStyles} error={errors.location} isDisabled={loading || !formData.miqaat} isLoading={loadingLocations} noOptionsMessage={() => "No locations found"} />
                                                {errors.location && <span className="error-text">{errors.location}</span>}
                                            </Col>

                                            <Col md={6}>
                                                <label className="form-label">Jamiaat</label>
                                                <Select options={jamiaatOptions} value={formData.jamiaat} onChange={handleJamiaatChange} placeholder={loadingJamiaat ? "Loading..." : "Select Jamiaat"} isClearable styles={selectStyles} error={errors.jamiaat} isDisabled={loading} isLoading={loadingJamiaat} />
                                                {errors.jamiaat && <span className="error-text">{errors.jamiaat}</span>}
                                            </Col>


                                        </Row>

                                        {/* Row 3: Location and Member */}
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <label className="form-label">Team <span className="text-danger">*</span></label>
                                                <Select options={teamOptions} value={formData.team} onChange={handleTeamChange} placeholder={loadingTeams ? "Loading..." : "Select Team"} isClearable styles={selectStyles} error={errors.team} isDisabled={loading || loadingTeams || !formData.miqaat} isLoading={loadingTeams} noOptionsMessage={() => "No teams found"} />
                                                {errors.team && <span className="error-text">{errors.team}</span>}
                                            </Col>

                                            <Col md={6}>
                                                <label className="form-label">Member <span className="text-danger">*</span></label>
                                                <Select options={memberOptions} value={formData.member} onChange={handleMemberChange} placeholder={loadingMembers ? "Loading..." : "Select Member"} isClearable styles={selectStyles} error={errors.member} isDisabled={loading || !formData.team} isLoading={loadingMembers} noOptionsMessage={() => "No members found"} />
                                                {errors.member && <span className="error-text">{errors.member}</span>}
                                            </Col>
                                        </Row>

                                        <div className="button-row">
                                            {isEditMode ? (
                                                <>
                                                    <button className="save-button update-mode" onClick={handleSave} disabled={loading}>{loading ? (<><span className="spinner"></span>Updating...</>) : (<><i className="ri-save-line"></i>Update</>)}</button>
                                                    <button className="cancel-edit-button" onClick={handleCancel} disabled={loading}><i className="ri-close-line"></i>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="save-button" onClick={handleSave} disabled={loading || !permissions.canAdd}>{loading ? (<><span className="spinner"></span>Saving...</>) : (<><i className="ri-save-line"></i>Save Incharge</>)}</button>
                                                    <button className="clear-button" onClick={handleClear} disabled={loading}><i className="ri-refresh-line me-2"></i>Clear Form</button>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Data Grid */}
                                {showInchargesTable && (
                                    <div className="duties-table-container">
                                        <div className="table-title"><i className="ri-table-line"></i>Incharges List</div>
                                        {loadingGrid ? (<div className="loading-duties"><div className="loading-spinner"></div><div>Loading incharges...</div></div>) : incharges.length > 0 ? (
                                            <div className="duties-table-wrapper">
                                                <table className="duties-table">
                                                    <thead><tr><th>SR NO</th><th>ITS ID</th><th>NAME</th><th>VENUE</th><th>LOCATION</th><th>TEAM</th><th>ACTIONS</th></tr></thead>
                                                    <tbody>
                                                        {incharges.map((incharge, index) => (
                                                            <tr key={incharge.guard_duty_id}>
                                                                <td>{index + 1}</td>
                                                                <td>{incharge.its_id}</td>
                                                                <td>{incharge.full_name}</td>
                                                                <td>{incharge.venue_name}</td>
                                                                <td>{incharge.location_name || 'N/A'}</td>
                                                                <td>{incharge.team_name}</td>
                                                                <td>
                                                                    <div className="action-buttons">
                                                                        {permissions.canEdit && (<button className="icon-button edit-icon-button" onClick={() => handleEdit(incharge)} title="Edit"><i className="ri-edit-line"></i></button>)}
                                                                        {permissions.canDelete && (<button className="icon-button delete-icon-button" onClick={() => handleDelete(incharge.guard_duty_id)} title="Delete"><i className="ri-delete-bin-line"></i></button>)}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (<div className="no-duties-message"><div className="no-duties-icon">📋</div><div>No incharges found for this miqaat.</div></div>)}
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