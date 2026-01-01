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
  requestMagicLink: async (email: string) => {
    const response = await api.post('/api/mobile/request-magic-link', { email });
    return response.data;
  },
  verifyMagicLink: async (token: string, code?: string) => {
    const response = await api.post('/api/mobile/verify-magic-link', { token, code });
    return response.data;
  },
  getUser: async () => {
    const response = await api.get('/api/mobile/user');
    return response.data;
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('authToken');
  },
  googleAuth: async (idToken?: string, accessToken?: string) => {
    const response = await api.post('/api/mobile/google-auth', { idToken, accessToken });
    return response.data;
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

export const adviceApi = {
  getRandom: async () => {
    const response = await api.get('/api/ashleys-advice/random');
    return response.data;
  },
};

export const stripeApi = {
  createCheckoutSession: async (plan: 'monthly' | 'quarterly' | 'yearly' = 'monthly') => {
    const response = await api.post('/api/mobile/stripe/checkout', { plan });
    return response.data;
  },
  guestCheckout: async (data: {
    plan: 'monthly' | 'quarterly' | 'yearly';
    city?: string;
    certifiedBrands?: string[];
    extensionMethods?: string[];
    businessType?: string;
  }) => {
    const response = await api.post('/api/mobile/stripe/guest-checkout', data);
    return response.data;
  },
  completeCheckout: async (checkoutToken: string) => {
    const response = await api.post('/api/mobile/stripe/complete-checkout', { checkoutToken });
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
  getAllWithExpired: async (includeExpired: boolean = false) => {
    const response = await api.get(`/api/trends?includeExpired=${includeExpired}`);
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

export const salonApi = {
  getMySalon: async () => {
    const response = await api.get('/api/salons/me');
    return response.data;
  },
  updateSalon: async (id: number, data: { name?: string; instagramHandle?: string }) => {
    const response = await api.put(`/api/salons/${id}`, data);
    return response.data;
  },
  inviteMember: async (salonId: number, email: string, name: string) => {
    const response = await api.post(`/api/salons/${salonId}/invitations`, { email, name });
    return response.data;
  },
  revokeMember: async (salonId: number, memberId: number) => {
    const response = await api.delete(`/api/salons/${salonId}/members/${memberId}`);
    return response.data;
  },
  getChallenges: async () => {
    const response = await api.get('/api/salon/challenges');
    return response.data;
  },
  createChallenge: async (data: { title: string; description: string; durationDays: number; postsRequired: number; rewardText: string }) => {
    const response = await api.post('/api/salon/challenges', data);
    return response.data;
  },
  updateChallenge: async (id: number, data: { status?: string }) => {
    const response = await api.patch(`/api/salon/challenges/${id}`, data);
    return response.data;
  },
  deleteChallenge: async (id: number) => {
    const response = await api.delete(`/api/salon/challenges/${id}`);
    return response.data;
  },
  getChallengeProgress: async (id: number) => {
    const response = await api.get(`/api/salon/challenges/${id}/progress`);
    return response.data;
  },
};

export const stylistApi = {
  getChallenges: async () => {
    const response = await api.get('/api/stylist/challenges');
    return response.data;
  },
  logProgress: async (id: number) => {
    const response = await api.post(`/api/stylist/challenges/${id}/log`);
    return response.data;
  },
};

export default api;
