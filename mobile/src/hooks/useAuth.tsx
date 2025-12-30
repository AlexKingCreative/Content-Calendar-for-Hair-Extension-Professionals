import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi, profileApi } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  subscriptionStatus: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string, userData: User) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    try {
      const profile = await profileApi.get();
      setSubscriptionStatus(profile.subscriptionStatus || null);
    } catch (error) {
      setSubscriptionStatus(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        const userData = await authApi.getUser();
        setUser(userData);
        await checkSubscription();
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    await SecureStore.setItemAsync('authToken', response.token);
    setUser(response.user);
    await checkSubscription();
  };

  const loginWithToken = async (token: string, userData: User) => {
    await SecureStore.setItemAsync('authToken', token);
    setUser(userData);
    await checkSubscription();
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await authApi.register(email, password, name);
    await SecureStore.setItemAsync('authToken', response.token);
    setUser(response.user);
    await checkSubscription();
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setSubscriptionStatus(null);
  };

  const refreshSubscriptionStatus = async () => {
    await checkSubscription();
  };

  const hasActiveSubscription = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        hasActiveSubscription,
        subscriptionStatus,
        login,
        loginWithToken,
        register,
        logout,
        refreshSubscriptionStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
