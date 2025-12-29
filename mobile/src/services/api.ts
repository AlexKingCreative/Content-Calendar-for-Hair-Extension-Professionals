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
  generateCaption: async (id: number) => {
    const response = await api.post(`/api/posts/${id}/generate-caption`);
    return response.data;
  },
  getCalendarPdfUrl: (month: number) => {
    return `${API_URL}/api/mobile/calendar/pdf/${month}`;
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
    const response = await api.post('/api/mobile/streak/log', { postId });
    return response.data;
  },
};

export const stripeApi = {
  createCheckoutSession: async (plan: 'monthly' | 'annual' = 'monthly') => {
    const response = await api.post('/api/mobile/stripe/checkout', { plan });
    return response.data;
  },
};

export const webApi = {
  getLoginToken: async () => {
    const response = await api.get('/api/mobile/web-login-token');
    return response.data;
  },
};

export const trendsApi = {
  getAll: async () => {
    const response = await api.get('/api/trends');
    return response.data;
  },
};

export const challengesApi = {
  getAll: async () => {
    const response = await api.get('/api/challenges');
    return response.data;
  },
  getUserChallenges: async () => {
    const response = await api.get('/api/user/challenges');
    return response.data;
  },
  start: async (challengeId: number) => {
    const response = await api.post(`/api/mobile/challenges/${challengeId}/start`, {});
    return response.data;
  },
  logProgress: async (userChallengeId: number) => {
    const response = await api.post(`/api/mobile/user/challenges/${userChallengeId}/progress`, {});
    return response.data;
  },
  abandon: async (userChallengeId: number) => {
    const response = await api.post(`/api/user/challenges/${userChallengeId}/abandon`, {});
    return response.data;
  },
};

export default api;
