import axios, { AxiosError } from 'axios';
import { AuthTokens, User, Vehicle, MaintenanceRecord, MaintenanceSchedule } from '../types';

// Utility function to extract error messages from API responses
export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    
    // Extract the detail field from the response data
    if (axiosError.response?.data?.detail) {
      return axiosError.response.data.detail;
    }
    
    // Fall back to error message or status text
    if (axiosError.message) {
      return axiosError.message;
    }
    
    // Fall back to status text
    if (axiosError.response?.statusText) {
      return axiosError.response.statusText;
    }
  }
  
  // Default fallback
  return 'An unexpected error occurred';
};

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

// Response interceptor to handle errors consistently
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // For 401 errors, clear the token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      // Don't redirect here as it would interfere with the components
    }
    
    // Re-throw the error to be handled by individual components
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string): Promise<AuthTokens> => {
    const response = await api.post('/auth/login', new URLSearchParams({
      username: email,
      password: password,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  
  register: async (email: string, password: string, phoneNumber?: string): Promise<void> => {
    const payload: { email: string; password: string; phone_number?: string } = { email, password };
    if (phoneNumber) {
      payload.phone_number = phoneNumber;
    }
    await api.post('/auth/register', payload);
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
  
  unsubscribe: async (): Promise<{ message: string }> => {
    const response = await api.post('/users/me/unsubscribe');
    return response.data;
  },
  
  smsOptOut: async (): Promise<{ message: string }> => {
    const response = await api.post('/users/me/sms-opt-out');
    return response.data;
  },
  
  smsOptIn: async (): Promise<{ message: string }> => {
    const response = await api.post('/users/me/sms-opt-in');
    return response.data;
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
  
  getRecommendations: async (vehicleId: string): Promise<{ 
    vehicle_id: string; 
    recommendations: string;
    cached: boolean;
    generated_at: string;
  }> => {
    const response = await api.get(`/vehicles/${vehicleId}/recommendations`);
    return response.data;
  },
};

// CarAPI vehicle data service
export const carApiService = {
  getYears: async (): Promise<{ data: Array<{ year: number }> }> => {
    const response = await api.get('/vehicles/carapi/years');
    return response.data;
  },
  
  getMakes: async (year: number): Promise<{ data: Array<{ make: string; make_id: number }> }> => {
    const response = await api.get(`/vehicles/carapi/makes?year=${year}`);
    return response.data;
  },
  
  getModels: async (year: number, make: string): Promise<{ data: Array<{ model: string; model_id: number }> }> => {
    const response = await api.get(`/vehicles/carapi/models?year=${year}&make=${encodeURIComponent(make)}`);
    return response.data;
  },
  
  getTrims: async (year: number, make: string, model: string): Promise<{ data: Array<{ trim: string; trim_id: number }> }> => {
    const response = await api.get(`/vehicles/carapi/trims?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
    return response.data;
  },
};

export const adminService = {
  getClaudeLogs: async (limit: number = 100): Promise<Array<{
    id: string;
    vehicle_id: string;
    request_prompt: string;
    response_text: string;
    model_used: string;
    tokens_used: number | null;
    created_at: string;
  }>> => {
    const response = await api.get(`/admin/claude-logs?limit=${limit}`);
    return response.data;
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