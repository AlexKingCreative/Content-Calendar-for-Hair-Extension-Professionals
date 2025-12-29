import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { stripeApi, profileApi, streakApi } from '../services/api';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://content-calendar-hair-pro.replit.app';

interface Profile {
  currentStreak: number;
  longestStreak: number;
  totalPosts: number;
  postingGoal: string;
  certifiedBrands: string[];
  extensionMethods: string[];
  city: string;
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [showGoalModal, setShowGoalModal] = useState(false);

  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });

  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: streakApi.get,
  });

  const updateGoalMutation = useMutation({
    mutationFn: (postingGoal: string) => profileApi.update({ postingGoal }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      setShowGoalModal(false);
      Alert.alert('Success', 'Your posting goal has been updated');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update posting goal');
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color="#D4A574" />
            </View>
            <View>
              <Text style={styles.userName}>{user?.name || 'Hair Professional'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>
      </View>

      {streakData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.card}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="flame" size={20} color="#D4A574" />
                <Text style={styles.statNumber}>{streakData.currentStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={20} color="#D4A574" />
                <Text style={styles.statNumber}>{streakData.longestStreak}</Text>
                <Text style={styles.statLabel}>Best Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={20} color="#D4A574" />
                <Text style={styles.statNumber}>{streakData.totalPosts}</Text>
                <Text style={styles.statLabel}>Total Posts</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Posting Goal</Text>
        <TouchableOpacity 
          style={styles.goalCard}
          onPress={() => setShowGoalModal(true)}
        >
          <View style={styles.goalContent}>
            <Ionicons name="calendar" size={24} color="#D4A574" />
            <View style={styles.goalText}>
              <Text style={styles.goalTitle}>
                {profile?.postingGoal === 'daily' ? 'Daily' : 
                 profile?.postingGoal === 'casual' ? 'Casual (3-4x/week)' : 
                 'Occasional (1-2x/week)'}
              </Text>
              <Text style={styles.goalDescription}>Tap to change your posting goal</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D4A574" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <TouchableOpacity style={styles.upgradeCard} onPress={handleUpgrade}>
          <View style={styles.upgradeContent}>
            <Ionicons name="star" size={24} color="#D4A574" />
            <View style={styles.upgradeText}>
              <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
              <Text style={styles.upgradeDescription}>
                Get AI-generated captions and unlimited access
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D4A574" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openLink(`${API_URL}/contact`)}
          >
            <Ionicons name="mail-outline" size={20} color="#5D4E3C" />
            <Text style={styles.menuText}>Contact Us</Text>
            <Ionicons name="chevron-forward" size={20} color="#D4A574" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openLink(`${API_URL}/privacy`)}
          >
            <Ionicons name="shield-outline" size={20} color="#5D4E3C" />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#D4A574" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemLast]}
            onPress={() => openLink(`${API_URL}/terms`)}
          >
            <Ionicons name="document-text-outline" size={20} color="#5D4E3C" />
            <Text style={styles.menuText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color="#D4A574" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#DC2626" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>

      <Modal
        visible={showGoalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Posting Goal</Text>
            {[
              { value: 'daily', label: 'Daily', desc: 'Post every day' },
              { value: 'casual', label: 'Casual', desc: '3-4 times per week' },
              { value: 'occasional', label: 'Occasional', desc: '1-2 times per week' },
            ].map((goal) => (
              <TouchableOpacity
                key={goal.value}
                style={[
                  styles.goalOption,
                  profile?.postingGoal === goal.value && styles.goalOptionSelected
                ]}
                onPress={() => updateGoalMutation.mutate(goal.value)}
              >
                <View>
                  <Text style={styles.goalOptionTitle}>{goal.label}</Text>
                  <Text style={styles.goalOptionDesc}>{goal.desc}</Text>
                </View>
                {profile?.postingGoal === goal.value && (
                  <Ionicons name="checkmark" size={24} color="#D4A574" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowGoalModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4E3C',
  },
  userEmail: {
    fontSize: 14,
    color: '#8B7355',
    marginTop: 2,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E3C',
  },
  upgradeDescription: {
    fontSize: 13,
    color: '#8B7355',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EDE4',
    gap: 12,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#5D4E3C',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    color: '#8B7355',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D4E3C',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#8B7355',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F5EDE4',
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E3C',
  },
  goalDescription: {
    fontSize: 13,
    color: '#8B7355',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: 20,
    textAlign: 'center',
  },
  goalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    marginBottom: 12,
  },
  goalOptionSelected: {
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  goalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E3C',
  },
  goalOptionDesc: {
    fontSize: 13,
    color: '#8B7355',
    marginTop: 2,
  },
  modalCloseButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#8B7355',
  },
});
