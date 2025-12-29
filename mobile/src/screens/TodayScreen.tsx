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
        <ActivityIndicator size="large" color="#D4A574" />
      </View>
    );
  }

  if (error || !posts || posts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={64} color="#D4A574" />
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
            <Ionicons name="flame" size={24} color="#D4A574" />
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
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{todayPost.contentType}</Text>
          </View>
          <View style={[styles.badge, styles.categoryBadge]}>
            <Text style={styles.categoryBadgeText}>{todayPost.category}</Text>
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
            <Ionicons name="copy-outline" size={20} color="#D4A574" />
            <Text style={styles.actionText}>Copy Caption</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(todayPost)}
          >
            <Ionicons name="share-outline" size={20} color="#D4A574" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.markCompleteButton, markedToday && styles.markCompleteButtonDone]}
          onPress={() => markCompleteMutation.mutate(todayPost.id)}
          disabled={markedToday || markCompleteMutation.isPending}
        >
          <Ionicons 
            name={markedToday ? "checkmark-circle" : "checkmark-circle-outline"} 
            size={24} 
            color={markedToday ? "#FFFFFF" : "#D4A574"} 
          />
          <Text style={[styles.markCompleteText, markedToday && styles.markCompleteTextDone]}>
            {markedToday ? "Posted Today!" : markCompleteMutation.isPending ? "Logging..." : "Mark as Posted"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipCard}>
        <Ionicons name="bulb-outline" size={24} color="#D4A574" />
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
    backgroundColor: '#FFF8F0',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D4E3C',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#8B7355',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#D4A574',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: '#F5EDE4',
  },
  categoryBadgeText: {
    color: '#8B7355',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D4E3C',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B5B4C',
    lineHeight: 24,
    marginBottom: 16,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  hashtag: {
    backgroundColor: '#F5EDE4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hashtagText: {
    color: '#D4A574',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF8F0',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  actionText: {
    color: '#D4A574',
    fontSize: 14,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  streakCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E3C',
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
    fontWeight: 'bold',
    color: '#D4A574',
  },
  streakLabel: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 4,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F5EDE4',
  },
  markCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF8F0',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4A574',
    marginTop: 16,
  },
  markCompleteButtonDone: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  markCompleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4A574',
  },
  markCompleteTextDone: {
    color: '#FFFFFF',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#8B7355',
    lineHeight: 18,
  },
});
