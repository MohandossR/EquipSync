import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const apiService = {
  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    return response.data;
  },

  async createRequest(data) {
    const response = await api.post('/requests', data);
    return response.data;
  },

  async getCustomerRequests() {
    const response = await api.get('/requests');
    return response.data;
  },

  async getJobDetail(requestId) {
    const response = await api.get(`/requests/${requestId}`);
    return response.data;
  },

  async updateJobStatus(requestId, status, reason = '') {
    const response = await api.put(`/requests/${requestId}/status`, {
      status,
      reason,
    });

    return response.data;
  },

  async approveRequest(requestId) {
    const response = await api.post(`/requests/${requestId}/approve`);
    return response.data;
  },

  async getAssignedJobs(technicianId) {
    const response = await api.get(`/technicians/me/jobs`);
    return response.data;
  },

  async getDashboardSummary() {
    const response = await api.get('/dashboard/summary', {
      skipAuth: true,
    });

    return response.data;
  },


  async getDashboardSla() {
    const response = await api.get('/dashboard/sla', {
      skipAuth: true,
    });

    return response.data;
  },
};