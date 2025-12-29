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
import { postsApi } from '../services/api';
import { RootStackParamList } from '../navigation';

type PostDetailRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

export default function PostDetailScreen() {
  const route = useRoute<PostDetailRouteProp>();
  const { postId } = route.params;

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsApi.getById(postId),
  });

  const handleCopyCaption = async () => {
    if (!post) return;
    const caption = `${post.description}\n\n${post.hashtags.join(' ')}`;
    await Share.share({ message: caption });
  };

  const handleShare = async () => {
    if (!post) return;
    await Share.share({
      message: `${post.description}\n\n${post.hashtags.join(' ')}`,
      title: post.title,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4A574" />
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
          {post.hashtags.map((tag: string, index: number) => (
            <View key={index} style={styles.hashtag}>
              <Text style={styles.hashtagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCopyCaption}>
          <Ionicons name="copy-outline" size={20} color="#D4A574" />
          <Text style={styles.actionText}>Copy Caption</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Share</Text>
        </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
  },
  errorText: {
    fontSize: 16,
    color: '#8B7355',
  },
  header: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
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
  date: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D4E3C',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 12,
  },
  captionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#5D4E3C',
    lineHeight: 24,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  hashtagText: {
    color: '#D4A574',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  actionText: {
    color: '#D4A574',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#D4A574',
    borderColor: '#D4A574',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
