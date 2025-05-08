import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, Image, View, Text, TextInput, FlatList, KeyboardAvoidingView, Platform, Share, ActivityIndicator } from 'react-native';
import styled from '@emotion/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { toggleArchiveNews, addComment, likeNews, fetchComments, incrementViewCount, fetchNewsById } from '../services/newsService';
import Toast from 'react-native-toast-message';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const BASE_URL = 'http://10.0.2.2:5000';

const resolveImageUrl = (imagePath: string) => {
  if (!imagePath) return 'https://picsum.photos/seed/default-news/200/200';
  if (imagePath.startsWith('/assets')) return `${BASE_URL}${imagePath}`;
  return imagePath;
};

const Container = styled(KeyboardAvoidingView)`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  margin-bottom: 10px;
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
`;

const ContentContainer = styled.View`
  flex: 1;
  padding: 0 15px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
  margin-bottom: 10px;
`;

const Content = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  line-height: 24px;
  margin-bottom: 15px;
`;

const Meta = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  opacity: 0.7;
  margin-bottom: 10px;
`;

const ReadTime = styled.Text`
  font-size: 12px;
  font-family: 'Roboto-Italic';
  color: ${(props) => props.theme.text};
  opacity: 0.7;
  margin-bottom: 15px;
`;

const ImageContainer = styled.View`
  margin-bottom: 15px;
  border-radius: 10px;
  overflow: hidden;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
`;

const NewsImage = styled.Image`
  width: 100%;
  height: 250px;
`;

const ActionBar = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 15px;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 10px;
  elevation: 1;
`;

const ActionItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 5px 10px;
`;

const ActionText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  margin-left: 5px;
`;

const ActionButton = styled.TouchableOpacity`
  padding: 10px;
  border-radius: 20px;
  align-items: center;
`;

const CommentSection = styled.View`
  margin-top: 15px;
  padding: 10px;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 10px;
`;

const CommentInputContainer = styled.View`
  margin-bottom: 10px;
`;

const CommentInput = styled.TextInput`
  border-width: 1px;
  border-color: ${(props) => props.theme.text}20;
  border-radius: 10px;
  padding: 10px;
  font-family: 'Roboto-Regular';
  font-size: 16px;
  color: ${(props) => props.theme.text};
  background-color: ${(props) => props.theme.background};
  min-height: 80px;
`;

const CommentButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.primary};
  padding: 10px;
  border-radius: 10px;
  align-items: center;
  margin-top: 10px;
`;

const CommentButtonText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: #ffffff;
`;

const CommentCard = styled.View`
  padding: 10px;
  margin-bottom: 10px;
  background-color: ${(props) => props.theme.background};
  border-radius: 10px;
  elevation: 1;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
`;

const CommentUser = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
  margin-bottom: 5px;
`;

const CommentContent = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
`;

const CommentMeta = styled.Text`
  font-size: 12px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  opacity: 0.7;
  margin-top: 5px;
`;

const SortButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 5px 10px;
  margin-bottom: 10px;
`;

const SortText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  margin-left: 5px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${(props) => props.theme.text}10;
  margin: 10px 0;
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

const RetryButton = styled.TouchableOpacity`
  padding: 10px 20px;
  background-color: ${(props) => props.theme.primary};
  border-radius: 10px;
`;

const RetryButtonText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: #ffffff;
`;

// New components for our restructured layout
const NewsContent = styled.View`
  padding-bottom: 15px;
`;

const CommentsHeader = styled.View`
  padding: 10px 15px;
  background-color: ${props => props.theme.cardBackground};
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`;

const CommentsList = styled.View`
  padding: 0 15px 20px 15px;
`;

const EmptyCommentText = styled.Text`
  color: ${(props) => props.theme.text};
  font-family: 'Roboto-Regular';
  text-align: center;
  padding: 20px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const NewsDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'NewsDetail'>>();
  const { newsId } = route.params;
  const { allNews, archivedNewsIds, user, setAllNews, setArchivedNewsIds } = useAppStore();
  const theme = useTheme();
  const [newsItem, setNewsItem] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const commentInputRef = useRef<TextInput>(null);

  // Like animation
  const likeScale = useSharedValue(1);
  const animatedLikeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const calculateReadTime = (content: string | undefined) => {
    if (!content) {
      return '0 min read'; // Return a default value if content is undefined
    }
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${newsItem.title}\n\n${newsItem.content.slice(0, 100)}...\n\nRead more on College News App!`,
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'News shared',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to share news',
      });
    }
  };

  const loadNewsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to find news item in the store
      let item = allNews.find((item) => item._id === newsId);
      
      // If not found in store, fetch directly from API
      if (!item) {
        console.log("News item not found in store, fetching from API...");
        try {
          // Add this function to your newsService.js
          item = await fetchNewsById(newsId);
        } catch (fetchError) {
          console.error("Error fetching news by ID:", fetchError);
          throw new Error('News item not found');
        }
      }
      
      if (!item) throw new Error('News item not found');
      
      // Increment view count if not viewed by user
      const updatedNews = await incrementViewCount(newsId, user?._id);
      setNewsItem(item);
      setLikeCount(updatedNews.likeCount || 0);
      setViewCount(updatedNews.viewCount || 0);
      setIsLiked(updatedNews.likedBy?.includes(user?._id) || false);
      
      // Update allNews in store
      const newsExists = allNews.some(n => n._id === newsId);
      if (newsExists) {
        setAllNews(allNews.map((n) => (n._id === newsId ? updatedNews : n)));
      } else {
        setAllNews([...allNews, updatedNews]);
      }
      
      // Fetch comments
      const fetchedComments = await fetchComments(newsId);
      setComments(fetchedComments.sort((a:any, b:any) => 
        sortOrder === 'newest' 
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
    } catch (err: any) {
      console.error("Error loading news data:", err);
      setError(err.message || 'Failed to load news details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewsData();
  }, [newsId, user?._id]);

  useEffect(() => {
    // Re-sort comments when sortOrder changes
    if (comments.length > 0) {
      const sortedComments = [...comments].sort((a, b) => 
        sortOrder === 'newest' 
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setComments(sortedComments);
    }
  }, [sortOrder]);

  const handleArchive = async () => {
    const isCurrentlyArchived = archivedNewsIds.includes(newsId);
    const newArchivedNewsIds = isCurrentlyArchived
      ? archivedNewsIds.filter((id) => id !== newsId)
      : [...archivedNewsIds, newsId];
    setArchivedNewsIds(newArchivedNewsIds);
    try {
      await toggleArchiveNews(newsId);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: isCurrentlyArchived ? 'News unarchived' : 'News archived',
      });
    } catch (error: any) {
      setArchivedNewsIds(
        isCurrentlyArchived
          ? [...archivedNewsIds, newsId]
          : archivedNewsIds.filter((id) => id !== newsId)
      );
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to toggle archive status',
      });
    }
  };

  const handleLike = async () => {
    likeScale.value = withSpring(1.2, {}, () => {
      likeScale.value = withSpring(1);
    });
    try {
      const updatedNews = await likeNews(newsId);
      setIsLiked(!isLiked);
      setLikeCount(updatedNews.likeCount || 0);
      setAllNews(allNews.map((n) => (n._id === newsId ? updatedNews : n)));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: isLiked ? 'News unliked' : 'News liked',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to toggle like',
      });
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Comment cannot be empty',
      });
      return;
    }
    if (commentText.length > 500) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Comment must be 500 characters or less',
      });
      return;
    }
    try {
      const newComment = await addComment(newsId, commentText);
      setComments([newComment, ...comments].sort((a, b) => 
        sortOrder === 'newest' 
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
      setCommentText('');
      setShowCommentInput(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Comment added',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to add comment',
      });
    }
  };

  const toggleCommentInput = () => {
    setShowCommentInput(!showCommentInput);
    if (!showCommentInput) {
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  const renderComment = (item: { _id: string; username: string; content: string; createdAt: string }) => (
    <CommentCard key={item._id}>
      <CommentUser>{item.username}</CommentUser>
      <CommentContent>{item.content}</CommentContent>
      <CommentMeta>{new Date(item.createdAt).toLocaleString()}</CommentMeta>
    </CommentCard>
  );

  if (loading) {
    return (
      <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Header>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        </Header>
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.primary} />
        </LoadingContainer>
      </Container>
    );
  }

  if (error || !newsItem) {
    return (
      <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Header>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        </Header>
        <ErrorContainer>
          <ErrorText>{error || 'News item not found.'}</ErrorText>
          <RetryButton onPress={loadNewsData}>
            <RetryButtonText>Retry</RetryButtonText>
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <ActionButton onPress={handleArchive}>
          <Icon name="archive" size={20} color={archivedNewsIds.includes(newsId) ? '#007BFF' : theme.text} />
        </ActionButton>
      </Header>
      
      <ScrollContainer>
        <NewsContent>
          <ImageContainer>
            <NewsImage
              source={{ uri: resolveImageUrl(newsItem.image) }}
              // resizeMode="cover"
              defaultSource={require('../assets/placeholder.png')}
            />
          </ImageContainer>
          <ContentContainer>
            <Title>{newsItem.title}</Title>
            <Meta>{newsItem.category} • {new Date(newsItem.createdAt).toLocaleDateString()}</Meta>
            <ReadTime>{calculateReadTime(newsItem.content)}</ReadTime>
            <ActionBar>
              <ActionItem onPress={handleLike}>
                <Animated.View style={animatedLikeStyle}>
                  <Icon name={isLiked ? 'heart' : 'heart-outline'} size={20} color={isLiked ? '#007BFF' : theme.text} />
                </Animated.View>
                <ActionText>{likeCount} Likes</ActionText>
              </ActionItem>
              <ActionItem onPress={toggleCommentInput}>
                <Icon name="chatbubble-outline" size={20} color={theme.text} />
                <ActionText>{comments.length} Comments</ActionText>
              </ActionItem>
              <ActionItem>
                <Icon name="eye-outline" size={20} color={theme.text} />
                <ActionText>{viewCount} Views</ActionText>
              </ActionItem>
              <ActionItem onPress={handleShare}>
                <Icon name="share-outline" size={20} color={theme.text} />
              </ActionItem>
            </ActionBar>
            <Content>{newsItem.content}</Content>
            <Divider />
          </ContentContainer>
        </NewsContent>
        
        <CommentsHeader>
          <SortButton onPress={toggleSortOrder}>
            <Icon name={sortOrder === 'newest' ? 'arrow-down' : 'arrow-up'} size={16} color={theme.text} />
            <SortText>Sort by {sortOrder === 'newest' ? 'Newest' : 'Oldest'}</SortText>
          </SortButton>
          {showCommentInput && (
            <CommentInputContainer>
              <CommentInput
                ref={commentInputRef}
                placeholder="Add a comment..."
                placeholderTextColor={`${theme.text}80`}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <CommentButton onPress={handleAddComment}>
                <CommentButtonText>Post Comment</CommentButtonText>
              </CommentButton>
            </CommentInputContainer>
          )}
        </CommentsHeader>
        
        <CommentsList>
          {comments.length > 0 ? (
            comments.map(renderComment)
          ) : (
            <EmptyCommentText>No comments yet.</EmptyCommentText>
          )}
        </CommentsList>
      </ScrollContainer>
    </Container>
  );
};

export default NewsDetailScreen;