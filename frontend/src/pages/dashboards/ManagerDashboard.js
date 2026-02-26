import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { leaveAPI, reimbursementAPI } from '../../services/api';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [leavesData, reimburseData] = await Promise.all([
        leaveAPI.getForApproval(),
        reimbursementAPI.getForApproval(),
      ]);
      setLeaves(leavesData);
      setReimbursements(reimburseData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleReview = (item, type) => {
    setReviewModal({ ...item, type });
    setReviewNote('');
    setError('');
  };

  const submitReview = async (status) => {
    setActionLoading(true);
    setError('');
    try {
      if (reviewModal.type === 'leave') {
        await leaveAPI.review(reviewModal._id, { status, reviewNote });
      } else {
        await reimbursementAPI.review(reviewModal._id, { status, reviewNote });
      }
      setSuccess(`Request ${status} successfully`);
      setReviewModal(null);
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === 'pending');
  const pendingReimbursements = reimbursements.filter((r) => r.status === 'pending');
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <Layout pageTitle="Manager Dashboard">
      {success && <div className="alert alert-success">✅ {success}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon yellow">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{pendingLeaves.length}</div>
            <div className="stat-label">Pending Leave Requests</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">💳</div>
          <div className="stat-info">
            <div className="stat-value">{pendingReimbursements.length}</div>
            <div className="stat-label">Pending Reimbursements</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <div className="stat-value">{leaves.filter((l) => l.status === 'approved').length}</div>
            <div className="stat-label">Leaves Approved</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">💵</div>
          <div className="stat-info">
            <div className="stat-value">₹{reimbursements.filter(r => r.status === 'approved').reduce((s, r) => s + r.amount, 0).toLocaleString()}</div>
            <div className="stat-label">Reimbursements Approved</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner spinner-lg"></div><p>Loading requests...</p></div>
      ) : (
        <>
          {}
          <div className="section-card">
            <div className="section-card-header">
              <h3>📋 Pending Leave Requests</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/leave-approvals')}>View All</button>
            </div>
            <div className="table-wrapper">
              {pendingLeaves.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <h3>All caught up!</h3>
                  <p>No pending leave requests</p>
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLeaves.slice(0, 5).map((leave) => (
                      <tr key={leave._id}>
                        <td><strong>{leave.employee?.name}</strong></td>
                        <td>{leave.employee?.department}</td>
                        <td style={{ textTransform: 'capitalize' }}>{leave.leaveType}</td>
                        <td>{formatDate(leave.startDate)}</td>
                        <td>{formatDate(leave.endDate)}</td>
                        <td>{leave.days}</td>
                        <td>
                          <div className="table-actions">
                            <button className="btn btn-success btn-sm" onClick={() => handleReview(leave, 'leave')}>Review</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {}
          <div className="section-card">
            <div className="section-card-header">
              <h3>💰 Pending Reimbursement Requests</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/reimbursement-approvals')}>View All</button>
            </div>
            <div className="table-wrapper">
              {pendingReimbursements.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <h3>All caught up!</h3>
                  <p>No pending reimbursement requests</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingReimbursements.slice(0, 5).map((r) => (
                      <tr key={r._id}>
                        <td><strong>{r.employee?.name}</strong></td>
                        <td style={{ textTransform: 'capitalize' }}>{r.category}</td>
                        <td>₹{r.amount.toLocaleString()}</td>
                        <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                        <td>{formatDate(r.createdAt)}</td>
                        <td>
                          <div className="table-actions">
                            <button className="btn btn-success btn-sm" onClick={() => handleReview(r, 'reimbursement')}>Review</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {}
      {reviewModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Review {reviewModal.type === 'leave' ? 'Leave' : 'Reimbursement'} Request</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>

            <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.25rem' }}>
              <p><strong>Employee:</strong> {reviewModal.employee?.name}</p>
              {reviewModal.type === 'leave' ? (
                <>
                  <p><strong>Leave Type:</strong> {reviewModal.leaveType}</p>
                  <p><strong>Duration:</strong> {formatDate(reviewModal.startDate)} – {formatDate(reviewModal.endDate)} ({reviewModal.days} days)</p>
                  <p><strong>Reason:</strong> {reviewModal.reason}</p>
                </>
              ) : (
                <>
                  <p><strong>Category:</strong> {reviewModal.category}</p>
                  <p><strong>Amount:</strong> ₹{reviewModal.amount?.toLocaleString()}</p>
                  <p><strong>Description:</strong> {reviewModal.description}</p>
                </>
              )}
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="form-group">
              <label className="form-label">Review Note (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Add a note for the employee..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className="review-modal-actions">
              <button className="btn btn-secondary" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => submitReview('rejected')} disabled={actionLoading}>
                {actionLoading ? <span className="spinner"></span> : '✕'} Reject
              </button>
              <button className="btn btn-success" onClick={() => submitReview('approved')} disabled={actionLoading}>
                {actionLoading ? <span className="spinner"></span> : '✓'} Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ManagerDashboard;
