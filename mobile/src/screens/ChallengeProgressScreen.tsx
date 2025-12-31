import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { colors, borderRadius, spacing, glassCard } from '../theme';
import { RootStackParamList } from '../navigation';
import { salonApi } from '../services/api';

interface StylistProgress {
  id: number;
  name: string;
  email: string;
  progress: number;
  status: 'active' | 'completed';
  currentStreak?: number;
}

interface ChallengeProgressData {
  challenge: {
    id: number;
    title: string;
    description: string;
    durationDays: number;
    postsRequired: number;
    rewardText: string;
    status: string;
  };
  stylists: StylistProgress[];
}

export default function ChallengeProgressScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ChallengeProgress'>>();
  const { challengeId } = route.params;

  const { data, isLoading, refetch } = useQuery<ChallengeProgressData>({
    queryKey: ['challenge-progress', challengeId],
    queryFn: () => salonApi.getChallengeProgress(challengeId),
  });

  const completedCount = data?.stylists?.filter(s => s.status === 'completed').length || 0;
  const totalCount = data?.stylists?.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Progress</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !data ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Could not load challenge progress</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />
          }
        >
          <View style={styles.challengeCard}>
            <Text style={styles.challengeTitle}>{data.challenge.title}</Text>
            <Text style={styles.challengeDescription}>{data.challenge.description}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>{data.challenge.durationDays} days</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="checkmark-done-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>{data.challenge.postsRequired} posts required</Text>
              </View>
            </View>
            <View style={styles.rewardRow}>
              <Ionicons name="gift-outline" size={16} color={colors.primary} />
              <Text style={styles.rewardText}>{data.challenge.rewardText}</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Completion Summary</Text>
            <View style={styles.summaryStats}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{completedCount}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{totalCount - completedCount}</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{totalCount}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Members</Text>
            {data.stylists.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>No team members assigned to this challenge</Text>
              </View>
            ) : (
              data.stylists.map((stylist) => {
                const progress = Math.min((stylist.progress / data.challenge.postsRequired) * 100, 100);
                return (
                  <View key={stylist.id} style={styles.memberCard}>
                    <View style={styles.memberHeader}>
                      <View style={styles.memberInfo}>
                        <View style={styles.memberAvatar}>
                          <Text style={styles.memberInitials}>
                            {stylist.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.memberDetails}>
                          <Text style={styles.memberName}>{stylist.name}</Text>
                          <Text style={styles.memberEmail}>{stylist.email}</Text>
                        </View>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        stylist.status === 'completed' && styles.completedBadge
                      ]}>
                        {stylist.status === 'completed' && (
                          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                        )}
                        <Text style={[
                          styles.statusText,
                          stylist.status === 'completed' && styles.completedText
                        ]}>
                          {stylist.status === 'completed' ? 'Completed' : 'Active'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.progressSection}>
                      <View style={styles.progressRow}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressValue}>
                          {stylist.progress}/{data.challenge.postsRequired} posts
                        </Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View style={[
                          styles.progressBarFill, 
                          { width: `${progress}%` },
                          stylist.status === 'completed' && styles.progressBarComplete
                        ]} />
                      </View>
                    </View>
                    {stylist.status === 'completed' && (
                      <View style={styles.rewardEarnedRow}>
                        <Ionicons name="gift" size={16} color={colors.success} />
                        <Text style={styles.rewardEarnedText}>
                          Earned: {data.challenge.rewardText}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSpacer: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  challengeCard: {
    ...glassCard,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rewardText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  summaryCard: {
    ...glassCard,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyCard: {
    ...glassCard,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyCardText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  memberCard: {
    ...glassCard,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitials: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  memberEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  completedBadge: {
    backgroundColor: colors.success + '20',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.primary,
  },
  completedText: {
    color: colors.success,
  },
  progressSection: {
    marginTop: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressBarComplete: {
    backgroundColor: colors.success,
  },
  rewardEarnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rewardEarnedText: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '500',
  },
});
