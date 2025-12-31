import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../theme';
import { stripeApi, profileApi } from '../services/api';
import { RootStackParamList } from '../navigation';

const FEATURES = [
  { icon: 'calendar-outline', text: 'Monthly pre-planned content' },
  { icon: 'sparkles-outline', text: 'AI-powered captions' },
  { icon: 'layers-outline', text: 'Multiple service categories' },
  { icon: 'flame-outline', text: 'Posting streak tracker' },
  { icon: 'person-outline', text: 'Personalized voice settings' },
  { icon: 'trending-up-outline', text: 'Trend alerts' },
];

interface Profile {
  currentStreak: number;
  subscriptionStatus?: string;
  trialEndsAt?: string;
}

export default function UpgradeScreen() {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });
  
  const currentStreak = profile?.currentStreak || 0;
  const isOnTrial = profile?.subscriptionStatus === 'trialing';
  const isRevoked = profile?.subscriptionStatus === 'revoked';
  const trialEndsAt = profile?.trialEndsAt ? new Date(profile.trialEndsAt) : null;
  const now = new Date();
  const daysLeftInTrial = trialEndsAt ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isTrialEnding = daysLeftInTrial !== null && daysLeftInTrial <= 3 && daysLeftInTrial > 0;
  const isTrialExpired = daysLeftInTrial !== null && daysLeftInTrial <= 0;
  const showStreakWarning = (isTrialEnding || isTrialExpired) && currentStreak > 0;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const { url } = await stripeApi.createCheckoutSession(selectedPlan);
      if (url) {
        await WebBrowser.openBrowserAsync(url);
      } else {
        Alert.alert('Error', 'Could not create checkout session.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Could not open payment page.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="diamond" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Unlock Premium</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited access to all features
          </Text>
        </View>

        {isRevoked && (
          <View style={styles.streakWarning}>
            <View style={styles.streakWarningIcon}>
              <Ionicons name="alert-circle" size={24} color="#FF6B35" />
            </View>
            <View style={styles.streakWarningContent}>
              <Text style={styles.streakWarningTitle}>
                Salon access removed
              </Text>
              <Text style={styles.streakWarningText}>
                Your salon owner has removed your team access. Subscribe to continue using the content calendar on your own.
              </Text>
            </View>
          </View>
        )}

        {showStreakWarning && !isRevoked && (
          <View style={styles.streakWarning}>
            <View style={styles.streakWarningIcon}>
              <Ionicons name="flame" size={24} color="#FF6B35" />
            </View>
            <View style={styles.streakWarningContent}>
              <Text style={styles.streakWarningTitle}>
                {isTrialExpired ? 'Your trial has expired' : `Only ${daysLeftInTrial} day${daysLeftInTrial === 1 ? '' : 's'} left in your trial`}
              </Text>
              <Text style={styles.streakWarningText}>
                Upgrade now to keep your {currentStreak}-day posting streak! Without a subscription, your streak progress will be lost.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.plansContainer}>
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.8}
          >
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>BEST VALUE</Text>
            </View>
            <View style={styles.planHeader}>
              <View style={[
                styles.radioButton,
                selectedPlan === 'yearly' && styles.radioButtonSelected,
              ]}>
                {selectedPlan === 'yearly' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>Annual</Text>
                <Text style={styles.planPrice}>
                  <Text style={styles.priceAmount}>$60</Text>
                  <Text style={styles.pricePeriod}>/year</Text>
                </Text>
                <Text style={styles.planSavings}>Just $5/month</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.8}
          >
            <View style={styles.planHeader}>
              <View style={[
                styles.radioButton,
                selectedPlan === 'monthly' && styles.radioButtonSelected,
              ]}>
                {selectedPlan === 'monthly' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>Monthly</Text>
                <Text style={styles.planPrice}>
                  <Text style={styles.priceAmount}>$10</Text>
                  <Text style={styles.pricePeriod}>/month</Text>
                </Text>
                <Text style={styles.planTrial}>7-day free trial included</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Everything you get:</Text>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon as any} size={20} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.guaranteeSection}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <Text style={styles.guaranteeText}>
            Cancel anytime. No questions asked.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.upgradeButton, isLoading && styles.upgradeButtonDisabled]}
          onPress={handleUpgrade}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.upgradeButtonText}>
                {selectedPlan === 'monthly' ? 'Start Free Trial' : 'Subscribe Now'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          {selectedPlan === 'monthly' 
            ? 'After 7 days, you will be charged $10/month'
            : 'You will be charged $60/year'
          }
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  streakWarning: {
    flexDirection: 'row',
    backgroundColor: '#FFF3EE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD4C4',
    gap: 12,
  },
  streakWarningIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE8DD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakWarningContent: {
    flex: 1,
  },
  streakWarningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C04000',
    marginBottom: 4,
  },
  streakWarningText: {
    fontSize: 13,
    color: '#8B4513',
    lineHeight: 18,
  },
  plansContainer: {
    gap: 12,
    marginBottom: 28,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF8F5',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  planPrice: {
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  pricePeriod: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  planSavings: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  planTrial: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  featuresSection: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  guaranteeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  guaranteeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  upgradeButtonDisabled: {
    opacity: 0.7,
  },
  upgradeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textTertiary,
  },
});
