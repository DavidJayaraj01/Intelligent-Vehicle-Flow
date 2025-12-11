/**
 * API client for Vehicle Flow Analyzer backend
 */

import axios, { type AxiosInstance } from 'axios';
import { getApiKey } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization interceptor
apiClient.interceptors.request.use(
  (config) => {
    const apiKey = getApiKey();
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API Methods

export const postEvents = async (data: any) => {
  return apiClient.post('/api/v1/events/', data);
};

export const getEvents = async (params?: any) => {
  return apiClient.get('/api/v1/events/', { params });
};

export const getMetrics = async (params?: any) => {
  return apiClient.get('/api/v1/metrics/', { params });
};

export const getMetricsTimeSeries = async (params?: any) => {
  return apiClient.get('/api/v1/metrics/timeseries', { params });
};

export const getTracks = async (trackId: string, cameraId?: string) => {
  return apiClient.get('/api/v1/tracks/', {
    params: { track_id: trackId, camera_id: cameraId },
  });
};

export const listTracks = async (params?: any) => {
  return apiClient.get('/api/v1/tracks/list', { params });
};

export const postAction = async (data: any) => {
  return apiClient.post('/api/v1/actions/', data);
};

export const getActions = async (params?: any) => {
  return apiClient.get('/api/v1/actions/', { params });
};

export const getActionStats = async (cameraId?: string) => {
  return apiClient.get('/api/v1/actions/stats', {
    params: cameraId ? { camera_id: cameraId } : {},
  });
};

export const checkHealth = async () => {
  return apiClient.get('/health');
};

export default apiClient;
