// src/container/back office/MemberLavazam.jsx
// Backoffice confirmation screen.
// Shows member_lavazam records submitted by captains (action_status=1).
// Backoffice checks members from whom they have received payment and saves.
// Confirmed records (action_status=2) disappear from the list on next fetch.
import { Fragment, useState, useEffect, useCallback } from 'react';
import { Card, Col, Row, Form } from 'react-bootstrap';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { checkModuleAccess } from '../../utils/accessControl';
import '../../styles/shared-styles.css';
import appStorage from '../../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MODULE_ID = '121';

// Year fixed to 2026 for now; dropdown kept for future extensibility
const LAVAZAM_YEAR = 2026;


// ============================================================================
// MAIN COMPONENT
// ============================================================================
const MemberLavazam = () => {
    const navigate = useNavigate();

    // RBAC
    const [checkingPermissions, setCheckingPermissions] = useState(true);
    const [permissions, setPermissions] = useState({
        canAdd: false, canEdit: false, canDelete: false, hasAccess: false
    });

    // Filter controls
    const [teamOptions, setTeamOptions] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);

    // Member list
    // Each item: { its_id, full_name, mobile, age, member_lavazam_id, lavazam_year, isChecked, originallyChecked }
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Select-all checkbox state
    const [selectAll, setSelectAll] = useState(false);

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
    // FETCH TEAMS on mount
    // -------------------------------------------------------------------------
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const token = appStorage.getItem('access_token');
                if (!token) return;

                const response = await fetch(`${API_BASE_URL}/Team/GetAllTeams`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();
                if (response.ok && result.success && result.data) {
                    setTeamOptions(
                        result.data.map(item => ({
                            value: item.team_id,
                            label: item.team_name
                        }))
                    );
                }
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };

        fetchTeams();
    }, []);

    // -------------------------------------------------------------------------
    // FETCH PENDING CONFIRMATION MEMBERS when team is selected
    // -------------------------------------------------------------------------
    const fetchPendingMembers = useCallback(async (teamId) => {
        const token = appStorage.getItem('access_token');
        if (!token) return;

        setMembers([]);
        setSelectAll(false);
        setIsLoadingMembers(true);

        try {
            const res = await fetch(`${API_BASE_URL}/MemberLavazam/GetPendingConfirmationByTeam`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    team_id: teamId,
                    lavazam_type: 1,
                    lavazam_year: LAVAZAM_YEAR
                })
            });
            const result = await res.json();

            if (res.ok && result.success && result.data) {
                const memberList = result.data.map(m => ({
                    its_id: m.its_id,
                    full_name: m.full_name,
                    mobile: m.mobile || '-',
                    age: m.age || '-',
                    member_lavazam_id: m.member_lavazam_id,
                    lavazam_year: m.lavazam_year,
                    isChecked: false,
                    originallyChecked: false
                }));
                setMembers(memberList);
                setSelectAll(false);
            } else {
                setMembers([]);
            }
        } catch (error) {
            console.error('Error fetching pending members:', error);
        } finally {
            setIsLoadingMembers(false);
        }
    }, []);

    useEffect(() => {
        if (selectedTeam) {
            fetchPendingMembers(selectedTeam.value);
        } else {
            setMembers([]);
            setSelectAll(false);
        }
    }, [selectedTeam, fetchPendingMembers]);

    // -------------------------------------------------------------------------
    // CHECKBOX HANDLERS
    // -------------------------------------------------------------------------
    const handleToggleMember = (its_id) => {
        setMembers(prev => {
            const updated = prev.map(m =>
                m.its_id === its_id ? { ...m, isChecked: !m.isChecked } : m
            );
            setSelectAll(updated.length > 0 && updated.every(m => m.isChecked));
            return updated;
        });
    };

    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        setMembers(prev => prev.map(m => ({ ...m, isChecked: checked })));
    };

    // -------------------------------------------------------------------------
    // BACKGROUND NOTIFICATION TRIGGER
    // Fires push dispatch after successful confirmation. Silent on failure.
    // -------------------------------------------------------------------------
    const triggerBackgroundNotification = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/Notification/burhani_background_notification`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: ''
            });
            if (!response.ok) {
                console.warn('Background notification API returned non-OK status:', response.status);
            }
        } catch (error) {
            console.error('Failed to trigger background notification:', error);
        }
    };

    // -------------------------------------------------------------------------
    // SAVE LOGIC
    // Loops through newly checked rows and calls UpdateMemberLavazamAction per record.
    // -------------------------------------------------------------------------
    const toConfirm = members.filter(m => m.isChecked && !m.originallyChecked);
    const hasChanges = toConfirm.length > 0;

    const handleSave = async () => {
        if (!hasChanges) {
            Swal.fire({ icon: 'info', title: 'No Changes', text: 'No records selected for confirmation.', confirmButtonText: 'OK' });
            return;
        }

        setIsSaving(true);
        const token = appStorage.getItem('access_token');
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

        let confirmSuccess = 0, confirmFail = 0;

        try {
            for (const m of toConfirm) {
                try {
                    const res = await fetch(`${API_BASE_URL}/MemberLavazam/UpdateMemberLavazamAction`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ member_lavazam_id: m.member_lavazam_id })
                    });
                    const result = await res.json();
                    if (res.ok && result.success && Number(result.data?.result_code) === 2) {
                        confirmSuccess++;
                    } else {
                        confirmFail++;
                        console.error(`Confirm failed for ITS ${m.its_id}:`, result.message);
                    }
                } catch (err) {
                    confirmFail++;
                    console.error(`Confirm error for ITS ${m.its_id}:`, err);
                }
            }

            setIsSaving(false);

            if (confirmSuccess > 0) {
                await triggerBackgroundNotification();
            }

            if (confirmFail === 0) {
                await Swal.fire({
                    title: 'Confirmed!',
                    text: `${confirmSuccess} record(s) confirmed successfully.`,
                    icon: 'success',
                    timer: 2000,
                    timerProgressBar: false,
                    showConfirmButton: false
                });
            } else {
                await Swal.fire({
                    title: 'Partial Success',
                    html: `${confirmSuccess} record(s) confirmed.<br/>${confirmFail} record(s) failed.`,
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
            }

            // Refetch — confirmed records will not appear anymore
            fetchPendingMembers(selectedTeam.value);

        } catch (error) {
            setIsSaving(false);
            console.error('Save error:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'An error occurred while saving.', confirmButtonText: 'OK' });
        }
    };

    // -------------------------------------------------------------------------
    // DERIVED VALUES
    // -------------------------------------------------------------------------
    const checkedCount = members.filter(m => m.isChecked).length;
    const totalCount = members.length;

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
                .ml-page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .ml-page-header .header-text {
                    display: flex;
                    align-items: center;
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                    gap: 8px;
                }
                .ml-page-header .header-text i { font-size: 20px; }
                .badge-primary {
                    background: #0d6efd; color: #fff;
                    padding: 6px 12px; border-radius: 4px;
                    font-size: 14px; font-weight: 500;
                }
                .badge-warning-custom {
                    background: #fd7e14; color: #fff;
                    padding: 6px 12px; border-radius: 4px;
                    font-size: 14px; font-weight: 500;
                }
                .ml-filter-row {
                    display: flex;
                    gap: 16px;
                    align-items: flex-end;
                    flex-wrap: wrap;
                    margin-bottom: 20px;
                }
                .ml-filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    min-width: 220px;
                }
                .ml-filter-group label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #555;
                    margin-bottom: 0;
                }
                .ml-member-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }
                .ml-member-table th {
                    background: #f1f3f5;
                    padding: 10px 12px;
                    text-align: left;
                    font-weight: 600;
                    color: #444;
                    border-bottom: 2px solid #dee2e6;
                }
                .ml-member-table td {
                    padding: 9px 12px;
                    border-bottom: 1px solid #f0f0f0;
                    vertical-align: middle;
                }
                .ml-member-table tr:hover td { background: #f8f9fa; }
                .ml-member-table tr.is-selected td { background: #e8f5e9; }
                .ml-member-table tr.is-selected:hover td { background: #dcedc8; }
                .ml-member-table input[type="checkbox"] {
                    width: 16px; height: 16px; cursor: pointer;
                }
                .ml-no-data {
                    text-align: center; padding: 40px; color: #6c757d;
                }
            `}</style>

            {/* Saving overlay */}
            {isSaving && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(255,255,255,0.6)', zIndex: 9999,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Saving...</span>
                    </div>
                    <p className="mt-3" style={{ fontWeight: 600, color: '#333' }}>Saving...</p>
                </div>
            )}

            <div style={{ margin: '20px auto', maxWidth: '100%' }}>
                <Row>
                    <Col xl={12}>
                        <Card className="custom-card">
                            <Card.Body>

                                {/* ---- HEADER ---- */}
                                <div className="ml-page-header">
                                    <div className="header-text">
                                        <i className="ri-shield-check-line"></i>
                                        <span>Member Lavazam</span>
                                    </div>
                                    <div className="d-flex gap-2 align-items-center flex-wrap">
                                        {members.length > 0 && (
                                            <>
                                                <span className="badge badge-primary">
                                                    Pending: {totalCount}
                                                </span>
                                                {checkedCount > 0 && (
                                                    <span className="badge badge-warning-custom">
                                                        Selected: {checkedCount}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                        {permissions.canAdd && members.length > 0 && (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={handleSave}
                                                disabled={isSaving || !hasChanges}
                                            >
                                                <i className="ri-checkbox-circle-line me-1"></i>Confirm Selected
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* ---- FILTER ROW ---- */}
                                <div className="ml-filter-row">
                                    <div className="ml-filter-group">
                                        <label>Team <span className="text-danger">*</span></label>
                                        <Select
                                            options={teamOptions}
                                            value={selectedTeam}
                                            onChange={(opt) => setSelectedTeam(opt)}
                                            placeholder="Select Team..."
                                            isClearable
                                            isDisabled={isSaving}
                                            styles={{ container: (base) => ({ ...base, minWidth: '220px' }) }}
                                        />
                                    </div>

                                    <div className="ml-filter-group">
                                        <label>Year</label>
                                        <Form.Select
                                            value={LAVAZAM_YEAR}
                                            disabled
                                            style={{ minWidth: '120px' }}
                                        >
                                            <option value={LAVAZAM_YEAR}>{LAVAZAM_YEAR}</option>
                                        </Form.Select>
                                    </div>
                                </div>

                                {/* ---- MEMBER TABLE ---- */}
                                {!selectedTeam ? (
                                    <div className="ml-no-data">
                                        <i className="ri-group-line" style={{ fontSize: '48px' }}></i>
                                        <p className="mt-3">Select a team to view pending confirmation records</p>
                                    </div>
                                ) : isLoadingMembers ? (
                                    <div className="ml-no-data">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3">Loading members...</p>
                                    </div>
                                ) : members.length === 0 ? (
                                    <div className="ml-no-data">
                                        <i className="ri-checkbox-circle-line" style={{ fontSize: '48px', color: '#28a745' }}></i>
                                        <p className="mt-3">No pending records for this team</p>
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="ml-member-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '40px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectAll}
                                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                                            disabled={isSaving || !permissions.canAdd}
                                                            title="Select All"
                                                        />
                                                    </th>
                                                    <th style={{ width: '40px' }}>Sr</th>
                                                    <th style={{ width: '120px' }}>ITS ID</th>
                                                    <th>Full Name</th>
                                                    <th style={{ width: '140px' }}>Mobile</th>
                                                    <th style={{ width: '70px' }}>Age</th>
                                                    <th style={{ width: '80px' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {members.map((member, index) => (
                                                    <tr
                                                        key={member.member_lavazam_id}
                                                        className={member.isChecked ? 'is-selected' : ''}
                                                    >
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={member.isChecked}
                                                                onChange={() => handleToggleMember(member.its_id)}
                                                                disabled={isSaving || !permissions.canAdd}
                                                            />
                                                        </td>
                                                        <td>{index + 1}</td>
                                                        <td>{member.its_id}</td>
                                                        <td>{member.full_name}</td>
                                                        <td>{member.mobile}</td>
                                                        <td>{member.age}</td>
                                                        <td>
                                                            {member.isChecked
                                                                ? <span className="badge bg-success" style={{ fontSize: '11px' }}>Confirm</span>
                                                                : <span className="badge bg-warning text-dark" style={{ fontSize: '11px' }}>Pending</span>
                                                            }
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

export default MemberLavazam;
