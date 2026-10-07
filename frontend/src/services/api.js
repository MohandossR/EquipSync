import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Fallback state for local browser demo
let mockRequests = [
  {
    id: 'REQ-101',
    machine_id: 'M-104',
    site_name: 'Site A - Chennai Plant',
    description: 'Urgent hydraulic pump failure and pressure leak.',
    priority: 'HIGH',
    status: 'ASSIGNED',
    created_at: '2026-10-07 09:30 AM',
    required_parts: ['Hydraulic Seal Kit', 'Pressure Valve V2'],
    assigned_technician_id: 'TECH-01',
    logs: [{ timestamp: '2026-10-07 10:00 AM', note: 'Assigned to Technician Harini' }],
  },
];

export const apiService = {
  // Technician API
  async getAssignedJobs(technicianId) {
    try {
      const res = await api.get(`/technicians/${technicianId}/jobs`);
      return res.data;
    } catch {
      return mockRequests.filter((req) => req.assigned_technician_id === technicianId);
    }
  },

  async getJobDetail(jobId) {
    try {
      const res = await api.get(`/requests/${jobId}`);
      return res.data;
    } catch {
      return mockRequests.find((req) => req.id === jobId);
    }
  },

  async updateJobStatus(jobId, status, payload = {}) {
    try {
      const res = await api.put(`/requests/${jobId}/status`, { status, ...payload });
      return res.data;
    } catch {
      const job = mockRequests.find((req) => req.id === jobId);
      if (job) {
        job.status = status;
        if (payload.log) {
          job.logs.push({ timestamp: new Date().toLocaleString(), note: payload.log });
        }
        if (payload.evidence) job.evidence = payload.evidence;
      }
      return job;
    }
  },

  async addServiceLog(jobId, note) {
    try {
      const res = await api.post(`/service/${jobId}/logs`, { note });
      return res.data;
    } catch {
      const job = mockRequests.find((req) => req.id === jobId);
      if (job) job.logs.push({ timestamp: new Date().toLocaleString(), note });
      return job;
    }
  },

  // Customer API
  async createRequest(data) {
    try {
      const res = await api.post('/requests', data);
      return res.data;
    } catch {
      const newReq = {
        id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
        ...data,
        status: 'PENDING_APPROVAL',
        created_at: new Date().toLocaleString(),
        logs: [{ timestamp: new Date().toLocaleString(), note: 'Request created by customer' }],
      };
      mockRequests.unshift(newReq);
      return newReq;
    }
  },

  async getCustomerRequests() {
    try {
      const res = await api.get('/requests');
      return res.data;
    } catch {
      return mockRequests;
    }
  },

  async verifyService(jobId, rating, feedback) {
    try {
      const res = await api.post(`/service/${jobId}/verify`, { rating, feedback });
      return res.data;
    } catch {
      const job = mockRequests.find((req) => req.id === jobId);
      if (job) {
        job.status = 'VERIFIED';
        job.verification = { rating, feedback, timestamp: new Date().toLocaleString() };
      }
      return job;
    }
  },
};
