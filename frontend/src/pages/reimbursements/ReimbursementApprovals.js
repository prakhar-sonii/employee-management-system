import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { reimbursementAPI } from '../../services/api';

const ReimbursementApprovals = () => {
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const data = await reimbursementAPI.getForApproval();
      setReimbursements(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const submitReview = async (status) => {
    setActionLoading(true);
    setError('');
    try {
      await reimbursementAPI.review(reviewModal._id, { status, reviewNote });
      setSuccess(`Reimbursement ${status} successfully`);
      setReviewModal(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const filtered = filterStatus ? reimbursements.filter((r) => r.status === filterStatus) : reimbursements;

  return (
    <Layout pageTitle="Reimbursement Approvals">
      <div className="page-header">
        <div>
          <h1>Reimbursement Approvals</h1>
          <p>Review and manage employee reimbursement claims</p>
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
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <strong>{r.employee?.name}</strong>
                        <br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{r.employee?.department}</span>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{r.category}</td>
                      <td><strong>₹{r.amount.toLocaleString()}</strong></td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                      <td>{formatDate(r.createdAt)}</td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      <td>
                        {r.status === 'pending' ? (
                          <button className="btn btn-primary btn-sm" onClick={() => { setReviewModal(r); setReviewNote(''); }}>
                            Review
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{r.reviewedBy?.name || '—'}</span>
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
              <h3>Review Reimbursement</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.25rem' }}>
              <p><strong>Employee:</strong> {reviewModal.employee?.name}</p>
              <p><strong>Category:</strong> <span style={{ textTransform: 'capitalize' }}>{reviewModal.category}</span></p>
              <p><strong>Amount:</strong> ₹{reviewModal.amount?.toLocaleString()}</p>
              <p><strong>Description:</strong> {reviewModal.description}</p>
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

export default ReimbursementApprovals;
