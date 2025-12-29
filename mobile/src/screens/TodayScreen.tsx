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
import { Ionicons } from '@expo/vector-icons';
import { postsApi, streakApi, profileApi } from '../services/api';
import { colors, borderRadius, shadows, spacing, glassCard } from '../theme';

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
}

interface UserProfile {
  city?: string;
  postingServices?: string[];
}

const getCategoryColor = (category: string) => {
  return colors.categories[category] || { bg: colors.surfaceSecondary, text: colors.textSecondary };
};

export default function TodayScreen() {
  const queryClient = useQueryClient();
  const [markedToday, setMarkedToday] = useState(false);

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts', 'today'],
    queryFn: postsApi.getToday,
  });

  const { data: streakData } = useQuery<StreakData>({
    queryKey: ['streak'],
    queryFn: streakApi.get,
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });

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
      Alert.alert('Great job!', 'Your post has been logged. Keep up the streak!');
    },
    onError: () => {
      Alert.alert('Error', 'Could not log your post. Please try again.');
    },
  });

  const handleShare = async (post: Post) => {
    try {
      const personalTags = getPersonalizedHashtags();
      const baseTags = post.hashtags.slice(0, 5 - personalTags.length);
      const allHashtags = [...personalTags, ...baseTags];
      await Share.share({
        message: `${post.description}\n\n${allHashtags.join(' ')}`,
        title: post.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyCaption = async (post: Post) => {
    const personalTags = getPersonalizedHashtags();
    const baseTags = post.hashtags.slice(0, 5 - personalTags.length);
    const allHashtags = [...personalTags, ...baseTags];
    const caption = `${post.description}\n\n${allHashtags.join(' ')}`;
    await Share.share({ message: caption });
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {streakData && (
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Ionicons name="flame" size={24} color={colors.primary} />
            <Text style={styles.streakTitle}>Your Streak</Text>
          </View>
          <View style={styles.streakStats}>
            <View style={styles.streakStat}>
              <Text style={styles.streakNumber}>{streakData.currentStreak}</Text>
              <Text style={styles.streakLabel}>Current</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakStat}>
              <Text style={styles.streakNumber}>{streakData.longestStreak}</Text>
              <Text style={styles.streakLabel}>Best</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakStat}>
              <Text style={styles.streakNumber}>{streakData.totalPosts}</Text>
              <Text style={styles.streakLabel}>Total</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.card}>
        <TouchableOpacity
          style={[styles.postedCircle, markedToday && styles.postedCircleDone]}
          onPress={() => markCompleteMutation.mutate(todayPost.id)}
          disabled={markedToday || markCompleteMutation.isPending}
        >
          {markCompleteMutation.isPending ? (
            <ActivityIndicator size="small" color={markedToday ? colors.textOnPrimary : colors.primary} />
          ) : (
            <>
              <Ionicons 
                name={markedToday ? "checkmark" : "checkmark"} 
                size={18} 
                color={markedToday ? colors.textOnPrimary : colors.primary} 
              />
              <Text style={[styles.postedCircleText, markedToday && styles.postedCircleTextDone]}>
                {markedToday ? "Posted" : "Post"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{todayPost.contentType}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getCategoryColor(todayPost.category).bg }]}>
            <Text style={[styles.badgeText, { color: getCategoryColor(todayPost.category).text }]}>{todayPost.category}</Text>
          </View>
        </View>

        <Text style={styles.title}>{todayPost.title}</Text>
        <Text style={styles.description}>{todayPost.description}</Text>

        <View style={styles.hashtagsContainer}>
          {(() => {
            const personalTags = getPersonalizedHashtags();
            const baseTags = todayPost.hashtags.slice(0, 5 - personalTags.length);
            const allHashtags = [...personalTags, ...baseTags];
            return allHashtags.map((tag: string, index: number) => (
              <View key={index} style={styles.hashtag}>
                <Text style={styles.hashtagText}>{tag}</Text>
              </View>
            ));
          })()}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCopyCaption(todayPost)}
          >
            <Ionicons name="copy-outline" size={20} color={colors.primary} />
            <Text style={styles.actionText}>Copy Caption</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(todayPost)}
          >
            <Ionicons name="share-outline" size={20} color={colors.primary} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

      </View>

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
  card: {
    ...glassCard,
    padding: spacing.xl,
    position: 'relative',
  },
  postedCircle: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.glass.backgroundLight,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  postedCircleDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  postedCircleText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 1,
  },
  postedCircleTextDone: {
    color: colors.textOnPrimary,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
  },
  badgeText: {
    color: colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  hashtag: {
    backgroundColor: colors.glass.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.glass.borderAccent,
  },
  hashtagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.glass.backgroundLight,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.glass.borderAccent,
  },
  actionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...glassCard,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  streakCard: {
    ...glassCard,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  streakStat: {
    alignItems: 'center',
    flex: 1,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  streakLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
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
