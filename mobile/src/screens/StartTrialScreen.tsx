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
            <Ionicons name="sparkles" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Start Your Free Trial</Text>
          <Text style={styles.heroSubtitle}>
            7 days free, then just $10/month. Cancel anytime.
          </Text>
        </View>

        <View style={styles.plansContainer}>
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
                <Text style={styles.planCommitment}>Commit to posting more for 90 days to see results</Text>
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

        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.featureItemText}>365 days of content</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
            <Text style={styles.featureItemText}>AI captions</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="flame-outline" size={18} color={colors.primary} />
            <Text style={styles.featureItemText}>Streak rewards</Text>
          </View>
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
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  plansContainer: {
    marginBottom: spacing.md,
  },
  planCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
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
    alignItems: 'flex-start',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  planPrice: {
    marginBottom: 2,
  },
  priceAmount: {
    fontSize: 22,
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
  planCommitment: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  featureItem: {
    alignItems: 'center',
    gap: 4,
  },
  featureItemText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
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
