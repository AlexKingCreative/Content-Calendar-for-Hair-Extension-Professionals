import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, borderRadius, spacing, glassCard } from '../theme';
import { RootStackParamList } from '../navigation';
import { challengesApi, stylistApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface Challenge {
  id: number;
  title: string;
  description: string;
  durationDays: number;
  postsRequired?: number;
  slug: string;
}

interface UserChallenge {
  id: number;
  challengeId: number;
  userId: number;
  startDate: string;
  endDate?: string;
  postsCompleted: number;
  status: 'active' | 'completed' | 'abandoned';
  challenge: Challenge;
}

interface StylistChallenge {
  id: number;
  salonChallengeId: number;
  progress: number;
  status: 'active' | 'completed';
  challenge: {
    id: number;
    title: string;
    description: string;
    durationDays: number;
    postsRequired: number;
    rewardText: string;
    status: string;
  };
  salon?: {
    name: string;
  };
}

export default function ChallengesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const { isSalonOwner } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'team'>('active');

  const { data: availableChallenges = [], isLoading: availableLoading } = useQuery<Challenge[]>({
    queryKey: ['challenges'],
    queryFn: challengesApi.getAll,
  });

  const { data: userChallenges = [], isLoading: userLoading, refetch } = useQuery<UserChallenge[]>({
    queryKey: ['user-challenges'],
    queryFn: challengesApi.getUserChallenges,
  });

  const { data: stylistChallenges = [], isLoading: stylistLoading } = useQuery<StylistChallenge[]>({
    queryKey: ['stylist-challenges'],
    queryFn: stylistApi.getChallenges,
  });

  const startChallengeMutation = useMutation({
    mutationFn: challengesApi.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
      Alert.alert('Success', 'Challenge started! Good luck!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to start challenge');
    },
  });

  const logProgressMutation = useMutation({
    mutationFn: challengesApi.logProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
      Alert.alert('Progress Logged', 'Great job! Keep up the momentum!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to log progress');
    },
  });

  const abandonMutation = useMutation({
    mutationFn: challengesApi.abandon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to abandon challenge');
    },
  });

  const handleStartChallenge = (challengeId: number) => {
    Alert.alert(
      'Start Challenge',
      'Are you ready to take on this challenge?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => startChallengeMutation.mutate(challengeId) },
      ]
    );
  };

  const handleAbandon = (userChallengeId: number) => {
    Alert.alert(
      'Abandon Challenge',
      'Are you sure you want to abandon this challenge? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Abandon', style: 'destructive', onPress: () => abandonMutation.mutate(userChallengeId) },
      ]
    );
  };

  const activeChallenges = userChallenges.filter(uc => uc.status === 'active');
  const completedChallenges = userChallenges.filter(uc => uc.status === 'completed');
  const isLoading = availableLoading || userLoading || stylistLoading;

  const hasStylistChallenges = stylistChallenges.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenges</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            My Challenges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
            Available
          </Text>
        </TouchableOpacity>
        {hasStylistChallenges && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'team' && styles.tabActive]}
            onPress={() => setActiveTab('team')}
          >
            <Text style={[styles.tabText, activeTab === 'team' && styles.tabTextActive]}>
              Team
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : activeTab === 'active' ? (
          <>
            {activeChallenges.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="trophy-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyTitle}>No Active Challenges</Text>
                <Text style={styles.emptyText}>
                  Start a challenge to boost your posting consistency!
                </Text>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => setActiveTab('available')}
                >
                  <Text style={styles.startButtonText}>Browse Challenges</Text>
                </TouchableOpacity>
              </View>
            ) : (
              activeChallenges.map((uc) => {
                const postsNeeded = uc.challenge.postsRequired || uc.challenge.durationDays;
                const progress = Math.min((uc.postsCompleted / postsNeeded) * 100, 100);
                return (
                  <View key={uc.id} style={styles.challengeCard}>
                    <View style={styles.challengeHeader}>
                      <Text style={styles.challengeTitle}>{uc.challenge.title}</Text>
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Active</Text>
                      </View>
                    </View>
                    <Text style={styles.challengeDescription}>{uc.challenge.description}</Text>
                    <View style={styles.progressSection}>
                      <View style={styles.progressRow}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressValue}>{uc.postsCompleted}/{postsNeeded} posts</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                      </View>
                    </View>
                    <View style={styles.challengeActions}>
                      <TouchableOpacity
                        style={styles.logButton}
                        onPress={() => logProgressMutation.mutate(uc.id)}
                        disabled={logProgressMutation.isPending}
                      >
                        {logProgressMutation.isPending ? (
                          <ActivityIndicator size="small" color={colors.surface} />
                        ) : (
                          <>
                            <Ionicons name="checkmark" size={18} color={colors.surface} />
                            <Text style={styles.logButtonText}>Log Post</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.abandonButton}
                        onPress={() => handleAbandon(uc.id)}
                      >
                        <Text style={styles.abandonButtonText}>Abandon</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}

            {completedChallenges.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Completed</Text>
                {completedChallenges.map((uc) => (
                  <View key={uc.id} style={[styles.challengeCard, styles.completedCard]}>
                    <View style={styles.challengeHeader}>
                      <Text style={styles.challengeTitle}>{uc.challenge.title}</Text>
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        <Text style={styles.completedBadgeText}>Completed</Text>
                      </View>
                    </View>
                    <Text style={styles.challengeDescription}>{uc.challenge.description}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : activeTab === 'available' ? (
          <>
            {availableChallenges.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No Challenges Available</Text>
                <Text style={styles.emptyText}>Check back later for new challenges!</Text>
              </View>
            ) : (
              availableChallenges.map((challenge) => {
                const alreadyActive = activeChallenges.some(uc => uc.challengeId === challenge.id);
                return (
                  <View key={challenge.id} style={styles.challengeCard}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <Text style={styles.challengeDescription}>{challenge.description}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{challenge.durationDays} days</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="checkmark-done-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{challenge.postsRequired || challenge.durationDays} posts</Text>
                      </View>
                    </View>
                    {alreadyActive ? (
                      <View style={styles.alreadyActiveRow}>
                        <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                        <Text style={styles.alreadyActiveText}>Already in progress</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.joinButton}
                        onPress={() => handleStartChallenge(challenge.id)}
                        disabled={startChallengeMutation.isPending}
                      >
                        {startChallengeMutation.isPending ? (
                          <ActivityIndicator size="small" color={colors.surface} />
                        ) : (
                          <Text style={styles.joinButtonText}>Start Challenge</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            {stylistChallenges.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyTitle}>No Team Challenges</Text>
                <Text style={styles.emptyText}>
                  Your salon owner hasn't assigned any challenges yet.
                </Text>
              </View>
            ) : (
              stylistChallenges.map((sc) => {
                const progress = Math.min((sc.progress / sc.challenge.postsRequired) * 100, 100);
                return (
                  <View key={sc.id} style={styles.challengeCard}>
                    <View style={styles.challengeHeader}>
                      <Text style={styles.challengeTitle}>{sc.challenge.title}</Text>
                      <View style={[
                        styles.statusBadge,
                        sc.status === 'completed' && styles.completedBadge
                      ]}>
                        <Text style={styles.statusBadgeText}>
                          {sc.status === 'completed' ? 'Completed' : 'Active'}
                        </Text>
                      </View>
                    </View>
                    {sc.salon && (
                      <Text style={styles.salonName}>From {sc.salon.name}</Text>
                    )}
                    <Text style={styles.challengeDescription}>{sc.challenge.description}</Text>
                    <View style={styles.progressSection}>
                      <View style={styles.progressRow}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressValue}>{sc.progress}/{sc.challenge.postsRequired} posts</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                      </View>
                    </View>
                    <View style={styles.rewardRow}>
                      <Ionicons name="gift-outline" size={16} color={colors.primary} />
                      <Text style={styles.rewardText}>{sc.challenge.rewardText}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: colors.primaryLight,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyCard: {
    ...glassCard,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  startButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  challengeCard: {
    ...glassCard,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  completedCard: {
    opacity: 0.8,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.primary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.success,
  },
  statusBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.primary,
  },
  salonName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
    fontSize: 13,
    color: colors.textSecondary,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  challengeActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  logButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  logButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  abandonButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  abandonButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
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
  alreadyActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  alreadyActiveText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  joinButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
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
});
