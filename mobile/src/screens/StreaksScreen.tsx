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
        <ActivityIndicator size="large" color="#D4A574" />
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
            color={activeTab === 'streaks' ? '#D4A574' : '#8B7355'} 
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
            color={activeTab === 'challenges' ? '#D4A574' : '#8B7355'} 
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
              <Ionicons name="flame" size={48} color="#FFFFFF" />
              {streak?.hasPostedToday && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={styles.streakNumber}>{streak?.currentStreak || 0}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>

            {streak?.hasPostedToday ? (
              <View style={styles.postedBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                <Text style={styles.postedText}>You've posted today!</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.logButton}
                onPress={() => logPostMutation.mutate()}
                disabled={logPostMutation.isPending}
              >
                <Ionicons name="calendar" size={20} color="#FFFFFF" />
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
                  <Ionicons name={getIconName(nextMilestone.icon)} size={24} color="#D4A574" />
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
                      <Ionicons name={getIconName(badge.icon)} size={20} color="#D4A574" />
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
                        <Ionicons name={getIconName(challenge.icon)} size={20} color="#D4A574" />
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
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
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
                      <Ionicons name={getIconName(challenge.icon)} size={20} color="#D4A574" />
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
                    <Ionicons name="gift-outline" size={14} color="#8B7355" />
                    <Text style={styles.challengeRewardText}>{challenge.reward}</Text>
                  </View>
                  {!isActive && (
                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={() => startChallengeMutation.mutate(challenge.id)}
                      disabled={startChallengeMutation.isPending}
                    >
                      <Ionicons name="play" size={16} color="#FFFFFF" />
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
    backgroundColor: '#FFF8F0',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFF8F0',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
  },
  tabTextActive: {
    color: '#D4A574',
  },
  badge: {
    backgroundColor: '#D4A574',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  streakCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  streakCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#5D4E3C',
  },
  streakLabel: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 16,
  },
  postedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  postedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D4A574',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: 12,
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
    color: '#5D4E3C',
  },
  statLabel: {
    fontSize: 12,
    color: '#8B7355',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5D5C5',
  },
  milestoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: 12,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  milestoneIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5D4E3C',
  },
  milestoneProgress: {
    fontSize: 13,
    color: '#8B7355',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5D5C5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4A574',
    borderRadius: 4,
  },
  badgesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: 12,
  },
  noBadges: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
    paddingVertical: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    alignItems: 'center',
    gap: 6,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeName: {
    fontSize: 11,
    color: '#5D4E3C',
    textAlign: 'center',
    maxWidth: 70,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: 12,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  challengeActive: {
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  challengeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeIconActive: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5D4E3C',
  },
  challengeDuration: {
    fontSize: 13,
    color: '#8B7355',
  },
  challengeStarted: {
    fontSize: 12,
    color: '#8B7355',
  },
  challengeStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  challengeStat: {
    alignItems: 'center',
  },
  challengeStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4A574',
  },
  challengeStatLabel: {
    fontSize: 11,
    color: '#8B7355',
  },
  activeBadge: {
    backgroundColor: '#D4A574',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  challengeDescription: {
    fontSize: 13,
    color: '#8B7355',
    lineHeight: 18,
    marginBottom: 10,
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  challengeRewardText: {
    fontSize: 12,
    color: '#8B7355',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4A574',
    paddingVertical: 12,
    borderRadius: 10,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4A574',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  logChallengeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
