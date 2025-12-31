import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { postsApi } from '../services/api';
import { RootStackParamList } from '../navigation';
import { colors, borderRadius, shadows, spacing, glassCard } from '../theme';
import { useAuth } from '../hooks/useAuth';

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

type Category = 
  | "Educational"
  | "Before & After"
  | "Behind the Scenes"
  | "Client Spotlight"
  | "Product Showcase"
  | "Promotional"
  | "Engagement"
  | "Inspiration"
  | "Tips & Tricks"
  | "Trending";

type ContentType = "Photo" | "Video" | "Reel" | "Carousel" | "Story" | "Live";

const CATEGORIES: Category[] = [
  "Educational",
  "Before & After",
  "Behind the Scenes",
  "Client Spotlight",
  "Product Showcase",
  "Promotional",
  "Engagement",
  "Inspiration",
  "Tips & Tricks",
  "Trending"
];

const CONTENT_TYPES: ContentType[] = ["Photo", "Video", "Reel", "Carousel", "Story", "Live"];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const contentTypeIcons: Record<ContentType, keyof typeof Ionicons.glyphMap> = {
  Photo: 'camera',
  Video: 'videocam',
  Reel: 'film',
  Carousel: 'images',
  Story: 'time',
  Live: 'radio',
};

const categoryIcons: Record<Category, keyof typeof Ionicons.glyphMap> = {
  Educational: 'school',
  'Before & After': 'swap-horizontal',
  'Behind the Scenes': 'film',
  'Client Spotlight': 'star',
  'Product Showcase': 'bag-handle',
  Promotional: 'megaphone',
  Engagement: 'chatbubbles',
  Inspiration: 'sparkles',
  'Tips & Tricks': 'bulb',
  Trending: 'trending-up',
};

const { width: screenWidth } = Dimensions.get('window');
const GRID_COLUMNS = 2;
const GRID_GAP = spacing.md;
const GRID_ITEM_WIDTH = (screenWidth - spacing.lg * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

export default function CalendarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>([]);

  const isMonthAccessible = (targetMonth: number): boolean => {
    if (targetMonth <= currentMonth) return true;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    if (targetMonth === nextMonth) return true;
    return false;
  };

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', 'month', selectedMonth],
    queryFn: () => postsApi.getByMonth(selectedMonth),
    enabled: isMonthAccessible(selectedMonth),
  });

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let filtered = posts.filter((post: Post) => {
      if (selectedMonth === currentMonth) {
        return post.day >= currentDay;
      }
      return true;
    });
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((post: Post) => 
        selectedCategories.includes(post.category as Category)
      );
    }
    
    if (selectedContentTypes.length > 0) {
      filtered = filtered.filter((post: Post) => 
        selectedContentTypes.includes(post.contentType as ContentType)
      );
    }
    
    return filtered;
  }, [posts, selectedMonth, currentMonth, currentDay, selectedCategories, selectedContentTypes]);

  const hasActiveFilters = selectedCategories.length > 0 || selectedContentTypes.length > 0;
  const activeFilterCount = selectedCategories.length + selectedContentTypes.length;

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedContentTypes([]);
  };

  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleContentType = (type: ContentType) => {
    setSelectedContentTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const canGoForward = isMonthAccessible(selectedMonth + 1 > 12 ? 1 : selectedMonth + 1);

  const handlePostPress = (postId: number) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handleDownloadPDF = async () => {
    try {
      if (!token) {
        Alert.alert(
          'Sign In Required', 
          'Please sign in to download the printable PDF calendar.',
          [{ text: 'OK' }]
        );
        return;
      }
      const pdfUrl = postsApi.getCalendarPdfUrl(selectedMonth);
      await WebBrowser.openBrowserAsync(`${pdfUrl}?token=${encodeURIComponent(token)}`);
    } catch (error) {
      console.error('PDF download error:', error);
      Alert.alert('Download Error', 'Could not download PDF. Please try again.');
    }
  };

  const getCategoryColor = (category: string) => {
    return colors.categories[category] || { bg: colors.surfaceSecondary, text: colors.textSecondary };
  };

  const renderListItem = ({ item }: { item: Post }) => {
    const categoryColor = getCategoryColor(item.category);
    return (
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
            <View style={[styles.metaBadge, { backgroundColor: categoryColor.bg }]}>
              <Text style={[styles.metaText, { color: categoryColor.text }]}>{item.category}</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      </TouchableOpacity>
    );
  };

  const renderGridItem = ({ item }: { item: Post }) => {
    const categoryColor = getCategoryColor(item.category);
    const ContentIcon = contentTypeIcons[item.contentType as ContentType] || 'document';
    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => handlePostPress(item.id)}
      >
        <View style={styles.gridHeader}>
          <View style={styles.gridDay}>
            <Text style={styles.gridDayText}>{item.day}</Text>
          </View>
          <Ionicons name={ContentIcon} size={16} color={colors.primary} />
        </View>
        <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
        <View style={[styles.gridCategoryBadge, { backgroundColor: categoryColor.bg }]}>
          <Text style={[styles.gridCategoryText, { color: categoryColor.text }]} numberOfLines={1}>
            {item.category}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthArrow}
          onPress={() => setSelectedMonth(prev => prev > 1 ? prev - 1 : 12)}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.monthTitleContainer}>
          <Text style={styles.monthTitle}>{MONTHS[selectedMonth - 1]}</Text>
          {!isMonthAccessible(selectedMonth) && (
            <Ionicons name="lock-closed" size={16} color={colors.textTertiary} style={styles.lockIcon} />
          )}
        </View>
        <TouchableOpacity
          style={[styles.monthArrow, !canGoForward && styles.monthArrowDisabled]}
          onPress={() => canGoForward && setSelectedMonth(prev => prev < 12 ? prev + 1 : 1)}
          disabled={!canGoForward}
        >
          <Ionicons name="chevron-forward" size={24} color={canGoForward ? colors.primary : colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownloadPDF}
        >
          <View style={styles.pdfButtonContent}>
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            <Text style={styles.pdfButtonText}>PDF</Text>
          </View>
        </TouchableOpacity>
      </View>

      {isMonthAccessible(selectedMonth) && (
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons 
              name="options-outline" 
              size={18} 
              color={hasActiveFilters ? colors.textOnPrimary : colors.primary} 
            />
            <Text style={[styles.filterButtonText, hasActiveFilters && styles.filterButtonTextActive]}>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons 
                name="list" 
                size={18} 
                color={viewMode === 'list' ? colors.textOnPrimary : colors.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === 'grid' && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons 
                name="grid" 
                size={18} 
                color={viewMode === 'grid' ? colors.textOnPrimary : colors.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!isMonthAccessible(selectedMonth) ? (
        <View style={styles.lockedContainer}>
          <Ionicons name="lock-closed" size={48} color={colors.textTertiary} />
          <Text style={styles.lockedTitle}>Content Locked</Text>
          <Text style={styles.lockedText}>
            {MONTHS[selectedMonth - 1]} posts will unlock on {MONTHS[selectedMonth === 1 ? 11 : selectedMonth - 2]} 1st
          </Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          key={viewMode}
          data={filteredPosts}
          renderItem={viewMode === 'list' ? renderListItem : renderGridItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={viewMode === 'list' ? styles.listContent : styles.gridContent}
          numColumns={viewMode === 'grid' ? GRID_COLUMNS : 1}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No posts found</Text>
              <Text style={styles.emptyText}>
                {hasActiveFilters ? 'Try adjusting your filters' : 'No posts for this month'}
              </Text>
              {hasActiveFilters && (
                <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      <Modal
        visible={filterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <View style={styles.modalHeaderButtons}>
              {hasActiveFilters && (
                <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Categories</Text>
              <View style={styles.filterChips}>
                {CATEGORIES.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  const categoryColor = getCategoryColor(category);
                  const iconName = categoryIcons[category];
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.filterChip,
                        { backgroundColor: categoryColor.bg },
                        isSelected && styles.filterChipSelected
                      ]}
                      onPress={() => toggleCategory(category)}
                    >
                      <Ionicons 
                        name={iconName} 
                        size={14} 
                        color={isSelected ? colors.textOnPrimary : categoryColor.text} 
                      />
                      <Text style={[
                        styles.filterChipText,
                        { color: categoryColor.text },
                        isSelected && styles.filterChipTextSelected
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Content Types</Text>
              <View style={styles.contentTypeGrid}>
                {CONTENT_TYPES.map((type) => {
                  const isSelected = selectedContentTypes.includes(type);
                  const iconName = contentTypeIcons[type];
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.contentTypeButton,
                        isSelected && styles.contentTypeButtonSelected
                      ]}
                      onPress={() => toggleContentType(type)}
                    >
                      <Ionicons 
                        name={iconName} 
                        size={24} 
                        color={isSelected ? colors.textOnPrimary : colors.primary} 
                      />
                      <Text style={[
                        styles.contentTypeText,
                        isSelected && styles.contentTypeTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>
                Show {filteredPosts.length} Post{filteredPosts.length !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.glass.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthArrow: {
    padding: spacing.sm,
  },
  monthArrowDisabled: {
    opacity: 0.4,
  },
  downloadButton: {
    position: 'absolute',
    right: spacing.lg,
    padding: spacing.sm,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  monthTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xxl,
  },
  lockIcon: {
    marginLeft: spacing.xs,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.glass.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  filterButtonTextActive: {
    color: colors.textOnPrimary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  viewToggleButton: {
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  viewToggleButtonActive: {
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 120,
  },
  gridContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    ...glassCard,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  postDate: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  postDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  postContent: {
    flex: 1,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  postDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  postMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  metaText: {
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  gridCard: {
    width: GRID_ITEM_WIDTH,
    ...glassCard,
    padding: spacing.md,
    marginBottom: GRID_GAP,
    marginRight: GRID_GAP,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  gridDay: {
    width: 32,
    height: 32,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridDayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    minHeight: 36,
  },
  gridCategoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
  },
  gridCategoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  clearFiltersButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
  },
  clearFiltersText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  lockedText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pdfButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pdfButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.glass.backgroundLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  clearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  filterSection: {
    marginBottom: spacing.xl,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: colors.textOnPrimary,
  },
  contentTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  contentTypeButton: {
    width: (screenWidth - spacing.lg * 2 - spacing.sm * 2) / 3,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentTypeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  contentTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs,
  },
  contentTypeTextSelected: {
    color: colors.textOnPrimary,
  },
  modalFooter: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.glass.backgroundLight,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.button,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
