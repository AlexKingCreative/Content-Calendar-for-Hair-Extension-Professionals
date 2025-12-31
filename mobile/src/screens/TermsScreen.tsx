import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../theme';

export default function TermsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last updated: December 28, 2025</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionText}>
            By accessing and using Content Calendar for Hair Pros ("the App"), 
            you accept and agree to be bound by the terms and provisions of this agreement. 
            If you do not agree to these terms, please do not use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.sectionText}>
            Content Calendar for Hair Pros is a social media content planning 
            application designed for hair professionals. The App provides:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Monthly pre-planned social media post ideas</Text>
            <Text style={styles.bulletItem}>• AI-powered caption generation</Text>
            <Text style={styles.bulletItem}>• Personalized hashtag recommendations</Text>
            <Text style={styles.bulletItem}>• Content filtering and organization tools</Text>
            <Text style={styles.bulletItem}>• Push notification reminders</Text>
            <Text style={styles.bulletItem}>• Posting streak tracking</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.sectionText}>
            To access certain features of the App, you may be required to create an account. 
            You are responsible for maintaining the confidentiality of your account credentials 
            and for all activities that occur under your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Acceptable Use</Text>
          <Text style={styles.sectionText}>You agree not to:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Use the App for any unlawful purpose</Text>
            <Text style={styles.bulletItem}>• Attempt to gain unauthorized access to the App or its systems</Text>
            <Text style={styles.bulletItem}>• Interfere with or disrupt the App or servers</Text>
            <Text style={styles.bulletItem}>• Copy, modify, or distribute App content without permission</Text>
            <Text style={styles.bulletItem}>• Use the App to harass, abuse, or harm others</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
          <Text style={styles.sectionText}>
            The App and its original content, features, and functionality are owned by 
            Content Calendar for Hair Pros and are protected by international 
            copyright, trademark, and other intellectual property laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. User-Generated Content</Text>
          <Text style={styles.sectionText}>
            You retain ownership of any content you create using the App. By using our AI 
            caption generation features, you grant us permission to process your inputs to 
            provide the service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Third-Party Services</Text>
          <Text style={styles.sectionText}>
            The App may contain links to third-party websites or services (such as Instagram 
            examples). We are not responsible for the content or practices of these third-party sites.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Disclaimer of Warranties</Text>
          <Text style={styles.sectionText}>
            The App is provided "as is" without warranties of any kind, either express or implied. 
            We do not guarantee that the App will be uninterrupted, error-free, or secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            In no event shall Content Calendar for Hair Pros be liable for 
            any indirect, incidental, special, consequential, or punitive damages resulting 
            from your use of the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
          <Text style={styles.sectionText}>
            We reserve the right to modify these terms at any time. Continued use of the App 
            after changes constitutes acceptance of the new terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Governing Law</Text>
          <Text style={styles.sectionText}>
            These terms shall be governed by and construed in accordance with the laws of 
            the United States, without regard to its conflict of law provisions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Contact</Text>
          <Text style={styles.sectionText}>
            If you have questions about these Terms & Conditions, please contact us through 
            our Contact page or email us at support@hairpro360.com.
          </Text>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  lastUpdated: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bulletList: {
    marginTop: spacing.sm,
  },
  bulletItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 24,
    paddingLeft: spacing.sm,
  },
});
