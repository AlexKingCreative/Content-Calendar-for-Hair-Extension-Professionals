import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  onContinue?: () => void;
  isAuthenticated?: boolean;
}

export default function WelcomeScreen({ onContinue, isAuthenticated }: WelcomeScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(30)).current;
  const floatingAnim1 = useRef(new Animated.Value(0)).current;
  const floatingAnim2 = useRef(new Animated.Value(0)).current;
  const floatingAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buttonTranslateY, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const createFloatingAnimation = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createFloatingAnimation(floatingAnim1, 0);
    createFloatingAnimation(floatingAnim2, 500);
    createFloatingAnimation(floatingAnim3, 1000);
  }, []);

  const handleGetStarted = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigation.navigate('Onboarding');
    }
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <Animated.View
          style={[
            styles.floatingIcon,
            styles.floatingIcon1,
            {
              transform: [
                {
                  translateY: floatingAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -15],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="sparkles" size={24} color="#D4A574" />
        </Animated.View>
        <Animated.View
          style={[
            styles.floatingIcon,
            styles.floatingIcon2,
            {
              transform: [
                {
                  translateY: floatingAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="heart" size={20} color="#E8B4A0" />
        </Animated.View>
        <Animated.View
          style={[
            styles.floatingIcon,
            styles.floatingIcon3,
            {
              transform: [
                {
                  translateY: floatingAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -12],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="star" size={22} color="#C9A67A" />
        </Animated.View>
      </View>

      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }, { rotate: spin }],
              },
            ]}
          >
            <View style={styles.logoInner}>
              <Ionicons name="calendar" size={48} color="#FFFFFF" />
            </View>
          </Animated.View>

          <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
            Content Calendar
          </Animated.Text>
          <Animated.Text style={[styles.titleAccent, { opacity: titleOpacity }]}>
            for Hair Pros
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
            Monthly ready-to-post content ideas designed specifically for hair extension professionals
          </Animated.Text>
        </View>

        <Animated.View
          style={[
            styles.buttonSection,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            },
          ]}
        >
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonText}>{isAuthenticated ? "Let's Go" : "Get Started Free"}</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {!isAuthenticated && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleSignIn}>
              <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          )}

          {!isAuthenticated && (
            <Text style={styles.trialText}>
              7-day free trial, then $10/month
            </Text>
          )}
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Created by Ashley Diana</Text>
        <Text style={styles.footerSubtext}>@missashleyhair</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  floatingIcon: {
    position: 'absolute',
    opacity: 0.6,
  },
  floatingIcon1: {
    top: '15%',
    left: '10%',
  },
  floatingIcon2: {
    top: '25%',
    right: '15%',
  },
  floatingIcon3: {
    top: '35%',
    left: '75%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logoInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5D4E3C',
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: 28,
    fontWeight: '600',
    color: '#D4A574',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  buttonSection: {
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4A574',
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#8B7355',
    fontSize: 15,
    fontWeight: '500',
  },
  trialText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#A89580',
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#8B7355',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 13,
    color: '#A89580',
    marginTop: 2,
  },
});
