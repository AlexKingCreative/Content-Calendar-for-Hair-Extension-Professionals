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
  onboardingComplete: boolean;
  hasSeenWelcome: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string, userData: User) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
  setOnboardingComplete: (complete: boolean) => void;
  setHasSeenWelcome: (seen: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  const checkSubscription = useCallback(async () => {
    try {
      const profile = await profileApi.get();
      setSubscriptionStatus(profile.subscriptionStatus || null);
      setOnboardingComplete(profile.onboardingComplete || false);
    } catch (error) {
      setSubscriptionStatus(null);
      setOnboardingComplete(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('authToken');
      if (storedToken) {
        setToken(storedToken);
        const userData = await authApi.getUser();
        setUser(userData);
        await checkSubscription();
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('authToken');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    await SecureStore.setItemAsync('authToken', response.token);
    setToken(response.token);
    setUser(response.user);
    await checkSubscription();
  };

  const loginWithToken = async (authToken: string, userData: User) => {
    await SecureStore.setItemAsync('authToken', authToken);
    setToken(authToken);
    setUser(userData);
    await checkSubscription();
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await authApi.register(email, password, name);
    await SecureStore.setItemAsync('authToken', response.token);
    setToken(response.token);
    setUser(response.user);
    await checkSubscription();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout API errors
    }
    await SecureStore.deleteItemAsync('authToken');
    setToken(null);
    setUser(null);
    setSubscriptionStatus(null);
    setOnboardingComplete(false);
    setHasSeenWelcome(false);
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
        onboardingComplete,
        hasSeenWelcome,
        token,
        login,
        loginWithToken,
        register,
        logout,
        refreshSubscriptionStatus,
        setOnboardingComplete,
        setHasSeenWelcome,
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
