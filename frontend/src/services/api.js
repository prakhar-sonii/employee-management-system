const BASE_URL = '/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};


export const authAPI = {
  register: (data) =>
    fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  login: (data) =>
    fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, { headers: headers() }).then(handleResponse),
};


export const leaveAPI = {
  apply: (data) =>
    fetch(`${BASE_URL}/leaves`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  getAll: () =>
    fetch(`${BASE_URL}/leaves`, { headers: headers() }).then(handleResponse),
  getMine: () =>
    fetch(`${BASE_URL}/leaves?mine=true`, { headers: headers() }).then(handleResponse),
  getForApproval: () =>
    fetch(`${BASE_URL}/leaves?forApproval=true`, { headers: headers() }).then(handleResponse),
  review: (id, data) =>
    fetch(`${BASE_URL}/leaves/${id}/review`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  delete: (id) =>
    fetch(`${BASE_URL}/leaves/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse),
};


export const reimbursementAPI = {
  apply: (data) =>
    fetch(`${BASE_URL}/reimbursements`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  getAll: () =>
    fetch(`${BASE_URL}/reimbursements`, { headers: headers() }).then(handleResponse),
  getMine: () =>
    fetch(`${BASE_URL}/reimbursements?mine=true`, { headers: headers() }).then(handleResponse),
  getForApproval: () =>
    fetch(`${BASE_URL}/reimbursements?forApproval=true`, { headers: headers() }).then(handleResponse),
  review: (id, data) =>
    fetch(`${BASE_URL}/reimbursements/${id}/review`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  delete: (id) =>
    fetch(`${BASE_URL}/reimbursements/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse),
};


export const adminAPI = {
  getUsers: () =>
    fetch(`${BASE_URL}/admin/users`, { headers: headers() }).then(handleResponse),
  updateRole: (id, role) =>
    fetch(`${BASE_URL}/admin/users/${id}/role`, { method: 'PUT', headers: headers(), body: JSON.stringify({ role }) }).then(handleResponse),
  updateDepartment: (id, department) =>
    fetch(`${BASE_URL}/admin/users/${id}/department`, { method: 'PUT', headers: headers(), body: JSON.stringify({ department }) }).then(handleResponse),
  deleteUser: (id) =>
    fetch(`${BASE_URL}/admin/users/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse),
};
