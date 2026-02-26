import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { reimbursementAPI } from '../../services/api';

const ReimbursementStatus = () => {
  const navigate = useNavigate();
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchReimbursements = async () => {
    try {
      const data = await reimbursementAPI.getMine();
      setReimbursements(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReimbursements(); }, []);

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await reimbursementAPI.delete(deleteConfirm._id);
      setSuccess('Reimbursement claim cancelled');
      setDeleteConfirm(null);
      fetchReimbursements();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const filtered = reimbursements.filter((r) => {
    const matchStatus = filterStatus ? r.status === filterStatus : true;
    const matchCat = filterCategory ? r.category === filterCategory : true;
    return matchStatus && matchCat;
  });

  const totalApproved = reimbursements
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <Layout pageTitle="My Reimbursements">
      <div className="page-header">
        <div>
          <h1>My Reimbursements</h1>
          <p>Track all your reimbursement claims</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/apply-reimbursement')}>
          + New Claim
        </button>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon blue">🧾</div>
          <div className="stat-info">
            <div className="stat-value">{reimbursements.length}</div>
            <div className="stat-label">Total Claims</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{reimbursements.filter((r) => r.status === 'pending').length}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">💵</div>
          <div className="stat-info">
            <div className="stat-value">₹{totalApproved.toLocaleString()}</div>
            <div className="stat-label">Approved Amount</div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-card-body">
          <div className="filter-bar">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="travel">Travel</option>
              <option value="food">Food</option>
              <option value="accommodation">Accommodation</option>
              <option value="equipment">Equipment</option>
              <option value="medical">Medical</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="spinner spinner-lg"></div><p>Loading...</p></div>
        ) : (
          <div className="table-wrapper">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💰</div>
                <h3>No reimbursements found</h3>
                <p>Try adjusting filters or submit a new claim</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/apply-reimbursement')}>
                  New Claim
                </button>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Review Note</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => (
                    <tr key={r._id}>
                      <td>{idx + 1}</td>
                      <td style={{ textTransform: 'capitalize' }}>{r.category}</td>
                      <td><strong>₹{r.amount.toLocaleString()}</strong></td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                      <td>{formatDate(r.createdAt)}</td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.reviewNote || <span className="text-muted">—</span>}
                      </td>
                      <td>
                        {r.status === 'pending' && (
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(r)}>
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
              <h3>Cancel Reimbursement</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
              Are you sure you want to cancel your {deleteConfirm.category} reimbursement claim of ₹{deleteConfirm.amount?.toLocaleString()}?
            </p>
            <div className="review-modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Keep it</button>
              <button className="btn btn-danger" style={{ background: 'var(--danger)', color: '#fff' }} onClick={handleDelete} disabled={actionLoading}>
                {actionLoading ? <span className="spinner"></span> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ReimbursementStatus;
