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
import * as WebBrowser from 'expo-web-browser';
import { colors, spacing, borderRadius } from '../theme';
import { stripeApi } from '../services/api';

const FEATURES = [
  { icon: 'calendar-outline', text: '365 days of pre-planned content ideas' },
  { icon: 'sparkles-outline', text: 'AI-powered caption generation' },
  { icon: 'layers-outline', text: 'Multiple service categories' },
  { icon: 'flame-outline', text: 'Posting streak tracker with rewards' },
  { icon: 'person-outline', text: 'Personalized voice (solo or salon)' },
  { icon: 'trending-up-outline', text: 'Real-time trend alerts' },
  { icon: 'download-outline', text: 'Download PDF calendars' },
];

interface StartTrialScreenProps {
  onTrialStarted?: () => void;
}

export default function StartTrialScreen({ onTrialStarted }: StartTrialScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      const { url } = await stripeApi.createCheckoutSession(selectedPlan);
      if (url) {
        const result = await WebBrowser.openBrowserAsync(url);
        if (result.type === 'cancel' || result.type === 'dismiss') {
          onTrialStarted?.();
        }
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
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Start Your Free Trial</Text>
          <Text style={styles.heroSubtitle}>
            7 days free, then just $10/month.{'\n'}Cancel anytime.
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Everything you need to grow your business:</Text>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon as any} size={20} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plansContainer}>
          <Text style={styles.plansTitle}>Choose your plan:</Text>
          
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.8}
          >
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>FREE TRIAL</Text>
            </View>
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

          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'quarterly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('quarterly')}
            activeOpacity={0.8}
          >
            <View style={[styles.planBadge, styles.planBadgeSecondary]}>
              <Text style={styles.planBadgeText}>SAVE 17%</Text>
            </View>
            <View style={styles.planHeader}>
              <View style={[
                styles.radioButton,
                selectedPlan === 'quarterly' && styles.radioButtonSelected,
              ]}>
                {selectedPlan === 'quarterly' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>Quarterly</Text>
                <Text style={styles.planPrice}>
                  <Text style={styles.priceAmount}>$25</Text>
                  <Text style={styles.pricePeriod}>/3 months</Text>
                </Text>
                <Text style={styles.planSavings}>~$8.33/month</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.8}
          >
            <View style={[styles.planBadge, styles.planBadgeBest]}>
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
                <Text style={styles.planName}>Yearly</Text>
                <Text style={styles.planPrice}>
                  <Text style={styles.priceAmount}>$50</Text>
                  <Text style={styles.pricePeriod}>/year</Text>
                </Text>
                <Text style={styles.planSavings}>~$4.17/month - Save 58%</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.ctaButton, isLoading && styles.ctaButtonDisabled]}
            onPress={handleStartTrial}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.ctaButtonText}>
                  {selectedPlan === 'monthly' ? 'Start 7-Day Free Trial' : 'Subscribe Now'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.ctaDisclaimer}>
            {selectedPlan === 'monthly' 
              ? 'Credit card required. Cancel anytime during trial.'
              : 'Subscription starts immediately. Cancel anytime.'}
          </Text>
        </View>

        <View style={styles.testimonialSection}>
          <View style={styles.quoteIcon}>
            <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} />
          </View>
          <Text style={styles.testimonialText}>
            "This app has completely transformed how I plan my content. I went from posting once a week to 5 times a week!"
          </Text>
          <Text style={styles.testimonialAuthor}>- Sarah M., Hair Extension Specialist</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  plansContainer: {
    marginBottom: spacing.xl,
  },
  plansTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  planCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'visible',
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
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
  planBadgeSecondary: {
    backgroundColor: '#6B8E23',
  },
  planBadgeBest: {
    backgroundColor: '#FFD700',
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
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
    marginBottom: 2,
  },
  planPrice: {
    marginBottom: 2,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  pricePeriod: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  planTrial: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  planSavings: {
    fontSize: 12,
    color: '#6B8E23',
    fontWeight: '500',
  },
  ctaSection: {
    marginBottom: spacing.xl,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaDisclaimer: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  testimonialSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  quoteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  testimonialText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  testimonialAuthor: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
});
