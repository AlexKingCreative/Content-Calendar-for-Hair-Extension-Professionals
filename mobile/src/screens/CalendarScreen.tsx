import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { postsApi } from '../services/api';
import { RootStackParamList } from '../navigation';

interface Post {
  id: number;
  date: string;
  day: number;
  title: string;
  description: string;
  category: string;
  contentType: string;
  hashtags: string[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', 'month', selectedMonth],
    queryFn: () => postsApi.getByMonth(selectedMonth),
  });

  const handlePostPress = (postId: number) => {
    navigation.navigate('PostDetail', { postId });
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => handlePostPress(item.id)}
    >
      <View style={styles.postDate}>
        <Text style={styles.postDay}>{item.day}</Text>
      </View>
      <View style={styles.postContent}>
        <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.postDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.postMeta}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>{item.contentType}</Text>
          </View>
          <View style={[styles.metaBadge, styles.categoryMeta]}>
            <Text style={styles.categoryMetaText}>{item.category}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#D4A574" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthArrow}
          onPress={() => setSelectedMonth(prev => prev > 1 ? prev - 1 : 12)}
        >
          <Ionicons name="chevron-back" size={24} color="#D4A574" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTHS[selectedMonth - 1]}</Text>
        <TouchableOpacity
          style={styles.monthArrow}
          onPress={() => setSelectedMonth(prev => prev < 12 ? prev + 1 : 1)}
        >
          <Ionicons name="chevron-forward" size={24} color="#D4A574" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4A574" />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts for this month</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5D5C5',
  },
  monthArrow: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D4E3C',
    marginHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  postDate: {
    width: 48,
    height: 48,
    backgroundColor: '#D4A574',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  postDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  postContent: {
    flex: 1,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: 4,
  },
  postDescription: {
    fontSize: 13,
    color: '#8B7355',
    lineHeight: 18,
    marginBottom: 8,
  },
  postMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaBadge: {
    backgroundColor: '#D4A574',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  metaText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  categoryMeta: {
    backgroundColor: '#F5EDE4',
  },
  categoryMetaText: {
    color: '#8B7355',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#8B7355',
    fontSize: 16,
  },
});
