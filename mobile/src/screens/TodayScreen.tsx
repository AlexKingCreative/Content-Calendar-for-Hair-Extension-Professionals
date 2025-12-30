import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { postsApi, streakApi, profileApi } from '../services/api';
import { colors, borderRadius, spacing } from '../theme';

interface Post {
  id: number;
  date: string;
  title: string;
  description: string;
  category: string;
  contentType: string;
  hashtags: string[];
  serviceCategory: string;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalPosts: number;
  postingGoal: string;
  hasPostedToday: boolean;
}

interface UserProfile {
  city?: string;
  postingServices?: string[];
}

const getCategoryColor = (category: string) => {
  const categoryColors: Record<string, { bg: string; text: string }> = {
    'Tips & Tricks': { bg: '#FEF3C7', text: '#92400E' },
    'Behind the Scenes': { bg: '#DBEAFE', text: '#1E40AF' },
    'Transformation': { bg: '#FCE7F3', text: '#9D174D' },
    'Education': { bg: '#D1FAE5', text: '#065F46' },
    'Promotion': { bg: '#FEE2E2', text: '#991B1B' },
    'Engagement': { bg: '#E0E7FF', text: '#3730A3' },
  };
  return categoryColors[category] || { bg: '#F3F4F6', text: '#4B5563' };
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export default function TodayScreen() {
  const queryClient = useQueryClient();
  const [markedToday, setMarkedToday] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts', 'today'],
    queryFn: postsApi.getToday,
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });

  const { data: streak } = useQuery<StreakData>({
    queryKey: ['streak'],
    queryFn: streakApi.get,
  });

  const hasPostedToday = streak?.hasPostedToday || markedToday;

  const getPersonalizedHashtags = () => {
    const personalizedTags: string[] = [];
    const userCity = profile?.city?.toLowerCase().replace(/[^a-z]/g, '') || '';
    const hasExtensions = profile?.postingServices?.includes('Extension Services');
    
    if (userCity) {
      personalizedTags.push(`#${userCity}hairstylist`);
      if (hasExtensions) {
        personalizedTags.push(`#${userCity}hairextensions`);
      }
    }
    return personalizedTags;
  };

  const markCompleteMutation = useMutation({
    mutationFn: (postId: number) => streakApi.logPost(postId),
    onSuccess: () => {
      setMarkedToday(true);
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Great job!', 'Your post has been logged. Keep up the streak!');
    },
    onError: () => {
      Alert.alert('Error', 'Could not log your post. Please try again.');
    },
  });

  const handleCopyHashtags = async (post: Post) => {
    const personalTags = getPersonalizedHashtags();
    const baseTags = post.hashtags.slice(0, 5 - personalTags.length);
    const allHashtags = [...personalTags, ...baseTags];
    await Clipboard.setStringAsync(allHashtags.join(' '));
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2000);
  };

  const handleWriteCaption = async (post: Post) => {
    Alert.alert('Coming Soon', 'AI Caption Generator will be available soon!');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !posts || posts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={64} color={colors.primary} />
        <Text style={styles.emptyTitle}>No Post for Today</Text>
        <Text style={styles.emptyText}>Check back tomorrow for new content ideas!</Text>
      </View>
    );
  }

  const todayPost = Array.isArray(posts) ? posts[0] : posts;
  const personalTags = getPersonalizedHashtags();
  const baseTags = todayPost.hashtags.slice(0, 5 - personalTags.length);
  const allHashtags = [...personalTags, ...baseTags];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Post</Text>
        <Text style={styles.headerDate}>{formatDate(todayPost.date)}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.title}>{todayPost.title}</Text>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: getCategoryColor(todayPost.category).bg }]}>
                <Ionicons name="bulb-outline" size={12} color={getCategoryColor(todayPost.category).text} style={styles.badgeIcon} />
                <Text style={[styles.badgeText, { color: getCategoryColor(todayPost.category).text }]}>{todayPost.category}</Text>
              </View>
              <View style={styles.badgeOutline}>
                <Text style={styles.badgeOutlineText}>{todayPost.contentType}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.description}>{todayPost.description}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested Hashtags</Text>
          <TouchableOpacity onPress={() => handleCopyHashtags(todayPost)} style={styles.copyButton}>
            <Ionicons name={copiedHashtags ? "checkmark" : "copy-outline"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.hashtagsContainer}>
          {allHashtags.map((tag: string, index: number) => (
            <View key={index} style={styles.hashtag}>
              <Text style={styles.hashtagText}># {tag.replace('#', '')}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Caption Generator</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => handleWriteCaption(todayPost)}>
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Write My Caption</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.markPostedButton, hasPostedToday && styles.markPostedButtonDone]}
        onPress={() => markCompleteMutation.mutate(todayPost.id)}
        disabled={hasPostedToday || markCompleteMutation.isPending}
      >
        {markCompleteMutation.isPending ? (
          <ActivityIndicator size="small" color={hasPostedToday ? "#FFFFFF" : colors.primary} />
        ) : (
          <>
            <Ionicons 
              name={hasPostedToday ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={24} 
              color={hasPostedToday ? "#FFFFFF" : colors.primary} 
            />
            <Text style={[styles.markPostedText, hasPostedToday && styles.markPostedTextDone]}>
              {hasPostedToday ? "Posted!" : "Mark as Posted"}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.tipCard}>
        <Ionicons name="bulb-outline" size={24} color={colors.primary} />
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>Pro Tip</Text>
          <Text style={styles.tipText}>
            Post during peak engagement hours (9-11 AM or 7-9 PM) for maximum reach!
          </Text>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xxl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardHeaderText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgeOutline: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  badgeOutlineText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  copyButton: {
    padding: spacing.sm,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hashtag: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  hashtagText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  markPostedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  markPostedButtonDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  markPostedText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  markPostedTextDone: {
    color: '#FFFFFF',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
