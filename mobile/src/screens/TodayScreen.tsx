import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  Image,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { postsApi, streakApi, profileApi, adviceApi } from '../services/api';
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
  const [generatedCaption, setGeneratedCaption] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

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

  const { data: ashleysAdvice } = useQuery<{ id: number; advice: string } | null>({
    queryKey: ['ashleys-advice'],
    queryFn: adviceApi.getRandom,
  });

  const hasPostedToday = streak?.hasPostedToday || markedToday;

  useEffect(() => {
    if (hasPostedToday) {
      colorAnim.setValue(1);
      checkAnim.setValue(1);
    }
  }, [hasPostedToday]);

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
      const isFirstPost = !streak?.totalPosts || streak.totalPosts === 0;
      const newStreak = (streak?.currentStreak || 0) + 1;
      
      setMarkedToday(true);
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          friction: 3,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
        }),
      ]).start();

      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      Animated.spring(checkAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
      }).start();

      setTimeout(() => {
        if (isFirstPost) {
          Alert.alert(
            'Your First Post!',
            'Amazing start! Keep posting daily to build your streak and unlock rewards.',
            [{ text: 'Keep Going!' }]
          );
        } else if (newStreak === 7) {
          Alert.alert(
            '7-Day Streak!',
            "Incredible! You've earned the One Week Wonder badge!",
            [{ text: 'Celebrate!' }]
          );
        } else if (newStreak === 14) {
          Alert.alert(
            '14-Day Streak!',
            "Two weeks strong! You've earned the Two Week Warrior badge!",
            [{ text: 'Amazing!' }]
          );
        } else if (newStreak === 30) {
          Alert.alert(
            '30-Day Streak!',
            "A whole month! You've earned the Monthly Master badge!",
            [{ text: 'Incredible!' }]
          );
        }
      }, 500);
    },
    onError: () => {
      Alert.alert('Error', 'Could not log your post. Please try again.');
    },
  });

  const handleMarkPosted = (postId: number) => {
    if (hasPostedToday || markCompleteMutation.isPending) return;
    markCompleteMutation.mutate(postId);
  };

  const handleCopyHashtags = async (post: Post) => {
    const personalTags = getPersonalizedHashtags();
    const baseTags = post.hashtags.slice(0, 5 - personalTags.length);
    const allHashtags = [...personalTags, ...baseTags];
    await Clipboard.setStringAsync(allHashtags.join(' '));
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2000);
  };

  const generateCaptionMutation = useMutation({
    mutationFn: (postId: number) => postsApi.generateCaption(postId),
    onSuccess: (data) => {
      setGeneratedCaption(data.caption);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to generate caption. Please try again.');
    },
  });

  const handleWriteCaption = (postId: number) => {
    generateCaptionMutation.mutate(postId);
  };

  const handleCopyCaption = async () => {
    if (generatedCaption) {
      await Clipboard.setStringAsync(generatedCaption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#22C55E'],
  });

  const borderColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary, '#22C55E'],
  });

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
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Today's Post</Text>
          <Text style={styles.headerDate}>{formatDate(todayPost.date)}</Text>
        </View>
        
        <TouchableOpacity
          onPress={() => handleMarkPosted(todayPost.id)}
          disabled={hasPostedToday || markCompleteMutation.isPending}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.postedButton,
              {
                backgroundColor,
                borderColor,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {markCompleteMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Animated.View style={{ transform: [{ scale: checkAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }] }}>
                  <Ionicons 
                    name={hasPostedToday ? "checkmark" : "checkmark"} 
                    size={20} 
                    color={hasPostedToday ? "#FFFFFF" : colors.primary} 
                  />
                </Animated.View>
                <Text style={[styles.postedButtonText, hasPostedToday && styles.postedButtonTextDone]}>
                  posted
                </Text>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
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
        {!generatedCaption ? (
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => handleWriteCaption(todayPost.id)}
            disabled={generateCaptionMutation.isPending}
          >
            {generateCaptionMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Write My Caption</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{generatedCaption}</Text>
            <View style={styles.captionActions}>
              <TouchableOpacity style={styles.captionActionButton} onPress={handleCopyCaption}>
                <Ionicons name={copiedCaption ? "checkmark" : "copy-outline"} size={18} color={colors.primary} />
                <Text style={styles.captionActionText}>{copiedCaption ? "Copied" : "Copy"}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.captionActionButton} 
                onPress={() => handleWriteCaption(todayPost.id)}
                disabled={generateCaptionMutation.isPending}
              >
                {generateCaptionMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="refresh" size={18} color={colors.primary} />
                    <Text style={styles.captionActionText}>Regenerate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {ashleysAdvice && (
        <View style={styles.adviceCard}>
          <View style={styles.adviceHeader}>
            <Image 
              source={require('../../assets/ashley_nusrala.png')} 
              style={styles.adviceAvatar}
            />
            <View>
              <Text style={styles.adviceTitle}>Ashley's Advice</Text>
              <Text style={styles.adviceHandle}>@missashleyhair</Text>
            </View>
          </View>
          <Text style={styles.adviceText}>{ashleysAdvice.advice}</Text>
        </View>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
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
  postedButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postedButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
    textTransform: 'lowercase',
  },
  postedButtonTextDone: {
    color: '#FFFFFF',
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
  captionContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  captionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  captionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  captionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  captionActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },
  adviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  adviceAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  adviceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  adviceHandle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  adviceText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
