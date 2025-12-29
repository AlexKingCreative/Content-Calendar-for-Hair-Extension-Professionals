import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { trendsApi } from '../services/api';
import { colors, borderRadius, shadows, spacing, glassCard } from '../theme';

interface TrendAlert {
  id: number;
  title: string;
  description: string;
  videoUrl?: string;
  instagramUrl?: string;
  isActive: boolean;
  publishedAt?: string;
  expiresAt?: string;
}

export default function TrendsScreen() {
  const { data: trends = [], isLoading } = useQuery<TrendAlert[]>({
    queryKey: ['trends'],
    queryFn: trendsApi.getAll,
  });

  const activeTrends = trends.filter(t => t.isActive);

  const openUrl = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expireDate = new Date(expiresAt);
    const now = new Date();
    const diffDays = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading trends...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="trending-up" size={28} color={colors.primary} />
        <Text style={styles.headerTitle}>Trend Alerts</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Hot trends to jump on before they expire
      </Text>

      {activeTrends.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="sparkles-outline" size={64} color={colors.borderLight} />
          <Text style={styles.emptyTitle}>No Active Trends</Text>
          <Text style={styles.emptyDescription}>
            Check back soon for the latest trending content ideas
          </Text>
        </View>
      ) : (
        <View style={styles.trendsList}>
          {activeTrends.map((trend) => (
            <View key={trend.id} style={styles.trendCard}>
              {isExpiringSoon(trend.expiresAt) && (
                <View style={styles.urgentBadge}>
                  <Ionicons name="time-outline" size={12} color={colors.textOnPrimary} />
                  <Text style={styles.urgentText}>Expiring Soon</Text>
                </View>
              )}
              
              <Text style={styles.trendTitle}>{trend.title}</Text>
              <Text style={styles.trendDescription}>{trend.description}</Text>
              
              {trend.publishedAt && (
                <Text style={styles.trendDate}>
                  Posted {format(new Date(trend.publishedAt), 'MMM d, yyyy')}
                </Text>
              )}

              {trend.expiresAt && (
                <View style={styles.expiresRow}>
                  <Ionicons name="hourglass-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.expiresText}>
                    Expires {format(new Date(trend.expiresAt), 'MMM d')}
                  </Text>
                </View>
              )}

              <View style={styles.actionButtons}>
                {trend.videoUrl && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => openUrl(trend.videoUrl!)}
                  >
                    <Ionicons name="play-circle-outline" size={20} color={colors.primary} />
                    <Text style={styles.actionButtonText}>Watch Video</Text>
                  </TouchableOpacity>
                )}
                {trend.instagramUrl && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => openUrl(trend.instagramUrl!)}
                  >
                    <Ionicons name="logo-instagram" size={20} color="#E1306C" />
                    <Text style={styles.actionButtonText}>View Post</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
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
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  trendsList: {
    gap: spacing.lg,
  },
  trendCard: {
    ...glassCard,
    padding: spacing.lg,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.error,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  trendTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  trendDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  trendDate: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  expiresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  expiresText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.glass.backgroundDark,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
});
