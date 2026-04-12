import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ── Request interceptor: attach Bearer token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor 1: handle 401 with token refresh ─────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue concurrent requests while a refresh is in progress
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }

      try {
        // Use a raw axios call to avoid triggering this interceptor again
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken: string = data.access_token;
        const newRefreshToken: string = data.refresh_token;

        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('refresh_token', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ── Response interceptor 2: Global error toasts ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    // Skip toast for 401 as it's handled by the refresh interceptor
    // Also skip if it's a cancellation error
    if (error.response?.status === 401 || axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    // Build error message
    let message = 'An unexpected error occurred';
    if (typeof detail === 'string') {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = detail.map((d: any) => d.msg).join('. ');
    } else if (status === 403) {
      message = 'You do not have permission to perform this action';
    } else if (status === 404) {
      message = 'Resource not found';
    } else if (status >= 500) {
      message = 'Server error, please try again later';
    } else if (!status) {
      message = 'Network error, please check your connection';
    }

    // Only show toast if not specifically suppressed in request config
    if (!error.config?._quiet) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
