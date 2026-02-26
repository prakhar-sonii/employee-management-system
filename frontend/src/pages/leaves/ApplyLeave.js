import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { leaveAPI } from '../../services/api';
import { useAuth } from '../../app/context/AuthContext';

const ApplyLeave = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ leaveType: '', startDate: '', endDate: '', reason: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.leaveType || !form.startDate || !form.endDate || !form.reason) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await leaveAPI.apply(form);
      setSuccess('Leave request submitted successfully!');
      setTimeout(() => navigate('/leave-status'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Layout pageTitle="Apply for Leave">
      <div className="page-header">
        <div>
          <h1>Apply for Leave</h1>
          <p>Submit a new leave request for approval</p>
        </div>
      </div>

      <div className="form-container">
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        {}
        {user?.leaveBalance && (
          <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem' }}>AVAILABLE BALANCE</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['casual', 'sick', 'annual'].map((type) => (
                <div key={type} style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>{user.leaveBalance[type]}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', textTransform: 'capitalize' }}>{type}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Leave Type <span className="required">*</span></label>
            <select name="leaveType" className="form-select" value={form.leaveType} onChange={handleChange}>
              <option value="">Select leave type</option>
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="annual">Annual Leave</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Start Date <span className="required">*</span></label>
              <input
                type="date"
                name="startDate"
                className="form-input"
                value={form.startDate}
                onChange={handleChange}
                min={today}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">End Date <span className="required">*</span></label>
              <input
                type="date"
                name="endDate"
                className="form-input"
                value={form.endDate}
                onChange={handleChange}
                min={form.startDate || today}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label">Reason <span className="required">*</span></label>
            <textarea
              name="reason"
              className="form-textarea"
              placeholder="Please describe the reason for your leave..."
              value={form.reason}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/leave-status')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"></span> Submitting...</> : '📤 Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ApplyLeave;
