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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useAuth } from '../hooks/useAuth';

interface Challenge {
  id: number;
  name: string;
  description: string;
  icon: string;
  durationDays: number;
  postsRequired: number;
  rules: string[];
  tips: string[];
  badgeName?: string;
  badgeIcon?: string;
}

interface UserChallenge {
  id: number;
  challengeId: number;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  postsCompleted: number;
  currentStreak: number;
  lastPostDate?: string;
  challenge?: Challenge;
}

const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: 1,
    name: '7-Day Posting Streak',
    description: 'Post content every day for 7 days straight to build your social media habit.',
    icon: 'flame',
    durationDays: 7,
    postsRequired: 7,
    rules: ['Post at least once per day', 'Use content from the calendar or your own', 'Track your progress daily'],
    tips: ['Set a daily reminder', 'Prepare content the night before', 'Engage with comments to boost motivation'],
    badgeName: 'Week Warrior',
  },
  {
    id: 2,
    name: '30-Day Content Marathon',
    description: 'Commit to posting for 30 days and transform your social media presence.',
    icon: 'trophy',
    durationDays: 30,
    postsRequired: 30,
    rules: ['Post daily for 30 consecutive days', 'Mix content types for variety', 'Track engagement metrics'],
    tips: ['Batch create content on weekends', 'Use the AI caption generator', 'Celebrate milestones along the way'],
    badgeName: 'Content Champion',
  },
  {
    id: 3,
    name: 'Before & After Week',
    description: 'Share 5 stunning before and after transformations in one week.',
    icon: 'images',
    durationDays: 7,
    postsRequired: 5,
    rules: ['Post transformation photos', 'Include client permission', 'Write compelling captions'],
    tips: ['Get client consent in advance', 'Use good lighting for photos', 'Tell the story behind each transformation'],
    badgeName: 'Transformation Pro',
  },
];

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  flame: 'flame',
  trophy: 'trophy',
  images: 'images',
  target: 'flag',
  sparkles: 'sparkles',
  gem: 'diamond',
  heart: 'heart',
  star: 'star',
};

function ChallengeCard({ 
  challenge, 
  userChallenge,
  onStart,
  onView,
  isStarting 
}: { 
  challenge: Challenge; 
  userChallenge?: UserChallenge;
  onStart: () => void;
  onView: () => void;
  isStarting: boolean;
}) {
  const isActive = userChallenge?.status === 'active';
  const isCompleted = userChallenge?.status === 'completed';
  const iconName = iconMap[challenge.icon] || 'flag';
  const progress = userChallenge ? (userChallenge.postsCompleted / challenge.postsRequired) * 100 : 0;

  return (
    <TouchableOpacity 
      style={[
        styles.challengeCard,
        isActive && styles.challengeCardActive,
        isCompleted && styles.challengeCardCompleted,
      ]}
      onPress={onView}
      activeOpacity={0.7}
    >
      <View style={styles.challengeHeader}>
        <View style={[
          styles.challengeIconContainer,
          isCompleted && styles.challengeIconCompleted,
        ]}>
          <Ionicons 
            name={iconName} 
            size={20} 
            color={isCompleted ? '#059669' : colors.primary} 
          />
        </View>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeName}>{challenge.name}</Text>
          <Text style={styles.challengeMeta}>
            {challenge.durationDays} days · {challenge.postsRequired} posts
          </Text>
        </View>
        {isActive && (
          <View style={styles.activeBadge}>
            <Ionicons name="play" size={10} color={colors.textOnPrimary} />
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        )}
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark" size={10} color="#059669" />
            <Text style={styles.completedBadgeText}>Complete</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.challengeDescription} numberOfLines={2}>
        {challenge.description}
      </Text>
      
      {isActive && userChallenge && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>
              {userChallenge.postsCompleted}/{challenge.postsRequired}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      )}
      
      {!isActive && !isCompleted && (
        <TouchableOpacity
          style={[styles.startButton, isStarting && styles.startButtonDisabled]}
          onPress={(e) => {
            e.stopPropagation();
            onStart();
          }}
          disabled={isStarting}
        >
          {isStarting ? (
            <ActivityIndicator size="small" color={colors.textOnPrimary} />
          ) : (
            <>
              <Ionicons name="play" size={16} color={colors.textOnPrimary} />
              <Text style={styles.startButtonText}>Start Challenge</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

function ActiveChallengeDetail({ 
  userChallenge,
  onLogProgress,
  onAbandon,
  isLogging,
}: { 
  userChallenge: UserChallenge;
  onLogProgress: () => void;
  onAbandon: () => void;
  isLogging: boolean;
}) {
  const challenge = userChallenge.challenge;
  if (!challenge) return null;

  const startDate = new Date(userChallenge.startedAt);
  const daysElapsed = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const progress = (userChallenge.postsCompleted / challenge.postsRequired) * 100;
  const today = new Date().toISOString().split('T')[0];
  const hasLoggedToday = userChallenge.lastPostDate === today;
  const iconName = iconMap[challenge.icon] || 'flag';

  return (
    <View style={styles.activeDetailCard}>
      <View style={styles.activeDetailHeader}>
        <View style={styles.activeDetailIcon}>
          <Ionicons name={iconName} size={24} color={colors.primary} />
        </View>
        <View style={styles.activeDetailInfo}>
          <Text style={styles.activeDetailTitle}>{challenge.name}</Text>
          <Text style={styles.activeDetailMeta}>
            Started {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{userChallenge.postsCompleted}</Text>
          <Text style={styles.statLabel}>Posts Made</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{daysElapsed}</Text>
          <Text style={styles.statLabel}>Days In</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#059669' }]}>{userChallenge.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
          <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
        </View>
        <View style={[styles.progressBar, { height: 8 }]}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logButton, hasLoggedToday && styles.logButtonDisabled]}
        onPress={onLogProgress}
        disabled={hasLoggedToday || isLogging}
      >
        {isLogging ? (
          <ActivityIndicator size="small" color={colors.textOnPrimary} />
        ) : hasLoggedToday ? (
          <>
            <Ionicons name="checkmark-circle" size={18} color={colors.textOnPrimary} />
            <Text style={styles.logButtonText}>Posted Today</Text>
          </>
        ) : (
          <>
            <Ionicons name="checkmark" size={18} color={colors.textOnPrimary} />
            <Text style={styles.logButtonText}>Log Today's Post</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.abandonButton}
        onPress={() => {
          Alert.alert(
            'Abandon Challenge?',
            'Your progress will be saved but the challenge will be marked as abandoned. You can start again anytime.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Abandon', style: 'destructive', onPress: onAbandon },
            ]
          );
        }}
      >
        <Ionicons name="close" size={16} color={colors.textSecondary} />
        <Text style={styles.abandonButtonText}>Abandon Challenge</Text>
      </TouchableOpacity>

      {challenge.rules && challenge.rules.length > 0 && (
        <View style={styles.rulesSection}>
          <Text style={styles.rulesSectionTitle}>Challenge Rules</Text>
          {challenge.rules.map((rule, i) => (
            <View key={i} style={styles.ruleItem}>
              <Ionicons name="checkmark" size={14} color={colors.primary} />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>
      )}

      {challenge.tips && challenge.tips.length > 0 && (
        <View style={styles.rulesSection}>
          <Text style={styles.rulesSectionTitle}>Tips for Success</Text>
          {challenge.tips.map((tip, i) => (
            <View key={i} style={styles.ruleItem}>
              <Ionicons name="sparkles" size={14} color="#F59E0B" />
              <Text style={styles.ruleText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ChallengesScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [activeChallenges, setActiveChallenges] = useState<UserChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<UserChallenge[]>([]);
  const [startingChallengeId, setStartingChallengeId] = useState<number | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  const handleStartChallenge = async (challenge: Challenge) => {
    setStartingChallengeId(challenge.id);
    
    setTimeout(() => {
      const newUserChallenge: UserChallenge = {
        id: Date.now(),
        challengeId: challenge.id,
        status: 'active',
        startedAt: new Date().toISOString(),
        postsCompleted: 0,
        currentStreak: 0,
        challenge,
      };
      setActiveChallenges([...activeChallenges, newUserChallenge]);
      setStartingChallengeId(null);
      Alert.alert('Challenge Started!', 'Good luck! You\'ve got this.');
    }, 1000);
  };

  const handleLogProgress = async (userChallenge: UserChallenge) => {
    setIsLogging(true);
    
    setTimeout(() => {
      const updated = activeChallenges.map(uc => {
        if (uc.id === userChallenge.id) {
          const newPostsCompleted = uc.postsCompleted + 1;
          const isComplete = newPostsCompleted >= (uc.challenge?.postsRequired || 0);
          
          if (isComplete) {
            setCompletedChallenges([...completedChallenges, {
              ...uc,
              status: 'completed',
              postsCompleted: newPostsCompleted,
              completedAt: new Date().toISOString(),
            }]);
            Alert.alert('Challenge Complete!', `Congratulations! You earned the ${uc.challenge?.badgeName || 'challenge'} badge!`);
            return null;
          }
          
          return {
            ...uc,
            postsCompleted: newPostsCompleted,
            currentStreak: uc.currentStreak + 1,
            lastPostDate: new Date().toISOString().split('T')[0],
          };
        }
        return uc;
      }).filter(Boolean) as UserChallenge[];
      
      setActiveChallenges(updated);
      setIsLogging(false);
      if (updated.find(uc => uc.id === userChallenge.id)) {
        Alert.alert('Progress Logged!', 'Keep up the great work!');
      }
    }, 500);
  };

  const handleAbandon = async (userChallenge: UserChallenge) => {
    setActiveChallenges(activeChallenges.filter(uc => uc.id !== userChallenge.id));
    Alert.alert('Challenge Abandoned', 'You can start again anytime.');
  };

  const getUserChallengeForChallenge = (challengeId: number) => {
    return activeChallenges.find(uc => uc.challengeId === challengeId);
  };

  const getCompletedChallengeForChallenge = (challengeId: number) => {
    return completedChallenges.find(uc => uc.challengeId === challengeId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenges</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeChallenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="play" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Active Challenges</Text>
            </View>
            {activeChallenges.map((uc) => (
              <ActiveChallengeDetail
                key={uc.id}
                userChallenge={uc}
                onLogProgress={() => handleLogProgress(uc)}
                onAbandon={() => handleAbandon(uc)}
                isLogging={isLogging}
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag" size={20} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Available Challenges</Text>
          </View>
          {SAMPLE_CHALLENGES.map((challenge) => {
            const activeUC = getUserChallengeForChallenge(challenge.id);
            const completedUC = getCompletedChallengeForChallenge(challenge.id);
            
            return (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                userChallenge={activeUC || completedUC}
                onStart={() => handleStartChallenge(challenge)}
                onView={() => {}}
                isStarting={startingChallengeId === challenge.id}
              />
            );
          })}
        </View>

        {completedChallenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy" size={20} color="#059669" />
              <Text style={styles.sectionTitle}>Completed</Text>
              <View style={styles.completedCount}>
                <Text style={styles.completedCountText}>{completedChallenges.length}</Text>
              </View>
            </View>
            {completedChallenges.map((uc) => (
              <View key={uc.id} style={styles.completedCard}>
                <View style={styles.completedCardIcon}>
                  <Ionicons 
                    name={iconMap[uc.challenge?.badgeIcon || uc.challenge?.icon || 'trophy'] || 'trophy'} 
                    size={20} 
                    color="#059669" 
                  />
                </View>
                <View style={styles.completedCardInfo}>
                  <Text style={styles.completedCardTitle}>{uc.challenge?.name}</Text>
                  <Text style={styles.completedCardMeta}>
                    Completed {uc.completedAt ? new Date(uc.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''} · {uc.postsCompleted} posts
                  </Text>
                </View>
                {uc.challenge?.badgeName && (
                  <View style={styles.badgeEarned}>
                    <Ionicons name="trophy" size={12} color="#FFFFFF" />
                    <Text style={styles.badgeEarnedText}>{uc.challenge.badgeName}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  challengeCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  challengeCardActive: {
    borderColor: colors.primary,
  },
  challengeCardCompleted: {
    borderColor: '#059669',
    backgroundColor: 'rgba(5, 150, 105, 0.05)',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  challengeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  challengeIconCompleted: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  challengeMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  progressSection: {
    marginTop: spacing.xs,
  },
  progressHeader: {
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
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  startButtonDisabled: {
    opacity: 0.7,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  activeDetailCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  activeDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  activeDetailIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activeDetailInfo: {
    flex: 1,
  },
  activeDetailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  activeDetailMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  logButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  abandonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  abandonButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  rulesSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rulesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  ruleText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  completedCount: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  completedCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.05)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
    marginBottom: spacing.sm,
  },
  completedCardIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  completedCardInfo: {
    flex: 1,
  },
  completedCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  completedCardMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgeEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeEarnedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
