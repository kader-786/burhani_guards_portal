import { Fragment, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap';
import Select from 'react-select';
import { Grid } from 'gridjs-react';
import 'gridjs/dist/theme/mermaid.css';
import { toast } from 'react-toastify';
import '../../../styles/shared-styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AttendanceReport = () => {
    const [miqaatOptions, setMiqaatOptions] = useState([]);
    const [selectedMiqaat, setSelectedMiqaat] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMiqaat, setLoadingMiqaat] = useState(false);

    const fetchAllMiqaats = async () => {
        setLoadingMiqaat(true);
        try {
            const token = sessionStorage.getItem('access_token');
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

    const fetchAttendanceReport = async () => {
        if (!selectedMiqaat) {
            toast.warning('Please select Miqaat');
            return;
        }

        setLoading(true);
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/Reports/GetAttendanceReport`, {
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

    useEffect(() => {
        fetchAllMiqaats();
    }, []);

    const gridData = useMemo(() => {
        return tableData.map((row, index) => [
            index + 1,
            row.its_id,
            row.full_name || '-',
            row.mobile || '-',
            row.jamiaat_name || '-',
            row.miqaat_name,
            row.team_name || 'Unassigned',
            row.venue_name || '-',
            row.location || '-',
            row.quota ?? '-',
            row.attendee_type,
            row.scanned_by,
            row.scanned_date
        ]);
    }, [tableData]);

    // STANDARDIZED SELECT STYLES - Matches Duties page exactly
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '38px',
            borderColor: state.isFocused ? '#0d6efd' : '#dee2e6',
            borderWidth: '2px',
            borderRadius: '8px',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.15)' : 'none',
            '&:hover': { borderColor: '#adb5bd' }
        }),
        placeholder: (base) => ({ 
            ...base, 
            color: '#6c757d',
            fontSize: '15px'
        }),
        singleValue: (base) => ({
            ...base,
            fontSize: '15px'
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: '#0d6efd',
            '&:hover': {
                color: '#0b5ed7'
            }
        }),
        menu: (base) => ({ 
            ...base, 
            zIndex: 1000 
        })
    };

    return (
        <Fragment>
            {/* Container div with margin - matches Duties page */}
            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>
                                <style>
                                    {`
                                        /* Standardized form label styling */
                                        .form-label {
                                            font-weight: 500;
                                            font-size: 14px;
                                            color: #495057;
                                            margin-bottom: 8px;
                                            display: block;
                                        }

                                        .form-label .text-danger {
                                            color: #dc3545;
                                            margin-left: 4px;
                                        }

                                        /* Badge styling */
                                        .badge-primary {
                                            background: #0d6efd;
                                            color: #fff;
                                            padding: 6px 12px;
                                            border-radius: 4px;
                                            font-size: 14px;
                                            font-weight: 500;
                                        }

                                        /* Button styling to match Duties */
                                        .btn-primary {
                                            height: 38px;
                                            font-size: 14px;
                                            font-weight: 500;
                                            border-radius: 8px;
                                            border: none;
                                            transition: all 0.2s;
                                        }

                                        .btn-primary:hover:not(:disabled) {
                                            transform: translateY(-1px);
                                            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
                                        }

                                        .btn-primary:active:not(:disabled) {
                                            transform: translateY(0);
                                        }
                                    `}
                                </style>

                                {/* STANDARDIZED HEADER - Matches Duties exactly */}
                                <div className="page-header-title">
                                    <div className="header-text">
                                        <i className="ri-file-list-line"></i>
                                        <span>Attendance Report</span>
                                    </div>
                                    <div className="d-flex gap-2 align-items-center">
                                    <span className="badge badge-primary">
                                        Total Records: {tableData.length}
                                    </span>
                                </div>
                                </div>

                                {/* Total Records Badge */}
                                {/* <div className="mb-3">
                                </div> */}

                                {/* Filter Section - STANDARDIZED LABELS */}
                                <Row className="mb-4 align-items-end">
                                    <Col md={5}>
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
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    </Col>

                                    <Col md={3}>
                                        <Button
                                            variant="primary"
                                            className="w-100"
                                            onClick={fetchAttendanceReport}
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

                                {/* Data Display Section */}
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3 text-muted">Loading attendance data...</p>
                                    </div>
                                ) : tableData.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <i className="ri-inbox-line" style={{ fontSize: '64px', color: '#dee2e6' }}></i>
                                        </div>
                                        <p className="text-muted mb-1">No attendance records found</p>
                                        <small className="text-muted">
                                            Select a miqaat and click search to view records
                                        </small>
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
                                                { name: 'MOBILE', width: '130px', sort: true },
                                                { name: 'JAMIAAT', width: '120px', sort: true },
                                                { name: 'MIQAAT NAME', width: '150px', sort: true },
                                                { name: 'TEAM', width: '120px', sort: true },
                                                { name: 'VENUE', width: '120px', sort: true },
                                                { name: 'LOCATION', width: '120px', sort: true },
                                                { name: 'QUOTA', width: '80px', sort: true },
                                                { name: 'ATTENDEE TYPE', width: '130px', sort: true },
                                                { name: 'SCANNED BY', width: '120px', sort: true },
                                                { name: 'SCANNED DATE', width: '150px', sort: true }
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

export default AttendanceReport;