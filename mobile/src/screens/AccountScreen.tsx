import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../services/api';
import { RootStackParamList } from '../navigation';
import { colors, borderRadius, shadows, spacing, glassCard } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner (0-2 years)' },
  { value: 'intermediate', label: 'Intermediate (3-5 years)' },
  { value: 'advanced', label: 'Advanced (6-10 years)' },
  { value: 'expert', label: 'Expert (10+ years)' },
];

const VOICE_OPTIONS = [
  { value: 'solo_stylist', label: 'Solo Stylist (I/me)' },
  { value: 'salon_team', label: 'Salon Team (we/us)' },
];

const TONE_OPTIONS = [
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'luxury', label: 'Luxury & High-End' },
  { value: 'fun', label: 'Fun & Playful' },
];

export default function AccountScreen() {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const [city, setCity] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [experience, setExperience] = useState('');
  const [voice, setVoice] = useState('solo_stylist');
  const [tone, setTone] = useState('neutral');
  const [hasChanges, setHasChanges] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });

  useEffect(() => {
    if (profile) {
      setCity(profile.city || '');
      setInstagramHandle(profile.instagramHandle || '');
      setExperience(profile.experience || '');
      setVoice(profile.voice || 'solo_stylist');
      setTone(profile.tone || 'neutral');
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: profileApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setHasChanges(false);
      Alert.alert('Success', 'Your profile has been updated');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    },
  });

  const handleFieldChange = (field: string, value: string) => {
    setHasChanges(true);
    switch (field) {
      case 'city':
        setCity(value);
        break;
      case 'instagramHandle':
        setInstagramHandle(value);
        break;
      case 'experience':
        setExperience(value);
        break;
      case 'voice':
        setVoice(value);
        break;
      case 'tone':
        setTone(value);
        break;
    }
  };

  const handleSave = () => {
    saveMutation.mutate({
      city,
      instagramHandle,
      experience,
      voice,
      tone,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!hasChanges || saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={[styles.saveButtonText, !hasChanges && styles.saveButtonTextDisabled]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={(value) => handleFieldChange('city', value)}
              placeholder="Enter your city"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <Text style={styles.helperText}>
            Used for location-based hashtags in your captions
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instagram</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.atSymbol}>@</Text>
            <TextInput
              style={styles.input}
              value={instagramHandle}
              onChangeText={(value) => handleFieldChange('instagramHandle', value)}
              placeholder="your_handle"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience Level</Text>
          <View style={styles.optionsGrid}>
            {EXPERIENCE_LEVELS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  experience === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => handleFieldChange('experience', option.value)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    experience === option.value && styles.optionButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Caption Voice</Text>
          <Text style={styles.sectionDescription}>
            How should AI captions refer to you?
          </Text>
          <View style={styles.optionsGrid}>
            {VOICE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  voice === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => handleFieldChange('voice', option.value)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    voice === option.value && styles.optionButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caption Tone</Text>
          <View style={styles.optionsGrid}>
            {TONE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  tone === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => handleFieldChange('tone', option.value)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    tone === option.value && styles.optionButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.border,
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
  saveButtonTextDisabled: {
    color: colors.textTertiary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  atSymbol: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  helperText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionButtonText: {
    fontSize: 13,
    color: colors.text,
  },
  optionButtonTextSelected: {
    color: colors.background,
    fontWeight: '500',
  },
});
