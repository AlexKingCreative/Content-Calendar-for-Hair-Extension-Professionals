import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { stripeApi, profileApi } from '../services/api';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://content-calendar-hair-pro.replit.app';

interface Profile {
  currentStreak: number;
  longestStreak: number;
  totalPosts: number;
  postingGoal: string;
  showStreaks: boolean;
  pushNotifications: boolean;
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [showStreaks, setShowStreaks] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: profileApi.get,
    onSuccess: (data: Profile) => {
      if (data?.showStreaks !== undefined) setShowStreaks(data.showStreaks);
      if (data?.pushNotifications !== undefined) setPushNotifications(data.pushNotifications);
    },
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: (data: Partial<Profile>) => profileApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const handleUpgrade = async () => {
    try {
      const { url } = await stripeApi.createCheckoutSession();
      if (url) {
        await WebBrowser.openBrowserAsync(url);
      } else {
        Alert.alert('Error', 'Could not create checkout session.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Could not open payment page. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const toggleShowStreaks = (value: boolean) => {
    setShowStreaks(value);
    updatePreferenceMutation.mutate({ showStreaks: value });
  };

  const togglePushNotifications = (value: boolean) => {
    setPushNotifications(value);
    updatePreferenceMutation.mutate({ pushNotifications: value });
  };

  const handleManageAccount = () => {
    openLink(`${API_URL}/account`);
  };

  const handleInstagramAnalytics = () => {
    openLink(`${API_URL}/instagram`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={handleManageAccount}>
            <Ionicons name="person-outline" size={22} color="#5D4E3C" />
            <Text style={styles.menuText}>Manage Account</Text>
            <Ionicons name="chevron-forward" size={20} color="#A89580" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleUpgrade}>
            <Ionicons name="diamond-outline" size={22} color="#5D4E3C" />
            <Text style={styles.menuText}>Upgrade Plan</Text>
            <Ionicons name="chevron-forward" size={20} color="#A89580" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={handleInstagramAnalytics}>
            <Ionicons name="logo-instagram" size={22} color="#5D4E3C" />
            <Text style={styles.menuText}>Instagram Analytics</Text>
            <Ionicons name="chevron-forward" size={20} color="#A89580" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.card}>
          <View style={styles.switchItem}>
            <View style={styles.switchLeft}>
              <Ionicons name="flame-outline" size={22} color="#5D4E3C" />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>Show Streaks</Text>
                <Text style={styles.switchDescription}>Display your posting streak on calendar</Text>
              </View>
            </View>
            <Switch
              value={showStreaks}
              onValueChange={toggleShowStreaks}
              trackColor={{ false: '#E5D5C5', true: '#D4A574' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.switchItem, styles.menuItemLast]}>
            <View style={styles.switchLeft}>
              <Ionicons name="notifications-outline" size={22} color="#5D4E3C" />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>Push Notifications</Text>
                <Text style={styles.switchDescription}>Get reminders to post</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={togglePushNotifications}
              trackColor={{ false: '#E5D5C5', true: '#D4A574' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.notificationRow} onPress={() => openLink(`${API_URL}/notifications`)}>
          <Ionicons name="notifications" size={22} color="#5D4E3C" />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#A89580" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={() => openLink(`${API_URL}/help`)}>
            <Ionicons name="help-circle-outline" size={22} color="#5D4E3C" />
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#A89580" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#DC2626" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EDE4',
    gap: 14,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#5D4E3C',
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EDE4',
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    color: '#5D4E3C',
  },
  switchDescription: {
    fontSize: 13,
    color: '#8B7355',
    marginTop: 2,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  version: {
    textAlign: 'center',
    color: '#A89580',
    fontSize: 13,
    marginTop: 24,
    marginBottom: 16,
  },
});
