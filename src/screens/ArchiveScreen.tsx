import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { TouchableOpacity, Alert, Share, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore, News } from '../store';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { toggleArchiveNews, fetchNews } from '../services/newsService';
import Toast from 'react-native-toast-message';
import styled from '@emotion/native';
import Animated, {
  FadeInUp,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BASE_URL } from '../utils';

// Import our modern component library
import {
  Screen,
  OptimizedFlatList,
} from '../components';
import { Header } from '../components/ui/Header';

// Modern styled components for Archive Screen
const ModernContainer = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

const ContentSection = styled.View`
  padding: 0 20px;
  margin-bottom: 16px;
`;

const WelcomeCard = styled.View`
  background-color: ${(props) => props.theme.surface};
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.08;
  shadow-radius: 12px;
  elevation: 4;
  border: 1px solid ${(props) => props.theme.border};
`;

const WelcomeHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

const WelcomeIcon = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${(props) => props.theme.primary}15;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
`;

const WelcomeTextContainer = styled.View`
  flex: 1;
`;

const WelcomeTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.text.primary};
`;

const WelcomeSubtitle = styled.Text`
  font-size: 14px;
  color: ${(props) => props.theme.text.secondary};
  margin-top: 2px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 16px;
  border-top-width: 1px;
  border-top-color: ${(props) => props.theme.border};
`;

const StatItem = styled.View`
  align-items: center;
`;

const StatNumber = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${(props) => props.theme.primary};
`;

const StatLabel = styled.Text`
  font-size: 12px;
  color: ${(props) => props.theme.text.secondary};
  margin-top: 4px;
`;

const FilterCard = styled.View`
  background-color: ${(props) => props.theme.surface};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.06;
  shadow-radius: 8px;
  elevation: 3;
  border: 1px solid ${(props) => props.theme.border};
`;

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${(props) => props.theme.text.primary};
`;

const SectionSubtitle = styled.Text`
  font-size: 14px;
  color: ${(props) => props.theme.text.secondary};
  margin-top: 2px;
`;

const FilterButton = styled(TouchableOpacity)<{ active: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) =>
    props.active ? props.theme.primary : props.theme.background};
  border: 2px solid ${(props) =>
    props.active ? props.theme.primary : props.theme.border};
  border-radius: 12px;
  padding: 12px 16px;
  margin-right: 8px;
  min-height: 44px;
`;

const FilterText = styled.Text<{ active: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) =>
    props.active ? props.theme.text.inverse : props.theme.text.primary};
  margin-left: 6px;
`;

const ActionBar = styled.View`
  background-color: ${(props) => props.theme.surface};
  border-radius: 16px;
  padding: 16px;
  margin: 0 20px 16px 20px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 4;
  border: 1px solid ${(props) => props.theme.border};
`;

const NewsCardContainer = styled(TouchableOpacity)`
  background-color: ${(props) => props.theme.surface};
  border-radius: 16px;
  margin: 8px 0;
  padding: 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 4;
  border: 1px solid ${(props) => props.theme.border};
`;

const NewsCardContent = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const NewsImageContainer = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  background-color: ${(props) => props.theme.border};
`;

const NewsImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const NewsTextContent = styled.View`
  flex: 1;
  justify-content: space-between;
`;

const NewsTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.text.primary};
  line-height: 22px;
  margin-bottom: 6px;
`;

const NewsExcerpt = styled.Text`
  font-size: 14px;
  color: ${(props) => props.theme.text.secondary};
  line-height: 20px;
  margin-bottom: 8px;
`;

const NewsMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const NewsMetaLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const NewsCategoryBadge = styled.View`
  background-color: ${(props) => props.theme.primary}15;
  border-radius: 8px;
  padding: 4px 8px;
`;

const NewsCategoryText = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: ${(props) => props.theme.primary};
`;

const NewsMetaText = styled.Text`
  font-size: 12px;
  color: ${(props) => props.theme.text.tertiary};
`;

const NewsActions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const ActionButton = styled(TouchableOpacity)`
  padding: 8px;
  border-radius: 8px;
  background-color: ${(props) => props.theme.background};
`;

const SelectionOverlay = styled.View<{ selected: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${(props) =>
    props.selected ? props.theme.primary : props.theme.background};
  border: 2px solid ${(props) =>
    props.selected ? props.theme.primary : props.theme.border};
  justify-content: center;
  align-items: center;
`;

// Cache keys and constants
const NEWS_CACHE_KEY = 'news_cache';
const ARCHIVED_NEWS_KEY = 'archived_news_ids';
const BOOKMARK_METADATA_KEY = 'bookmark_metadata';
const LAST_FETCHED_KEY = 'last_fetched';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Filter options
const FILTER_OPTIONS = [
  { key: 'all', label: 'All Bookmarks', icon: 'bookmark' },
  { key: 'recent', label: 'Recent', icon: 'time' },
  { key: 'category', label: 'By Category', icon: 'folder' },
];

// Sort options
const SORT_OPTIONS = [
  { key: 'dateBookmarked', label: 'Date Bookmarked' },
  { key: 'datePublished', label: 'Date Published' },
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
];

// Bookmark metadata interface
interface BookmarkMetadata {
  id: string;
  bookmarkedAt: string;
  tags?: string[];
  notes?: string;
}

const ArchiveScreen = () => {
  // Navigation and store
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, allNews, archivedNewsIds, lastArchivedIds, setAllNews, setArchivedNewsIds, setLastArchivedIds } = useAppStore();
  const theme = useTheme();

  // State management
  const [archivedNews, setArchivedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkMetadata, setBookmarkMetadata] = useState<Record<string, BookmarkMetadata>>({});
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateBookmarked');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Animation values
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);

  // Entrance animation
  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    cardOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const saveCachedData = async (newsData: News[], archivedIds: string[]) => {
    try {
      await AsyncStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(newsData));
      await AsyncStorage.setItem(ARCHIVED_NEWS_KEY, JSON.stringify(archivedIds));
      await AsyncStorage.setItem(LAST_FETCHED_KEY, Date.now().toString());
    } catch (err) {
      console.error('Error saving cached data:', err);
    }
  };

  const loadArchivedNews = async (forceFetch: boolean = false, showLoadingIndicator = true) => {
    if (!user) return;

    if (showLoadingIndicator && !refreshing) {
      setLoading(true);
    }

    try {
      setError(null);

      if (forceFetch) {
        // Fetch all news, including archived
        const newsData = await fetchNews(user.role || 'user', '', '', undefined, true);
        const completeNewsData: News[] = newsData.map((item: any) => ({
          _id: item._id,
          title: item.title,
          content: item.content,
          category: item.category,
          image: item.image,
          role: item.role || 'public',
          createdBy: item.createdBy || 'system',
          createdAt: item.createdAt,
          likeCount: item.likeCount || 0,
          viewCount: item.viewCount || 0,
          likedBy: item.likedBy || [],
        }));
        setAllNews(completeNewsData);
        await saveCachedData(completeNewsData, archivedNewsIds);
      }

      // Derive archived news from allNews
      const updatedArchivedNews = allNews.filter((item) => archivedNewsIds.includes(item._id));
      setArchivedNews(updatedArchivedNews);
      setLastArchivedIds([...archivedNewsIds]);
    } catch (err: any) {
      const errorMessage =
        err.response?.status === 401
          ? 'Please log in again to view archived news.'
          : err.response?.data?.message || 'Failed to load archived news. Please try again.';
      console.error('Failed to load archived news:', errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadArchivedNews(true, false);
  };

  const handleRefresh = onRefresh;

  const handleShare = async (item: News) => {
    try {
      await Share.share({
        message: `Check out this article: ${item.title || 'Untitled'}\n\n${(item.content || '').replace(/<[^>]*>/g, '').substring(0, 200)}...`,
        title: item.title || 'Untitled',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadArchivedNews();
    }
  }, [user, allNews, archivedNewsIds]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const checkArchivedIds = async () => {
        try {
          const cachedArchivedIds = await AsyncStorage.getItem(ARCHIVED_NEWS_KEY);
          if (cachedArchivedIds) {
            const parsedArchivedIds = JSON.parse(cachedArchivedIds);
            if (JSON.stringify(parsedArchivedIds) !== JSON.stringify(lastArchivedIds)) {
              setArchivedNewsIds(parsedArchivedIds);
              setLastArchivedIds(parsedArchivedIds);
              loadArchivedNews(true);
            }
          }
        } catch (err) {
          console.error('Error checking archived IDs:', err);
        }
      };

      checkArchivedIds();
    }, [user, lastArchivedIds])
  );

  const handleToggleArchive = async (_id: string) => {
    const previousArchivedNews = [...archivedNews];
    const previousAllNews = [...allNews];
    const previousArchivedIds = [...archivedNewsIds];
    const isCurrentlyArchived = archivedNewsIds.includes(_id);

    if (!isCurrentlyArchived) {
      return;
    }

    // Optimistic update
    const updatedArchivedIds = archivedNewsIds.filter((id) => id !== _id);
    const updatedArchivedNews = archivedNews.filter((item) => item._id !== _id);
    setArchivedNews(updatedArchivedNews);
    setArchivedNewsIds(updatedArchivedIds);
    await saveCachedData(allNews, updatedArchivedIds);

    try {
      const { archivedNewsIds: updatedBackendIds, newsItem } = await toggleArchiveNews(_id);
      setArchivedNewsIds(updatedBackendIds);
      if (newsItem) {
        useAppStore.getState().updateNewsItem({
          _id: newsItem._id,
          title: newsItem.title,
          content: newsItem.content,
          category: newsItem.category,
          image: newsItem.image,
          role: newsItem.role || 'public',
          createdBy: newsItem.createdBy || 'system',
          createdAt: newsItem.createdAt,
          likeCount: newsItem.likeCount || 0,
          viewCount: newsItem.viewCount || 0,
          likedBy: newsItem.likedBy || [],
        });
      }
      await saveCachedData(allNews, updatedBackendIds);
      setLastArchivedIds(updatedBackendIds);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'News unarchived',
      });
    } catch (error: any) {
      setArchivedNews(previousArchivedNews);
      setAllNews(previousAllNews);
      setArchivedNewsIds(previousArchivedIds);
      await saveCachedData(previousAllNews, previousArchivedIds);
      setLastArchivedIds(previousArchivedIds);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to unarchive news',
      });
    }
  };

  // Enhanced bookmark management functions
  const loadBookmarkMetadata = async () => {
    try {
      const stored = await AsyncStorage.getItem(BOOKMARK_METADATA_KEY);
      if (stored) {
        setBookmarkMetadata(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading bookmark metadata:', error);
    }
  };

  const saveBookmarkMetadata = async (metadata: Record<string, BookmarkMetadata>) => {
    try {
      await AsyncStorage.setItem(BOOKMARK_METADATA_KEY, JSON.stringify(metadata));
      setBookmarkMetadata(metadata);
    } catch (error) {
      console.error('Error saving bookmark metadata:', error);
    }
  };

  const addBookmarkWithMetadata = async (newsId: string, tags?: string[], notes?: string) => {
    const metadata: BookmarkMetadata = {
      id: newsId,
      bookmarkedAt: new Date().toISOString(),
      tags,
      notes,
    };

    const updatedMetadata = {
      ...bookmarkMetadata,
      [newsId]: metadata,
    };

    await saveBookmarkMetadata(updatedMetadata);
  };

  const removeBookmarkWithMetadata = async (newsId: string) => {
    const updatedMetadata = { ...bookmarkMetadata };
    delete updatedMetadata[newsId];
    await saveBookmarkMetadata(updatedMetadata);
  };

  // Enhanced toggle bookmark function
  const handleEnhancedToggleBookmark = async (newsId: string) => {
    try {
      const isCurrentlyBookmarked = archivedNewsIds.includes(newsId);

      if (isCurrentlyBookmarked) {
        await removeBookmarkWithMetadata(newsId);
        Toast.show({
          type: 'info',
          text1: 'Bookmark Removed',
          text2: 'Article removed from bookmarks',
        });
      } else {
        await addBookmarkWithMetadata(newsId);
        Toast.show({
          type: 'success',
          text1: 'Bookmark Added',
          text2: 'Article saved to bookmarks',
        });
      }

      // Use existing toggle function
      await handleToggleArchive(newsId);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update bookmark',
      });
    }
  };

  // Bulk operations
  const handleBulkRemove = () => {
    Alert.alert(
      'Remove Bookmarks',
      `Remove ${selectedItems.length} bookmarks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedItems) {
              await removeBookmarkWithMetadata(id);
              await handleToggleArchive(id);
            }
            setSelectedItems([]);
            setIsSelectionMode(false);
            Toast.show({
              type: 'success',
              text1: 'Bookmarks Removed',
              text2: `${selectedItems.length} bookmarks removed`,
            });
          },
        },
      ]
    );
  };

  const handleBulkShare = async () => {
    try {
      const selectedNews = archivedNews.filter(news => selectedItems.includes(news._id));
      const shareText = selectedNews.map(news => `${news.title}\n${news.content.substring(0, 100)}...`).join('\n\n');

      await Share.share({
        message: shareText,
        title: 'Shared Bookmarks',
      });
    } catch (error) {
      console.error('Error sharing bookmarks:', error);
    }
  };

  // Selection mode handlers
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems([]);
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    setSelectedItems(archivedNews.map(item => item._id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Load metadata on mount
  useFocusEffect(
    useCallback(() => {
      loadBookmarkMetadata();
    }, [])
  );

  // Filter and sort archived news
  const filteredAndSortedNews = useMemo(() => {
    let filtered = [...archivedNews];

    // Apply filters
    switch (selectedFilter) {
      case 'recent':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(item => {
          const bookmarkDate = bookmarkMetadata[item._id]?.bookmarkedAt;
          return bookmarkDate && new Date(bookmarkDate) >= weekAgo;
        });
        break;
      case 'category':
        // Group by category (handled in render)
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dateBookmarked':
          const aBookmarked = bookmarkMetadata[a._id]?.bookmarkedAt || a.createdAt;
          const bBookmarked = bookmarkMetadata[b._id]?.bookmarkedAt || b.createdAt;
          return new Date(bBookmarked).getTime() - new Date(aBookmarked).getTime();
        case 'datePublished':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [archivedNews, selectedFilter, sortBy, bookmarkMetadata]);

  // Modern Welcome Section
  const renderWelcomeSection = () => {
    const totalBookmarks = archivedNews.length;
    const recentBookmarks = archivedNews.filter(news => {
      const metadata = bookmarkMetadata[news._id];
      if (!metadata) return false;
      const bookmarkedDate = new Date(metadata.bookmarkedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return bookmarkedDate > weekAgo;
    }).length;

    const categoriesCount = new Set(archivedNews.map(news => news.category)).size;

    return (
      <ContentSection>
        <Animated.View style={cardAnimatedStyle}>
          <WelcomeCard>
            <WelcomeHeader>
              <WelcomeIcon>
                <Icon name="bookmark" size={24} color={theme.primary} />
              </WelcomeIcon>
              <WelcomeTextContainer>
                <WelcomeTitle>Your Saved Articles 📚</WelcomeTitle>
                <WelcomeSubtitle>Access your bookmarked news anytime</WelcomeSubtitle>
              </WelcomeTextContainer>
            </WelcomeHeader>

            <StatsRow>
              <StatItem>
                <StatNumber>{totalBookmarks}</StatNumber>
                <StatLabel>Total Saved</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>{recentBookmarks}</StatNumber>
                <StatLabel>This Week</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>{categoriesCount}</StatNumber>
                <StatLabel>Categories</StatLabel>
              </StatItem>
            </StatsRow>
          </WelcomeCard>
        </Animated.View>
      </ContentSection>
    );
  };

  // Modern Filter Section
  const renderFilterSection = () => {
    const filters = [
      { key: 'all', label: 'All Articles', icon: 'library-outline' },
      { key: 'recent', label: 'Recent', icon: 'time-outline' },
      { key: 'favorites', label: 'Favorites', icon: 'heart-outline' },
    ];

    return (
      <ContentSection>
        <FilterCard>
          <SectionHeader>
            <View>
              <SectionTitle>🔍 Filter & Sort</SectionTitle>
              <SectionSubtitle>Organize your saved articles</SectionSubtitle>
            </View>
          </SectionHeader>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {filters.map((filter) => (
              <FilterButton
                key={filter.key}
                active={selectedFilter === filter.key}
                onPress={() => setSelectedFilter(filter.key)}
                activeOpacity={0.8}
              >
                <Icon
                  name={filter.icon}
                  size={16}
                  color={selectedFilter === filter.key ? theme.text.inverse : theme.text.primary}
                />
                <FilterText active={selectedFilter === filter.key}>
                  {filter.label}
                </FilterText>
              </FilterButton>
            ))}
          </View>
        </FilterCard>
      </ContentSection>
    );
  };

  // Modern render methods
  const renderNewsItem = ({ item, index }: { item: News; index: number }) => {
    const isSelected = selectedItems.includes(item._id);
    const metadata = bookmarkMetadata[item._id];

    const resolveImageUrl = (imagePath: string) => {
      if (!imagePath) return 'https://picsum.photos/seed/archive-news/200/200';
      if (imagePath.startsWith('/assets')) return `${BASE_URL}${imagePath}`;
      return imagePath;
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 48) return 'Yesterday';
      return date.toLocaleDateString();
    };

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 100).springify()}
        style={{ position: 'relative' }}
      >
        <NewsCardContainer
          onPress={() => {
            if (isSelectionMode) {
              toggleItemSelection(item._id);
            } else {
              navigation.navigate('NewsDetail', { newsId: item._id });
            }
          }}
          onLongPress={() => {
            if (!isSelectionMode) {
              setIsSelectionMode(true);
              setSelectedItems([item._id]);
            }
          }}
          activeOpacity={0.95}
          style={{
            backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
            borderColor: isSelected ? theme.primary : theme.border,
            borderWidth: isSelected ? 2 : 1,
          }}
        >
          <NewsCardContent>
            <NewsImageContainer>
              <NewsImage
                source={{ uri: resolveImageUrl(item.image || '') }}
                resizeMode="cover"
              />
            </NewsImageContainer>

            <NewsTextContent>
              <NewsTitle numberOfLines={2}>
                {item.title}
              </NewsTitle>

              <NewsExcerpt numberOfLines={2}>
                {(item.content || '').replace(/<[^>]*>/g, '').substring(0, 100)}...
              </NewsExcerpt>

              <NewsMetaRow>
                <NewsMetaLeft>
                  <NewsCategoryBadge>
                    <NewsCategoryText>{item.category}</NewsCategoryText>
                  </NewsCategoryBadge>
                  <NewsMetaText>
                    Saved {metadata ? formatDate(metadata.bookmarkedAt) : 'Unknown'}
                  </NewsMetaText>
                </NewsMetaLeft>

                <NewsActions>
                  <ActionButton
                    onPress={() => handleEnhancedToggleBookmark(item._id)}
                    activeOpacity={0.7}
                  >
                    <Icon name="bookmark" size={16} color={theme.accent} />
                  </ActionButton>

                  <ActionButton
                    onPress={() => handleShare(item)}
                    activeOpacity={0.7}
                  >
                    <Icon name="share-outline" size={16} color={theme.text.secondary} />
                  </ActionButton>
                </NewsActions>
              </NewsMetaRow>
            </NewsTextContent>
          </NewsCardContent>
        </NewsCardContainer>

        {isSelectionMode && (
          <SelectionOverlay selected={isSelected}>
            {isSelected && <Icon name="checkmark" size={12} color={theme.text.inverse} />}
          </SelectionOverlay>
        )}
      </Animated.View>
    );
  };

  // Modern render section
  return (
    <Screen edges={['top', 'bottom']}>
      <ModernContainer>
        <Header
          title="Saved Articles"
          gradient={true}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          rightComponent={
            archivedNews.length > 0 ? (
              <TouchableOpacity
                onPress={toggleSelectionMode}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <Icon
                  name={isSelectionMode ? 'close' : 'checkmark-circle-outline'}
                  size={18}
                  color={theme.text.inverse}
                />
              </TouchableOpacity>
            ) : undefined
          }
        />

        {/* Selection Mode Action Bar */}
        {isSelectionMode && selectedItems.length > 0 && (
          <ActionBar>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <SectionTitle style={{ fontSize: 16 }}>
                {selectedItems.length} selected
              </SectionTitle>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <ActionButton
                  onPress={handleBulkShare}
                  style={{ backgroundColor: theme.primary + '15', paddingHorizontal: 12 }}
                >
                  <Icon name="share" size={16} color={theme.primary} />
                </ActionButton>
                <ActionButton
                  onPress={handleBulkRemove}
                  style={{ backgroundColor: theme.error + '15', paddingHorizontal: 12 }}
                >
                  <Icon name="trash" size={16} color={theme.error} />
                </ActionButton>
              </View>
            </View>
          </ActionBar>
        )}

        {/* Content */}
        {loading && !refreshing ? (
          <ContentSection>
            <WelcomeCard>
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Icon name="hourglass-outline" size={48} color={theme.primary} />
                <SectionTitle style={{ marginTop: 16, marginBottom: 8 }}>
                  Loading your saved articles...
                </SectionTitle>
                <SectionSubtitle>Please wait while we fetch your bookmarks</SectionSubtitle>
              </View>
            </WelcomeCard>
          </ContentSection>
        ) : error ? (
          <ContentSection>
            <WelcomeCard>
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Icon name="alert-circle-outline" size={48} color={theme.error} />
                <SectionTitle style={{ marginTop: 16, marginBottom: 8, color: theme.error }}>
                  Error Loading Bookmarks
                </SectionTitle>
                <SectionSubtitle style={{ textAlign: 'center', marginBottom: 20 }}>
                  {error}
                </SectionSubtitle>
                <ActionButton
                  onPress={() => loadArchivedNews(true)}
                  style={{ backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 12 }}
                >
                  <Icon name="refresh" size={16} color={theme.text.inverse} />
                  <SectionSubtitle style={{ color: theme.text.inverse, marginLeft: 8 }}>Try Again</SectionSubtitle>
                </ActionButton>
              </View>
            </WelcomeCard>
          </ContentSection>
        ) : filteredAndSortedNews.length > 0 ? (
          <OptimizedFlatList
            data={filteredAndSortedNews}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={() => (
              <View>
                {renderWelcomeSection()}
                {renderFilterSection()}
              </View>
            )}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentPadding={false}
            estimatedItemSize={140}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: theme.background }}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 20
            }}
          />
        ) : (
          <View style={{ flex: 1 }}>
            {renderWelcomeSection()}
            <ContentSection>
              <WelcomeCard>
                <View style={{ alignItems: 'center', padding: 40 }}>
                  <Icon name="bookmark-outline" size={64} color={theme.text.tertiary} />
                  <SectionTitle style={{ marginTop: 20, marginBottom: 8, textAlign: 'center' }}>
                    No Saved Articles Yet
                  </SectionTitle>
                  <SectionSubtitle style={{ textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
                    Start bookmarking articles you want to read later. Tap the bookmark icon on any article to save it here.
                  </SectionSubtitle>
                  <ActionButton
                    onPress={() => navigation.navigate('Home')}
                    style={{
                      backgroundColor: theme.primary,
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <Icon name="newspaper" size={16} color={theme.text.inverse} />
                    <SectionSubtitle style={{ color: theme.text.inverse, fontWeight: '600' }}>
                      Browse News
                    </SectionSubtitle>
                  </ActionButton>
                </View>
              </WelcomeCard>
            </ContentSection>
          </View>
        )}
      </ModernContainer>
    </Screen>
  );
};

export default ArchiveScreen;