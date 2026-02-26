import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../app/context/AuthContext';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Product', 'Legal', 'General'];

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleUpdate = async () => {
    setActionLoading(true);
    setError('');
    try {
      await adminAPI.updateRole(editModal._id, editModal.role);
      if (editModal.department !== editModal.originalDept) {
        await adminAPI.updateDepartment(editModal._id, editModal.department);
      }
      setSuccess('User updated successfully');
      setEditModal(null);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await adminAPI.deleteUser(deleteConfirm._id);
      setSuccess('User deleted successfully');
      setDeleteConfirm(null);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    if (u.role === 'admin') return false; 
    const matchName = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole ? u.role === filterRole : true;
    return matchName && matchRole;
  });

  const roleCounts = {
    manager: users.filter((u) => u.role === 'manager').length,
    employee: users.filter((u) => u.role === 'employee').length,
  };
  const nonAdminCount = users.filter((u) => u.role !== 'admin').length;

  return (
    <Layout pageTitle="Admin Panel – Employee Management">
      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div className="stat-info">
            <div className="stat-value">{nonAdminCount}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">👔</div>
          <div className="stat-info">
            <div className="stat-value">{roleCounts.manager}</div>
            <div className="stat-label">Managers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👤</div>
          <div className="stat-info">
            <div className="stat-value">{roleCounts.employee}</div>
            <div className="stat-label">Employees</div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <h3>👥 All Users</h3>
        </div>
        <div className="section-card-body">
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="">All Roles</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="spinner spinner-lg"></div><p>Loading users...</p></div>
        ) : (
          <div className="table-wrapper">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No users found</h3>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <strong>{u.name}</strong>
                          {u._id === currentUser?._id && <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>(you)</span>}
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.department}</td>
                      <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                      <td>{new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>
                        {u._id !== currentUser?._id ? (
                          <div className="table-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditModal({ ...u, originalDept: u.department })}>
                              ✏️ Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(u)}>
                              Fire
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
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

      {}
      {editModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit User: {editModal.name}</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={editModal.role}
                onChange={(e) => setEditModal({ ...editModal, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={editModal.department}
                onChange={(e) => setEditModal({ ...editModal, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="review-modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRoleUpdate} disabled={actionLoading}>
                {actionLoading ? <><span className="spinner"></span> Saving...</> : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Fire Employee</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
              Are you sure you want to fire <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="review-modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger btn-primary" style={{ background: 'var(--danger)', color: '#fff' }} onClick={handleDelete} disabled={actionLoading}>
                {actionLoading ? <><span className="spinner"></span> Firing...</> : 'Yes, Fire'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
