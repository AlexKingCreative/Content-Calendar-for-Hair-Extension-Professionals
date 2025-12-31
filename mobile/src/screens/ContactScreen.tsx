import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../theme';

export default function ContactScreen() {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isSubmitted ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={40} color="#059669" />
              </View>
              <Text style={styles.successTitle}>Thank You!</Text>
              <Text style={styles.successText}>
                Your message has been sent successfully. We'll respond within 24-48 hours.
              </Text>
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>Send Another Message</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.introTitle}>Get in Touch</Text>
              <Text style={styles.introText}>
                Have a question, suggestion, or feedback? We'd love to hear from you! 
                Fill out the form and we'll get back to you as soon as possible.
              </Text>

              <View style={styles.contactCards}>
                <View style={styles.contactCard}>
                  <View style={styles.contactCardIcon}>
                    <Ionicons name="mail" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.contactCardContent}>
                    <Text style={styles.contactCardTitle}>Email Support</Text>
                    <Text style={styles.contactCardText}>For general inquiries and support</Text>
                    <Text style={styles.contactCardEmail}>support@hairpro360.com</Text>
                  </View>
                </View>

                <View style={styles.contactCard}>
                  <View style={styles.contactCardIcon}>
                    <Ionicons name="chatbubbles" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.contactCardContent}>
                    <Text style={styles.contactCardTitle}>Feature Requests</Text>
                    <Text style={styles.contactCardText}>
                      We're always looking to improve! Share your ideas with us.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor={colors.textTertiary}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Subject</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="What's this about?"
                    placeholderTextColor={colors.textTertiary}
                    value={formData.subject}
                    onChangeText={(text) => setFormData({ ...formData, subject: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Message</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Tell us more..."
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={formData.message}
                    onChangeText={(text) => setFormData({ ...formData, message: text })}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Text style={styles.submitButtonText}>Sending...</Text>
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color={colors.textOnPrimary} />
                      <Text style={styles.submitButtonText}>Send Message</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  introText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  contactCards: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactCardIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  contactCardContent: {
    flex: 1,
  },
  contactCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  contactCardText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  contactCardEmail: {
    fontSize: 13,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  formCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.sm,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  successText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
});
