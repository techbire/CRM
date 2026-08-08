import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||  // set in production (.env.production / Vercel env)
  'http://localhost:5000/api';         // fallback for local dev

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token missing or expired — force re-login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    // 403 = authenticated but not authorized for this role
    // Let it propagate so UI can show a proper access-denied message
    return Promise.reject(error);
  }
);

export default api;
