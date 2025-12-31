import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface InstagramMedia {
  id: number;
  mediaType: string;
  thumbnailUrl?: string;
  permalink?: string;
  likeCount?: number;
  commentsCount?: number;
  postDate: string;
}

interface InstagramStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalReach: number;
  totalImpressions: number;
  avgEngagement: number;
}

interface InstagramAccount {
  username: string;
  followersCount: number;
  followingCount: number;
  mediaCount: number;
  profilePictureUrl?: string;
  lastSyncAt?: string;
}

function StatCard({ 
  title, 
  value, 
  iconName, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  iconName: keyof typeof Ionicons.glyphMap; 
  subtitle?: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statCardIcon}>
        <Ionicons name={iconName} size={16} color={colors.primary} />
      </View>
      <View style={styles.statCardContent}>
        <Text style={styles.statCardLabel}>{title}</Text>
        <Text style={styles.statCardValue}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

function MediaCard({ media }: { media: InstagramMedia }) {
  const handlePress = () => {
    if (media.permalink) {
      Linking.openURL(media.permalink);
    }
  };

  return (
    <TouchableOpacity style={styles.mediaCard} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.mediaImageContainer}>
        {media.thumbnailUrl ? (
          <Image source={{ uri: media.thumbnailUrl }} style={styles.mediaImage} />
        ) : (
          <View style={styles.mediaPlaceholder}>
            <Ionicons name="image" size={24} color={colors.textSecondary} />
          </View>
        )}
        <View style={styles.mediaOverlay}>
          <View style={styles.mediaStats}>
            <Ionicons name="heart" size={12} color="#FFFFFF" />
            <Text style={styles.mediaStatText}>{media.likeCount?.toLocaleString() || 0}</Text>
          </View>
          <View style={styles.mediaStats}>
            <Ionicons name="chatbubble" size={12} color="#FFFFFF" />
            <Text style={styles.mediaStatText}>{media.commentsCount?.toLocaleString() || 0}</Text>
          </View>
        </View>
        {media.mediaType !== 'IMAGE' && (
          <View style={styles.mediaTypeBadge}>
            <Text style={styles.mediaTypeText}>
              {media.mediaType === 'VIDEO' ? 'Video' : media.mediaType === 'CAROUSEL_ALBUM' ? 'Carousel' : media.mediaType}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function InstagramScreen() {
  const navigation = useNavigation();
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [account, setAccount] = React.useState<InstagramAccount | null>(null);
  const [stats, setStats] = React.useState<InstagramStats | null>(null);
  const [recentMedia, setRecentMedia] = React.useState<InstagramMedia[]>([]);

  React.useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(false);
    }, 500);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Instagram Analytics</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.notConnectedContainer}>
          <View style={styles.instagramIconLarge}>
            <Ionicons name="logo-instagram" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.notConnectedTitle}>Connect Your Instagram</Text>
          <Text style={styles.notConnectedText}>
            Link your Instagram Business or Creator account to see your post analytics and track your growth.
          </Text>
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={() => navigation.navigate('Account' as never)}
          >
            <Text style={styles.connectButtonText}>Go to Account Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Instagram Analytics</Text>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="refresh" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {account && (
          <View style={styles.accountCard}>
            {account.profilePictureUrl ? (
              <Image source={{ uri: account.profilePictureUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="logo-instagram" size={32} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.accountInfo}>
              <Text style={styles.accountUsername}>@{account.username}</Text>
              <View style={styles.accountStats}>
                <Text style={styles.accountStatText}>{account.followersCount.toLocaleString()} followers</Text>
                <Text style={styles.accountStatText}>{account.followingCount.toLocaleString()} following</Text>
              </View>
              {account.lastSyncAt && (
                <Text style={styles.lastSyncText}>
                  Last synced: {new Date(account.lastSyncAt).toLocaleString()}
                </Text>
              )}
            </View>
          </View>
        )}

        {stats && (
          <View style={styles.statsGrid}>
            <StatCard 
              title="Total Posts" 
              value={stats.totalPosts}
              iconName="images"
              subtitle="Last 30 days"
            />
            <StatCard 
              title="Total Likes" 
              value={stats.totalLikes}
              iconName="heart"
            />
            <StatCard 
              title="Comments" 
              value={stats.totalComments}
              iconName="chatbubble"
            />
            <StatCard 
              title="Avg Engagement" 
              value={stats.avgEngagement}
              iconName="trending-up"
              subtitle="per post"
            />
          </View>
        )}

        {stats && stats.totalReach > 0 && (
          <View style={styles.reachCard}>
            <Text style={styles.reachCardTitle}>Reach & Impressions</Text>
            <View style={styles.reachRow}>
              <Text style={styles.reachLabel}>Reach</Text>
              <Text style={styles.reachValue}>{stats.totalReach.toLocaleString()}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '65%' }]} />
            </View>
            <View style={styles.reachRow}>
              <Text style={styles.reachLabel}>Impressions</Text>
              <Text style={styles.reachValue}>{stats.totalImpressions.toLocaleString()}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '80%' }]} />
            </View>
          </View>
        )}

        {recentMedia.length > 0 && (
          <View style={styles.mediaSection}>
            <Text style={styles.mediaSectionTitle}>Recent Posts</Text>
            <View style={styles.mediaGrid}>
              {recentMedia.map((media) => (
                <MediaCard key={media.id} media={media} />
              ))}
            </View>
          </View>
        )}

        {!stats && !account && (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No analytics data available yet.</Text>
            <TouchableOpacity 
              style={styles.syncDataButton}
              onPress={handleSync}
              disabled={isSyncing}
            >
              <Text style={styles.syncDataButtonText}>Sync Instagram Data</Text>
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  syncButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  notConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  instagramIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E1306C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  notConnectedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  notConnectedText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  connectButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: spacing.md,
  },
  profilePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E1306C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  accountInfo: {
    flex: 1,
  },
  accountUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  accountStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  accountStatText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  lastSyncText: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCardIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statCardContent: {
    flex: 1,
  },
  statCardLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statCardSubtitle: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  reachCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reachCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  reachRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  reachLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  reachValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  mediaSection: {
    marginTop: spacing.sm,
  },
  mediaSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  mediaCard: {
    width: '32%',
  },
  mediaImageContainer: {
    aspectRatio: 1,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  mediaStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  mediaStatText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  mediaTypeBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mediaTypeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  syncDataButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  syncDataButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
});
