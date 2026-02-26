import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../app/context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠', roles: ['employee', 'manager', 'admin'] },
  ];

  const leaveLinks = [
    { label: 'Apply for Leave', path: '/apply-leave', icon: '📝', roles: ['employee', 'manager'] },
    { label: 'My Leaves', path: '/leave-status', icon: '📋', roles: ['employee', 'manager'] },
    { label: 'Leave Approvals', path: '/leave-approvals', icon: '✅', roles: ['manager', 'admin'] },
  ];

  const reimbursementLinks = [
    { label: 'Apply Reimbursement', path: '/apply-reimbursement', icon: '💰', roles: ['employee', 'manager'] },
    { label: 'My Reimbursements', path: '/reimbursement-status', icon: '🧾', roles: ['employee', 'manager'] },
    { label: 'Reimbursement Approvals', path: '/reimbursement-approvals', icon: '💳', roles: ['manager', 'admin'] },
  ];

  const adminLinks = [
    { label: 'Employee Management', path: '/admin', icon: '👥', roles: ['admin'] },
  ];

  const renderLinks = (links) =>
    links
      .filter((link) => link.roles.includes(user?.role))
      .map((link) => (
        <div
          key={link.path}
          className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
          onClick={() => handleNav(link.path)}
        >
          <span className="icon">{link.icon}</span>
          {link.label}
        </div>
      ));

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📊</div>
          <div className="sidebar-logo-text">
            <strong>LeaveSync</strong>
            <span>HR Management</span>
          </div>
        </div>

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{user.role}</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Overview</div>
          {renderLinks(navLinks)}

          <div className="sidebar-section-label">Leave</div>
          {renderLinks(leaveLinks)}

          <div className="sidebar-section-label">Reimbursements</div>
          {renderLinks(reimbursementLinks)}

          {user?.role === 'admin' && (
            <>
              <div className="sidebar-section-label">Administration</div>
              {renderLinks(adminLinks)}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <span className="icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
