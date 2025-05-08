import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, Image, View, Text, TextInput, ActivityIndicator } from 'react-native';
import styled from '@emotion/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { fetchNews } from '../services/newsService';

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background};
  padding: 15px;
`;

const SearchBarContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 25px;
  padding: 10px 15px;
  margin-bottom: 15px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  margin-left: 10px;
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
`;

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get user from app store
  const user = useAppStore((state) => state.user);
  // Use a default role if not available
  const role = user?.role || 'guest';
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const theme = useTheme();

  useEffect(() => {
    const searchNews = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // No need to check role here as we've set a default
        const results = await fetchNews(role, '', query);
        setSearchResults(results);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to fetch news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid making a request on every keystroke
    const debounceTimeout = setTimeout(() => {
      searchNews();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query, role]);

  const renderNewsItem = ({ item }: { item: { id: string; title: string; content: string; category: string; image?: string; createdAt: string } }) => (
    <NewsCard onPress={() => navigation.navigate('NewsDetail', { newsId: item.id })}>
      <NewsImage 
        source={{ uri: item.image || 'https://picsum.photos/seed/default-news/200/200' }}
        defaultSource={require('../assets/placeholder.png')}
      />
      <NewsContent>
        <NewsTitle>{item.title}</NewsTitle>
        <NewsDescription numberOfLines={2}>{item.content}</NewsDescription>
        <NewsMeta>{item.category} • {new Date(item.createdAt).toLocaleDateString()}</NewsMeta>
      </NewsContent>
    </NewsCard>
  );

  return (
    <Container>
      <SearchBarContainer>
        <Icon name="search" size={20} color={theme.text} />
        <SearchInput
          placeholder="Search news..."
          placeholderTextColor={theme.text + '80'} // 50% opacity
          value={query}
          onChangeText={setQuery}
          autoFocus={true}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Icon name="close" size={20} color={theme.text} />
          </TouchableOpacity>
        )}
      </SearchBarContainer>

      {loading ? (
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.primary} />
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <Icon name="warning" size={50} color={theme.text} style={{ opacity: 0.5 }} />
          <ErrorText>{error}</ErrorText>
        </ErrorContainer>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <EmptyStateContainer>
          <Icon name="search-outline" size={50} color={theme.text} style={{ opacity: 0.5 }} />
          <EmptyStateText>
            {query.trim() ? 'No news found matching your search.' : 'Enter a search term to find news.'}
          </EmptyStateText>
        </EmptyStateContainer>
      )}
    </Container>
  );
};

export default SearchScreen;