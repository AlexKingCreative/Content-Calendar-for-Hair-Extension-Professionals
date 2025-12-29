import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, glassCard } from '../theme';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How do I use the content calendar?',
    answer: 'The calendar shows daily post ideas for your hair extension business. Tap on any day to see the full post details including caption ideas, hashtags, and content type recommendations. Use the Today tab to see what to post right now.',
  },
  {
    question: 'How do streaks work?',
    answer: 'Streaks track your posting consistency. When you post content and mark it as "Posted" in the app, your streak increases. Post daily to build longer streaks and unlock milestone rewards. Your current and longest streaks are shown on the Streaks tab.',
  },
  {
    question: 'How do I mark a post as complete?',
    answer: 'On the Today screen, tap the circular "Post" button in the top right corner of the post card after you\'ve published your content to social media. This logs your post and updates your streak.',
  },
  {
    question: 'What are the different content types?',
    answer: 'Content types include: Carousel (multi-image posts), Reel (short video), Static (single image), Story (24-hour content), and Video (longer format). Each type is optimized for different engagement goals.',
  },
  {
    question: 'How do I customize my hashtags?',
    answer: 'Your city-based hashtags are generated based on your profile settings. Go to Settings > Manage Account on the web app to update your location and get personalized local hashtags.',
  },
  {
    question: 'What is the AI caption feature?',
    answer: 'The "Write My Caption" button uses AI to generate personalized captions based on the post topic and your business type. You can edit the generated caption before copying it to use on social media.',
  },
  {
    question: 'Why can\'t I see future months?',
    answer: 'The calendar only shows the current month and past months to keep you focused on what to post now. As each new month begins, that month\'s content becomes available.',
  },
  {
    question: 'How do I upgrade my plan?',
    answer: 'Go to Settings > Upgrade Plan to access premium features. If you encounter any issues, try signing out and back in to refresh your session.',
  },
  {
    question: 'I\'m getting an error when trying to log posts',
    answer: 'This usually means your session has expired. Go to Settings, tap "Sign Out", then sign back in with your email and password. This will refresh your authentication.',
  },
  {
    question: 'How do I contact support?',
    answer: 'For additional help, email us at support@contentcalendarforhairpros.com. We typically respond within 24-48 hours.',
  },
];

function FAQItemComponent({ item }: { item: FAQItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.primary}
        />
      </View>
      {expanded && (
        <Text style={styles.faqAnswer}>{item.answer}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function HelpScreen() {
  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@contentcalendarforhairpros.com?subject=Help Request');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="help-circle" size={48} color={colors.primary} />
        <Text style={styles.title}>Help Center</Text>
        <Text style={styles.subtitle}>Find answers to common questions</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
          {faqData.map((item, index) => (
            <FAQItemComponent key={index} item={item} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Still Need Help?</Text>
        <TouchableOpacity style={styles.contactCard} onPress={handleEmailSupport}>
          <View style={styles.contactIcon}>
            <Ionicons name="mail" size={24} color={colors.primary} />
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactDescription}>
              Get help from our support team
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Response time: 24-48 hours
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  faqContainer: {
    ...glassCard,
    overflow: 'hidden',
  },
  faqItem: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    ...glassCard,
    padding: spacing.lg,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 165, 116, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  contactDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});
