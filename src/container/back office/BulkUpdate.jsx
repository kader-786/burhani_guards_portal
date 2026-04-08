// src/container/back office/BulkUpdate.jsx
import { Fragment, useState, useEffect, useRef } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { checkModuleAccess } from '../../utils/accessControl';
import '../../styles/shared-styles.css';
import appStorage from '../../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MODULE_ID = '122';
const POLL_INTERVAL_MS = 3000;

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const BulkUpdate = () => {
    const navigate = useNavigate();

    // RBAC
    const [checkingPermissions, setCheckingPermissions] = useState(true);
    const [permissions, setPermissions] = useState({
        canAdd: false, canEdit: false, canDelete: false, hasAccess: false
    });

    // Input
    const [itsIdsInput, setItsIdsInput] = useState('');
    const [inputError, setInputError] = useState('');

    // Job state
    const [isRunning, setIsRunning] = useState(false);
    const [jobId, setJobId] = useState(null);
    const [jobResult, setJobResult] = useState(null); // last polled status object
    const pollingRef = useRef(null);

    // -------------------------------------------------------------------------
    // RBAC CHECK
    // -------------------------------------------------------------------------
    useEffect(() => {
        const checkAccess = async () => {
            setCheckingPermissions(true);

            const isAdminValue = appStorage.getItem('is_admin');
            if (isAdminValue === 'true' || isAdminValue === true || isAdminValue === '1') {
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
                }).then(() => {
                    navigate(`${import.meta.env.BASE_URL}login/`);
                });
                return;
            }

            const access = checkModuleAccess(accessRights, MODULE_ID);
            if (!access.hasAccess) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Access Denied',
                    text: 'You do not have permission to access this module.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate(`${import.meta.env.BASE_URL}dashboard/`);
                });
                return;
            }

            setPermissions(access);
            setCheckingPermissions(false);
        };

        checkAccess();
    }, [navigate]);

    // -------------------------------------------------------------------------
    // CLEANUP polling on unmount
    // -------------------------------------------------------------------------
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    // -------------------------------------------------------------------------
    // POLLING
    // -------------------------------------------------------------------------
    const startPolling = (jId) => {
        if (pollingRef.current) clearInterval(pollingRef.current);

        const poll = async () => {
            try {
                const token = appStorage.getItem('access_token');
                const res = await fetch(`${API_BASE_URL}/BulkUpdate/JobStatus/${jId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                setJobResult(data);

                if (data.status === 'done' || data.status === 'not_found') {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                    setIsRunning(false);
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        };

        // Poll immediately so fast-completing jobs show results without waiting 3 seconds
        poll();

        // Then continue polling on the interval
        pollingRef.current = setInterval(poll, POLL_INTERVAL_MS);
    };

    // -------------------------------------------------------------------------
    // START JOB — shared logic
    // -------------------------------------------------------------------------
    const startJob = async (endpoint, body) => {
        setIsRunning(true);
        setJobId(null);
        setJobResult(null);

        try {
            const token = appStorage.getItem('access_token');
            const res = await fetch(`${API_BASE_URL}/BulkUpdate/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: body ? JSON.stringify(body) : undefined
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setIsRunning(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to Start',
                    text: data.message || 'Could not start the update job.',
                    confirmButtonText: 'OK'
                });
                return;
            }

            setJobId(data.job_id);
            startPolling(data.job_id);

        } catch (err) {
            setIsRunning(false);
            console.error('Start job error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while starting the job.',
                confirmButtonText: 'OK'
            });
        }
    };

    // -------------------------------------------------------------------------
    // UPDATE SELECTED
    // -------------------------------------------------------------------------
    const handleUpdateSelected = () => {
        setInputError('');

        const raw = itsIdsInput.trim();
        if (!raw) {
            setInputError('Please enter at least one ITS ID.');
            return;
        }

        const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
        const ids = [];
        const invalid = [];

        for (const part of parts) {
            const n = Number(part);
            if (!Number.isInteger(n) || n <= 0) {
                invalid.push(part);
            } else {
                ids.push(n);
            }
        }

        if (invalid.length > 0) {
            setInputError(`Invalid ITS IDs: ${invalid.join(', ')}. All values must be positive integers.`);
            return;
        }

        startJob('UpdateByIds', { its_ids: ids });
    };

    // -------------------------------------------------------------------------
    // UPDATE ALL
    // -------------------------------------------------------------------------
    const handleUpdateAll = async () => {
        const confirm = await Swal.fire({
            icon: 'warning',
            title: 'Update ALL Members?',
            html: `This will refresh <strong>every member</strong> in the database from ITS.<br/><br/>
                   The operation may take <strong>several minutes</strong>.<br/>`,
            showCancelButton: true,
            confirmButtonText: 'Yes, Update All',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33'
        });

        if (!confirm.isConfirmed) return;

        startJob('UpdateAll', null);
    };

    // -------------------------------------------------------------------------
    // DERIVED PROGRESS VALUES
    // -------------------------------------------------------------------------
    const progressPct = jobResult && jobResult.total > 0
        ? Math.round((jobResult.processed / jobResult.total) * 100)
        : 0;

    // -------------------------------------------------------------------------
    // PERMISSION LOADING SCREEN
    // -------------------------------------------------------------------------
    if (checkingPermissions) {
        return (
            <Fragment>
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', minHeight: '400px', textAlign: 'center'
                }}>
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Checking permissions...</p>
                </div>
            </Fragment>
        );
    }

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------
    return (
        <Fragment>
            <style>{`
                .bu-page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .bu-page-header .header-text {
                    display: flex;
                    align-items: center;
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                    gap: 8px;
                }
                .bu-page-header .header-text i { font-size: 20px; }

                .bu-section {
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 20px 24px;
                    margin-bottom: 20px;
                }
                .bu-section-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .bu-section-title i { color: #0d6efd; font-size: 17px; }

                .bu-textarea {
                    width: 100%;
                    border: 1px solid #ced4da;
                    border-radius: 6px;
                    padding: 10px 12px;
                    font-size: 14px;
                    resize: vertical;
                    min-height: 90px;
                    font-family: monospace;
                    color: #333;
                    outline: none;
                    transition: border-color 0.15s;
                }
                .bu-textarea:focus { border-color: #0d6efd; }
                .bu-textarea.is-invalid { border-color: #dc3545; }
                .bu-error-text {
                    color: #dc3545;
                    font-size: 12px;
                    margin-top: 4px;
                }
                .bu-hint {
                    font-size: 12px;
                    color: #6c757d;
                    margin-top: 4px;
                }

                .bu-update-all-warning {
                    background: #fff8e1;
                    border: 1px solid #ffcc02;
                    border-radius: 6px;
                    padding: 12px 16px;
                    font-size: 13px;
                    color: #7d6200;
                    margin-bottom: 14px;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                }
                .bu-update-all-warning i { font-size: 18px; margin-top: 1px; flex-shrink: 0; }

                /* Progress Panel */
                .bu-progress-panel {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 20px 24px;
                    margin-bottom: 20px;
                }
                .bu-progress-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .bu-progress-bar-wrap {
                    background: #dee2e6;
                    border-radius: 4px;
                    height: 10px;
                    overflow: hidden;
                    margin-bottom: 12px;
                }
                .bu-progress-bar-fill {
                    height: 100%;
                    background: #0d6efd;
                    border-radius: 4px;
                    transition: width 0.4s ease;
                }
                .bu-progress-bar-fill.done { background: #198754; }
                .bu-stats-row {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    margin-bottom: 8px;
                }
                .bu-stat-chip {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #fff;
                    border: 1px solid #dee2e6;
                    border-radius: 20px;
                    padding: 4px 14px;
                    font-size: 13px;
                    font-weight: 500;
                }
                .bu-stat-chip.success { border-color: #198754; color: #198754; }
                .bu-stat-chip.failed  { border-color: #dc3545; color: #dc3545; }
                .bu-stat-chip.notfound{ border-color: #fd7e14; color: #fd7e14; }
                .bu-stat-chip.total   { border-color: #0d6efd; color: #0d6efd; }

                /* Failed IDs panel */
                .bu-failed-list {
                    margin-top: 16px;
                }
                .bu-failed-list-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #555;
                    margin-bottom: 8px;
                }
                .bu-failed-ids-box {
                    background: #fff5f5;
                    border: 1px solid #f5c2c7;
                    border-radius: 6px;
                    padding: 10px 14px;
                    font-size: 13px;
                    font-family: monospace;
                    color: #842029;
                    max-height: 160px;
                    overflow-y: auto;
                    word-break: break-all;
                    line-height: 1.8;
                }
                .bu-notfound-ids-box {
                    background: #fff8f0;
                    border: 1px solid #ffcc80;
                    border-radius: 6px;
                    padding: 10px 14px;
                    font-size: 13px;
                    font-family: monospace;
                    color: #7d4200;
                    max-height: 120px;
                    overflow-y: auto;
                    word-break: break-all;
                    line-height: 1.8;
                    margin-top: 10px;
                }
            `}</style>

            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>

                                {/* ---- HEADER ---- */}
                                <div className="bu-page-header">
                                    <div className="header-text">
                                        <i className="ri-refresh-line"></i>
                                        <span>Bulk Update from ITS</span>
                                    </div>
                                </div>

                                {/* ---- SECTION 1: Update Selected ---- */}
                                <div className="bu-section">
                                    <div className="bu-section-title">
                                        <i className="ri-list-check-2"></i>
                                        Update Selected Members
                                    </div>

                                    <textarea
                                        className={`bu-textarea${inputError ? ' is-invalid' : ''}`}
                                        placeholder="Enter ITS IDs separated by commas&#10;e.g. 12345678, 87654321, 11223344"
                                        value={itsIdsInput}
                                        onChange={(e) => {
                                            setItsIdsInput(e.target.value);
                                            if (inputError) setInputError('');
                                        }}
                                        disabled={isRunning}
                                    />
                                    {inputError
                                        ? <div className="bu-error-text">{inputError}</div>
                                        : <div className="bu-hint">Comma-separated ITS IDs.</div>
                                    }

                                    <div className="mt-3">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={handleUpdateSelected}
                                            disabled={isRunning || !permissions.canAdd}
                                        >
                                            {isRunning
                                                ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Running...</>
                                                : <><i className="ri-refresh-line me-1"></i>Update Selected</>
                                            }
                                        </button>
                                    </div>
                                </div>

                                {/* ---- SECTION 2: Update ALL ---- */}
                                <div className="bu-section">
                                    <div className="bu-section-title">
                                        <i className="ri-database-2-line"></i>
                                        Update All Members
                                    </div>

                                    <div className="bu-update-all-warning">
                                        <i className="ri-error-warning-line"></i>
                                        <span>
                                            This will update <strong>every active member</strong> in the database by fetching fresh data
                                            from ITS. The operation may take several minutes to complete.
                                        </span>
                                    </div>

                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={handleUpdateAll}
                                        disabled={isRunning || !permissions.canAdd}
                                    >
                                        {isRunning
                                            ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Running...</>
                                            : <><i className="ri-database-2-line me-1"></i>Update ALL</>
                                        }
                                    </button>
                                </div>

                                {/* ---- PROGRESS / RESULTS PANEL ---- */}
                                {jobResult && (
                                    <div className="bu-progress-panel">
                                        <div className="bu-progress-title">
                                            {jobResult.status === 'done'
                                                ? <><i className="ri-checkbox-circle-line" style={{ color: '#198754' }}></i> Update Complete</>
                                                : jobResult.status === 'not_found'
                                                    ? <><i className="ri-error-warning-line" style={{ color: '#dc3545' }}></i> Job Lost — Server Restarted</>
                                                    : <><span className="spinner-border spinner-border-sm text-primary me-1" role="status"></span> Updating...</>
                                            }
                                        </div>

                                        {/* Progress bar */}
                                        <div className="bu-progress-bar-wrap">
                                            <div
                                                className={`bu-progress-bar-fill${jobResult.status === 'done' ? ' done' : ''}`}
                                                style={{ width: `${progressPct}%` }}
                                            />
                                        </div>

                                        <div style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>
                                            Processed <strong>{jobResult.processed}</strong> of <strong>{jobResult.total}</strong>
                                            {jobResult.status === 'running' && ' — please wait...'}
                                        </div>

                                        {/* Stats chips */}
                                        <div className="bu-stats-row">
                                            <div className="bu-stat-chip total">
                                                <i className="ri-database-line"></i>
                                                Total: {jobResult.total}
                                            </div>
                                            <div className="bu-stat-chip success">
                                                <i className="ri-checkbox-circle-line"></i>
                                                Updated: {jobResult.success_count}
                                            </div>
                                            <div className="bu-stat-chip failed">
                                                <i className="ri-close-circle-line"></i>
                                                Failed (ITS): {jobResult.failed_count}
                                            </div>
                                            {jobResult.not_found_count > 0 && (
                                                <div className="bu-stat-chip notfound">
                                                    <i className="ri-user-unfollow-line"></i>
                                                    Not in DB: {jobResult.not_found_count}
                                                </div>
                                            )}
                                        </div>

                                        {/* Failed IDs (ITS returned no data) */}
                                        {jobResult.status === 'done' && jobResult.failed_ids && jobResult.failed_ids.length > 0 && (
                                            <div className="bu-failed-list">
                                                <div className="bu-failed-list-title">
                                                    <i className="ri-close-circle-line me-1" style={{ color: '#dc3545' }}></i>
                                                    Failed ITS IDs — no data received from ITS or DB update error ({jobResult.failed_ids.length}):
                                                </div>
                                                <div className="bu-failed-ids-box">
                                                    {jobResult.failed_ids.join(', ')}
                                                </div>
                                            </div>
                                        )}

                                        {/* Not-found IDs (ITS ID not in mumin_master) */}
                                        {jobResult.status === 'done' && jobResult.not_found_ids && jobResult.not_found_ids.length > 0 && (
                                            <div className="bu-failed-list">
                                                <div className="bu-failed-list-title" style={{ color: '#fd7e14' }}>
                                                    <i className="ri-user-unfollow-line me-1"></i>
                                                    ITS IDs not found in database ({jobResult.not_found_ids.length}):
                                                </div>
                                                <div className="bu-notfound-ids-box">
                                                    {jobResult.not_found_ids.join(', ')}
                                                </div>
                                            </div>
                                        )}

                                        {/* Job lost — server restarted mid-job */}
                                        {jobResult.status === 'not_found' && (
                                            <div style={{ marginTop: '12px', fontSize: '13px', color: '#dc3545', background: '#fff5f5', border: '1px solid #f5c2c7', borderRadius: '6px', padding: '10px 14px' }}>
                                                <i className="ri-error-warning-line me-1"></i>
                                                The server restarted while the job was running. {jobResult.processed > 0 ? `${jobResult.processed} record(s) were processed before the restart.` : ''} You can safely run the update again — records already updated will simply be refreshed again.
                                            </div>
                                        )}

                                        {/* Job error message */}
                                        {jobResult.status === 'done' && jobResult.message && (
                                            <div style={{ marginTop: '12px', fontSize: '13px', color: '#dc3545' }}>
                                                <i className="ri-error-warning-line me-1"></i>
                                                {jobResult.message}
                                            </div>
                                        )}
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

export default BulkUpdate;
