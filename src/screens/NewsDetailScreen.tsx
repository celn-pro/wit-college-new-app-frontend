import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Alert,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
  View,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore, News } from '../store';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
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
import styled from '@emotion/native';
import { BASE_URL } from '../utils';

// Import our modern component library
import {
  Screen,
  Container,
  Row,
  Header,
  Typography,
  Button,
  LoadingSpinner,
} from '../components';

// Modern styled components for News Detail Screen
const ModernContainer = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

const HeroImageContainer = styled.View`
  height: 320px;
  margin: 20px;
  border-radius: 24px;
  overflow: hidden;
  background-color: ${(props) => props.theme.surface};
  shadow-color: #000;
  shadow-offset: 0px 12px;
  shadow-opacity: 0.2;
  shadow-radius: 20px;
  elevation: 16;
  border: 1px solid ${(props) => props.theme.border};
`;

const HeroImage = styled(Image)`
  width: 100%;
  height: 100%;
`;



const NewsContent = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

const ContentSection = styled.View`
  padding: 0 20px;
  margin-bottom: 16px;
`;

const ContentCard = styled.View`
  background-color: ${(props) => props.theme.surface};
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.08;
  shadow-radius: 12px;
  elevation: 4;
  border: 1px solid ${(props) => props.theme.border};
`;

const ModernCategoryBadge = styled.View`
  background-color: ${(props) => props.theme.primary};
  padding: 8px 16px;
  border-radius: 20px;
  align-self: flex-start;
  margin-bottom: 16px;
  shadow-color: ${(props) => props.theme.primary};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 6;
`;

const CategoryText = styled.Text`
  color: ${(props) => props.theme.text.inverse};
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TitleContainer = styled.View`
  margin-bottom: 20px;
`;

const ModernTitle = styled.Text`
  font-size: 28px;
  font-weight: 800;
  color: ${(props) => props.theme.text.primary};
  line-height: 36px;
  margin-bottom: 8px;
`;

const MetaContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 24px;
  gap: 16px;
`;

const MetaItem = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.theme.background};
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.border};
`;

const MetaText = styled.Text`
  font-size: 12px;
  color: ${(props) => props.theme.text.secondary};
  margin-left: 6px;
  font-weight: 500;
`;

const ModernActionBar = styled.View`
  background-color: ${(props) => props.theme.surface};
  border-radius: 20px;
  padding: 20px;
  margin: 0 20px 16px 20px;
  flex-direction: row;
  justify-content: space-around;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.08;
  shadow-radius: 12px;
  elevation: 4;
  border: 1px solid ${(props) => props.theme.border};
`;

const ModernActionItem = styled(TouchableOpacity)`
  flex: 1;
  align-items: center;
  padding: 12px 8px;
  border-radius: 12px;
  background-color: ${(props) => props.theme.background};
  margin: 0 4px;
`;

const ActionIconContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${(props) => props.theme.primary}15;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
`;

const ActionText = styled.Text`
  font-size: 11px;
  color: ${(props) => props.theme.text.secondary};
  text-align: center;
  font-weight: 600;
`;

const ContentText = styled.Text`
  font-size: 16px;
  line-height: 26px;
  color: ${(props) => props.theme.text.primary};
  margin: 20px 0;
  font-weight: 400;
`;

const ModernCommentSection = styled.View`
  background-color: ${(props) => props.theme.surface};
  border-radius: 20px;
  margin: 0 20px 16px 20px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.08;
  shadow-radius: 12px;
  elevation: 4;
  border: 1px solid ${(props) => props.theme.border};
`;

const CommentHeader = styled.View`
  padding: 20px 20px 16px 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.border};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CommentTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${(props) => props.theme.text.primary};
`;

const CommentInputContainer = styled.View`
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.border};
`;

const ModernCommentInput = styled(TextInput)`
  background-color: ${(props) => props.theme.background};
  border: 2px solid ${(props) => props.theme.border};
  border-radius: 16px;
  padding: 16px;
  font-size: 16px;
  color: ${(props) => props.theme.text.primary};
  min-height: 100px;
  text-align-vertical: top;
  margin-bottom: 16px;
`;

const ModernCommentButton = styled(TouchableOpacity)`
  background-color: ${(props) => props.theme.primary};
  padding: 16px;
  border-radius: 16px;
  align-items: center;
  shadow-color: ${(props) => props.theme.primary};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 6;
`;

const CommentButtonText = styled.Text`
  color: ${(props) => props.theme.text.inverse};
  font-weight: 700;
  font-size: 16px;
`;

const ModernCommentCard = styled.View`
  background-color: ${(props) => props.theme.background};
  border-radius: 16px;
  padding: 16px;
  margin: 8px 20px;
  border: 1px solid ${(props) => props.theme.border};
`;

const CommentUserRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const CommentUserAvatar = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${(props) => props.theme.primary}20;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const CommentUserName = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.text.primary};
  flex: 1;
`;

const CommentDate = styled.Text`
  font-size: 12px;
  color: ${(props) => props.theme.text.tertiary};
`;

const CommentText = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.theme.text.secondary};
`;

const ModernEditInput = styled(TextInput)`
  background-color: ${(props) => props.theme.background};
  border: 2px solid ${(props) => props.theme.primary};
  border-radius: 16px;
  padding: 16px;
  font-size: 16px;
  color: ${(props) => props.theme.text.primary};
  margin-bottom: 16px;
  min-height: 120px;
  text-align-vertical: top;
`;



const SortButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: 8px 12px;
  border-radius: 12px;
  background-color: ${(props) => props.theme.background};
  border: 1px solid ${(props) => props.theme.border};
`;

const SortText = styled.Text`
  margin-left: 8px;
  color: ${(props) => props.theme.text.primary};
  font-size: 14px;
  font-weight: 600;
`;

const EmptyCommentContainer = styled.View`
  padding: 40px 20px;
  align-items: center;
`;

const EmptyCommentIcon = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: ${(props) => props.theme.primary}15;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`;

const EmptyCommentText = styled.Text`
  text-align: center;
  color: ${(props) => props.theme.text.secondary};
  font-size: 16px;
  font-weight: 500;
`;

const EmptyCommentSubtext = styled.Text`
  text-align: center;
  color: ${(props) => props.theme.text.tertiary};
  font-size: 14px;
  margin-top: 8px;
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;



const resolveImageUrl = (imagePath?: string) => {
  if (!imagePath) return 'https://picsum.photos/seed/default-news/200/200';
  if (imagePath.startsWith('/assets')) return `${BASE_URL}${imagePath}`;
  return imagePath;
};

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const calculateReadTime = (content: string): string => {
  if (!content || typeof content !== 'string') return '1 min read';
  const wordsPerMinute = 200;
  const words = content.split(' ').length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

// Fixed JSX structure issues - Metro cache cleared
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
  const [editImageUrl, setEditImageUrl] = useState('');
  const commentInputRef = useRef<TextInput>(null);
  const titleInputRef = useRef<TextInput>(null);

  const likeScale = useSharedValue(1);
  const animatedLikeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));





  const loadNewsData = async () => {
    try {
      setLoading(true);
      setError(null);

      let item: News | undefined = allNews.find((n) => n._id === newsId);
      if (!item) {
        const cachedNews = await cacheService.getNewsCache();
        item = cachedNews?.news.find((n) => n._id === newsId);
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
      setEditImageUrl(item.image && isValidUrl(item.image) ? item.image : '');
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
                title: updatedNews.title || '',
                content: updatedNews.content || '',
                category: updatedNews.category || '',
                createdBy: updatedNews.createdBy || '',
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
            title: n.title || '',
            content: n.content || '',
            category: n.category || '',
            createdBy: n.createdBy || '',
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
              navigation.goBack();
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
      setEditImageUrl(newsItem.image && isValidUrl(newsItem.image) ? newsItem.image : '');
    } else {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }

    setIsEditing(!isEditing);
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
      setEditImageUrl('');
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
    if (editImageUrl && !isValidUrl(editImageUrl)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid image URL',
      });
      return;
    }

    try {
      let imagePath = editImageUrl || newsItem?.image;
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
      setEditImageUrl('');
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

  // Modern render methods
  const renderComment = ({ item }: { item: Comment }) => (
    <ModernCommentCard key={item._id}>
      <CommentUserRow>
        <CommentUserAvatar>
          <Icon name="person" size={16} color={theme.primary} />
        </CommentUserAvatar>
        <CommentUserName>{item.username || 'Anonymous'}</CommentUserName>
        <CommentDate>{formatDate(item.createdAt)}</CommentDate>
      </CommentUserRow>
      <CommentText>{item.content || 'No content'}</CommentText>
    </ModernCommentCard>
  );

  const renderHeaderActions = () => {
    const actions = [];

    if (user?.isAdmin) {
      actions.push(
        <TouchableOpacity
          key="edit"
          onPress={toggleEditMode}
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.background + '40',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: theme.spacing.sm,
          }}
        >
          <Icon
            name={isEditing ? 'close' : 'pencil'}
            size={20}
            color={theme.text.inverse}
          />
        </TouchableOpacity>
      );

      actions.push(
        <TouchableOpacity
          key="delete"
          onPress={handleDelete}
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.background + '40',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: theme.spacing.sm,
          }}
        >
          <Icon name="trash" size={20} color={theme.error} />
        </TouchableOpacity>
      );
    }

    actions.push(
      <TouchableOpacity
        key="archive"
        onPress={handleArchive}
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.background + '40',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: theme.spacing.sm,
        }}
      >
        <Icon
          name="archive"
          size={20}
          color={archivedNewsIds.includes(newsId) ? theme.primary : theme.text.inverse}
        />
      </TouchableOpacity>
    );

    return <Row>{actions}</Row>;
  };

  // Loading state
  if (loading) {
    return (
      <Screen edges={['top', 'bottom']}>
        <Header
          title="News Detail"
          showBackButton
          onBackPress={() => navigation.goBack()}
          gradient
        />
        <Container flex={1} justify="center" align="center">
          <LoadingSpinner size="large" />
          <Typography
            variant="body1"
            color="secondary"
            style={{ marginTop: theme.spacing.md }}
          >
            Loading article...
          </Typography>
        </Container>
      </Screen>
    );
  }

  // Error state
  if (error || !newsItem) {
    return (
      <Screen edges={['top', 'bottom']}>
        <Header
          title="News Detail"
          showBackButton
          onBackPress={() => navigation.goBack()}
          gradient
        />
        <Container flex={1} justify="center" align="center" paddingHorizontal="lg">
          <Icon name="alert-circle-outline" size={64} color={theme.error} />
          <Typography
            variant="h4"
            color="primary"
            align="center"
            style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}
          >
            Article not found
          </Typography>
          <Typography
            variant="body2"
            color="secondary"
            align="center"
            style={{ marginBottom: theme.spacing.lg }}
          >
            {error || 'The article you are looking for could not be found.'}
          </Typography>
          <Button
            title="Try Again"
            onPress={loadNewsData}
            variant="primary"
            icon={<Icon name="refresh" size={16} color={theme.text.inverse} />}
          />
        </Container>
      </Screen>
    );
  }

  // Main content render
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'left', 'right', 'bottom']}>
      <ModernContainer>
        <Header
          title="Article Details"
          showBackButton
          onBackPress={() => navigation.goBack()}
          rightComponent={renderHeaderActions()}
          gradient
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 90 : 0}
        >
          <ScrollContainer
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Image */}
            <HeroImageContainer>
              <HeroImage
                source={{ uri: isEditing && editImage ? editImage : resolveImageUrl(newsItem.image) }}
                defaultSource={require('../assets/placeholder.png')}
                resizeMode="cover"
              />
              {isEditing && (
                <View style={{
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                }}>
                  <Button
                    title=""
                    onPress={handleImagePick}
                    variant="primary"
                    size="sm"
                    icon={<Icon name="image" size={16} color={theme.text.inverse} />}
                  />
                </View>
              )}
            </HeroImageContainer>

            {/* Content Section */}
            <NewsContent>
              <ContentSection>
                <ContentCard>
                  {/* Category Badge */}
                  <ModernCategoryBadge>
                    <CategoryText>{newsItem.category || 'General'}</CategoryText>
                  </ModernCategoryBadge>

                  {/* Title */}
                  <TitleContainer>
                    {isEditing ? (
                      <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <ModernEditInput
                          ref={titleInputRef}
                          value={editTitle}
                          onChangeText={setEditTitle}
                          placeholder="Enter title..."
                          placeholderTextColor={theme.text.tertiary}
                          maxLength={100}
                          style={{ fontSize: 24, fontWeight: '700', minHeight: 60 }}
                        />
                      </Animated.View>
                    ) : (
                      <ModernTitle>{newsItem.title || 'Untitled'}</ModernTitle>
                    )}
                  </TitleContainer>

                  {/* Meta Information */}
                  <MetaContainer>
                    <MetaItem>
                      <Icon name="calendar-outline" size={14} color={theme.text.tertiary} />
                      <MetaText>{formatDate(newsItem.createdAt)}</MetaText>
                    </MetaItem>

                    <MetaItem>
                      <Icon name="time-outline" size={14} color={theme.text.tertiary} />
                      <MetaText>{calculateReadTime(newsItem.content)}</MetaText>
                    </MetaItem>

                    <MetaItem>
                      <Icon name="person-outline" size={14} color={theme.text.tertiary} />
                      <MetaText>{newsItem.createdBy || 'Unknown'}</MetaText>
                    </MetaItem>
                  </MetaContainer>

                  {/* Content */}
                  {isEditing ? (
                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                      <ModernEditInput
                        value={editContent}
                        onChangeText={setEditContent}
                        placeholder="Enter content..."
                        placeholderTextColor={theme.text.tertiary}
                        multiline
                        maxLength={5000}
                        style={{ minHeight: 200 }}
                        accessibilityLabel="Edit content"
                      />
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                        <ModernCommentButton
                          onPress={handleSave}
                          style={{ flex: 1 }}
                          accessibilityLabel="Save changes"
                        >
                          <CommentButtonText>Save Changes</CommentButtonText>
                        </ModernCommentButton>
                        <TouchableOpacity
                          onPress={toggleEditMode}
                          style={{
                            flex: 1,
                            backgroundColor: theme.text.secondary,
                            padding: 16,
                            borderRadius: 16,
                            alignItems: 'center',
                          }}
                          accessibilityLabel="Cancel edit"
                        >
                          <CommentButtonText>Cancel</CommentButtonText>
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  ) : (
                    <Animated.View entering={FadeIn}>
                      <ContentText>{newsItem.content || 'No content available'}</ContentText>
                    </Animated.View>
                  )}
                </ContentCard>
              </ContentSection>

              {/* Action Bar */}
              <ModernActionBar>
                <ModernActionItem onPress={handleLike} accessibilityLabel={isLiked ? 'Unlike news' : 'Like news'}>
                  <ActionIconContainer>
                    <Animated.View style={animatedLikeStyle}>
                      <Icon
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isLiked ? theme.primary : theme.text.secondary}
                      />
                    </Animated.View>
                  </ActionIconContainer>
                  <ActionText>{likeCount} Likes</ActionText>
                </ModernActionItem>

                <ModernActionItem onPress={toggleCommentInput} accessibilityLabel="View or add comment">
                  <ActionIconContainer>
                    <Icon name="chatbubble-outline" size={20} color={theme.text.secondary} />
                  </ActionIconContainer>
                  <ActionText>{comments.length} Comments</ActionText>
                </ModernActionItem>

                <ModernActionItem accessibilityLabel="View count">
                  <ActionIconContainer>
                    <Icon name="eye-outline" size={20} color={theme.text.secondary} />
                  </ActionIconContainer>
                  <ActionText>{viewCount} Views</ActionText>
                </ModernActionItem>

                <ModernActionItem onPress={handleShare} accessibilityLabel="Share news">
                  <ActionIconContainer>
                    <Icon name="share-outline" size={20} color={theme.text.secondary} />
                  </ActionIconContainer>
                  <ActionText>Share</ActionText>
                </ModernActionItem>
              </ModernActionBar>

              {/* Comments Section */}
              <ModernCommentSection>
                <CommentHeader>
                  <CommentTitle>Comments ({comments.length})</CommentTitle>
                  <SortButton
                    onPress={toggleSortOrder}
                    accessibilityLabel={`Sort comments by ${sortOrder === 'newest' ? 'oldest' : 'newest'}`}
                  >
                    <Icon name={sortOrder === 'newest' ? 'arrow-down' : 'arrow-up'} size={16} color={theme.text.primary} />
                    <SortText>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</SortText>
                  </SortButton>
                </CommentHeader>

                {showCommentInput && (
                  <CommentInputContainer>
                    <ModernCommentInput
                      ref={commentInputRef}
                      placeholder="Share your thoughts..."
                      placeholderTextColor={theme.text.tertiary}
                      value={commentText}
                      onChangeText={setCommentText}
                      multiline
                      maxLength={500}
                      accessibilityLabel="Comment input"
                    />
                    <ModernCommentButton onPress={handleAddComment} accessibilityLabel="Post comment">
                      <CommentButtonText>Post Comment</CommentButtonText>
                    </ModernCommentButton>
                  </CommentInputContainer>
                )}

                {sortedComments.length > 0 ? (
                  <FlatList
                    data={sortedComments}
                    renderItem={renderComment}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                    style={{ paddingBottom: 20 }}
                  />
                ) : (
                  <EmptyCommentContainer>
                    <EmptyCommentIcon>
                      <Icon name="chatbubble-outline" size={24} color={theme.primary} />
                    </EmptyCommentIcon>
                    <EmptyCommentText>No comments yet</EmptyCommentText>
                    <EmptyCommentSubtext>Be the first to share your thoughts!</EmptyCommentSubtext>
                  </EmptyCommentContainer>
                )}
              </ModernCommentSection>
            </NewsContent>
          </ScrollContainer>
        </KeyboardAvoidingView>
      </ModernContainer>
    </SafeAreaView>
  );
};

export default NewsDetailScreen;