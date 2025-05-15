import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View, Text, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNews, toggleArchiveNews, fetchUserPreferences } from '../services/newsService';
import { useAppStore, News } from '../store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
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
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const HomeScreen = () => {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, token, availableCategories, setAllNews, allNews, archivedNewsIds, setArchivedNewsIds, getUnreadCount } = useAppStore();
  const theme = useTheme();
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const insets = useSafeAreaInsets();

  const loadCachedData = async () => {
    try {
      const cachedNews = await AsyncStorage.getItem(NEWS_CACHE_KEY);
      const lastFetched = await AsyncStorage.getItem(LAST_FETCHED_KEY);
      if (cachedNews && lastFetched) {
        const parsedNews = JSON.parse(cachedNews);
        const lastFetchedTime = parseInt(lastFetched, 10);
        const now = Date.now();
        // Use cache if it's within the cache duration
        if (now - lastFetchedTime < CACHE_DURATION) {
          setAllNews(parsedNews);
          setNews(selectedCategory === 'All' ? parsedNews : parsedNews.filter((item: News) => item.category === selectedCategory));
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Error loading cached data:', err);
      return false;
    }
  };

  const saveCachedData = async (newsData: News[]) => {
    try {
      await AsyncStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(newsData));
      await AsyncStorage.setItem(LAST_FETCHED_KEY, Date.now().toString());
    } catch (err) {
      console.error('Error saving cached data:', err);
    }
  };

  const loadData = async (forceFetch: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from cache first, unless forceFetch is true
      if (!forceFetch && await loadCachedData()) {
        setLoading(false);
        return;
      }

      // Fetch user preferences including categories and archived news IDs
      let preferences;
      try {
        const preferencesResponse = await axios.get(
          `${BASE_URL}/api/userpreferences/${user?._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        preferences = preferencesResponse.data;
      } catch (prefError) {
        console.error('Error fetching from userpreferences:', prefError);
        preferences = await fetchUserPreferences();
      }
      
      setUserPreferences(preferences);
      const userArchivedIds = preferences?.archivedNewsIds || [];
      setArchivedNewsIds(userArchivedIds);

      // Set up categories based on user preferences or default to 'All'
      let userCategories = preferences?.selectedCategories || [];
      let filteredCategories = ['All'];
      
      if (user?.isAdmin) {
        filteredCategories = ['All', 'Deadline', 'Achievements', ...userCategories];
      } else {
        filteredCategories = ['All', ...userCategories];
      }
      
      filteredCategories = [...new Set(filteredCategories)];
      setCategories(filteredCategories);

      // Fetch news
      const newsData = await fetchNews(user?.role || 'user', '');
      
      // Ensure the data conforms to the News interface
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
      
      // Save to cache and store
      await saveCachedData(completeNewsData);
      setAllNews(completeNewsData);

      if (selectedCategory === 'All') {
        setNews(completeNewsData);
      } else {
        setNews(completeNewsData.filter((item) => item.category === selectedCategory));
      }
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, setAllNews, availableCategories, setArchivedNewsIds]);

  // Re-fetch on screen focus only if cache is stale
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      console.log('HomeScreen focused, checking cache');
      const lastFetched = await AsyncStorage.getItem(LAST_FETCHED_KEY);
      const now = Date.now();
      const shouldFetch = !lastFetched || (now - parseInt(lastFetched, 10) >= CACHE_DURATION);
      loadData(shouldFetch);
    });
    return unsubscribe;
  }, [navigation, user]);

  useEffect(() => {
    if (allNews.length > 0) {
      if (selectedCategory === 'All') {
        setNews(allNews);
      } else {
        setNews(allNews.filter((item) => item.category === selectedCategory));
      }
    }
  }, [selectedCategory, allNews]);

  const handleToggleArchive = async (_id: string) => {
    const isCurrentlyArchived = archivedNewsIds.includes(_id);
    const newArchivedNewsIds = isCurrentlyArchived
      ? archivedNewsIds.filter((id) => id !== _id)
      : [...archivedNewsIds, _id];
    setArchivedNewsIds(newArchivedNewsIds);

    try {
      await axios.post(
        `${BASE_URL}/api/news/toggle-archive`,
        { userId: user?._id, newsId: _id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: isCurrentlyArchived ? 'News unarchived' : 'News archived',
      });
    } catch (error: any) {
      console.error('Archive toggle failed:', error);
      setArchivedNewsIds(
        isCurrentlyArchived
          ? [...archivedNewsIds, _id]
          : archivedNewsIds.filter((id) => id !== _id)
      );
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
      featuredItems = allNews.slice(0, 5);
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

  if (loading) {
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