import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { leaveAPI } from '../../services/api';

const LeaveStatus = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchLeaves = async () => {
    try {
      const data = await leaveAPI.getMine();
      setLeaves(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await leaveAPI.delete(deleteConfirm._id);
      setSuccess('Leave request cancelled');
      setDeleteConfirm(null);
      fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const filtered = leaves.filter((l) => {
    const matchStatus = filterStatus ? l.status === filterStatus : true;
    const matchType = filterType ? l.leaveType === filterType : true;
    return matchStatus && matchType;
  });

  return (
    <Layout pageTitle="My Leave Requests">
      <div className="page-header">
        <div>
          <h1>My Leaves</h1>
          <p>Track all your leave requests and their status</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/apply-leave')}>
          + Apply Leave
        </button>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="section-card">
        <div className="section-card-body">
          <div className="filter-bar">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="spinner spinner-lg"></div><p>Loading...</p></div>
        ) : (
          <div className="table-wrapper">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No leave requests found</h3>
                <p>Try adjusting filters or apply for a new leave</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/apply-leave')}>
                  Apply Leave
                </button>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Review Note</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((leave, idx) => (
                    <tr key={leave._id}>
                      <td>{idx + 1}</td>
                      <td style={{ textTransform: 'capitalize' }}>{leave.leaveType}</td>
                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>
                      <td>{leave.days}</td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leave.reason}</td>
                      <td><span className={`badge badge-${leave.status}`}>{leave.status}</span></td>
                      <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {leave.reviewNote || <span className="text-muted">—</span>}
                      </td>
                      <td>
                        {leave.status === 'pending' && (
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(leave)}>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Cancel Leave Request</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
              Are you sure you want to cancel your {deleteConfirm.leaveType} leave request from {formatDate(deleteConfirm.startDate)} to {formatDate(deleteConfirm.endDate)}?
            </p>
            <div className="review-modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>No, Keep it</button>
              <button className="btn btn-danger" style={{ background: 'var(--danger)', color: '#fff' }} onClick={handleDelete} disabled={actionLoading}>
                {actionLoading ? <><span className="spinner"></span></> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default LeaveStatus;
