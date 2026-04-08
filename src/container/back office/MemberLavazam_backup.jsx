// src/container/back office/MemberLavazam.jsx
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

const LAVAZAM_TYPE_OPTIONS = [
    { value: '1', label: 'Old' },
    { value: '2', label: 'New' }
];


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
    const [selectedType, setSelectedType] = useState('');

    // Lavazam info from lavazam_master lookup
    const [lavazamInfo, setLavazamInfo] = useState(null);   // { lavazam_id, lavazam_amount, resolved_team_id }
    const [lavazamWarning, setLavazamWarning] = useState('');

    // Member list
    // Each item: { its_id, full_name, mobile, age, member_lavazam_id, isChecked, originallyChecked }
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isLoadingLavazam, setIsLoadingLavazam] = useState(false);
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
    // FETCH LAVAZAM INFO + MEMBERS when both team and type are selected
    // -------------------------------------------------------------------------
    const fetchLavazamAndMembers = useCallback(async (teamId, lavazamType) => {
        const token = appStorage.getItem('access_token');
        if (!token) return;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // Reset state
        setLavazamInfo(null);
        setLavazamWarning('');
        setMembers([]);
        setSelectAll(false);

        // --- Lavazam lookup ---
        setIsLoadingLavazam(true);
        try {
            const lRes = await fetch(`${API_BASE_URL}/MemberLavazam/GetLavazamForTeam`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ team_id: teamId, lavazam_type: parseInt(lavazamType) })
            });
            const lResult = await lRes.json();

            if (lRes.ok && lResult.success && lResult.data) {
                setLavazamInfo(lResult.data);
            } else {
                setLavazamWarning(lResult.message || 'No lavazam configured for this team and type.');
                setIsLoadingLavazam(false);
                return; // Can't proceed without a lavazam entry
            }
        } catch (error) {
            console.error('Error fetching lavazam for team:', error);
            setLavazamWarning('Error fetching lavazam configuration.');
            setIsLoadingLavazam(false);
            return;
        } finally {
            setIsLoadingLavazam(false);
        }

        // --- Members ---
        setIsLoadingMembers(true);
        try {
            const mRes = await fetch(`${API_BASE_URL}/MemberLavazam/GetMembersByTeam`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ team_id: teamId, lavazam_type: parseInt(lavazamType) })
            });
            const mResult = await mRes.json();

            if (mRes.ok && mResult.success && mResult.data) {
                const memberList = mResult.data.map(m => ({
                    its_id: m.its_id,
                    full_name: m.full_name,
                    mobile: m.mobile || '-',
                    age: m.age || '-',
                    member_lavazam_id: m.member_lavazam_id || null,
                    isChecked: m.member_lavazam_id != null,
                    originallyChecked: m.member_lavazam_id != null
                }));
                setMembers(memberList);
                setSelectAll(memberList.length > 0 && memberList.every(m => m.isChecked));
            } else {
                setMembers([]);
            }
        } catch (error) {
            console.error('Error fetching team members:', error);
        } finally {
            setIsLoadingMembers(false);
        }
    }, []);

    useEffect(() => {
        if (selectedTeam && selectedType) {
            fetchLavazamAndMembers(selectedTeam.value, selectedType);
        } else {
            setLavazamInfo(null);
            setLavazamWarning('');
            setMembers([]);
            setSelectAll(false);
        }
    }, [selectedTeam, selectedType, fetchLavazamAndMembers]);

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
    // SAVE LOGIC
    // -------------------------------------------------------------------------
    const hasChanges = members.some(m => m.isChecked !== m.originallyChecked);

    const handleSave = async () => {
        if (!lavazamInfo) return;
        if (!hasChanges) {
            Swal.fire({ icon: 'info', title: 'No Changes', text: 'No changes to save.', confirmButtonText: 'OK' });
            return;
        }

        const toInsert = members.filter(m => m.isChecked && !m.originallyChecked);
        const toDelete = members.filter(m => !m.isChecked && m.originallyChecked && m.member_lavazam_id != null);

        setIsSaving(true);
        const token = appStorage.getItem('access_token');
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

        let insertSuccess = 0, insertFail = 0, deleteSuccess = 0, deleteFail = 0;

        try {
            // Process inserts
            for (const m of toInsert) {
                try {
                    const res = await fetch(`${API_BASE_URL}/MemberLavazam/InsertMemberLavazam`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            its_id: m.its_id,
                            team_id: selectedTeam.value,
                            lavazam_id: lavazamInfo.lavazam_id,
                            lavazam_type: parseInt(selectedType)
                        })
                    });
                    const result = await res.json();
                    if (res.ok && result.success && Number(result.data?.result_code) === 1) {
                        insertSuccess++;
                    } else {
                        insertFail++;
                        console.error(`Insert failed for ITS ${m.its_id}:`, result.message);
                    }
                } catch (err) {
                    insertFail++;
                    console.error(`Insert error for ITS ${m.its_id}:`, err);
                }
            }

            // Process deletes
            for (const m of toDelete) {
                try {
                    const res = await fetch(`${API_BASE_URL}/MemberLavazam/DeleteMemberLavazam`, {
                        method: 'DELETE',
                        headers,
                        body: JSON.stringify({ member_lavazam_id: m.member_lavazam_id })
                    });
                    const result = await res.json();
                    if (res.ok && result.success && Number(result.data?.result_code) === 3) {
                        deleteSuccess++;
                    } else {
                        deleteFail++;
                        console.error(`Delete failed for ITS ${m.its_id}:`, result.message);
                    }
                } catch (err) {
                    deleteFail++;
                    console.error(`Delete error for ITS ${m.its_id}:`, err);
                }
            }

            const total = insertSuccess + deleteSuccess;
            const failed = insertFail + deleteFail;

            setIsSaving(false);

            if (failed === 0) {
                await Swal.fire({
                    title: 'Saved!',
                    text: `${total} record(s) updated successfully.`,
                    icon: 'success',
                    timer: 2000,
                    timerProgressBar: false,
                    showConfirmButton: false
                });
            } else {
                await Swal.fire({
                    title: 'Partial Success',
                    html: `${total} record(s) saved.<br/>${failed} record(s) failed.`,
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
            }

            // Refresh
            fetchLavazamAndMembers(selectedTeam.value, selectedType);

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
                .badge-secondary {
                    background: #6c757d; color: #fff;
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
                .ml-amount-display {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 6px;
                    padding: 7px 12px;
                    font-size: 14px;
                    color: #333;
                    font-weight: 600;
                    min-width: 140px;
                }
                .ml-amount-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .ml-amount-group label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #555;
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
                .ml-member-table tr.is-paid td { background: #e8f5e9; }
                .ml-member-table tr.is-paid:hover td { background: #dcedc8; }
                .ml-member-table input[type="checkbox"] {
                    width: 16px; height: 16px; cursor: pointer;
                }
                .ml-no-data {
                    text-align: center; padding: 40px; color: #6c757d;
                }
                .ml-warning {
                    background: #fff3cd; border: 1px solid #ffc107;
                    border-radius: 6px; padding: 12px 16px;
                    color: #856404; font-size: 14px;
                    display: flex; align-items: center; gap: 8px;
                    margin-bottom: 16px;
                }
            `}</style>

            {/* Centered saving overlay */}
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
                                        <i className="ri-shield-star-line"></i>
                                        <span>Member Lavazam</span>
                                    </div>
                                    <div className="d-flex gap-2 align-items-center flex-wrap">
                                        {members.length > 0 && (
                                            <>
                                                <span className="badge badge-primary">
                                                    Total: {totalCount}
                                                </span>
                                                <span className="badge badge-secondary">
                                                    Paid: {checkedCount}
                                                </span>
                                            </>
                                        )}
                                        {permissions.canAdd && members.length > 0 && (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={handleSave}
                                                disabled={isSaving || !hasChanges || !lavazamInfo}
                                            >
                                                <i className="ri-save-line me-1"></i>Save Changes
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
                                            onChange={(opt) => {
                                                setSelectedTeam(opt);
                                            }}
                                            placeholder="Select Team..."
                                            isClearable
                                            isDisabled={isSaving}
                                            styles={{ container: (base) => ({ ...base, minWidth: '220px' }) }}
                                        />
                                    </div>

                                    <div className="ml-filter-group">
                                        <label>Lavazam Type <span className="text-danger">*</span></label>
                                        <Form.Select
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                            disabled={isSaving}
                                            style={{ minWidth: '160px' }}
                                        >
                                            <option value="">Select Type</option>
                                            {LAVAZAM_TYPE_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Form.Select>
                                    </div>

                                    {(isLoadingLavazam || lavazamInfo) && (
                                        <div className="ml-amount-group">
                                            <label>Amount</label>
                                            {isLoadingLavazam
                                                ? <div className="ml-amount-display">Loading...</div>
                                                : <div className="ml-amount-display">
                                                    ₹ {lavazamInfo ? Number(lavazamInfo.lavazam_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                                    {lavazamInfo?.resolved_team_id === 0 && (
                                                        <span style={{ fontSize: '11px', color: '#888', fontWeight: 'normal', marginLeft: '6px' }}>
                                                            (all teams)
                                                        </span>
                                                    )}
                                                </div>
                                            }
                                        </div>
                                    )}
                                </div>

                                {/* ---- WARNING (no lavazam configured) ---- */}
                                {lavazamWarning && (
                                    <div className="ml-warning">
                                        <i className="ri-error-warning-line"></i>
                                        {lavazamWarning}
                                    </div>
                                )}

                                {/* ---- MEMBER TABLE ---- */}
                                {!selectedTeam || !selectedType ? (
                                    <div className="ml-no-data">
                                        <i className="ri-group-line" style={{ fontSize: '48px' }}></i>
                                        <p className="mt-3">Select a team and lavazam type to view members</p>
                                    </div>
                                ) : isLoadingMembers ? (
                                    <div className="ml-no-data">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3">Loading members...</p>
                                    </div>
                                ) : !lavazamInfo ? null : members.length === 0 ? (
                                    <div className="ml-no-data">
                                        <i className="ri-inbox-line" style={{ fontSize: '48px' }}></i>
                                        <p className="mt-3">No members found for this team</p>
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
                                                    <th style={{ width: '120px' }}>ITS ID</th>
                                                    <th>Full Name</th>
                                                    <th style={{ width: '140px' }}>Mobile</th>
                                                    <th style={{ width: '70px' }}>Age</th>
                                                    <th style={{ width: '80px' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {members.map((member) => (
                                                    <tr
                                                        key={member.its_id}
                                                        className={member.isChecked ? 'is-paid' : ''}
                                                    >
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={member.isChecked}
                                                                onChange={() => handleToggleMember(member.its_id)}
                                                                disabled={isSaving || !permissions.canAdd}
                                                            />
                                                        </td>
                                                        <td>{member.its_id}</td>
                                                        <td>{member.full_name}</td>
                                                        <td>{member.mobile}</td>
                                                        <td>{member.age}</td>
                                                        <td>
                                                            {member.isChecked
                                                                ? <span className="badge bg-success" style={{ fontSize: '11px' }}>Paid</span>
                                                                : <span className="badge bg-secondary" style={{ fontSize: '11px' }}>Unpaid</span>
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
