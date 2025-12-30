import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { ActivityIndicator, View, Platform, StyleSheet } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TodayScreen from '../screens/TodayScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TrendsScreen from '../screens/TrendsScreen';
import StreaksScreen from '../screens/StreaksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import HelpScreen from '../screens/HelpScreen';
import AccountScreen from '../screens/AccountScreen';
import UpgradeScreen from '../screens/UpgradeScreen';
import StartTrialScreen from '../screens/StartTrialScreen';
import GuestCheckoutScreen from '../screens/GuestCheckoutScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
  StartTrial: undefined;
  PostDetail: { postId: number };
  Help: undefined;
  Account: undefined;
  Upgrade: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
  GuestCheckout: {
    city?: string;
    certifiedBrands?: string[];
    extensionMethods?: string[];
    businessType?: string;
  };
};

export type MainTabParamList = {
  Today: undefined;
  Calendar: undefined;
  Trends: undefined;
  Streaks: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="GuestCheckout" component={GuestCheckoutScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          if (route.name === 'Today') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Trends') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Streaks') {
            iconName = focused ? 'flame' : 'flame-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: -2,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          height: 64,
          backgroundColor: colors.glass.backgroundLight,
          borderRadius: borderRadius.xxl,
          borderWidth: 1,
          borderColor: colors.glass.border,
          paddingBottom: 6,
          paddingTop: 10,
          ...shadows.glass,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerStyle: {
          backgroundColor: colors.glass.backgroundDark,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
          fontSize: 18,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ title: 'Today' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />
      <Tab.Screen name="Trends" component={TrendsScreen} options={{ title: 'Trends' }} />
      <Tab.Screen name="Streaks" component={StreaksScreen} options={{ title: 'Streaks' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}


function StartTrialWrapper() {
  const { refreshSubscriptionStatus } = useAuth();
  return <StartTrialScreen onTrialStarted={refreshSubscriptionStatus} />;
}

export default function Navigation() {
  const { isLoading, isAuthenticated, hasActiveSubscription } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8F0' }}>
        <ActivityIndicator size="large" color="#D4A574" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          hasActiveSubscription ? (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen 
                name="PostDetail" 
                component={PostDetailScreen}
                options={{ headerShown: true, title: 'Post Details' }}
              />
              <Stack.Screen 
                name="Help" 
                component={HelpScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Account" 
                component={AccountScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Upgrade" 
                component={UpgradeScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            <>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="StartTrial" component={StartTrialWrapper} />
            </>
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
