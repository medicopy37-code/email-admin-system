import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin APIs
export const adminLogin = (email, password) =>
  api.post('/admin/login', { email, password });

export const getEmailAccounts = () =>
  api.get('/admin/email-accounts');

export const addEmailAccount = (data) =>
  api.post('/admin/email-accounts', data);

export const deleteEmailAccount = (id) =>
  api.delete(`/admin/email-accounts/${id}`);

export const updateEmailAccountStatus = (id, status) =>
  api.patch(`/admin/email-accounts/${id}/status`, { status });

export const getDelegatedUsers = () =>
  api.get('/admin/users');

export const createDelegatedUser = (data) =>
  api.post('/admin/users', data);

export const updateDelegatedUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);

export const grantPermission = (data) =>
  api.post('/admin/permissions', data);

export const getUserPermissions = (userId) =>
  api.get(`/admin/permissions/user/${userId}`);

export const revokePermission = (id) =>
  api.delete(`/admin/permissions/${id}`);

export const getActivityLogs = () =>
  api.get('/admin/logs');

// User APIs
export const userLogin = (username, password) =>
  api.post('/user/login', { username, password });

export const getUserEmailAccounts = () =>
  api.get('/user/email-accounts');

export const getEmails = (accountId, folder = 'INBOX') =>
  api.get(`/user/emails/${accountId}?folder=${encodeURIComponent(folder)}`);

export const sendEmail = (accountId, data) =>
  api.post(`/user/send/${accountId}`, data);

export default api;
