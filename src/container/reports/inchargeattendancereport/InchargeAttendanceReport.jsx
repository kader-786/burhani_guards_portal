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
const MODULE_ID = '117';

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = {
        P: { label: 'Present', color: '#28a745', bg: '#d4edda' },
        A: { label: 'Absent', color: '#dc3545', bg: '#f8d7da' },
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

const STATUS_LABEL = { P: 'Present', A: 'Absent' };

// ═══════════════════════════════════════════════════════════════════════════════
// InchargeAttendanceReport component
// ═══════════════════════════════════════════════════════════════════════════════
const InchargeAttendanceReport = () => {
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
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    // ── Summary cards (derived) ───────────────────────────────────────────────
    const summary = useMemo(() => ({
        total: tableData.length,
        present: tableData.filter(r => r.attendance_status === 'P').length,
        absent: tableData.filter(r => r.attendance_status === 'A').length,
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

    // ── Fetch report ──────────────────────────────────────────────────────────
    const fetchReport = async () => {
        if (!selectedMiqaat) { toast.warning('Please select a Miqaat'); return; }

        setLoading(true);
        setTableData([]);
        try {
            const token = appStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Reports/GetInchargeAttendanceReport`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ miqaat_id: selectedMiqaat.value })
            });

            if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

            const result = await response.json();
            if (response.ok && result.success) {
                setTableData(result.data || []);
                if ((result.data || []).length === 0) {
                    toast.info('No incharge records found for the selected miqaat');
                } else {
                    toast.success(`Found ${result.data.length} incharge(s)`);
                }
            } else {
                toast.error(result.message || 'Failed to load incharge report');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error loading incharge report');
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
            { label: 'Jamiaat', key: 'jamiaat' },
            { label: 'Team', key: 'team_name' },
            { label: 'Mobile', key: 'mobile' },
            { label: 'Venue', key: 'venue_name' },
            { label: 'Location(s)', key: 'location_names' },
            { label: 'Status', key: '_status_label' },
            { label: 'Scanned By', key: 'scanned_by' },
            { label: 'Scanned Date', key: 'scanned_date' },
        ];

        const rows = tableData.map((r, i) => ({
            ...r,
            _sr: i + 1,
            _status_label: STATUS_LABEL[r.attendance_status] || r.attendance_status,
        }));

        const label = (selectedMiqaat?.label || 'Report').replace(/[^a-zA-Z0-9 _-]/g, '');
        exportToExcel(rows, columns, `Incharge_Attendance_${label}`);
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
                .location-cell {
                    font-size: 13px;
                    color: #495057;
                    max-width: 200px;
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
                                        <i className="ri-shield-star-line"></i>
                                        <span>Incharge Attendance Report</span>
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
                                            onClick={fetchReport}
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
                                            { label: 'Present', value: summary.present, color: '#28a745', bg: '#d4edda', icon: 'ri-checkbox-circle-line' },
                                            { label: 'Absent', value: summary.absent, color: '#dc3545', bg: '#f8d7da', icon: 'ri-close-circle-line' },
                                        ].map(({ label, value, color, bg, icon }) => (
                                            <Col md={4} key={label}>
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
                                        <small className="text-muted">Select a miqaat and click Search</small>
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
                                                    <th>Jamiaat</th>
                                                    <th>Team</th>
                                                    <th>Mobile</th>
                                                    <th>Venue</th>
                                                    <th>Location(s)</th>
                                                    <th style={{ width: '105px', textAlign: 'center' }}>Status</th>
                                                    <th>Scanned By</th>
                                                    <th>Scanned Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData.map((row, index) => (
                                                    <tr key={`${row.its_id}-${index}`} className="inc-row">
                                                        <td>{index + 1}</td>
                                                        <td>{row.its_id}</td>
                                                        <td style={{ fontWeight: '500' }}>{row.full_name || '-'}</td>
                                                        <td>{row.position_name || '-'}</td>
                                                        <td>{row.jamiaat || '-'}</td>
                                                        <td>{row.team_name || '-'}</td>
                                                        <td>{row.mobile || '-'}</td>
                                                        <td>{row.venue_name || '-'}</td>
                                                        <td className="location-cell" title={row.location_names || ''}>
                                                            {row.location_names || '-'}
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <StatusBadge status={row.attendance_status} />
                                                        </td>
                                                        <td style={{ fontSize: '13px', color: '#6c757d' }}>
                                                            {row.attendance_status === 'P' ? (row.scanned_by || '-') : '-'}
                                                        </td>
                                                        <td style={{ fontSize: '13px', color: '#6c757d' }}>
                                                            {row.attendance_status === 'P' ? (row.scanned_date || '-') : '-'}
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

export default InchargeAttendanceReport;