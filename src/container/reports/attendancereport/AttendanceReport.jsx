import { Fragment, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import { Grid } from 'gridjs-react';
import 'gridjs/dist/theme/mermaid.css';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AttendanceReport = () => {

    /* =========================
       STATE
    ========================= */
    const [miqaatOptions, setMiqaatOptions] = useState([]);
    const [selectedMiqaat, setSelectedMiqaat] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMiqaat, setLoadingMiqaat] = useState(false);

    /* =========================
       FETCH MIQAAT DDL
    ========================= */
    const fetchAllMiqaats = async () => {
        setLoadingMiqaat(true);
        try {
            const token = sessionStorage.getItem('access_token');

            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/Miqaat/GetAllMiqaat`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const result = await response.json();

            if (response.status === 401) {
                toast.error('Session expired. Please login again.');
                return;
            }

            if (response.ok && result.success) {
                const options = result.data.map(item => ({
                    value: item.miqaat_id,
                    label: item.miqaat_name
                }));
                setMiqaatOptions(options);
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

    /* =========================
       FETCH REPORT
    ========================= */
    const fetchAttendanceReport = async () => {
        if (!selectedMiqaat) {
            toast.warning('Please select Miqaat');
            return;
        }

        setLoading(true);
        try {
            const token = sessionStorage.getItem('access_token');

            const response = await fetch(
                `${API_BASE_URL}/Reports/GetAttendanceReport`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        miqaat_id: selectedMiqaat.value
                    })
                }
            );

            const result = await response.json();

            if (response.status === 401) {
                toast.error('Session expired. Please login again.');
                return;
            }

            if (response.ok && result.success) {
                setTableData(result.data || []);
            } else {
                setTableData([]);
                toast.error(result.message || 'No records found');
            }

        } catch (error) {
            console.error(error);
            toast.error('Error loading attendance report');
            setTableData([]);
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       ON LOAD
    ========================= */
    useEffect(() => {
        fetchAllMiqaats();
    }, []);

    /* =========================
       GRID DATA
    ========================= */
    const gridData = useMemo(() => {
        return tableData.map((row, index) => [
            index + 1,
            row.its_id,
            row.full_name || '-',
            row.mobile || '-',
            row.jamiaat_name || '-',
            row.miqaat_name,
            row.team_name || 'unassigned',
            row.venue_name || '-',
            row.location || '-',
            row.quota ?? '-',
            row.attendee_type,
            row.scanned_by,
            row.scanned_date
        ]);
    }, [tableData]);

    return (
        <Fragment>

            {/* =========================
               GRID CSS FIXES
            ========================= */}
            <style>
            {`
                /* Enable horizontal scrolling */
                #grid-attendance-report {
                    overflow-x: auto;
                }

                #grid-attendance-report .gridjs-wrapper {
                    overflow-x: auto !important;
                }

                #grid-attendance-report .gridjs-table {
                    width: max-content !important;
                    min-width: 100%;
                    table-layout: auto !important;
                }

                /* ===============================
                   HEADER: SINGLE LINE ONLY
                =============================== */
                #grid-attendance-report th {
                    white-space: nowrap !important;
                    word-break: keep-all !important;
                    overflow-wrap: normal !important;
                    text-align: center;
                    vertical-align: middle;
                    min-width: 130px;
                    padding: 12px 10px;
                }

                /* ===============================
                   CELLS: WRAP ONLY AT WORDS
                =============================== */
                #grid-attendance-report td {
                    white-space: normal !important;
                    word-break: normal !important;
                    overflow-wrap: break-word !important;
                    vertical-align: middle;
                    max-width: 260px;
                    line-height: 1.4;
                    padding: 10px;
                }

                /* Sort icon spacing */
                #grid-attendance-report th .gridjs-sort {
                    margin-left: 6px;
                }
            `}
            </style>

            <Row>
                <Col xl={12}>
                    <Card className="custom-card">

                        <Card.Header>
                            <Card.Title>Attendance Report</Card.Title>
                        </Card.Header>

                        <Card.Body>

                            {/* ================= FILTER ================= */}
                            <Row className="mb-4 align-items-end">
                                <Col md={4}>
                                    <Form.Label>
                                        Miqaat Name <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Select
                                        options={miqaatOptions}
                                        value={selectedMiqaat}
                                        onChange={setSelectedMiqaat}
                                        placeholder="Select Miqaat"
                                        isClearable
                                        isLoading={loadingMiqaat}
                                    />
                                </Col>

                                <Col md={2}>
                                    <Button
                                        variant="primary"
                                        className="w-100"
                                        onClick={fetchAttendanceReport}
                                        disabled={loading}
                                    >
                                        {loading ? 'Loading...' : 'Search'}
                                    </Button>
                                </Col>

                                <Col md={3}>
                                    <span className="badge bg-primary-transparent">
                                        Total Count: {tableData.length}
                                    </span>
                                </Col>
                            </Row>

                            {/* ================= GRID ================= */}
                            <div id="grid-attendance-report">
                                <Grid
                                    data={gridData}
                                    sort={true}
                                    search={{
                                        enabled: true,
                                        placeholder: 'Type a keyword...'
                                    }}
                                    columns={[
                                        'SR',
                                        'ITS ID',
                                        'FULL NAME',
                                        'MOBILE',
                                        'JAMIAAT',
                                        'MIQAAT NAME',
                                        'TEAM',
                                        'VENUE',
                                        'LOCATION',
                                        'QUOTA',
                                        'ATTENDEE TYPE',
                                        'SCANNED BY',
                                        'SCANNED DATE'
                                    ]}
                                    pagination={{
                                        limit: 10,
                                        summary: true
                                    }}
                                    className={{
                                        table: 'table table-bordered'
                                    }}
                                />
                            </div>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Fragment>
    );
};

export default AttendanceReport;
