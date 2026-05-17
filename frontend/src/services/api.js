import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Trends
  getTrendingArtists: (limit = 20, timeRange = '24h') =>
    apiClient.get('/trends/artists', { params: { limit, time_range: timeRange } }),

  getTrendingGenres: (limit = 10) =>
    apiClient.get('/trends/genres', { params: { limit } }),

  getTrendHistory: (artistName = null, hours = 24) =>
    apiClient.get('/trends/history', { params: { artist_name: artistName, hours } }),

  getTrendsSummary: (hours = 24) =>
    apiClient.get('/trends/summary', { params: { hours } }),

  // Artists
  getArtist: (artistId) =>
    apiClient.get(`/artists/${artistId}`),

  searchArtists: (query, limit = 10) =>
    apiClient.get('/artists/', { params: { query, limit } }),

  getArtistTrends: (artistId, limit = 50) =>
    apiClient.get(`/artists/${artistId}/trends`, { params: { limit } }),

  // Analytics
  getSentimentTrends: (hours = 24) =>
    apiClient.get('/analytics/sentiment', { params: { hours } }),

  getAnomalies: (limit = 20, dismissed = false) =>
    apiClient.get('/analytics/anomalies', { params: { limit, dismissed } }),

  acknowledgeAnomaly: (anomalyId) =>
    apiClient.post(`/analytics/anomalies/${anomalyId}/acknowledge`),

  dismissAnomaly: (anomalyId) =>
    apiClient.post(`/analytics/anomalies/${anomalyId}/dismiss`),

  getEngagementMetrics: (hours = 24) =>
    apiClient.get('/analytics/engagement', { params: { hours } }),

  // System
  getSystemStats: () =>
    apiClient.get('/stats'),

  getHealth: () =>
    apiClient.get('/health', { baseURL: import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000' }),
};

export default api;
