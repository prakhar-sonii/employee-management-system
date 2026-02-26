import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { leaveAPI } from '../../services/api';

const LeaveApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLeaves = async () => {
    try {
      const data = await leaveAPI.getForApproval();
      setLeaves(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const submitReview = async (status) => {
    setActionLoading(true);
    setError('');
    try {
      await leaveAPI.review(reviewModal._id, { status, reviewNote });
      setSuccess(`Leave ${status} successfully`);
      setReviewModal(null);
      fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const filtered = filterStatus ? leaves.filter((l) => l.status === filterStatus) : leaves;

  return (
    <Layout pageTitle="Leave Approvals">
      <div className="page-header">
        <div>
          <h1>Leave Approvals</h1>
          <p>Review and manage employee leave requests</p>
        </div>
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
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="spinner spinner-lg"></div><p>Loading...</p></div>
        ) : (
          <div className="table-wrapper">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <h3>No {filterStatus} requests</h3>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Dept</th>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((leave) => (
                    <tr key={leave._id}>
                      <td><strong>{leave.employee?.name}</strong><br /><span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{leave.employee?.email}</span></td>
                      <td>{leave.employee?.department}</td>
                      <td style={{ textTransform: 'capitalize' }}>{leave.leaveType}</td>
                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>
                      <td>{leave.days}</td>
                      <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leave.reason}</td>
                      <td><span className={`badge badge-${leave.status}`}>{leave.status}</span></td>
                      <td>
                        {leave.status === 'pending' ? (
                          <button className="btn btn-primary btn-sm" onClick={() => { setReviewModal(leave); setReviewNote(''); }}>
                            Review
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{leave.reviewedBy?.name || '—'}</span>
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

      {reviewModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Review Leave Request</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.25rem' }}>
              <p><strong>Employee:</strong> {reviewModal.employee?.name}</p>
              <p><strong>Leave Type:</strong> <span style={{ textTransform: 'capitalize' }}>{reviewModal.leaveType}</span></p>
              <p><strong>Duration:</strong> {formatDate(reviewModal.startDate)} – {formatDate(reviewModal.endDate)} ({reviewModal.days} days)</p>
              <p><strong>Reason:</strong> {reviewModal.reason}</p>
            </div>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <div className="form-group">
              <label className="form-label">Review Note (optional)</label>
              <textarea className="form-textarea" placeholder="Add a note for the employee..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={3} />
            </div>
            <div className="review-modal-actions">
              <button className="btn btn-secondary" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => submitReview('rejected')} disabled={actionLoading}>✕ Reject</button>
              <button className="btn btn-success" onClick={() => submitReview('approved')} disabled={actionLoading}>✓ Approve</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default LeaveApprovals;
