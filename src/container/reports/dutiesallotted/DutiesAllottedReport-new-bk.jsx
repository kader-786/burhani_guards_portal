// import { Fragment, useEffect, useMemo, useState } from 'react';
// import { Card, Col, Row, Button } from 'react-bootstrap';
// import Select from 'react-select';
// import { toast } from 'react-toastify';
// import Swal from 'sweetalert2';
// import { useNavigate } from 'react-router-dom';
// import { checkModuleAccess } from '../../../utils/accessControl';
// import '../../../styles/shared-styles.css';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// /**
//  * DutiesAllottedReport
//  *
//  * Props:
//  *   moduleId  {string}       — RBAC module ID (e.g. '112')
//  *   jamiaatId {number|null}  — null = Backoffice (all), 1/2/20 for named jamiaats
//  *   title     {string}       — Page header label
//  */
// const DutiesAllottedReport = ({ moduleId, jamiaatId, title }) => {
//     const navigate = useNavigate();

//     // ── RBAC ─────────────────────────────────────────────────────────────────
//     const [checkingPermissions, setCheckingPermissions] = useState(true);
//     const [permissions, setPermissions] = useState({
//         canAdd: false, canEdit: false, canDelete: false, hasAccess: false
//     });

//     // ── Miqaat dropdown ───────────────────────────────────────────────────────
//     const [miqaatOptions, setMiqaatOptions] = useState([]);
//     const [selectedMiqaat, setSelectedMiqaat] = useState(null);
//     const [loadingMiqaat, setLoadingMiqaat] = useState(false);

//     // ── Main report data ──────────────────────────────────────────────────────
//     const [tableData, setTableData] = useState([]);
//     const [summary, setSummary] = useState(null); // { total_quota, total_assigned, balance }
//     const [loading, setLoading] = useState(false);

//     // ── RBAC check ────────────────────────────────────────────────────────────
//     useEffect(() => {
//         const isAdminValue = appStorage.getItem('is_admin');
//         if (isAdminValue === 'true' || isAdminValue === true || isAdminValue === '1') {
//             setPermissions({ canAdd: true, canEdit: true, canDelete: true, hasAccess: true });
//             setCheckingPermissions(false);
//             return;
//         }

//         const accessRights = appStorage.getItem('access_rights');
//         if (!accessRights) {
//             Swal.fire({
//                 icon: 'error', title: 'Session Expired',
//                 text: 'Please login again', confirmButtonText: 'OK', allowOutsideClick: false
//             }).then(() => navigate(`${import.meta.env.BASE_URL}login/`));
//             return;
//         }

//         const access = checkModuleAccess(accessRights, moduleId);
//         if (!access.hasAccess) {
//             Swal.fire({
//                 icon: 'warning', title: 'Access Denied',
//                 text: 'You do not have permission to access this module.',
//                 confirmButtonText: 'OK'
//             }).then(() => navigate(`${import.meta.env.BASE_URL}dashboard/`));
//             return;
//         }

//         setPermissions(access);
//         setCheckingPermissions(false);
//     }, [navigate, moduleId]);

//     // ── Fetch miqaat options ──────────────────────────────────────────────────
//     useEffect(() => {
//         const fetchAllMiqaats = async () => {
//             setLoadingMiqaat(true);
//             try {
//                 const token = appStorage.getItem('access_token');
//                 if (!token) { toast.error('Authentication token not found. Please login again.'); return; }

//                 const response = await fetch(`${API_BASE_URL}/Miqaat/GetActiveOrLiveMiqaat`, {
//                     method: 'GET',
//                     headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
//                 });

//                 if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

//                 const result = await response.json();
//                 if (response.ok && result.success) {
//                     setMiqaatOptions(result.data.map(item => ({
//                         value: item.miqaat_id,
//                         label: item.miqaat_name
//                     })));
//                 } else {
//                     toast.error(result.message || 'Failed to load miqaats');
//                 }
//             } catch (error) {
//                 console.error(error);
//                 toast.error('Error loading miqaats');
//             } finally {
//                 setLoadingMiqaat(false);
//             }
//         };

//         fetchAllMiqaats();
//     }, []);

//     // ── Fetch main report ─────────────────────────────────────────────────────
//     const fetchReport = async () => {
//         if (!selectedMiqaat) { toast.warning('Please select a Miqaat'); return; }

//         setLoading(true);
//         setTableData([]);
//         setSummary(null);
//         try {
//             const token = appStorage.getItem('access_token');
//             const body = { miqaat_id: selectedMiqaat.value };
//             if (jamiaatId !== null && jamiaatId !== undefined) {
//                 body.jamiaat_id = jamiaatId;
//             }

//             const response = await fetch(`${API_BASE_URL}/Reports/GetDutiesAllottedGuards`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//                 body: JSON.stringify(body)
//             });

//             if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

//             const result = await response.json();
//             if (response.ok && result.success) {
//                 setTableData(result.data || []);
//                 setSummary(result.summary || null);
//                 if ((result.data || []).length === 0) {
//                     toast.info('No guard records found for the selected criteria');
//                 } else {
//                     toast.success(`Found ${result.data.length} guard record(s)`);
//                 }
//             } else {
//                 toast.error(result.message || 'Failed to load report');
//             }
//         } catch (error) {
//             console.error(error);
//             toast.error('Error loading report');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ── Excel export ──────────────────────────────────────────────────────────
//     const exportToExcel = (rows, columns, filename) => {
//         import('xlsx').then(XLSX => {
//             const header = columns.map(c => c.label);
//             const data = rows.map(row => columns.map(c => row[c.key] ?? ''));

//             const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

//             ws['!cols'] = columns.map((c, i) => ({
//                 wch: Math.max(c.label.length, ...data.map(r => String(r[i] ?? '').length)) + 2
//             }));

//             const wb = XLSX.utils.book_new();
//             XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//             XLSX.writeFile(wb, `${filename}.xlsx`);
//         });
//     };

//     const handleExport = () => {
//         if (!tableData.length) { toast.warning('No data to export'); return; }

//         const columns = [
//             { label: 'SR', key: '_sr' },
//             { label: 'ITS ID', key: 'its_id' },
//             { label: 'Full Name', key: 'full_name' },
//             { label: 'Position', key: 'position_name' },
//             { label: 'Jamiaat', key: 'jamiaat_name' },
//             { label: 'Team', key: 'team_name' },
//             { label: 'Location', key: 'location_name' },
//             { label: 'Mobile', key: 'mobile' },
//             { label: 'Incharge', key: 'incharge_name' },
//         ];

//         const rows = tableData.map((row, i) => ({ ...row, _sr: i + 1 }));
//         const miqaatLabel = (selectedMiqaat?.label || 'Report').replace(/[^a-zA-Z0-9 _-]/g, '');
//         exportToExcel(rows, columns, `Guards_${miqaatLabel}`);
//     };

//     // ── Shared select styles ──────────────────────────────────────────────────
//     const selectStyles = {
//         control: (base, state) => ({
//             ...base,
//             minHeight: '38px',
//             borderColor: state.isFocused ? '#0d6efd' : '#dee2e6',
//             borderWidth: '2px',
//             borderRadius: '8px',
//             boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13,110,253,.15)' : 'none',
//             '&:hover': { borderColor: '#adb5bd' }
//         }),
//         placeholder: (base) => ({ ...base, color: '#6c757d', fontSize: '15px' }),
//         singleValue: (base) => ({ ...base, fontSize: '15px' }),
//         dropdownIndicator: (base) => ({
//             ...base, color: '#0d6efd', '&:hover': { color: '#0b5ed7' }
//         }),
//         menu: (base) => ({ ...base, zIndex: 1000 })
//     };

//     // ── Permission loading state ──────────────────────────────────────────────
//     if (checkingPermissions) {
//         return (
//             <Fragment>
//                 <div style={{
//                     display: 'flex', flexDirection: 'column',
//                     alignItems: 'center', justifyContent: 'center',
//                     minHeight: '400px', textAlign: 'center'
//                 }}>
//                     <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
//                         <span className="visually-hidden">Loading...</span>
//                     </div>
//                     <p className="mt-3">Checking permissions...</p>
//                 </div>
//             </Fragment>
//         );
//     }

//     // ── Render ────────────────────────────────────────────────────────────────
//     return (
//         <Fragment>
//             <div style={{ margin: '20px auto', maxWidth: '100%' }}>
//                 <Row>
//                     <Col xl={12}>
//                         <Card className="custom-card">
//                             <Card.Body>
//                                 <style>{`
//                                     .form-label {
//                                         font-weight: 500; font-size: 14px; color: #495057;
//                                         margin-bottom: 8px; display: block;
//                                     }
//                                     .form-label .text-danger { color: #dc3545; margin-left: 4px; }
//                                     .badge-primary {
//                                         background: #0d6efd; color: #fff; padding: 6px 12px;
//                                         border-radius: 4px; font-size: 14px; font-weight: 500;
//                                     }
//                                     .btn-primary {
//                                         height: 38px; font-size: 14px; font-weight: 500;
//                                         border-radius: 8px; border: none; transition: all 0.2s;
//                                     }
//                                     .btn-primary:hover:not(:disabled) {
//                                         transform: translateY(-1px);
//                                         box-shadow: 0 4px 12px rgba(13,110,253,.3);
//                                     }
//                                     .btn-success {
//                                         height: 38px; font-size: 14px; font-weight: 500;
//                                         border-radius: 8px; transition: all 0.2s;
//                                     }
//                                     .btn-success:hover:not(:disabled) {
//                                         transform: translateY(-1px);
//                                         box-shadow: 0 4px 12px rgba(25,135,84,.3);
//                                     }
//                                 `}</style>

//                                 {/* ── Header ── */}
//                                 <div className="page-header-title">
//                                     <div className="header-text">
//                                         <i className="ri-shield-user-line"></i>
//                                         <span>{title}</span>
//                                     </div>
//                                     <div className="d-flex gap-2 align-items-center">
//                                         <span className="badge badge-primary">
//                                             Total Records: {tableData.length}
//                                         </span>
//                                     </div>
//                                 </div>

//                                 {/* ── Filters ── */}
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
//                                     <Col md={2}>
//                                         <Button
//                                             variant="primary"
//                                             className="w-100"
//                                             onClick={fetchReport}
//                                             disabled={loading || !selectedMiqaat}
//                                         >
//                                             {loading ? (
//                                                 <>
//                                                     <span className="spinner-border spinner-border-sm me-2"></span>
//                                                     Loading...
//                                                 </>
//                                             ) : (
//                                                 <><i className="ri-search-line me-2"></i>Search</>
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

//                                 {/* ── Summary cards ── */}
//                                 {summary && (
//                                     <Row className="mb-4">
//                                         <Col md={4}>
//                                             <Card className="border-0 shadow-sm" style={{ background: '#cfe2ff' }}>
//                                                 <Card.Body className="p-3">
//                                                     <div className="d-flex justify-content-between align-items-center">
//                                                         <div>
//                                                             <h6 className="mb-1" style={{ color: '#0d6efd', fontSize: '14px' }}>Total Quota</h6>
//                                                             <h3 className="mb-0" style={{ color: '#0d6efd', fontWeight: 'bold' }}>{summary.total_quota}</h3>
//                                                         </div>
//                                                         <i className="ri-group-line" style={{ fontSize: '36px', color: '#0d6efd', opacity: 0.3 }}></i>
//                                                     </div>
//                                                 </Card.Body>
//                                             </Card>
//                                         </Col>
//                                         <Col md={4}>
//                                             <Card className="border-0 shadow-sm" style={{ background: '#d4edda' }}>
//                                                 <Card.Body className="p-3">
//                                                     <div className="d-flex justify-content-between align-items-center">
//                                                         <div>
//                                                             <h6 className="mb-1" style={{ color: '#28a745', fontSize: '14px' }}>Total Assigned</h6>
//                                                             <h3 className="mb-0" style={{ color: '#28a745', fontWeight: 'bold' }}>{summary.total_assigned}</h3>
//                                                         </div>
//                                                         <i className="ri-user-check-line" style={{ fontSize: '36px', color: '#28a745', opacity: 0.3 }}></i>
//                                                     </div>
//                                                 </Card.Body>
//                                             </Card>
//                                         </Col>
//                                         <Col md={4}>
//                                             <Card className="border-0 shadow-sm" style={{ background: '#f8d7da' }}>
//                                                 <Card.Body className="p-3">
//                                                     <div className="d-flex justify-content-between align-items-center">
//                                                         <div>
//                                                             <h6 className="mb-1" style={{ color: '#dc3545', fontSize: '14px' }}>Balance</h6>
//                                                             <h3 className="mb-0" style={{ color: '#dc3545', fontWeight: 'bold' }}>{summary.balance}</h3>
//                                                         </div>
//                                                         <i className="ri-user-unfollow-line" style={{ fontSize: '36px', color: '#dc3545', opacity: 0.3 }}></i>
//                                                     </div>
//                                                 </Card.Body>
//                                             </Card>
//                                         </Col>
//                                     </Row>
//                                 )}

//                                 {/* ── Table / empty / loading ── */}
//                                 {loading ? (
//                                     <div className="text-center py-5">
//                                         <div className="spinner-border text-primary" role="status">
//                                             <span className="visually-hidden">Loading...</span>
//                                         </div>
//                                         <p className="mt-3 text-muted">Loading guard data...</p>
//                                     </div>
//                                 ) : tableData.length === 0 ? (
//                                     <div className="text-center py-5">
//                                         <div className="mb-3">
//                                             <i className="ri-inbox-line" style={{ fontSize: '64px', color: '#dee2e6' }}></i>
//                                         </div>
//                                         <p className="text-muted mb-1">No guard records found</p>
//                                         <small className="text-muted">Select a miqaat and click search to view records</small>
//                                     </div>
//                                 ) : (
//                                     <div className="table-responsive">
//                                         <table className="table table-bordered table-hover">
//                                             <thead className="table-light">
//                                                 <tr>
//                                                     <th style={{ width: '55px' }}>SR</th>
//                                                     <th style={{ width: '100px' }}>ITS ID</th>
//                                                     <th>Full Name</th>
//                                                     <th>Position</th>
//                                                     <th>Jamiaat</th>
//                                                     <th>Team</th>
//                                                     <th>Location</th>
//                                                     <th>Mobile</th>
//                                                     <th>Incharge</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {tableData.map((row, index) => (
//                                                     <tr key={`${row.its_id}-${row.location_id}`}>
//                                                         <td>{index + 1}</td>
//                                                         <td>{row.its_id}</td>
//                                                         <td>{row.full_name || '-'}</td>
//                                                         <td>{row.position_name || '-'}</td>
//                                                         <td>{row.jamiaat_name || '-'}</td>
//                                                         <td>{row.team_name || '-'}</td>
//                                                         <td>{row.location_name || '-'}</td>
//                                                         <td>{row.mobile || '-'}</td>
//                                                         <td>{row.incharge_name || '-'}</td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>
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

// export default DutiesAllottedReport;

import { Fragment, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap';
import Select from 'react-select';
import { Grid } from 'gridjs-react';
import 'gridjs/dist/theme/mermaid.css';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { checkModuleAccess } from '../../../utils/accessControl';
import '../../../styles/shared-styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * DutiesAllottedReport
 *
 * Props:
 *   moduleId  {string}       — RBAC module ID (e.g. '112')
 *   jamiaatId {number|null}  — null = Backoffice (all), 1/2/20 for named jamiaats
 *   title     {string}       — Page header label
 */
const DutiesAllottedReport = ({ moduleId, jamiaatId, title }) => {
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

    // ── Main report data ──────────────────────────────────────────────────────
    const [tableData, setTableData] = useState([]);
    const [summary, setSummary] = useState(null); // { total_quota, total_assigned, balance }
    const [loading, setLoading] = useState(false);

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

        const access = checkModuleAccess(accessRights, moduleId);
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
    }, [navigate, moduleId]);

    // ── Fetch miqaat options ──────────────────────────────────────────────────
    useEffect(() => {
        const fetchAllMiqaats = async () => {
            setLoadingMiqaat(true);
            try {
                const token = appStorage.getItem('access_token');
                if (!token) { toast.error('Authentication token not found. Please login again.'); return; }

                const response = await fetch(`${API_BASE_URL}/Miqaat/GetActiveOrLiveMiqaat`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
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
            } catch (error) {
                console.error(error);
                toast.error('Error loading miqaats');
            } finally {
                setLoadingMiqaat(false);
            }
        };

        fetchAllMiqaats();
    }, []);

    // ── Fetch main report ─────────────────────────────────────────────────────
    const fetchReport = async () => {
        if (!selectedMiqaat) { toast.warning('Please select a Miqaat'); return; }

        setLoading(true);
        setTableData([]);
        setSummary(null);
        try {
            const token = appStorage.getItem('access_token');
            const body = { miqaat_id: selectedMiqaat.value };
            if (jamiaatId !== null && jamiaatId !== undefined) {
                body.jamiaat_id = jamiaatId;
            }

            const response = await fetch(`${API_BASE_URL}/Reports/GetDutiesAllottedGuards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });

            if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

            const result = await response.json();
            if (response.ok && result.success) {
                setTableData(result.data || []);
                setSummary(result.summary || null);
                if ((result.data || []).length === 0) {
                    toast.info('No guard records found for the selected criteria');
                } else {
                    toast.success(`Found ${result.data.length} guard record(s)`);
                }
            } else {
                toast.error(result.message || 'Failed to load report');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error loading report');
        } finally {
            setLoading(false);
        }
    };

    // ── GridJS data ───────────────────────────────────────────────────────────
    const gridData = useMemo(() => {
        return tableData.map((row, index) => [
            index + 1,
            row.its_id,
            row.full_name || '-',
            row.position_name || '-',
            row.jamiaat_name || '-',
            row.team_name || '-',
            row.location_name || '-',
            row.mobile || '-',
            row.incharge_name || '-',
        ]);
    }, [tableData]);

    // ── Excel export ──────────────────────────────────────────────────────────
    const handleExport = () => {
        if (!tableData.length) { toast.warning('No data to export'); return; }

        const columns = [
            { label: 'SR', key: '_sr' },
            { label: 'ITS ID', key: 'its_id' },
            { label: 'Full Name', key: 'full_name' },
            { label: 'Position', key: 'position_name' },
            { label: 'Jamiaat', key: 'jamiaat_name' },
            { label: 'Team', key: 'team_name' },
            { label: 'Location', key: 'location_name' },
            { label: 'Mobile', key: 'mobile' },
            { label: 'Incharge', key: 'incharge_name' },
        ];

        const rows = tableData.map((row, i) => ({ ...row, _sr: i + 1 }));

        import('xlsx').then(XLSX => {
            const header = columns.map(c => c.label);
            const data = rows.map(row => columns.map(c => row[c.key] ?? ''));

            const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
            ws['!cols'] = columns.map((c, i) => ({
                wch: Math.max(c.label.length, ...data.map(r => String(r[i] ?? '').length)) + 2
            }));

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            const miqaatLabel = (selectedMiqaat?.label || 'Report').replace(/[^a-zA-Z0-9 _-]/g, '');
            XLSX.writeFile(wb, `Guards_${miqaatLabel}.xlsx`);
        });
    };

    // ── Shared select styles ──────────────────────────────────────────────────
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
        placeholder: (base) => ({ ...base, color: '#6c757d', fontSize: '15px' }),
        singleValue: (base) => ({ ...base, fontSize: '15px' }),
        dropdownIndicator: (base) => ({
            ...base, color: '#0d6efd', '&:hover': { color: '#0b5ed7' }
        }),
        menu: (base) => ({ ...base, zIndex: 1000 })
    };

    // ── Permission loading state ──────────────────────────────────────────────
    if (checkingPermissions) {
        return (
            <Fragment>
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
            </Fragment>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Fragment>
            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>
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
                                `}</style>

                                {/* ── Header ── */}
                                <div className="page-header-title">
                                    <div className="header-text">
                                        <i className="ri-shield-user-line"></i>
                                        <span>{title}</span>
                                    </div>
                                    <div className="d-flex gap-2 align-items-center">
                                        <span className="badge badge-primary">
                                            Total Records: {tableData.length}
                                        </span>
                                    </div>
                                </div>

                                {/* ── Filters ── */}
                                <Row className="mb-4 align-items-end">
                                    <Col md={4}>
                                        <label className="form-label">
                                            Miqaat <span className="text-danger">*</span>
                                        </label>
                                        <Select
                                            options={miqaatOptions}
                                            value={selectedMiqaat}
                                            onChange={setSelectedMiqaat}
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
                                            onClick={fetchReport}
                                            disabled={loading || !selectedMiqaat}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Loading...
                                                </>
                                            ) : (
                                                <><i className="ri-search-line me-2"></i>Search</>
                                            )}
                                        </Button>
                                    </Col>
                                    <Col md={2}>
                                        <Button
                                            variant="success"
                                            className="w-100"
                                            onClick={handleExport}
                                            disabled={!tableData.length}
                                            title="Export to Excel"
                                        >
                                            <i className="ri-file-excel-2-line me-2"></i>
                                            Export
                                        </Button>
                                    </Col>
                                </Row>

                                {/* ── Summary cards ── */}
                                {summary && (
                                    <Row className="mb-4">
                                        <Col md={4}>
                                            <Card className="border-0 shadow-sm" style={{ background: '#cfe2ff' }}>
                                                <Card.Body className="p-3">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6 className="mb-1" style={{ color: '#0d6efd', fontSize: '14px' }}>Total Quota</h6>
                                                            <h3 className="mb-0" style={{ color: '#0d6efd', fontWeight: 'bold' }}>{summary.total_quota}</h3>
                                                        </div>
                                                        <i className="ri-group-line" style={{ fontSize: '36px', color: '#0d6efd', opacity: 0.3 }}></i>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4}>
                                            <Card className="border-0 shadow-sm" style={{ background: '#d4edda' }}>
                                                <Card.Body className="p-3">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6 className="mb-1" style={{ color: '#28a745', fontSize: '14px' }}>Total Assigned</h6>
                                                            <h3 className="mb-0" style={{ color: '#28a745', fontWeight: 'bold' }}>{summary.total_assigned}</h3>
                                                        </div>
                                                        <i className="ri-user-check-line" style={{ fontSize: '36px', color: '#28a745', opacity: 0.3 }}></i>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4}>
                                            <Card className="border-0 shadow-sm" style={{ background: '#f8d7da' }}>
                                                <Card.Body className="p-3">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6 className="mb-1" style={{ color: '#dc3545', fontSize: '14px' }}>Balance</h6>
                                                            <h3 className="mb-0" style={{ color: '#dc3545', fontWeight: 'bold' }}>{summary.balance}</h3>
                                                        </div>
                                                        <i className="ri-user-unfollow-line" style={{ fontSize: '36px', color: '#dc3545', opacity: 0.3 }}></i>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                )}

                                {/* ── Grid / empty / loading ── */}
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3 text-muted">Loading guard data...</p>
                                    </div>
                                ) : tableData.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <i className="ri-inbox-line" style={{ fontSize: '64px', color: '#dee2e6' }}></i>
                                        </div>
                                        <p className="text-muted mb-1">No guard records found</p>
                                        <small className="text-muted">Select a miqaat and click search to view records</small>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <Grid
                                            data={gridData}
                                            sort={true}
                                            search={{ enabled: true, placeholder: 'Type a keyword...' }}
                                            columns={[
                                                { name: 'SR', width: '70px', sort: true },
                                                { name: 'ITS ID', width: '100px', sort: true },
                                                { name: 'FULL NAME', width: '180px', sort: true },
                                                { name: 'POSITION', width: '130px', sort: true },
                                                { name: 'JAMIAAT', width: '120px', sort: true },
                                                { name: 'TEAM', width: '140px', sort: true },
                                                { name: 'LOCATION', width: '140px', sort: true },
                                                { name: 'MOBILE', width: '130px', sort: true },
                                                { name: 'INCHARGE', width: '180px', sort: true },
                                            ]}
                                            pagination={{ limit: 10, summary: true }}
                                            className={{ table: 'table table-bordered table-hover' }}
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

export default DutiesAllottedReport;