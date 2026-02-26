import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from '../components/ProtectedRoute';

import EmployeeDashboard from '../pages/dashboards/EmployeeDashboard';
import ManagerDashboard from '../pages/dashboards/ManagerDashboard';
import AdminDashboard from '../pages/dashboards/AdminDashboard';

import ApplyLeave from '../pages/leaves/ApplyLeave';
import LeaveStatus from '../pages/leaves/LeaveStatus';
import LeaveApprovals from '../pages/leaves/LeaveApprovals';

import ApplyReimbursement from '../pages/reimbursements/ApplyReimbursement';
import ReimbursementStatus from '../pages/reimbursements/ReimbursementStatus';
import ReimbursementApprovals from '../pages/reimbursements/ReimbursementApprovals';


const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'manager') return <ManagerDashboard />;
  return <EmployeeDashboard />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route path="/dashboard" element={
      <ProtectedRoute><DashboardRedirect /></ProtectedRoute>
    } />

    <Route path="/apply-leave" element={
      <ProtectedRoute><ApplyLeave /></ProtectedRoute>
    } />
    <Route path="/leave-status" element={
      <ProtectedRoute><LeaveStatus /></ProtectedRoute>
    } />
    <Route path="/leave-approvals" element={
      <ProtectedRoute roles={['manager', 'admin']}><LeaveApprovals /></ProtectedRoute>
    } />

    <Route path="/apply-reimbursement" element={
      <ProtectedRoute><ApplyReimbursement /></ProtectedRoute>
    } />
    <Route path="/reimbursement-status" element={
      <ProtectedRoute><ReimbursementStatus /></ProtectedRoute>
    } />
    <Route path="/reimbursement-approvals" element={
      <ProtectedRoute roles={['manager', 'admin']}><ReimbursementApprovals /></ProtectedRoute>
    } />

    <Route path="/admin" element={
      <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
    } />

    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
