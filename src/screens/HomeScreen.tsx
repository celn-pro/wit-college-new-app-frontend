import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import {
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { debouncedFetchNews, toggleArchiveNews, fetchUserPreferences } from '../services/newsService';
import { useAppStore, News } from '../store';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, TabParamList } from '../navigation';
import { useTheme } from '../theme';
import Toast from 'react-native-toast-message';
import { BASE_URL } from '../utils';


import Animated, {
  FadeInRight,
  FadeOutLeft,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import styled from '@emotion/native';
import { cacheService } from '../services/cacheService';

// Import our modern component library
import {
  Screen,
  Container,
  Row,
  Column,
  Header,
  Typography,
  Button,
  OptimizedFlatList,
} from '../components';

// Modern Styled Components for HomeScreen
const ModernContainer = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

const ContentSection = styled.View`
  padding: 0 20px;
  margin-bottom: 24px;
`;

const SectionCard = styled.View`
  background-color: ${(props) => props.theme.surface};
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.08;
  shadow-radius: 12px;
  elevation: 4;
  border: 1px solid ${(props) => props.theme.border};
`;

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.text.primary};
`;

const SectionSubtitle = styled.Text`
  font-size: 14px;
  color: ${(props) => props.theme.text.secondary};
  margin-top: 2px;
`;

const FeaturedSection = styled.View`
  margin-bottom: 8px;
`;

const FeaturedCard = styled(TouchableOpacity)`
  border-radius: 20px;
  overflow: hidden;
  background-color: ${(props) => props.theme.surface};
  shadow-color: #000;
  shadow-offset: 0px 8px;
  shadow-opacity: 0.15;
  shadow-radius: 16px;
  elevation: 12;
  margin-vertical: ${(props) => props.theme.spacing.md}px;
  height: 320px;
`;

const FeaturedImageContainer = styled.View`
  height: 200px;
  position: relative;
  overflow: hidden;
`;

const FeaturedImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const FeaturedContentContainer = styled.View`
  padding: ${(props) => props.theme.spacing.lg}px;
  padding-bottom: 15px;
  padding-left: 10px;
  padding-right: 10px;
  background-color: ${(props) => props.theme.cardBackground};
  height: 120px;
  justify-content: space-between;
`;

const FeaturedMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: ${(props) => props.theme.spacing.sm}px;
`;

const FeaturedCategoryBadge = styled.View`
  background-color: ${(props) => props.theme.primaryLight};
  border-radius: 12px;
  padding: 6px 12px;
  margin-bottom: ${(props) => props.theme.spacing.sm}px;
  align-self: flex-start;
`;

const FeaturedStatsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md}px;
`;

const FeaturedStatItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const FeaturedIndicators = styled.View`
  position: absolute;
  bottom: ${(props) => props.theme.spacing.sm}px;
  right: ${(props) => props.theme.spacing.md}px;
  flex-direction: row;
  align-items: center;
`;

const FeaturedIndicator = styled.View<{ active: boolean }>`
  width: ${(props) => (props.active ? '24px' : '8px')};
  height: 6px;
  border-radius: 3px;
  background-color: ${(props) => (props.active ? props.theme.accent : props.theme.text.inverse + '50')};
  margin-horizontal: 3px;
  shadow-color: ${(props) => props.active ? props.theme.accent : 'transparent'};
  shadow-offset: 0px 2px;
  shadow-opacity: ${(props) => props.active ? 0.4 : 0};
  shadow-radius: 4px;
  elevation: ${(props) => props.active ? 2 : 0};
`;



const SkeletonCard = styled.View`
  height: 120px;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 24px;
  margin: ${(props) => props.theme.spacing.xs}px ${(props) => props.theme.spacing.md}px;
  padding: ${(props) => props.theme.spacing.md}px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
  elevation: 4;
`;

const SkeletonLine = styled.View<{ width?: string; height?: number }>`
  height: ${(props) => props.height || 16}px;
  width: ${(props) => props.width || '100%'};
  background-color: ${(props) => props.theme.border};
  border-radius: 8px;
  margin-bottom: ${(props) => props.theme.spacing.sm}px;
`;

const PulseAnimation = styled(Animated.View)`
  opacity: 0.6;
`;



// Trending Badge
const TrendingBadge = styled.View`
  position: absolute;
  top: ${(props) => props.theme.spacing.sm}px;
  left: ${(props) => props.theme.spacing.sm}px;
  background-color: ${(props) => props.theme.accent};
  border-radius: 12px;
  padding: 6px 10px;
  flex-direction: row;
  align-items: center;
  shadow-color: ${(props) => props.theme.accent};
  shadow-offset: 0px 3px;
  shadow-opacity: 0.4;
  shadow-radius: 6px;
  elevation: 6;
  z-index: 10;
`;





const CategoryScrollContainer = styled.View`
  background-color: ${(props) => props.theme.surface};
  padding-top: ${(props) => props.theme.spacing.lg}px;
  padding-bottom: ${(props) => props.theme.spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.divider};
  margin-bottom: ${(props) => props.theme.spacing.sm}px;
`;

const CategoryButton = styled(TouchableOpacity)<{ selected: boolean }>`
  background-color: ${(props) =>
    props.selected ? props.theme.primary : props.theme.cardBackground};
  padding: ${(props) => props.theme.spacing.sm}px ${(props) => props.theme.spacing.lg}px;
  border-radius: 15px;
  margin-horizontal: ${(props) => props.theme.spacing.xs}px;
  margin-right: 5px;
  margin-vertical: ${(props) => props.theme.spacing.xs}px;
  border: 1.5px solid ${(props) =>
    props.selected ? props.theme.primary : props.theme.border};
  shadow-color: ${(props) => props.selected ? props.theme.primary : '#000'};
  shadow-offset: 0px ${(props) => props.selected ? 6 : 2}px;
  shadow-opacity: ${(props) => props.selected ? 0.25 : 0.08};
  shadow-radius: ${(props) => props.selected ? 10 : 4}px;
  elevation: ${(props) => props.selected ? 6 : 2};
  min-height: 44px;
  justify-content: center;
  align-items: center;
  padding-left:10px;
  padding-right:10px;
`;

// Memoized category button component to prevent unnecessary re-renders
const MemoizedCategoryButton = memo(({
  category,
  isSelected,
  onPress
}: {
  category: string;
  isSelected: boolean;
  onPress: (category: string) => void;
}) => (
  <CategoryButton
    selected={isSelected}
    onPress={() => onPress(category)}
    activeOpacity={0.7}
  >
    <Typography
      variant="body2"
      color={isSelected ? 'inverse' : 'primary'}
      weight="semiBold"
      style={{ fontSize: 13 }}
    >
      {category}
    </Typography>
  </CategoryButton>
));

const NotificationButton = styled(TouchableOpacity)`
  width: 30px;
  height: 30px;
  border-radius: 24px;
  background-color: ${(props) => props.theme.surface}90;
  justify-content: center;
  align-items: center;
  position: relative;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 8px;
  elevation: 4;
`;

const NotificationBadge = styled.View`
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: ${(props) => props.theme.error};
  border-radius: 8px;
  min-width: 16px;
  height: 16px;
  justify-content: center;
  align-items: center;
  padding-horizontal: 3px;
  border: 1.5px solid ${(props) => props.theme.surface};
  shadow-color: ${(props) => props.theme.error};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.4;
  shadow-radius: 2px;
  elevation: 3;
`;

const ThemeToggleButton = styled(TouchableOpacity)`
  width: 30px;
  height: 30px;
  border-radius: 24px;
  background-color: ${(props) => props.theme.surface}95;
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 8px;
  elevation: 4;
  border: 2px solid ${(props) => props.theme.border}20;
`;

// Modern Category Components

const ModernCategoryContainer = styled.View`
  padding: 0 20px;
  margin-bottom: 8px;
`;

// Modern News Card Components
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
  padding: 6px;
  border-radius: 8px;
  background-color: ${(props) => props.theme.background};
`;



const resolveImageUrl = (imagePath: string) => {
  if (!imagePath) return 'https://picsum.photos/seed/default-news/200/200';
  if (imagePath.startsWith('/assets')) return `${BASE_URL}${imagePath}`;
  return imagePath;
};

// Helper function to generate personalized greeting
const getPersonalizedGreeting = (user: any): string => {
  try {
    const hour = new Date().getHours();
    let timeGreeting = '';

    if (hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour < 17) {
      timeGreeting = 'Good afternoon';
    } else {
      timeGreeting = 'Good evening';
    }

    if (user?.username) {
      return `${timeGreeting}, ${user.username}!`;
    }

    return `${timeGreeting}!`;
  } catch (error) {
    console.error('Error in getPersonalizedGreeting:', error);
    return 'Welcome!';
  }
};

const HomeScreen = () => {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const tabNavigation = useNavigation<NavigationProp<TabParamList>>();
  const { themeMode, toggleTheme, user, availableCategories, setAllNews, allNews, archivedNewsIds, setArchivedNewsIds, getUnreadCount } = useAppStore();
  const theme = useTheme();

  // Animation values
  const pulseValue = useSharedValue(0.6);

  // Pulse animation for skeleton loading
  useEffect(() => {
    if (loading) {
      pulseValue.value = withTiming(1, { duration: 1000 }, () => {
        pulseValue.value = withTiming(0.6, { duration: 1000 });
      });
    }
  }, [loading, pulseValue]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseValue.value,
  }));


  const loadCachedData = async () => {
    try {
      const cached = await cacheService.getNewsCache();
      if (cached) {
        setAllNews(cached.news);
        setArchivedNewsIds(cached.archivedIds);
        setNews(
          selectedCategory === 'All'
            ? cached.news.filter((item: News) => !cached.archivedIds.includes(item._id))
            : cached.news.filter(
                (item: News) => item.category === selectedCategory && !cached.archivedIds.includes(item._id)
              )
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error loading cached data:', err);
      return false;
    }
  };

  const saveCachedData = async (newsData: News[], archivedIds: string[]) => {
    try {
      await cacheService.setNewsCache(newsData, archivedIds);
    } catch (err) {
      console.error('Error saving cached data:', err);
    }
  };

  const loadData = async (forceFetch: boolean = false, showLoadingIndicator: boolean = true) => {
    try {
      if (forceFetch && showLoadingIndicator && !initialLoadComplete) {
        setLoading(true);
      }
      setError(null);

      if (!forceFetch && await loadCachedData()) {
        setLoading(false);
        setInitialLoadComplete(true);
        return;
      }

      let userArchivedIds: string[] = [];
      let userCategories: string[] = [];
      try {
        const preferences = await fetchUserPreferences();
        userArchivedIds = preferences.archivedNewsIds || [];
        userCategories = preferences.selectedCategories || [];
      } catch (err) {
        console.warn('Failed to fetch preferences, using defaults:', err);
        userArchivedIds = [];
        userCategories = availableCategories;
      }
      setArchivedNewsIds(userArchivedIds);

      let filteredCategories = ['All'];
      if (user?.isAdmin) {
        filteredCategories = ['All', 'Deadline', 'Achievements', ...userCategories];
      } else {
        filteredCategories = ['All', ...userCategories];
      }
      filteredCategories = [...new Set(filteredCategories)];
      setCategories(filteredCategories);

      const newsData = await debouncedFetchNews(user?.role || 'user', '', '', undefined, true);
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

      await saveCachedData(completeNewsData, userArchivedIds);
      setAllNews(completeNewsData);

      const filteredNewsData = completeNewsData.filter((item) => !userArchivedIds.includes(item._id));
      setNews(
        selectedCategory === 'All'
          ? filteredNewsData
          : filteredNewsData.filter((item) => item.category === selectedCategory)
      );
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await cacheService.clearCache();
      await loadData(true, true);
      Toast.show({
        type: 'success',
        text1: 'Refreshed',
        text2: 'News data refreshed successfully',
      });
    } catch (err) {
      setError('Failed to refresh data. Please try again.');
      console.error('Error refreshing data:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to refresh data',
      });
    } finally {
      setRefreshing(false);
    }
  };


  // Check if user needs category onboarding
  useEffect(() => {
    const checkCategoryOnboarding = async () => {
      if (user && initialLoadComplete) {
        try {
          const preferences = await fetchUserPreferences();
          const userSelectedCategories = preferences.selectedCategories || [];

          // If user has no categories selected or only has 'All', show onboarding
          if (userSelectedCategories.length === 0 ||
              (userSelectedCategories.length === 1 && userSelectedCategories[0] === 'All')) {
            navigation.navigate('CategoryOnboarding');
          }
        } catch (error) {
          console.error('Error checking user preferences for onboarding:', error);
          // If we can't fetch preferences, assume they need onboarding
          navigation.navigate('CategoryOnboarding');
        }
      }
    };

    checkCategoryOnboarding();
  }, [user, initialLoadComplete, navigation]);

  useEffect(() => {
    loadData();
  }, [user, setAllNews, availableCategories]);

  useEffect(() => {
    if (initialLoadComplete) {
      setNews(
        allNews.filter(
          (item) =>
            !archivedNewsIds.includes(item._id) &&
            (selectedCategory === 'All' || item.category === selectedCategory)
        )
      );
    }
  }, [archivedNewsIds, allNews, selectedCategory, initialLoadComplete]);

  useFocusEffect(
    useCallback(() => {
      const syncNewsWithArchivedIds = async () => {
        try {
          const cachedData = await cacheService.getNewsCache();
          const cachedArchivedIds = cachedData?.archivedIds || [];
          const currentArchivedIds = archivedNewsIds;

          if (
            initialLoadComplete &&
            JSON.stringify(cachedArchivedIds) !== JSON.stringify(currentArchivedIds)
          ) {
            setNews(
              allNews.filter(
                (item) =>
                  !currentArchivedIds.includes(item._id) &&
                  (selectedCategory === 'All' || item.category === selectedCategory)
              )
            );
            await saveCachedData(allNews, currentArchivedIds);
          }

          // Always refresh user preferences when screen comes into focus
          // This ensures categories are updated after user changes them in CategorySelection
          if (initialLoadComplete) {
            try {
              const preferences = await fetchUserPreferences();
              const userCategories = preferences.selectedCategories || [];

              let filteredCategories = ['All'];
              if (user?.isAdmin) {
                filteredCategories = ['All', 'Deadline', 'Achievements', ...userCategories];
              } else {
                filteredCategories = ['All', ...userCategories];
              }
              filteredCategories = [...new Set(filteredCategories)];
              setCategories(filteredCategories);
            } catch (err) {
              console.warn('Failed to refresh categories on focus:', err);
            }
          }

          if (initialLoadComplete && (await cacheService.isCacheExpired())) {
            await loadData(true, false);
          }
        } catch (err) {
          console.error('Error syncing news or checking cache:', err);
        }
      };
      syncNewsWithArchivedIds();
    }, [initialLoadComplete, archivedNewsIds, allNews, selectedCategory, loadData, user])
  );

 const handleCategoryChange = async (category: string) => {
  setSelectedCategory(category);
  try {
    if (category === 'All') {
      setNews(allNews.filter((item) => !archivedNewsIds.includes(item._id)));
    } else {
      // Filter from allNews instead of fetching again
      setNews(allNews.filter((item) => item.category === category && !archivedNewsIds.includes(item._id)));
    }
  } catch (err) {
    console.error('Error changing category:', err);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Failed to load category',
    });
  }
};

  const handleToggleArchive = async (_id: string) => {
    const previousNews = [...news];
    const previousAllNews = [...allNews];
    const previousArchivedIds = [...archivedNewsIds];
    const isCurrentlyArchived = archivedNewsIds.includes(_id);
    const newArchivedNewsIds = isCurrentlyArchived
      ? archivedNewsIds.filter((id) => id !== _id)
      : [...archivedNewsIds, _id];

    setArchivedNewsIds(newArchivedNewsIds);
    setNews(
      allNews.filter(
        (item) => !newArchivedNewsIds.includes(item._id) &&
                 (selectedCategory === 'All' || item.category === selectedCategory)
      )
    );
    await saveCachedData(allNews, newArchivedNewsIds);

    try {
      const { archivedNewsIds: updatedArchivedIds, newsItem } = await toggleArchiveNews(_id);
      setArchivedNewsIds(updatedArchivedIds);
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
      await saveCachedData(allNews, updatedArchivedIds);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: isCurrentlyArchived ? 'News unarchived' : 'News archived',
      });
    } catch (error: any) {
      console.error('Archive toggle failed:', error);
      setNews(previousNews);
      setAllNews(previousAllNews);
      setArchivedNewsIds(previousArchivedIds);
      await saveCachedData(previousAllNews, previousArchivedIds);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to toggle archive status',
      });
    }
  };



   const getFeaturedNewsItems = useCallback(() => {
    let featuredItems = news.slice(0, 5);
    if (featuredItems.length === 0 && allNews.length > 0) {
      featuredItems = allNews.filter((item) => !archivedNewsIds.includes(item._id)).slice(0, 5);
    }
    return featuredItems.map((item) => ({
      ...item,
      image: resolveImageUrl(item.image || ''),
    }));
  }, [news, allNews, archivedNewsIds]);

  const featuredItems = getFeaturedNewsItems();

   // Auto-swap logic
  useEffect(() => {
    if (featuredItems.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredItems.length);
    }, 4000); // 4 seconds
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  // Component mounting effect to prevent getScrollableNode errors
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);



  const renderFeaturedSection = () => {
    if (featuredItems.length === 0) return null;
    const item = featuredItems[featuredIndex] || featuredItems[0];

    return (
      <FeaturedSection>
        <View key={item._id}>
          <FeaturedCard
            activeOpacity={0.95}
            onPress={() => navigation.navigate('NewsDetail', { newsId: item._id })}
          >
            {/* Image Section */}
            <FeaturedImageContainer>
              <FeaturedImage
                source={{ uri: resolveImageUrl(item.image) }}
                defaultSource={require('../assets/placeholder.png')}
                resizeMode="cover"
              />

              {/* Trending Badge for popular news */}
              {(item.viewCount || 0) > 100 && (
                <TrendingBadge>
                  <Icon name="trending-up" size={12} color={theme.text.inverse} />
                  <Typography
                    variant="caption"
                    color="inverse"
                    weight="bold"
                    style={{ marginLeft: 4, fontSize: 10 }}
                  >
                    TRENDING
                  </Typography>
                </TrendingBadge>
              )}

              {/* Featured Indicators */}
              {featuredItems.length > 1 && (
                <FeaturedIndicators>
                  {featuredItems.map((_, index) => (
                    <FeaturedIndicator
                      key={index}
                      active={index === featuredIndex}
                    />
                  ))}
                </FeaturedIndicators>
              )}
            </FeaturedImageContainer>

            {/* Content Section */}
            <FeaturedContentContainer>
              {/* Category Badge */}
              <FeaturedCategoryBadge>
                <Typography
                  variant="caption"
                  color="primary"
                  weight="semiBold"
                  style={{ fontSize: 11 }}
                >
                  {item.category.toUpperCase()}
                </Typography>
              </FeaturedCategoryBadge>

              {/* Title */}
              <Typography
                variant="h3"
                color="primary"
                weight="bold"
                numberOfLines={2}
                style={{ lineHeight: 28, flex: 1 }}
              >
                {item.title}
              </Typography>

              {/* Meta Information */}
              <FeaturedMetaRow>
                <Typography
                  variant="body2"
                  color="secondary"
                  style={{ flex: 1 }}
                >
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Typography>

                <FeaturedStatsContainer>
                  <FeaturedStatItem>
                    <Icon name="eye-outline" size={16} color={theme.text.secondary} />
                    <Typography
                      variant="caption"
                      color="secondary"
                      weight="medium"
                    >
                      {item.viewCount || 0}
                    </Typography>
                  </FeaturedStatItem>

                  <FeaturedStatItem>
                    <Icon name="heart-outline" size={16} color={theme.accent} />
                    <Typography
                      variant="caption"
                      color="secondary"
                      weight="medium"
                    >
                      {item.likeCount || 0}
                    </Typography>
                  </FeaturedStatItem>
                </FeaturedStatsContainer>
              </FeaturedMetaRow>
            </FeaturedContentContainer>
          </FeaturedCard>
        </View>
      </FeaturedSection>
    );
  };







  const renderModernHeader = () => {
    const unreadCount = getUnreadCount();

    const rightComponent = (
      <Row align="center">
        <NotificationButton
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.8}
        >
          <Icon
            name="search-outline"
            size={15}
            color={theme.text.inverse}
          />
        </NotificationButton>

        <NotificationButton
          onPress={() => tabNavigation.navigate('Notifications')}
          activeOpacity={0.8}
          style={{ marginLeft: theme.spacing.md }}
        >
          <Icon
            name="notifications-outline"
            size={15}
            color={theme.text.inverse}
          />
          {unreadCount > 0 && (
            <NotificationBadge>
              <Typography
                variant="caption"
                color="inverse"
                weight="bold"
                style={{ fontSize: 8, lineHeight: 10 }}
              >
                {unreadCount > 9 ? '9+' : unreadCount.toString()}
              </Typography>
            </NotificationBadge>
          )}
        </NotificationButton>

        <ThemeToggleButton
          onPress={toggleTheme}
          activeOpacity={0.8}
          style={{ marginLeft: theme.spacing.md }}
        >
          <Icon
            name={themeMode === 'light' ? 'moon' : 'sunny'}
            size={15}
            color={theme.text.inverse}
          />
        </ThemeToggleButton>
      </Row>
    );

    const subtitle = user ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} • ${user.username}` : undefined;

    return (
      <>
        <Header
          title={getPersonalizedGreeting(user) || 'College News'}
          subtitle={subtitle}
          gradient={true}
          rightComponent={rightComponent}
        />
      </>
    );
  };

  const renderCategorySection = () => (
    <View style={{ marginBottom: 24 }}>
      <View style={{ marginBottom: 8, 
        paddingHorizontal: 20 
        }}>
        <Typography
          variant="body2"
          color="secondary"
          style={{
            marginBottom: 12,
            fontSize: 14
          }}
        >
          Browse news by topic
        </Typography>
      </View>

      {isMounted && categories && categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
          style={{ backgroundColor: 'transparent' }}
        >
          {categories.map((item) => (
            <CategoryButton
              key={`category-${item}`}
              selected={selectedCategory === item}
              onPress={() => handleCategoryChange(item)}
              activeOpacity={0.7}
            >
              <Typography
                variant="body2"
                color={selectedCategory === item ? 'inverse' : 'primary'}
                weight="semiBold"
                style={{ fontSize: 13 }}
              >
                {item}
              </Typography>
            </CategoryButton>
          ))}
        </ScrollView>
      )}
    </View>
  );



  const renderNewsItem = ({ item, index }: { item: News; index: number }) => {
    const resolveImageUrl = (imagePath: string) => {
      if (!imagePath) return 'https://picsum.photos/seed/default-news/200/200';
      if (imagePath.startsWith('/assets')) return `${BASE_URL}${imagePath}`;
      return imagePath;
    };

    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Unknown date';

        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 48) return 'Yesterday';
        return date.toLocaleDateString();
      } catch (error) {
        console.warn('Date formatting error:', error);
        return 'Unknown date';
      }
    };

    return (
      <View style={{ marginHorizontal: 0 }}>
        <NewsCardContainer
          onPress={() => navigation.navigate('NewsDetail', { newsId: item._id })}
          activeOpacity={0.95}
        >
          <NewsCardContent>
            <NewsImageContainer>
              <NewsImage
                source={{ uri: resolveImageUrl(item.image || '') }}
                defaultSource={require('../assets/placeholder.png')}
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
                  <NewsMetaText>{formatDate(item.createdAt)}</NewsMetaText>
                </NewsMetaLeft>

                <NewsActions>
                  <ActionButton
                    onPress={() => handleToggleArchive(item._id)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={archivedNewsIds.includes(item._id) ? 'bookmark' : 'bookmark-outline'}
                      size={16}
                      color={archivedNewsIds.includes(item._id) ? theme.accent : theme.text.secondary}
                    />
                  </ActionButton>

                  <ActionButton activeOpacity={0.7}>
                    <Icon name="share-outline" size={16} color={theme.text.secondary} />
                  </ActionButton>
                </NewsActions>
              </NewsMetaRow>
            </NewsTextContent>
          </NewsCardContent>
        </NewsCardContainer>
      </View>
    );
  };

  // Memoized data for performance
  const flatListData = useMemo(() => news, [news]);

  const renderSkeletonLoader = () => (
    <Column flex={1}>
      {/* Skeleton Featured Section */}
      <Container style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        <PulseAnimation style={pulseStyle}>
          <SkeletonCard style={{ height: 240 }}>
            <SkeletonLine height={20} width="70%" />
            <SkeletonLine height={16} width="50%" />
            <View style={{ flex: 1 }} />
            <SkeletonLine height={24} width="90%" />
            <SkeletonLine height={16} width="60%" />
          </SkeletonCard>
        </PulseAnimation>
      </Container>



      {/* Skeleton News List */}
      <Container flex={1} paddingVertical="md">
        <PulseAnimation style={pulseStyle}>
          {[1, 2, 3, 4, 5].map((item) => (
            <SkeletonCard key={item}>
              <Row>
                <SkeletonLine height={80} width="80px" />
                <Column flex={1} style={{ marginLeft: theme.spacing.md }}>
                  <SkeletonLine height={16} width="90%" />
                  <SkeletonLine height={14} width="70%" />
                  <SkeletonLine height={12} width="50%" />
                </Column>
              </Row>
            </SkeletonCard>
          ))}
        </PulseAnimation>
      </Container>
    </Column>
  );

  // Loading state
  if (loading && !initialLoadComplete) {
    return (
      <Screen edges={['top', 'bottom']}>
        {renderModernHeader()}
        {renderSkeletonLoader()}
      </Screen>
    );
  }

  // Error state
  if (error) {
    return (
      <Screen edges={['top', 'bottom']}>
        {renderModernHeader()}
        <Container flex={1} justify="center" align="center" paddingHorizontal="lg">
          <Icon name="alert-circle-outline" size={64} color={theme.error} />
          <Typography
            variant="h4"
            color="primary"
            align="center"
            style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}
          >
            Something went wrong
          </Typography>
          <Typography
            variant="body2"
            color="secondary"
            align="center"
            style={{ marginBottom: theme.spacing.lg }}
          >
            {error}
          </Typography>
          <Button
            title="Try Again"
            onPress={() => loadData(true)}
            variant="primary"
            icon={<Icon name="refresh" size={16} color={theme.text.inverse} />}
          />
        </Container>
      </Screen>
    );
  }

  // Enhanced header component for list
  const renderListHeader = () => (
    <Column>
      {renderFeaturedSection()}

      {/* Section Title */}
      <Container style={{ paddingVertical: 8, marginTop: 10 }}>
        <Typography variant="h4" color="primary" weight="semiBold">
          Latest News
        </Typography>
        <Typography variant="body2" color="secondary" style={{ marginTop: 4 }}>
          {selectedCategory === 'All' ? 'All categories' : selectedCategory} • {news.length} articles
        </Typography>
      </Container>
    </Column>
  );

  // Enhanced empty state
  const renderEmptyState = () => (
    <Container flex={1} justify="center" align="center" paddingHorizontal="lg">
      <View>
        <View style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: theme.primaryLight,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
        }}>
          <Icon
            name="newspaper-outline"
            size={60}
            color={theme.primary}
          />
        </View>
        <Typography
          variant="h3"
          color="primary"
          align="center"
          weight="semiBold"
          style={{ marginBottom: theme.spacing.sm }}
        >
          No News Available
        </Typography>
        <Typography
          variant="body1"
          color="secondary"
          align="center"
          style={{ marginBottom: theme.spacing.xl, lineHeight: 24 }}
        >
          {selectedCategory === 'All'
            ? 'No news articles have been published yet. Check back later for the latest updates!'
            : `No news available in "${selectedCategory}" category. Try selecting a different category or check back later.`}
        </Typography>
        <Button
          title="Refresh"
          onPress={handleRefresh}
          variant="primary"
          icon={<Icon name="refresh" size={16} color={theme.text.inverse} />}
        />
      </View>
    </Container>
  );



  // Main content
  try {
    return (
      <Screen edges={['top', 'bottom']}>
        <ModernContainer>
          {renderModernHeader()}
          {renderCategorySection()}

        <OptimizedFlatList
          key="news-list"
          data={flatListData}
          renderItem={renderNewsItem}
          keyExtractor={(item) => `news-${item._id}`}
          ListHeaderComponent={() => (
            <View>
              {renderFeaturedSection()}

              {/* Latest News Section Header */}
              <ContentSection>
                <SectionHeader>
                  <View>
                    <SectionTitle>📰 Latest News</SectionTitle>
                    <SectionSubtitle>
                      {selectedCategory === 'All' ? 'All categories' : selectedCategory} • {news.length} articles
                    </SectionSubtitle>
                  </View>
                </SectionHeader>
              </ContentSection>
            </View>
          )}
          ListEmptyComponent={renderEmptyState}
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
      </ModernContainer>
    </Screen>
  );
  } catch (error) {
    console.error('HomeScreen render error:', error);
    return (
      <Screen edges={['top', 'bottom']}>
        <Container flex={1} justify="center" align="center" paddingHorizontal="lg">
          <Typography variant="h4" color="error" align="center" style={{ marginBottom: 16 }}>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="secondary" align="center" style={{ marginBottom: 24 }}>
            Please try refreshing the app
          </Typography>
          <Button
            title="Refresh"
            onPress={() => loadData(true)}
            variant="primary"
          />
        </Container>
      </Screen>
    );
  }
};

export default HomeScreen;