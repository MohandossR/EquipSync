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

  // =========================
  // AUTHENTICATION
  // =========================

  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    return response.data;
  },

  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },


  // =========================
  // SERVICE REQUESTS
  // =========================

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
    const response = await api.put(
      `/requests/${requestId}/status`,
      {
        status,
        reason,
      }
    );

    return response.data;
  },

  async approveRequest(requestId) {
    const response = await api.post(
      `/requests/${requestId}/approve`
    );

    return response.data;
  },


  // =========================
  // TECHNICIAN
  // =========================

  async getAssignedJobs() {
    const response = await api.get('/technicians/me/jobs');
    return response.data;
  },

  async updateTechnicianJobStatus(requestId, status) {
    const response = await api.put(
      `/technicians/jobs/${requestId}/status`,
      null,
      {
        params: {
          status,
        },
      }
    );

    return response.data;
  },


  // =========================
  // DASHBOARD
  // =========================

  async getDashboardSummary() {
    const response = await api.get(
      '/dashboard/summary',
      {
        skipAuth: true,
      }
    );

    return response.data;
  },

  async getDashboardSla() {
    const response = await api.get(
      '/dashboard/sla',
      {
        skipAuth: true,
      }
    );

    return response.data;
  },


  // =========================
  // NOTIFICATIONS
  // =========================

  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  },

  async markNotificationRead(id) {
    const response = await api.post(
      `/notifications/${id}/read`
    );

    return response.data;
  },

  async markAllNotificationsRead() {
    const response = await api.post(
      '/notifications/read-all'
    );

    return response.data;
  },


  // =========================
  // ASSIGNMENTS
  // =========================

  async acceptAssignment(assignmentId) {
    const response = await api.post(
      `/assignments/${assignmentId}/accept`
    );

    return response.data;
  },

  async rejectAssignment(assignmentId, reason) {
    const response = await api.post(
      `/assignments/${assignmentId}/reject`,
      {
        reason,
      }
    );

    return response.data;
  },


  // =========================
  // SMART DISPATCH
  // =========================

  async getTechnicianRanking(requestId) {
    const response = await api.get(
      `/smart/technicians/${requestId}/ranking`
    );

    return response.data;
  },

  async autoAssign(requestId) {
    const response = await api.post(
      `/smart/technicians/${requestId}/auto-assign`
    );

    return response.data;
  },


  // =========================
  // AI ASSISTANT
  // =========================

  async assistantChat(message) {
    const response = await api.post(
      '/assistant/chat',
      {
        message,
      }
    );

    return response.data;
  },

};