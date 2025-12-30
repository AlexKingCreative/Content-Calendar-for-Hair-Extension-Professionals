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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { colors, spacing, borderRadius } from '../theme';
import { stripeApi } from '../services/api';

const { width } = Dimensions.get('window');
const PLAN_WIDTH = (width - spacing.md * 2 - spacing.sm * 2) / 3;

interface StartTrialScreenProps {
  onTrialStarted?: () => void;
}

const FEATURES = [
  { icon: 'calendar-outline', text: 'Monthly content ideas' },
  { icon: 'sparkles-outline', text: 'AI captions' },
  { icon: 'flame-outline', text: 'Streak rewards' },
  { icon: 'trending-up-outline', text: 'Trend alerts' },
  { icon: 'layers-outline', text: 'Multiple services' },
  { icon: 'person-outline', text: 'Personalized voice' },
];

export default function StartTrialScreen({ onTrialStarted }: StartTrialScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'yearly'>('quarterly');
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
            <Ionicons name="sparkles" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Choose Your Plan</Text>
          <Text style={styles.heroSubtitle}>
            7-day free trial on all plans
          </Text>
        </View>

        <View style={styles.plansRow}>
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.8}
          >
            <Text style={styles.planName}>Monthly</Text>
            <Text style={styles.priceAmount}>$10</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              styles.planCardMiddle,
              selectedPlan === 'quarterly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('quarterly')}
            activeOpacity={0.8}
          >
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>POPULAR</Text>
            </View>
            <Text style={styles.planName}>Quarterly</Text>
            <Text style={styles.priceAmount}>$25</Text>
            <Text style={styles.pricePeriod}>/3 months</Text>
            <Text style={styles.planSavings}>Save 17%</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.8}
          >
            <View style={[styles.popularBadge, styles.bestBadge]}>
              <Text style={styles.popularBadgeText}>BEST</Text>
            </View>
            <Text style={styles.planName}>Yearly</Text>
            <Text style={styles.priceAmount}>$50</Text>
            <Text style={styles.pricePeriod}>/year</Text>
            <Text style={styles.planSavings}>Save 58%</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresGrid}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name={feature.icon as any} size={18} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.testimonialCard}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons key={star} name="star" size={16} color="#FFD700" />
            ))}
          </View>
          <Text style={styles.testimonialText}>
            "This app has completely changed how I approach social media. I used to stress about what to post, now I have ideas ready every day!"
          </Text>
          <View style={styles.testimonialAuthor}>
            <View style={styles.testimonialAvatar}>
              <Text style={styles.testimonialAvatarText}>JM</Text>
            </View>
            <View>
              <Text style={styles.testimonialName}>Jessica M.</Text>
              <Text style={styles.testimonialRole}>Extension Specialist, LA</Text>
            </View>
          </View>
        </View>

        <View style={styles.guaranteeSection}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={styles.guaranteeText}>
            Cancel anytime during your trial
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
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
                Start 7-Day Free Trial
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.ctaDisclaimer}>
          {selectedPlan === 'monthly' 
            ? 'Then $10/month after trial ends'
            : selectedPlan === 'quarterly'
            ? 'Then $25/quarter (~$8.33/mo) after trial'
            : 'Then $50/year (~$4.17/mo) after trial'
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.md,
    flexGrow: 1,
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  plansRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  planCardMiddle: {
    marginTop: -8,
    paddingTop: spacing.md + 8,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bestBadge: {
    backgroundColor: '#FFD700',
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  pricePeriod: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  planSavings: {
    fontSize: 10,
    color: '#6B8E23',
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  featureItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${colors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
  },
  testimonialCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.sm,
  },
  testimonialText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  testimonialAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testimonialAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  testimonialName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  testimonialRole: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  guaranteeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  guaranteeText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
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
    fontSize: 17,
    fontWeight: 'bold',
  },
  ctaDisclaimer: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
