import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
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

const getCategoryColor = (category: string) => {
  return colors.categories[category] || { bg: colors.surfaceSecondary, text: colors.textSecondary };
};

export default function PostDetailScreen() {
  const route = useRoute<PostDetailRouteProp>();
  const { postId } = route.params;
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [captionCopied, setCaptionCopied] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsApi.getById(postId),
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });

  const generateMutation = useMutation({
    mutationFn: () => postsApi.generateCaption(postId),
    onSuccess: (data) => {
      setGeneratedCaption(data.caption);
      Alert.alert("Caption Generated", "Your personalized caption is ready!");
    },
    onError: () => {
      Alert.alert("Error", "Failed to generate caption. Please try again.");
    },
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
    if (!generatedCaption) return;
    await Clipboard.setStringAsync(generatedCaption);
    setCaptionCopied(true);
    Alert.alert("Copied!", "Caption copied to clipboard.");
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  const handleCopyHashtags = async () => {
    if (!post) return;
    const personalTags = getPersonalizedHashtags();
    const baseTags = post.hashtags.slice(0, 5 - personalTags.length);
    const allHashtags = [...personalTags, ...baseTags];
    await Clipboard.setStringAsync(allHashtags.join(' '));
    Alert.alert("Copied!", "Hashtags copied to clipboard.");
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
        <View style={[styles.badge, { backgroundColor: getCategoryColor(post.category).bg }]}>
          <Text style={[styles.badgeText, { color: getCategoryColor(post.category).text }]}>{post.category}</Text>
        </View>
      </View>

      <Text style={styles.date}>{post.date}</Text>
      <Text style={styles.title}>{post.title}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Post Idea</Text>
        <View style={styles.captionCard}>
          <Text style={styles.description}>{post.description}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Caption Generator</Text>
          <Ionicons name="sparkles" size={16} color={colors.primary} />
        </View>
        {!generatedCaption ? (
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.textOnPrimary} />
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color={colors.textOnPrimary} />
                <Text style={styles.generateButtonText}>Write My Caption</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.generatedCaptionContainer}>
            <TextInput
              style={styles.captionInput}
              value={generatedCaption}
              onChangeText={setGeneratedCaption}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.captionActions}>
              <TouchableOpacity
                style={styles.captionActionButton}
                onPress={handleCopyCaption}
              >
                <Ionicons 
                  name={captionCopied ? "checkmark" : "copy-outline"} 
                  size={18} 
                  color={colors.primary} 
                />
                <Text style={styles.captionActionText}>
                  {captionCopied ? "Copied!" : "Copy"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.captionActionButton}
                onPress={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
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

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hashtags</Text>
          <TouchableOpacity onPress={handleCopyHashtags}>
            <Ionicons name="copy-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
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
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.button,
  },
  generateButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  generatedCaptionContainer: {
    ...glassCard,
    padding: spacing.md,
  },
  captionInput: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    minHeight: 100,
    padding: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  captionActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  captionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  captionActionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '500',
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
});
