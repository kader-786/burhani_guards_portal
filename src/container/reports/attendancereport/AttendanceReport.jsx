// import { Fragment, useEffect, useMemo, useState } from 'react';
// import { Card, Col, Row, Button } from 'react-bootstrap';
// import Select from 'react-select';
// import { Grid } from 'gridjs-react';
// import 'gridjs/dist/theme/mermaid.css';
// import { toast } from 'react-toastify';
// import Swal from 'sweetalert2';
// import { useNavigate } from 'react-router-dom';
// import { checkModuleAccess } from '../../../utils/accessControl';
// import '../../../styles/shared-styles.css';
// import appStorage from '../../../utils/storage';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const MODULE_ID = '110';

// const AttendanceReport = () => {
//     const navigate = useNavigate();

//     // RBAC State
//     const [checkingPermissions, setCheckingPermissions] = useState(true);
//     const [permissions, setPermissions] = useState({
//         canAdd: false,
//         canEdit: false,
//         canDelete: false,
//         hasAccess: false
//     });

//     const [miqaatOptions, setMiqaatOptions] = useState([]);
//     const [selectedMiqaat, setSelectedMiqaat] = useState(null);
//     const [selectedAttendeeType, setSelectedAttendeeType] = useState({ value: 'All', label: 'All' });
//     const [tableData, setTableData] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [loadingMiqaat, setLoadingMiqaat] = useState(false);

//     // UPDATED: Added "Absent" option
//     const attendeeTypeOptions = [
//         { value: 'All', label: 'All' },
//         { value: 'Attendee', label: 'Attendee' },
//         { value: 'Proxy', label: 'Proxy' },
//         { value: 'Absent', label: 'Absent' }
//     ];

//     const fetchAllMiqaats = async () => {
//         setLoadingMiqaat(true);
//         try {
//             const token = appStorage.getItem('access_token');
//             if (!token) {
//                 toast.error('Authentication token not found. Please login again.');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/Miqaat/GetAllMiqaat`, {
//                 method: 'GET',
//                 headers: {
//                     'Accept': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 }
//             });

//             const result = await response.json();

//             if (response.status === 401) {
//                 toast.error('Session expired. Please login again.');
//                 return;
//             }

//             if (response.ok && result.success) {
//                 const options = result.data.map(item => ({
//                     value: item.miqaat_id,
//                     label: item.miqaat_name
//                 }));
//                 setMiqaatOptions(options);
//             } else {
//                 toast.error(result.message || 'Failed to load miqaats');
//             }
//         } catch (error) {
//             console.error(error);
//             toast.error('Error loading miqaats');
//         } finally {
//             setLoadingMiqaat(false);
//         }
//     };

//     const fetchAttendanceReport = async () => {
//         if (!selectedMiqaat) {
//             toast.warning('Please select Miqaat');
//             return;
//         }

//         setLoading(true);
//         try {
//             const token = appStorage.getItem('access_token');

//             const requestBody = {
//                 miqaat_id: selectedMiqaat.value
//             };

//             if (selectedAttendeeType.value !== 'All') {
//                 requestBody.attendee_type = selectedAttendeeType.value;
//             }

//             const response = await fetch(`${API_BASE_URL}/Reports/GetAttendanceReport`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify(requestBody)
//             });

//             const result = await response.json();

//             if (response.status === 401) {
//                 toast.error('Session expired. Please login again.');
//                 return;
//             }

//             if (response.ok && result.success) {
//                 setTableData(result.data || []);
//                 if (result.data && result.data.length > 0) {
//                     toast.success(`Found ${result.data.length} attendance records`);
//                 } else {
//                     toast.info('No records found for the selected criteria');
//                 }
//             } else {
//                 setTableData([]);
//                 toast.error(result.message || 'No records found');
//             }
//         } catch (error) {
//             console.error(error);
//             toast.error('Error loading attendance report');
//             setTableData([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ── Excel export ──────────────────────────────────────────────────────────
//     const handleExport = () => {
//         if (!tableData.length) { toast.warning('No data to export'); return; }

//         const columns = [
//             { label: 'SR', key: '_sr' },
//             { label: 'ITS ID', key: 'its_id' },
//             { label: 'Full Name', key: 'full_name' },
//             { label: 'Mobile', key: 'mobile' },
//             { label: 'Jamiaat', key: 'jamiaat_name' },
//             { label: 'Miqaat Name', key: 'miqaat_name' },
//             { label: 'Team', key: 'team_name' },
//             { label: 'Venue', key: 'venue_name' },
//             { label: 'Location', key: 'location_name' },
//             { label: 'Quota', key: 'quota' },
//             { label: 'Attendee Type', key: 'attendee_type' },
//             { label: 'Scanned By', key: 'scanned_by' },
//             { label: 'Scanned Date', key: 'scanned_date' },
//         ];

//         const rows = tableData.map((row, i) => ({ ...row, _sr: i + 1 }));

//         import('xlsx').then(XLSX => {
//             const header = columns.map(c => c.label);
//             const data = rows.map(row => columns.map(c => row[c.key] ?? ''));

//             const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

//             // Auto column widths
//             ws['!cols'] = columns.map((c, i) => ({
//                 wch: Math.max(c.label.length, ...data.map(r => String(r[i] ?? '').length)) + 2
//             }));

//             const wb = XLSX.utils.book_new();
//             XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

//             const miqaatLabel = (selectedMiqaat?.label || 'Report').replace(/[^a-zA-Z0-9 _-]/g, '');
//             const typeLabel = selectedAttendeeType?.value || 'All';
//             XLSX.writeFile(wb, `Attendance_${miqaatLabel}_${typeLabel}.xlsx`);
//         });
//     };

//     // RBAC Check
//     useEffect(() => {
//         const checkAccess = () => {
//             setCheckingPermissions(true);

//             const isAdminValue = appStorage.getItem('is_admin');
//             if (isAdminValue === 'true' || isAdminValue === true || isAdminValue === '1') {
//                 setPermissions({ canAdd: true, canEdit: true, canDelete: true, hasAccess: true });
//                 setCheckingPermissions(false);
//                 return;
//             }

//             const accessRights = appStorage.getItem('access_rights');

//             if (!accessRights) {
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Session Expired',
//                     text: 'Please login again',
//                     confirmButtonText: 'OK',
//                     allowOutsideClick: false
//                 }).then(() => {
//                     navigate(`${import.meta.env.BASE_URL}login/`);
//                 });
//                 return;
//             }

//             const access = checkModuleAccess(accessRights, MODULE_ID);

//             if (!access.hasAccess) {
//                 Swal.fire({
//                     icon: 'warning',
//                     title: 'Access Denied',
//                     text: 'You do not have permission to access this module.',
//                     confirmButtonText: 'OK'
//                 }).then(() => {
//                     navigate(`${import.meta.env.BASE_URL}dashboard/`);
//                 });
//                 return;
//             }

//             setPermissions(access);
//             setCheckingPermissions(false);
//         };

//         checkAccess();
//     }, [navigate]);

//     useEffect(() => {
//         fetchAllMiqaats();
//     }, []);

//     // SIMPLIFIED: Just plain text, no HTML badges
//     const gridData = useMemo(() => {
//         return tableData.map((row, index) => [
//             index + 1,
//             row.its_id,
//             row.full_name || '-',
//             row.mobile || '-',
//             row.jamiaat_name || '-',
//             row.miqaat_name,
//             row.team_name || 'Unassigned',
//             row.venue_name || '-',
//             row.location_name || '-',
//             row.quota ?? '-',
//             row.attendee_type || '-',  // PLAIN TEXT ONLY
//             row.scanned_by || '-',
//             row.scanned_date || '-'
//         ]);
//     }, [tableData]);

//     const selectStyles = {
//         control: (base, state) => ({
//             ...base,
//             minHeight: '38px',
//             borderColor: state.isFocused ? '#0d6efd' : '#dee2e6',
//             borderWidth: '2px',
//             borderRadius: '8px',
//             boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.15)' : 'none',
//             '&:hover': { borderColor: '#adb5bd' }
//         }),
//         placeholder: (base) => ({
//             ...base,
//             color: '#6c757d',
//             fontSize: '15px'
//         }),
//         singleValue: (base) => ({
//             ...base,
//             fontSize: '15px'
//         }),
//         dropdownIndicator: (base) => ({
//             ...base,
//             color: '#0d6efd',
//             '&:hover': {
//                 color: '#0b5ed7'
//             }
//         }),
//         menu: (base) => ({
//             ...base,
//             zIndex: 1000
//         })
//     };

//     // Loading state while checking permissions
//     if (checkingPermissions) {
//         return (
//             <Fragment>
//                 <div className="permission-loading" style={{
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     minHeight: '400px',
//                     textAlign: 'center'
//                 }}>
//                     <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
//                         <span className="visually-hidden">Loading...</span>
//                     </div>
//                     <p className="mt-3">Checking permissions...</p>
//                 </div>
//             </Fragment>
//         );
//     }

//     return (
//         <Fragment>
//             <div style={{ margin: '20px auto', maxWidth: '100%' }}>
//                 <Row>
//                     <Col xl={12}>
//                         <Card className="custom-card">
//                             <Card.Body>
//                                 <style>
//                                     {`
//                                         .form-label {
//                                             font-weight: 500;
//                                             font-size: 14px;
//                                             color: #495057;
//                                             margin-bottom: 8px;
//                                             display: block;
//                                         }

//                                         .form-label .text-danger {
//                                             color: #dc3545;
//                                             margin-left: 4px;
//                                         }

//                                         .badge-primary {
//                                             background: #0d6efd;
//                                             color: #fff;
//                                             padding: 6px 12px;
//                                             border-radius: 4px;
//                                             font-size: 14px;
//                                             font-weight: 500;
//                                         }

//                                         .btn-primary {
//                                             height: 38px;
//                                             font-size: 14px;
//                                             font-weight: 500;
//                                             border-radius: 8px;
//                                             border: none;
//                                             transition: all 0.2s;
//                                         }

//                                         .btn-primary:hover:not(:disabled) {
//                                             transform: translateY(-1px);
//                                             box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
//                                         }

//                                         .btn-success {
//                                             height: 38px;
//                                             font-size: 14px;
//                                             font-weight: 500;
//                                             border-radius: 8px;
//                                             transition: all 0.2s;
//                                         }

//                                         .btn-success:hover:not(:disabled) {
//                                             transform: translateY(-1px);
//                                             box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
//                                         }
//                                     `}
//                                 </style>

//                                 <div className="page-header-title">
//                                     <div className="header-text">
//                                         <i className="ri-file-list-line"></i>
//                                         <span>Attendance Report</span>
//                                     </div>
//                                     <div className="d-flex gap-2 align-items-center">
//                                         <span className="badge badge-primary">
//                                             Total Records: {tableData.length}
//                                         </span>
//                                     </div>
//                                 </div>

//                                 <Row className="mb-4 align-items-end">
//                                     <Col md={4}>
//                                         <label className="form-label">
//                                             Miqaat <span className="text-danger">*</span>
//                                         </label>
//                                         <Select
//                                             options={miqaatOptions}
//                                             value={selectedMiqaat}
//                                             onChange={setSelectedMiqaat}
//                                             placeholder="Select Miqaat"
//                                             isClearable
//                                             isLoading={loadingMiqaat}
//                                             styles={selectStyles}
//                                         />
//                                     </Col>

//                                     <Col md={3}>
//                                         <label className="form-label">
//                                             Attendee Type
//                                         </label>
//                                         <Select
//                                             options={attendeeTypeOptions}
//                                             value={selectedAttendeeType}
//                                             onChange={setSelectedAttendeeType}
//                                             placeholder="Select Type"
//                                             styles={selectStyles}
//                                         />
//                                     </Col>

//                                     <Col md={2}>
//                                         <Button
//                                             variant="primary"
//                                             className="w-100"
//                                             onClick={fetchAttendanceReport}
//                                             disabled={loading || !selectedMiqaat}
//                                         >
//                                             {loading ? (
//                                                 <>
//                                                     <span className="spinner-border spinner-border-sm me-2"></span>
//                                                     Loading...
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <i className="ri-search-line me-2"></i>
//                                                     Search
//                                                 </>
//                                             )}
//                                         </Button>
//                                     </Col>

//                                     <Col md={2}>
//                                         <Button
//                                             variant="success"
//                                             className="w-100"
//                                             onClick={handleExport}
//                                             disabled={!tableData.length}
//                                             title="Export to Excel"
//                                         >
//                                             <i className="ri-file-excel-2-line me-2"></i>
//                                             Export
//                                         </Button>
//                                     </Col>
//                                 </Row>

//                                 {/* Summary Cards - Keep these for visual feedback */}
//                                 {tableData.length > 0 && (
//                                     <Row className="mb-4">
//                                         <Col md={3}>
//                                             <Card className="border-0 shadow-sm" style={{ background: '#d4edda' }}>
//                                                 <Card.Body className="p-3">
//                                                     <div className="d-flex justify-content-between align-items-center">
//                                                         <div>
//                                                             <h6 className="mb-1" style={{ color: '#28a745', fontSize: '14px' }}>
//                                                                 Attendee
//                                                             </h6>
//                                                             <h3 className="mb-0" style={{ color: '#28a745', fontWeight: 'bold' }}>
//                                                                 {tableData.filter(r => r.attendee_type === 'Attendee').length}
//                                                             </h3>
//                                                         </div>
//                                                         <i className="ri-check-line" style={{ fontSize: '36px', color: '#28a745', opacity: 0.3 }}></i>
//                                                     </div>
//                                                 </Card.Body>
//                                             </Card>
//                                         </Col>

//                                         <Col md={3}>
//                                             <Card className="border-0 shadow-sm" style={{ background: '#cfe2ff' }}>
//                                                 <Card.Body className="p-3">
//                                                     <div className="d-flex justify-content-between align-items-center">
//                                                         <div>
//                                                             <h6 className="mb-1" style={{ color: '#0d6efd', fontSize: '14px' }}>
//                                                                 Proxy
//                                                             </h6>
//                                                             <h3 className="mb-0" style={{ color: '#0d6efd', fontWeight: 'bold' }}>
//                                                                 {tableData.filter(r => r.attendee_type === 'Proxy').length}
//                                                             </h3>
//                                                         </div>
//                                                         <i className="ri-user-add-line" style={{ fontSize: '36px', color: '#0d6efd', opacity: 0.3 }}></i>
//                                                     </div>
//                                                 </Card.Body>
//                                             </Card>
//                                         </Col>

//                                         <Col md={3}>
//                                             <Card className="border-0 shadow-sm" style={{ background: '#f8d7da' }}>
//                                                 <Card.Body className="p-3">
//                                                     <div className="d-flex justify-content-between align-items-center">
//                                                         <div>
//                                                             <h6 className="mb-1" style={{ color: '#dc3545', fontSize: '14px' }}>
//                                                                 Absent
//                                                             </h6>
//                                                             <h3 className="mb-0" style={{ color: '#dc3545', fontWeight: 'bold' }}>
//                                                                 {tableData.filter(r => r.attendee_type === 'Absent').length}
//                                                             </h3>
//                                                         </div>
//                                                         <i className="ri-close-line" style={{ fontSize: '36px', color: '#dc3545', opacity: 0.3 }}></i>
//                                                     </div>
//                                                 </Card.Body>
//                                             </Card>
//                                         </Col>

//                                         <Col md={3}>
//                                             <Card className="border-0 shadow-sm" style={{ background: '#e9ecef' }}>
//                                                 <Card.Body className="p-3">
//                                                     <div className="d-flex justify-content-between align-items-center">
//                                                         <div>
//                                                             <h6 className="mb-1" style={{ color: '#6c757d', fontSize: '14px' }}>
//                                                                 Total
//                                                             </h6>
//                                                             <h3 className="mb-0" style={{ color: '#6c757d', fontWeight: 'bold' }}>
//                                                                 {tableData.length}
//                                                             </h3>
//                                                         </div>
//                                                         <i className="ri-group-line" style={{ fontSize: '36px', color: '#6c757d', opacity: 0.3 }}></i>
//                                                     </div>
//                                                 </Card.Body>
//                                             </Card>
//                                         </Col>
//                                     </Row>
//                                 )}

//                                 {loading ? (
//                                     <div className="text-center py-5">
//                                         <div className="spinner-border text-primary" role="status">
//                                             <span className="visually-hidden">Loading...</span>
//                                         </div>
//                                         <p className="mt-3 text-muted">Loading attendance data...</p>
//                                     </div>
//                                 ) : tableData.length === 0 ? (
//                                     <div className="text-center py-5">
//                                         <div className="mb-3">
//                                             <i className="ri-inbox-line" style={{ fontSize: '64px', color: '#dee2e6' }}></i>
//                                         </div>
//                                         <p className="text-muted mb-1">No attendance records found</p>
//                                         <small className="text-muted">
//                                             Select a miqaat and click search to view records
//                                         </small>
//                                     </div>
//                                 ) : (
//                                     <div className="table-responsive">
//                                         <Grid
//                                             data={gridData}
//                                             sort={true}
//                                             search={{ enabled: true, placeholder: 'Type a keyword...' }}
//                                             columns={[
//                                                 { name: 'SR', width: '70px', sort: true },
//                                                 { name: 'ITS ID', width: '100px', sort: true },
//                                                 { name: 'FULL NAME', width: '180px', sort: true },
//                                                 { name: 'MOBILE', width: '130px', sort: true },
//                                                 { name: 'JAMIAAT', width: '120px', sort: true },
//                                                 { name: 'MIQAAT NAME', width: '150px', sort: true },
//                                                 { name: 'TEAM', width: '120px', sort: true },
//                                                 { name: 'VENUE', width: '120px', sort: true },
//                                                 { name: 'LOCATION', width: '120px', sort: true },
//                                                 { name: 'QUOTA', width: '100px', sort: true },
//                                                 { name: 'ATTENDEE TYPE', width: '150px', sort: true },
//                                                 { name: 'SCANNED BY', width: '150px', sort: true },
//                                                 { name: 'SCANNED DATE', width: '150px', sort: true }
//                                             ]}
//                                             pagination={{ limit: 10, summary: true }}
//                                             className={{ table: 'table table-bordered table-hover' }}
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

// export default AttendanceReport;


import { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
import { Card, Col, Row, Button, Modal, Table } from 'react-bootstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { checkModuleAccess } from '../../../utils/accessControl';
import '../../../styles/shared-styles.css';
import appStorage from '../../../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MODULE_ID = '110';

// ── Sentinel team_id used for the Total row returned by the SP ────────────────
const TOTAL_ROW_ID = 10000000000000;

// ── Status badge — defined outside component to avoid re-creation on render ──
const StatusBadge = ({ status }) => {
    const cfg = {
        P: { label: 'Present', color: '#28a745', bg: '#d4edda' },
        A: { label: 'Absent', color: '#dc3545', bg: '#f8d7da' },
        X: { label: 'Proxy', color: '#0d6efd', bg: '#cfe2ff' },
    };
    const c = cfg[status] || { label: status, color: '#6c757d', bg: '#e9ecef' };
    return (
        <span style={{
            background: c.bg, color: c.color,
            padding: '2px 10px', borderRadius: '20px',
            fontSize: '12px', fontWeight: '600',
            display: 'inline-block', minWidth: '64px', textAlign: 'center'
        }}>
            {c.label}
        </span>
    );
};

// ── Shared excel export helper ────────────────────────────────────────────────
const exportToExcel = (rows, columns, filename) => {
    import('xlsx').then(XLSX => {
        const header = columns.map(c => c.label);
        const data = rows.map(row => columns.map(c => row[c.key] ?? ''));
        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
        ws['!cols'] = columns.map((c, i) => ({
            wch: Math.max(c.label.length, ...data.map(r => String(r[i] ?? '').length)) + 2
        }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    });
};

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = ['Present', 'Absent', 'Proxy', 'All'];
const TAB_STATUS_MAP = { Present: 'P', Absent: 'A', Proxy: 'X' };

// ── Columns per tab (for modal table rendering + export) ──────────────────────
const MODAL_COLUMNS = {
    Present: [
        { label: 'SR', key: '_sr' },
        { label: 'ITS ID', key: 'its_id' },
        { label: 'Full Name', key: 'full_name' },
        { label: 'Position', key: 'position_name' },
        { label: 'Jamiaat', key: 'jamiaat_name' },
        { label: 'Team', key: 'team_name' },
        { label: 'Venue', key: 'venue_name' },
        { label: 'Location', key: 'location_name' },
        { label: 'Mobile', key: 'mobile' },
        { label: 'Status', key: '_status_label' },
        { label: 'Scanned By', key: 'scanned_by' },
        { label: 'Scanned Date', key: 'scanned_date' },
    ],
    Absent: [
        { label: 'SR', key: '_sr' },
        { label: 'ITS ID', key: 'its_id' },
        { label: 'Full Name', key: 'full_name' },
        { label: 'Position', key: 'position_name' },
        { label: 'Jamiaat', key: 'jamiaat_name' },
        { label: 'Team', key: 'team_name' },
        { label: 'Venue', key: 'venue_name' },
        { label: 'Location', key: 'location_name' },
        { label: 'Mobile', key: 'mobile' },
        { label: 'Status', key: '_status_label' },
    ],
    Proxy: [
        { label: 'SR', key: '_sr' },
        { label: 'ITS ID', key: 'its_id' },
        { label: 'Full Name', key: 'full_name' },
        { label: 'Position', key: 'position_name' },
        { label: 'Jamiaat', key: 'jamiaat_name' },
        { label: 'Team', key: 'team_name' },
        { label: 'Venue', key: 'venue_name' },
        { label: 'Location', key: 'location_name' },
        { label: 'Mobile', key: 'mobile' },
        { label: 'Status', key: '_status_label' },
        { label: 'Scanned By', key: 'scanned_by' },
        { label: 'Scanned Date', key: 'scanned_date' },
    ],
    All: [
        { label: 'SR', key: '_sr' },
        { label: 'ITS ID', key: 'its_id' },
        { label: 'Full Name', key: 'full_name' },
        { label: 'Position', key: 'position_name' },
        { label: 'Jamiaat', key: 'jamiaat_name' },
        { label: 'Team', key: 'team_name' },
        { label: 'Venue', key: 'venue_name' },
        { label: 'Location', key: 'location_name' },
        { label: 'Mobile', key: 'mobile' },
        { label: 'Status', key: '_status_label' },
        { label: 'Scanned By', key: 'scanned_by' },
        { label: 'Scanned Date', key: 'scanned_date' },
    ],
};

// ── Helper: add plain-text label field for export (no JSX) ───────────────────
const STATUS_LABEL_MAP = { P: 'Present', A: 'Absent', X: 'Proxy' };
const addStatusLabel = row => ({
    ...row,
    _status_label: STATUS_LABEL_MAP[row.attendance_status] || row.attendance_status,
});


// ═══════════════════════════════════════════════════════════════════════════════
// AttendanceReport component
// ═══════════════════════════════════════════════════════════════════════════════
const AttendanceReport = () => {
    const navigate = useNavigate();

    // ── RBAC ─────────────────────────────────────────────────────────────────
    const [checkingPermissions, setCheckingPermissions] = useState(true);
    const [permissions, setPermissions] = useState({
        canAdd: false, canEdit: false, canDelete: false, hasAccess: false
    });

    // ── Miqaat dropdown ───────────────────────────────────────────────────────
    const [miqaatOptions, setMiqaatOptions] = useState([]);
    const [selectedMiqaat, setSelectedMiqaat] = useState(null);
    const [loadingMiqaat, setLoadingMiqaat] = useState(false);

    // ── Main grid ─────────────────────────────────────────────────────────────
    const [tableData, setTableData] = useState([]);   // raw API data incl. Total row
    const [loading, setLoading] = useState(false);

    // ── Drilldown modal ───────────────────────────────────────────────────────
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('All');
    const [modalSearch, setModalSearch] = useState('');
    const [modalTitle, setModalTitle] = useState('');

    // ── Derived main-grid rows ────────────────────────────────────────────────
    const totalRow = useMemo(() => tableData.find(r => r.team_id === TOTAL_ROW_ID), [tableData]);
    const dataRows = useMemo(() => tableData.filter(r => r.team_id !== TOTAL_ROW_ID), [tableData]);

    // ── Tab counts ────────────────────────────────────────────────────────────
    const tabCounts = useMemo(() => ({
        Present: modalData.filter(r => r.attendance_status === 'P').length,
        Absent: modalData.filter(r => r.attendance_status === 'A').length,
        Proxy: modalData.filter(r => r.attendance_status === 'X').length,
        All: modalData.length,
    }), [modalData]);

    // ── Filtered modal data (tab + search) ────────────────────────────────────
    const filteredModalData = useMemo(() => {
        let data = modalData;
        if (activeTab !== 'All') {
            const statusCode = TAB_STATUS_MAP[activeTab];
            data = data.filter(r => r.attendance_status === statusCode);
        }
        const q = modalSearch.trim().toLowerCase();
        if (q) {
            data = data.filter(r =>
                (r.full_name || '').toLowerCase().includes(q) ||
                String(r.its_id || '').includes(q)
            );
        }
        return data;
    }, [modalData, activeTab, modalSearch]);

    // ── RBAC check ────────────────────────────────────────────────────────────
    useEffect(() => {
        const isAdminValue = appStorage.getItem('is_admin');
        if (isAdminValue === 'true' || isAdminValue === true || isAdminValue === '1') {
            setPermissions({ canAdd: true, canEdit: true, canDelete: true, hasAccess: true });
            setCheckingPermissions(false);
            return;
        }

        const accessRights = appStorage.getItem('access_rights');
        if (!accessRights) {
            Swal.fire({
                icon: 'error', title: 'Session Expired',
                text: 'Please login again', confirmButtonText: 'OK', allowOutsideClick: false
            }).then(() => navigate(`${import.meta.env.BASE_URL}login/`));
            return;
        }

        const access = checkModuleAccess(accessRights, MODULE_ID);
        if (!access.hasAccess) {
            Swal.fire({
                icon: 'warning', title: 'Access Denied',
                text: 'You do not have permission to access this module.',
                confirmButtonText: 'OK'
            }).then(() => navigate(`${import.meta.env.BASE_URL}dashboard/`));
            return;
        }

        setPermissions(access);
        setCheckingPermissions(false);
    }, [navigate]);

    // ── Fetch miqaat options ──────────────────────────────────────────────────
    useEffect(() => {
        const fetchMiqaats = async () => {
            setLoadingMiqaat(true);
            try {
                const token = appStorage.getItem('access_token');
                if (!token) { toast.error('Authentication token not found. Please login again.'); return; }

                const response = await fetch(`${API_BASE_URL}/Miqaat/GetAllMiqaat`, {
                    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
                });

                if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

                const result = await response.json();
                if (response.ok && result.success) {
                    setMiqaatOptions(result.data.map(item => ({
                        value: item.miqaat_id,
                        label: item.miqaat_name
                    })));
                } else {
                    toast.error(result.message || 'Failed to load miqaats');
                }
            } catch (err) {
                console.error(err);
                toast.error('Error loading miqaats');
            } finally {
                setLoadingMiqaat(false);
            }
        };
        fetchMiqaats();
    }, []);

    // ── Fetch main summary grid ───────────────────────────────────────────────
    const fetchSummary = async () => {
        if (!selectedMiqaat) { toast.warning('Please select a Miqaat'); return; }

        setLoading(true);
        setTableData([]);
        try {
            const token = appStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Reports/GetAttendanceReportSummary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ miqaat_id: selectedMiqaat.value })
            });

            if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

            const result = await response.json();
            if (response.ok && result.success) {
                setTableData(result.data || []);
                const rows = (result.data || []).filter(r => r.team_id !== TOTAL_ROW_ID);
                if (rows.length === 0) toast.info('No attendance data found for the selected miqaat');
                else toast.success(`Loaded ${rows.length} team(s)`);
            } else {
                toast.error(result.message || 'Failed to load attendance summary');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error loading attendance summary');
        } finally {
            setLoading(false);
        }
    };

    // ── Open drilldown modal ──────────────────────────────────────────────────
    const openModal = useCallback(async (teamId, teamName, initialTab = 'All') => {
        setModalData([]);
        setModalLoading(true);
        setActiveTab(initialTab);
        setModalSearch('');
        setShowModal(true);
        setModalTitle(
            teamId !== null
                ? teamName
                : `All Teams — ${selectedMiqaat?.label || ''}`
        );

        try {
            const token = appStorage.getItem('access_token');
            const body = { miqaat_id: selectedMiqaat.value };
            if (teamId !== null && teamId !== undefined) body.team_id = teamId;

            const response = await fetch(`${API_BASE_URL}/Reports/GetAttendanceReportDrilldown`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body)
            });

            if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

            const result = await response.json();
            if (response.ok && result.success) {
                setModalData(result.data || []);
                if ((result.data || []).length === 0) toast.info('No guard records found');
            } else {
                toast.error(result.message || 'Failed to load guard details');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error loading guard details');
        } finally {
            setModalLoading(false);
        }
    }, [selectedMiqaat]);

    // ── Export main grid ──────────────────────────────────────────────────────
    const handleExportMainGrid = () => {
        if (!dataRows.length) { toast.warning('No data to export'); return; }

        const columns = [
            { label: 'SR', key: '_sr' },
            { label: 'Team', key: 'team_name' },
            { label: 'Quota', key: 'total_quota' },
            { label: 'Assigned', key: 'assigned_count' },
            { label: 'Present', key: 'present_count' },
            { label: 'Absent', key: 'absent_count' },
            { label: 'Proxy', key: 'proxy_count' },
        ];
        const rows = dataRows.map((r, i) => ({ ...r, _sr: i + 1 }));
        if (totalRow) {
            rows.push({ ...totalRow, _sr: '', team_name: 'TOTAL' });
        }
        const label = (selectedMiqaat?.label || 'Report').replace(/[^a-zA-Z0-9 _-]/g, '');
        exportToExcel(rows, columns, `Attendance_Summary_${label}`);
    };

    // ── Export modal (current tab + search filter) ────────────────────────────
    const handleExportModal = () => {
        if (!filteredModalData.length) { toast.warning('No data to export'); return; }

        const columns = MODAL_COLUMNS[activeTab];
        const rows = filteredModalData.map((r, i) => addStatusLabel({ ...r, _sr: i + 1 }));
        const miqLabel = (selectedMiqaat?.label || 'Report').replace(/[^a-zA-Z0-9 _-]/g, '');
        const safeName = modalTitle.replace(/[^a-zA-Z0-9 _-]/g, '_');
        exportToExcel(rows, columns, `Attendance_${activeTab}_${safeName}_${miqLabel}`);
    };

    // ── Shared Select styles ──────────────────────────────────────────────────
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '38px',
            borderColor: state.isFocused ? '#0d6efd' : '#dee2e6',
            borderWidth: '2px',
            borderRadius: '8px',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13,110,253,.15)' : 'none',
            '&:hover': { borderColor: '#adb5bd' }
        }),
        placeholder: base => ({ ...base, color: '#6c757d', fontSize: '15px' }),
        singleValue: base => ({ ...base, fontSize: '15px' }),
        dropdownIndicator: base => ({ ...base, color: '#0d6efd', '&:hover': { color: '#0b5ed7' } }),
        menu: base => ({ ...base, zIndex: 1000 })
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const showScanned = activeTab !== 'Absent';

    // ── Permission loading state ──────────────────────────────────────────────
    if (checkingPermissions) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                minHeight: '400px', textAlign: 'center'
            }}>
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Checking permissions...</p>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Fragment>
            <style>{`
                .form-label {
                    font-weight: 500; font-size: 14px; color: #495057;
                    margin-bottom: 8px; display: block;
                }
                .form-label .text-danger { color: #dc3545; margin-left: 4px; }
                .badge-primary {
                    background: #0d6efd; color: #fff; padding: 6px 12px;
                    border-radius: 4px; font-size: 14px; font-weight: 500;
                }
                .btn-primary {
                    height: 38px; font-size: 14px; font-weight: 500;
                    border-radius: 8px; border: none; transition: all 0.2s;
                }
                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(13,110,253,.3);
                }
                .btn-success {
                    height: 38px; font-size: 14px; font-weight: 500;
                    border-radius: 8px; transition: all 0.2s;
                }
                .btn-success:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(25,135,84,.3);
                }

                /* ── Main grid rows ── */
                .att-data-row { cursor: pointer; transition: background 0.1s; }
                .att-data-row:hover td { background-color: #f0f4ff !important; }
                .att-total-row > td { font-weight: 700; cursor: pointer; background: #f8f9fa; }
                .att-total-row:hover td { background-color: #e9ecef !important; }

                /* ── Count cells — clickable hints ── */
                .count-cell {
                    text-align: center;
                    cursor: pointer;
                    font-weight: 600;
                    border-radius: 4px;
                    transition: background 0.15s;
                    user-select: none;
                }
                .count-cell:hover { opacity: 0.8; text-decoration: underline; }

                /* ── Modal tab bar ── */
                .att-tab-bar {
                    display: flex;
                    gap: 4px;
                    border-bottom: 2px solid #dee2e6;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                }
                .att-tab-btn {
                    padding: 8px 14px;
                    border: none;
                    background: none;
                    border-bottom: 3px solid transparent;
                    color: #6c757d;
                    font-size: 14px;
                    font-weight: 400;
                    cursor: pointer;
                    margin-bottom: -2px;
                    transition: all 0.15s;
                    border-radius: 4px 4px 0 0;
                    white-space: nowrap;
                }
                .att-tab-btn:hover { color: #0d6efd; background: #f0f4ff; }
                .att-tab-btn.active {
                    color: #0d6efd;
                    font-weight: 600;
                    border-bottom-color: #0d6efd;
                    background: none;
                }
                .att-tab-count {
                    display: inline-block;
                    margin-left: 6px;
                    padding: 1px 7px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 700;
                    background: #e9ecef;
                    color: #6c757d;
                    vertical-align: middle;
                    transition: all 0.15s;
                }
                .att-tab-btn.active .att-tab-count {
                    background: #0d6efd;
                    color: #fff;
                }
            `}</style>

            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>

                                {/* ── Header ── */}
                                <div className="page-header-title">
                                    <div className="header-text">
                                        <i className="ri-group-line"></i>
                                        <span>Attendance Report</span>
                                    </div>
                                    <div className="d-flex gap-2 align-items-center">
                                        <span className="badge badge-primary">
                                            Teams: {dataRows.length}
                                        </span>
                                    </div>
                                </div>

                                {/* ── Filters ── */}
                                <Row className="mb-4 align-items-end">
                                    <Col md={5}>
                                        <label className="form-label">
                                            Miqaat <span className="text-danger">*</span>
                                        </label>
                                        <Select
                                            options={miqaatOptions}
                                            value={selectedMiqaat}
                                            onChange={val => { setSelectedMiqaat(val); setTableData([]); }}
                                            placeholder="Select Miqaat"
                                            isClearable
                                            isLoading={loadingMiqaat}
                                            styles={selectStyles}
                                        />
                                    </Col>
                                    <Col md={2}>
                                        <Button
                                            variant="primary"
                                            className="w-100"
                                            onClick={fetchSummary}
                                            disabled={loading || !selectedMiqaat}
                                        >
                                            {loading ? (
                                                <><span className="spinner-border spinner-border-sm me-2"></span>Loading...</>
                                            ) : (
                                                <><i className="ri-search-line me-2"></i>Search</>
                                            )}
                                        </Button>
                                    </Col>
                                    <Col md={2}>
                                        <Button
                                            variant="success"
                                            className="w-100"
                                            onClick={handleExportMainGrid}
                                            disabled={!dataRows.length}
                                            title="Export to Excel"
                                        >
                                            <i className="ri-file-excel-2-line me-2"></i>Export
                                        </Button>
                                    </Col>
                                </Row>

                                {/* ── Summary cards ── */}
                                {totalRow && (
                                    <Row className="mb-4">
                                        {[
                                            { label: 'Total Quota', value: totalRow.total_quota, color: '#6f42c1', bg: '#e8daff', icon: 'ri-list-check' },
                                            { label: 'Total Assigned', value: totalRow.assigned_count, color: '#6c757d', bg: '#e9ecef', icon: 'ri-user-line' },
                                            { label: 'Present', value: totalRow.present_count, color: '#28a745', bg: '#d4edda', icon: 'ri-checkbox-circle-line' },
                                            { label: 'Absent', value: totalRow.absent_count, color: '#dc3545', bg: '#f8d7da', icon: 'ri-close-circle-line' },
                                            { label: 'Proxy', value: totalRow.proxy_count, color: '#0d6efd', bg: '#cfe2ff', icon: 'ri-user-add-line' },
                                        ].map(({ label, value, color, bg, icon }) => (
                                            <Col md={2} key={label}>
                                                <Card className="border-0 shadow-sm" style={{ background: bg }}>
                                                    <Card.Body className="p-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <h6 className="mb-1" style={{ color, fontSize: '14px' }}>{label}</h6>
                                                                <h3 className="mb-0" style={{ color, fontWeight: 'bold' }}>{value ?? 0}</h3>
                                                            </div>
                                                            <i className={icon} style={{ fontSize: '36px', color, opacity: 0.3 }}></i>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                )}

                                {/* ── Grid ── */}
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3 text-muted">Loading attendance data...</p>
                                    </div>
                                ) : dataRows.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="ri-inbox-line" style={{ fontSize: '64px', color: '#dee2e6' }}></i>
                                        <p className="text-muted mb-1 mt-3">No attendance records found</p>
                                        <small className="text-muted">Select a miqaat and click Search</small>
                                    </div>
                                ) : (
                                    <>
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th style={{ width: '50px' }}>SR</th>
                                                        <th>Team</th>
                                                        <th style={{ width: '90px', textAlign: 'center' }}>Quota</th>
                                                        <th style={{ width: '105px', textAlign: 'center' }}>Assigned</th>
                                                        <th style={{ width: '95px', textAlign: 'center' }}>Present</th>
                                                        <th style={{ width: '95px', textAlign: 'center' }}>Absent</th>
                                                        <th style={{ width: '90px', textAlign: 'center' }}>Proxy</th>
                                                    </tr>
                                                </thead>
                                                <tbody>

                                                    {/* ── Data rows ── */}
                                                    {dataRows.map((row, index) => (
                                                        <tr
                                                            key={row.team_id}
                                                            className="att-data-row"
                                                            onClick={() => openModal(row.team_id, row.team_name, 'All')}
                                                            title="Click to view all guards for this team"
                                                        >
                                                            <td>{index + 1}</td>
                                                            <td style={{ fontWeight: '500' }}>{row.team_name}</td>

                                                            {/* Quota — informational */}
                                                            <td style={{ textAlign: 'center', color: '#6f42c1', fontWeight: '600' }}>
                                                                {row.total_quota ?? 0}
                                                            </td>

                                                            {/* Assigned — not a tab, just informational */}
                                                            <td style={{ textAlign: 'center', color: '#6c757d', fontWeight: '600' }}>
                                                                {row.assigned_count ?? 0}
                                                            </td>

                                                            {/* Present — green, opens modal on Present tab */}
                                                            <td
                                                                className="count-cell"
                                                                style={{ color: '#28a745' }}
                                                                title="Click to view present guards"
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    openModal(row.team_id, row.team_name, 'Present');
                                                                }}
                                                            >
                                                                {row.present_count ?? 0}
                                                            </td>

                                                            {/* Absent — red, opens modal on Absent tab */}
                                                            <td
                                                                className="count-cell"
                                                                style={{ color: '#dc3545' }}
                                                                title="Click to view absent guards"
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    openModal(row.team_id, row.team_name, 'Absent');
                                                                }}
                                                            >
                                                                {row.absent_count ?? 0}
                                                            </td>

                                                            {/* Proxy — blue, opens modal on Proxy tab */}
                                                            <td
                                                                className="count-cell"
                                                                style={{ color: '#0d6efd' }}
                                                                title="Click to view proxy guards"
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    openModal(row.team_id, row.team_name, 'Proxy');
                                                                }}
                                                            >
                                                                {row.proxy_count ?? 0}
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {/* ── Total row ── */}
                                                    {totalRow && (
                                                        <tr
                                                            className="att-total-row"
                                                            onClick={() => openModal(null, null, 'All')}
                                                            title="Click to view all guards across all teams"
                                                        >
                                                            <td
                                                                colSpan={2}
                                                                style={{ textAlign: 'right', paddingRight: '16px' }}
                                                            >
                                                                <i className="ri-bar-chart-grouped-line me-2" style={{ opacity: 0.6 }}></i>
                                                                TOTAL
                                                            </td>
                                                            <td style={{ textAlign: 'center', color: '#6f42c1', fontWeight: '700' }}>
                                                                {totalRow.total_quota ?? 0}
                                                            </td>
                                                            <td style={{ textAlign: 'center', color: '#6c757d' }}>
                                                                {totalRow.assigned_count ?? 0}
                                                            </td>
                                                            <td
                                                                className="count-cell"
                                                                style={{ color: '#28a745' }}
                                                                title="View all present guards"
                                                                onClick={e => { e.stopPropagation(); openModal(null, null, 'Present'); }}
                                                            >
                                                                {totalRow.present_count ?? 0}
                                                            </td>
                                                            <td
                                                                className="count-cell"
                                                                style={{ color: '#dc3545' }}
                                                                title="View all absent guards"
                                                                onClick={e => { e.stopPropagation(); openModal(null, null, 'Absent'); }}
                                                            >
                                                                {totalRow.absent_count ?? 0}
                                                            </td>
                                                            <td
                                                                className="count-cell"
                                                                style={{ color: '#0d6efd' }}
                                                                title="View all proxy guards"
                                                                onClick={e => { e.stopPropagation(); openModal(null, null, 'Proxy'); }}
                                                            >
                                                                {totalRow.proxy_count ?? 0}
                                                            </td>
                                                        </tr>
                                                    )}

                                                </tbody>
                                            </table>
                                        </div>
                                        <small className="text-muted">
                                            <i className="ri-mouse-line me-1"></i>
                                            Click any row to view all guards &nbsp;·&nbsp;
                                            Click a <span style={{ color: '#28a745', fontWeight: 600 }}>Present</span>,{' '}
                                            <span style={{ color: '#dc3545', fontWeight: 600 }}>Absent</span>, or{' '}
                                            <span style={{ color: '#0d6efd', fontWeight: 600 }}>Proxy</span> count to jump to that tab
                                        </small>
                                    </>
                                )}

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>


            {/* ════════════════════════════════════════════════════════════════
                Drilldown Modal
            ════════════════════════════════════════════════════════════════ */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="xl"
                centered
                scrollable
            >
                {/* ── Sticky header ── */}
                <Modal.Header
                    closeButton
                    className="sticky-modal-header"
                    style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}
                >
                    <Modal.Title style={{ fontSize: '16px', fontWeight: '600', color: '#343a40' }}>
                        <i className="ri-group-line me-2 text-primary"></i>
                        {modalTitle}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ padding: '20px' }}>
                    {modalLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading guard details...</p>
                        </div>
                    ) : (
                        <>
                            {/* ── Tab bar ── */}
                            <div className="att-tab-bar">
                                {TABS.map(tab => (
                                    <button
                                        key={tab}
                                        className={`att-tab-btn${activeTab === tab ? ' active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab}
                                        <span className="att-tab-count">{tabCounts[tab]}</span>
                                    </button>
                                ))}
                            </div>

                            {/* ── Search bar ── */}
                            <div className="mb-3">
                                <div style={{ position: 'relative', maxWidth: '320px' }}>
                                    <i className="ri-search-line" style={{
                                        position: 'absolute', left: '10px', top: '50%',
                                        transform: 'translateY(-50%)', color: '#adb5bd', fontSize: '16px'
                                    }}></i>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by name or ITS ID..."
                                        value={modalSearch}
                                        onChange={e => setModalSearch(e.target.value)}
                                        style={{ paddingLeft: '34px', borderRadius: '8px', fontSize: '14px' }}
                                    />
                                    {modalSearch && (
                                        <button
                                            onClick={() => setModalSearch('')}
                                            style={{
                                                position: 'absolute', right: '10px', top: '50%',
                                                transform: 'translateY(-50%)', background: 'none',
                                                border: 'none', cursor: 'pointer', color: '#adb5bd',
                                                fontSize: '16px', padding: '0', lineHeight: 1
                                            }}
                                            title="Clear search"
                                        >
                                            <i className="ri-close-line"></i>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* ── Result count badge ── */}
                            <div className="mb-3 d-flex align-items-center gap-2">
                                <span className="badge" style={{
                                    background: '#cfe2ff', color: '#0d6efd',
                                    padding: '6px 12px', borderRadius: '4px',
                                    fontSize: '13px', fontWeight: '500'
                                }}>
                                    {filteredModalData.length} guard{filteredModalData.length !== 1 ? 's' : ''}
                                    {modalSearch ? ' (filtered)' : ''}
                                </span>
                            </div>

                            {/* ── Table ── */}
                            {filteredModalData.length === 0 ? (
                                <div className="text-center py-4">
                                    <i className="ri-user-unfollow-line" style={{ fontSize: '48px', color: '#dee2e6' }}></i>
                                    <p className="mt-2 text-muted">
                                        {modalSearch ? 'No guards match your search' : `No ${activeTab === 'All' ? '' : activeTab.toLowerCase() + ' '}guards found`}
                                    </p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table bordered hover size="sm" style={{ fontSize: '14px' }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: '50px' }}>SR</th>
                                                <th style={{ width: '100px' }}>ITS ID</th>
                                                <th>Full Name</th>
                                                <th>Position</th>
                                                <th>Jamiaat</th>
                                                <th>Team</th>
                                                <th>Venue</th>
                                                <th>Location</th>
                                                <th>Mobile</th>
                                                <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                                                {showScanned && <th>Scanned By</th>}
                                                {showScanned && <th>Scanned Date</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredModalData.map((guard, index) => (
                                                <tr key={`${guard.attendance_id ?? guard.guard_duty_id ?? guard.its_id}-${index}`}>
                                                    <td>{index + 1}</td>
                                                    <td>{guard.its_id}</td>
                                                    <td style={{ fontWeight: '500' }}>
                                                        {guard.full_name || '-'}
                                                    </td>
                                                    <td>{guard.position_name || '-'}</td>
                                                    <td>{guard.jamiaat_name || '-'}</td>
                                                    <td>{guard.team_name || '-'}</td>
                                                    <td>{guard.venue_name || '-'}</td>
                                                    <td>{guard.location_name || '-'}</td>
                                                    <td>{guard.mobile || '-'}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <StatusBadge status={guard.attendance_status} />
                                                    </td>
                                                    {showScanned && <td style={{ fontSize: '13px', color: '#6c757d' }}>{guard.scanned_by || '-'}</td>}
                                                    {showScanned && <td style={{ fontSize: '13px', color: '#6c757d' }}>{guard.scanned_date || '-'}</td>}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>

                {/* ── Sticky footer ── */}
                <Modal.Footer
                    className="sticky-modal-footer"
                    style={{ background: '#f8f9fa', borderTop: '2px solid #dee2e6' }}
                >
                    <Button
                        variant="success"
                        onClick={handleExportModal}
                        disabled={modalLoading || !filteredModalData.length}
                        title={`Export ${activeTab} tab to Excel`}
                    >
                        <i className="ri-file-excel-2-line me-2"></i>
                        Export {activeTab !== 'All' ? activeTab : ''} to Excel
                    </Button>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};

export default AttendanceReport;