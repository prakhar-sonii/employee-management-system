import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { reimbursementAPI } from '../../services/api';

const CATEGORIES = ['travel', 'food', 'accommodation', 'equipment', 'medical', 'other'];

const ApplyReimbursement = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ amount: '', category: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.description) {
      setError('Please fill in all fields');
      return;
    }
    if (isNaN(form.amount) || Number(form.amount) <= 0) {
      setError('Amount must be a positive number');
      return;
    }
    setLoading(true);
    try {
      await reimbursementAPI.apply(form);
      setSuccess('Reimbursement request submitted successfully!');
      setTimeout(() => navigate('/reimbursement-status'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout pageTitle="Apply for Reimbursement">
      <div className="page-header">
        <div>
          <h1>Apply for Reimbursement</h1>
          <p>Submit an expense reimbursement claim</p>
        </div>
      </div>

      <div className="form-container">
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Amount (₹) <span className="required">*</span></label>
              <input
                type="number"
                name="amount"
                className="form-input"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
                min="1"
                step="0.01"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category <span className="required">*</span></label>
              <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} style={{ textTransform: 'capitalize' }}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label">Description <span className="required">*</span></label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="Describe the expense in detail (purpose, date of expense, etc.)..."
              value={form.description}
              onChange={handleChange}
              rows={5}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/reimbursement-status')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"></span> Submitting...</> : '💰 Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ApplyReimbursement;
