import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, TouchableOpacity, Text, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore, News } from '../store';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { toggleArchiveNews, fetchNews } from '../services/newsService';
import Toast from 'react-native-toast-message';
import {
  ErrorText,
  SafeAreaContainer,
  Container,
  Header,
  HeaderTitle,
  NewsCard,
  NewsImage,
  NewsContent,
  NewsTitle,
  NewsDescription,
  NewsMeta,
  ActionButton,
  LoadingContainer,
  ErrorContainer,
  EmptyStateContainer,
  EmptyStateText,
} from '../styles/archiveScreenStyles';

// Cache keys
const NEWS_CACHE_KEY = 'news_cache';
const ARCHIVED_NEWS_KEY = 'archived_news_ids';
const LAST_FETCHED_KEY = 'last_fetched';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const ArchiveScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, allNews, archivedNewsIds, setAllNews, setArchivedNewsIds } = useAppStore();
  const theme = useTheme();
  const [archivedNews, setArchivedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastArchivedIds, setLastArchivedIds] = useState<string[]>([]);

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

  useEffect(() => {
    if (user) {
      loadArchivedNews();
    }
  }, [user, allNews, archivedNewsIds]);

  useFocusEffect(
    useCallback(() => {
      console.log('ArchiveScreen focused');
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
    console.log('Toggling archive for _id:', _id);
    const previousArchivedNews = [...archivedNews];
    const previousAllNews = [...allNews];
    const previousArchivedIds = [...archivedNewsIds];
    const isCurrentlyArchived = archivedNewsIds.includes(_id);

    if (!isCurrentlyArchived) {
      console.warn('News item not in archivedNewsIds:', _id);
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
      console.error('Unarchive failed:', error);
      // Revert optimistic update
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

  if (!user) {
    return (
      <SafeAreaContainer>
        <Container>
          <Header>
            <HeaderTitle>Archived News</HeaderTitle>
          </Header>
          <EmptyStateContainer>
            <Icon name="lock-closed-outline" size={50} color={theme.text} style={{ opacity: 0.5 }} />
            <EmptyStateText>Please log in to view archived news.</EmptyStateText>
          </EmptyStateContainer>
        </Container>
      </SafeAreaContainer>
    );
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaContainer>
        <Container>
          <Header>
            <HeaderTitle>Archived News</HeaderTitle>
          </Header>
          <LoadingContainer>
            <ActivityIndicator size="large" color={theme.primary} />
          </LoadingContainer>
        </Container>
      </SafeAreaContainer>
    );
  }

  if (error) {
    return (
      <SafeAreaContainer>
        <Container>
          <Header>
            <HeaderTitle>Archived News</HeaderTitle>
          </Header>
          <ErrorContainer>
            <ErrorText>{error}</ErrorText>
            <TouchableOpacity onPress={() => loadArchivedNews(true)}>
              <Text style={{ color: theme.primary, fontFamily: 'Roboto-Bold' }}>Retry</Text>
            </TouchableOpacity>
          </ErrorContainer>
        </Container>
      </SafeAreaContainer>
    );
  }

  const renderNewsItem = ({ item }: { item: News }) => (
    <NewsCard onPress={() => navigation.navigate('NewsDetail', { newsId: item._id })}>
      <NewsImage
        source={{ uri: item.image || 'https://picsum.photos/seed/default-news/200/200' }}
        defaultSource={require('../assets/placeholder.png')}
      />
      <NewsContent>
        <NewsTitle>{item.title}</NewsTitle>
        <NewsDescription numberOfLines={2}>{item.content}</NewsDescription>
        <NewsMeta>
          {item.category} • {new Date(item.createdAt).toLocaleDateString()}
        </NewsMeta>
      </NewsContent>
      <ActionButton onPress={() => handleToggleArchive(item._id)}>
        <Icon
          name="archive"
          size={20}
          color={archivedNewsIds.includes(item._id) ? '#007BFF' : theme.text}
        />
      </ActionButton>
    </NewsCard>
  );

  return (
    <SafeAreaContainer>
      <Container>
        <Header>
          <HeaderTitle>Archived News</HeaderTitle>
        </Header>
        {archivedNews.length > 0 ? (
          <FlatList
            data={archivedNews}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item._id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        ) : (
          <EmptyStateContainer>
            <Icon name="archive-outline" size={50} color={theme.text} style={{ opacity: 0.5 }} />
            <EmptyStateText>No archived news available.</EmptyStateText>
          </EmptyStateContainer>
        )}
      </Container>
    </SafeAreaContainer>
  );
};

export default ArchiveScreen;