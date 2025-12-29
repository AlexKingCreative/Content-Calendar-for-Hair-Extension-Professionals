import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { postsApi } from '../services/api';
import { RootStackParamList } from '../navigation';
import { colors, borderRadius, shadows, spacing, glassCard } from '../theme';

interface Post {
  id: number;
  date: string;
  day: number;
  title: string;
  description: string;
  category: string;
  contentType: string;
  hashtags: string[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', 'month', selectedMonth],
    queryFn: () => postsApi.getByMonth(selectedMonth),
  });

  const filteredPosts = React.useMemo(() => {
    if (!posts) return [];
    return posts.filter((post: Post) => {
      if (selectedMonth === currentMonth) {
        return post.day >= currentDay;
      }
      return true;
    });
  }, [posts, selectedMonth, currentMonth, currentDay]);

  const canGoForward = selectedMonth < currentMonth;

  const handlePostPress = (postId: number) => {
    navigation.navigate('PostDetail', { postId });
  };

  const getCategoryColor = (category: string) => {
    return colors.categories[category] || { bg: colors.surfaceSecondary, text: colors.textSecondary };
  };

  const renderPost = ({ item }: { item: Post }) => {
    const categoryColor = getCategoryColor(item.category);
    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => handlePostPress(item.id)}
      >
        <View style={styles.postDate}>
          <Text style={styles.postDay}>{item.day}</Text>
        </View>
        <View style={styles.postContent}>
          <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.postDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.postMeta}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{item.contentType}</Text>
            </View>
            <View style={[styles.metaBadge, { backgroundColor: categoryColor.bg }]}>
              <Text style={[styles.metaText, { color: categoryColor.text }]}>{item.category}</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthArrow}
          onPress={() => setSelectedMonth(prev => prev > 1 ? prev - 1 : 12)}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTHS[selectedMonth - 1]}</Text>
        <TouchableOpacity
          style={[styles.monthArrow, !canGoForward && styles.monthArrowDisabled]}
          onPress={() => canGoForward && setSelectedMonth(prev => prev + 1)}
          disabled={!canGoForward}
        >
          <Ionicons name="chevron-forward" size={24} color={canGoForward ? colors.primary : colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts for this month</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.glass.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthArrow: {
    padding: spacing.sm,
  },
  monthArrowDisabled: {
    opacity: 0.4,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 120,
  },
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    ...glassCard,
    padding: spacing.lg,
  },
  postDate: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  postDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  postContent: {
    flex: 1,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  postDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  postMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  metaText: {
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
