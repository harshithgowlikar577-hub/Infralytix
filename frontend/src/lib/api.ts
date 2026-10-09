import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor — inject JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('infralytix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('infralytix_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/refresh', {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token: newRefresh } = res.data;
          localStorage.setItem('infralytix_token', access_token);
          if (newRefresh) localStorage.setItem('infralytix_refresh_token', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('infralytix_token');
          localStorage.removeItem('infralytix_refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// =========================================================================
// API Service Functions — mapped to all 41 backend endpoints
// =========================================================================

// --- Auth ---
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; full_name: string; ministry?: string; role?: string }) =>
    api.post('/auth/register', data),
  refresh: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }),
  me: () => api.get('/auth/me'),
};

// --- Projects ---
export const projectsAPI = {
  list: (params?: {
    search?: string; ministry?: string; sector?: string;
    state?: string; status?: string; risk_level?: string;
    page?: number; limit?: number;
  }) => api.get('/projects', { params }),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: Record<string, unknown>) => api.post('/projects', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// --- Analytics ---
export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
  executive: () => api.get('/analytics/executive'),
  ministry: () => api.get('/analytics/ministry'),
  state: () => api.get('/analytics/state'),
  sector: () => api.get('/analytics/sector'),
  risk: () => api.get('/analytics/risk'),
};

// --- Health ---
export const healthAPI = {
  get: (projectId: string) => api.get(`/analytics/health/${projectId}`),
};

// --- Risk ---
export const riskAPI = {
  get: (projectId: string) => api.get(`/risk/${projectId}`),
};

// --- ML Predictions ---
export const mlAPI = {
  predictCost: (data: Record<string, unknown>) => api.post('/ml/cost/predict', data),
  predictDelay: (data: Record<string, unknown>) => api.post('/ml/delay/predict', data),
  trainCost: () => api.post('/ml/train/cost'),
  trainDelay: () => api.post('/ml/train/delay'),
  status: () => api.get('/ml/status'),
};

// --- Early Warning ---
export const warningAPI = {
  get: (projectId: string) => api.get(`/warning/${projectId}`),
  portfolioPredictive: (limitPerQueue = 20) =>
    api.get('/warning/portfolio/predictive', { params: { limit_per_queue: limitPerQueue } }),
};


// --- Similarity ---
export const similarityAPI = {
  get: (projectId: string, topK = 4) =>
    api.get(`/similarity/${projectId}`, { params: { top_k: topK } }),
};

// --- Intervention ---
export const interventionAPI = {
  get: (projectId: string) => api.get(`/intervention/${projectId}`),
  execute: (data: { project_id: string; intervention_type: string; description: string; applied_parameters?: Record<string, unknown> }) =>
    api.post('/intervention/execute', data),
};

// --- Simulation ---
export const simulationAPI = {
  run: (data: {
    project_id: string; manpower_boost_pct?: number; budget_increase_pct?: number;
    procurement_delay_removed?: boolean; milestones_expedited_count?: number; efficiency_gain_pct?: number;
  }) => api.post('/simulation/run', data),
  explain: (data: {
    project_id: string; manpower_boost_pct?: number; budget_increase_pct?: number;
    procurement_delay_removed?: boolean; milestones_expedited_count?: number; efficiency_gain_pct?: number;
  }) => api.post('/simulation/explain', data),
};


// --- Ingestion ---
export const ingestionAPI = {
  upload: (file: File, datasetType = 'auto') => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/ingestion/upload?dataset_type=${datasetType}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMilestones: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/ingestion/upload/milestones', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadObservations: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/ingestion/upload/observations', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadDependencies: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/ingestion/upload/dependencies', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  report: (datasetId: string) => api.get(`/ingestion/report/${datasetId}`),
};

// --- Notifications ---
export const notificationsAPI = {
  list: (params?: { unread_only?: boolean; warning_level?: string; page?: number; limit?: number }) =>
    api.get('/notifications', { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  dismiss: (id: string) => api.delete(`/notifications/${id}`),
};

// --- Copilot ---
export const copilotAPI = {
  query: (payload: { query: string; project_id?: string; conversation_history?: any[] }) =>
    api.post('/copilot/query', payload),
};

