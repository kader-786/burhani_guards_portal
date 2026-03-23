import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { checkModuleAccess } from '../../../utils/accessControl';
import '../../../styles/shared-styles.css';
import appStorage from '../../../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MODULE_ID = '116';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the ordinal suffix for a day number (1 → "ST", 2 → "ND", etc.)
 */
const ordinalSuffix = (n) => {
    const s = ['TH', 'ST', 'ND', 'RD'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
};

const MONTHS = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

/**
 * Formats the date portion of start_date as "4TH JANUARY 2026"
 */
const formatChartDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = d.getDate();
    return `${day}${ordinalSuffix(day)} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * Formats the time portion of start_date as "REPORTING : 3.30 PM"
 */
const formatReportingTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minStr = minutes === 0 ? '00' : String(minutes).padStart(2, '0');
    return `${hours}.${minStr} ${ampm}`;
};

/**
 * Returns '#000000' or '#ffffff' depending on the luminance of the hex background.
 */
const getTextColor = (hexColor) => {
    if (!hexColor || hexColor === '#ffffff' || hexColor === '#FFFFFF') return '#000000';
    const hex = hexColor.replace('#', '');
    if (hex.length !== 6) return '#000000';
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? '#000000' : '#ffffff';
};

/**
 * Sanitises a string for use in a filename (removes characters not safe for
 * file systems).
 */
const safeFilename = (str) => (str || 'Chart').replace(/[^a-zA-Z0-9 _-]/g, '').trim();

// ─── Component ───────────────────────────────────────────────────────────────

const DutyChart = () => {
    const navigate = useNavigate();
    const chartRef = useRef(null);

    // ── Auth / RBAC ──────────────────────────────────────────────────────────
    const [checkingPermissions, setCheckingPermissions] = useState(true);
    const [permissions, setPermissions] = useState({
        canAdd: false, canEdit: false, canDelete: false, hasAccess: false
    });

    // ── UI state ─────────────────────────────────────────────────────────────
    const [miqaatOptions, setMiqaatOptions] = useState([]);
    const [selectedMiqaat, setSelectedMiqaat] = useState(null);
    const [chartData, setChartData] = useState(null);   // { summary, data }
    const [loading, setLoading] = useState(false);
    const [loadingMiqaat, setLoadingMiqaat] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // ── Data fetching ────────────────────────────────────────────────────────

    const fetchAllMiqaats = async () => {
        setLoadingMiqaat(true);
        try {
            const token = appStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }
            const response = await fetch(`${API_BASE_URL}/Miqaat/GetAllMiqaat`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (response.status === 401) {
                toast.error('Session expired. Please login again.');
                return;
            }
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

    const fetchDutyChart = async () => {
        if (!selectedMiqaat) {
            toast.warning('Please select a Miqaat');
            return;
        }
        setLoading(true);
        setChartData(null);
        try {
            const token = appStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Reports/GetDutyChart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ miqaat_id: selectedMiqaat.value })
            });
            const result = await response.json();
            if (response.status === 401) {
                toast.error('Session expired. Please login again.');
                return;
            }
            if (response.ok && result.success) {
                setChartData({ summary: result.summary, data: result.data || [] });
                if (!result.data || result.data.length === 0) {
                    toast.info('No duty assignments found for the selected miqaat');
                }
            } else {
                toast.error(result.message || 'Failed to load duty chart');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error loading duty chart');
        } finally {
            setLoading(false);
        }
    };

    // ── Derived data ─────────────────────────────────────────────────────────

    /**
     * Groups the flat data array by location_id preserving the backend sort
     * (location_name ASC → team_name ASC).  Each group entry is:
     *   { location_id, location_name, location_color, incharge_names, teams[] }
     */
    const groupedData = useMemo(() => {
        if (!chartData?.data?.length) return [];
        const map = new Map();
        const order = [];
        chartData.data.forEach(row => {
            if (!map.has(row.location_id)) {
                const group = {
                    location_id: row.location_id,
                    location_name: row.location_name,
                    location_color: row.location_color || '#ffffff',
                    incharge_names: row.incharge_names || '',
                    teams: []
                };
                map.set(row.location_id, group);
                order.push(group);
            }
            map.get(row.location_id).teams.push({
                team_id: row.team_id,
                team_name: row.team_name,
                quota: row.quota
            });
        });
        return order;
    }, [chartData]);

    const totalQuota = useMemo(
        () => groupedData.reduce((sum, g) => sum + g.teams.reduce((s, t) => s + (t.quota || 0), 0), 0),
        [groupedData]
    );

    // ── Export / download handlers ───────────────────────────────────────────

    const handleDownloadImage = async () => {
        if (!chartRef.current) return;
        setDownloading(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(chartRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });
            const link = document.createElement('a');
            link.download = `DutyChart_${safeFilename(chartData?.summary?.miqaat_name)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('Image downloaded successfully');
        } catch (error) {
            console.error(error);
            toast.error('Error downloading image');
        } finally {
            setDownloading(false);
        }
    };

    const handleExportExcel = async () => {
        if (!chartData?.data?.length) {
            toast.warning('No data to export');
            return;
        }
        try {
            const XLSX = await import('xlsx');
            const header = ['LOCATION', 'INCHARGES', 'TEAM', 'COUNT'];
            const rows = chartData.data.map(row => [
                row.location_name || '',
                row.incharge_names || '',
                row.team_name || '',
                row.quota ?? ''
            ]);
            const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
            ws['!cols'] = [{ wch: 28 }, { wch: 45 }, { wch: 28 }, { wch: 10 }];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Duty Chart');
            XLSX.writeFile(wb, `DutyChart_${safeFilename(chartData?.summary?.miqaat_name)}.xlsx`);
            toast.success('Excel exported successfully');
        } catch (error) {
            console.error(error);
            toast.error('Error exporting Excel');
        }
    };

    const handleDownloadPDF = async () => {
        if (!chartRef.current) return;
        setDownloading(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const canvas = await html2canvas(chartRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const printW = pageW - margin * 2;
            const printH = (canvas.height * printW) / canvas.width;

            if (printH <= pageH - margin * 2) {
                // Single page — vertically centred
                pdf.addImage(imgData, 'PNG', margin, margin, printW, printH);
            } else {
                // Multi-page — slice the canvas per page
                const pageCanvas = document.createElement('canvas');
                const sliceH = Math.floor((canvas.width * (pageH - margin * 2)) / printW);
                pageCanvas.width = canvas.width;
                pageCanvas.height = sliceH;
                const ctx = pageCanvas.getContext('2d');
                let srcY = 0;

                while (srcY < canvas.height) {
                    ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
                    ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
                    const sliceData = pageCanvas.toDataURL('image/png');
                    const slicePrintH = Math.min(
                        printH - (srcY * printW / canvas.width),
                        pageH - margin * 2
                    );
                    if (srcY > 0) pdf.addPage();
                    pdf.addImage(sliceData, 'PNG', margin, margin, printW, slicePrintH);
                    srcY += sliceH;
                }
            }

            pdf.save(`DutyChart_${safeFilename(chartData?.summary?.miqaat_name)}.pdf`);
            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error(error);
            toast.error('Error downloading PDF');
        } finally {
            setDownloading(false);
        }
    };

    // ── Effects ──────────────────────────────────────────────────────────────

    // RBAC check
    useEffect(() => {
        const checkAccess = () => {
            setCheckingPermissions(true);

            const isAdminValue = appStorage.getItem('is_admin');
            if (
                isAdminValue === 'true' ||
                isAdminValue === true ||
                isAdminValue === '1'
            ) {
                setPermissions({ canAdd: true, canEdit: true, canDelete: true, hasAccess: true });
                setCheckingPermissions(false);
                return;
            }

            const accessRights = appStorage.getItem('access_rights');
            if (!accessRights) {
                Swal.fire({
                    icon: 'error',
                    title: 'Session Expired',
                    text: 'Please login again',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false
                }).then(() => navigate(`${import.meta.env.BASE_URL}login/`));
                return;
            }

            const access = checkModuleAccess(accessRights, MODULE_ID);
            if (!access.hasAccess) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Access Denied',
                    text: 'You do not have permission to access this module.',
                    confirmButtonText: 'OK'
                }).then(() => navigate(`${import.meta.env.BASE_URL}dashboard/`));
                return;
            }

            setPermissions(access);
            setCheckingPermissions(false);
        };

        checkAccess();
    }, [navigate]);

    useEffect(() => {
        fetchAllMiqaats();
    }, []);

    // ── Styles ───────────────────────────────────────────────────────────────

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '38px',
            borderColor: state.isFocused ? '#0d6efd' : '#dee2e6',
            borderWidth: '2px',
            borderRadius: '8px',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13,110,253,0.15)' : 'none',
            '&:hover': { borderColor: '#adb5bd' }
        }),
        placeholder: (base) => ({ ...base, color: '#6c757d', fontSize: '15px' }),
        singleValue: (base) => ({ ...base, fontSize: '15px' }),
        dropdownIndicator: (base) => ({
            ...base, color: '#0d6efd', '&:hover': { color: '#0b5ed7' }
        }),
        menu: (base) => ({ ...base, zIndex: 1000 })
    };

    const cellBase = {
        border: '1px solid #333',
        padding: '7px 11px',
        verticalAlign: 'middle'
    };

    // ── Render helpers ───────────────────────────────────────────────────────

    const hasData = !!(chartData?.data?.length);

    if (checkingPermissions) {
        return (
            <Fragment>
                <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    minHeight: '400px', textAlign: 'center'
                }}>
                    <div
                        className="spinner-border text-primary"
                        style={{ width: '3rem', height: '3rem' }}
                        role="status"
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Checking permissions...</p>
                </div>
            </Fragment>
        );
    }

    // ── JSX ──────────────────────────────────────────────────────────────────

    return (
        <Fragment>
            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>

                                {/* ── Page header ── */}
                                <div className="page-header-title">
                                    <div className="header-text">
                                        <i className="ri-file-chart-line"></i>
                                        <span>Duty Chart</span>
                                    </div>
                                    {hasData && (
                                        <div className="d-flex gap-2 align-items-center">
                                            <span className="badge badge-primary">
                                                Total Quota: {totalQuota}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* ── Filter / action bar ── */}
                                <Row className="mb-4 align-items-end">
                                    <Col md={5}>
                                        <label className="form-label">
                                            Miqaat <span className="text-danger">*</span>
                                        </label>
                                        <Select
                                            options={miqaatOptions}
                                            value={selectedMiqaat}
                                            onChange={(val) => {
                                                setSelectedMiqaat(val);
                                                setChartData(null);
                                            }}
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
                                            style={{ height: '38px', borderRadius: '8px', fontWeight: 500 }}
                                            onClick={fetchDutyChart}
                                            disabled={loading || !selectedMiqaat}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ri-bar-chart-2-line me-2" />
                                                    Generate
                                                </>
                                            )}
                                        </Button>
                                    </Col>



                                    {/* <Col md={2}>
                                        <Button
                                            variant="success"
                                            className="w-100"
                                            style={{ height: '38px', borderRadius: '8px', fontWeight: 500 }}
                                            onClick={handleExportExcel}
                                            disabled={!hasData}
                                            title="Export to Excel"
                                        >
                                            <i className="ri-file-excel-2-line me-2" />
                                            Excel
                                        </Button>
                                    </Col> */}

                                    <Col md={2}>
                                        <Button
                                            variant="danger"
                                            className="w-100"
                                            style={{ height: '38px', borderRadius: '8px', fontWeight: 500 }}
                                            onClick={handleDownloadPDF}
                                            disabled={!hasData || downloading}
                                            title="Download as PDF"
                                        >
                                            <i className="ri-file-pdf-line me-2" />
                                            PDF
                                        </Button>
                                    </Col>

                                    <Col md={2}>
                                        <Button
                                            variant="warning"
                                            className="w-100"
                                            style={{ height: '38px', borderRadius: '8px', fontWeight: 500 }}
                                            onClick={handleDownloadImage}
                                            disabled={!hasData || downloading}
                                            title="Download as PNG image"
                                        >
                                            <i className="ri-file-pdf-line me-2" />
                                            Image
                                        </Button>
                                    </Col>

                                </Row>



                                {/* ── Body ── */}
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3 text-muted">Generating duty chart...</p>
                                    </div>
                                ) : !hasData ? (
                                    <div className="text-center py-5">
                                        <i
                                            className="ri-file-chart-line"
                                            style={{ fontSize: '64px', color: '#dee2e6' }}
                                        />
                                        <p className="text-muted mb-1 mt-3">No chart data available</p>
                                        <small className="text-muted">
                                            Select a miqaat and click Generate
                                        </small>
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>

                                        {/*
                                         * chartRef wraps ONLY the printable content so that
                                         * html2canvas captures exactly what goes into the
                                         * image / PDF — no surrounding chrome.
                                         */}
                                        <div
                                            ref={chartRef}
                                            style={{
                                                backgroundColor: '#ffffff',
                                                padding: '24px 20px 20px',
                                                display: 'inline-block',
                                                minWidth: '560px'
                                            }}
                                        >
                                            {/* ── Chart header ── */}
                                            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                                                <div style={{
                                                    fontSize: '22px',
                                                    fontWeight: 'bold',
                                                    color: '#cc0000',
                                                    letterSpacing: '1px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    BURHANI GUARDS IDARA
                                                </div>

                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#222',
                                                    marginTop: '5px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {chartData.summary?.miqaat_name}
                                                </div>

                                                <div style={{
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: '#333',
                                                    marginTop: '3px',
                                                    textTransform: 'uppercase'
                                                    // letterSpacing: '0.5px'
                                                }}>
                                                    {chartData.summary?.venue_name}
                                                </div>


                                                <div style={{
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: '#333',
                                                    marginTop: '3px'
                                                }}>
                                                    {formatReportingTime(chartData.summary?.start_date)}
                                                    {', '}
                                                    {formatChartDate(chartData.summary?.start_date)}
                                                </div>
                                            </div>

                                            {/* ── Duty chart table ── */}
                                            <table style={{
                                                width: '100%',
                                                borderCollapse: 'collapse',
                                                fontSize: '13px',
                                                border: '2px solid #333'
                                            }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#e8e8e8' }}>
                                                        {['LOCATION', 'INCHARGES', 'TEAM', 'COUNT'].map(col => (
                                                            <th
                                                                key={col}
                                                                style={{
                                                                    ...cellBase,
                                                                    textAlign: 'center',
                                                                    fontWeight: '700',
                                                                    fontSize: '13px',
                                                                    color: '#222',
                                                                    whiteSpace: 'nowrap',
                                                                    backgroundColor: '#e8e8e8'
                                                                }}
                                                            >
                                                                {col}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {groupedData.map(group => {
                                                        const bg = group.location_color;
                                                        const fg = getTextColor(bg);
                                                        const span = group.teams.length;

                                                        return group.teams.map((team, idx) => (
                                                            <tr key={`${group.location_id}-${team.team_id}`}>

                                                                {/* VENUE — spans all rows in this location group */}
                                                                {idx === 0 && (
                                                                    <td
                                                                        rowSpan={span}
                                                                        style={{
                                                                            ...cellBase,
                                                                            textAlign: 'center',
                                                                            fontWeight: '700',
                                                                            backgroundColor: bg,
                                                                            color: fg,
                                                                            whiteSpace: 'nowrap'
                                                                        }}
                                                                    >
                                                                        {group.location_name}
                                                                    </td>
                                                                )}

                                                                {/* INCHARGES — spans all rows in this location group */}
                                                                {idx === 0 && (
                                                                    <td
                                                                        rowSpan={span}
                                                                        style={{
                                                                            ...cellBase,
                                                                            textAlign: 'center',
                                                                            fontWeight: '500',
                                                                            backgroundColor: bg,
                                                                            color: fg
                                                                        }}
                                                                    >
                                                                        {group.incharge_names || '—'}
                                                                    </td>
                                                                )}

                                                                {/* GROUPS (team name) */}
                                                                <td style={{
                                                                    ...cellBase,
                                                                    fontWeight: '500',
                                                                    backgroundColor: bg,
                                                                    color: fg
                                                                }}>
                                                                    {team.team_name}
                                                                </td>

                                                                {/* COUNT (quota) */}
                                                                <td style={{
                                                                    ...cellBase,
                                                                    textAlign: 'center',
                                                                    fontWeight: '700',
                                                                    backgroundColor: bg,
                                                                    color: fg
                                                                }}>
                                                                    {team.quota}
                                                                </td>
                                                            </tr>
                                                        ));
                                                    })}

                                                    {/* ── Total row ── */}
                                                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                                                        <td
                                                            colSpan={3}
                                                            style={{
                                                                ...cellBase,
                                                                textAlign: 'right',
                                                                fontWeight: '700',
                                                                color: '#222'
                                                            }}
                                                        >
                                                            TOTAL
                                                        </td>
                                                        <td style={{
                                                            ...cellBase,
                                                            textAlign: 'center',
                                                            fontWeight: '700',
                                                            color: '#222'
                                                        }}>
                                                            {totalQuota}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* end chartRef */}

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

export default DutyChart;