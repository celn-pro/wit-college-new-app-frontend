import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View, Text, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
import styled from '@emotion/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNews, toggleArchiveNews, fetchUserPreferences } from '../services/newsService';
import { useAppStore, News } from '../store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Carousel from 'react-native-reanimated-carousel';
import Toast from 'react-native-toast-message';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:5000';

const resolveImageUrl = (imagePath: string) => {
  if (!imagePath) return 'https://picsum.photos/seed/default-news/200/200';
  if (imagePath.startsWith('/assets')) return `${BASE_URL}${imagePath}`;
  return imagePath;
};

interface CategoryButtonProps {
  selected: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SafeContainer = styled(SafeAreaView)`flex: 1; background-color: ${(props) => props.theme.background};`;
const Header = styled.View`flex-direction: row; justify-content: space-between; align-items: center; padding: 15px 20px; background-color: ${(props) => props.theme.cardBackground};`;
const HeaderTitle = styled.Text`font-size: 22px; font-family: 'Roboto-Bold'; color: ${(props) => props.theme.text};`;
const CategoryList = styled(FlatList<string>)`padding: 10px 0; margin-horizontal: 10px;`;
const CategoryButton = styled.TouchableOpacity<CategoryButtonProps>`background-color: ${(props) => (props.selected ? props.theme.primary : props.theme.cardBackground)}; padding: 8px 16px; border-radius: 20px; margin-right: 10px; min-width: 80px; align-items: center; height: 40px;`;
const CategoryText = styled.Text`font-size: 14px; font-family: 'Roboto-Regular'; color: ${(props) => props.theme.text}; text-align: center;`;
const FeaturedCarouselContainer = styled.View`margin: 15px 15px 0 15px; border-radius: 10px; overflow: hidden;`;
const FixedContentContainer = styled.View`background-color: ${(props) => props.theme.background};`;
const ScrollableContentContainer = styled.ScrollView`flex: 1; background-color: ${(props) => props.theme.background};`;
const FeaturedCard = styled.View`width: ${SCREEN_WIDTH - 30}px; height: 200px; border-radius: 10px; overflow: hidden; background-color: ${(props) => props.theme.cardBackground}; elevation: 3; shadow-color: #000; shadow-offset: 0px 2px; shadow-opacity: 0.1; shadow-radius: 3px;`;
const FeaturedImage = styled.Image`width: 100%; height: 100%;`;
const FeaturedOverlay = styled.View`position: absolute; bottom: 0; left: 0; right: 0; padding: 15px; background-color: rgba(0, 0, 0, 0.5);`;
const FeaturedTitle = styled.Text`font-size: 18px; font-family: 'Roboto-Bold'; color: #ffffff;`;
const NewsListContainer = styled.View`margin-top: 15px; flex: 1;`;
const NewsCard = styled.TouchableOpacity`flex-direction: row; padding: 15px 20px; border-bottom-width: 1px; border-bottom-color: ${(props) => props.theme.cardBackground};`;
const NewsImage = styled.Image`width: 80px; height: 80px; border-radius: 5px; margin-right: 15px;`;
const NewsContent = styled.View`flex: 1;`;
const NewsTitle = styled.Text`font-size: 16px; font-family: 'Roboto-Bold'; color: ${(props) => props.theme.text}; margin-bottom: 5px;`;
const NewsDescription = styled.Text`font-size: 14px; font-family: 'Roboto-Regular'; color: ${(props) => props.theme.text}; margin-bottom: 5px;`;
const NewsMeta = styled.Text`font-size: 12px; font-family: 'Roboto-Regular'; color: ${(props) => props.theme.text}; opacity: 0.7;`;
const ActionButton = styled.TouchableOpacity`padding: 5px; margin-left: 10px;`;
const LoadingContainer = styled.View`flex: 1; justify-content: center; align-items: center;`;
const ErrorText = styled.Text`font-size: 16px; font-family: 'Roboto-Regular'; color: ${(props) => props.theme.text}; text-align: center; margin: 20px;`;
const IconContainer = styled.View`flex-direction: row; width: 120px; justify-content: space-between; margin-left: 10px;`;
const NotificationIconContainer = styled.View`position: relative;`;
const Badge = styled.View`position: absolute; top: -5px; right: -5px; background-color: #ff0000; border-radius: 10px; min-width: 20px; height: 20px; justify-content: center; align-items: center; padding: 2px;`;
const BadgeText = styled.Text`font-family: 'Roboto-Regular'; color: #ffffff; font-size: 12px; font-weight: bold;`;
const EmptyStateContainer = styled.View`padding: 40px 20px; align-items: center;`;
const EmptyStateText = styled.Text`font-size: 16px; font-family: 'Roboto-Regular'; color: ${(props) => props.theme.text}; text-align: center; margin-top: 10px;`;
const ManageCategoriesButton = styled.TouchableOpacity`margin-top: 15px; padding: 10px 15px; background-color: ${(props) => props.theme.primary}; border-radius: 10px;`;
const ManageCategoriesText = styled.Text`font-size: 14px; font-family: 'Roboto-Bold'; color: #ffffff;`;

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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user preferences including categories and archived news IDs
      let preferences;
      try {
        // First try to get from userpreferences endpoint
        const preferencesResponse = await axios.get(
          `${BASE_URL}/api/userpreferences/${user?._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        preferences = preferencesResponse.data;
      } catch (prefError) {
        console.error('Error fetching from userpreferences:', prefError);
        // Fallback to legacy endpoint
        preferences = await fetchUserPreferences();
      }
      
      setUserPreferences(preferences);
      const userArchivedIds = preferences?.archivedNewsIds || [];
      setArchivedNewsIds(userArchivedIds);

      // Set up categories based on user preferences or default to 'All'
      let userCategories = preferences?.selectedCategories || [];
      
      // Admin always sees 'All', 'Deadline', and 'Achievements'
      let filteredCategories = ['All'];
      
      if (user?.isAdmin) {
        filteredCategories = ['All', 'Deadline', 'Achievements', ...userCategories];
      } else {
        // Regular users only see their selected categories, with 'All' as default
        filteredCategories = ['All', ...userCategories];
      }
      
      // Remove duplicates
      filteredCategories = [...new Set(filteredCategories)];
      setCategories(filteredCategories);

      // Fetch news
      const newsData = await fetchNews(user?.role || 'user', '');
      
      // Ensure the data conforms to the News interface by adding default values for missing properties
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

  // Re-fetch on screen focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('HomeScreen focused, re-fetching data');
      loadData();
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
      // Update archive status in the backend
      const action = isCurrentlyArchived ? 'unarchive' : 'archive';
      await axios.post(
        `${BASE_URL}/api/userpreferences/${action}`,
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
      // Revert the UI change if the API call fails
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
      image: item.image || 'https://picsum.photos/seed/college-news/600/400',
    }));
  };

  const renderFeaturedItem = (item: News) => (
    <FeaturedCard>
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
        {user?.isAdmin && <TouchableOpacity 
          onPress={navigateToCategories}
          style={{ 
            marginRight: 10,
            backgroundColor: theme.cardBackground,
            padding: 8,
            borderRadius: 20,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Icon name="settings-outline" size={20} color={theme.text} />
        </TouchableOpacity>}
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
          : "No news available for this category"}
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
      <SafeContainer>
        <StatusBar barStyle={theme.text === '#FFFFFF' ? 'light-content' : 'dark-content'} backgroundColor={theme.cardBackground} />
        {renderHeaderAndCategories()}
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.primary} />
        </LoadingContainer>
      </SafeContainer>
    );
  }

  if (error) {
    return (
      <SafeContainer>
        <StatusBar barStyle={theme.text === '#FFFFFF' ? 'light-content' : 'dark-content'} backgroundColor={theme.cardBackground} />
        {renderHeaderAndCategories()}
        <LoadingContainer>
          <ErrorText>{error}</ErrorText>
        </LoadingContainer>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer>
      <StatusBar barStyle={theme.text === '#FFFFFF' ? 'light-content' : 'dark-content'} backgroundColor={theme.cardBackground} />
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
      <ScrollableContentContainer>
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
                <ActionButton onPress={(e) => {
                  e.stopPropagation();
                  handleToggleArchive(item._id);
                }}>
                  <Icon name="archive" size={20} color={archivedNewsIds.includes(item._id) ? '#007BFF' : theme.text} />
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