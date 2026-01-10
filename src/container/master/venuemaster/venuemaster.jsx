// import { Fragment, useState, useEffect, useMemo } from 'react';
// import { Card, Col, Row, Form, Button } from 'react-bootstrap';
// import { Grid } from 'gridjs-react';
// import { html } from 'gridjs';
// import 'gridjs/dist/theme/mermaid.css';
// import IconButton from '../../elements/button'; 
// import Swal from 'sweetalert2';
// import '../../../styles/shared-styles.css';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const AddVenue = ({ 
//     show,
//     onClose,
//     onSave,
//     title = "Add New Venue"
// }) => {
    
//     const [formData, setFormData] = useState({
//         venueName: ''
//     });

//     const [errors, setErrors] = useState({
//         venueName: ''
//     });

//     const [isLoading, setIsLoading] = useState(false);

//     const showSuccessAlert = (message) => {
//         Swal.fire({
//             title: 'Success!',
//             text: `${message}`,
//             icon: 'success',
//             timer: 2000,
//             timerProgressBar: false,
//             showConfirmButton: false,
//             allowOutsideClick: false,
//         }).then((result) => {
//             if (result.dismiss === Swal.DismissReason.timer) {
//                 handleClose();
//             }
//         });
//     };

//     useEffect(() => {
//         if (show) {
//             handleClear();
//         }
//     }, [show]);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//         if (errors[name]) {
//             setErrors(prev => ({
//                 ...prev,
//                 [name]: ''
//             }));
//         }
//     };

//     const validateForm = () => {
//         const newErrors = {
//             venueName: ''
//         };

//         let isValid = true;

//         if (!formData.venueName.trim()) {
//             newErrors.venueName = 'Venue name is required';
//             isValid = false;
//         }

//         setErrors(newErrors);
//         return isValid;
//     };

//     const handleSave = async () => {
//         if (!validateForm()) {
//             return;
//         }

//         setIsLoading(true);

//         try {
//             const token = sessionStorage.getItem('access_token');

//             if (!token) {
//                 throw new Error('Authentication token not found. Please login again.');
//             }

//             const payload = {
//                 venue_name: formData.venueName.trim()
//             };
            
//             const response = await fetch(`${API_BASE_URL}/Venue/InsertVenue`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify(payload)
//             });

//             const result = await response.json();
            
//             if (response.status === 401) {
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Error',
//                     text: 'Session expired. Please login again.',
//                     confirmButtonText: 'OK'
//                 });
//                 return;
//             }

//             if (response.ok && result.success) {
//                 const resultCode = Number(result.data?.result_code);
                
//                 if (resultCode === 1) {
//                     if (onSave) {
//                         const dataToSave = {
//                             venueName: formData.venueName
//                         };
//                         onSave(dataToSave);
//                     }
                    
//                     showSuccessAlert(result.message || 'Venue added successfully!');
//                 } else if (resultCode === 4) {
//                     setErrors(prev => ({
//                         ...prev,
//                         venueName: 'Venue name already exists'
//                     }));
//                     Swal.fire({
//                         icon: 'error',
//                         title: 'Error',
//                         text: 'Venue name already exists',
//                         confirmButtonText: 'OK'
//                     });
//                 } else {
//                     throw new Error(result.message || 'Failed to add venue');
//                 }
//             } else {
//                 throw new Error(result.message || 'Failed to add venue');
//             }
//         } catch (error) {
//             console.error('Error saving venue:', error);
//             setErrors({ submit: error.message });
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: error.message || 'An error occurred while saving the venue. Please try again.',
//                 confirmButtonText: 'OK'
//             });
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleClose = () => {
//         handleClear();
//         if (onClose) {
//             onClose();
//         }
//     };

//     const handleClear = () => {
//         setFormData({
//             venueName: ''
//         });
//         setErrors({
//             venueName: ''
//         });
//     };

//     if (!show) return null;

//     return (
//         <div className="modal-overlay" onClick={handleClose}>
//             <style>
//                 {`
//                     .modal-overlay {
//                         position: fixed;
//                         top: 0;
//                         left: 0;
//                         right: 0;
//                         bottom: 0;
//                         background: rgba(0, 0, 0, 0.5);
//                         backdrop-filter: blur(4px);
//                         display: flex;
//                         align-items: center;
//                         justify-content: center;
//                         z-index: 1050;
//                         animation: fadeIn 0.2s ease;
//                         padding: 20px;
//                     }

//                     @keyframes fadeIn {
//                         from { opacity: 0; }
//                         to { opacity: 1; }
//                     }

//                     @keyframes slideIn {
//                         from {
//                             opacity: 0;
//                             transform: translateY(-20px);
//                         }
//                         to {
//                             opacity: 1;
//                             transform: translateY(0);
//                         }
//                     }

//                     .modal-form-container {
//                         background: #fff;
//                         border-radius: 12px;
//                         padding: 25px;
//                         width: 100%;
//                         max-width: 500px;
//                         max-height: 95vh;
//                         overflow-y: auto;
//                         box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
//                         animation: slideIn 0.3s ease;
//                         position: relative;
//                     }

//                     .modal-form-container .form-title {
//                         font-size: 20px;
//                         font-weight: 600;
//                         margin-bottom: 20px;
//                         color: #333;
//                         border-bottom: 2px solid #0d6efd;
//                         padding-bottom: 12px;
//                         display: flex;
//                         align-items: center;
//                         justify-content: space-between;
//                     }

//                     .modal-form-container .form-title .close-btn {
//                         background: none;
//                         border: none;
//                         font-size: 24px;
//                         color: #666;
//                         cursor: pointer;
//                         padding: 0;
//                         line-height: 1;
//                         transition: color 0.2s;
//                     }

//                     .modal-form-container .form-title .close-btn:hover {
//                         color: #dc3545;
//                     }

//                     .modal-form-container .form-buttons {
//                         display: flex;
//                         gap: 10px;
//                         margin-top: 25px;
//                         justify-content: center;
//                         padding-top: 15px;
//                         border-top: 1px solid #e9ecef;
//                         flex-wrap: wrap;
//                     }

//                     .horizontal-form-group {
//                         margin-bottom: 20px;
//                         display: flex;
//                         align-items: flex-start;
//                     }

//                     .horizontal-form-group .form-label {
//                         min-width: 120px;
//                         margin-bottom: 0;
//                         margin-right: 15px;
//                         font-weight: 500;
//                         color: #495057;
//                         font-size: 14px;
//                         text-align: right;
//                         padding-top: 8px;
//                     }

//                     .horizontal-form-group .form-input-wrapper {
//                         flex: 1;
//                     }

//                     .error-text {
//                         color: #dc3545;
//                         font-size: 12px;
//                         margin-top: 4px;
//                     }

//                     .submit-error {
//                         background: #f8d7da;
//                         border: 1px solid #f5c2c7;
//                         border-radius: 6px;
//                         padding: 12px;
//                         margin-bottom: 15px;
//                         color: #842029;
//                         display: flex;
//                         align-items: center;
//                         gap: 10px;
//                     }

//                     .form-control.is-invalid {
//                         border-color: #dc3545;
//                     }

//                     .form-control {
//                         height: 38px;
//                         border-width: 2px;
//                         border-radius: 8px;
//                         font-size: 15px;
//                     }

//                     .form-control:focus {
//                         border-color: #0d6efd;
//                         box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
//                     }

//                     .btn {
//                         height: 38px;
//                         font-size: 14px;
//                         font-weight: 500;
//                         border-radius: 8px;
//                         padding: 0 20px;
//                     }

//                     .btn-clear {
//                         background-color: #6c757d !important;
//                         border-color: #6c757d !important;
//                         color: #fff !important;
//                     }

//                     .btn-clear:hover {
//                         background-color: #5c636a !important;
//                         border-color: #565e64 !important;
//                     }

//                     .btn:disabled {
//                         opacity: 0.6;
//                         cursor: not-allowed;
//                     }

//                     .loading-overlay {
//                         position: absolute;
//                         top: 0;
//                         left: 0;
//                         right: 0;
//                         bottom: 0;
//                         background: rgba(255, 255, 255, 0.9);
//                         display: flex;
//                         align-items: center;
//                         justify-content: center;
//                         border-radius: 12px;
//                         z-index: 10;
//                     }

//                     .spinner-border {
//                         width: 3rem;
//                         height: 3rem;
//                         border-width: 0.3em;
//                     }

//                     @media (max-width: 768px) {
//                         .modal-form-container {
//                             padding: 20px;
//                             max-width: 100%;
//                         }

//                         .horizontal-form-group {
//                             flex-direction: column;
//                             align-items: stretch;
//                         }

//                         .horizontal-form-group .form-label {
//                             text-align: left;
//                             margin-bottom: 8px;
//                             margin-right: 0;
//                             padding-top: 0;
//                             min-width: auto;
//                         }

//                         .modal-form-container .form-buttons {
//                             flex-direction: column;
//                         }

//                         .modal-form-container .form-buttons .btn {
//                             width: 100%;
//                         }
//                     }
//                 `}
//             </style>

//             <div className="modal-form-container" onClick={(e) => e.stopPropagation()}>
//                 {isLoading && (
//                     <div className="loading-overlay">
//                         <div className="spinner-border text-primary" role="status">
//                             <span className="visually-hidden">Loading...</span>
//                         </div>
//                     </div>
//                 )}

//                 <div className="form-title">
//                     <span>
//                         <i className="ri-add-circle-line me-2"></i>
//                         {title}
//                     </span>
//                     <button className="close-btn" onClick={handleClose} title="Close" disabled={isLoading}>
//                         &times;
//                     </button>
//                 </div>
                
//                 {errors.submit && (
//                     <div className="submit-error">
//                         <i className="ri-error-warning-line"></i>
//                         <span>{errors.submit}</span>
//                     </div>
//                 )}

//                 <div className="horizontal-form-group">
//                     <Form.Label>Venue Name <span className="text-danger">*</span></Form.Label>
//                     <div className="form-input-wrapper">
//                         <Form.Control
//                             type="text"
//                             name="venueName"
//                             value={formData.venueName}
//                             onChange={handleInputChange}
//                             placeholder="Enter venue name"
//                             className={errors.venueName ? 'is-invalid' : ''}
//                             disabled={isLoading}
//                         />
//                         {errors.venueName && <div className="error-text">{errors.venueName}</div>}
//                     </div>
//                 </div>

//                 <div className="form-buttons">
//                     <Button variant="primary" onClick={handleSave} disabled={isLoading}>
//                         <i className="ri-save-line me-1"></i> {isLoading ? 'Saving...' : 'Save'}
//                     </Button>
//                     <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
//                         <i className="ri-arrow-left-line me-1"></i> Back
//                     </Button>
//                     <Button className="btn-clear" onClick={handleClear} disabled={isLoading}>
//                         <i className="ri-refresh-line me-1"></i> Clear
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const EditVenue = ({ 
//     show, 
//     onClose, 
//     onUpdate, 
//     venueId,
//     title = "Edit Venue"
// }) => {
//     // Similar implementation with edit functionality
//     // Placeholder for brevity - full implementation follows same pattern as AddVenue
//     if (!show) return null;
//     return null;
// };

// const VenueTable = () => {
//     const [showAddForm, setShowAddForm] = useState(false);
//     const [showEditForm, setShowEditForm] = useState(false);
//     const [editVenueId, setEditVenueId] = useState(null);
//     const [tableData, setTableData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [gridKey, setGridKey] = useState(0);

//     const fetchVenues = async () => {
//         try {
//             setLoading(true);
//             setError(null);

//             const accessToken = sessionStorage.getItem('access_token');
            
//             if (!accessToken) {
//                 throw new Error('Access token not found. Please login again.');
//             }

//             const apiUrl = `${API_BASE_URL}/Venue/GetAllVenues`;

//             const response = await fetch(apiUrl, {
//                 method: 'GET',
//                 headers: {
//                     'Accept': 'application/json',
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${accessToken}`
//                 }
//             });

//             const contentType = response.headers.get('content-type');
//             if (!contentType || !contentType.includes('application/json')) {
//                 const textResponse = await response.text();
//                 console.error('Non-JSON response received:', textResponse.substring(0, 200));
//                 throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
//             }

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
//             }

//             const result = await response.json();

//             if (result.success && result.data) {
//                 const transformedData = result.data.map((item, index) => ({
//                     id: item.venue_id,
//                     srNo: index + 1,
//                     venueName: item.venue_name
//                 }));
//                 setTableData(transformedData);
//             } else {
//                 throw new Error(result.message || 'Failed to fetch venues');
//             }
//         } catch (err) {
//             console.error('Error fetching venues:', err);
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchVenues();
//     }, []);

//     const totalRecords = tableData.length;

//     const handleAdd = () => {
//         setShowAddForm(true);
//     };

//     const handleCloseAddModal = () => {
//         setShowAddForm(false);
//     };

//     const handleCloseEditModal = () => {
//         setShowEditForm(false);
//         setEditVenueId(null);
//     };

//     const handleSave = (data) => {
//         setShowAddForm(false);
//         fetchVenues();
//         setGridKey(prev => prev + 1);
//     };

//     const handleUpdate = (data) => {
//         setShowEditForm(false);
//         setEditVenueId(null);
        
//         setTableData(prevData => {
//             return prevData.map(item => {
//                 if (item.id === data.venue_id) {
//                     return {
//                         ...item,
//                         venueName: data.venueName
//                     };
//                 }
//                 return item;
//             });
//         });
        
//         setGridKey(prev => prev + 1);
        
//         setTimeout(() => {
//             fetchVenues();
//         }, 500);
//     };

//     const handleEdit = (id) => {
//         setEditVenueId(id);
//         setShowEditForm(true);
//     };

//     const handleDelete = async (id) => {
//         const venueToDelete = tableData.find(item => item.id === id);
//         const venueName = venueToDelete ? venueToDelete.venueName : 'this venue';
        
//         const result = await Swal.fire({
//             title: 'Are you sure?',
//             text: `You are about to delete "${venueName}".`,
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#dc3545',
//             cancelButtonColor: '#6c757d',
//             confirmButtonText: 'Yes, delete it!',
//             cancelButtonText: 'Cancel'
//         });

//         if (!result.isConfirmed) {
//             return;
//         }

//         try {
//             const accessToken = sessionStorage.getItem('access_token');
            
//             if (!accessToken) {
//                 throw new Error('Access token not found. Please login again.');
//             }

//             const response = await fetch(`${API_BASE_URL}/Venue/DeleteVenue`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Accept': 'application/json',
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${accessToken}`
//                 },
//                 body: JSON.stringify({
//                     venue_id: id
//                 })
//             });

//             const apiResult = await response.json();
            
//             if (response.ok && apiResult.success) {
//                 const resultCode = Number(apiResult.data?.result_code);
                
//                 if (resultCode === 3) {
//                     Swal.fire({
//                         title: 'Deleted!',
//                         text: apiResult.message || 'Venue has been deleted successfully.',
//                         icon: 'success',
//                         timer: 2000,
//                         timerProgressBar: false,
//                         showConfirmButton: false
//                     });

//                     setTableData(prevData => {
//                         const filtered = prevData.filter(item => item.id !== id);
//                         return filtered.map((item, index) => ({
//                             ...item,
//                             srNo: index + 1
//                         }));
//                     });
                    
//                     setGridKey(prev => prev + 1);
                    
//                     setTimeout(async () => {
//                         try {
//                             await fetchVenues();
//                         } catch (error) {
//                             console.error('Background sync failed:', error);
//                         }
//                     }, 500);

//                 } else if (resultCode === 0) {
//                     Swal.fire({
//                         icon: 'error',
//                         title: 'Failed',
//                         text: 'Venue not found or already deleted',
//                         confirmButtonText: 'OK'
//                     });
//                 } else {
//                     throw new Error(apiResult.message || 'Failed to delete venue');
//                 }
//             } else {
//                 throw new Error(apiResult.message || `Server error: ${response.status}`);
//             }

//         } catch (error) {
//             console.error('Error deleting venue:', error);
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: error.message || 'An error occurred while deleting',
//                 confirmButtonText: 'OK'
//             });
//         }
//     };

//     useEffect(() => {
//         window.handleEditClick = handleEdit;
//         window.handleDeleteClick = handleDelete;

//         return () => {
//             delete window.handleEditClick;
//             delete window.handleDeleteClick;
//         };
//     }, [tableData]);

//     const gridData = useMemo(() => {
//         return tableData.map(item => [
//             item.srNo,
//             item.venueName,
//             item.id
//         ]);
//     }, [tableData]);

//     return (
//         <Fragment>
//             <style>
//                 {`
//                     #grid-venue-table .gridjs-search {
//                         width: 100%;
//                         margin-bottom: 1rem;
//                     }
//                     #grid-venue-table .gridjs-search-input {
//                         width: 100%;
//                         padding: 8px 12px;
//                         border: 1px solid #dee2e6;
//                         border-radius: 6px;
//                         font-size: 14px;
//                     }
//                     #grid-venue-table .gridjs-search-input:focus {
//                         outline: none;
//                         border-color: #0d6efd;
//                         box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
//                     }
//                     #grid-venue-table .gridjs-wrapper {
//                         margin-top: 0.5rem;
//                         overflow-x: auto;
//                     }
//                     #grid-venue-table .gridjs-table {
//                         min-width: 800px;
//                     }
//                     #grid-venue-table .gridjs-container {
//                         padding: 0;
//                     }
//                     #grid-venue-table .gridjs-th-sort {
//                         position: relative;
//                         cursor: pointer;
//                     }
//                     #grid-venue-table .gridjs-th-content {
//                         display: flex;
//                         align-items: center;
//                         justify-content: space-between;
//                         width: 100%;
//                     }
//                     #grid-venue-table button.gridjs-sort {
//                         background: none;
//                         border: none;
//                         width: 20px;
//                         height: 20px;
//                         position: relative;
//                         cursor: pointer;
//                         float: right;
//                         margin-left: 8px;
//                     }
//                     #grid-venue-table button.gridjs-sort::before,
//                     #grid-venue-table button.gridjs-sort::after {
//                         content: '';
//                         position: absolute;
//                         left: 50%;
//                         transform: translateX(-50%);
//                         width: 0;
//                         height: 0;
//                         border-left: 5px solid transparent;
//                         border-right: 5px solid transparent;
//                     }
//                     #grid-venue-table button.gridjs-sort::before {
//                         top: 2px;
//                         border-bottom: 6px solid #bbb;
//                     }
//                     #grid-venue-table button.gridjs-sort::after {
//                         bottom: 2px;
//                         border-top: 6px solid #bbb;
//                     }
//                     #grid-venue-table button.gridjs-sort-asc::before {
//                         border-bottom-color: #333;
//                     }
//                     #grid-venue-table button.gridjs-sort-asc::after {
//                         border-top-color: #bbb;
//                     }
//                     #grid-venue-table button.gridjs-sort-desc::before {
//                         border-bottom-color: #bbb;
//                     }
//                     #grid-venue-table button.gridjs-sort-desc::after {
//                         border-top-color: #333;
//                     }
//                     #grid-venue-table .gridjs-sort-neutral,
//                     #grid-venue-table .gridjs-sort-asc,
//                     #grid-venue-table .gridjs-sort-desc {
//                         background-image: none !important;
//                     }
//                     #grid-venue-table .gridjs-footer {
//                         display: flex;
//                         justify-content: space-between;
//                         align-items: center;
//                         padding: 12px 0;
//                         border-top: 1px solid #e9ecef;
//                         margin-top: 1rem;
//                     }
//                     #grid-venue-table .gridjs-pagination {
//                         display: flex;
//                         width: 100%;
//                         justify-content: space-between;
//                         align-items: center;
//                     }
//                     #grid-venue-table .gridjs-summary {
//                         order: 1;
//                         color: #6c757d;
//                         font-size: 14px;
//                     }
//                     #grid-venue-table .gridjs-pages {
//                         order: 2;
//                         display: flex;
//                         gap: 5px;
//                     }
//                     #grid-venue-table .gridjs-pages button {
//                         min-width: 35px;
//                         height: 35px;
//                         border: 1px solid #dee2e6;
//                         background: #fff;
//                         border-radius: 6px;
//                         cursor: pointer;
//                         transition: all 0.2s ease;
//                         font-size: 14px;
//                     }
//                     #grid-venue-table .gridjs-pages button:hover:not(:disabled) {
//                         background: #e9ecef;
//                         border-color: #adb5bd;
//                     }
//                     #grid-venue-table .gridjs-pages button:disabled {
//                         opacity: 0.5;
//                         cursor: not-allowed;
//                     }
//                     #grid-venue-table .gridjs-pages button.gridjs-currentPage {
//                         background: var(--primary-color, #0d6efd);
//                         color: #fff;
//                         border-color: var(--primary-color, #0d6efd);
//                     }
//                     #grid-venue-table .btn-action-group {
//                         display: inline-flex;
//                         gap: 10px;
//                         align-items: center;
//                     }
//                     #grid-venue-table .btn-action-group .btn {
//                         margin: 0 !important;
//                     }
//                     #grid-venue-table .gridjs-wrapper::-webkit-scrollbar {
//                         height: 8px;
//                     }
//                     #grid-venue-table .gridjs-wrapper::-webkit-scrollbar-track {
//                         background: #f1f1f1;
//                         border-radius: 4px;
//                     }
//                     #grid-venue-table .gridjs-wrapper::-webkit-scrollbar-thumb {
//                         background: #c1c1c1;
//                         border-radius: 4px;
//                     }
//                     #grid-venue-table .gridjs-wrapper::-webkit-scrollbar-thumb:hover {
//                         background: #a1a1a1;
//                     }
//                     .loading-container, .error-container {
//                         text-align: center;
//                         padding: 40px;
//                         color: #6c757d;
//                     }
//                     .error-container {
//                         color: #dc3545;
//                     }
//                     .error-container .error-message {
//                         background: #fff3cd;
//                         border: 1px solid #ffc107;
//                         border-radius: 8px;
//                         padding: 15px;
//                         margin: 20px auto;
//                         max-width: 600px;
//                         text-align: left;
//                     }
//                     .error-container .error-title {
//                         font-weight: 600;
//                         color: #856404;
//                         margin-bottom: 10px;
//                     }
//                     .error-container .error-details {
//                         color: #856404;
//                         font-size: 14px;
//                         word-break: break-word;
//                     }
//                     .spinner-border {
//                         width: 3rem;
//                         height: 3rem;
//                         border-width: 0.3em;
//                     }

//                     .badge-primary {
//                         background: #0d6efd;
//                         color: #fff;
//                         padding: 6px 12px;
//                         border-radius: 4px;
//                         font-size: 14px;
//                         font-weight: 500;
//                     }
//                 `}
//             </style>

//             <AddVenue
//                 show={showAddForm}
//                 onClose={handleCloseAddModal}
//                 onSave={handleSave}
//             />

//             <EditVenue
//                 show={showEditForm}
//                 onClose={handleCloseEditModal}
//                 onUpdate={handleUpdate}
//                 venueId={editVenueId}
//             />

//             {/* STANDARDIZED STRUCTURE */}
//             <div style={{ margin: '20px auto', maxWidth: '100%' }}>
//                 <Row>
//                     <Col xl={12}>
//                         <Card className="custom-card">
//                             <Card.Body>
//                                 {/* STANDARDIZED PAGE HEADER */}
//                                 <div className="page-header-title">
//                                     <div className="header-text">
//                                         <i className="ri-map-pin-line"></i>
//                                         <span>Venue Master</span>
//                                     </div>
//                                     <div className="d-flex gap-2 align-items-center">
//                                         <span className="badge badge-primary">
//                                             Total Records: {totalRecords}
//                                         </span>
//                                         <IconButton.IconButton
//                                             variant="primary"
//                                             icon="ri-add-line"
//                                             onClick={handleAdd}
//                                             title="Add New"
//                                         />
//                                     </div>
//                                 </div>

//                                 {loading ? (
//                                     <div className="loading-container">
//                                         <div className="spinner-border text-primary" role="status">
//                                             <span className="visually-hidden">Loading...</span>
//                                         </div>
//                                         <p className="mt-3">Loading venue data...</p>
//                                     </div>
//                                 ) : error ? (
//                                     <div className="error-container">
//                                         <i className="ri-error-warning-line" style={{ fontSize: '48px' }}></i>
//                                         <div className="error-message">
//                                             <div className="error-title">⚠️ Error Loading Venues</div>
//                                             <div className="error-details">{error}</div>
//                                         </div>
//                                         <button 
//                                             className="btn btn-primary mt-3" 
//                                             onClick={fetchVenues}
//                                         >
//                                             <i className="ri-refresh-line me-2"></i>
//                                             Retry
//                                         </button>
//                                     </div>
//                                 ) : tableData.length === 0 ? (
//                                     <div className="loading-container">
//                                         <i className="ri-inbox-line" style={{ fontSize: '48px' }}></i>
//                                         <p className="mt-3">No venues found</p>
//                                         <button 
//                                             className="btn btn-primary mt-2" 
//                                             onClick={handleAdd}
//                                         >
//                                             <i className="ri-add-line me-2"></i>
//                                             Add First Venue
//                                         </button>
//                                     </div>
//                                 ) : (
//                                     <div id="grid-venue-table">
//                                         <Grid
//                                             key={gridKey}
//                                             data={gridData}
//                                             sort={true}
//                                             search={{
//                                                 enabled: true,
//                                                 placeholder: 'Search venues...'
//                                             }}
//                                             columns={[
//                                                 { 
//                                                     name: 'Sr',
//                                                     width: '100px',
//                                                     sort: true
//                                                 }, 
//                                                 { 
//                                                     name: 'Venue Name',
//                                                     width: '300px',
//                                                     sort: true
//                                                 }, 
//                                                 {
//                                                     name: 'Action',
//                                                     width: '150px',
//                                                     sort: true,
//                                                     formatter: (cell) => html(`
//                                                         <div class="btn-action-group">
//                                                             <button 
//                                                                 class="btn btn-sm btn-info-transparent btn-icon btn-wave" 
//                                                                 title="Edit"
//                                                                 onclick="handleEditClick(${cell})"
//                                                             >
//                                                                 <i class="ri-edit-line"></i>
//                                                             </button>
//                                                             <button 
//                                                                 class="btn btn-sm btn-danger-transparent btn-icon btn-wave" 
//                                                                 title="Delete"
//                                                                 onclick="handleDeleteClick(${cell})"
//                                                             >
//                                                                 <i class="ri-delete-bin-line"></i>
//                                                             </button>
//                                                         </div>
//                                                     `)
//                                                 }
//                                             ]} 
//                                             pagination={{
//                                                 limit: 5,
//                                                 summary: true
//                                             }}
//                                             className={{
//                                                 table: 'table table-bordered',
//                                                 search: 'gridjs-search mb-3',
//                                             }}
//                                         />
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

// export default VenueTable;

import { Fragment, useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Form, Button } from 'react-bootstrap';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
import IconButton from '../../elements/button'; 
import Swal from 'sweetalert2';
import '../../../styles/shared-styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddVenue = ({ 
    show,
    onClose,
    onSave,
    title = "Add New Venue"
}) => {
    
    const [formData, setFormData] = useState({
        venueName: '',
        venueTypeId: '',
        jamiaatId: '',
        jamaatId: ''
    });

    const [errors, setErrors] = useState({
        venueName: '',
        venueTypeId: '',
        jamiaatId: '',
        jamaatId: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [venueTypes, setVenueTypes] = useState([]);
    const [jamiaats, setJamiaats] = useState([]);
    const [jamaats, setJamaats] = useState([]);

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

    // Fetch venue types, jamiaats on mount
    useEffect(() => {
        if (show) {
            fetchVenueTypes();
            fetchJamiaats();
            handleClear();
        }
    }, [show]);

    // Fetch jamaats when jamiaat changes
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

    const validateForm = () => {
        const newErrors = {
            venueName: '',
            venueTypeId: '',
            jamiaatId: '',
            jamaatId: ''
        };

        let isValid = true;

        if (!formData.venueName.trim()) {
            newErrors.venueName = 'Venue name is required';
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
                jamaat_id: formData.jamaatId ? parseInt(formData.jamaatId) : null
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
            jamaatId: ''
        });
        setErrors({
            venueName: '',
            venueTypeId: '',
            jamiaatId: '',
            jamaatId: ''
        });
        setJamaats([]);
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
                        max-width: 600px;
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
                        min-width: 120px;
                        margin-bottom: 0;
                        margin-right: 15px;
                        font-weight: 500;
                        color: #495057;
                        font-size: 14px;
                        text-align: right;
                        padding-top: 8px;
                    }

                    .horizontal-form-group .form-input-wrapper {
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

                    .form-control.is-invalid, .form-select.is-invalid {
                        border-color: #dc3545;
                    }

                    .form-control, .form-select {
                        height: 38px;
                        border-width: 2px;
                        border-radius: 8px;
                        font-size: 15px;
                    }

                    .form-control:focus, .form-select:focus {
                        border-color: #0d6efd;
                        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
                    }

                    .btn {
                        height: 38px;
                        font-size: 14px;
                        font-weight: 500;
                        border-radius: 8px;
                        padding: 0 20px;
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
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                <div className="form-title">
                    <span>
                        <i className="ri-add-circle-line me-2"></i>
                        {title}
                    </span>
                    <button className="close-btn" onClick={handleClose} title="Close" disabled={isLoading}>
                        &times;
                    </button>
                </div>
                
                {errors.submit && (
                    <div className="submit-error">
                        <i className="ri-error-warning-line"></i>
                        <span>{errors.submit}</span>
                    </div>
                )}

                <div className="horizontal-form-group">
                    <Form.Label>Venue Name <span className="text-danger">*</span></Form.Label>
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
                    <Form.Label>Venue Type</Form.Label>
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

                <div className="horizontal-form-group">
                    <Form.Label>Jamiaat</Form.Label>
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
                    <Form.Label>Jamaat</Form.Label>
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

                <div className="form-buttons">
                    <Button variant="primary" onClick={handleSave} disabled={isLoading}>
                        <i className="ri-save-line me-1"></i> {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
                        <i className="ri-arrow-left-line me-1"></i> Back
                    </Button>
                    <Button className="btn-clear" onClick={handleClear} disabled={isLoading}>
                        <i className="ri-refresh-line me-1"></i> Clear
                    </Button>
                </div>
            </div>
        </div>
    );
};

// EditVenue component follows the same pattern - implementation truncated for brevity
// COMPLETE EDIT VENUE COMPONENT
// Replace the placeholder EditVenue in your VenueMaster.jsx with this

const EditVenue = ({ 
    show, 
    onClose, 
    onUpdate, 
    venueId,
    title = "Edit Venue"
}) => {
    const [formData, setFormData] = useState({
        venueName: '',
        venueTypeId: '',
        jamiaatId: '',
        jamaatId: ''
    });

    const [originalData, setOriginalData] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingVenueData, setLoadingVenueData] = useState(false);
    const [venueTypes, setVenueTypes] = useState([]);
    const [jamiaats, setJamiaats] = useState([]);
    const [jamaats, setJamaats] = useState([]);

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
                    jamaatId: venueData.jamaat_id ? String(venueData.jamaat_id) : ''
                };
                
                setFormData(initialFormData);
                setOriginalData(initialFormData);
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

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.venueName.trim()) {
            newErrors.venueName = 'Venue name is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const hasChanges = () => {
        if (!originalData) return false;

        return (
            formData.venueName !== originalData.venueName ||
            formData.venueTypeId !== originalData.venueTypeId ||
            formData.jamiaatId !== originalData.jamiaatId ||
            formData.jamaatId !== originalData.jamaatId
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
                return;
            }

            const payload = {
                venue_id: venueId,
                venue_name: formData.venueName.trim(),
                venue_type_id: formData.venueTypeId ? parseInt(formData.venueTypeId) : null,
                jamiaat_id: formData.jamiaatId ? parseInt(formData.jamiaatId) : null,
                jamaat_id: formData.jamaatId ? parseInt(formData.jamaatId) : null
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
            jamaatId: ''
        });
        setErrors({});
        setOriginalData(null);
        setJamaats([]);
        
        if (onClose) {
            onClose();
        }
    };

    const handleReset = () => {
        if (originalData) {
            setFormData({ ...originalData });
            setErrors({});
            
            Swal.fire({
                icon: 'info',
                title: 'Form Reset',
                text: 'Form reset to original values',
                timer: 1500,
                showConfirmButton: false
            });
        }
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
                        max-width: 600px;
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
                        min-width: 120px;
                        margin-bottom: 0;
                        margin-right: 15px;
                        font-weight: 500;
                        color: #495057;
                        font-size: 14px;
                        text-align: right;
                        padding-top: 8px;
                    }

                    .horizontal-form-group .form-input-wrapper {
                        flex: 1;
                    }

                    .error-text {
                        color: #dc3545;
                        font-size: 12px;
                        margin-top: 4px;
                    }

                    .form-control.is-invalid, .form-select.is-invalid {
                        border-color: #dc3545;
                    }

                    .form-control, .form-select {
                        height: 38px;
                        border-width: 2px;
                        border-radius: 8px;
                        font-size: 15px;
                    }

                    .form-control:focus, .form-select:focus {
                        border-color: #0d6efd;
                        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
                    }

                    .btn {
                        height: 38px;
                        font-size: 14px;
                        font-weight: 500;
                        border-radius: 8px;
                        padding: 0 20px;
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
                {(loadingVenueData || isLoading) && (
                    <div className="loading-overlay">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="loading-text">
                            {loadingVenueData ? 'Loading venue data...' : 'Updating...'}
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
                        disabled={isLoading || loadingVenueData}
                    >
                        &times;
                    </button>
                </div>
                
                {!loadingVenueData && (
                    <>
                        <div className="horizontal-form-group">
                            <Form.Label>Venue Name <span className="text-danger">*</span></Form.Label>
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
                            <Form.Label>Venue Type</Form.Label>
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

                        <div className="horizontal-form-group">
                            <Form.Label>Jamiaat</Form.Label>
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
                            <Form.Label>Jamaat</Form.Label>
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
                    </>
                )}

                <div className="form-buttons">
                    <Button 
                        variant="primary" 
                        onClick={handleUpdate} 
                        disabled={isLoading || !hasChanges() || loadingVenueData}
                    >
                        <i className="ri-save-line me-1"></i> 
                        {isLoading ? 'Updating...' : 'Update'}
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={handleClose} 
                        disabled={isLoading || loadingVenueData}
                    >
                        <i className="ri-arrow-left-line me-1"></i> Back
                    </Button>
                    <Button 
                        className="btn-reset" 
                        onClick={handleReset} 
                        disabled={isLoading || !hasChanges() || loadingVenueData}
                    >
                        <i className="ri-refresh-line me-1"></i> Reset
                    </Button>
                </div>
            </div>
        </div>
    );
};

const VenueTable = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editVenueId, setEditVenueId] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gridKey, setGridKey] = useState(0);

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

    useEffect(() => {
        fetchVenues();
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
        fetchVenues();
        setGridKey(prev => prev + 1);
    };

    const handleEdit = (id) => {
        setEditVenueId(id);
        setShowEditForm(true);
    };

    const handleDelete = async (id) => {
        const venueToDelete = tableData.find(item => item.id === id);
        const venueName = venueToDelete ? venueToDelete.venueName : 'this venue';
        
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${venueName}".`,
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
                        text: apiResult.message || 'Venue has been deleted successfully.',
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: false,
                        showConfirmButton: false
                    });

                    fetchVenues();
                    setGridKey(prev => prev + 1);
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
    }, [tableData]);

    const gridData = useMemo(() => {
        return tableData.map(item => [
            item.srNo,
            item.venueName,
            item.id
        ]);
    }, [tableData]);

    return (
        <Fragment>
            <style>
                {`
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
                    }
                    #grid-venue-table .gridjs-table {
                        min-width: 800px;
                    }
                    #grid-venue-table .gridjs-container {
                        padding: 0;
                    }
                    #grid-venue-table .gridjs-th-sort {
                        position: relative;
                        cursor: pointer;
                    }
                    #grid-venue-table .gridjs-th-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                    }
                    #grid-venue-table button.gridjs-sort {
                        background: none;
                        border: none;
                        width: 20px;
                        height: 20px;
                        position: relative;
                        cursor: pointer;
                        float: right;
                        margin-left: 8px;
                    }
                    #grid-venue-table button.gridjs-sort::before,
                    #grid-venue-table button.gridjs-sort::after {
                        content: '';
                        position: absolute;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 0;
                        height: 0;
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                    }
                    #grid-venue-table button.gridjs-sort::before {
                        top: 2px;
                        border-bottom: 6px solid #bbb;
                    }
                    #grid-venue-table button.gridjs-sort::after {
                        bottom: 2px;
                        border-top: 6px solid #bbb;
                    }
                    #grid-venue-table button.gridjs-sort-asc::before {
                        border-bottom-color: #333;
                    }
                    #grid-venue-table button.gridjs-sort-asc::after {
                        border-top-color: #bbb;
                    }
                    #grid-venue-table button.gridjs-sort-desc::before {
                        border-bottom-color: #bbb;
                    }
                    #grid-venue-table button.gridjs-sort-desc::after {
                        border-top-color: #333;
                    }
                    #grid-venue-table .gridjs-sort-neutral,
                    #grid-venue-table .gridjs-sort-asc,
                    #grid-venue-table .gridjs-sort-desc {
                        background-image: none !important;
                    }
                    #grid-venue-table .gridjs-footer {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 0;
                        border-top: 1px solid #e9ecef;
                        margin-top: 1rem;
                    }
                    #grid-venue-table .gridjs-pagination {
                        display: flex;
                        width: 100%;
                        justify-content: space-between;
                        align-items: center;
                    }
                    #grid-venue-table .gridjs-summary {
                        order: 1;
                        color: #6c757d;
                        font-size: 14px;
                    }
                    #grid-venue-table .gridjs-pages {
                        order: 2;
                        display: flex;
                        gap: 5px;
                    }
                    #grid-venue-table .gridjs-pages button {
                        min-width: 35px;
                        height: 35px;
                        border: 1px solid #dee2e6;
                        background: #fff;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-size: 14px;
                    }
                    #grid-venue-table .gridjs-pages button:hover:not(:disabled) {
                        background: #e9ecef;
                        border-color: #adb5bd;
                    }
                    #grid-venue-table .gridjs-pages button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    #grid-venue-table .gridjs-pages button.gridjs-currentPage {
                        background: var(--primary-color, #0d6efd);
                        color: #fff;
                        border-color: var(--primary-color, #0d6efd);
                    }
                    #grid-venue-table .btn-action-group {
                        display: inline-flex;
                        gap: 10px;
                        align-items: center;
                    }
                    #grid-venue-table .btn-action-group .btn {
                        margin: 0 !important;
                    }
                    #grid-venue-table .gridjs-wrapper::-webkit-scrollbar {
                        height: 8px;
                    }
                    #grid-venue-table .gridjs-wrapper::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 4px;
                    }
                    #grid-venue-table .gridjs-wrapper::-webkit-scrollbar-thumb {
                        background: #c1c1c1;
                        border-radius: 4px;
                    }
                    #grid-venue-table .gridjs-wrapper::-webkit-scrollbar-thumb:hover {
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

                    .badge-primary {
                        background: #0d6efd;
                        color: #fff;
                        padding: 6px 12px;
                        border-radius: 4px;
                        font-size: 14px;
                        font-weight: 500;
                    }
                `}
            </style>

            <AddVenue
                show={showAddForm}
                onClose={handleCloseAddModal}
                onSave={handleSave}
            />

            <EditVenue
                show={showEditForm}
                onClose={handleCloseEditModal}
                onUpdate={handleUpdate}
                venueId={editVenueId}
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
                                        <IconButton.IconButton
                                            variant="primary"
                                            icon="ri-add-line"
                                            onClick={handleAdd}
                                            title="Add New"
                                        />
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
                                        <div className="error-message">
                                            <div className="error-title">⚠️ Error Loading Venues</div>
                                            <div className="error-details">{error}</div>
                                        </div>
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
                                        <button 
                                            className="btn btn-primary mt-2" 
                                            onClick={handleAdd}
                                        >
                                            <i className="ri-add-line me-2"></i>
                                            Add First Venue
                                        </button>
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
                                                    width: '100px',
                                                    sort: true
                                                }, 
                                                { 
                                                    name: 'Venue Name',
                                                    width: '300px',
                                                    sort: true
                                                }, 
                                                {
                                                    name: 'Action',
                                                    width: '150px',
                                                    sort: false,
                                                    formatter: (cell) => html(`
                                                        <div class="btn-action-group">
                                                            <button 
                                                                class="btn btn-sm btn-info-transparent btn-icon btn-wave" 
                                                                title="Edit"
                                                                onclick="handleEditClick(${cell})"
                                                            >
                                                                <i class="ri-edit-line"></i>
                                                            </button>
                                                            <button 
                                                                class="btn btn-sm btn-danger-transparent btn-icon btn-wave" 
                                                                title="Delete"
                                                                onclick="handleDeleteClick(${cell})"
                                                            >
                                                                <i class="ri-delete-bin-line"></i>
                                                            </button>
                                                        </div>
                                                    `)
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

export default VenueTable;