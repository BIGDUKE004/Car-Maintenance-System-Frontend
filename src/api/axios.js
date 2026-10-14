import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('motora_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !String(error.config?.url || '').includes('/auth/login')) {
      localStorage.removeItem('motora_token');
      window.dispatchEvent(new Event('motora:session-expired'));
    }
    return Promise.reject(error);
  },
);

export function readableError(error) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((item) => `${item.loc?.slice(-1)[0] || 'Field'}: ${item.msg}`).join(' · ');
  if (typeof detail === 'string') return detail;
  if (error?.code === 'ECONNABORTED') return 'The request took too long. Please try again.';
  if (!error?.response) return 'Could not reach the server. Check that the backend is running and the API URL is correct.';
  return error.response.status >= 500 ? 'Something went wrong on the server. Please try again shortly.' : 'The request could not be completed.';
}
