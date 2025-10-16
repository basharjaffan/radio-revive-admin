import axios from 'axios';
import type { User, Device, Group, Command, AuthResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  loginWithGoogle: async (idToken: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/google', { idToken });
    return data;
  },
};

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data;
  },
  create: async (email: string, role: 'admin' | 'user'): Promise<User> => {
    const { data } = await api.post('/users', { email, role });
    return data;
  },
  update: async (id: string, role: 'admin' | 'user'): Promise<void> => {
    await api.patch(`/users/${id}`, { role });
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export const devicesApi = {
  getAll: async (): Promise<Device[]> => {
    const { data } = await api.get('/devices');
    return data;
  },
  getOne: async (id: string): Promise<Device> => {
    const { data } = await api.get(`/devices/${id}`);
    return data;
  },
  create: async (device: Partial<Device>): Promise<Device> => {
    const { data } = await api.post('/devices', device);
    return data;
  },
  update: async (id: string, device: Partial<Device>): Promise<void> => {
    await api.patch(`/devices/${id}`, device);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/devices/${id}`);
  },
  sendCommand: async (id: string, command: Command): Promise<void> => {
    await api.post(`/devices/${id}/commands`, command);
  },
};

export const groupsApi = {
  getAll: async (): Promise<Group[]> => {
    const { data } = await api.get('/groups');
    return data;
  },
  create: async (group: Partial<Group>): Promise<Group> => {
    const { data } = await api.post('/groups', group);
    return data;
  },
  update: async (id: string, group: Partial<Group>): Promise<void> => {
    await api.patch(`/groups/${id}`, group);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/groups/${id}`);
  },
  sendCommand: async (id: string, command: Command): Promise<void> => {
    await api.post(`/groups/${id}/commands`, command);
  },
};
