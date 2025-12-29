import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation';

const { width } = Dimensions.get('window');

const SERVICE_CATEGORIES = [
  { 
    id: 'extensions', 
    label: 'Hair Extensions', 
    icon: 'sparkles' as const,
    description: 'Tape-ins, sew-ins, fusion, etc.',
    color: '#E8B4A0',
  },
  { 
    id: 'toppers', 
    label: 'Hair Toppers', 
    icon: 'flower' as const,
    description: 'Coverage for thinning hair',
    color: '#D4A574',
  },
  { 
    id: 'wigs', 
    label: 'Wigs & Units', 
    icon: 'heart' as const,
    description: 'Full coverage solutions',
    color: '#C9A67A',
  },
  { 
    id: 'coloring', 
    label: 'Color Services', 
    icon: 'color-palette' as const,
    description: 'Balayage, highlights, color',
    color: '#B8A090',
  },
  { 
    id: 'cutting', 
    label: 'Cut & Style', 
    icon: 'cut' as const,
    description: 'Haircuts and styling',
    color: '#A89580',
  },
];

const EXPERIENCE_LEVELS = [
  { id: 'new', label: 'Just Starting Out', description: 'Less than 1 year' },
  { id: 'growing', label: 'Building My Business', description: '1-3 years' },
  { id: 'established', label: 'Established Pro', description: '3-5 years' },
  { id: 'expert', label: 'Industry Expert', description: '5+ years' },
];

const CONTENT_GOALS = [
  { id: 'clients', label: 'Attract More Clients', icon: 'people' as const },
  { id: 'premium', label: 'Book Premium Services', icon: 'diamond' as const },
  { id: 'consistent', label: 'Post Consistently', icon: 'calendar' as const },
  { id: 'brand', label: 'Build My Brand', icon: 'star' as const },
  { id: 'education', label: 'Educate My Audience', icon: 'school' as const },
  { id: 'engagement', label: 'Increase Engagement', icon: 'heart' as const },
];

type OnboardingData = {
  services: string[];
  location: string;
  experience: string;
  goals: string[];
  instagram: string;
};

export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    services: [],
    location: '',
    experience: '',
    goals: [],
    instagram: '',
  });
  const progressAnim = useRef(new Animated.Value(0)).current;

  const totalSteps = 4;

  const animateProgress = (toStep: number) => {
    Animated.spring(progressAnim, {
      toValue: toStep / totalSteps,
      friction: 8,
      useNativeDriver: false,
    }).start();
  };

  const toggleService = (id: string) => {
    setData(prev => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter(s => s !== id)
        : [...prev.services, id],
    }));
  };

  const toggleGoal = (id: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(id)
        ? prev.goals.filter(g => g !== id)
        : [...prev.goals, id],
    }));
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      animateProgress(nextStep);
    } else {
      navigation.navigate('Register');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      animateProgress(prevStep);
    } else {
      navigation.goBack();
    }
  };

  const canContinue = () => {
    switch (step) {
      case 0:
        return data.services.length > 0;
      case 1:
        return data.location.trim().length > 0;
      case 2:
        return data.experience !== '';
      case 3:
        return data.goals.length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What services do you offer?</Text>
            <Text style={styles.stepSubtitle}>
              Select all that apply - we'll personalize your content
            </Text>
            <View style={styles.servicesGrid}>
              {SERVICE_CATEGORIES.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    data.services.includes(service.id) && styles.serviceCardSelected,
                  ]}
                  onPress={() => toggleService(service.id)}
                >
                  <View style={[styles.serviceIconContainer, { backgroundColor: service.color + '20' }]}>
                    <Ionicons
                      name={service.icon}
                      size={28}
                      color={data.services.includes(service.id) ? '#D4A574' : service.color}
                    />
                  </View>
                  <View style={styles.serviceTextContainer}>
                    <Text
                      style={[
                        styles.serviceLabel,
                        data.services.includes(service.id) && styles.serviceLabelSelected,
                      ]}
                    >
                      {service.label}
                    </Text>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  </View>
                  {data.services.includes(service.id) && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Where are you located?</Text>
            <Text style={styles.stepSubtitle}>
              We'll include location-based hashtags for you
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location" size={24} color="#D4A574" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="City, State (e.g., Miami, FL)"
                placeholderTextColor="#A89580"
                value={data.location}
                onChangeText={(text) => setData(prev => ({ ...prev, location: text }))}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="logo-instagram" size={24} color="#E1306C" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Instagram handle (optional)"
                placeholderTextColor="#A89580"
                value={data.instagram}
                onChangeText={(text) => setData(prev => ({ ...prev, instagram: text }))}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>How long have you been styling?</Text>
            <Text style={styles.stepSubtitle}>
              This helps us tailor content to your experience level
            </Text>
            <View style={styles.experienceList}>
              {EXPERIENCE_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.experienceCard,
                    data.experience === level.id && styles.experienceCardSelected,
                  ]}
                  onPress={() => setData(prev => ({ ...prev, experience: level.id }))}
                >
                  <View style={styles.experienceRadio}>
                    {data.experience === level.id && (
                      <View style={styles.experienceRadioInner} />
                    )}
                  </View>
                  <View style={styles.experienceText}>
                    <Text
                      style={[
                        styles.experienceLabel,
                        data.experience === level.id && styles.experienceLabelSelected,
                      ]}
                    >
                      {level.label}
                    </Text>
                    <Text style={styles.experienceDescription}>{level.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What are your content goals?</Text>
            <Text style={styles.stepSubtitle}>
              Select all that apply
            </Text>
            <View style={styles.goalsGrid}>
              {CONTENT_GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    data.goals.includes(goal.id) && styles.goalCardSelected,
                  ]}
                  onPress={() => toggleGoal(goal.id)}
                >
                  <Ionicons
                    name={goal.icon}
                    size={24}
                    color={data.goals.includes(goal.id) ? '#D4A574' : '#8B7355'}
                  />
                  <Text
                    style={[
                      styles.goalLabel,
                      data.goals.includes(goal.id) && styles.goalLabelSelected,
                    ]}
                  >
                    {goal.label}
                  </Text>
                  {data.goals.includes(goal.id) && (
                    <View style={styles.goalCheckmark}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#5D4E3C" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {step + 1} of {totalSteps}
            </Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, !canContinue() && styles.continueButtonDisabled]}
            onPress={handleNext}
            disabled={!canContinue()}
          >
            <Text style={styles.continueButtonText}>
              {step === totalSteps - 1 ? 'Create Account' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    gap: 6,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5D5C5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4A574',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#8B7355',
    textAlign: 'right',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#5D4E3C',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#8B7355',
    marginBottom: 28,
    lineHeight: 22,
  },
  servicesGrid: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceCardSelected: {
    borderColor: '#D4A574',
    backgroundColor: '#FFF8F0',
  },
  serviceIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTextContainer: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: 2,
  },
  serviceLabelSelected: {
    color: '#D4A574',
  },
  serviceDescription: {
    fontSize: 13,
    color: '#A89580',
  },
  checkmark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D4A574',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5D5C5',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#5D4E3C',
  },
  experienceList: {
    gap: 12,
  },
  experienceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    gap: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  experienceCardSelected: {
    borderColor: '#D4A574',
    backgroundColor: '#FFF8F0',
  },
  experienceRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4A574',
    alignItems: 'center',
    justifyContent: 'center',
  },
  experienceRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D4A574',
  },
  experienceText: {
    flex: 1,
  },
  experienceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: 2,
  },
  experienceLabelSelected: {
    color: '#D4A574',
  },
  experienceDescription: {
    fontSize: 13,
    color: '#A89580',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  goalCardSelected: {
    borderColor: '#D4A574',
    backgroundColor: '#FFF8F0',
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5D4E3C',
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: '#D4A574',
  },
  goalCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D4A574',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5D5C5',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4A574',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
