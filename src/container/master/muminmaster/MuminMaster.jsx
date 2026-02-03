import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import IconButton from '../../elements/button';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { checkModuleAccess } from '../../../utils/accessControl';
import '../../../styles/shared-styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ========================================
// MODULE CONFIGURATION
// ========================================
const MODULE_ID = '102'; // Mumin Master module ID

// ========================================
// SHARED STYLES COMPONENT
// ========================================

const ModalStyles = () => (
    <style>
        {`
            .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1050; animation: fadeIn 0.2s ease; padding: 20px; overflow: auto; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
            .modal-form-container { background: #fff; border-radius: 12px; width: 100%; max-width: 1200px; max-height: 95vh; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); animation: slideIn 0.3s ease; position: relative; display: flex; flex-direction: column; overflow: hidden; }
            .modal-form-container .form-title { font-size: 20px; font-weight: 600; color: #333; border-bottom: 2px solid #0d6efd; padding: 18px 25px 10px 25px; display: flex; align-items: center; justify-content: space-between; background: #fff; flex-shrink: 0; }
            .modal-form-container .form-title .close-btn { background: none; border: none; font-size: 24px; color: #666; cursor: pointer; padding: 0; line-height: 1; transition: color 0.2s; }
            .modal-form-container .form-title .close-btn:hover { color: #dc3545; }
            .modal-form-content { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 20px 25px 25px 25px; }
            .modal-form-content::-webkit-scrollbar { width: 8px; }
            .modal-form-content::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
            .modal-form-content::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
            .modal-form-content::-webkit-scrollbar-thumb:hover { background: #555; }
            .modal-form-container .form-buttons { display: flex; gap: 10px; justify-content: center; padding: 12px 25px; border-top: 1px solid #e9ecef; background: #f8f9fa; flex-wrap: wrap; flex-shrink: 0; }
            .horizontal-form-group { margin-bottom: 15px; display: flex; align-items: flex-start; }
            .horizontal-form-group .form-label { min-width: 140px; margin-bottom: 0; margin-right: 12px; font-weight: 500; color: #495057; font-size: 14px; text-align: right; padding-top: 8px; }
            .horizontal-form-group .form-input-wrapper { flex: 1; }
            .form-row-inline { display: flex; gap: 15px; margin-bottom: 0; }
            .form-row-inline .horizontal-form-group { flex: 1; margin-bottom: 15px; }
            .error-text { color: #dc3545; font-size: 12px; margin-top: 4px; }
            .submit-error { background: #f8d7da; border: 1px solid #f5c2c7; border-radius: 6px; padding: 10px; margin-bottom: 12px; color: #842029; display: flex; align-items: center; gap: 8px; font-size: 14px; }
            .form-control.is-invalid { border-color: #dc3545; }
            .form-control { height: 36px; border-width: 2px; border-radius: 8px; font-size: 14px; padding: 6px 12px; }
            .form-control:focus { border-color: #0d6efd; box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15); }
            .form-control:disabled, .form-control[readonly] { background-color: #e9ecef; opacity: 1; cursor: not-allowed; }
            .btn { height: 36px; font-size: 14px; font-weight: 500; border-radius: 8px; padding: 0 18px; }
            .btn-clear { background-color: #6c757d !important; border-color: #6c757d !important; color: #fff !important; }
            .btn-clear:hover { background-color: #5c636a !important; border-color: #565e64 !important; }
            .btn:disabled { opacity: 0.6; cursor: not-allowed; }
            .loading-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.95); display: flex; align-items: center; justify-content: center; border-radius: 12px; z-index: 1000; }
            .spinner-border { width: 2.5rem; height: 2.5rem; border-width: 0.25em; }
            .section-divider { margin: 20px 0 15px 0; padding: 10px 0; border-top: 2px solid #e9ecef; border-bottom: 1px solid #e9ecef; }
            .section-title { font-size: 15px; font-weight: 600; color: #0d6efd; margin: 0; display: flex; align-items: center; gap: 8px; }
            .badge-existing { background-color: #0dcaf0; color: #000; font-weight: 500; padding: 3px 8px; font-size: 11px; border-radius: 4px; margin-left: 8px; }
            .badge-deleted { background-color: #dc3545; color: #fff; font-weight: 500; padding: 3px 8px; font-size: 11px; border-radius: 4px; margin-left: 8px; }
            .badge-manual { background-color: #198754; color: #fff; font-weight: 500; padding: 3px 8px; font-size: 11px; border-radius: 4px; margin-left: 8px; }
            .input-group-fetch { display: flex; gap: 10px; }
            .input-group-fetch .form-control { flex: 1; }
            .permission-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; }
            .permission-loading .spinner-border { width: 3.5rem; height: 3.5rem; margin-bottom: 1rem; }
            .info-message { background: #cfe2ff; border: 1px solid #b6d4fe; border-radius: 6px; padding: 10px; margin-bottom: 12px; color: #084298; display: flex; align-items: center; gap: 8px; font-size: 14px; }
            .data-section-with-image { display: flex; gap: 20px; align-items: flex-start; }
            .profile-image-side { flex-shrink: 0; width: 120px; }
            .profile-image-container { width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; border: 2px solid #e9ecef; border-radius: 8px; background-color: #f8f9fa; overflow: hidden; }
            .profile-image { max-width: 100%; max-height: 100%; object-fit: cover; }
            .profile-image-placeholder { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background-color: #e9ecef; border-radius: 50%; color: #6c757d; }
            .profile-image-placeholder i { font-size: 32px; }
            .data-fields { flex: 1; }
            @media (max-width: 768px) {
                .modal-form-container { max-width: 100%; max-height: 98vh; }
                .horizontal-form-group { flex-direction: column; align-items: stretch; }
                .horizontal-form-group .form-label { text-align: left; margin-bottom: 6px; margin-right: 0; padding-top: 0; min-width: auto; }
                .form-row-inline { flex-direction: column; gap: 0; }
                .data-section-with-image { flex-direction: column; }
                .profile-image-side { width: 100%; }
                .profile-image-container { width: 100%; height: 100px; }
            }
        `}
    </style>
);

// Gender options
const GENDER_OPTIONS = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' }
];

// Marital Status options
const MARITAL_STATUS_OPTIONS = [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Engaged', label: 'Engaged' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Widowed', label: 'Widowed' }
];

// ========================================
// ADD MUMIN COMPONENT
// ========================================

const AddMumin = ({
    show,
    onClose,
    onSave,
    title = "Add New Member",
    permissions
}) => {

    const [formData, setFormData] = useState({
        its_id: '',
        full_name: '',
        full_name_arabic: '',
        prefix: '',
        age: null,
        gender: null,
        marital_status: null,
        misaq: false,
        idara: '',
        category: '',
        organization: '',
        email: '',
        mobile: '',
        whatsapp_mobile: '',
        address: '',
        jamaat_id: null,
        jamaat: '',
        jamiaat_id: null,
        jamiaat: '',
        nationality: '',
        vatan: '',
        city: '',
        country: '',
        team_id: null,
        position_id: null,
        role_id: null,
        password: ''
    });

    const [errors, setErrors] = useState({});

    const [teamOptions, setTeamOptions] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);
    const [positionOptions, setPositionOptions] = useState([]);
    const [jamiaatOptions, setJamiaatOptions] = useState([]);
    const [jamaatOptions, setJamaatOptions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingITS, setLoadingITS] = useState(false);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [loadingPositions, setLoadingPositions] = useState(false);
    const [loadingJamiaats, setLoadingJamiaats] = useState(false);
    const [loadingJamaats, setLoadingJamaats] = useState(false);

    const [dataSource, setDataSource] = useState('');
    const [recordExists, setRecordExists] = useState(false);
    const [wasDeleted, setWasDeleted] = useState(false);
    const [fieldsEditable, setFieldsEditable] = useState(false);

    const [profileImage, setProfileImage] = useState(null);

    const showSuccessAlert = (message) => {
        Swal.fire({
            title: 'Success!',
            text: message,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            allowOutsideClick: false,
        }).then(() => {
            handleClose();
        });
    };

    useEffect(() => {
        if (show) {
            fetchAllRoles();
            fetchAllPositions();
            fetchAllJamiaats();
        }
    }, [show]);

    const fetchAllRoles = async () => {
        setLoadingRoles(true);
        try {
            const token = sessionStorage.getItem('access_token');
            if (!token) {
                setLoadingRoles(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Mumin/GetAllRoles`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.role_id,
                    label: item.role_name
                }));
                setRoleOptions(options);
            }
        } catch (error) {
            console.error('Error fetching Roles:', error);
        } finally {
            setLoadingRoles(false);
        }
    };

    const fetchAllPositions = async () => {
        setLoadingPositions(true);
        try {
            const token = sessionStorage.getItem('access_token');
            if (!token) {
                setLoadingPositions(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Mumin/GetAllPositions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.position_id,
                    label: item.position_name
                }));
                setPositionOptions(options);
            }
        } catch (error) {
            console.error('Error fetching Positions:', error);
        } finally {
            setLoadingPositions(false);
        }
    };

    const fetchAllJamiaats = async () => {
        setLoadingJamiaats(true);
        try {
            const token = sessionStorage.getItem('access_token');
            if (!token) {
                setLoadingJamiaats(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Venue/GetAllJamiaats`, {
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
            setLoadingJamiaats(false);
        }
    };

    const fetchJamaatsByJamiaat = async (jamiaatId) => {
        setLoadingJamaats(true);
        setJamaatOptions([]);

        try {
            const token = sessionStorage.getItem('access_token');
            if (!token) {
                setLoadingJamaats(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Venue/GetAllJamaatsByJamiaat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ jamiaat_id: jamiaatId })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.jamaat_id,
                    label: item.jamaat_name
                }));
                setJamaatOptions(options);
            }
        } catch (error) {
            console.error('Error fetching Jamaats:', error);
        } finally {
            setLoadingJamaats(false);
        }
    };

    const fetchTeamsByJamiaat = async (jamiaatId) => {
        setLoadingTeams(true);
        setTeamOptions([]);

        try {
            const token = sessionStorage.getItem('access_token');
            if (!token) {
                setLoadingTeams(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/Duty/GetTeamsByJamiaat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ jamiaat_id: jamiaatId })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.team_id,
                    label: item.team_name
                }));
                setTeamOptions(options);
            } else {
                setTeamOptions([]);
            }
        } catch (error) {
            console.error('Error fetching Teams:', error);
            setTeamOptions([]);
        } finally {
            setLoadingTeams(false);
        }
    };

    const fetchProfileImage = async (itsId) => {
        setProfileImage(null);

        try {
            const token = sessionStorage.getItem('access_token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/ITS-API/HandlerE1`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ its_id: itsId.toString() })
            });

            const result = await response.json();

            if (response.ok && result.success && result.raw_response) {
                const xmlString = result.raw_response;
                const base64Match = xmlString.match(/>([A-Za-z0-9+/=]+)</);

                if (base64Match && base64Match[1]) {
                    const base64Image = base64Match[1];
                    setProfileImage(`data:image/png;base64,${base64Image}`);
                }
            }
        } catch (error) {
            console.error('Error fetching profile image:', error);
        }
    };

    const checkMuminInDB = async (itsId) => {
        try {
            const token = sessionStorage.getItem('access_token');
            if (!token) return null;

            const response = await fetch(`${API_BASE_URL}/Mumin/GetMuminById`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ its_id: parseInt(itsId) })
            });

            const result = await response.json();

            if (response.ok && result.success && result.data && result.data.length > 0) {
                return result.data[0];
            }
            return null;
        } catch (error) {
            console.error('Error checking mumin in DB:', error);
            return null;
        }
    };

    const loadDataFromDB = (muminData) => {
        const isDeleted = muminData.status === 0 || muminData.was_deleted === true;
        setWasDeleted(isDeleted);
        setRecordExists(true);
        setFieldsEditable(true);
        setDataSource('DB');

        const jamiaatObj = muminData.jamiaat_id ? {
            value: muminData.jamiaat_id,
            label: muminData.jamiaat_name
        } : null;

        const jamaatObj = muminData.jamaat_id ? {
            value: muminData.jamaat_id,
            label: muminData.jamaat_name
        } : null;

        const teamObj = muminData.team_id ? {
            value: muminData.team_id,
            label: muminData.team_name
        } : null;

        const positionObj = muminData.position_id ? {
            value: muminData.position_id,
            label: muminData.position_name
        } : null;

        const roleObj = muminData.role_id ? {
            value: muminData.role_id,
            label: muminData.role_name
        } : null;

        const genderObj = muminData.gender ?
            GENDER_OPTIONS.find(opt => opt.value === muminData.gender) : null;

        const maritalStatusObj = muminData.marital_status ?
            MARITAL_STATUS_OPTIONS.find(opt => opt.value === muminData.marital_status) : null;

        setFormData(prev => ({
            ...prev,
            full_name: muminData.full_name || '',
            full_name_arabic: muminData.full_name_arabic || '',
            prefix: muminData.prefix || '',
            age: muminData.age || null,
            gender: genderObj,
            marital_status: maritalStatusObj,
            misaq: muminData.misaq || false,
            idara: muminData.idara || '',
            category: muminData.category || '',
            organization: muminData.organization || '',
            email: muminData.email || '',
            mobile: muminData.mobile || '',
            whatsapp_mobile: muminData.whatsapp_mobile || '',
            address: muminData.address || '',
            jamaat_id: jamaatObj,
            jamaat: muminData.jamaat_name || '',
            jamiaat_id: jamiaatObj,
            jamiaat: muminData.jamiaat_name || '',
            nationality: muminData.nationality || '',
            vatan: muminData.vatan || '',
            city: muminData.city || '',
            country: muminData.country || '',
            team_id: teamObj,
            position_id: positionObj,
            role_id: roleObj,
            password: muminData.password || ''
        }));

        if (muminData.jamiaat_id) {
            fetchJamaatsByJamiaat(muminData.jamiaat_id);
            fetchTeamsByJamiaat(muminData.jamiaat_id);
        }

        fetchProfileImage(formData.its_id);
    };

    const fetchITSData = async (itsId) => {
        if (!itsId || itsId.trim() === '') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter a valid ITS ID',
                confirmButtonText: 'OK'
            });
            return;
        }

        setLoadingITS(true);
        setDataSource('');
        setRecordExists(false);
        setWasDeleted(false);
        setFieldsEditable(false);

        try {
            const response = await fetch(`${API_BASE_URL}/ITS-API/HandlerB2`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ its_id: itsId.trim() })
            });

            const result = await response.json();

            if (response.ok && result.success && result.data?.Table && result.data.Table.length > 0) {
                const itsData = result.data.Table[0];

                setDataSource('ITS');
                setFieldsEditable(false);

                const genderObj = itsData.Gender ?
                    GENDER_OPTIONS.find(opt => opt.value === itsData.Gender) : null;

                const maritalStatusObj = itsData.Marital_Status ?
                    MARITAL_STATUS_OPTIONS.find(opt => opt.value === itsData.Marital_Status) : null;

                setFormData(prev => ({
                    ...prev,
                    its_id: itsData.ITS_ID || itsId,
                    full_name: itsData.Fullname || '',
                    full_name_arabic: itsData.Arabic_Fullname || '',
                    prefix: itsData.Prefix || '',
                    age: itsData.Age || null,
                    gender: genderObj,
                    marital_status: maritalStatusObj,
                    misaq: itsData.Misaq === 'Done' ? true : false,
                    idara: itsData.Idara || '',
                    category: itsData.Category || '',
                    organization: itsData.Organization || '',
                    email: itsData.Email || '',
                    mobile: itsData.Mobile || '',
                    whatsapp_mobile: itsData.WhatsApp_No || '',
                    address: itsData.Address || '',
                    jamaat_id: itsData.Jamaat_ID || null,
                    jamaat: itsData.Jamaat || '',
                    jamiaat_id: itsData.Jamiaat_ID || null,
                    jamiaat: itsData.Jamiaat || '',
                    nationality: itsData.Nationality || '',
                    vatan: itsData.Vatan || '',
                    city: itsData.City || '',
                    country: itsData.Country || ''
                }));

                if (itsData.Jamiaat_ID) {
                    await fetchTeamsByJamiaat(itsData.Jamiaat_ID);
                }

                const dbData = await checkMuminInDB(itsId);
                if (dbData) {
                    const isDeleted = dbData.status === 0 || dbData.was_deleted === true;
                    setWasDeleted(isDeleted);
                    setRecordExists(true);

                    const teamObj = dbData.team_id ? {
                        value: dbData.team_id,
                        label: dbData.team_name
                    } : null;

                    const positionObj = dbData.position_id ? {
                        value: dbData.position_id,
                        label: dbData.position_name
                    } : null;

                    const roleObj = dbData.role_id ? {
                        value: dbData.role_id,
                        label: dbData.role_name
                    } : null;

                    setFormData(prev => ({
                        ...prev,
                        team_id: teamObj,
                        position_id: positionObj,
                        role_id: roleObj,
                        password: dbData.password || prev.password
                    }));
                } else {
                    if (itsData.Mobile) {
                        const mobile = itsData.Mobile.replace(/\D/g, '');
                        if (mobile.length >= 4) {
                            const last4Digits = mobile.slice(-4);
                            setFormData(prev => ({ ...prev, password: last4Digits }));
                        }
                    }
                }

                fetchProfileImage(itsId);
                setLoadingITS(false);
                return;
            }

            console.log('ITS API failed, checking database...');
            const dbData = await checkMuminInDB(itsId);

            if (dbData) {
                console.log('Found in database, loading data...');
                loadDataFromDB(dbData);
                setLoadingITS(false);
                return;
            }

            console.log('Not found anywhere, enabling manual entry...');
            setDataSource('MANUAL');
            setFieldsEditable(true);
            setRecordExists(false);

            Swal.fire({
                icon: 'info',
                title: 'Manual Entry Mode',
                text: 'ITS ID not found. Please fill in all fields manually.',
                confirmButtonText: 'OK'
            });

        } catch (error) {
            console.error('Error in fetch flow:', error);

            const dbData = await checkMuminInDB(itsId);
            if (dbData) {
                loadDataFromDB(dbData);
            } else {
                setDataSource('MANUAL');
                setFieldsEditable(true);

                Swal.fire({
                    icon: 'warning',
                    title: 'Error Fetching Data',
                    text: 'Unable to fetch from ITS. Please fill in fields manually.',
                    confirmButtonText: 'OK'
                });
            }
        } finally {
            setLoadingITS(false);
        }
    };

    const handleITSIdChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, its_id: value }));

        if (dataSource) {
            setDataSource('');
            setRecordExists(false);
            setWasDeleted(false);
            setFieldsEditable(false);
            setProfileImage(null);
        }

        if (errors.its_id) {
            setErrors(prev => ({ ...prev, its_id: '' }));
        }
    };

    const handleFetchITSData = () => {
        fetchITSData(formData.its_id);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSelectChange = (name, selectedOption) => {
        setFormData(prev => ({ ...prev, [name]: selectedOption }));

        // Handle cascading dropdowns
        if (name === 'jamiaat_id' && selectedOption) {
            fetchJamaatsByJamiaat(selectedOption.value);
            fetchTeamsByJamiaat(selectedOption.value);
            // Reset jamaat and team when jamiaat changes
            setFormData(prev => ({ ...prev, jamaat_id: null, team_id: null }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.its_id || formData.its_id.trim() === '') {
            newErrors.its_id = 'ITS ID is required';
        }

        if (!dataSource) {
            newErrors.its_id = 'Please fetch data first';
        }

        if (dataSource === 'MANUAL') {
            if (!formData.full_name || formData.full_name.trim() === '') {
                newErrors.full_name = 'Full name is required';
            }
            if (!formData.jamiaat_id) {
                newErrors.jamiaat_id = 'Jamiaat is required';
            }
            if (!formData.jamaat_id) {
                newErrors.jamaat_id = 'Jamaat is required';
            }
        }

        if (!formData.team_id) newErrors.team_id = 'Team is required';
        if (!formData.position_id) newErrors.position_id = 'Position is required';
        if (!formData.role_id) newErrors.role_id = 'Role is required';
        if (!formData.password || formData.password.trim() === '') {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const token = sessionStorage.getItem('access_token');
            if (!token) throw new Error('Authentication token not found. Please login again.');

            const payload = {
                its_id: parseInt(formData.its_id),
                full_name: formData.full_name,
                full_name_arabic: formData.full_name_arabic,
                prefix: formData.prefix,
                age: formData.age,
                gender: formData.gender?.value || formData.gender || '',
                marital_status: formData.marital_status?.value || formData.marital_status || '',
                misaq: formData.misaq,
                idara: formData.idara,
                category: formData.category,
                organization: formData.organization,
                email: formData.email,
                mobile: formData.mobile,
                whatsapp_mobile: formData.whatsapp_mobile,
                address: formData.address,
                jamaat_id: formData.jamaat_id?.value || formData.jamaat_id || null,
                jamaat_name: formData.jamaat_id?.label || formData.jamaat || '',
                jamiaat_id: formData.jamiaat_id?.value || formData.jamiaat_id || null,
                jamiaat_name: formData.jamiaat_id?.label || formData.jamiaat || '',
                nationality: formData.nationality,
                vatan: formData.vatan,
                city: formData.city,
                country: formData.country,
                team_id: formData.team_id?.value || 0,
                position_id: formData.position_id?.value || 0,
                joining_date: new Date().toISOString().split('T')[0],
                role_id: formData.role_id?.value || 0,
                password: formData.password
            };

            const response = await fetch(`${API_BASE_URL}/Mumin/InsertMumin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const result_code = Number(result.data?.result_code || 0);

                if (result_code === 1 || result_code === 2 || result_code === 4) {
                    if (onSave) onSave(formData);

                    let message = result.message;
                    if (!message) {
                        if (result_code === 1) message = 'Member added successfully!';
                        else if (result_code === 2) message = 'Member updated successfully!';
                        else if (result_code === 4) message = 'Member restored and updated successfully!';
                    }

                    showSuccessAlert(message);
                } else {
                    throw new Error(result.message || 'Failed to save member');
                }
            } else {
                throw new Error(result.message || 'Failed to save member');
            }
        } catch (error) {
            console.error('Error saving member:', error);
            setErrors({ submit: error.message });
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred while saving.',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        handleClear();
        if (onClose) onClose();
    };

    const handleClear = () => {
        setFormData({
            its_id: '', full_name: '', full_name_arabic: '', prefix: '', age: null, gender: null,
            marital_status: null, misaq: false, idara: '', category: '', organization: '', email: '',
            mobile: '', whatsapp_mobile: '', address: '', jamaat_id: null, jamaat: '', jamiaat_id: null,
            jamiaat: '', nationality: '', vatan: '', city: '', country: '', team_id: null, position_id: null,
            role_id: null, password: ''
        });
        setErrors({});
        setTeamOptions([]);
        setJamaatOptions([]);
        setDataSource('');
        setRecordExists(false);
        setWasDeleted(false);
        setFieldsEditable(false);
        setProfileImage(null);
    };

    const selectStyles = {
        control: (base, state) => ({
            ...base, minHeight: '36px', height: '36px',
            borderColor: state.selectProps.error ? '#dc3545' : (state.isFocused ? '#0d6efd' : '#dee2e6'),
            borderWidth: '2px', borderRadius: '8px',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.15)' : 'none',
            '&:hover': { borderColor: state.selectProps.error ? '#dc3545' : '#adb5bd' }
        }),
        valueContainer: (base) => ({ ...base, height: '36px', padding: '0 8px' }),
        input: (base) => ({ ...base, margin: '0', padding: '0' }),
        indicatorsContainer: (base) => ({ ...base, height: '36px' }),
        placeholder: (base) => ({ ...base, color: '#6c757d', fontSize: '14px' }),
        singleValue: (base) => ({ ...base, fontSize: '14px' }),
        menu: (base) => ({ ...base, zIndex: 1000 })
    };

    if (!show) return null;

    let badgeComponent = null;
    let buttonText = 'Save';

    if (wasDeleted) {
        badgeComponent = <span className="badge-deleted">Previously Deleted - Will Restore</span>;
        buttonText = 'Restore & Update';
    } else if (recordExists && dataSource === 'ITS') {
        badgeComponent = <span className="badge-existing">Existing Record</span>;
        buttonText = 'Update';
    } else if (dataSource === 'DB') {
        badgeComponent = <span className="badge-existing">From Database</span>;
        buttonText = recordExists ? 'Update' : 'Save';
    } else if (dataSource === 'MANUAL') {
        badgeComponent = <span className="badge-manual">Manual Entry</span>;
        buttonText = 'Save';
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <ModalStyles />

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
                        <i className="ri-user-add-line me-2"></i>{title}
                        {badgeComponent}
                    </span>
                    <button className="close-btn" onClick={handleClose} title="Close" disabled={loading}>
                        &times;
                    </button>
                </div>

                <div className="modal-form-content">
                    {errors.submit && (
                        <div className="submit-error">
                            <i className="ri-error-warning-line"></i>
                            <span>{errors.submit}</span>
                        </div>
                    )}

                    {dataSource === 'MANUAL' && (
                        <div className="info-message">
                            <i className="ri-information-line"></i>
                            <span>ITS data not available. Please fill in all fields manually.</span>
                        </div>
                    )}

                    {dataSource === 'DB' && (
                        <div className="info-message">
                            <i className="ri-information-line"></i>
                            <span>ITS API unavailable. Data loaded from database. All fields are editable.</span>
                        </div>
                    )}

                    {/* ITS ID Input */}
                    <div className="horizontal-form-group">
                        <Form.Label>ITS ID <span className="text-danger">*</span></Form.Label>
                        <div className="form-input-wrapper">
                            <div className="input-group-fetch">
                                <Form.Control
                                    type="text"
                                    name="its_id"
                                    value={formData.its_id}
                                    onChange={handleITSIdChange}
                                    placeholder="Enter ITS ID"
                                    className={errors.its_id ? 'is-invalid' : ''}
                                    disabled={loading || !!dataSource}
                                />
                                <Button
                                    variant="primary"
                                    onClick={handleFetchITSData}
                                    disabled={loading || loadingITS || !formData.its_id || !!dataSource}
                                >
                                    <i className="ri-search-line me-1"></i>Fetch Data
                                </Button>
                            </div>
                            {errors.its_id && <div className="error-text">{errors.its_id}</div>}
                        </div>
                    </div>

                    {dataSource && (
                        <>
                            <div className="section-divider">
                                <h6 className="section-title">
                                    <i className="ri-information-line"></i>
                                    {dataSource === 'ITS' && 'ITS Data (View Only)'}
                                    {dataSource === 'DB' && 'Database Data (Editable)'}
                                    {dataSource === 'MANUAL' && 'Manual Entry (All Fields Editable)'}
                                </h6>
                            </div>

                            <div className="data-section-with-image">
                                {/* Profile Image on Left */}
                                {(dataSource === 'ITS' || dataSource === 'DB') && profileImage && (
                                    <div className="profile-image-side">
                                        <div className="profile-image-container">
                                            <img src={profileImage} alt="Profile" className="profile-image" />
                                        </div>
                                    </div>
                                )}

                                {/* Data Fields */}
                                <div className="data-fields">
                                    <div className="form-row-inline">
                                        <div className="horizontal-form-group">
                                            <Form.Label>Full Name {dataSource === 'MANUAL' && <span className="text-danger">*</span>}</Form.Label>
                                            <div className="form-input-wrapper">
                                                <Form.Control
                                                    type="text"
                                                    name="full_name"
                                                    value={formData.full_name}
                                                    onChange={handleInputChange}
                                                    readOnly={!fieldsEditable}
                                                    disabled={!fieldsEditable}
                                                    className={errors.full_name ? 'is-invalid' : ''}
                                                />
                                                {errors.full_name && <div className="error-text">{errors.full_name}</div>}
                                            </div>
                                        </div>
                                        <div className="horizontal-form-group">
                                            <Form.Label>Arabic Name</Form.Label>
                                            <div className="form-input-wrapper">
                                                <Form.Control
                                                    type="text"
                                                    name="full_name_arabic"
                                                    value={formData.full_name_arabic}
                                                    onChange={handleInputChange}
                                                    readOnly={!fieldsEditable}
                                                    disabled={!fieldsEditable}
                                                    style={{ direction: 'rtl' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-row-inline">
                                        <div className="horizontal-form-group">
                                            <Form.Label>Age</Form.Label>
                                            <div className="form-input-wrapper">
                                                <Form.Control
                                                    type="number"
                                                    name="age"
                                                    value={formData.age || ''}
                                                    onChange={handleInputChange}
                                                    readOnly={!fieldsEditable}
                                                    disabled={!fieldsEditable}
                                                />
                                            </div>
                                        </div>
                                        <div className="horizontal-form-group">
                                            <Form.Label>Gender</Form.Label>
                                            <div className="form-input-wrapper">
                                                <Select
                                                    options={GENDER_OPTIONS}
                                                    value={formData.gender}
                                                    onChange={(option) => handleSelectChange('gender', option)}
                                                    placeholder="Select gender"
                                                    isClearable
                                                    isDisabled={!fieldsEditable}
                                                    styles={selectStyles}
                                                />
                                            </div>
                                        </div>
                                        <div className="horizontal-form-group">
                                            <Form.Label>Marital Status</Form.Label>
                                            <div className="form-input-wrapper">
                                                <Select
                                                    options={MARITAL_STATUS_OPTIONS}
                                                    value={formData.marital_status}
                                                    onChange={(option) => handleSelectChange('marital_status', option)}
                                                    placeholder="Select status"
                                                    isClearable
                                                    isDisabled={!fieldsEditable}
                                                    styles={selectStyles}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-row-inline">
                                        <div className="horizontal-form-group">
                                            <Form.Label>Email</Form.Label>
                                            <div className="form-input-wrapper">
                                                <Form.Control
                                                    type="text"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    readOnly={!fieldsEditable}
                                                    disabled={!fieldsEditable}
                                                />
                                            </div>
                                        </div>
                                        <div className="horizontal-form-group">
                                            <Form.Label>Mobile</Form.Label>
                                            <div className="form-input-wrapper">
                                                <Form.Control
                                                    type="text"
                                                    name="mobile"
                                                    value={formData.mobile}
                                                    onChange={handleInputChange}
                                                    readOnly={!fieldsEditable}
                                                    disabled={!fieldsEditable}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Jamiaat and Jamaat */}
                                    {(dataSource === 'MANUAL' || dataSource === 'DB') ? (
                                        <div className="form-row-inline">
                                            <div className="horizontal-form-group">
                                                <Form.Label>Jamiaat <span className="text-danger">*</span></Form.Label>
                                                <div className="form-input-wrapper">
                                                    <Select
                                                        options={jamiaatOptions}
                                                        value={formData.jamiaat_id}
                                                        onChange={(option) => handleSelectChange('jamiaat_id', option)}
                                                        placeholder="Select jamiaat"
                                                        isClearable
                                                        isDisabled={loading || loadingJamiaats}
                                                        isLoading={loadingJamiaats}
                                                        styles={selectStyles}
                                                        error={errors.jamiaat_id}
                                                    />
                                                    {errors.jamiaat_id && <div className="error-text">{errors.jamiaat_id}</div>}
                                                </div>
                                            </div>
                                            <div className="horizontal-form-group">
                                                <Form.Label>Jamaat <span className="text-danger">*</span></Form.Label>
                                                <div className="form-input-wrapper">
                                                    <Select
                                                        options={jamaatOptions}
                                                        value={formData.jamaat_id}
                                                        onChange={(option) => handleSelectChange('jamaat_id', option)}
                                                        placeholder={loadingJamaats ? "Loading..." : "Select jamaat"}
                                                        isClearable
                                                        isDisabled={loading || loadingJamaats || !formData.jamiaat_id}
                                                        isLoading={loadingJamaats}
                                                        styles={selectStyles}
                                                        error={errors.jamaat_id}
                                                    />
                                                    {errors.jamaat_id && <div className="error-text">{errors.jamaat_id}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="form-row-inline">
                                            <div className="horizontal-form-group">
                                                <Form.Label>Jamaat</Form.Label>
                                                <div className="form-input-wrapper">
                                                    <Form.Control type="text" value={formData.jamaat} readOnly disabled />
                                                </div>
                                            </div>
                                            <div className="horizontal-form-group">
                                                <Form.Label>Jamiaat</Form.Label>
                                                <div className="form-input-wrapper">
                                                    <Form.Control type="text" value={formData.jamiaat} readOnly disabled />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="horizontal-form-group">
                                        <Form.Label>Organization</Form.Label>
                                        <div className="form-input-wrapper">
                                            <Form.Control
                                                type="text"
                                                name="organization"
                                                value={formData.organization}
                                                onChange={handleInputChange}
                                                readOnly={!fieldsEditable}
                                                disabled={!fieldsEditable}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="section-divider">
                                <h6 className="section-title">
                                    <i className="ri-user-settings-line"></i>Assignment Details (Required)
                                </h6>
                            </div>

                            <div className="horizontal-form-group">
                                <Form.Label>Team <span className="text-danger">*</span></Form.Label>
                                <div className="form-input-wrapper">
                                    <Select
                                        options={teamOptions}
                                        value={formData.team_id}
                                        onChange={(option) => handleSelectChange('team_id', option)}
                                        placeholder={loadingTeams ? "Loading..." : "Select team"}
                                        isClearable
                                        isDisabled={loading || loadingTeams}
                                        isLoading={loadingTeams}
                                        styles={selectStyles}
                                        error={errors.team_id}
                                    />
                                    {errors.team_id && <div className="error-text">{errors.team_id}</div>}
                                </div>
                            </div>

                            <div className="form-row-inline">
                                <div className="horizontal-form-group">
                                    <Form.Label>Position <span className="text-danger">*</span></Form.Label>
                                    <div className="form-input-wrapper">
                                        <Select
                                            options={positionOptions}
                                            value={formData.position_id}
                                            onChange={(option) => handleSelectChange('position_id', option)}
                                            placeholder="Select position"
                                            isClearable
                                            isDisabled={loading || loadingPositions}
                                            isLoading={loadingPositions}
                                            styles={selectStyles}
                                            error={errors.position_id}
                                        />
                                        {errors.position_id && <div className="error-text">{errors.position_id}</div>}
                                    </div>
                                </div>
                                <div className="horizontal-form-group">
                                    <Form.Label>Role <span className="text-danger">*</span></Form.Label>
                                    <div className="form-input-wrapper">
                                        <Select
                                            options={roleOptions}
                                            value={formData.role_id}
                                            onChange={(option) => handleSelectChange('role_id', option)}
                                            placeholder="Select role"
                                            isClearable
                                            isDisabled={loading || loadingRoles}
                                            isLoading={loadingRoles}
                                            styles={selectStyles}
                                            error={errors.role_id}
                                        />
                                        {errors.role_id && <div className="error-text">{errors.role_id}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="form-row-inline">
                                <div className="horizontal-form-group">
                                    <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                                    <div className="form-input-wrapper">
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter password"
                                            className={errors.password ? 'is-invalid' : ''}
                                            disabled={loading}
                                        />
                                        {errors.password && <div className="error-text">{errors.password}</div>}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="form-buttons">
                    {dataSource && (
                        <Button variant="primary" onClick={handleSave} disabled={loading}>
                            <i className="ri-save-line me-1"></i>
                            {loading ? 'Saving...' : buttonText}
                        </Button>
                    )}
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
// MUMIN TABLE COMPONENT
// ========================================

const MuminTable = () => {
    const navigate = useNavigate();

    const [showAddForm, setShowAddForm] = useState(false);
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
            fetchMumins();
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
                text: 'You do not have permission to access Member Master module',
                confirmButtonText: 'OK',
                allowOutsideClick: false
            }).then(() => {
                window.location.href = '/dashboard';
            });
            return;
        }

        setPermissions(modulePermissions);
        setCheckingPermissions(false);
        fetchMumins();
    };

    const fetchMumins = async () => {
        try {
            setLoading(true);
            setError(null);

            const accessToken = sessionStorage.getItem('access_token');
            if (!accessToken) {
                throw new Error('Access token not found. Please login again.');
            }

            const response = await fetch(`${API_BASE_URL}/Mumin/GetAllMumin`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                const transformedData = result.data.map((item, index) => ({
                    id: item.its_id,
                    srNo: index + 1,
                    itsId: item.its_id,
                    fullName: item.full_name,
                    email: item.email,
                    mobile: item.mobile,
                    teamName: item.team_name,
                    positionName: item.position_name,
                    jamiaatName: item.jamiaat_name
                }));
                setTableData(transformedData);
            } else {
                throw new Error(result.message || 'Failed to fetch Members');
            }
        } catch (err) {
            console.error('Error fetching Members:', err);
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
                text: 'You do not have permission to add Members',
                confirmButtonText: 'OK'
            });
            return;
        }
        setShowAddForm(true);
    };

    const handleCloseModal = () => setShowAddForm(false);

    const handleSave = (data) => {
        setShowAddForm(false);
        fetchMumins();
        setGridKey(prev => prev + 1);
    };

    const handleDelete = async (itsId) => {
        if (!permissions.canDelete) {
            Swal.fire({
                icon: 'warning',
                title: 'Permission Denied',
                text: 'You do not have permission to delete Members',
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
                const token = sessionStorage.getItem('access_token');
                const response = await fetch(`${API_BASE_URL}/Mumin/DeleteMumin`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ its_id: itsId })
                });

                const deleteResult = await response.json();

                if (response.ok && deleteResult.success) {
                    Swal.fire('Deleted!', 'Record has been deleted.', 'success');
                    fetchMumins();
                    setGridKey(prev => prev + 1);
                } else {
                    Swal.fire('Error!', deleteResult.message || 'Failed to delete.', 'error');
                }
            } catch (error) {
                Swal.fire('Error!', error.message, 'error');
            }
        }
    };

    useEffect(() => {
        window.handleDeleteMuminClick = handleDelete;
        return () => {
            delete window.handleDeleteMuminClick;
        };
    }, [tableData, permissions.canDelete]);

    const gridData = useMemo(() => {
        return tableData.map(item => [
            item.srNo,
            item.itsId,
            item.fullName,
            item.email,
            item.mobile,
            item.teamName,
            item.positionName,
            item.jamiaatName,
            item.itsId
        ]);
    }, [tableData]);

    if (checkingPermissions) {
        return (
            <Fragment>
                <ModalStyles />
                <div className="permission-loading">
                    <div className="spinner-border text-primary" role="status">
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
            <style>{`
                #grid-mumin-table .gridjs-search { width: 100%; margin-bottom: 1rem; }
                #grid-mumin-table .gridjs-search-input { width: 100%; padding: 8px 12px; border: 1px solid #dee2e6; border-radius: 6px; }
                #grid-mumin-table .gridjs-wrapper { margin-top: 0.5rem; }
                .btn-action-group { display: inline-flex; gap: 10px; align-items: center; }
                .btn-action-group .btn { margin: 0 !important; }
            `}</style>

            <ModalStyles />

            <AddMumin
                show={showAddForm}
                onClose={handleCloseModal}
                onSave={handleSave}
                permissions={permissions}
            />

            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>
                                <div
                                    className="page-header-title"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '20px'
                                    }}
                                >
                                    <div className="header-text">
                                        <i className="ri-user-line me-2"></i>
                                        <span>Member Master</span>
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
                                    <div className="text-center p-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="text-center p-5 text-danger">{error}</div>
                                ) : (
                                    <div id="grid-mumin-table">
                                        <Grid
                                            key={gridKey}
                                            data={gridData}
                                            columns={[
                                                { name: 'Sr', width: '60px' },
                                                { name: 'ITS ID', width: '100px' },
                                                { name: 'Full Name', width: '200px' },
                                                { name: 'Email', width: '180px' },
                                                { name: 'Mobile', width: '130px' },
                                                { name: 'Team', width: '150px' },
                                                { name: 'Position', width: '120px' },
                                                { name: 'Jamiaat', width: '120px' },
                                                {
                                                    name: 'Action',
                                                    width: '70px',
                                                    formatter: (cell, row) => {
                                                        if (!permissions.canDelete) {
                                                            return html(`<span class="text-muted">-</span>`);
                                                        }
                                                        return html(`
                                                            <div class="btn-action-group">
                                                                <button 
                                                                    class="btn btn-sm btn-danger-transparent btn-icon" 
                                                                    onclick="handleDeleteMuminClick(${row.cells[8].data})"
                                                                    title="Delete"
                                                                >
                                                                    <i class="ri-delete-bin-line"></i>
                                                                </button>
                                                            </div>
                                                        `);
                                                    }
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

export default MuminTable;