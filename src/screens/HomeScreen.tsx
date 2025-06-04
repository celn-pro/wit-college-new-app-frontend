import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { debouncedFetchNews, toggleArchiveNews, fetchUserPreferences } from '../services/newsService';
import { useAppStore, News } from '../store';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import Carousel from 'react-native-reanimated-carousel';
import Toast from 'react-native-toast-message';
import { BASE_URL } from '../utils';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Header,
  SafeContainer,
  HeaderTitle,
  CategoryList,
  CategoryButton,
  CategoryText,
  FeaturedCarouselContainer,
  FixedContentContainer,
  ScrollableContentContainer,
  FeaturedCard,
  FeaturedImage,
  FeaturedOverlay,
  FeaturedTitle,
  NewsListContainer,
  NewsCard,
  NewsImage,
  NewsContent,
  NewsTitle,
  NewsDescription,
  NewsMeta,
  ActionButton,
  LoadingContainer,
  ErrorText,
  IconContainer,
  NotificationIconContainer,
  Badge,
  BadgeText,
  EmptyStateContainer,
  EmptyStateText,
  ManageCategoriesButton,
  ManageCategoriesText,
  CircleIconButton,
} from '../styles/homeScreenStyles';
import { cacheService } from '../services/cacheService';

const resolveImageUrl = (imagePath: string) => {
  if (!imagePath) return 'https://picsum.photos/seed/default-news/200/200';
  if (imagePath.startsWith('/assets')) return `${BASE_URL}${imagePath}`;
  return imagePath;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HomeScreen = () => {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { themeMode,toggleTheme, user, token, availableCategories, setAllNews, allNews, archivedNewsIds, setArchivedNewsIds, getUnreadCount } = useAppStore();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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

  useEffect(() => {
    loadData();
  }, [user, setAllNews, availableCategories]);

  useEffect(() => {
  if (initialLoadComplete) {
    // Update news state when archivedNewsIds or selectedCategory changes
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
        // Check if archivedNewsIds have changed by comparing with cache
        const cachedData = await cacheService.getNewsCache();
        const cachedArchivedIds = cachedData?.archivedIds || [];
        const currentArchivedIds = archivedNewsIds;

        if (
          initialLoadComplete &&
          JSON.stringify(cachedArchivedIds) !== JSON.stringify(currentArchivedIds)
        ) {
          // Update news state to reflect current archivedNewsIds
          setNews(
            allNews.filter(
              (item) =>
                !currentArchivedIds.includes(item._id) &&
                (selectedCategory === 'All' || item.category === selectedCategory)
            )
          );
          // Update cache to stay in sync
          await saveCachedData(allNews, currentArchivedIds);
        }

        // Check if cache is expired and fetch fresh data if needed
        if (initialLoadComplete && (await cacheService.isCacheExpired())) {
          await loadData(true, false);
        }
      } catch (err) {
        console.error('Error syncing news or checking cache:', err);
      }
    };
    syncNewsWithArchivedIds();
  }, [initialLoadComplete, archivedNewsIds, allNews, selectedCategory, loadData])
);
  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    try {
      const newsData = await debouncedFetchNews(user?.role || 'user', category, '', undefined, false);
      const mappedNewsData: News[] = newsData.map((item: any) => ({
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
      setNews(mappedNewsData.filter((item: News) => !archivedNewsIds.includes(item._id)));
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

  const renderCategory = ({ item }: { item: string }) => (
    <CategoryButton selected={selectedCategory === item} onPress={() => handleCategoryChange(item)}>
      <CategoryText>{item}</CategoryText>
    </CategoryButton>
  );

  const getFeaturedNewsItems = () => {
    let featuredItems = news.slice(0, 5);
    if (featuredItems.length === 0 && allNews.length > 0) {
      featuredItems = allNews.filter((item) => !archivedNewsIds.includes(item._id)).slice(0, 5);
    }
    return featuredItems.map((item) => ({
      ...item,
      image: resolveImageUrl(item.image || ''),
    }));
  };

  const renderFeaturedItem = (item: News) => (
    <FeaturedCard onPress={() => navigation.navigate('NewsDetail', { newsId: item._id })}>
      <FeaturedImage
        source={{ uri: resolveImageUrl(item.image || '') }}
        defaultSource={require('../assets/placeholder.png')}
      />
      <FeaturedOverlay>
        <FeaturedTitle>{item.title}</FeaturedTitle>
      </FeaturedOverlay>
    </FeaturedCard>
  );

  const navigateToCategories = () => {
    navigation.navigate('CategorySelection');
  };

  const renderHeaderAndCategories = () => (
    <>
     <Header>
        <View style={{ flex: 1 }}>
          <HeaderTitle>College News</HeaderTitle>
          {user && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <Icon
                name={
                  user.role === 'admin'
                    ? 'shield-checkmark'
                    : user.role === 'faculty'
                    ? 'school'
                    : 'person'
                }
                size={16}
                color={
                  user.role === 'admin'
                    ? '#FF6B6B'
                    : user.role === 'faculty'
                    ? '#4e54c8'
                    : '#007BFF'
                }
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 13,
                  color: theme.text,
                  opacity: 0.7,
                  fontWeight: 'bold',
                  marginRight: 8,
                }}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.text,
                  opacity: 0.7,
                }}
              >
                {user.username}
              </Text>
            </View>
          )}
        </View>
       <IconContainer>
          <CircleIconButton onPress={() => navigation.navigate('Search')}>
            <Icon name="search" size={20} color={theme.text} />
          </CircleIconButton>
          <CircleIconButton onPress={() => navigation.navigate('Notifications')}>
            <NotificationIconContainer>
              <Icon name="notifications" size={20} color={theme.text} />
              {getUnreadCount() > 0 && (
                <Badge>
                  <BadgeText>{getUnreadCount()}</BadgeText>
                </Badge>
              )}
            </NotificationIconContainer>
          </CircleIconButton>
          <CircleIconButton onPress={toggleTheme}>
            <Icon name={themeMode === 'light' ? 'moon' : 'sunny'} size={20} color={theme.text} />
          </CircleIconButton>
          {/* <CircleIconButton onPress={() => navigation.navigate('Archive')}>
            <Icon name="archive" size={20} color={theme.text} />
          </CircleIconButton> */}
        </IconContainer>
      </Header>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <CategoryList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
        {user?.isAdmin && (
          <TouchableOpacity
            onPress={navigateToCategories}
            style={{
              marginRight: 10,
              backgroundColor: theme.cardBackground,
              padding: 8,
              borderRadius: 20,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon name="settings-outline" size={20} color={theme.text} />
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  const renderEmptyState = () => (
    <EmptyStateContainer>
      <View style={{ opacity: 0.5 }}>
        <Icon name="newspaper-outline" size={50} color={theme.text} />
      </View>
      <EmptyStateText>
        {categories.length <= 1
          ? "You haven't selected any categories yet"
          : 'No news available for this category'}
      </EmptyStateText>
      {categories.length <= 1 && (
        <ManageCategoriesButton onPress={navigateToCategories}>
          <ManageCategoriesText>Select Categories</ManageCategoriesText>
        </ManageCategoriesButton>
      )}
    </EmptyStateContainer>
  );

  if (loading && !initialLoadComplete) {
    return (
      <SafeContainer edges={['top', 'left', 'right']}>
        <StatusBar
          barStyle={theme.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.cardBackground}
        />
        {renderHeaderAndCategories()}
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.primary} />
        </LoadingContainer>
      </SafeContainer>
    );
  }

  if (error) {
    return (
      <SafeContainer edges={['top', 'left', 'right']}>
        <StatusBar
          barStyle={theme.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.cardBackground}
        />
        {renderHeaderAndCategories()}
        <LoadingContainer>
          <ErrorText>{error}</ErrorText>
        </LoadingContainer>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={theme.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.cardBackground}
      />
      <FixedContentContainer>
        {renderHeaderAndCategories()}
        {allNews.length > 0 && (
          <FeaturedCarouselContainer>
            <Carousel
              width={SCREEN_WIDTH - 30}
              height={200}
              data={getFeaturedNewsItems()}
              renderItem={({ item }) => renderFeaturedItem(item)}
              autoPlay={true}
              autoPlayInterval={4000}
              loop={true}
              scrollAnimationDuration={1000}
            />
          </FeaturedCarouselContainer>
        )}
      </FixedContentContainer>
      <ScrollableContentContainer
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <NewsListContainer>
          {news.length > 0 ? (
            news.map((item) => (
              <NewsCard key={item._id} onPress={() => navigation.navigate('NewsDetail', { newsId: item._id })}>
                <NewsImage
                  source={{ uri: resolveImageUrl(item.image || '') }}
                  defaultSource={require('../assets/placeholder.png')}
                />
                <NewsContent>
                  <NewsTitle>{item.title}</NewsTitle>
                  <NewsDescription numberOfLines={2}>{item.content}</NewsDescription>
                  <NewsMeta>{item.category} • {new Date(item.createdAt).toLocaleDateString()}</NewsMeta>
                </NewsContent>
                <ActionButton
                  onPress={(e) => {
                    e.stopPropagation();
                    handleToggleArchive(item._id);
                  }}
                >
                  <Icon
                    name="archive"
                    size={20}
                    color={archivedNewsIds.includes(item._id) ? '#007BFF' : theme.text}
                  />
                </ActionButton>
              </NewsCard>
            ))
          ) : (
            renderEmptyState()
          )}
        </NewsListContainer>
      </ScrollableContentContainer>
    </SafeContainer>
  );
};

export default HomeScreen;