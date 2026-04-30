import axios from 'axios';

// Use proxy in development, fallback to env var or production
const isDev = import.meta.env.DEV;
const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const fallbackApiUrl = 'https://aura-health1.onrender.com';
const runningOnLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const shouldAvoidLocalApi =
  !runningOnLocalhost &&
  configuredApiUrl &&
  /localhost|127\.0\.0\.1/i.test(configuredApiUrl);

const BACKEND_URL = isDev
  ? ''
  : shouldAvoidLocalApi
    ? fallbackApiUrl
    : (configuredApiUrl || fallbackApiUrl);

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
  timeout: 60000,
});

// Attach Bearer token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

const clearAuth = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Don't intercept auth routes or already retried requests
    if (!error.response || original._retry || original.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }).catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BACKEND_URL}/api/auth/refresh`, { refreshToken });
        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;
        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
        processQueue(null, newAccessToken);
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);
      } catch {
        processQueue(new Error('Refresh failed'));
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response.status === 403) {
      clearAuth();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
