import { Fragment, useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Form, Button } from 'react-bootstrap';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
import Select from 'react-select';
import IconButton from '../../elements/button';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { checkModuleAccess } from '../../../utils/accessControl';
import '../../../styles/shared-styles.css';
import StandardModal from '../../../components/StandardModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MODULE_ID = '103';

// ============================================================================
// ADD TEAM COMPONENT
// ============================================================================
const AddJamaat = ({
    show,
    onClose,
    onSave,
    editData = null,
    title = "Add New Team"
}) => {

    const [formData, setFormData] = useState({
        name: '',
        jamiaat: null,
        jamaat: []
    });

    const [errors, setErrors] = useState({
        name: '',
        jamiaat: '',
        jamaat: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingJamiaats, setIsLoadingJamiaats] = useState(false);
    const [isLoadingJamaats, setIsLoadingJamaats] = useState(false);

    const [jamiaatOptions, setJamiaatOptions] = useState([]);
    const [jamaatOptions, setJamaatOptions] = useState([]);

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

    useEffect(() => {
        if (show) {
            fetchAllJamiaats();
        }
    }, [show]);

    const fetchAllJamiaats = async () => {
        setIsLoadingJamiaats(true);
        try {
            const token = sessionStorage.getItem('access_token');

            if (!token) {
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

    const fetchJamaatsByJamiaat = async (jamiaatId) => {
        setIsLoadingJamaats(true);
        setJamaatOptions([]);

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
            const result_code = Number(result.data?.result_code);

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

                    showSuccessAlert(result.message || 'Team added successfully!');
                } else if (result_code === 4) {
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
                } else if (result_code === 5) {
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

    const handleClose = () => {
        handleClear();
        if (onClose) {
            onClose();
        }
    };

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

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '38px',
            borderWidth: '2px',
            borderRadius: '8px',
            borderColor: state.isFocused ? '#0d6efd' : (state.selectProps.error ? '#dc3545' : '#dee2e6'),
            '&:hover': {
                borderColor: state.selectProps.error ? '#dc3545' : '#0d6efd'
            },
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.15)' : 'none',
            fontSize: '15px'
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
        dropdownIndicator: (base) => ({
            ...base,
            color: '#0d6efd',
            '&:hover': {
                color: '#0d6efd'
            }
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
            maxHeight: '200px',
            overflowY: 'auto'
        }),
        menuList: (base) => ({
            ...base,
            maxHeight: '200px',
            overflowY: 'auto'
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999
        }),
        placeholder: (base) => ({
            ...base,
            color: '#6c757d',
            fontSize: '15px'
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

    // Define modal buttons
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
            title={editData ? 'Edit Team' : title}
            icon={editData ? 'ri-edit-line' : 'ri-team-line'}
            buttons={modalButtons}
            loading={isLoading}
            maxWidth="900px"
        >
            {errors.submit && (
                <div className="submit-error">
                    <i className="ri-error-warning-line"></i>
                    <span>{errors.submit}</span>
                </div>
            )}

            {/* Added minHeight here to increase modal height */}
            <div style={{ minHeight: '400px' }}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group as={Row}>
                            <Form.Label column sm={4} className="fw-bold">
                                Team Name <span className="text-danger">*</span>
                            </Form.Label>
                            <Col sm={8}>
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
                            </Col>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group as={Row}>
                            <Form.Label column sm={3} className="fw-bold">
                                Jamiaat <span className="text-danger">*</span>
                            </Form.Label>
                            <Col sm={9}>
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
                            </Col>
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={12}>
                        <Form.Group as={Row}>
                            <Form.Label column sm={2} className="fw-bold">
                                Jamaat <span className="text-danger">*</span>
                            </Form.Label>
                            <Col sm={10}>
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
                            </Col>
                        </Form.Group>
                    </Col>
                </Row>
            </div>
        </StandardModal>
    );
};

// ============================================================================
// EDIT TEAM COMPONENT
// ============================================================================
const EditJamaat = ({
    show,
    onClose,
    onUpdate,
    teamId,
    title = "Edit Team"
}) => {
    const [formData, setFormData] = useState({
        name: '',
        jamiaat: null,
        jamaat: []
    });

    const [originalData, setOriginalData] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTeamData, setIsLoadingTeamData] = useState(false);
    const [isLoadingJamiaats, setIsLoadingJamiaats] = useState(false);
    const [isLoadingJamaats, setIsLoadingJamaats] = useState(false);

    const [jamiaatOptions, setJamiaatOptions] = useState([]);
    const [jamaatOptions, setJamaatOptions] = useState([]);

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
        if (show && teamId) {
            fetchAllJamiaats();
            fetchTeamData();
        }
    }, [show, teamId]);

    const fetchAllJamiaats = async () => {
        setIsLoadingJamiaats(true);
        try {
            const token = sessionStorage.getItem('access_token');

            if (!token) {
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

    const fetchJamaatsByJamiaat = async (jamiaatId) => {
        setIsLoadingJamaats(true);
        setJamaatOptions([]);

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

    const fetchTeamData = async () => {
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
                return;
            }

            // Fetch team basic info
            const teamResponse = await fetch(`${API_BASE_URL}/Team/GetTeamById`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    team_id: teamId
                })
            });

            const teamResult = await teamResponse.json();

            if (teamResponse.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'Session Expired',
                    text: 'Please login again.',
                    confirmButtonText: 'OK'
                });
                return;
            }

            if (teamResponse.ok && teamResult.success && teamResult.data && teamResult.data.length > 0) {
                const teamData = teamResult.data[0];

                const jamiaatObj = {
                    value: teamData.jamiaat_id,
                    label: teamData.jamiaat_name
                };

                // Fetch jamaats for this team
                const jamaatResponse = await fetch(`${API_BASE_URL}/Team/GetJamaatsByTeamId`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        team_id: teamId
                    })
                });

                const jamaatResult = await jamaatResponse.json();

                let jamaatArray = [];
                if (jamaatResponse.ok && jamaatResult.success && jamaatResult.data) {
                    jamaatArray = jamaatResult.data.map(item => ({
                        value: item.jamaat_id,
                        label: item.jamaat_name
                    }));
                }

                const initialFormData = {
                    name: teamData.team_name || '',
                    jamiaat: jamiaatObj,
                    jamaat: jamaatArray
                };

                setFormData(initialFormData);
                setOriginalData(initialFormData);

                // Fetch all jamaats for the selected jamiaat
                if (teamData.jamiaat_id) {
                    fetchJamaatsByJamiaat(teamData.jamiaat_id);
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: teamResult.message || 'Failed to load team data',
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

    const validateForm = () => {
        const newErrors = {};
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

    const hasChanges = () => {
        if (!originalData) return false;

        const jamiaatChanged = formData.jamiaat?.value !== originalData.jamiaat?.value;

        const originalJamaatIds = (originalData.jamaat || []).map(j => j.value).sort();
        const currentJamaatIds = (formData.jamaat || []).map(j => j.value).sort();
        const jamaatChanged = JSON.stringify(originalJamaatIds) !== JSON.stringify(currentJamaatIds);

        return (
            formData.name !== originalData.name ||
            jamiaatChanged ||
            jamaatChanged
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
                const resultCode = Number(result.data?.result_code);

                if (resultCode === 2) {
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

                    showSuccessAlert(result.message || 'Team updated successfully!');
                } else if (resultCode === 4) {
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
                } else if (resultCode === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Team not found or update failed',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(result.message || 'Failed to update team');
                }
            } else {
                throw new Error(result.message || 'Failed to update team');
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

    const handleClose = () => {
        setFormData({
            name: '',
            jamiaat: null,
            jamaat: []
        });
        setErrors({});
        setOriginalData(null);
        setJamaatOptions([]);

        if (onClose) {
            onClose();
        }
    };

    const handleReset = () => {
        if (originalData) {
            setFormData({ ...originalData });
            setErrors({});

            if (originalData.jamiaat?.value) {
                fetchJamaatsByJamiaat(originalData.jamiaat.value);
            }

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
            borderWidth: '2px',
            borderRadius: '8px',
            borderColor: state.isFocused ? '#0d6efd' : (state.selectProps.error ? '#dc3545' : '#dee2e6'),
            '&:hover': {
                borderColor: state.selectProps.error ? '#dc3545' : '#0d6efd'
            },
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.15)' : 'none',
            fontSize: '15px'
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
        dropdownIndicator: (base) => ({
            ...base,
            color: '#0d6efd',
            '&:hover': {
                color: '#0d6efd'
            }
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
            maxHeight: '200px',
            overflowY: 'auto'
        }),
        menuList: (base) => ({
            ...base,
            maxHeight: '200px',
            overflowY: 'auto'
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999
        }),
        placeholder: (base) => ({
            ...base,
            color: '#6c757d',
            fontSize: '15px'
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

    // Define modal buttons
    const modalButtons = [
        {
            label: isLoading ? 'Updating...' : 'Update',
            variant: 'primary',
            icon: 'ri-save-line',
            onClick: handleUpdate,
            disabled: isLoading || !hasChanges() || isLoadingTeamData
        },
        {
            label: 'Back',
            variant: 'secondary',
            icon: 'ri-arrow-left-line',
            onClick: handleClose,
            disabled: isLoading || isLoadingTeamData
        },
        {
            label: 'Reset',
            className: 'btn-clear',
            icon: 'ri-refresh-line',
            onClick: handleReset,
            disabled: isLoading || !hasChanges() || isLoadingTeamData
        }
    ];

    return (
        <StandardModal
            show={show}
            onClose={handleClose}
            title={title}
            icon="ri-edit-line"
            buttons={modalButtons}
            loading={isLoadingTeamData || isLoading}
            maxWidth="900px"
        >
            {errors.submit && (
                <div className="submit-error">
                    <i className="ri-error-warning-line"></i>
                    <span>{errors.submit}</span>
                </div>
            )}

            {!isLoadingTeamData && (
                // Added minHeight here to increase modal height
                <div style={{ minHeight: '400px' }}>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group as={Row}>
                                <Form.Label column sm={4} className="fw-bold">
                                    Team Name <span className="text-danger">*</span>
                                </Form.Label>
                                <Col sm={8}>
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
                                </Col>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group as={Row}>
                                <Form.Label column sm={3} className="fw-bold">
                                    Jamiaat <span className="text-danger">*</span>
                                </Form.Label>
                                <Col sm={9}>
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
                                </Col>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2} className="fw-bold">
                                    Jamaat <span className="text-danger">*</span>
                                </Form.Label>
                                <Col sm={10}>
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
                                </Col>
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            )}
        </StandardModal>
    );
};

// ============================================================================
// MAIN TEAM TABLE COMPONENT
// ============================================================================
const TeamTable = () => {
    const navigate = useNavigate();

    // RBAC State
    const [checkingPermissions, setCheckingPermissions] = useState(true);
    const [permissions, setPermissions] = useState({
        canAdd: false,
        canEdit: false,
        canDelete: false,
        hasAccess: false
    });

    // State management
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editTeamId, setEditTeamId] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gridKey, setGridKey] = useState(0);

    // RBAC Check
    useEffect(() => {
        const checkAccess = async () => {
            setCheckingPermissions(true);

            const isAdminValue = sessionStorage.getItem('is_admin');
            if (isAdminValue === 'true' || isAdminValue === true || isAdminValue === '1') {
                setPermissions({ canAdd: true, canEdit: true, canDelete: true, hasAccess: true });
                setCheckingPermissions(false);
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
                    navigate(`${import.meta.env.BASE_URL}dashboard/`);
                });
                return;
            }

            setPermissions(access);
            setCheckingPermissions(false);
        };

        checkAccess();
    }, [navigate]);

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

    useEffect(() => {
        fetchTeams();
    }, []);

    const totalRecords = tableData.length;

    const handleAdd = () => {
        if (!permissions.canAdd) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to add teams',
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
        setEditTeamId(null);
    };

    const handleSave = (data) => {
        setShowAddForm(false);
        fetchTeams();
        setGridKey(prev => prev + 1);
    };

    const handleUpdate = (data) => {
        setShowEditForm(false);
        setEditTeamId(null);

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

        setGridKey(prev => prev + 1);

        setTimeout(() => {
            fetchTeams();
        }, 500);
    };

    const handleEdit = (id) => {
        if (!permissions.canEdit) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to edit teams',
                confirmButtonText: 'OK'
            });
            return;
        }
        setEditTeamId(id);
        setShowEditForm(true);
    };

    const handleDelete = async (id) => {
        if (!permissions.canDelete) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to delete teams',
                confirmButtonText: 'OK'
            });
            return;
        }

        const teamToDelete = tableData.find(item => item.id === id);
        const teamName = teamToDelete ? teamToDelete.teamName : 'this team';

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
                    Swal.fire({
                        title: 'Deleted!',
                        text: apiResult.message || 'Team has been deleted successfully.',
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
                            await fetchTeams();
                        } catch (error) {
                            console.error('Background sync failed:', error);
                        }
                    }, 500);

                } else if (resultCode === 0) {
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
            item.teamName,
            item.jamiaat,
            item.id
        ]);
    }, [tableData]);

    // Loading state while checking permissions
    if (checkingPermissions) {
        return (
            <Fragment>
                <div className="permission-loading" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    textAlign: 'center'
                }}>
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Checking permissions...</p>
                </div>
            </Fragment>
        );
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
                        overflow-x: auto;
                    }
                    #grid-team-table .gridjs-table {
                        min-width: 800px;
                    }
                    #grid-team-table .btn-action-group {
                        display: inline-flex;
                        gap: 10px;
                        align-items: center;
                    }
                    #grid-team-table .btn-action-group .btn {
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

            <AddJamaat
                show={showAddForm}
                onClose={handleCloseAddModal}
                onSave={handleSave}
            />

            <EditJamaat
                show={showEditForm}
                onClose={handleCloseEditModal}
                onUpdate={handleUpdate}
                teamId={editTeamId}
            />

            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>
                                <div className="page-header-title">
                                    <div className="header-text">
                                        <i className="ri-team-line"></i>
                                        <span>Team Master</span>
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
                                        <p className="mt-3">Loading teams data...</p>
                                    </div>
                                ) : error ? (
                                    <div className="error-container">
                                        <i className="ri-error-warning-line" style={{ fontSize: '48px' }}></i>
                                        <p className="mt-3">{error}</p>
                                        <button
                                            className="btn btn-primary mt-3"
                                            onClick={fetchTeams}
                                        >
                                            <i className="ri-refresh-line me-2"></i>
                                            Retry
                                        </button>
                                    </div>
                                ) : tableData.length === 0 ? (
                                    <div className="loading-container">
                                        <i className="ri-inbox-line" style={{ fontSize: '48px' }}></i>
                                        <p className="mt-3">No teams found</p>
                                        {permissions.canAdd && (
                                            <button
                                                className="btn btn-primary mt-2"
                                                onClick={handleAdd}
                                            >
                                                <i className="ri-add-line me-2"></i>
                                                Add First Team
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div id="grid-team-table">
                                        <Grid
                                            key={gridKey}
                                            data={gridData}
                                            // sort={true}
                                            search={{
                                                enabled: true,
                                                placeholder: 'Search teams...'
                                            }}
                                            columns={[
                                                {
                                                    name: 'Sr',
                                                    width: '20px',
                                                    // sort: true
                                                },
                                                {
                                                    name: 'Team Name',
                                                    width: '150px',
                                                    // sort: true
                                                },
                                                {
                                                    name: 'Jamiaat',
                                                    width: '100px',
                                                    // sort: true
                                                },
                                                {
                                                    name: 'Action',
                                                    width: '20px',
                                                    // sort: true,
                                                    formatter: (cell) => {
                                                        if (!permissions.canEdit && !permissions.canDelete) {
                                                            return html(`<span class="text-muted">-</span>`);
                                                        }

                                                        let buttons = '<div class="btn-action-group">';

                                                        if (permissions.canEdit) {
                                                            buttons += `
                                                                <button 
                                                                    class="btn btn-sm btn-info-transparent btn-icon btn-wave" 
                                                                    title="Edit"
                                                                    onclick="handleEditClick(${cell})"
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
                                                                    onclick="handleDeleteClick(${cell})"
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
            </div>
        </Fragment>
    );
};

export default TeamTable;