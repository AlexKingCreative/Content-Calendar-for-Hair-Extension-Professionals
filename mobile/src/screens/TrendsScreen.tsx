import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Switch,
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
  isExpired?: boolean;
}

export default function TrendsScreen() {
  const [showExpired, setShowExpired] = useState(false);

  const { data: trends = [], isLoading } = useQuery<TrendAlert[]>({
    queryKey: ['trends', { includeExpired: showExpired }],
    queryFn: () => trendsApi.getAllWithExpired(showExpired),
  });

  const activeTrends = trends.filter(t => !t.isExpired);
  const expiredTrends = trends.filter(t => t.isExpired);

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
    return diffDays <= 2 && diffDays > 0;
  };

  const renderTrendCard = (trend: TrendAlert, isExpired: boolean = false) => (
    <View key={trend.id} style={[styles.trendCard, isExpired && styles.expiredTrendCard]}>
      {isExpired ? (
        <View style={styles.expiredBadge}>
          <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.expiredBadgeText}>Expired</Text>
        </View>
      ) : isExpiringSoon(trend.expiresAt) ? (
        <View style={styles.urgentBadge}>
          <Ionicons name="time-outline" size={12} color={colors.textOnPrimary} />
          <Text style={styles.urgentText}>Expiring Soon</Text>
        </View>
      ) : null}
      
      <Text style={[styles.trendTitle, isExpired && styles.expiredText]}>{trend.title}</Text>
      <Text style={[styles.trendDescription, isExpired && styles.expiredText]}>{trend.description}</Text>
      
      {trend.publishedAt && (
        <Text style={styles.trendDate}>
          Posted {format(new Date(trend.publishedAt), 'MMM d, yyyy')}
        </Text>
      )}

      {trend.expiresAt && (
        <View style={styles.expiresRow}>
          <Ionicons name="hourglass-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.expiresText}>
            {isExpired ? 'Expired' : 'Expires'} {format(new Date(trend.expiresAt), 'MMM d')}
          </Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        {trend.videoUrl && (
          <TouchableOpacity 
            style={[styles.actionButton, isExpired && styles.expiredActionButton]}
            onPress={() => openUrl(trend.videoUrl!)}
          >
            <Ionicons name="play-circle-outline" size={20} color={isExpired ? colors.textTertiary : colors.primary} />
            <Text style={[styles.actionButtonText, isExpired && styles.expiredText]}>Watch Video</Text>
          </TouchableOpacity>
        )}
        {trend.instagramUrl && (
          <TouchableOpacity 
            style={[styles.actionButton, isExpired && styles.expiredActionButton]}
            onPress={() => openUrl(trend.instagramUrl!)}
          >
            <Ionicons name="logo-instagram" size={20} color={isExpired ? colors.textTertiary : "#E1306C"} />
            <Text style={[styles.actionButtonText, isExpired && styles.expiredText]}>View Post</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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

      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Show expired trends</Text>
        <Switch
          value={showExpired}
          onValueChange={setShowExpired}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={showExpired ? colors.primary : colors.surface}
        />
      </View>

      {activeTrends.length === 0 && !showExpired ? (
        <View style={styles.emptyState}>
          <Ionicons name="sparkles-outline" size={64} color={colors.borderLight} />
          <Text style={styles.emptyTitle}>No Active Trends</Text>
          <Text style={styles.emptyDescription}>
            Check back soon for the latest trending content ideas
          </Text>
        </View>
      ) : (
        <View style={styles.trendsList}>
          {activeTrends.map((trend) => renderTrendCard(trend, false))}
          
          {showExpired && expiredTrends.length > 0 && (
            <>
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionDividerText}>Expired Trends</Text>
              </View>
              {expiredTrends.map((trend) => renderTrendCard(trend, true))}
            </>
          )}
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
    marginBottom: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glass.backgroundLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
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
  expiredTrendCard: {
    opacity: 0.7,
    backgroundColor: colors.surfaceSecondary,
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
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceSecondary,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expiredBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
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
    flexWrap: 'wrap',
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
  expiredActionButton: {
    backgroundColor: colors.surfaceSecondary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  expiredText: {
    color: colors.textTertiary,
  },
  sectionDivider: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.md,
  },
  sectionDividerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
