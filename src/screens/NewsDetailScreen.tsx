import React, { useEffect, useState, useRef } from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import {
  toggleArchiveNews,
  addComment,
  likeNews,
  fetchComments,
  incrementViewCount,
  fetchNewsById,
  updateNews,
} from '../services/newsService';
import Toast from 'react-native-toast-message';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeIn, FadeOut } from 'react-native-reanimated';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  Container,
  Header,
  ScrollContainer,
  ContentContainer,
  Title,
  Content,
  Meta,
  ReadTime,
  ImageContainer,
  NewsImage,
  ActionBar,
  ActionItem,
  ActionText,
  ActionButton,
  CommentSection,
  CommentInputContainer,
  CommentInput,
  CommentButton,
  CommentButtonText,
  CommentCard,
  CommentUser,
  CommentContent,
  CommentMeta,
  SortButton,
  SortText,
  Divider,
  ErrorContainer,
  ErrorText,
  RetryButton,
  RetryButtonText,
  NewsContent,
  CommentsHeader,
  CommentsList,
  EmptyCommentText,
  LoadingContainer,
  ContentWrapper,
} from '../styles/newDetailStyles';
import { BASE_URL } from '../utils';

const resolveImageUrl = (imagePath: string) => {
  if (!imagePath) return 'https://picsum.photos/seed/default-news/200/200';
  if (imagePath.startsWith('/assets')) return `${BASE_URL}${imagePath}`;
  return imagePath;
};

const NewsDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'NewsDetail'>>();
  const { newsId } = route.params;
  const { allNews, archivedNewsIds, user, setAllNews, setArchivedNewsIds } = useAppStore();
  const theme = useTheme();
  const insets = useSafeAreaInsets(); // Use safe area insets
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
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);
  const commentInputRef = useRef<TextInput>(null);
  const titleInputRef = useRef<TextInput>(null);

  // Like animation
  const likeScale = useSharedValue(1);
  const animatedLikeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  // Edit mode animation
  const editOpacity = useSharedValue(1);
  const animatedEditStyle = useAnimatedStyle(() => ({
    opacity: editOpacity.value,
  }));

  const calculateReadTime = (content: string | undefined) => {
    if (!content) return '0 min read';
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

      let item = allNews.find((item) => item._id === newsId);
      if (!item) {
        console.log('News item not found in store, fetching from API...');
        item = await fetchNewsById(newsId);
      }
      if (!item) throw new Error('News item not found');

      const updatedNews = await incrementViewCount(newsId, user?._id);
      setNewsItem(item);
      setEditTitle(item.title);
      setEditContent(item.content);
      setEditImage(item.image || null);
      setLikeCount(updatedNews.likeCount || 0);
      setViewCount(updatedNews.viewCount || 0);
      setIsLiked(updatedNews.likedBy?.includes(user?._id) || false);

      const newsExists = allNews.some((n) => n._id === newsId);
      if (newsExists) {
        setAllNews(allNews.map((n) => (n._id === newsId ? updatedNews : n)));
      } else {
        setAllNews([...allNews, updatedNews]);
      }

      const fetchedComments = await fetchComments(newsId);
      setComments(
        fetchedComments.sort((a: any, b: any) =>
          sortOrder === 'newest'
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      );
    } catch (err: any) {
      console.error('Error loading news data:', err);
      setError(err.message || 'Failed to load news details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewsData();
  }, [newsId, user?._id]);

  useEffect(() => {
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
    likeScale.value = withSpring(1.2);
    likeScale.value = withSpring(1);

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
      setComments(
        [newComment, ...comments].sort((a, b) =>
          sortOrder === 'newest'
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      );
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

  const toggleEditMode = () => {
    if (isEditing) {
      setEditTitle(newsItem.title);
      setEditContent(newsItem.content);
      setEditImage(newsItem.image);
    } else {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }

    editOpacity.value = withSpring(0);
    setTimeout(() => {
      setIsEditing(!isEditing);
      editOpacity.value = withSpring(1);
    }, 200);
  };

  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.8,
      });
      if (result.didCancel || !result.assets?.[0].uri) {
        return;
      }
      const uri = result.assets[0].uri;
      setEditImage(uri);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick image',
      });
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Title is required',
      });
      return;
    }
    if (editTitle.length > 100) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Title must be 100 characters or less',
      });
      return;
    }
    if (!editContent.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Content is required',
      });
      return;
    }
    if (editContent.length > 5000) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Content must be 5000 characters or less',
      });
      return;
    }

    try {
      let imagePath = newsItem.image;
      if (editImage && !editImage.startsWith('http') && !editImage.startsWith('/assets')) {
        const formData = new FormData();
        formData.append('image', {
          uri: editImage,
          name: `news-${newsId}.jpg`,
          type: 'image/jpeg',
        } as any);
        const { token } = useAppStore.getState();
        const response = await fetch(`${BASE_URL}/api/news/upload-image`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Image upload failed');
        imagePath = data.imagePath;
      }

      const updatedNews = await updateNews(newsId, {
        title: editTitle,
        content: editContent,
        image: imagePath,
      });
      setNewsItem(updatedNews);
      setAllNews(allNews.map((n) => (n._id === newsId ? updatedNews : n)));
      setIsEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'News updated',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update news',
      });
    }
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
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <Header>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        </Header>
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.primary} />
        </LoadingContainer>
      </SafeAreaView>
    );
  }

  if (error || !newsItem) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 90 : 0} // Adjust for tab bar
      >
        <ContentWrapper>
          <Header>
            <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back">
              <Icon name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              {user?.role === 'admin' && (
                <ActionButton onPress={toggleEditMode} accessibilityLabel={isEditing ? 'Cancel edit' : 'Edit news'}>
                  <Icon name={isEditing ? 'close' : 'pencil'} size={20} color={theme.text} />
                </ActionButton>
              )}
              <ActionButton
                onPress={handleArchive}
                accessibilityLabel={archivedNewsIds.includes(newsId) ? 'Unarchive news' : 'Archive news'}
              >
                <Icon name="archive" size={20} color={archivedNewsIds.includes(newsId) ? '#007BFF' : theme.text} />
              </ActionButton>
            </View>
          </Header>
          <ScrollContainer contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
            <NewsContent>
              <ContentContainer>
                {isEditing ? (
                  <Animated.View style={animatedEditStyle} entering={FadeIn} exiting={FadeOut}>
                    <CommentInput
                      ref={titleInputRef}
                      value={editTitle}
                      onChangeText={setEditTitle}
                      placeholder="Enter title..."
                      placeholderTextColor={`${theme.text}80`}
                      maxLength={100}
                      style={{ fontSize: 20, fontFamily: 'Roboto-Bold', marginBottom: 12 }}
                      accessibilityLabel="Edit title"
                    />
                  </Animated.View>
                ) : (
                  <Animated.View style={animatedEditStyle} entering={FadeIn} exiting={FadeOut}>
                    <Title>{newsItem.title}</Title>
                    <Meta>{newsItem.category} • {new Date(newsItem.createdAt).toLocaleDateString()}</Meta>
                    <ReadTime>{calculateReadTime(newsItem.content)}</ReadTime>
                  </Animated.View>
                )}
              </ContentContainer>

              <ImageContainer>
                <NewsImage
                  source={{ uri: isEditing && editImage ? editImage : resolveImageUrl(newsItem.image) }}
                  defaultSource={require('../assets/placeholder.png')}
                />
                {isEditing && (
                  <Animated.View style={[animatedEditStyle, { position: 'absolute', bottom: 10, right: 10 }]}>
                    <TouchableOpacity
                      onPress={handleImagePick}
                      style={{ backgroundColor: '#007BFF', padding: 8, borderRadius: 8 }}
                    >
                      <Icon name="image" size={20} color="#fff" />
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </ImageContainer>

              <ContentContainer>
                <ActionBar>
                  <ActionItem onPress={handleLike} accessibilityLabel={isLiked ? 'Unlike news' : 'Like news'}>
                    <Animated.View style={animatedLikeStyle}>
                      <Icon name={isLiked ? 'heart' : 'heart-outline'} size={20} color={isLiked ? '#007BFF' : theme.text} />
                    </Animated.View>
                    <ActionText>{likeCount} Likes</ActionText>
                  </ActionItem>
                  <ActionItem onPress={toggleCommentInput} accessibilityLabel="View or add comment">
                    <Icon name="chatbubble-outline" size={20} color={theme.text} />
                    <ActionText>{comments.length} Comments</ActionText>
                  </ActionItem>
                  <ActionItem accessibilityLabel="View count">
                    <Icon name="eye-outline" size={20} color={theme.text} />
                    <ActionText>{viewCount} Views</ActionText>
                  </ActionItem>
                  <ActionItem onPress={handleShare} accessibilityLabel="Share news">
                    <Icon name="share-outline" size={20} color={theme.text} />
                  </ActionItem>
                </ActionBar>

                {isEditing ? (
                  <Animated.View style={animatedEditStyle}>
                    <CommentInput
                      value={editContent}
                      onChangeText={setEditContent}
                      placeholder="Enter content..."
                      placeholderTextColor={`${theme.text}80`}
                      multiline
                      maxLength={5000}
                      style={{ minHeight: 200 }}
                      accessibilityLabel="Edit content"
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                      <CommentButton onPress={handleSave} style={{ flex: 1, marginRight: 8 }}>
                        <CommentButtonText>Save</CommentButtonText>
                      </CommentButton>
                      <CommentButton onPress={toggleEditMode} style={{ flex: 1, backgroundColor: '#6c757d' }}>
                        <CommentButtonText>Cancel</CommentButtonText>
                      </CommentButton>
                    </View>
                  </Animated.View>
                ) : (
                  <Animated.View style={animatedEditStyle} entering={FadeIn} exiting={FadeOut}>
                    <Content>{newsItem.content}</Content>
                  </Animated.View>
                )}
                <Divider />
              </ContentContainer>
            </NewsContent>

            <CommentsHeader>
              <SortButton
                onPress={toggleSortOrder}
                accessibilityLabel={`Sort comments by ${sortOrder === 'newest' ? 'oldest' : 'newest'}`}
              >
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
                    accessibilityLabel="Comment input"
                  />
                  <CommentButton onPress={handleAddComment}>
                    <CommentButtonText>Post Comment</CommentButtonText>
                  </CommentButton>
                </CommentInputContainer>
              )}
            </CommentsHeader>
            <CommentsList>
              {comments.length > 0 ? comments.map(renderComment) : <EmptyCommentText>No comments yet.</EmptyCommentText>}
            </CommentsList>
          </ScrollContainer>
        </ContentWrapper>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewsDetailScreen;