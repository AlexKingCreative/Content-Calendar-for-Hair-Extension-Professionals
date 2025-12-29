import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { postsApi, profileApi } from '../services/api';
import { RootStackParamList } from '../navigation';
import { colors, borderRadius, shadows, spacing, glassCard } from '../theme';

interface UserProfile {
  city?: string;
  postingServices?: string[];
}

type PostDetailRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

export default function PostDetailScreen() {
  const route = useRoute<PostDetailRouteProp>();
  const { postId } = route.params;

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsApi.getById(postId),
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

  const handleCopyCaption = async () => {
    if (!post) return;
    const personalTags = getPersonalizedHashtags();
    const baseTags = post.hashtags.slice(0, 5 - personalTags.length);
    const allHashtags = [...personalTags, ...baseTags];
    const caption = `${post.description}\n\n${allHashtags.join(' ')}`;
    await Share.share({ message: caption });
  };

  const handleShare = async () => {
    if (!post) return;
    const personalTags = getPersonalizedHashtags();
    const baseTags = post.hashtags.slice(0, 5 - personalTags.length);
    const allHashtags = [...personalTags, ...baseTags];
    await Share.share({
      message: `${post.description}\n\n${allHashtags.join(' ')}`,
      title: post.title,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{post.contentType}</Text>
        </View>
        <View style={[styles.badge, styles.categoryBadge]}>
          <Text style={styles.categoryBadgeText}>{post.category}</Text>
        </View>
      </View>

      <Text style={styles.date}>{post.date}</Text>
      <Text style={styles.title}>{post.title}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Caption</Text>
        <View style={styles.captionCard}>
          <Text style={styles.description}>{post.description}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hashtags</Text>
        <View style={styles.hashtagsContainer}>
          {(() => {
            const personalTags = getPersonalizedHashtags();
            const baseTags = post.hashtags.slice(0, 5 - personalTags.length);
            const allHashtags = [...personalTags, ...baseTags];
            return allHashtags.map((tag: string, index: number) => (
              <View key={index} style={styles.hashtag}>
                <Text style={styles.hashtagText}>{tag}</Text>
              </View>
            ));
          })()}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCopyCaption}>
          <Ionicons name="copy-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Copy Caption</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={colors.textOnPrimary} />
          <Text style={styles.primaryButtonText}>Share</Text>
        </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  badgeText: {
    color: colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: colors.surfaceSecondary,
  },
  categoryBadgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  captionCard: {
    ...glassCard,
    padding: spacing.lg,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hashtag: {
    backgroundColor: colors.glass.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  hashtagText: {
    color: colors.primary,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.glass.background,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
