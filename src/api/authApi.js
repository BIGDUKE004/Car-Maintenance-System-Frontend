import { api } from './axios';
export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  verifyEmail: (token) => api.get('/auth/verify-email', { params: { token } }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, new_password) => api.post('/auth/reset-password', { token, new_password }),
};
