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
const MODULE_ID = '124';

// ── Sentinel team_id used for the Total row returned by the SP ────────────────
const TOTAL_ROW_ID = 10000000000000;

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

// ── Drilldown table columns (all 22 fields) ───────────────────────────────────
const MODAL_COLUMNS = [
    { label: 'SR', key: '_sr' },
    { label: 'ITS ID', key: 'its_id' },
    { label: 'Full Name', key: 'full_name' },
    { label: 'Prefix', key: 'prefix' },
    { label: 'Age', key: 'age' },
    { label: 'Gender', key: 'gender' },
    { label: 'Marital Status', key: 'marital_status' },
    { label: 'Misaq', key: 'misaq' },
    // { label: 'Category',       key: 'category' },
    { label: 'Organization', key: 'organization' },
    { label: 'Email', key: 'email' },
    { label: 'Mobile', key: 'mobile' },
    { label: 'WhatsApp', key: 'whatsapp_mobile' },
    { label: 'Address', key: 'address' },
    { label: 'Jamaat', key: 'jamaat' },
    { label: 'Jamiaat', key: 'jamiaat' },
    { label: 'Nationality', key: 'nationality' },
    { label: 'Vatan', key: 'vatan' },
    { label: 'City', key: 'city' },
    { label: 'Country', key: 'country' },
    { label: 'Team', key: 'team_name' },
    { label: 'Position', key: 'position_name' },
];


// ═══════════════════════════════════════════════════════════════════════════════
// MembersReport component
// ═══════════════════════════════════════════════════════════════════════════════
const MembersReport = () => {
    const navigate = useNavigate();

    // ── RBAC ─────────────────────────────────────────────────────────────────
    const [checkingPermissions, setCheckingPermissions] = useState(true);
    const [permissions, setPermissions] = useState({
        canAdd: false, canEdit: false, canDelete: false, hasAccess: false
    });

    // ── Jamiaat dropdown ──────────────────────────────────────────────────────
    const [jamiaatOptions, setJamiaatOptions] = useState([{ value: null, label: 'All' }]);
    const [selectedJamiaat, setSelectedJamiaat] = useState({ value: null, label: 'All' });

    // ── Main grid ─────────────────────────────────────────────────────────────
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    // ── Drilldown modal ───────────────────────────────────────────────────────
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalSearch, setModalSearch] = useState('');
    const [modalTitle, setModalTitle] = useState('');

    // ── Derived main-grid rows ────────────────────────────────────────────────
    const totalRow = useMemo(() => tableData.find(r => r.team_id === TOTAL_ROW_ID), [tableData]);
    const dataRows = useMemo(() => tableData.filter(r => r.team_id !== TOTAL_ROW_ID), [tableData]);

    // ── Filtered modal data (search only) ────────────────────────────────────
    const filteredModalData = useMemo(() => {
        const q = modalSearch.trim().toLowerCase();
        if (!q) return modalData;
        return modalData.filter(r =>
            (r.full_name || '').toLowerCase().includes(q) ||
            String(r.its_id || '').includes(q)
        );
    }, [modalData, modalSearch]);

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

    // ── Fetch jamiaat options on mount ────────────────────────────────────────
    useEffect(() => {
        const fetchJamiaats = async () => {
            try {
                const token = appStorage.getItem('access_token');
                if (!token) return;

                const response = await fetch(`${API_BASE_URL}/Team/GetAllJamiaats`, {
                    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
                });

                if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

                const result = await response.json();
                if (response.ok && result.success && result.data) {
                    const opts = [
                        { value: null, label: 'All' },
                        ...result.data.map(j => ({ value: j.jamiaat_id, label: j.jamiaat_name }))
                    ];
                    setJamiaatOptions(opts);
                }
            } catch (err) {
                console.error('Error loading jamiaats', err);
            }
        };
        fetchJamiaats();
    }, []);

    // ── Fetch summary — triggered on mount and on jamiaat change ─────────────
    const fetchSummary = useCallback(async (jamiaatId) => {
        setLoading(true);
        setTableData([]);
        try {
            const token = appStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Reports/GetMembersReport`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ jamiaat_id: jamiaatId ?? null })
            });

            if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

            const result = await response.json();
            if (response.ok && result.success) {
                setTableData(result.data || []);
                const rows = (result.data || []).filter(r => r.team_id !== TOTAL_ROW_ID);
                if (rows.length === 0) toast.info('No member records found');
            } else {
                toast.error(result.message || 'Failed to load members summary');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error loading members summary');
        } finally {
            setLoading(false);
        }
    }, []);

    // On mount — fetch with no jamiaat filter
    useEffect(() => {
        fetchSummary(null);
    }, [fetchSummary]);

    // On jamiaat change — refetch
    const handleJamiaatChange = (option) => {
        setSelectedJamiaat(option);
        fetchSummary(option?.value ?? null);
    };

    // ── Open drilldown modal ──────────────────────────────────────────────────
    const openModal = useCallback(async (teamId, teamName) => {
        setModalData([]);
        setModalLoading(true);
        setModalSearch('');
        setShowModal(true);
        setModalTitle(teamId !== null ? `${teamName} — Members` : 'All Members');

        try {
            const token = appStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Reports/GetMembersReportDrilldown`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    team_id: teamId ?? null,
                    jamiaat_id: selectedJamiaat?.value ?? null,
                })
            });

            if (response.status === 401) { toast.error('Session expired. Please login again.'); return; }

            const result = await response.json();
            if (response.ok && result.success) {
                setModalData(result.data || []);
                if ((result.data || []).length === 0) toast.info('No member records found for this team');
            } else {
                toast.error(result.message || 'Failed to load member details');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error loading member details');
        } finally {
            setModalLoading(false);
        }
    }, [selectedJamiaat]);

    // ── Export main grid ──────────────────────────────────────────────────────
    const handleExportMainGrid = () => {
        if (!dataRows.length) { toast.warning('No data to export'); return; }

        const columns = [
            { label: 'SR', key: '_sr' },
            { label: 'Jamiaat', key: 'jamiaat_name' },
            { label: 'Team', key: 'team_name' },
            { label: 'Members', key: 'member_count' },
        ];
        const rows = dataRows.map((r, i) => ({ ...r, _sr: i + 1 }));
        if (totalRow) rows.push({ ...totalRow, _sr: '', team_name: 'TOTAL', jamiaat_name: '' });

        const jamiaatLabel = selectedJamiaat?.label
            ? selectedJamiaat.label.replace(/[^a-zA-Z0-9 _-]/g, '_')
            : 'All';
        exportToExcel(rows, columns, `Members_Report_${jamiaatLabel}`);
    };

    // ── Export modal ──────────────────────────────────────────────────────────
    const handleExportModal = () => {
        if (!filteredModalData.length) { toast.warning('No data to export'); return; }

        const rows = filteredModalData.map((r, i) => ({ ...r, _sr: i + 1 }));
        const safeTeam = modalTitle.replace(/[^a-zA-Z0-9 _-]/g, '_');
        exportToExcel(rows, MODAL_COLUMNS, `Members_${safeTeam}`);
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
                .badge-primary {
                    background: #0d6efd; color: #fff; padding: 6px 12px;
                    border-radius: 4px; font-size: 14px; font-weight: 500;
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
                .mem-data-row { cursor: pointer; transition: background 0.1s; }
                .mem-data-row:hover td { background-color: #f0f4ff !important; }
                .mem-total-row > td { font-weight: 700; cursor: pointer; background: #f8f9fa; }
                .mem-total-row:hover td { background-color: #e9ecef !important; }
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
                                        <span>Members Report</span>
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
                                        <label className="form-label">Jamiaat</label>
                                        <Select
                                            options={jamiaatOptions}
                                            value={selectedJamiaat}
                                            onChange={handleJamiaatChange}
                                            placeholder="Select Jamiaat"
                                            styles={selectStyles}
                                            isDisabled={loading}
                                        />
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
                                            { label: 'Total Teams', value: dataRows.length, color: '#6c757d', bg: '#e9ecef', icon: 'ri-team-line' },
                                            { label: 'Total Members', value: totalRow.member_count, color: '#0d6efd', bg: '#cfe2ff', icon: 'ri-group-line' },
                                        ].map(({ label, value, color, bg, icon }) => (
                                            <Col md={3} key={label}>
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
                                        <p className="mt-3 text-muted">Loading members data...</p>
                                    </div>
                                ) : dataRows.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="ri-inbox-line" style={{ fontSize: '64px', color: '#dee2e6' }}></i>
                                        <p className="text-muted mb-1 mt-3">No team records found</p>
                                        <small className="text-muted">Change the jamiaat filter to load data</small>
                                    </div>
                                ) : (
                                    <>
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th style={{ width: '50px' }}>SR</th>
                                                        <th>Jamiaat</th>
                                                        <th>Team</th>
                                                        <th style={{ width: '100px', textAlign: 'right' }}>Members</th>
                                                    </tr>
                                                </thead>
                                                <tbody>

                                                    {/* ── Data rows ── */}
                                                    {dataRows.map((row, index) => (
                                                        <tr
                                                            key={row.team_id}
                                                            className="mem-data-row"
                                                            onClick={() => openModal(row.team_id, row.team_name)}
                                                            title="Click to view members of this team"
                                                        >
                                                            <td>{index + 1}</td>
                                                            <td>{row.jamiaat_name || '-'}</td>
                                                            <td style={{ fontWeight: '500' }}>{row.team_name}</td>
                                                            <td style={{ textAlign: 'right', color: '#0d6efd', fontWeight: '600' }}>
                                                                {row.member_count ?? 0}
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {/* ── Total row ── */}
                                                    {totalRow && (
                                                        <tr
                                                            className="mem-total-row"
                                                            onClick={() => openModal(null, null)}
                                                            title="Click to view all members across all teams"
                                                        >
                                                            <td colSpan={3} style={{ textAlign: 'right', paddingRight: '16px' }}>
                                                                <i className="ri-bar-chart-grouped-line me-2" style={{ opacity: 0.6 }}></i>
                                                                TOTAL
                                                            </td>
                                                            <td style={{ textAlign: 'right', color: '#0d6efd' }}>
                                                                {totalRow.member_count ?? 0}
                                                            </td>
                                                        </tr>
                                                    )}

                                                </tbody>
                                            </table>
                                        </div>
                                        <small className="text-muted">
                                            <i className="ri-mouse-line me-1"></i>
                                            Click any row to view all members of that team
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
                            <p className="mt-2 text-muted">Loading member details...</p>
                        </div>
                    ) : (
                        <>
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
                                    {filteredModalData.length} member{filteredModalData.length !== 1 ? 's' : ''}
                                    {modalSearch ? ' (filtered)' : ''}
                                </span>
                            </div>

                            {/* ── Table ── */}
                            {filteredModalData.length === 0 ? (
                                <div className="text-center py-4">
                                    <i className="ri-user-unfollow-line" style={{ fontSize: '48px', color: '#dee2e6' }}></i>
                                    <p className="mt-2 text-muted">
                                        {modalSearch ? 'No members match your search' : 'No member records found'}
                                    </p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table bordered hover size="sm" style={{ fontSize: '13px', minWidth: '2000px' }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: '45px' }}>SR</th>
                                                <th style={{ width: '95px' }}>ITS ID</th>
                                                <th style={{ width: '180px' }}>Full Name</th>
                                                <th style={{ width: '70px' }}>Prefix</th>
                                                <th style={{ width: '55px' }}>Age</th>
                                                <th style={{ width: '70px' }}>Gender</th>
                                                <th style={{ width: '110px' }}>Marital Status</th>
                                                <th style={{ width: '70px' }}>Misaq</th>
                                                {/* <th style={{ width: '100px' }}>Category</th> */}
                                                <th style={{ width: '140px' }}>Organization</th>
                                                <th style={{ width: '180px' }}>Email</th>
                                                <th style={{ width: '110px' }}>Mobile</th>
                                                <th style={{ width: '110px' }}>WhatsApp</th>
                                                <th style={{ width: '200px' }}>Address</th>
                                                <th style={{ width: '120px' }}>Jamaat</th>
                                                <th style={{ width: '120px' }}>Jamiaat</th>
                                                <th style={{ width: '100px' }}>Nationality</th>
                                                <th style={{ width: '100px' }}>Vatan</th>
                                                <th style={{ width: '100px' }}>City</th>
                                                <th style={{ width: '100px' }}>Country</th>
                                                <th style={{ width: '130px' }}>Team</th>
                                                <th style={{ width: '120px' }}>Position</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredModalData.map((member, index) => (
                                                <tr key={`${member.its_id}-${index}`}>
                                                    <td>{index + 1}</td>
                                                    <td>{member.its_id || '-'}</td>
                                                    <td style={{ fontWeight: '500' }}>{member.full_name || '-'}</td>
                                                    <td>{member.prefix || '-'}</td>
                                                    <td style={{ textAlign: 'center' }}>{member.age ?? '-'}</td>
                                                    <td>{member.gender || '-'}</td>
                                                    <td>{member.marital_status || '-'}</td>
                                                    <td>{member.misaq || '-'}</td>
                                                    {/* <td>{member.category || '-'}</td> */}
                                                    <td>{member.organization || '-'}</td>
                                                    <td>{member.email || '-'}</td>
                                                    <td>{member.mobile || '-'}</td>
                                                    <td>{member.whatsapp_mobile || '-'}</td>
                                                    <td>{member.address || '-'}</td>
                                                    <td>{member.jamaat || '-'}</td>
                                                    <td>{member.jamiaat || '-'}</td>
                                                    <td>{member.nationality || '-'}</td>
                                                    <td>{member.vatan || '-'}</td>
                                                    <td>{member.city || '-'}</td>
                                                    <td>{member.country || '-'}</td>
                                                    <td>{member.team_name || '-'}</td>
                                                    <td>{member.position_name || '-'}</td>
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
                        title="Export all columns to Excel"
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

export default MembersReport;
