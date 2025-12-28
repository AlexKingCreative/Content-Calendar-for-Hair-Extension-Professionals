import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://content-calendar-hair-pro.replit.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('authToken');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/mobile/login', { email, password });
    return response.data;
  },
  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/api/mobile/register', { email, password, name });
    return response.data;
  },
  getUser: async () => {
    const response = await api.get('/api/mobile/user');
    return response.data;
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('authToken');
  },
};

export const postsApi = {
  getAll: async () => {
    const response = await api.get('/api/posts');
    return response.data;
  },
  getByMonth: async (month: number) => {
    const response = await api.get(`/api/posts/month/${month}`);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/api/posts/${id}`);
    return response.data;
  },
  getToday: async () => {
    const response = await api.get('/api/posts/today');
    return response.data;
  },
};

export const profileApi = {
  get: async () => {
    const response = await api.get('/api/mobile/profile');
    return response.data;
  },
  update: async (data: any) => {
    const response = await api.put('/api/mobile/profile', data);
    return response.data;
  },
  getOptions: async () => {
    const response = await api.get('/api/options');
    return response.data;
  },
};

export const streakApi = {
  get: async () => {
    const response = await api.get('/api/streak');
    return response.data;
  },
  logPost: async (postId?: number) => {
    const response = await api.post('/api/streak/log', { postId });
    return response.data;
  },
};

export const stripeApi = {
  createCheckoutSession: async () => {
    const response = await api.post('/api/mobile/stripe/checkout');
    return response.data;
  },
};

export default api;
