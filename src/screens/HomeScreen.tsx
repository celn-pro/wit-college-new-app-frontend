import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNews, toggleArchiveNews, fetchUserPreferences } from '../services/newsService';
import { useAppStore, News } from '../store';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import Carousel from 'react-native-reanimated-carousel';
import Toast from 'react-native-toast-message';
import axios from 'axios';
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
} from '../styles/homeScreenStyles';

const resolveImageUrl = (imagePath: string) => {
  if (!imagePath) return 'https://picsum.photos/seed/default-news/200/200';
  if (imagePath.startsWith('/assets')) return `${BASE_URL}${imagePath}`;
  return imagePath;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Cache keys
const NEWS_CACHE_KEY = 'news_cache';
const LAST_FETCHED_KEY = 'last_fetched';
const ARCHIVED_NEWS_KEY = 'archived_news_ids';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const HomeScreen = () => {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, token, availableCategories, setAllNews, allNews, archivedNewsIds, setArchivedNewsIds, getUnreadCount } = useAppStore();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [lastArchivedIds, setLastArchivedIds] = useState<string[]>([]);
  const [lastProcessedState, setLastProcessedState] = useState({ 
    allNewsHash: '',
    archivedIdsHash: ''
  });

  // Function to compute hash for comparison
  const computeStateHash = useCallback(() => {
    return {
      allNewsHash: allNews.length > 0 ? JSON.stringify(allNews.map(n => n._id).sort()) : '',
      archivedIdsHash: archivedNewsIds.length > 0 ? JSON.stringify([...archivedNewsIds].sort()) : ''
    };
  }, [allNews, archivedNewsIds]);

  const loadCachedData = async () => {
    try {
      const cachedNews = await AsyncStorage.getItem(NEWS_CACHE_KEY);
      const cachedArchivedIds = await AsyncStorage.getItem(ARCHIVED_NEWS_KEY);
      const lastFetched = await AsyncStorage.getItem(LAST_FETCHED_KEY);

      if (cachedNews && cachedArchivedIds && lastFetched) {
        const parsedNews = JSON.parse(cachedNews);
        const parsedArchivedIds = JSON.parse(cachedArchivedIds);
        const lastFetchedTime = parseInt(lastFetched, 10);
        const now = Date.now();
        if (now - lastFetchedTime < CACHE_DURATION) {
          setAllNews(parsedNews);
          setArchivedNewsIds(parsedArchivedIds);
          setLastArchivedIds(parsedArchivedIds);
          setNews(
            selectedCategory === 'All'
              ? parsedNews.filter((item: News) => !parsedArchivedIds.includes(item._id))
              : parsedNews.filter(
                  (item: News) => item.category === selectedCategory && !parsedArchivedIds.includes(item._id)
                )
          );
          
          // Set processed state hash
          setLastProcessedState({
            allNewsHash: parsedNews.length > 0 ? JSON.stringify(parsedNews.map((n: News) => n._id).sort()) : '', 
            archivedIdsHash: parsedArchivedIds.length > 0 ? JSON.stringify([...parsedArchivedIds].sort()) : ''
          });
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Error loading cached data:', err);
      return false;
    }
  };

  const saveCachedData = async (newsData: News[], archivedIds: string[]) => {
    try {
      await AsyncStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(newsData));
      await AsyncStorage.setItem(ARCHIVED_NEWS_KEY, JSON.stringify(archivedIds));
      await AsyncStorage.setItem(LAST_FETCHED_KEY, Date.now().toString());
    } catch (err) {
      console.error('Error saving cached data:', err);
    }
  };

  const loadData = async (forceFetch: boolean = false, showLoadingIndicator: boolean = true) => {
    try {
      // Only show loading if we're forcing a fetch and showing the indicator
      if (forceFetch && showLoadingIndicator && !initialLoadComplete) {
        setLoading(true);
      }
      
      setError(null);

      // Check if we can use cached data
      if (!forceFetch && (await loadCachedData())) {
        setLoading(false);
        setInitialLoadComplete(true);
        return;
      }

      const preferences = await fetchUserPreferences();
      const userArchivedIds = preferences?.archivedNewsIds || [];
      setArchivedNewsIds(userArchivedIds);
      setLastArchivedIds(userArchivedIds);

      let userCategories = preferences?.selectedCategories || [];
      let filteredCategories = ['All'];
      if (user?.isAdmin) {
        filteredCategories = ['All', 'Deadline', 'Achievements', ...userCategories];
      } else {
        filteredCategories = ['All', ...userCategories];
      }
      filteredCategories = [...new Set(filteredCategories)];
      setCategories(filteredCategories);

      // Fetch all news, including archived
      const newsData = await fetchNews(user?.role || 'user', '', '', undefined, true);

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

      // Update the processed state hash
      setLastProcessedState({
        allNewsHash: completeNewsData.length > 0 ? JSON.stringify(completeNewsData.map(n => n._id).sort()) : '',
        archivedIdsHash: userArchivedIds.length > 0 ? JSON.stringify([...userArchivedIds].sort()) : ''
      });

    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  };

  // Initial data load on component mount
  useEffect(() => {
    loadData();
  }, [user, setAllNews, availableCategories]);

  // Check for updates when screen is focused
  useFocusEffect(
    useCallback(() => {
      const checkForUpdates = async () => {
        console.log('HomeScreen focused, checking for updates');
        
        if (!initialLoadComplete) {
          // Skip check if we haven't loaded data yet
          return;
        }
        
        // Get current state hash
        const currentHash = computeStateHash();
        
        // Compare with last processed state
        const stateChanged = 
          currentHash.allNewsHash !== lastProcessedState.allNewsHash ||
          currentHash.archivedIdsHash !== lastProcessedState.archivedIdsHash;
          
        if (stateChanged) {
          console.log('Data changed, updating HomeScreen');
          // Just update filtered news without showing loading indicator
          const filteredNews = allNews.filter(
            (item) => !archivedNewsIds.includes(item._id) && 
                     (selectedCategory === 'All' || item.category === selectedCategory)
          );
          setNews(filteredNews);
          setLastProcessedState(currentHash);
        } else {
          console.log('No data change detected, skipping update');
        }
        
        // Check if cache has expired
        const lastFetched = await AsyncStorage.getItem(LAST_FETCHED_KEY);
        const now = Date.now();
        if (!lastFetched || now - parseInt(lastFetched, 10) >= CACHE_DURATION) {
          console.log('Cache expired, fetching fresh data');
          loadData(true, false); // Force fetch without loading indicator
        }
      };
      
      checkForUpdates();
    }, [initialLoadComplete, archivedNewsIds, allNews, selectedCategory, lastProcessedState])
  );

  useEffect(() => {
    if (initialLoadComplete && allNews.length > 0) {
      const filteredNews = allNews.filter(
        (item) => !archivedNewsIds.includes(item._id) && 
                 (selectedCategory === 'All' || item.category === selectedCategory)
      );
      setNews(filteredNews);
      
      // Update processed state hash when relevant state changes
      setLastProcessedState(computeStateHash());
    }
  }, [selectedCategory, initialLoadComplete]);

  const handleToggleArchive = async (_id: string) => {
    const previousNews = [...news];
    const previousAllNews = [...allNews];
    const previousArchivedIds = [...archivedNewsIds];
    const isCurrentlyArchived = archivedNewsIds.includes(_id);
    const newArchivedNewsIds = isCurrentlyArchived
      ? archivedNewsIds.filter((id) => id !== _id)
      : [...archivedNewsIds, _id];

    // Optimistic update
    setArchivedNewsIds(newArchivedNewsIds);
    setNews(
      allNews.filter(
        (item) =>
          !newArchivedNewsIds.includes(item._id) &&
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
      setLastArchivedIds(updatedArchivedIds);
      
      // Update processed state hash
      setLastProcessedState(computeStateHash());

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: isCurrentlyArchived ? 'News unarchived' : 'News archived',
      });
    } catch (error: any) {
      console.error('Archive toggle failed:', error);
      // Revert optimistic update
      setNews(previousNews);
      setAllNews(previousAllNews);
      setArchivedNewsIds(previousArchivedIds);
      await saveCachedData(previousAllNews, previousArchivedIds);
      setLastArchivedIds(previousArchivedIds);
      
      // Reset processed state hash
      setLastProcessedState({
        allNewsHash: previousAllNews.length > 0 ? JSON.stringify(previousAllNews.map(n => n._id).sort()) : '',
        archivedIdsHash: previousArchivedIds.length > 0 ? JSON.stringify([...previousArchivedIds].sort()) : ''
      });

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to toggle archive status',
      });
    }
  };

  const renderCategory = ({ item }: { item: string }) => (
    <CategoryButton selected={selectedCategory === item} onPress={() => setSelectedCategory(item)}>
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
        <HeaderTitle>College News</HeaderTitle>
        <IconContainer>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Icon name="search" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <NotificationIconContainer>
              <Icon name="notifications" size={24} color={theme.text} />
              {getUnreadCount() > 0 && (
                <Badge>
                  <BadgeText>{getUnreadCount()}</BadgeText>
                </Badge>
              )}
            </NotificationIconContainer>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Archive')}>
            <Icon name="archive" size={24} color={theme.text} />
          </TouchableOpacity>
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
      <ScrollableContentContainer contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
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