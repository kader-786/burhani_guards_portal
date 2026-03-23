import { Fragment, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { checkModuleAccess } from '../../../utils/accessControl';
import '../../../styles/shared-styles.css';
import appStorage from '../../../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MODULE_ID = '119';

// ── Excel export helper ───────────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════════
// InchargeDutiesSummaryReport
// ═══════════════════════════════════════════════════════════════════════════════
const InchargeDutiesSummaryReport = () => {
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

    // ── Main grid ─────────────────────────────────────────────────────────────
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    // ── Summary cards (derived) ───────────────────────────────────────────────
    const summary = useMemo(() => ({
        total: tableData.length,
        totalAssigned: tableData.reduce((s, r) => s + (r.assigned_count || 0), 0),
        totalPresent: tableData.reduce((s, r) => s + (r.present_count || 0), 0),
        totalAbsent: tableData.reduce((s, r) => s + (r.absent_count || 0), 0),
    }), [tableData]);

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
                        setMiqaatGroupOptions(result.data.map(item => ({
                            value: item.miqaat_group,
                            label: item.miqaat_group
                        })));
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

    // ── Fetch report ──────────────────────────────────────────────────────────
    const fetchReport = async () => {
        if (!selectedMiqaatGroup) { toast.warning('Please select a Miqaat Group'); return; }

        setLoading(true);
        setTableData([]);
        try {
            const token = appStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Reports/GetInchargeDutiesSummaryReport`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ miqaat_group: selectedMiqaatGroup.value })
            });

            if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

            const result = await response.json();
            if (response.ok && result.success) {
                setTableData(result.data || []);
                if ((result.data || []).length === 0) {
                    toast.info('No incharge records found for the selected miqaat group');
                } else {
                    toast.success(`Found ${result.data.length} incharge(s)`);
                }
            } else {
                toast.error(result.message || 'Failed to load incharge duties summary');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error loading incharge duties summary');
        } finally {
            setLoading(false);
        }
    };

    // ── Excel export ──────────────────────────────────────────────────────────
    const handleExport = () => {
        if (!tableData.length) { toast.warning('No data to export'); return; }

        const columns = [
            { label: 'SR', key: '_sr' },
            { label: 'ITS ID', key: 'its_id' },
            { label: 'Full Name', key: 'full_name' },
            { label: 'Position', key: 'position_name' },
            { label: 'Team', key: 'team_name' },
            { label: 'Mobile', key: 'mobile' },
            { label: 'Assigned', key: 'assigned_count' },
            { label: 'Present', key: 'present_count' },
            { label: 'Absent', key: 'absent_count' },
        ];

        const rows = tableData.map((r, i) => ({ ...r, _sr: i + 1 }));
        const label = (selectedMiqaatGroup?.value || 'Report').replace(/[^a-zA-Z0-9 _-]/g, '_');
        exportToExcel(rows, columns, `Incharge_Duties_Summary_${label}`);
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

    // ── Permission loading ────────────────────────────────────────────────────
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
                .inc-row { transition: background 0.1s; }
                .inc-row:hover td { background-color: #f0f4ff !important; }
            `}</style>

            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>

                                {/* ── Header ── */}
                                <div className="page-header-title">
                                    <div className="header-text">
                                        <i className="ri-shield-star-line"></i>
                                        <span>Incharge Duties Summary Report</span>
                                    </div>
                                    <div className="d-flex gap-2 align-items-center">
                                        <span className="badge badge-primary">
                                            Total: {tableData.length}
                                        </span>
                                    </div>
                                </div>

                                {/* ── Filters ── */}
                                <Row className="mb-4 align-items-end">
                                    <Col md={5}>
                                        <label className="form-label">
                                            Miqaat Group <span className="text-danger">*</span>
                                        </label>
                                        <Select
                                            options={miqaatGroupOptions}
                                            value={selectedMiqaatGroup}
                                            onChange={val => { setSelectedMiqaatGroup(val); setTableData([]); }}
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
                                            onClick={handleExport}
                                            disabled={!tableData.length}
                                            title="Export to Excel"
                                        >
                                            <i className="ri-file-excel-2-line me-2"></i>Export
                                        </Button>
                                    </Col>
                                </Row>

                                {/* ── Summary cards ── */}
                                {tableData.length > 0 && (
                                    <Row className="mb-4">
                                        {[
                                            { label: 'Total Incharges', value: summary.total, color: '#6c757d', bg: '#e9ecef', icon: 'ri-shield-star-line' },
                                            { label: 'Total Assigned', value: summary.totalAssigned, color: '#0d6efd', bg: '#cfe2ff', icon: 'ri-calendar-check-line' },
                                            { label: 'Total Present', value: summary.totalPresent, color: '#28a745', bg: '#d4edda', icon: 'ri-checkbox-circle-line' },
                                            { label: 'Total Absent', value: summary.totalAbsent, color: '#dc3545', bg: '#f8d7da', icon: 'ri-close-circle-line' },
                                        ].map(({ label, value, color, bg, icon }) => (
                                            <Col md={3} key={label}>
                                                <Card className="border-0 shadow-sm" style={{ background: bg }}>
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

                                {/* ── Grid ── */}
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3 text-muted">Loading incharge data...</p>
                                    </div>
                                ) : tableData.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="ri-inbox-line" style={{ fontSize: '64px', color: '#dee2e6' }}></i>
                                        <p className="text-muted mb-1 mt-3">No incharge records found</p>
                                        <small className="text-muted">Select a miqaat group and click Search</small>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: '50px' }}>SR</th>
                                                    <th style={{ width: '100px' }}>ITS ID</th>
                                                    <th>Full Name</th>
                                                    <th>Position</th>
                                                    <th>Team</th>
                                                    <th>Mobile</th>
                                                    <th style={{ width: '90px', textAlign: 'center' }}>Assigned</th>
                                                    <th style={{ width: '80px', textAlign: 'center' }}>Present</th>
                                                    <th style={{ width: '80px', textAlign: 'center' }}>Absent</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData.map((row, index) => (
                                                    <tr key={`${row.its_id}-${index}`} className="inc-row">
                                                        <td>{index + 1}</td>
                                                        <td>{row.its_id}</td>
                                                        <td style={{ fontWeight: '500' }}>{row.full_name || '-'}</td>
                                                        <td>{row.position_name || '-'}</td>
                                                        <td>{row.team_name || '-'}</td>
                                                        <td>{row.mobile || '-'}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <span style={{
                                                                color: row.assigned_count > 0 ? '#0d6efd' : '#6c757d',
                                                                fontWeight: row.assigned_count > 0 ? '600' : 'normal'
                                                            }}>
                                                                {row.assigned_count ?? 0}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <span style={{
                                                                color: row.present_count > 0 ? '#28a745' : '#6c757d',
                                                                fontWeight: row.present_count > 0 ? '600' : 'normal'
                                                            }}>
                                                                {row.present_count ?? 0}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <span style={{
                                                                color: row.absent_count > 0 ? '#dc3545' : '#6c757d',
                                                                fontWeight: row.absent_count > 0 ? '600' : 'normal'
                                                            }}>
                                                                {row.absent_count ?? 0}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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

export default InchargeDutiesSummaryReport;