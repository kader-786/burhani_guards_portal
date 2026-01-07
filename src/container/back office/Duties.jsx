import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MiqaatTeamForm = () => {
    // Form state
    const [formData, setFormData] = useState({
        miqaat: null,
        jamiaat: null,
        team: null,
        location: '',
        quota: ''
    });

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingDutyId, setEditingDutyId] = useState(null);
    const [originalQuota, setOriginalQuota] = useState(0); // Store original quota when editing

    // Options state
    const [miqaatOptions, setMiqaatOptions] = useState([]);
    const [jamiaatOptions, setJamiaatOptions] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [loadingMiqaat, setLoadingMiqaat] = useState(false);
    const [loadingJamiaat, setLoadingJamiaat] = useState(false);
    const [loadingTeam, setLoadingTeam] = useState(false);
    const [loadingDuties, setLoadingDuties] = useState(false);
    const [loadingRemainingQuota, setLoadingRemainingQuota] = useState(false);
    const [loadingTeamCount, setLoadingTeamCount] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState({});

    // Duties table state
    const [duties, setDuties] = useState([]);
    const [showDutiesTable, setShowDutiesTable] = useState(false);

    // Remaining quota state
    const [remainingQuota, setRemainingQuota] = useState(null);
    const [totalQuota, setTotalQuota] = useState(null);

    // Team count state
    const [teamCount, setTeamCount] = useState(null);

    // Show form sections state
    const [showFormSections, setShowFormSections] = useState(false);

    // Calculate effective remaining quota (adds back original quota when editing)
    const getEffectiveRemainingQuota = () => {
        if (remainingQuota === null) return null;
        return isEditMode ? remainingQuota + originalQuota : remainingQuota;
    };

    // Fetch Miqaat on component mount only
    useEffect(() => {
        fetchMiqaatOptions();
    }, []);

    // Fetch Miqaat Options
    const fetchMiqaatOptions = async () => {
        try {
            setLoadingMiqaat(true);
            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                console.error('Access token not found');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Duty/GetListOfActiveMiqaat`, {
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
                        quantity: item.quantity // Store the total quota
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

    // Fetch Jamiaat Options - INDEPENDENT
    const fetchJamiaatOptions = async () => {
        try {
            setLoadingJamiaat(true);
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

    // Fetch Team Options - DEPENDENT on Jamiaat selection
    const fetchTeamOptions = async (jamiaatId) => {
        try {
            setLoadingTeam(true);
            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                console.error('Access token not found');
                return;
            }

            // Fetch teams based on selected jamiaat
            const response = await fetch(`${API_BASE_URL}/Duty/GetTeamsByJamiaat`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    jamiaat_id: jamiaatId
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const options = result.data.map(item => ({
                        value: item.team_id,
                        label: item.team_name
                    }));
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

    // Fetch Team Count
    const fetchTeamCount = async (teamId) => {
        try {
            setLoadingTeamCount(true);
            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                console.error('Access token not found');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Duty/GetTeamCountByTeam`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    team_id: teamId
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setTeamCount(result.data.team_count);
                } else {
                    setTeamCount(null);
                }
            }
        } catch (error) {
            console.error('Error fetching team count:', error);
            setTeamCount(null);
        } finally {
            setLoadingTeamCount(false);
        }
    };

    // Fetch Remaining Quota by Miqaat
    const fetchRemainingQuota = async (miqaatId) => {
        try {
            setLoadingRemainingQuota(true);
            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                console.error('Access token not found');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Duty/GetRemainingQuotaByMiqaat`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    miqaat_id: miqaatId
                })
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

    // Fetch Duties by Miqaat
    const fetchDutiesByMiqaat = async (miqaatId) => {
        try {
            setLoadingDuties(true);
            const accessToken = sessionStorage.getItem('access_token');
            
            if (!accessToken) {
                console.error('Access token not found');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Duty/GetDutiesByMiqaat`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    miqaat_id: miqaatId
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setDuties(result.data);
                    setShowDutiesTable(true);
                } else {
                    setDuties([]);
                    setShowDutiesTable(true);
                }
            }
        } catch (error) {
            console.error('Error fetching duties:', error);
            setDuties([]);
            setShowDutiesTable(false);
        } finally {
            setLoadingDuties(false);
        }
    };

    // Handle Edit - Load duty data into form
    const handleEdit = async (duty) => {
        try {
            // Show form sections if hidden
            if (!showFormSections) {
                setShowFormSections(true);
            }

            // Fetch jamiaat options if not already loaded
            if (jamiaatOptions.length === 0) {
                await fetchJamiaatOptions();
            }

            // Fetch teams for the jamiaat
            await fetchTeamOptions(duty.jamiaat_id);

            // Fetch team count for the selected team
            await fetchTeamCount(duty.team_id);

            // Set form data with the duty information
            setFormData({
                miqaat: {
                    value: duty.miqaat_id,
                    label: duty.miqaat_name
                },
                jamiaat: {
                    value: duty.jamiaat_id,
                    label: duty.jamiaat_name
                },
                team: {
                    value: duty.team_id,
                    label: duty.team_name
                },
                location: duty.location,
                quota: duty.quota.toString()
            });

            // Set edit mode and store original quota
            setIsEditMode(true);
            setEditingDutyId(duty.duty_id);
            setOriginalQuota(duty.quota); // Store the original quota

            // Scroll to top of form
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

    // Handle Delete
    const handleDelete = async (dutyId) => {
        // Show confirmation dialog
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
                body: JSON.stringify({
                    duty_id: dutyId
                })
            });

            const apiResult = await response.json();
            console.log('Delete API Response:', apiResult);

            if (response.ok && apiResult.success) {
                const resultCode = Number(apiResult.data?.result_code);
                
                if (resultCode === 3) {
                    // Success
                    Swal.fire({
                        title: 'Deleted!',
                        text: apiResult.message || 'Duty has been deleted successfully.',
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: false,
                        showConfirmButton: false
                    });

                    // Refresh the duties table and remaining quota
                    if (formData.miqaat?.value) {
                        fetchDutiesByMiqaat(formData.miqaat.value);
                        fetchRemainingQuota(formData.miqaat.value);
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
        }
    };

    // Handle Miqaat change
    const handleMiqaatChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            miqaat: selectedOption
        }));
        
        if (errors.miqaat) {
            setErrors(prev => ({ ...prev, miqaat: '' }));
        }

        // Fetch duties and remaining quota for the selected miqaat
        if (selectedOption?.value) {
            // Set total quota from the selected option
            setTotalQuota(selectedOption.quantity || null);
            
            // Show form sections
            setShowFormSections(true);
            // Fetch jamiaat options
            fetchJamiaatOptions();
            // Fetch duties and quota
            fetchDutiesByMiqaat(selectedOption.value);
            fetchRemainingQuota(selectedOption.value);
        } else {
            // Hide form sections
            setShowFormSections(false);
            setDuties([]);
            setShowDutiesTable(false);
            setRemainingQuota(null);
            setTotalQuota(null);
            setJamiaatOptions([]);
            setTeamOptions([]);
            setTeamCount(null);
        }
    };

    // Handle Jamiaat change - FETCHES TEAMS based on selected Jamiaat
    const handleJamiaatChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            jamiaat: selectedOption,
            team: null // Reset team when jamiaat changes
        }));
        
        if (errors.jamiaat) {
            setErrors(prev => ({ ...prev, jamiaat: '' }));
        }

        // Reset team count when jamiaat changes
        setTeamCount(null);

        // Fetch teams for the selected jamiaat
        if (selectedOption?.value) {
            fetchTeamOptions(selectedOption.value);
        } else {
            setTeamOptions([]);
        }
    };

    // Handle Team change
    const handleTeamChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            team: selectedOption
        }));
        
        if (errors.team) {
            setErrors(prev => ({ ...prev, team: '' }));
        }

        // Fetch team count when team is selected
        if (selectedOption?.value) {
            fetchTeamCount(selectedOption.value);
        } else {
            setTeamCount(null);
        }
    };

    // Handle Location change
    const handleLocationChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            location: value
        }));
        
        if (errors.location) {
            setErrors(prev => ({ ...prev, location: '' }));
        }
    };

    // Handle Quota change
    const handleQuotaChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            quota: value
        }));
        
        // Clear existing error
        if (errors.quota) {
            setErrors(prev => ({ ...prev, quota: '' }));
        }

        // Real-time validation: check if quota exceeds effective remaining quota
        const effectiveRemaining = getEffectiveRemainingQuota();
        if (value && effectiveRemaining !== null && parseInt(value) > effectiveRemaining) {
            setErrors(prev => ({ 
                ...prev, 
                quota: `Quota cannot exceed available capacity of ${effectiveRemaining}` 
            }));
        } else if (value && teamCount !== null && parseInt(value) > teamCount) {
            // Validate against team count
            setErrors(prev => ({ 
                ...prev, 
                quota: `Quota cannot exceed team member count of ${teamCount}` 
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.miqaat) {
            newErrors.miqaat = 'Please select a Miqaat';
        }

        if (!formData.jamiaat) {
            newErrors.jamiaat = 'Please select a Jamiaat';
        }

        if (!formData.team) {
            newErrors.team = 'Please select a Team';
        }

        // if (!formData.location || !formData.location.trim()) {
        //     newErrors.location = 'Please enter location';
        // }

        if (!formData.quota) {
            newErrors.quota = 'Please enter quota';
        } else if (formData.quota <= 0) {
            newErrors.quota = 'Quota must be greater than 0';
        } else {
            // Use effective remaining quota for validation
            const effectiveRemaining = getEffectiveRemainingQuota();
            if (effectiveRemaining !== null && parseInt(formData.quota) > effectiveRemaining) {
                newErrors.quota = `Quota cannot exceed available capacity of ${effectiveRemaining}`;
            } else if (teamCount !== null && parseInt(formData.quota) > teamCount) {
                // Validate against team count
                newErrors.quota = `Quota cannot exceed team member count of ${teamCount}`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Save (Insert or Update)
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

            let response, apiEndpoint, requestBody;

            if (isEditMode) {
                // UPDATE MODE
                apiEndpoint = `${API_BASE_URL}/Duty/UpdateDuty`;
                requestBody = {
                    duty_id: editingDutyId,
                    team_id: formData.team.value,
                    miqaat_id: formData.miqaat.value,
                    quota: parseInt(formData.quota),
                    location: formData.location.trim()
                };

                response = await fetch(apiEndpoint, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(requestBody)
                });
            } else {
                // INSERT MODE
                apiEndpoint = `${API_BASE_URL}/Duty/InsertDuty`;
                requestBody = {
                    team_id: formData.team.value,
                    miqaat_id: formData.miqaat.value,
                    quota: parseInt(formData.quota),
                    location: formData.location.trim()
                };

                response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(requestBody)
                });
            }

            const result = await response.json();
            console.log('API Response:', result);

            // Handle success response
            if (response.ok) {
                const rawcode = result.data?.result_code;
                const resultCode = Number(rawcode);
                console.log('Result Code:', resultCode);

                if (resultCode === 1) {
                    // Insert Success
                    Swal.fire({
                        title: 'Success!',
                        text: result.message || 'Duty created successfully!',
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: false,
                        showConfirmButton: false,
                        allowOutsideClick: false,
                    });
                    
                    // Refresh duties table and remaining quota
                    if (formData.miqaat?.value) {
                        fetchDutiesByMiqaat(formData.miqaat.value);
                        fetchRemainingQuota(formData.miqaat.value);
                    }
                    
                    // Reset form after alert
                    setTimeout(() => {
                        setFormData(prev => ({
                            ...prev,
                            jamiaat: null,
                            team: null,
                            location: '',
                            quota: ''
                        }));
                        setErrors({});
                        setTeamOptions([]);
                        setTeamCount(null);
                    }, 2000);
                } else if (resultCode === 2) {
                    // Update Success
                    Swal.fire({
                        title: 'Success!',
                        text: result.message || 'Duty updated successfully!',
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: false,
                        showConfirmButton: false,
                        allowOutsideClick: false,
                    });
                    
                    // Refresh duties table and remaining quota
                    if (formData.miqaat?.value) {
                        fetchDutiesByMiqaat(formData.miqaat.value);
                        fetchRemainingQuota(formData.miqaat.value);
                    }
                    
                    // Reset form and exit edit mode
                    setTimeout(() => {
                        handleCancelEdit();
                    }, 2000);
                } else if (resultCode === 4) {
                    // Duplicate
                    Swal.fire({
                        icon: 'warning',
                        title: 'Duplicate Duty',
                        text: 'This duty assignment already exists (same team, miqaat, and location)',
                        confirmButtonText: 'OK'
                    });
                } else if (resultCode === 0) {
                    // Failure
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed',
                        text: result.message || 'Failed to save duty',
                        confirmButtonText: 'OK'
                    });
                }
            } else {
                throw new Error(result.message || `Server error: ${response.status}`);
            }

        } catch (error) {
            console.error('Error saving duty:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while saving',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle Cancel Edit
    const handleCancelEdit = () => {
        setFormData(prev => ({
            ...prev,
            jamiaat: null,
            team: null,
            location: '',
            quota: ''
        }));
        setErrors({});
        setTeamOptions([]);
        setIsEditMode(false);
        setEditingDutyId(null);
        setOriginalQuota(0); // Reset original quota
        setTeamCount(null); // Reset team count
    };

    // Handle Clear
    const handleClear = () => {
        setFormData({
            miqaat: null,
            jamiaat: null,
            team: null,
            location: '',
            quota: ''
        });
        setErrors({});
        setTeamOptions([]);
        setDuties([]);
        setShowDutiesTable(false);
        setIsEditMode(false);
        setEditingDutyId(null);
        setRemainingQuota(null);
        setTotalQuota(null);
        setOriginalQuota(0); // Reset original quota
        setShowFormSections(false); // Hide form sections
        setJamiaatOptions([]); // Clear jamiaat options
        setTeamCount(null); // Reset team count
    };

    // Custom styles for react-select
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '48px',
            borderColor: state.selectProps.error ? '#dc3545' : '#dee2e6',
            borderRadius: '8px',
            borderWidth: '2px',
            boxShadow: 'none',
            '&:hover': {
                borderColor: state.selectProps.error ? '#dc3545' : '#0d6efd'
            }
        }),
        placeholder: (base) => ({
            ...base,
            color: '#6c757d',
            fontSize: '15px'
        }),
        singleValue: (base) => ({
            ...base,
            fontSize: '15px'
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: '#0d6efd',
            '&:hover': {
                color: '#0b5ed7'
            }
        })
    };

    // Get the effective remaining quota to display
    const displayRemainingQuota = getEffectiveRemainingQuota();

    return (
        <div className="miqaat-team-form-container">
            <style>
                {`
                    .miqaat-team-form-container {
                        background: #fff;
                        border-radius: 12px;
                        padding: 30px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                        max-width: 1200px;
                        margin: 20px auto;
                    }

                    .form-title {
                        font-size: 22px;
                        font-weight: 600;
                        margin-bottom: 25px;
                        color: #333;
                        border-bottom: 2px solid #0d6efd;
                        padding-bottom: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }

                    .edit-mode-badge {
                        background: #ffc107;
                        color: #000;
                        padding: 6px 15px;
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: 500;
                    }

                    .miqaat-quota-row {
                        display: grid;
                        grid-template-columns: 55% 22.5% 22.5%;
                        gap: 15px;
                        margin-bottom: 20px;
                        align-items: start;
                    }

                    .miqaat-dropdown-container {
                        width: 100%;
                    }

                    .quota-container {
                        width: 100%;
                    }

                    .quota-display {
                        height: 48px;
                        padding: 0 15px;
                        border: 2px solid #dee2e6;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 15px;
                        background: #f8f9fa;
                    }

                    .quota-loading {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        color: #0d6efd;
                    }

                    .quota-value {
                        font-weight: 600;
                        font-size: 18px;
                        color: #495057;
                        display: flex;
                        align-items: center;
                    }

                    .quota-placeholder {
                        color: #6c757d;
                        font-style: italic;
                    }

                    .dropdown-row {
                        margin-bottom: 20px;
                    }

                    .dropdown-label {
                        font-weight: 500;
                        font-size: 15px;
                        color: #495057;
                        margin-bottom: 8px;
                        display: block;
                    }

                    .dropdown-label .required {
                        color: #dc3545;
                        margin-left: 4px;
                    }

                    .error-text {
                        color: #dc3545;
                        font-size: 13px;
                        margin-top: 6px;
                        display: block;
                    }

                    .two-column-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 20px;
                    }

                    .form-input {
                        width: 100%;
                        height: 48px;
                        padding: 0 15px;
                        border: 2px solid #dee2e6;
                        border-radius: 8px;
                        font-size: 15px;
                        transition: all 0.2s;
                    }

                    .form-input:focus {
                        outline: none;
                        border-color: #0d6efd;
                        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
                    }

                    .form-input.is-invalid {
                        border-color: #dc3545;
                    }

                    .button-row {
                        display: flex;
                        gap: 15px;
                        margin-top: 20px;
                        justify-content: center;
                        align-items: center;
                    }

                    .save-button {
                        height: 45px;
                        padding: 0 35px;
                        background: #0d6efd;
                        border: none;
                        border-radius: 8px;
                        color: #fff;
                        font-weight: 500;
                        font-size: 15px;
                        cursor: pointer;
                        transition: all 0.2s;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        white-space: nowrap;
                        justify-content: center;
                    }

                    .save-button:hover:not(:disabled) {
                        background: #0b5ed7;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
                    }

                    .save-button:active:not(:disabled) {
                        transform: translateY(0);
                    }

                    .save-button:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }

                    .save-button.update-mode {
                        background: #28a745;
                    }

                    .save-button.update-mode:hover:not(:disabled) {
                        background: #218838;
                    }

                    .cancel-edit-button {
                        height: 45px;
                        padding: 0 35px;
                        background: #ffc107;
                        border: none;
                        border-radius: 8px;
                        color: #000;
                        font-weight: 500;
                        font-size: 15px;
                        cursor: pointer;
                        transition: all 0.2s;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        justify-content: center;
                    }

                    .cancel-edit-button:hover:not(:disabled) {
                        background: #e0a800;
                    }

                    .spinner {
                        width: 16px;
                        height: 16px;
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        border-top-color: #fff;
                        border-radius: 50%;
                        animation: spin 0.6s linear infinite;
                    }

                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }

                    .clear-button {
                        padding: 10px 20px;
                        background: #6c757d;
                        border: none;
                        border-radius: 8px;
                        color: #fff;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s;
                        height: 45px;
                    }

                    .clear-button:hover:not(:disabled) {
                        background: #5c636a;
                    }

                    .clear-button:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }

                    /* Team Count Info */
                    .team-count-info {
                        margin-top: 8px;
                        font-size: 13px;
                        color: #6c757d;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }

                    .team-count-info.loading {
                        color: #0d6efd;
                    }

                    /* Duties Table Styles */
                    .duties-table-container {
                        margin-top: 40px;
                        border-top: 2px solid #dee2e6;
                        padding-top: 30px;
                    }

                    .table-title {
                        font-size: 18px;
                        font-weight: 600;
                        margin-bottom: 20px;
                        color: #333;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    .duties-table-wrapper {
                        overflow-x: auto;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    }

                    .duties-table {
                        width: 100%;
                        border-collapse: collapse;
                        background: #fff;
                        border: 2px solid #dee2e6;
                    }

                    .duties-table thead {
                        background: #fff;
                        color: #000;
                        border-bottom: 2px solid #dee2e6;
                    }

                    .duties-table th {
                        padding: 15px;
                        text-align: left;
                        font-weight: 600;
                        font-size: 14px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        border-right: 1px solid #dee2e6;
                    }

                    .duties-table th:last-child {
                        border-right: none;
                    }

                    .duties-table tbody tr {
                        border-bottom: 1px solid #dee2e6;
                        transition: background-color 0.2s;
                    }

                    .duties-table tbody tr:hover {
                        background-color: #f8f9fa;
                    }

                    .duties-table tbody tr:last-child {
                        border-bottom: none;
                    }

                    .duties-table td {
                        padding: 15px;
                        font-size: 14px;
                        color: #495057;
                        border-right: 1px solid #dee2e6;
                    }

                    .duties-table td:last-child {
                        border-right: none;
                    }

                    .action-buttons {
                        display: flex;
                        gap: 10px;
                        align-items: center;
                    }

                    .icon-button {
                        width: 36px;
                        height: 36px;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                        font-size: 16px;
                    }

                    .edit-icon-button {
                        background: #0d6efd;
                        color: #fff;
                    }

                    .edit-icon-button:hover {
                        background: #0b5ed7;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
                    }

                    .delete-icon-button {
                        background: #dc3545;
                        color: #fff;
                    }

                    .delete-icon-button:hover {
                        background: #c82333;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
                    }

                    .no-duties-message {
                        text-align: center;
                        padding: 40px 20px;
                        color: #6c757d;
                        font-size: 15px;
                    }

                    .no-duties-icon {
                        font-size: 48px;
                        margin-bottom: 15px;
                        opacity: 0.5;
                    }

                    .loading-duties {
                        text-align: center;
                        padding: 40px 20px;
                        color: #0d6efd;
                    }

                    .loading-spinner {
                        width: 40px;
                        height: 40px;
                        border: 4px solid rgba(13, 110, 253, 0.1);
                        border-top-color: #0d6efd;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                        margin: 0 auto 15px;
                    }

                    /* Responsive Design */
                    @media (max-width: 768px) {
                        .miqaat-team-form-container {
                            padding: 20px;
                        }

                        .miqaat-quota-row {
                            grid-template-columns: 1fr;
                        }

                        .two-column-row {
                            grid-template-columns: 1fr;
                            gap: 15px;
                        }

                        .button-row {
                            flex-direction: column;
                            width: 100%;
                        }

                        .save-button, .cancel-edit-button, .clear-button {
                            width: 100%;
                        }

                        .duties-table-wrapper {
                            overflow-x: scroll;
                        }

                        .duties-table th,
                        .duties-table td {
                            padding: 10px;
                            font-size: 13px;
                        }
                    }
                `}
            </style>

            <div className="form-title">
                <span>
                    <i className="ri-file-list-3-line me-2"></i>
                    Duties Assign
                </span>
                {isEditMode && (
                    <span className="edit-mode-badge">
                        <i className="ri-edit-line me-1"></i>
                        Edit Mode
                    </span>
                )}
            </div>

            {/* Row 1: Miqaat Dropdown with Total Quota and Remaining Quota */}
            <div className="miqaat-quota-row">
                <div className="miqaat-dropdown-container">
                    <label className="dropdown-label">
                        Miqaat <span className="required">*</span>
                    </label>
                    <Select
                        options={miqaatOptions}
                        value={formData.miqaat}
                        onChange={handleMiqaatChange}
                        placeholder="Select Miqaat"
                        isClearable
                        styles={selectStyles}
                        error={errors.miqaat}
                        isDisabled={loading || isEditMode}
                        isLoading={loadingMiqaat}
                    />
                    {errors.miqaat && <span className="error-text">{errors.miqaat}</span>}
                </div>
                
                {showFormSections && (
                    <>
                        <div className="quota-container">
                            <label className="dropdown-label">
                                Total Quota
                            </label>
                            <div className="quota-display">
                                {totalQuota !== null ? (
                                    <div className="quota-value">
                                        {totalQuota}
                                    </div>
                                ) : (
                                    <div className="quota-placeholder">
                                        N/A
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="quota-container">
                            <label className="dropdown-label">
                                {isEditMode ? 'Available' : 'Remaining'}
                            </label>
                            <div className="quota-display">
                                {loadingRemainingQuota ? (
                                    <div className="quota-loading">
                                        <span className="spinner"></span>
                                    </div>
                                ) : displayRemainingQuota !== null ? (
                                    <div className="quota-value">
                                        {displayRemainingQuota}
                                    </div>
                                ) : (
                                    <div className="quota-placeholder">
                                        N/A
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Show form sections only after miqaat is selected */}
            {showFormSections && (
                <>
                    {/* Row 2: Jamiaat and Team */}
                    <div className="two-column-row">
                        <div>
                            <label className="dropdown-label">
                                Jamiaat <span className="required">*</span>
                            </label>
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
                        </div>

                        <div>
                            <label className="dropdown-label">
                                Team <span className="required">*</span>
                            </label>
                            <Select
                                options={teamOptions}
                                value={formData.team}
                                onChange={handleTeamChange}
                                placeholder={loadingTeam ? "Loading..." : "Select Team"}
                                isClearable
                                styles={selectStyles}
                                error={errors.team}
                                isDisabled={loading || loadingTeam || !formData.jamiaat}
                                isLoading={loadingTeam}
                                noOptionsMessage={() => formData.jamiaat ? "No teams found" : "Please select Jamiaat first"}
                            />
                            {errors.team && <span className="error-text">{errors.team}</span>}
                            {formData.team && (
                                <div className={`team-count-info ${loadingTeamCount ? 'loading' : ''}`}>
                                    {loadingTeamCount ? (
                                        <>
                                            <span className="spinner"></span>
                                            Loading count...
                                        </>
                                    ) : teamCount !== null ? (
                                        <>
                                            <i className="ri-team-line"></i>
                                            Team Members: {teamCount}
                                        </>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 3: Location and Quota */}
                    <div className="two-column-row">
                        <div>
                            <label className="dropdown-label">
                                Location 
                                {/* <span className="required">*</span> */}
                            </label>
                            <input
                                type="text"
                                className={`form-input ${errors.location ? 'is-invalid' : ''}`}
                                placeholder="Enter location"
                                value={formData.location}
                                onChange={handleLocationChange}
                                disabled={loading}
                            />
                            {errors.location && <span className="error-text">{errors.location}</span>}
                        </div>

                        <div>
                            <label className="dropdown-label">
                                Quota <span className="required">*</span>
                            </label>
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
                        </div>
                    </div>

                    {/* Save and Cancel/Clear Button Row - Centered */}
                    <div className="button-row">
                        {isEditMode ? (
                            <>
                                <button 
                                    className="save-button update-mode"
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-save-line"></i>
                                            Save
                                        </>
                                    )}
                                </button>
                                <button 
                                    className="cancel-edit-button"
                                    onClick={handleCancelEdit}
                                    disabled={loading}
                                >
                                    <i className="ri-close-line"></i>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    className="save-button"
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-save-line"></i>
                                            Save
                                        </>
                                    )}
                                </button>
                                <button 
                                    className="clear-button"
                                    onClick={handleClear}
                                    disabled={loading}
                                >
                                    <i className="ri-refresh-line me-2"></i>
                                    Clear Form
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* Duties Table */}
            {showDutiesTable && (
                <div className="duties-table-container">
                    <div className="table-title">
                        <i className="ri-table-line"></i>
                        Assigned Duties for {formData.miqaat?.label}
                    </div>

                    {loadingDuties ? (
                        <div className="loading-duties">
                            <div className="loading-spinner"></div>
                            <div>Loading duties...</div>
                        </div>
                    ) : duties.length > 0 ? (
                        <div className="duties-table-wrapper">
                            <table className="duties-table">
                                <thead>
                                    <tr>
                                        <th>Duty ID</th>
                                        <th>Jamiaat</th>
                                        <th>Team</th>
                                        <th>Location</th>
                                        <th>Quota</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {duties.map((duty, index) => (
                                        <tr key={duty.duty_id || index}>
                                            <td>{duty.duty_id}</td>
                                            <td>{duty.jamiaat_name}</td>
                                            <td>{duty.team_name}</td>
                                            <td>{duty.location}</td>
                                            <td>{duty.quota}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="icon-button edit-icon-button"
                                                        onClick={() => handleEdit(duty)}
                                                        title="Edit Duty"
                                                    >
                                                        <i className="ri-edit-line"></i>
                                                    </button>
                                                    <button 
                                                        className="icon-button delete-icon-button"
                                                        onClick={() => handleDelete(duty.duty_id)}
                                                        title="Delete Duty"
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
                    ) : (
                        <div className="no-duties-message">
                            <div className="no-duties-icon">📋</div>
                            <div>No duties assigned for this miqaat yet.</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MiqaatTeamForm;