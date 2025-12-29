import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { streakApi, challengesApi } from '../services/api';
import { colors, borderRadius, shadows, spacing, glassCard } from '../theme';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalPosts: number;
  postingGoal: string;
  hasPostedToday: boolean;
}

interface Challenge {
  id: number;
  name: string;
  description: string;
  durationDays: number;
  requiredPosts: number;
  icon: string;
  reward: string;
}

interface UserChallenge {
  id: number;
  challengeId: number;
  status: string;
  startedAt: string;
  postsCompleted: number;
  currentStreak: number;
  challenge?: Challenge;
}

const MILESTONES = [
  { days: 7, name: 'One Week Wonder', icon: 'flame' },
  { days: 14, name: 'Two Week Warrior', icon: 'star' },
  { days: 30, name: 'Monthly Master', icon: 'trophy' },
  { days: 60, name: 'Consistency Queen', icon: 'diamond' },
  { days: 90, name: 'Posting Pro', icon: 'medal' },
  { days: 180, name: 'Half Year Hero', icon: 'rocket' },
  { days: 365, name: 'Year of Posts', icon: 'ribbon' },
];

export default function StreaksScreen() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'streaks' | 'challenges'>('streaks');

  const { data: streak, isLoading: streakLoading } = useQuery<StreakData>({
    queryKey: ['streak'],
    queryFn: streakApi.get,
  });

  const { data: challenges = [] } = useQuery<Challenge[]>({
    queryKey: ['challenges'],
    queryFn: challengesApi.getAll,
  });

  const { data: userChallenges = [] } = useQuery<UserChallenge[]>({
    queryKey: ['userChallenges'],
    queryFn: challengesApi.getUserChallenges,
  });

  const logPostMutation = useMutation({
    mutationFn: streakApi.logPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      Alert.alert('Success', 'Post logged! Keep up the great work!');
    },
    onError: () => {
      Alert.alert('Already Logged', "You've already logged a post for today.");
    },
  });

  const startChallengeMutation = useMutation({
    mutationFn: (challengeId: number) => challengesApi.start(challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userChallenges'] });
      Alert.alert('Challenge Started', 'Good luck! You\'ve got this.');
    },
    onError: () => {
      Alert.alert('Error', 'Could not start challenge. Please try again.');
    },
  });

  const logChallengeMutation = useMutation({
    mutationFn: (userChallengeId: number) => challengesApi.logProgress(userChallengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userChallenges'] });
      Alert.alert('Progress Logged', 'Keep up the great work!');
    },
    onError: () => {
      Alert.alert('Error', 'Could not log progress. Please try again.');
    },
  });

  const earnedBadges = MILESTONES.filter(m => (streak?.currentStreak || 0) >= m.days);
  const nextMilestone = MILESTONES.find(m => m.days > (streak?.currentStreak || 0));
  const activeChallenges = userChallenges.filter(uc => uc.status === 'active');

  const getIconName = (icon: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      flame: 'flame',
      star: 'star',
      trophy: 'trophy',
      diamond: 'diamond',
      medal: 'medal',
      rocket: 'rocket',
      ribbon: 'ribbon',
      target: 'flag',
      sparkles: 'sparkles',
      heart: 'heart',
    };
    return iconMap[icon] || 'flag';
  };

  if (streakLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'streaks' && styles.tabActive]}
          onPress={() => setActiveTab('streaks')}
        >
          <Ionicons 
            name="flame" 
            size={18} 
            color={activeTab === 'streaks' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'streaks' && styles.tabTextActive]}>
            Streaks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.tabActive]}
          onPress={() => setActiveTab('challenges')}
        >
          <Ionicons 
            name="flag" 
            size={18} 
            color={activeTab === 'challenges' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.tabTextActive]}>
            Challenges
          </Text>
          {activeChallenges.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeChallenges.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeTab === 'streaks' ? (
        <>
          <View style={styles.streakCard}>
            <View style={styles.streakCircle}>
              <Ionicons name="flame" size={48} color={colors.textOnPrimary} />
              {streak?.hasPostedToday && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={14} color={colors.textOnPrimary} />
                </View>
              )}
            </View>
            <Text style={styles.streakNumber}>{streak?.currentStreak || 0}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>

            {streak?.hasPostedToday ? (
              <View style={styles.postedBadge}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.postedText}>You've posted today!</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.logButton}
                onPress={() => logPostMutation.mutate()}
                disabled={logPostMutation.isPending}
              >
                <Ionicons name="calendar" size={20} color={colors.textOnPrimary} />
                <Text style={styles.logButtonText}>
                  {logPostMutation.isPending ? 'Logging...' : 'I Posted Today!'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{streak?.currentStreak || 0}</Text>
                <Text style={styles.statLabel}>Current</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{streak?.longestStreak || 0}</Text>
                <Text style={styles.statLabel}>Best</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{streak?.totalPosts || 0}</Text>
                <Text style={styles.statLabel}>Total Posts</Text>
              </View>
            </View>
          </View>

          {nextMilestone && (
            <View style={styles.milestoneCard}>
              <Text style={styles.milestoneTitle}>Next Milestone</Text>
              <View style={styles.milestoneRow}>
                <View style={styles.milestoneIcon}>
                  <Ionicons name={getIconName(nextMilestone.icon)} size={24} color={colors.primary} />
                </View>
                <View style={styles.milestoneInfo}>
                  <Text style={styles.milestoneName}>{nextMilestone.name}</Text>
                  <Text style={styles.milestoneProgress}>
                    {nextMilestone.days - (streak?.currentStreak || 0)} days to go
                  </Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(100, ((streak?.currentStreak || 0) / nextMilestone.days) * 100)}%` }
                  ]} 
                />
              </View>
            </View>
          )}

          <View style={styles.badgesCard}>
            <Text style={styles.badgesTitle}>Earned Badges</Text>
            {earnedBadges.length === 0 ? (
              <Text style={styles.noBadges}>
                Keep posting to earn your first badge!
              </Text>
            ) : (
              <View style={styles.badgesGrid}>
                {earnedBadges.map((badge) => (
                  <View key={badge.days} style={styles.badgeItem}>
                    <View style={styles.badgeIcon}>
                      <Ionicons name={getIconName(badge.icon)} size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </>
      ) : (
        <>
          {activeChallenges.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Active Challenges</Text>
              {activeChallenges.map((uc) => {
                const challenge = uc.challenge || challenges.find(c => c.id === uc.challengeId);
                if (!challenge) return null;
                const progress = (uc.postsCompleted / challenge.requiredPosts) * 100;
                
                return (
                  <View key={uc.id} style={styles.challengeCard}>
                    <View style={styles.challengeHeader}>
                      <View style={styles.challengeIconActive}>
                        <Ionicons name={getIconName(challenge.icon)} size={20} color={colors.primary} />
                      </View>
                      <View style={styles.challengeInfo}>
                        <Text style={styles.challengeName}>{challenge.name}</Text>
                        <Text style={styles.challengeStarted}>
                          Started {format(new Date(uc.startedAt), 'MMM d')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.challengeStats}>
                      <View style={styles.challengeStat}>
                        <Text style={styles.challengeStatNumber}>{uc.postsCompleted}</Text>
                        <Text style={styles.challengeStatLabel}>Posts</Text>
                      </View>
                      <View style={styles.challengeStat}>
                        <Text style={styles.challengeStatNumber}>{uc.currentStreak}</Text>
                        <Text style={styles.challengeStatLabel}>Streak</Text>
                      </View>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${Math.min(100, progress)}%` }]} />
                    </View>
                    <TouchableOpacity
                      style={styles.logChallengeButton}
                      onPress={() => logChallengeMutation.mutate(uc.id)}
                      disabled={logChallengeMutation.isPending}
                    >
                      <Ionicons name="checkmark" size={18} color={colors.textOnPrimary} />
                      <Text style={styles.logChallengeButtonText}>Log Post</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Available Challenges</Text>
            {challenges.map((challenge) => {
              const isActive = userChallenges.some(uc => uc.challengeId === challenge.id && uc.status === 'active');
              
              return (
                <View key={challenge.id} style={[styles.challengeCard, isActive && styles.challengeActive]}>
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeIcon}>
                      <Ionicons name={getIconName(challenge.icon)} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.challengeInfo}>
                      <Text style={styles.challengeName}>{challenge.name}</Text>
                      <Text style={styles.challengeDuration}>{challenge.durationDays} days</Text>
                    </View>
                    {isActive && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Active</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  <View style={styles.challengeReward}>
                    <Ionicons name="gift-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.challengeRewardText}>{challenge.reward}</Text>
                  </View>
                  {!isActive && (
                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={() => startChallengeMutation.mutate(challenge.id)}
                      disabled={startChallengeMutation.isPending}
                    >
                      <Ionicons name="play" size={16} color={colors.textOnPrimary} />
                      <Text style={styles.startButtonText}>Start Challenge</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
  },
  tabActive: {
    backgroundColor: colors.glass.backgroundDark,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  streakCard: {
    ...glassCard,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  streakCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  streakLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  postedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  postedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.button,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  statsCard: {
    ...glassCard,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  milestoneCard: {
    ...glassCard,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  milestoneIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.glass.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  milestoneProgress: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: spacing.xs,
  },
  badgesCard: {
    ...glassCard,
    padding: spacing.lg,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  noBadges: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeName: {
    fontSize: 11,
    color: colors.text,
    textAlign: 'center',
    maxWidth: 70,
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  challengeCard: {
    ...glassCard,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  challengeActive: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  challengeIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.button,
    backgroundColor: colors.glass.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeIconActive: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.button,
    backgroundColor: colors.glass.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  challengeDuration: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  challengeStarted: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  challengeStats: {
    flexDirection: 'row',
    gap: spacing.xxl,
    marginBottom: spacing.md,
  },
  challengeStat: {
    alignItems: 'center',
  },
  challengeStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  challengeStatLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  activeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  challengeDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  challengeRewardText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  logChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    marginTop: spacing.md,
  },
  logChallengeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
});
