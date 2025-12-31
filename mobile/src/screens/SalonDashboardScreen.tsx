import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, borderRadius, shadows, spacing, glassCard } from '../theme';
import { RootStackParamList } from '../navigation';
import { salonApi } from '../services/api';

interface SalonMember {
  id: number;
  email: string;
  name: string;
  status: 'pending' | 'accepted' | 'revoked';
  currentStreak?: number;
  totalPosts?: number;
  willBeBilledWhenAccepted?: boolean;
}

interface SeatUsage {
  included: number;
  acceptedCount: number;
  pendingCount: number;
  additionalUsed: number;
  pendingWillBecomeAdditional: number;
  isOverLimit: boolean;
}

interface Salon {
  id: number;
  name: string;
  instagramHandle?: string;
  seatLimit: number;
  members: SalonMember[];
  seatUsage: SeatUsage;
}

interface SalonChallenge {
  id: number;
  title: string;
  description: string;
  durationDays: number;
  postsRequired: number;
  rewardText: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
}

export default function SalonDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'team' | 'challenges'>('team');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDescription, setChallengeDescription] = useState('');
  const [challengeDays, setChallengeDays] = useState('7');
  const [challengePosts, setChallengePosts] = useState('7');
  const [challengeReward, setChallengeReward] = useState('');

  const { data: salon, isLoading, refetch } = useQuery<Salon>({
    queryKey: ['salon'],
    queryFn: salonApi.getMySalon,
  });

  const { data: challenges = [], isLoading: challengesLoading } = useQuery<SalonChallenge[]>({
    queryKey: ['salon-challenges'],
    queryFn: salonApi.getChallenges,
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, name }: { email: string; name: string }) =>
      salonApi.inviteMember(salon!.id, email, name),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['salon'] });
      setShowInviteForm(false);
      setInviteEmail('');
      setInviteName('');
      if (data.willBeAdditionalSeat) {
        Alert.alert(
          'Invitation Sent',
          `When this invite is accepted, it will be billed at the additional seat rate (beyond your ${data.includedSeats} included seats).`
        );
      } else {
        Alert.alert('Success', 'Invitation sent successfully!');
      }
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send invitation');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (memberId: number) => salonApi.revokeMember(salon!.id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon'] });
      Alert.alert('Success', 'Member access revoked');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to revoke access');
    },
  });

  const createChallengeMutation = useMutation({
    mutationFn: salonApi.createChallenge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-challenges'] });
      setShowChallengeForm(false);
      resetChallengeForm();
      Alert.alert('Success', 'Challenge created and assigned to all team members!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create challenge');
    },
  });

  const deleteChallengeMutation = useMutation({
    mutationFn: salonApi.deleteChallenge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-challenges'] });
      Alert.alert('Success', 'Challenge deleted');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to delete challenge');
    },
  });

  const resetChallengeForm = () => {
    setChallengeTitle('');
    setChallengeDescription('');
    setChallengeDays('7');
    setChallengePosts('7');
    setChallengeReward('');
  };

  const handleInvite = () => {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      Alert.alert('Error', 'Please enter both name and email');
      return;
    }
    inviteMutation.mutate({ email: inviteEmail.toLowerCase(), name: inviteName });
  };

  const handleRevoke = (member: SalonMember) => {
    Alert.alert(
      'Revoke Access',
      `Are you sure you want to remove ${member.name} from your team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => revokeMutation.mutate(member.id) },
      ]
    );
  };

  const handleCreateChallenge = () => {
    if (!challengeTitle.trim() || !challengeReward.trim()) {
      Alert.alert('Error', 'Please enter a title and reward');
      return;
    }
    createChallengeMutation.mutate({
      title: challengeTitle,
      description: challengeDescription,
      durationDays: parseInt(challengeDays) || 7,
      postsRequired: parseInt(challengePosts) || 7,
      rewardText: challengeReward,
    });
  };

  const handleDeleteChallenge = (challenge: SalonChallenge) => {
    Alert.alert(
      'Delete Challenge',
      `Are you sure you want to delete "${challenge.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteChallengeMutation.mutate(challenge.id) },
      ]
    );
  };

  const activeMembers = salon?.members?.filter(m => m.status === 'accepted') || [];
  const pendingMembers = salon?.members?.filter(m => m.status === 'pending') || [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your salon...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!salon) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Salon Dashboard</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Salon Found</Text>
          <Text style={styles.emptyText}>
            You need to set up a salon to manage your team.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{salon.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'team' && styles.tabActive]}
          onPress={() => setActiveTab('team')}
        >
          <Ionicons 
            name="people-outline" 
            size={20} 
            color={activeTab === 'team' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'team' && styles.tabTextActive]}>
            Team ({activeMembers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.tabActive]}
          onPress={() => setActiveTab('challenges')}
        >
          <Ionicons 
            name="trophy-outline" 
            size={20} 
            color={activeTab === 'challenges' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.tabTextActive]}>
            Challenges
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {activeTab === 'team' ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleGroup}>
                  <Text style={styles.sectionTitle}>Active Members</Text>
                  <Text style={styles.seatInfo}>
                    {salon.seatUsage?.acceptedCount ?? 0}/{salon.seatUsage?.included ?? salon.seatLimit ?? 5} seats used
                    {(salon.seatUsage?.additionalUsed ?? 0) > 0 && (
                      <Text style={styles.seatWarning}> (+{salon.seatUsage?.additionalUsed ?? 0} billed extra)</Text>
                    )}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setShowInviteForm(true)}
                >
                  <Ionicons name="add" size={20} color={colors.surface} />
                  <Text style={styles.addButtonText}>Invite</Text>
                </TouchableOpacity>
              </View>
              
              {(salon.seatUsage?.pendingWillBecomeAdditional ?? 0) > 0 && (
                <View style={styles.seatWarningCard}>
                  <Ionicons name="information-circle-outline" size={18} color={colors.warning || '#f59e0b'} />
                  <Text style={styles.seatWarningCardText}>
                    {salon.seatUsage?.pendingWillBecomeAdditional ?? 0} pending invite(s) will be billed as additional seats when accepted
                  </Text>
                </View>
              )}

              {activeMembers.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyCardText}>No active team members yet</Text>
                </View>
              ) : (
                activeMembers.map((member) => (
                  <View key={member.id} style={styles.memberCard}>
                    <View style={styles.memberInfo}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberInitials}>
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.memberDetails}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberEmail}>{member.email}</Text>
                        <View style={styles.memberStats}>
                          <View style={styles.statItem}>
                            <Ionicons name="flame" size={14} color={colors.streak} />
                            <Text style={styles.statText}>{member.currentStreak || 0} day streak</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                            <Text style={styles.statText}>{member.totalPosts || 0} posts</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.revokeButton}
                      onPress={() => handleRevoke(member)}
                    >
                      <Ionicons name="close-circle-outline" size={24} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {pendingMembers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pending Invitations</Text>
                {pendingMembers.map((member) => {
                  const willBeBilled = member.willBeBilledWhenAccepted ?? false;
                  return (
                    <View key={member.id} style={styles.pendingCard}>
                      <View style={styles.memberInfo}>
                        <View style={[styles.memberAvatar, styles.pendingAvatar]}>
                          <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={styles.memberDetails}>
                          <Text style={styles.memberName}>{member.name}</Text>
                          <Text style={styles.memberEmail}>{member.email}</Text>
                          <View style={[styles.pendingBadge, willBeBilled && styles.pendingBadgeBillable]}>
                            <Text style={[styles.pendingText, willBeBilled && styles.pendingTextBillable]}>
                              {willBeBilled ? 'Will be billed as extra seat' : 'Invitation sent'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={styles.revokeButton}
                        onPress={() => handleRevoke(member)}
                      >
                        <Ionicons name="close-circle-outline" size={24} color={colors.textTertiary} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            {showInviteForm && (
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Invite Team Member</Text>
                  <TouchableOpacity onPress={() => setShowInviteForm(false)}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor={colors.textTertiary}
                  value={inviteName}
                  onChangeText={setInviteName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={colors.textTertiary}
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleInvite}
                  disabled={inviteMutation.isPending}
                >
                  {inviteMutation.isPending ? (
                    <ActivityIndicator size="small" color={colors.surface} />
                  ) : (
                    <Text style={styles.submitButtonText}>Send Invitation</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Team Challenges</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setShowChallengeForm(true)}
                >
                  <Ionicons name="add" size={20} color={colors.surface} />
                  <Text style={styles.addButtonText}>Create</Text>
                </TouchableOpacity>
              </View>

              {challengesLoading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : challenges.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyCardText}>No challenges created yet</Text>
                  <Text style={styles.emptyCardSubtext}>
                    Create challenges to motivate your team to post consistently
                  </Text>
                </View>
              ) : (
                challenges.map((challenge) => (
                  <View key={challenge.id} style={styles.challengeCard}>
                    <View style={styles.challengeHeader}>
                      <View style={styles.challengeInfo}>
                        <Text style={styles.challengeTitle}>{challenge.title}</Text>
                        <View style={[
                          styles.statusBadge,
                          challenge.status === 'active' && styles.statusActive,
                          challenge.status === 'paused' && styles.statusPaused,
                          challenge.status === 'completed' && styles.statusCompleted,
                        ]}>
                          <Text style={styles.statusText}>{challenge.status}</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteChallenge(challenge)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                    {challenge.description && (
                      <Text style={styles.challengeDescription}>{challenge.description}</Text>
                    )}
                    <View style={styles.challengeMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{challenge.durationDays} days</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="checkmark-done-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{challenge.postsRequired} posts required</Text>
                      </View>
                    </View>
                    <View style={styles.rewardRow}>
                      <Ionicons name="gift-outline" size={16} color={colors.primary} />
                      <Text style={styles.rewardText}>{challenge.rewardText}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.viewProgressButton}
                      onPress={() => navigation.navigate('ChallengeProgress', { challengeId: challenge.id })}
                    >
                      <Text style={styles.viewProgressText}>View Team Progress</Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {showChallengeForm && (
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Create Challenge</Text>
                  <TouchableOpacity onPress={() => setShowChallengeForm(false)}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Challenge title"
                  placeholderTextColor={colors.textTertiary}
                  value={challengeTitle}
                  onChangeText={setChallengeTitle}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description (optional)"
                  placeholderTextColor={colors.textTertiary}
                  value={challengeDescription}
                  onChangeText={setChallengeDescription}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>Duration (days)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="7"
                      placeholderTextColor={colors.textTertiary}
                      value={challengeDays}
                      onChangeText={setChallengeDays}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>Posts Required</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="7"
                      placeholderTextColor={colors.textTertiary}
                      value={challengePosts}
                      onChangeText={setChallengePosts}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Reward (e.g., Free lunch, $50 bonus)"
                  placeholderTextColor={colors.textTertiary}
                  value={challengeReward}
                  onChangeText={setChallengeReward}
                />
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleCreateChallenge}
                  disabled={createChallengeMutation.isPending}
                >
                  {createChallengeMutation.isPending ? (
                    <ActivityIndicator size="small" color={colors.surface} />
                  ) : (
                    <Text style={styles.submitButtonText}>Create Challenge</Text>
                  )}
                </TouchableOpacity>
              </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 16,
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
    gap: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleGroup: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  seatInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seatWarning: {
    color: colors.warning || '#f59e0b',
    fontWeight: '500',
  },
  seatWarningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: (colors.warning || '#f59e0b') + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  seatWarningCardText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    ...glassCard,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyCardText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  emptyCardSubtext: {
    color: colors.textTertiary,
    fontSize: 13,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  memberCard: {
    ...glassCard,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingAvatar: {
    backgroundColor: colors.border,
  },
  memberInitials: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  memberEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  memberStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  revokeButton: {
    padding: spacing.xs,
  },
  pendingCard: {
    ...glassCard,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.sm,
    opacity: 0.8,
  },
  pendingBadge: {
    backgroundColor: colors.textTertiary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  pendingBadgeBillable: {
    backgroundColor: (colors.warning || '#f59e0b') + '20',
  },
  pendingText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  pendingTextBillable: {
    color: colors.warning || '#f59e0b',
  },
  formCard: {
    ...glassCard,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  challengeCard: {
    ...glassCard,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  challengeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  statusActive: {
    backgroundColor: colors.success + '20',
  },
  statusPaused: {
    backgroundColor: colors.warning + '20',
  },
  statusCompleted: {
    backgroundColor: colors.primary + '20',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text,
    textTransform: 'capitalize',
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  challengeMeta: {
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
  viewProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewProgressText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
