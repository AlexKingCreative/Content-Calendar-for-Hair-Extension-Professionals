import React, { useState, useEffect, useRef } from 'react';
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
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '../theme';
import { stripeApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const { width } = Dimensions.get('window');
const PLAN_WIDTH = (width - spacing.md * 2 - spacing.sm * 2) / 3;

type RouteParams = {
  GuestCheckout: {
    city?: string;
    certifiedBrands?: string[];
    extensionMethods?: string[];
    businessType?: string;
  };
};

const CHECKOUT_TOKEN_KEY = 'pendingCheckoutToken';

const FEATURES = [
  { icon: 'calendar-outline', text: 'Monthly content ideas' },
  { icon: 'sparkles-outline', text: 'AI captions' },
  { icon: 'flame-outline', text: 'Streak rewards' },
  { icon: 'trending-up-outline', text: 'Trend alerts' },
  { icon: 'layers-outline', text: 'Multiple services' },
  { icon: 'person-outline', text: 'Personalized voice' },
];

const SOCIAL_PROOF_MESSAGES = [
  { icon: 'heart', color: '#E74C3C', text: 'Marie the hairstylist liked your post' },
  { icon: 'person-add', color: '#9B59B6', text: 'Jaclyn Hair Extensions followed you' },
  { icon: 'chatbubble', color: '#3498DB', text: 'New booking request from Sarah!' },
  { icon: 'heart', color: '#E74C3C', text: 'BeautyPro Salon liked your reel' },
  { icon: 'person-add', color: '#9B59B6', text: 'LA Hair Studio started following you' },
  { icon: 'calendar', color: '#27AE60', text: 'Client booked: Tape-in extensions' },
  { icon: 'chatbubble', color: '#3498DB', text: '"Love your work! Are you available?"' },
  { icon: 'heart', color: '#E74C3C', text: 'Your post reached 2,500 people' },
];

export default function GuestCheckoutScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'yearly'>('quarterly');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompletingCheckout, setIsCompletingCheckout] = useState(false);
  const [checkoutToken, setCheckoutToken] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'GuestCheckout'>>();
  const { loginWithToken } = useAuth();

  const preferences = route.params || {};

  useEffect(() => {
    const loadPendingToken = async () => {
      const savedToken = await SecureStore.getItemAsync(CHECKOUT_TOKEN_KEY);
      if (savedToken) {
        setCheckoutToken(savedToken);
      }
    };
    loadPendingToken();
  }, []);

  useEffect(() => {
    const animateMessage = () => {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -20,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2600);
    };

    animateMessage();
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % SOCIAL_PROOF_MESSAGES.length);
      animateMessage();
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = SOCIAL_PROOF_MESSAGES[currentMessageIndex];

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const result = await stripeApi.guestCheckout({
        plan: selectedPlan,
        city: preferences.city,
        certifiedBrands: preferences.certifiedBrands,
        extensionMethods: preferences.extensionMethods,
        businessType: preferences.businessType,
      });

      if (result.url && result.checkoutToken) {
        setCheckoutToken(result.checkoutToken);
        await SecureStore.setItemAsync(CHECKOUT_TOKEN_KEY, result.checkoutToken);
        
        await WebBrowser.openBrowserAsync(result.url);
        
        await attemptCompleteCheckout(result.checkoutToken);
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

  const attemptCompleteCheckout = async (token: string, retryCount = 0) => {
    setIsCompletingCheckout(true);
    try {
      const authResult = await stripeApi.completeCheckout(token);
      if (authResult.token && authResult.user) {
        await SecureStore.deleteItemAsync(CHECKOUT_TOKEN_KEY);
        await loginWithToken(authResult.token, authResult.user);
      }
    } catch (completeError: any) {
      const errorMsg = completeError.response?.data?.message || 'Unable to verify subscription';
      
      if (errorMsg.includes('Payment not completed') && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return attemptCompleteCheckout(token, retryCount + 1);
      }
      
      if (errorMsg.includes('Payment not completed')) {
        Alert.alert(
          'Complete Your Checkout',
          'Please finish entering your payment details in the browser. Once done, tap "Verify Subscription" below.',
          [{ text: 'OK' }]
        );
      } else if (errorMsg.includes('already been completed')) {
        await SecureStore.deleteItemAsync(CHECKOUT_TOKEN_KEY);
        Alert.alert('Already Completed', 'This checkout was already processed. Please log in with your email.');
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setIsCompletingCheckout(false);
    }
  };

  const handleVerifySubscription = async () => {
    if (!checkoutToken) {
      Alert.alert('Error', 'No checkout session found. Please start a new checkout.');
      return;
    }
    
    await attemptCompleteCheckout(checkoutToken);
  };

  if (isCompletingCheckout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Setting up your account...</Text>
          <Text style={styles.loadingSubtext}>This only takes a moment</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.socialProofBanner,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.socialProofIcon, { backgroundColor: `${currentMessage.color}15` }]}>
            <Ionicons name={currentMessage.icon as any} size={14} color={currentMessage.color} />
          </View>
          <Text style={styles.socialProofText} numberOfLines={1}>
            {currentMessage.text}
          </Text>
        </Animated.View>

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
            <Image 
              source={require('../../assets/ashley_nusrala.png')} 
              style={styles.testimonialAvatar}
            />
            <View>
              <Text style={styles.testimonialName}>Ashley Nusrala</Text>
              <Text style={styles.testimonialRole}>Extension Specialist, Los Angeles</Text>
            </View>
          </View>
        </View>

        <View style={styles.guaranteeSection}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={styles.guaranteeText}>
            Cancel anytime during your trial
          </Text>
        </View>

        {checkoutToken && (
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerifySubscription}
          >
            <Text style={styles.verifyButtonText}>Already completed checkout? Tap here</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaButton, isLoading && styles.ctaButtonDisabled]}
          onPress={handleCheckout}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
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
  socialProofBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: spacing.md,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '90%',
  },
  socialProofIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialProofText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
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
    marginBottom: spacing.sm,
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
  verifyButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  verifyButtonText: {
    color: colors.primary,
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
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
