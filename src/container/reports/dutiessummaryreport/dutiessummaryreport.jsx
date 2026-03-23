// import { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
// import { Card, Col, Row, Button, Modal, Table } from 'react-bootstrap';
// import Select from 'react-select';
// import { toast } from 'react-toastify';
// import Swal from 'sweetalert2';
// import { useNavigate } from 'react-router-dom';
// import { checkModuleAccess } from '../../../utils/accessControl';
// import '../../../styles/shared-styles.css';
// import appStorage from '../../../utils/storage';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const TOTAL_SENTINEL = 10000000000000;

// /**
//  * DutiesSummaryReport
//  *
//  * Props:
//  *   moduleId {string} — RBAC module ID ('118')
//  *   title    {string} — Page header label
//  */
// const DutiesSummaryReport = ({ moduleId, title }) => {
//     const navigate = useNavigate();

//     // ── RBAC ─────────────────────────────────────────────────────────────────
//     const [checkingPermissions, setCheckingPermissions] = useState(true);
//     const [permissions, setPermissions] = useState({
//         canAdd: false, canEdit: false, canDelete: false, hasAccess: false
//     });

//     // ── Miqaat group dropdown ─────────────────────────────────────────────────
//     const [miqaatGroupOptions, setMiqaatGroupOptions] = useState([]);
//     const [selectedMiqaatGroup, setSelectedMiqaatGroup] = useState(null);
//     const [loadingMiqaatGroups, setLoadingMiqaatGroups] = useState(false);

//     // ── Main report data ──────────────────────────────────────────────────────
//     const [tableData, setTableData] = useState([]);
//     const [loading, setLoading] = useState(false);

//     // ── Drilldown modal ───────────────────────────────────────────────────────
//     const [showModal, setShowModal] = useState(false);
//     const [modalTitle, setModalTitle] = useState('');
//     const [drilldownData, setDrilldownData] = useState([]);
//     const [loadingDrilldown, setLoadingDrilldown] = useState(false);
//     const [selectedTeam, setSelectedTeam] = useState(null);

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

//     // ── Fetch miqaat groups ───────────────────────────────────────────────────
//     useEffect(() => {
//         const fetchMiqaatGroups = async () => {
//             setLoadingMiqaatGroups(true);
//             try {
//                 const accessToken = appStorage.getItem('access_token');
//                 if (!accessToken) return;

//                 const response = await fetch(`${API_BASE_URL}/Miqaat/GetMiqaatGroups`, {
//                     method: 'GET',
//                     headers: {
//                         'Accept': 'application/json',
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${accessToken}`
//                     }
//                 });

//                 if (response.ok) {
//                     const result = await response.json();
//                     if (result.success && result.data) {
//                         const options = result.data.map(item => ({
//                             value: item.miqaat_group,
//                             label: item.miqaat_group
//                         }));
//                         setMiqaatGroupOptions(options);
//                     }
//                 }
//             } catch (error) {
//                 console.error('Error fetching miqaat groups:', error);
//                 toast.error('Error loading miqaat groups');
//             } finally {
//                 setLoadingMiqaatGroups(false);
//             }
//         };

//         fetchMiqaatGroups();
//     }, []);

//     // ── Fetch main report ─────────────────────────────────────────────────────
//     const fetchReport = async () => {
//         if (!selectedMiqaatGroup) { toast.warning('Please select a Miqaat Group'); return; }

//         setLoading(true);
//         setTableData([]);
//         try {
//             const token = appStorage.getItem('access_token');
//             const response = await fetch(`${API_BASE_URL}/Reports/GetDutiesSummaryReport`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({ miqaat_group: selectedMiqaatGroup.value })
//             });

//             if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

//             const result = await response.json();
//             if (response.ok && result.success) {
//                 setTableData(result.data || []);
//                 if ((result.data || []).length === 0) {
//                     toast.info('No duty records found for the selected miqaat group');
//                 } else {
//                     const teamCount = (result.data || []).filter(r => r.team_id !== TOTAL_SENTINEL).length;
//                     toast.success(`Found ${teamCount} team(s)`);
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

//     // ── Fetch drilldown ───────────────────────────────────────────────────────
//     const fetchDrilldown = useCallback(async (row) => {
//         if (row.team_id === TOTAL_SENTINEL) return;

//         setSelectedTeam(row);
//         setDrilldownData([]);
//         setLoadingDrilldown(true);
//         setShowModal(true);
//         setModalTitle(`${row.team_name} — ${selectedMiqaatGroup?.value || ''}`);

//         try {
//             const token = appStorage.getItem('access_token');
//             const response = await fetch(`${API_BASE_URL}/Reports/GetDutiesSummaryDrilldown`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({
//                     miqaat_group: selectedMiqaatGroup.value,
//                     team_id: row.team_id
//                 })
//             });

//             if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

//             const result = await response.json();
//             if (response.ok && result.success) {
//                 setDrilldownData(result.data || []);
//                 if ((result.data || []).length === 0) {
//                     toast.info('No members found for this team');
//                 }
//             } else {
//                 toast.error(result.message || 'Failed to load member details');
//             }
//         } catch (error) {
//             console.error(error);
//             toast.error('Error loading member details');
//         } finally {
//             setLoadingDrilldown(false);
//         }
//     }, [selectedMiqaatGroup]);

//     // ── Excel export helpers ──────────────────────────────────────────────────
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

//     const handleExportMainGrid = () => {
//         if (!tableData.length) { toast.warning('No data to export'); return; }

//         const exportRows = tableData.map((row, i) => ({
//             ...row,
//             _sr: row.team_id === TOTAL_SENTINEL ? 'Total' : i + 1
//         }));

//         const columns = [
//             { label: 'SR', key: '_sr' },
//             { label: 'Jamiaat', key: 'jamiaat_name' },
//             { label: 'Team', key: 'team_name' },
//             { label: 'Members', key: 'member_count' },
//             { label: 'Duties', key: 'duties_count' },
//             { label: 'Assigned', key: 'assigned_count' },
//             { label: 'Present', key: 'present_count' },
//             { label: 'Absent', key: 'absent_count' },
//             { label: 'Proxy', key: 'proxy_count' },
//         ];

//         const groupLabel = (selectedMiqaatGroup?.value || 'Report').replace(/[^a-zA-Z0-9 _-]/g, '_');
//         exportToExcel(exportRows, columns, `Duties_Summary_${groupLabel}`);
//     };

//     const handleExportDrilldown = () => {
//         if (!drilldownData.length) { toast.warning('No data to export'); return; }

//         const columns = [
//             { label: 'SR', key: '_sr' },
//             { label: 'ITS ID', key: 'its_id' },
//             { label: 'Full Name', key: 'full_name' },
//             { label: 'Position', key: 'position_name' },
//             { label: 'Jamiaat', key: 'jamiaat_name' },
//             { label: 'Mobile', key: 'mobile' },
//             { label: 'Assigned', key: 'assigned_count' },
//             { label: 'Present', key: 'present_count' },
//             { label: 'Absent', key: 'absent_count' },
//             { label: 'Proxy', key: 'proxy_count' },
//         ];

//         const rows = drilldownData.map((row, i) => ({ ...row, _sr: i + 1 }));
//         const teamLabel = (selectedTeam?.team_name || 'Team').replace(/[^a-zA-Z0-9 _-]/g, '_');
//         const groupLabel = (selectedMiqaatGroup?.value || 'Report').replace(/[^a-zA-Z0-9 _-]/g, '_');
//         exportToExcel(rows, columns, `Duties_Summary_${teamLabel}_${groupLabel}`);
//     };

//     // ── Summary cards (exclude Total row) ────────────────────────────────────
//     const summary = useMemo(() => {
//         const rows = tableData.filter(r => r.team_id !== TOTAL_SENTINEL);
//         return {
//             totalTeams: rows.length,
//             totalMembers: rows.reduce((s, r) => s + (r.member_count || 0), 0),
//             totalDuties: rows.reduce((s, r) => s + (r.duties_count || 0), 0),
//             totalAssigned: rows.reduce((s, r) => s + (r.assigned_count || 0), 0),
//             totalPresent: rows.reduce((s, r) => s + (r.present_count || 0), 0),
//             totalAbsent: rows.reduce((s, r) => s + (r.absent_count || 0), 0),
//         };
//     }, [tableData]);

//     // ── Select styles ─────────────────────────────────────────────────────────
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

//     // ── Permission loading ────────────────────────────────────────────────────
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
//                                     .team-row { cursor: pointer; }
//                                     .team-row:hover td { background-color: #f0f4ff !important; }
//                                     .total-row > td { font-weight: 700; background-color: #f8f9fa; }
//                                     .unassigned-row td {
//                                         color: #adb5bd;
//                                         font-style: italic;
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
//                                             Total Teams: {tableData.filter(r => r.team_id !== TOTAL_SENTINEL).length}
//                                         </span>
//                                     </div>
//                                 </div>

//                                 {/* ── Filters ── */}
//                                 <Row className="mb-4 align-items-end">
//                                     <Col md={4}>
//                                         <label className="form-label">
//                                             Miqaat Group <span className="text-danger">*</span>
//                                         </label>
//                                         <Select
//                                             options={miqaatGroupOptions}
//                                             value={selectedMiqaatGroup}
//                                             onChange={val => {
//                                                 setSelectedMiqaatGroup(val);
//                                                 setTableData([]);
//                                             }}
//                                             placeholder="Select Miqaat Group"
//                                             isClearable
//                                             isLoading={loadingMiqaatGroups}
//                                             styles={selectStyles}
//                                         />
//                                     </Col>
//                                     <Col md={2}>
//                                         <Button
//                                             variant="primary"
//                                             className="w-100"
//                                             onClick={fetchReport}
//                                             disabled={loading || !selectedMiqaatGroup}
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
//                                             onClick={handleExportMainGrid}
//                                             disabled={!tableData.length}
//                                             title="Export to Excel"
//                                         >
//                                             <i className="ri-file-excel-2-line me-2"></i>
//                                             Export
//                                         </Button>
//                                     </Col>
//                                 </Row>

//                                 {/* ── Summary cards ── */}
//                                 {tableData.length > 0 && (
//                                     <>
//                                         <Row className="mb-2">
//                                             {[
//                                                 { label: 'Total Teams', value: summary.totalTeams, color: '#6c757d', bg: '#e9ecef', icon: 'ri-group-2-line' },
//                                                 { label: 'Total Members', value: summary.totalMembers, color: '#0d6efd', bg: '#cfe2ff', icon: 'ri-group-line' },
//                                                 { label: 'Duties Allotted', value: summary.totalDuties, color: '#6f42c1', bg: '#e8d5ff', icon: 'ri-list-check' },
//                                             ].map(({ label, value, color, bg, icon }) => (
//                                                 <Col md={4} key={label}>
//                                                     <Card className="border-0 shadow-sm mb-3" style={{ background: bg }}>
//                                                         <Card.Body className="p-3">
//                                                             <div className="d-flex justify-content-between align-items-center">
//                                                                 <div>
//                                                                     <h6 className="mb-1" style={{ color, fontSize: '14px' }}>{label}</h6>
//                                                                     <h3 className="mb-0" style={{ color, fontWeight: 'bold' }}>{value}</h3>
//                                                                 </div>
//                                                                 <i className={icon} style={{ fontSize: '36px', color, opacity: 0.3 }}></i>
//                                                             </div>
//                                                         </Card.Body>
//                                                     </Card>
//                                                 </Col>
//                                             ))}
//                                         </Row>
//                                         <Row className="mb-4">
//                                             {[
//                                                 { label: 'Total Assigned', value: summary.totalAssigned, color: '#fd7e14', bg: '#ffe5d0', icon: 'ri-user-add-line' },
//                                                 { label: 'Total Present', value: summary.totalPresent, color: '#28a745', bg: '#d4edda', icon: 'ri-user-check-line' },
//                                                 { label: 'Total Absent', value: summary.totalAbsent, color: '#dc3545', bg: '#f8d7da', icon: 'ri-user-unfollow-line' },
//                                             ].map(({ label, value, color, bg, icon }) => (
//                                                 <Col md={4} key={label}>
//                                                     <Card className="border-0 shadow-sm mb-3" style={{ background: bg }}>
//                                                         <Card.Body className="p-3">
//                                                             <div className="d-flex justify-content-between align-items-center">
//                                                                 <div>
//                                                                     <h6 className="mb-1" style={{ color, fontSize: '14px' }}>{label}</h6>
//                                                                     <h3 className="mb-0" style={{ color, fontWeight: 'bold' }}>{value}</h3>
//                                                                 </div>
//                                                                 <i className={icon} style={{ fontSize: '36px', color, opacity: 0.3 }}></i>
//                                                             </div>
//                                                         </Card.Body>
//                                                     </Card>
//                                                 </Col>
//                                             ))}
//                                         </Row>
//                                     </>
//                                 )}

//                                 {/* ── Grid / empty / loading ── */}
//                                 {loading ? (
//                                     <div className="text-center py-5">
//                                         <div className="spinner-border text-primary" role="status">
//                                             <span className="visually-hidden">Loading...</span>
//                                         </div>
//                                         <p className="mt-3 text-muted">Loading summary data...</p>
//                                     </div>
//                                 ) : tableData.length === 0 ? (
//                                     <div className="text-center py-5">
//                                         <div className="mb-3">
//                                             <i className="ri-inbox-line" style={{ fontSize: '64px', color: '#dee2e6' }}></i>
//                                         </div>
//                                         <p className="text-muted mb-1">No records found</p>
//                                         <small className="text-muted">Select a miqaat group and click search</small>
//                                     </div>
//                                 ) : (
//                                     <div className="table-responsive">
//                                         <table className="table table-bordered table-hover">
//                                             <thead className="table-light">
//                                                 <tr>
//                                                     <th style={{ width: '50px' }}>SR</th>
//                                                     <th>Jamiaat</th>
//                                                     <th>Team</th>
//                                                     <th style={{ width: '90px', textAlign: 'center' }}>Members</th>
//                                                     <th style={{ width: '80px', textAlign: 'center' }}>Duties</th>
//                                                     <th style={{ width: '90px', textAlign: 'center' }}>Assigned</th>
//                                                     <th style={{ width: '80px', textAlign: 'center' }}>Present</th>
//                                                     <th style={{ width: '80px', textAlign: 'center' }}>Absent</th>
//                                                     <th style={{ width: '70px', textAlign: 'center' }}>Proxy</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {tableData.map((row, index) => {
//                                                     const isTotal = row.team_id === TOTAL_SENTINEL;
//                                                     return (
//                                                         <tr
//                                                             key={row.team_id}
//                                                             className={isTotal ? 'total-row' : 'team-row'}
//                                                             onClick={() => !isTotal && fetchDrilldown(row)}
//                                                             title={isTotal ? '' : 'Click to view team members'}
//                                                         >
//                                                             <td>{isTotal ? '' : index + 1}</td>
//                                                             <td>{isTotal ? '' : (row.jamiaat_name || '-')}</td>
//                                                             <td>
//                                                                 {isTotal ? (
//                                                                     <span>
//                                                                         <i className="ri-bar-chart-grouped-line me-2" style={{ opacity: 0.7 }}></i>
//                                                                         TOTAL
//                                                                     </span>
//                                                                 ) : (row.team_name || '-')}
//                                                             </td>
//                                                             <td style={{ textAlign: 'center' }}>{row.member_count ?? 0}</td>
//                                                             <td style={{ textAlign: 'center' }}>{row.duties_count ?? 0}</td>
//                                                             <td style={{ textAlign: 'center' }}>
//                                                                 <span style={{
//                                                                     color: (row.assigned_count || 0) > 0 ? '#fd7e14' : '#6c757d',
//                                                                     fontWeight: (row.assigned_count || 0) > 0 ? '600' : 'normal'
//                                                                 }}>
//                                                                     {row.assigned_count ?? 0}
//                                                                 </span>
//                                                             </td>
//                                                             <td style={{ textAlign: 'center' }}>
//                                                                 <span style={{
//                                                                     color: (row.present_count || 0) > 0 ? '#28a745' : '#6c757d',
//                                                                     fontWeight: (row.present_count || 0) > 0 ? '600' : 'normal'
//                                                                 }}>
//                                                                     {row.present_count ?? 0}
//                                                                 </span>
//                                                             </td>
//                                                             <td style={{ textAlign: 'center' }}>
//                                                                 <span style={{
//                                                                     color: (row.absent_count || 0) > 0 ? '#dc3545' : '#6c757d',
//                                                                     fontWeight: (row.absent_count || 0) > 0 ? '600' : 'normal'
//                                                                 }}>
//                                                                     {row.absent_count ?? 0}
//                                                                 </span>
//                                                             </td>
//                                                             <td style={{ textAlign: 'center' }}>
//                                                                 <span style={{
//                                                                     color: (row.proxy_count || 0) > 0 ? '#6f42c1' : '#6c757d',
//                                                                     fontWeight: (row.proxy_count || 0) > 0 ? '600' : 'normal'
//                                                                 }}>
//                                                                     {row.proxy_count ?? 0}
//                                                                 </span>
//                                                             </td>
//                                                         </tr>
//                                                     );
//                                                 })}
//                                             </tbody>
//                                         </table>
//                                         <small className="text-muted">
//                                             <i className="ri-mouse-line me-1"></i>
//                                             Click any team row to view member details
//                                         </small>
//                                     </div>
//                                 )}
//                             </Card.Body>
//                         </Card>
//                     </Col>
//                 </Row>
//             </div>

//             {/* ════════════════════════════════════════════════════════════════
//                 Drilldown Modal — all team members with aggregated counts
//             ════════════════════════════════════════════════════════════════ */}
//             <Modal
//                 show={showModal}
//                 onHide={() => setShowModal(false)}
//                 size="xl"
//                 centered
//                 scrollable
//             >
//                 <Modal.Header closeButton style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
//                     <Modal.Title style={{ fontSize: '16px', fontWeight: '600', color: '#343a40' }}>
//                         <i className="ri-shield-user-line me-2 text-primary"></i>
//                         {modalTitle}
//                     </Modal.Title>
//                 </Modal.Header>

//                 <Modal.Body style={{ padding: '20px' }}>
//                     {loadingDrilldown ? (
//                         <div className="text-center py-4">
//                             <div className="spinner-border text-primary" role="status">
//                                 <span className="visually-hidden">Loading...</span>
//                             </div>
//                             <p className="mt-2 text-muted">Loading member details...</p>
//                         </div>
//                     ) : drilldownData.length === 0 ? (
//                         <div className="text-center py-4">
//                             <i className="ri-user-unfollow-line" style={{ fontSize: '48px', color: '#dee2e6' }}></i>
//                             <p className="mt-2 text-muted">No members found for this team</p>
//                         </div>
//                     ) : (
//                         <>
//                             <div className="d-flex gap-3 mb-3 flex-wrap">
//                                 <span className="badge" style={{
//                                     background: '#cfe2ff', color: '#0d6efd',
//                                     padding: '6px 12px', borderRadius: '4px',
//                                     fontSize: '13px', fontWeight: '500'
//                                 }}>
//                                     {drilldownData.length} member{drilldownData.length !== 1 ? 's' : ''}
//                                 </span>
//                                 <span className="badge" style={{
//                                     background: '#d4edda', color: '#28a745',
//                                     padding: '6px 12px', borderRadius: '4px',
//                                     fontSize: '13px', fontWeight: '500'
//                                 }}>
//                                     Assigned: {drilldownData.filter(r => r.assigned_count > 0).length}
//                                 </span>
//                                 <span className="badge" style={{
//                                     background: '#f8d7da', color: '#dc3545',
//                                     padding: '6px 12px', borderRadius: '4px',
//                                     fontSize: '13px', fontWeight: '500'
//                                 }}>
//                                     Unassigned: {drilldownData.filter(r => r.assigned_count === 0).length}
//                                 </span>
//                             </div>

//                             <div className="table-responsive">
//                                 <Table bordered hover size="sm" style={{ fontSize: '14px' }}>
//                                     <thead className="table-light">
//                                         <tr>
//                                             <th style={{ width: '50px' }}>SR</th>
//                                             <th style={{ width: '100px' }}>ITS ID</th>
//                                             <th>Full Name</th>
//                                             <th>Position</th>
//                                             <th>Jamiaat</th>
//                                             <th>Mobile</th>
//                                             <th style={{ width: '80px', textAlign: 'center' }}>Assigned</th>
//                                             <th style={{ width: '75px', textAlign: 'center' }}>Present</th>
//                                             <th style={{ width: '75px', textAlign: 'center' }}>Absent</th>
//                                             <th style={{ width: '65px', textAlign: 'center' }}>Proxy</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {drilldownData.map((member, index) => {
//                                             const isUnassigned = member.assigned_count === 0 && member.proxy_count === 0;
//                                             return (
//                                                 <tr
//                                                     key={member.its_id}
//                                                     className={isUnassigned ? 'unassigned-row' : ''}
//                                                 >
//                                                     <td>{index + 1}</td>
//                                                     <td>{member.its_id}</td>
//                                                     <td>{member.full_name || '-'}</td>
//                                                     <td>{member.position_name || '-'}</td>
//                                                     <td>{member.jamiaat_name || '-'}</td>
//                                                     <td>{member.mobile || '-'}</td>
//                                                     <td style={{ textAlign: 'center' }}>
//                                                         <span style={{
//                                                             color: member.assigned_count > 0 ? '#fd7e14' : '#adb5bd',
//                                                             fontWeight: member.assigned_count > 0 ? '600' : 'normal'
//                                                         }}>
//                                                             {member.assigned_count}
//                                                         </span>
//                                                     </td>
//                                                     <td style={{ textAlign: 'center' }}>
//                                                         <span style={{
//                                                             color: member.present_count > 0 ? '#28a745' : '#adb5bd',
//                                                             fontWeight: member.present_count > 0 ? '600' : 'normal'
//                                                         }}>
//                                                             {member.present_count}
//                                                         </span>
//                                                     </td>
//                                                     <td style={{ textAlign: 'center' }}>
//                                                         <span style={{
//                                                             color: member.absent_count > 0 ? '#dc3545' : '#adb5bd',
//                                                             fontWeight: member.absent_count > 0 ? '600' : 'normal'
//                                                         }}>
//                                                             {member.absent_count}
//                                                         </span>
//                                                     </td>
//                                                     <td style={{ textAlign: 'center' }}>
//                                                         <span style={{
//                                                             color: member.proxy_count > 0 ? '#6f42c1' : '#adb5bd',
//                                                             fontWeight: member.proxy_count > 0 ? '600' : 'normal'
//                                                         }}>
//                                                             {member.proxy_count}
//                                                         </span>
//                                                     </td>
//                                                 </tr>
//                                             );
//                                         })}
//                                     </tbody>
//                                 </Table>
//                             </div>
//                             <small className="text-muted">
//                                 <i className="ri-information-line me-1"></i>
//                                 Greyed italic rows indicate members not assigned to any duty in this miqaat group.
//                                 Counts are aggregated across all miqaats in the group.
//                             </small>
//                         </>
//                     )}
//                 </Modal.Body>

//                 <Modal.Footer style={{ background: '#f8f9fa', borderTop: '2px solid #dee2e6' }}>
//                     <Button
//                         variant="success"
//                         onClick={handleExportDrilldown}
//                         disabled={loadingDrilldown || !drilldownData.length}
//                         title="Export member list to Excel"
//                     >
//                         <i className="ri-file-excel-2-line me-2"></i>
//                         Export to Excel
//                     </Button>
//                     <Button variant="secondary" onClick={() => setShowModal(false)}>
//                         Close
//                     </Button>
//                 </Modal.Footer>
//             </Modal>
//         </Fragment>
//     );
// };

// export default DutiesSummaryReport;

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
const TOTAL_SENTINEL = 10000000000000;

/**
 * DutiesSummaryReport
 *
 * Props:
 *   moduleId {string} — RBAC module ID ('118')
 *   title    {string} — Page header label
 */
const DutiesSummaryReport = ({ moduleId, title }) => {
    const navigate = useNavigate();

    // ── RBAC ─────────────────────────────────────────────────────────────────
    const [checkingPermissions, setCheckingPermissions] = useState(true);
    const [permissions, setPermissions] = useState({
        canAdd: false, canEdit: false, canDelete: false, hasAccess: false
    });

    // ── Miqaat group dropdown ─────────────────────────────────────────────────
    const [miqaatGroupOptions, setMiqaatGroupOptions] = useState([]);
    const [selectedMiqaatGroup, setSelectedMiqaatGroup] = useState(null);
    const [loadingMiqaatGroups, setLoadingMiqaatGroups] = useState(false);

    // ── Main report data ──────────────────────────────────────────────────────
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    // ── Drilldown modal ───────────────────────────────────────────────────────
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [drilldownData, setDrilldownData] = useState([]);
    const [loadingDrilldown, setLoadingDrilldown] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);

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

    // ── Fetch miqaat groups ───────────────────────────────────────────────────
    useEffect(() => {
        const fetchMiqaatGroups = async () => {
            setLoadingMiqaatGroups(true);
            try {
                const accessToken = appStorage.getItem('access_token');
                if (!accessToken) return;

                const response = await fetch(`${API_BASE_URL}/Miqaat/GetMiqaatGroups`, {
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
                            value: item.miqaat_group,
                            label: item.miqaat_group
                        }));
                        setMiqaatGroupOptions(options);
                    }
                }
            } catch (error) {
                console.error('Error fetching miqaat groups:', error);
                toast.error('Error loading miqaat groups');
            } finally {
                setLoadingMiqaatGroups(false);
            }
        };

        fetchMiqaatGroups();
    }, []);

    // ── Fetch main report ─────────────────────────────────────────────────────
    const fetchReport = async () => {
        if (!selectedMiqaatGroup) { toast.warning('Please select a Miqaat Group'); return; }

        setLoading(true);
        setTableData([]);
        try {
            const token = appStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Reports/GetDutiesSummaryReport`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ miqaat_group: selectedMiqaatGroup.value })
            });

            if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

            const result = await response.json();
            if (response.ok && result.success) {
                setTableData(result.data || []);
                if ((result.data || []).length === 0) {
                    toast.info('No duty records found for the selected miqaat group');
                } else {
                    const teamCount = (result.data || []).filter(r => r.team_id !== TOTAL_SENTINEL).length;
                    toast.success(`Found ${teamCount} team(s)`);
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

    // ── Fetch drilldown ───────────────────────────────────────────────────────
    // teamId = null means "All teams" (Total row click)
    // teamId = number means single team (team row click)
    const fetchDrilldown = useCallback(async (row, allTeams = false) => {
        const isAll = allTeams || row.team_id === TOTAL_SENTINEL;

        setSelectedTeam(isAll ? null : row);
        setDrilldownData([]);
        setLoadingDrilldown(true);
        setShowModal(true);
        setModalTitle(
            isAll
                ? `All Members — ${selectedMiqaatGroup?.value || ''}`
                : `${row.team_name} — ${selectedMiqaatGroup?.value || ''}`
        );

        try {
            const token = appStorage.getItem('access_token');
            const body = { miqaat_group: selectedMiqaatGroup.value };
            if (!isAll) body.team_id = row.team_id;

            const response = await fetch(`${API_BASE_URL}/Reports/GetDutiesSummaryDrilldown`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

            const result = await response.json();
            if (response.ok && result.success) {
                setDrilldownData(result.data || []);
                if ((result.data || []).length === 0) {
                    toast.info('No members found');
                }
            } else {
                toast.error(result.message || 'Failed to load member details');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error loading member details');
        } finally {
            setLoadingDrilldown(false);
        }
    }, [selectedMiqaatGroup]);

    // ── Excel export helpers ──────────────────────────────────────────────────
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

    const handleExportMainGrid = () => {
        if (!tableData.length) { toast.warning('No data to export'); return; }

        const exportRows = tableData.map((row, i) => ({
            ...row,
            _sr: row.team_id === TOTAL_SENTINEL ? 'Total' : i + 1
        }));

        const columns = [
            { label: 'SR', key: '_sr' },
            { label: 'Team', key: 'team_name' },
            { label: 'Jamiaat', key: 'jamiaat_name' },
            { label: 'Members', key: 'member_count' },
            { label: 'Duties Allotted', key: 'duties_count' },
        ];

        const groupLabel = (selectedMiqaatGroup?.value || 'Report').replace(/[^a-zA-Z0-9 _-]/g, '_');
        exportToExcel(exportRows, columns, `Duties_Summary_${groupLabel}`);
    };

    const handleExportDrilldown = () => {
        if (!drilldownData.length) { toast.warning('No data to export'); return; }

        const columns = [
            { label: 'SR', key: '_sr' },
            { label: 'ITS ID', key: 'its_id' },
            { label: 'Full Name', key: 'full_name' },
            { label: 'Team', key: 'team_name' },
            { label: 'Position', key: 'position_name' },
            { label: 'Jamiaat', key: 'jamiaat_name' },
            { label: 'Mobile', key: 'mobile' },
            { label: 'Assigned', key: 'assigned_count' },
            { label: 'Present', key: 'present_count' },
            { label: 'Absent', key: 'absent_count' },
            { label: 'Proxy', key: 'proxy_count' },
        ];

        const rows = drilldownData.map((row, i) => ({ ...row, _sr: i + 1 }));
        const groupLabel = (selectedMiqaatGroup?.value || 'Report').replace(/[^a-zA-Z0-9 _-]/g, '_');
        const teamLabel = selectedTeam
            ? selectedTeam.team_name.replace(/[^a-zA-Z0-9 _-]/g, '_')
            : 'All_Teams';
        exportToExcel(rows, columns, `Duties_Summary_${teamLabel}_${groupLabel}`);
    };

    // ── Summary cards (exclude Total row) ────────────────────────────────────
    const summary = useMemo(() => {
        const rows = tableData.filter(r => r.team_id !== TOTAL_SENTINEL);
        return {
            totalTeams: rows.length,
            totalMembers: rows.reduce((s, r) => s + (r.member_count || 0), 0),
            totalDuties: rows.reduce((s, r) => s + (r.duties_count || 0), 0),
        };
    }, [tableData]);

    // ── Select styles ─────────────────────────────────────────────────────────
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

    // ── Permission loading ────────────────────────────────────────────────────
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
                                    .team-row { cursor: pointer; }
                                    .team-row:hover td { background-color: #f0f4ff !important; }
                                    .total-row > td { font-weight: 700; background-color: #f8f9fa; cursor: pointer; }
                                    .total-row:hover td { background-color: #e9ecef !important; }
                                    .unassigned-row td {
                                        color: #adb5bd;
                                        font-style: italic;
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
                                            Total Teams: {tableData.filter(r => r.team_id !== TOTAL_SENTINEL).length}
                                        </span>
                                    </div>
                                </div>

                                {/* ── Filters ── */}
                                <Row className="mb-4 align-items-end">
                                    <Col md={4}>
                                        <label className="form-label">
                                            Miqaat Group <span className="text-danger">*</span>
                                        </label>
                                        <Select
                                            options={miqaatGroupOptions}
                                            value={selectedMiqaatGroup}
                                            onChange={val => {
                                                setSelectedMiqaatGroup(val);
                                                setTableData([]);
                                            }}
                                            placeholder="Select Miqaat Group"
                                            isClearable
                                            isLoading={loadingMiqaatGroups}
                                            styles={selectStyles}
                                        />
                                    </Col>
                                    <Col md={2}>
                                        <Button
                                            variant="primary"
                                            className="w-100"
                                            onClick={fetchReport}
                                            disabled={loading || !selectedMiqaatGroup}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ri-search-line me-2"></i>
                                                    Search
                                                </>
                                            )}
                                        </Button>
                                    </Col>
                                    <Col md={2}>
                                        <Button
                                            variant="success"
                                            className="w-100"
                                            onClick={handleExportMainGrid}
                                            disabled={!tableData.length}
                                            title="Export to Excel"
                                        >
                                            <i className="ri-file-excel-2-line me-2"></i>
                                            Export
                                        </Button>
                                    </Col>
                                </Row>

                                {/* ── Summary cards ── */}
                                {tableData.length > 0 && (
                                    <Row className="mb-4">
                                        {[
                                            { label: 'Total Teams', value: summary.totalTeams, color: '#6c757d', bg: '#e9ecef', icon: 'ri-group-2-line' },
                                            { label: 'Total Members', value: summary.totalMembers, color: '#0d6efd', bg: '#cfe2ff', icon: 'ri-group-line' },
                                            { label: 'Duties Allotted', value: summary.totalDuties, color: '#6f42c1', bg: '#e8d5ff', icon: 'ri-list-check' },
                                        ].map(({ label, value, color, bg, icon }) => (
                                            <Col md={4} key={label}>
                                                <Card className="border-0 shadow-sm mb-3" style={{ background: bg }}>
                                                    <Card.Body className="p-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <h6 className="mb-1" style={{ color, fontSize: '14px' }}>{label}</h6>
                                                                <h3 className="mb-0" style={{ color, fontWeight: 'bold' }}>{value}</h3>
                                                            </div>
                                                            <i className={icon} style={{ fontSize: '36px', color, opacity: 0.3 }}></i>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                )}

                                {/* ── Grid / empty / loading ── */}
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3 text-muted">Loading summary data...</p>
                                    </div>
                                ) : tableData.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <i className="ri-inbox-line" style={{ fontSize: '64px', color: '#dee2e6' }}></i>
                                        </div>
                                        <p className="text-muted mb-1">No records found</p>
                                        <small className="text-muted">Select a miqaat group and click search</small>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: '50px' }}>SR</th>
                                                    <th>Team</th>
                                                    <th>Jamiaat</th>
                                                    <th style={{ width: '100px', textAlign: 'center' }}>Members</th>
                                                    <th style={{ width: '120px', textAlign: 'center' }}>Duties Allotted</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData.map((row, index) => {
                                                    const isTotal = row.team_id === TOTAL_SENTINEL;
                                                    return (
                                                        <tr
                                                            key={row.team_id}
                                                            className={isTotal ? 'total-row' : 'team-row'}
                                                            onClick={() => fetchDrilldown(row, isTotal)}
                                                            title={isTotal ? 'Click to view all members' : 'Click to view team members'}
                                                        >
                                                            <td>{isTotal ? '' : index + 1}</td>
                                                            <td>
                                                                {isTotal ? (
                                                                    <span>
                                                                        <i className="ri-bar-chart-grouped-line me-2" style={{ opacity: 0.7 }}></i>
                                                                        ALL
                                                                    </span>
                                                                ) : (row.team_name || '-')}
                                                            </td>
                                                            <td>{isTotal ? '' : (row.jamiaat_name || '-')}</td>
                                                            <td style={{ textAlign: 'center' }}>{row.member_count ?? 0}</td>
                                                            <td style={{ textAlign: 'center' }}>{row.duties_count ?? 0}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        <small className="text-muted">
                                            <i className="ri-mouse-line me-1"></i>
                                            Click any team row to view member details &nbsp;·&nbsp;
                                            Click <strong>ALL</strong> to view all members across every team
                                        </small>
                                    </div>
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
                <Modal.Header closeButton style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <Modal.Title style={{ fontSize: '16px', fontWeight: '600', color: '#343a40' }}>
                        <i className="ri-shield-user-line me-2 text-primary"></i>
                        {modalTitle}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ padding: '20px' }}>
                    {loadingDrilldown ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading member details...</p>
                        </div>
                    ) : drilldownData.length === 0 ? (
                        <div className="text-center py-4">
                            <i className="ri-user-unfollow-line" style={{ fontSize: '48px', color: '#dee2e6' }}></i>
                            <p className="mt-2 text-muted">No members found</p>
                        </div>
                    ) : (
                        <>
                            <div className="d-flex gap-3 mb-3 flex-wrap">
                                <span className="badge" style={{
                                    background: '#cfe2ff', color: '#0d6efd',
                                    padding: '6px 12px', borderRadius: '4px',
                                    fontSize: '13px', fontWeight: '500'
                                }}>
                                    {drilldownData.length} member{drilldownData.length !== 1 ? 's' : ''}
                                </span>
                                <span className="badge" style={{
                                    background: '#d4edda', color: '#28a745',
                                    padding: '6px 12px', borderRadius: '4px',
                                    fontSize: '13px', fontWeight: '500'
                                }}>
                                    Assigned: {drilldownData.filter(r => r.assigned_count > 0).length}
                                </span>
                                <span className="badge" style={{
                                    background: '#f8d7da', color: '#dc3545',
                                    padding: '6px 12px', borderRadius: '4px',
                                    fontSize: '13px', fontWeight: '500'
                                }}>
                                    Unassigned: {drilldownData.filter(r => r.assigned_count === 0).length}
                                </span>
                            </div>

                            <div className="table-responsive">
                                <Table bordered hover size="sm" style={{ fontSize: '14px' }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: '50px' }}>SR</th>
                                            <th style={{ width: '100px' }}>ITS ID</th>
                                            <th>Full Name</th>
                                            <th>Team</th>
                                            <th>Position</th>
                                            <th>Jamiaat</th>
                                            <th>Mobile</th>
                                            <th style={{ width: '80px', textAlign: 'center' }}>Assigned</th>
                                            <th style={{ width: '75px', textAlign: 'center' }}>Present</th>
                                            <th style={{ width: '75px', textAlign: 'center' }}>Absent</th>
                                            <th style={{ width: '65px', textAlign: 'center' }}>Proxy</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {drilldownData.map((member, index) => {
                                            const isUnassigned = member.assigned_count === 0 && member.proxy_count === 0;
                                            return (
                                                <tr
                                                    key={`${member.its_id}-${member.team_name}`}
                                                    className={isUnassigned ? 'unassigned-row' : ''}
                                                >
                                                    <td>{index + 1}</td>
                                                    <td>{member.its_id}</td>
                                                    <td>{member.full_name || '-'}</td>
                                                    <td>{member.team_name || '-'}</td>
                                                    <td>{member.position_name || '-'}</td>
                                                    <td>{member.jamiaat_name || '-'}</td>
                                                    <td>{member.mobile || '-'}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{
                                                            color: member.assigned_count > 0 ? '#fd7e14' : '#adb5bd',
                                                            fontWeight: member.assigned_count > 0 ? '600' : 'normal'
                                                        }}>
                                                            {member.assigned_count}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{
                                                            color: member.present_count > 0 ? '#28a745' : '#adb5bd',
                                                            fontWeight: member.present_count > 0 ? '600' : 'normal'
                                                        }}>
                                                            {member.present_count}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{
                                                            color: member.absent_count > 0 ? '#dc3545' : '#adb5bd',
                                                            fontWeight: member.absent_count > 0 ? '600' : 'normal'
                                                        }}>
                                                            {member.absent_count}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{
                                                            color: member.proxy_count > 0 ? '#6f42c1' : '#adb5bd',
                                                            fontWeight: member.proxy_count > 0 ? '600' : 'normal'
                                                        }}>
                                                            {member.proxy_count}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                            <small className="text-muted">
                                <i className="ri-information-line me-1"></i>
                                Greyed italic rows indicate members not assigned to any duty in this miqaat group.
                                Counts are aggregated across all miqaats in the group.
                            </small>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer style={{ background: '#f8f9fa', borderTop: '2px solid #dee2e6' }}>
                    <Button
                        variant="success"
                        onClick={handleExportDrilldown}
                        disabled={loadingDrilldown || !drilldownData.length}
                        title="Export member list to Excel"
                    >
                        <i className="ri-file-excel-2-line me-2"></i>
                        Export to Excel
                    </Button>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};

export default DutiesSummaryReport;