import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, TouchableOpacity, Image, View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import styled from '@emotion/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { fetchArchivedNews, toggleArchiveNews } from '../services/newsService';
import Toast from 'react-native-toast-message';

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background};
  padding: 15px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 15px;
`;

const HeaderTitle = styled.Text`
  font-size: 22px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
`;

const NewsCard = styled.TouchableOpacity`
  flex-direction: row;
  padding: 15px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.cardBackground};
`;

const NewsImage = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 5px;
  margin-right: 15px;
`;

const NewsContent = styled.View`
  flex: 1;
`;

const NewsTitle = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
  margin-bottom: 5px;
`;

const NewsDescription = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  margin-bottom: 5px;
`;

const NewsMeta = styled.Text`
  font-size: 12px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  opacity: 0.7;
`;

const ActionButton = styled.TouchableOpacity`
  padding: 5px;
  margin-left: 10px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ErrorContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ErrorText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-align: center;
  margin-bottom: 10px;
`;

const EmptyStateContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const EmptyStateText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-align: center;
`;

const ArchiveScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, allNews, archivedNewsIds, setAllNews, toggleArchiveNews: toggleArchiveNewsState, setArchivedNewsIds } = useAppStore();
  const theme = useTheme();
  const [archivedNews, setArchivedNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadArchivedNews = async (showLoadingIndicator = true) => {
    if (!user) return;
    
    if (showLoadingIndicator && !refreshing) {
      setLoading(true);
    }
    
    try {
      setError(null);
      // Fetch archived news from backend
      const newsData = await fetchArchivedNews(user.role || 'user');
      console.log('Fetched archived news:', newsData.length);
      
      if (Array.isArray(newsData)) {
        setArchivedNews(newsData);
        const newArchivedNewsIds = newsData.map((item: any) => item._id);
        
        // Update local state with fetched IDs
        if (JSON.stringify(newArchivedNewsIds) !== JSON.stringify(archivedNewsIds)) {
          setArchivedNewsIds(newArchivedNewsIds);
        }
      } else {
        console.error('Invalid news data format:', newsData);
        setError('Received invalid data from server');
      }
    } catch (err: any) {
      const errorMessage = err.response?.status === 401
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
    await loadArchivedNews(false);
  };

  // Use useFocusEffect instead of navigation.addListener
  useFocusEffect(
    useCallback(() => {
      console.log('ArchiveScreen focused, re-fetching archived news');
      loadArchivedNews();
      
      return () => {
        // Cleanup if needed
      };
    }, [user]) // Only depend on user to prevent excessive reloads
  );

  // Initial load - this will run once on component mount
  useEffect(() => {
    if (user) {
      loadArchivedNews();
    }
  }, []);

  const handleToggleArchive = async (_id: string) => {
    console.log('Toggling archive for _id:', _id);
    const isCurrentlyArchived = archivedNewsIds.includes(_id);
    
    // Optimistically update UI
    if (isCurrentlyArchived) {
      setArchivedNews(archivedNews.filter((item) => item._id !== _id));
      setArchivedNewsIds(archivedNewsIds.filter((id) => id !== _id));
    }

    try {
      await toggleArchiveNews(_id);
      console.log('Backend unarchive successful for _id:', _id);
      toggleArchiveNewsState(_id);
      
      const newsItem = archivedNews.find((item) => item._id === _id);
      if (newsItem && !allNews.some((item) => item._id === _id)) {
        setAllNews([...allNews, newsItem]);
      }
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'News unarchived',
      });
    } catch (error: any) {
      console.error('Unarchive failed:', error);
      
      // Revert optimistic update on error
      if (isCurrentlyArchived) {
        const newsItem = allNews.find((item) => item._id === _id);
        if (newsItem) {
          setArchivedNews(prev => [...prev, newsItem]);
          setArchivedNewsIds([...archivedNewsIds, _id]);
        }
      }
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to unarchive news',
      });
    }
  };

  if (!user) {
    return (
      <EmptyStateContainer>
        <Icon name="lock-closed-outline" size={50} color={theme.text} style={{ opacity: 0.5 }} />
        <EmptyStateText>Please log in to view archived news.</EmptyStateText>
      </EmptyStateContainer>
    );
  }

  if (loading && !refreshing) {
    return (
      <Container>
        <Header>
          <HeaderTitle>Archived News</HeaderTitle>
        </Header>
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.primary} />
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
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
    );
  }

  const renderNewsItem = ({ item }: { item: { _id: string; title: string; content: string; category: string; image?: string; createdAt: string } }) => (
    <NewsCard onPress={() => navigation.navigate('NewsDetail', { newsId: item._id })}>
      <NewsImage 
        source={{ uri: item.image || 'https://picsum.photos/seed/default-news/200/200' }}
        defaultSource={require('../assets/placeholder.png')}
      />
      <NewsContent>
        <NewsTitle>{item.title}</NewsTitle>
        <NewsDescription numberOfLines={2}>{item.content}</NewsDescription>
        <NewsMeta>{item.category} • {new Date(item.createdAt).toLocaleDateString()}</NewsMeta>
      </NewsContent>
      <ActionButton onPress={() => handleToggleArchive(item._id)}>
        <Icon name="archive" size={20} color={archivedNewsIds.includes(item._id) ? '#007BFF' : theme.text} />
      </ActionButton>
    </NewsCard>
  );

  return (
    <Container>
      <Header>
        <HeaderTitle>Archived News</HeaderTitle>
      </Header>
      {archivedNews.length > 0 ? (
        <FlatList
          data={archivedNews}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <EmptyStateContainer>
          <Icon name="archive-outline" size={50} color={theme.text} style={{ opacity: 0.5 }} />
          <EmptyStateText>No archived news available.</EmptyStateText>
        </EmptyStateContainer>
      )}
    </Container>
  );
};

export default ArchiveScreen;