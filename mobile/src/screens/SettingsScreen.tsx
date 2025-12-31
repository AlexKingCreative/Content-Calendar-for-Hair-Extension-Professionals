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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { stripeApi, profileApi } from '../services/api';
import { colors, borderRadius, shadows, spacing, glassCard } from '../theme';
import { RootStackParamList } from '../navigation';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://content-calendar-hair-pro.replit.app';

interface Profile {
  currentStreak: number;
  longestStreak: number;
  totalPosts: number;
  postingGoal: string;
  showStreaks: boolean;
  pushNotificationsEnabled: boolean;
  emailReminders: boolean;
}

export default function SettingsScreen() {
  const { user, logout, isSalonOwner } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const [showStreaks, setShowStreaks] = useState(true);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [emailReminders, setEmailReminders] = useState(false);

  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });

  React.useEffect(() => {
    if (profile?.showStreaks !== undefined) setShowStreaks(profile.showStreaks);
    if (profile?.pushNotificationsEnabled !== undefined) setPushNotificationsEnabled(profile.pushNotificationsEnabled);
    if (profile?.emailReminders !== undefined) setEmailReminders(profile.emailReminders);
  }, [profile]);

  const updatePreferenceMutation = useMutation({
    mutationFn: (data: Partial<Profile>) => profileApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const handleUpgrade = () => {
    navigation.navigate('Upgrade');
  };

  const handleUpgradeOld = async () => {
    try {
      const { url } = await stripeApi.createCheckoutSession();
      if (url) {
        await WebBrowser.openBrowserAsync(url);
      } else {
        Alert.alert('Error', 'Could not create checkout session.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Could not open payment page.';
      if (errorMessage.includes('Unauthorized') || error.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please sign out and sign back in to continue.',
          [
            { text: 'OK' },
            { text: 'Sign Out', style: 'destructive', onPress: logout },
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
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
    setPushNotificationsEnabled(value);
    updatePreferenceMutation.mutate({ pushNotificationsEnabled: value });
  };

  const toggleEmailReminders = (value: boolean) => {
    setEmailReminders(value);
    updatePreferenceMutation.mutate({ emailReminders: value });
  };

  const handleManageAccount = () => {
    navigation.navigate('Account');
  };

  const showAbout = () => {
    Alert.alert(
      'About Hair Calendar',
      `Version 1.0.0\n\nHair Calendar helps hair extension professionals plan and create engaging social media content.\n\nFeatures:\n- 365 days of pre-planned content ideas\n- AI-powered caption generation\n- Posting streak tracking\n- Instagram integration`,
      [{ text: 'OK' }]
    );
  };

  const showPrivacy = () => {
    Alert.alert(
      'Privacy Choices',
      'Your data is secure and never shared with third parties without your consent.\n\nWe collect only the information needed to personalize your content suggestions and track your posting progress.\n\nYou can delete your account at any time by contacting support.',
      [{ text: 'OK' }]
    );
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={handleManageAccount}>
            <Ionicons name="person-outline" size={22} color={colors.text} />
            <Text style={styles.menuText}>Manage Account</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleUpgrade}>
            <Ionicons name="diamond-outline" size={22} color={colors.text} />
            <Text style={styles.menuText}>Upgrade Plan</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          {isSalonOwner && (
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SalonDashboard')}>
              <Ionicons name="business-outline" size={22} color={colors.text} />
              <Text style={styles.menuText}>Salon Dashboard</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Challenges')}>
            <Ionicons name="trophy-outline" size={22} color={colors.text} />
            <Text style={styles.menuText}>Challenges</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={() => navigation.navigate('Instagram')}>
            <Ionicons name="logo-instagram" size={22} color={colors.text} />
            <Text style={styles.menuText}>Instagram Analytics</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.card}>
          <View style={styles.switchItem}>
            <View style={styles.switchLeft}>
              <Ionicons name="flame-outline" size={22} color={colors.text} />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>Show Streaks</Text>
                <Text style={styles.switchDescription}>Display your posting streak on calendar</Text>
              </View>
            </View>
            <Switch
              value={showStreaks}
              onValueChange={toggleShowStreaks}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
          <View style={styles.switchItem}>
            <View style={styles.switchLeft}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>Push Notifications</Text>
                <Text style={styles.switchDescription}>Get reminders to post</Text>
              </View>
            </View>
            <Switch
              value={pushNotificationsEnabled}
              onValueChange={togglePushNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
          <View style={[styles.switchItem, styles.menuItemLast]}>
            <View style={styles.switchLeft}>
              <Ionicons name="mail-outline" size={22} color={colors.text} />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>Email Reminders</Text>
                <Text style={styles.switchDescription}>Get weekly posting summaries</Text>
              </View>
            </View>
            <Switch
              value={emailReminders}
              onValueChange={toggleEmailReminders}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Help')}>
            <Ionicons name="help-circle-outline" size={22} color={colors.text} />
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Contact')}>
            <Ionicons name="mail-outline" size={22} color={colors.text} />
            <Text style={styles.menuText}>Contact Us</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={showAbout}>
            <Ionicons name="information-circle-outline" size={22} color={colors.text} />
            <Text style={styles.menuText}>About</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LEGAL</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Terms')}>
            <Ionicons name="document-text-outline" size={22} color={colors.text} />
            <Text style={styles.menuText}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={showPrivacy}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.text} />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
    letterSpacing: 0.5,
  },
  card: {
    ...glassCard,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.lg,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.lg,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    color: colors.text,
  },
  switchDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    ...glassCard,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  version: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 13,
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  comingSoonBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  comingSoonText: {
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
});
