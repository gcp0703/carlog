import axios from 'axios';
import { AuthTokens, User, Vehicle, MaintenanceRecord, MaintenanceSchedule } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string): Promise<AuthTokens> => {
    const response = await api.post('/auth/login', new URLSearchParams({
      username: email,
      password: password,
    }));
    return response.data;
  },
  
  register: async (email: string, password: string): Promise<void> => {
    await api.post('/auth/register', { email, password });
  },
};

export const userService = {
  getMe: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  updateMe: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
  
  deleteMe: async (): Promise<void> => {
    await api.delete('/users/me');
  },
};

export const vehicleService = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await api.get('/vehicles');
    return response.data;
  },
  
  create: async (vehicle: Omit<Vehicle, 'id' | 'owner_id'>): Promise<Vehicle> => {
    const response = await api.post('/vehicles', vehicle);
    return response.data;
  },
  
  getById: async (id: string): Promise<Vehicle> => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },
  
  update: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },
};

export const maintenanceService = {
  getRecords: async (vehicleId: string): Promise<MaintenanceRecord[]> => {
    const response = await api.get(`/maintenance/records/${vehicleId}`);
    return response.data;
  },
  
  createRecord: async (record: Omit<MaintenanceRecord, 'id' | 'created_at'>): Promise<MaintenanceRecord> => {
    const response = await api.post('/maintenance/records', record);
    return response.data;
  },
  
  updateRecord: async (id: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> => {
    const response = await api.put(`/maintenance/records/${id}`, data);
    return response.data;
  },
  
  deleteRecord: async (id: string): Promise<void> => {
    await api.delete(`/maintenance/records/${id}`);
  },
  
  getSchedule: async (vehicleId: string): Promise<MaintenanceSchedule[]> => {
    const response = await api.get(`/maintenance/schedule/${vehicleId}`);
    return response.data;
  },
  
  updateSchedule: async (vehicleId: string, schedule: MaintenanceSchedule[]): Promise<void> => {
    await api.post(`/maintenance/schedule/${vehicleId}`, schedule);
  },
};