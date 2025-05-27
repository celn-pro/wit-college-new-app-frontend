import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Alert,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Share,
  ActivityIndicator,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore, News } from '../store';
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
  deleteNews,
  uploadImage,
  Comment,
} from '../services/newsService';
import { cacheService } from '../services/cacheService';
import Toast from 'react-native-toast-message';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeIn, FadeOut } from 'react-native-reanimated';
import { launchImageLibrary } from 'react-native-image-picker';
import { sortComments } from '../utils/commentUtils';
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

const resolveImageUrl = (imagePath?: string) => {
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
  const insets = useSafeAreaInsets();
  const [newsItem, setNewsItem] = useState<News | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
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

  const likeScale = useSharedValue(1);
  const animatedLikeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const editOpacity = useSharedValue(1);
  const animatedEditStyle = useAnimatedStyle(() => ({
    opacity: editOpacity.value,
  }));

  const calculateReadTime = (content?: string) => {
    if (!content) return '0 min read';
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const loadNewsData = async () => {
    try {
      setLoading(true);
      setError(null);

      let item: News | undefined = allNews.find((n) => n._id === newsId);
      if (!item) {
        const cached = await cacheService.getNewsCache();
        item = cached?.news.find((n) => n._id === newsId);
        if (!item) {
          const fetched = await fetchNewsById(newsId);
          item = {
            ...fetched,
            likeCount: fetched.likeCount ?? 0,
            viewCount: fetched.viewCount ?? 0,
          };
        }
      }
      if (!item) throw new Error('News item not found');

      const updatedNews = await incrementViewCount(newsId, user?._id);
      setNewsItem({
        ...updatedNews,
        likeCount: updatedNews.likeCount ?? 0,
        viewCount: updatedNews.viewCount ?? 0,
      });
      setEditTitle(item.title);
      setEditContent(item.content);
      setEditImage(item.image || null);
      setLikeCount(updatedNews.likeCount ?? 0);
      setViewCount(updatedNews.viewCount ?? 0);
      setIsLiked(user?._id ? updatedNews.likedBy?.includes(user._id) || false : false);

      const newsExists = allNews.some((n) => n._id === newsId);
      if (newsExists) {
        setAllNews(
          allNews.map((n) =>
            n._id === newsId
              ? {
                  ...updatedNews,
                  likeCount: updatedNews.likeCount ?? 0,
                  viewCount: updatedNews.viewCount ?? 0,
                  likedBy: updatedNews.likedBy ?? [],
                }
              : n
          )
        );
      } else {
        setAllNews([
          ...allNews,
          {
            ...updatedNews,
            likeCount: updatedNews.likeCount ?? 0,
            viewCount: updatedNews.viewCount ?? 0,
          },
        ]);
      }

      const cached = await cacheService.getNewsCache();
      if (cached) {
        const updatedCache = newsExists
          ? cached.news.map((n) => (n._id === newsId ? updatedNews : n))
          : [...cached.news, updatedNews];
        await cacheService.setNewsCache(
          updatedCache.map((n) => ({
            ...n,
            likeCount: n.likeCount ?? 0,
            viewCount: n.viewCount ?? 0,
            likedBy: n.likedBy ?? [],
          })),
          cached.archivedIds
        );
      }

      const fetchedComments = await fetchComments(newsId);
      setComments(fetchedComments);
    } catch (err: any) {
      console.error('Error loading news data:', err);
      setError(err.message || 'Failed to load news details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (newsId && user) {
      loadNewsData();
    }
  }, [newsId, user]);

  const sortedComments = useMemo(() => sortComments(comments, sortOrder), [comments, sortOrder]);

  const handleShare = async () => {
    if (!newsItem) return;
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
      console.error('Share error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to share news',
      });
    }
  };

  const handleArchive = async () => {
    if (!newsId || !user) return;
    const isCurrentlyArchived = archivedNewsIds.includes(newsId);
    const newArchivedNewsIds = isCurrentlyArchived
      ? archivedNewsIds.filter((id) => id !== newsId)
      : [...archivedNewsIds, newsId];
    setArchivedNewsIds(newArchivedNewsIds);
    try {
      await toggleArchiveNews(newsId);
      const cached = await cacheService.getNewsCache();
      if (cached) {
        await cacheService.setNewsCache(cached.news, newArchivedNewsIds);
      }
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
      console.error('Archive error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to toggle archive status',
      });
    }
  };

  const handleLike = async () => {
    if (!newsId || !user) return;
    likeScale.value = withSpring(1.2);
    likeScale.value = withSpring(1);
    const previousLikeState = isLiked;
    setIsLiked(!isLiked);
    setLikeCount(previousLikeState ? likeCount - 1 : likeCount + 1);

    try {
      const updatedNews = await likeNews(newsId);
      setLikeCount(updatedNews.likeCount || 0);
      setAllNews(
        allNews.map((n) =>
          n._id === newsId
            ? {
                ...updatedNews,
                likeCount: updatedNews.likeCount ?? 0,
                viewCount: updatedNews.viewCount ?? 0,
                likedBy: updatedNews.likedBy ?? [],
              }
            : n
        )
      );
      const cached = await cacheService.getNewsCache();
      if (cached) {
        const updatedCache = cached.news.map((n) => (n._id === newsId ? updatedNews : n));
        await cacheService.setNewsCache(
          updatedCache.map((n) => ({
            ...n,
            likeCount: n.likeCount ?? 0,
            viewCount: n.viewCount ?? 0,
            likedBy: n.likedBy ?? [],
          })),
          cached.archivedIds
        );
      }
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: previousLikeState ? 'News unliked' : 'News liked',
      });
    } catch (error: any) {
      setIsLiked(previousLikeState);
      setLikeCount(previousLikeState ? likeCount + 1 : likeCount - 1);
      console.error('Like error:', error);
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
      setComments([newComment, ...comments]);
      setCommentText('');
      setShowCommentInput(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Comment added',
      });
    } catch (error: any) {
      console.error('Add comment error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to add comment',
      });
    }
  };

  const handleDelete = () => {
    if (!newsId || !user?.isAdmin) return;
    Alert.alert(
      'Delete News',
      'Are you sure you want to delete this news item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNews(newsId);
              setAllNews(allNews.filter((n) => n._id !== newsId));
              setArchivedNewsIds(archivedNewsIds.filter((id) => id !== newsId));
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'News deleted',
              });
              navigation.navigate('Home');
            } catch (error: any) {
              console.error('Delete error:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to delete news',
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
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
    if (!newsItem) return;
    if (isEditing) {
      setEditTitle(newsItem.title);
      setEditContent(newsItem.content);
      setEditImage(newsItem.image || null);
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
      if (result.didCancel || !result.assets?.[0].uri) return;
      setEditImage(result.assets[0].uri);
    } catch (error: any) {
      console.error('Image pick error:', error);
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
      let imagePath = newsItem?.image;
      if (editImage && !editImage.startsWith('http') && !editImage.startsWith('/assets')) {
        imagePath = await uploadImage(editImage, newsId);
      }

      const updatedNews = await updateNews(newsId, {
        title: editTitle,
        content: editContent,
        image: imagePath,
      });
      setNewsItem({
        ...updatedNews,
        likeCount: updatedNews.likeCount ?? 0,
        viewCount: updatedNews.viewCount ?? 0,
      });
      setAllNews(
        allNews.map((n) =>
          n._id === newsId
            ? {
                ...updatedNews,
                likeCount: updatedNews.likeCount ?? 0,
                viewCount: updatedNews.viewCount ?? 0,
                likedBy: updatedNews.likedBy ?? [],
              }
            : n
        )
      );
      const cached = await cacheService.getNewsCache();
      if (cached) {
        const updatedCache = cached.news.map((n) => (n._id === newsId ? updatedNews : n));
        await cacheService.setNewsCache(
          updatedCache.map((n) => ({
            ...n,
            likeCount: n.likeCount ?? 0,
            viewCount: n.viewCount ?? 0,
            likedBy: n.likedBy ?? [],
          })),
          cached.archivedIds
        );
      }
      setIsEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'News updated',
      });
    } catch (error: any) {
      console.error('Save error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update news',
      });
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
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
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back">
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
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back">
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 90 : 0}
      >
        <ContentWrapper>
          <Header>
            <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back">
              <Icon name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {user?.isAdmin && (
                <>
                  <ActionButton
                    onPress={toggleEditMode}
                    accessibilityLabel={isEditing ? 'Cancel edit' : 'Edit news'}
                  >
                    <Icon name={isEditing ? 'close' : 'pencil'} size={20} color={theme.text} />
                  </ActionButton>
                  <ActionButton onPress={handleDelete} accessibilityLabel="Delete news">
                    <Icon name="trash" size={20} color={theme.text} />
                  </ActionButton>
                </>
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
                  <Animated.View style={animatedEditStyle} entering={FadeIn}>
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
                      accessibilityLabel="Change image"
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
                      <Icon
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isLiked ? '#007BFF' : theme.text}
                      />
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
                      <CommentButton
                        onPress={handleSave}
                        style={{ flex: 1, marginRight: 8 }}
                        accessibilityLabel="Save changes"
                      >
                        <CommentButtonText>Save</CommentButtonText>
                      </CommentButton>
                      <CommentButton
                        onPress={toggleEditMode}
                        style={{ flex: 1, backgroundColor: '#6c757d' }}
                        accessibilityLabel="Cancel edit"
                      >
                        <CommentButtonText>Cancel</CommentButtonText>
                      </CommentButton>
                    </View>
                  </Animated.View>
                ) : (
                  <Animated.View style={animatedEditStyle} entering={FadeIn}>
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
                  <CommentButton onPress={handleAddComment} accessibilityLabel="Post comment">
                    <CommentButtonText>Post Comment</CommentButtonText>
                  </CommentButton>
                </CommentInputContainer>
              )}
            </CommentsHeader>
            <CommentsList>
              {sortedComments.length > 0 ? (
                <FlatList
                  data={sortedComments}
                  renderItem={renderComment}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                />
              ) : (
                <EmptyCommentText>No comments yet.</EmptyCommentText>
              )}
            </CommentsList>
          </ScrollContainer>
        </ContentWrapper>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewsDetailScreen;