import { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
import { Card, Col, Row, Button, Modal, Table } from 'react-bootstrap';
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
    const [loading, setLoading] = useState(false);

    // ── Drilldown modal ───────────────────────────────────────────────────────
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [drilldownData, setDrilldownData] = useState([]);
    const [loadingDrilldown, setLoadingDrilldown] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null); // { duty_id, team_id }

    // ── RBAC check ────────────────────────────────────────────────────────────
    useEffect(() => {
        const isAdminValue = sessionStorage.getItem('is_admin');
        if (isAdminValue === 'true' || isAdminValue === true || isAdminValue === '1') {
            setPermissions({ canAdd: true, canEdit: true, canDelete: true, hasAccess: true });
            setCheckingPermissions(false);
            return;
        }

        const accessRights = sessionStorage.getItem('access_rights');
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
                const token = sessionStorage.getItem('access_token');
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
        try {
            const token = sessionStorage.getItem('access_token');
            const body = { miqaat_id: selectedMiqaat.value };
            if (jamiaatId !== null && jamiaatId !== undefined) {
                body.jamiaat_id = jamiaatId;
            }

            const response = await fetch(`${API_BASE_URL}/Reports/GetDutiesAllottedReport`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });

            if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

            const result = await response.json();
            if (response.ok && result.success) {
                setTableData(result.data || []);
                if ((result.data || []).length === 0) {
                    toast.info('No duty records found for the selected criteria');
                } else {
                    toast.success(`Found ${result.data.length} duty record(s)`);
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

    // ── Fetch drilldown (lazy) ────────────────────────────────────────────────
    const fetchDrilldown = useCallback(async (row) => {
        setDrilldownData([]);
        setLoadingDrilldown(true);
        setShowModal(true);
        setModalTitle(`Guards — ${row.team_name} @ ${row.location_name || 'N/A'}`);
        setSelectedRow({ duty_id: row.duty_id, team_id: row.team_id });

        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Reports/GetDutiesAllottedDrilldown`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    miqaat_id: selectedMiqaat.value,
                    duty_id: row.duty_id,
                    team_id: row.team_id
                })
            });

            if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

            const result = await response.json();
            if (response.ok && result.success) {
                setDrilldownData(result.data || []);
                if ((result.data || []).length === 0) {
                    toast.info('No guards assigned to this duty yet');
                }
            } else {
                toast.error(result.message || 'Failed to load guard details');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error loading guard details');
        } finally {
            setLoadingDrilldown(false);
        }
    }, [selectedMiqaat]);

    // ── Summary card values ───────────────────────────────────────────────────
    const summary = useMemo(() => ({
        totalDuties: tableData.length,
        totalQuota: tableData.reduce((s, r) => s + (r.quota || 0), 0),
        totalAssigned: tableData.reduce((s, r) => s + (r.assigned_count || 0), 0),
        totalBalance: tableData.reduce((s, r) => s + (r.balance || 0), 0),
    }), [tableData]);

    // ── GridJS data ───────────────────────────────────────────────────────────
    const gridData = useMemo(() => {
        return tableData.map((row, index) => [
            index + 1,
            row.location_name || '-',
            row.team_name || '-',
            row.jamiaat_name || '-',
            row.team_captain_name || '-',
            row.team_captain_mobile || '-',
            row.quota ?? '-',
            row.assigned_count ?? 0,
            row.balance ?? '-',
            // hidden data payload used for click handling
            JSON.stringify({
                duty_id: row.duty_id, team_id: row.team_id,
                team_name: row.team_name, location_name: row.location_name
            })
        ]);
    }, [tableData]);

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
                                    .duty-row { cursor: pointer; }
                                    .duty-row:hover td { background-color: #f0f4ff !important; }
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
                                    <Col md={3}>
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
                                                <>
                                                    <i className="ri-search-line me-2"></i>
                                                    Search
                                                </>
                                            )}
                                        </Button>
                                    </Col>
                                </Row>

                                {/* ── Summary cards ── */}
                                {tableData.length > 0 && (
                                    <Row className="mb-4">
                                        {[
                                            { label: 'Total Duties', value: summary.totalDuties, color: '#6c757d', bg: '#e9ecef', icon: 'ri-list-check' },
                                            { label: 'Total Quota', value: summary.totalQuota, color: '#0d6efd', bg: '#cfe2ff', icon: 'ri-group-line' },
                                            { label: 'Total Assigned', value: summary.totalAssigned, color: '#28a745', bg: '#d4edda', icon: 'ri-user-check-line' },
                                            { label: 'Balance', value: summary.totalBalance, color: '#dc3545', bg: '#f8d7da', icon: 'ri-user-unfollow-line' },
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

                                {/* ── Grid / empty / loading ── */}
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3 text-muted">Loading duty data...</p>
                                    </div>
                                ) : tableData.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <i className="ri-inbox-line" style={{ fontSize: '64px', color: '#dee2e6' }}></i>
                                        </div>
                                        <p className="text-muted mb-1">No duty records found</p>
                                        <small className="text-muted">Select a miqaat and click search to view records</small>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: '60px' }}>SR</th>
                                                    <th>Location</th>
                                                    <th>Team</th>
                                                    <th>Jamiaat</th>
                                                    <th>Captain</th>
                                                    <th>Captain Mobile</th>
                                                    <th style={{ width: '80px', textAlign: 'center' }}>Quota</th>
                                                    <th style={{ width: '100px', textAlign: 'center' }}>Assigned</th>
                                                    <th style={{ width: '90px', textAlign: 'center' }}>Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData.map((row, index) => (
                                                    <tr
                                                        key={row.duty_id}
                                                        className="duty-row"
                                                        onClick={() => fetchDrilldown(row)}
                                                        title="Click to view assigned guards"
                                                    >
                                                        <td>{index + 1}</td>
                                                        <td>{row.location_name || '-'}</td>
                                                        <td>{row.team_name || '-'}</td>
                                                        <td>{row.jamiaat_name || '-'}</td>
                                                        <td>{row.team_captain_name || '-'}</td>
                                                        <td>{row.team_captain_mobile || '-'}</td>
                                                        <td style={{ textAlign: 'center' }}>{row.quota ?? '-'}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <span style={{
                                                                color: row.assigned_count > 0 ? '#28a745' : '#6c757d',
                                                                fontWeight: row.assigned_count > 0 ? '600' : 'normal'
                                                            }}>
                                                                {row.assigned_count ?? 0}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <span style={{
                                                                color: (row.balance ?? 0) > 0 ? '#dc3545' : '#28a745',
                                                                fontWeight: '600'
                                                            }}>
                                                                {row.balance ?? '-'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <small className="text-muted">
                                            <i className="ri-mouse-line me-1"></i>
                                            Click any row to view the assigned guards for that duty
                                        </small>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* ── Drilldown Modal ── */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="lg"
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
                            <p className="mt-2 text-muted">Loading guard details...</p>
                        </div>
                    ) : drilldownData.length === 0 ? (
                        <div className="text-center py-4">
                            <i className="ri-user-unfollow-line" style={{ fontSize: '48px', color: '#dee2e6' }}></i>
                            <p className="mt-2 text-muted">No guards assigned to this duty yet</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-3">
                                <span className="badge" style={{
                                    background: '#cfe2ff', color: '#0d6efd',
                                    padding: '6px 12px', borderRadius: '4px',
                                    fontSize: '13px', fontWeight: '500'
                                }}>
                                    {drilldownData.length} guard{drilldownData.length !== 1 ? 's' : ''} assigned
                                </span>
                            </div>
                            <div className="table-responsive">
                                <Table bordered hover size="sm" style={{ fontSize: '14px' }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: '50px' }}>SR</th>
                                            <th style={{ width: '100px' }}>ITS ID</th>
                                            <th>Full Name</th>
                                            <th>Position</th>
                                            <th>Mobile</th>
                                            <th>WhatsApp</th>
                                            <th style={{ width: '70px', textAlign: 'center' }}>Age</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {drilldownData.map((guard, index) => (
                                            <tr key={guard.guard_duty_id || guard.its_id}>
                                                <td>{index + 1}</td>
                                                <td>{guard.its_id}</td>
                                                <td>{guard.full_name || '-'}</td>
                                                <td>{guard.position_name || '-'}</td>
                                                <td>{guard.mobile || '-'}</td>
                                                <td>{guard.whatsapp_mobile || '-'}</td>
                                                <td style={{ textAlign: 'center' }}>{guard.age || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer style={{ background: '#f8f9fa', borderTop: '2px solid #dee2e6' }}>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};

export default DutiesAllottedReport;