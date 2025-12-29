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
        <ActivityIndicator size="large" color="#D4A574" />
        <Text style={styles.loadingText}>Loading trends...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="trending-up" size={28} color="#D4A574" />
        <Text style={styles.headerTitle}>Trend Alerts</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Hot trends to jump on before they expire
      </Text>

      {activeTrends.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="sparkles-outline" size={64} color="#E5D5C5" />
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
                  <Ionicons name="time-outline" size={12} color="#FFFFFF" />
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
                  <Ionicons name="hourglass-outline" size={14} color="#8B7355" />
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
                    <Ionicons name="play-circle-outline" size={20} color="#D4A574" />
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8B7355',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D4E3C',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4E3C',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  trendsList: {
    gap: 16,
  },
  trendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EF4444',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trendTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: 8,
  },
  trendDescription: {
    fontSize: 14,
    color: '#8B7355',
    lineHeight: 20,
    marginBottom: 12,
  },
  trendDate: {
    fontSize: 12,
    color: '#A89580',
    marginBottom: 8,
  },
  expiresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  expiresText: {
    fontSize: 13,
    color: '#8B7355',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5D4E3C',
  },
});
