import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/context/AuthContext';
import Layout from '../../components/Layout';
import { leaveAPI, reimbursementAPI } from '../../services/api';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leavesData, reimburseData] = await Promise.all([
          leaveAPI.getAll(),
          reimbursementAPI.getAll(),
        ]);
        setLeaves(leavesData);
        setReimbursements(reimburseData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const leaveCounts = {
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
    total: leaves.length,
  };

  const reimburseCount = {
    pending: reimbursements.filter((r) => r.status === 'pending').length,
    approved: reimbursements.filter((r) => r.status === 'approved').length,
    total: reimbursements.length,
    totalApprovedAmount: reimbursements
      .filter((r) => r.status === 'approved')
      .reduce((sum, r) => sum + r.amount, 0),
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <Layout pageTitle="Dashboard">
      <div className="welcome-banner">
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
          <p>Here's your HR overview for today, {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="welcome-banner-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/apply-leave')}>📝 Apply Leave</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/apply-reimbursement')}>💰 Apply Reimbursement</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner spinner-lg"></div><p>Loading...</p></div>
      ) : (
        <>
          {/* Leave Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">📋</div>
              <div className="stat-info">
                <div className="stat-value">{leaveCounts.total}</div>
                <div className="stat-label">Total Leaves Applied</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon yellow">⏳</div>
              <div className="stat-info">
                <div className="stat-value">{leaveCounts.pending}</div>
                <div className="stat-label">Pending Leaves</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div className="stat-info">
                <div className="stat-value">{leaveCounts.approved}</div>
                <div className="stat-label">Approved Leaves</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red">❌</div>
              <div className="stat-info">
                <div className="stat-value">{leaveCounts.rejected}</div>
                <div className="stat-label">Rejected Leaves</div>
              </div>
            </div>
          </div>

          {/* Reimbursement Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon purple">🧾</div>
              <div className="stat-info">
                <div className="stat-value">{reimburseCount.total}</div>
                <div className="stat-label">Total Reimbursements</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon yellow">⏳</div>
              <div className="stat-info">
                <div className="stat-value">{reimburseCount.pending}</div>
                <div className="stat-label">Pending Claims</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">💵</div>
              <div className="stat-info">
                <div className="stat-value">₹{reimburseCount.totalApprovedAmount.toLocaleString()}</div>
                <div className="stat-label">Approved Amount</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div className="stat-info">
                <div className="stat-value">{reimburseCount.approved}</div>
                <div className="stat-label">Approved Claims</div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Leave Balance */}
            <div className="section-card">
              <div className="section-card-header">
                <h3>🏖️ Leave Balance</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/apply-leave')}>Apply Leave</button>
              </div>
              <div className="section-card-body">
                <div className="leave-balance-grid">
                  {['casual', 'sick', 'annual'].map((type) => (
                    <div className="leave-balance-item" key={type}>
                      <div className="leave-balance-value">{user?.leaveBalance?.[type] ?? '-'}</div>
                      <div className="leave-balance-label">{type}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="section-card">
              <div className="section-card-header">
                <h3>⚡ Quick Actions</h3>
              </div>
              <div className="section-card-body">
                <div className="quick-actions">
                  {[
                    { label: 'Apply Leave', icon: '📝', path: '/apply-leave' },
                    { label: 'Leave Status', icon: '📋', path: '/leave-status' },
                    { label: 'Apply Reimbursement', icon: '💰', path: '/apply-reimbursement' },
                    { label: 'Claim Status', icon: '🧾', path: '/reimbursement-status' },
                  ].map((action) => (
                    <button key={action.path} className="quick-action-btn" onClick={() => navigate(action.path)}>
                      <div className="quick-action-icon">{action.icon}</div>
                      <span className="quick-action-label">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Leaves */}
          <div className="section-card">
            <div className="section-card-header">
              <h3>📅 Recent Leave Requests</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/leave-status')}>View All</button>
            </div>
            <div className="table-wrapper">
              {leaves.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No leave requests yet</h3>
                  <p>Apply for a leave to get started</p>
                  <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/apply-leave')}>Apply Now</button>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Days</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.slice(0, 5).map((leave) => (
                      <tr key={leave._id}>
                        <td style={{ textTransform: 'capitalize' }}>{leave.leaveType}</td>
                        <td>{formatDate(leave.startDate)}</td>
                        <td>{formatDate(leave.endDate)}</td>
                        <td>{leave.days}</td>
                        <td><span className={`badge badge-${leave.status}`}>{leave.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recent Reimbursements */}
          <div className="section-card">
            <div className="section-card-header">
              <h3>💳 Recent Reimbursements</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/reimbursement-status')}>View All</button>
            </div>
            <div className="table-wrapper">
              {reimbursements.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💰</div>
                  <h3>No reimbursements yet</h3>
                  <p>Submit a reimbursement claim to get started</p>
                  <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/apply-reimbursement')}>Apply Now</button>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reimbursements.slice(0, 5).map((r) => (
                      <tr key={r._id}>
                        <td style={{ textTransform: 'capitalize' }}>{r.category}</td>
                        <td>₹{r.amount.toLocaleString()}</td>
                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                        <td>{formatDate(r.createdAt)}</td>
                        <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default EmployeeDashboard;
