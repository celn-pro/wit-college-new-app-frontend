import React from 'react';
import { Image, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import styled from '@emotion/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { Card, Typography, Body2, Caption } from './ui';
import { News } from '../store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface NewsCardProps {
  news: News;
  index?: number;
  variant?: 'default' | 'featured' | 'compact';
  style?: ViewStyle;
  onBookmark?: (newsId: string) => void;
  isBookmarked?: boolean;
}

// Create animated view instead of animated card to avoid forwardRef issues
const AnimatedView = Animated.createAnimatedComponent(View);

const CardContainer = styled.View<{ variant: 'default' | 'featured' | 'compact' }>`
  ${(props) => {
    const { theme } = props;

    const variantStyles = {
      default: `
        margin: ${theme.spacing.sm}px 20px;
      `,
      featured: `
        margin: ${theme.spacing.md}px 20px;
        margin-bottom: ${theme.spacing.lg}px;
      `,
      compact: `
        margin: ${theme.spacing.xs}px 20px;
      `,
    };

    return variantStyles[props.variant];
  }}
`;

const NewsImage = styled(Image)<{ variant: 'default' | 'featured' | 'compact' }>`
  ${(props) => {
    const { theme } = props;

    const variantStyles = {
      default: `
        width: 100px;
        height: 100px;
        border-radius: 16px;
      `,
      featured: `
        width: 100%;
        height: 200px;
        border-radius: 20px;
        margin-bottom: ${theme.spacing.md}px;
      `,
      compact: `
        width: 80px;
        height: 80px;
        border-radius: 12px;
      `,
    };

    return variantStyles[props.variant];
  }}
`;

const ContentContainer = styled.View<{ variant: 'default' | 'featured' | 'compact' }>`
  ${(props) => {
    const { theme } = props;

    const variantStyles = {
      default: `
        flex: 1;
        padding-left: ${theme.spacing.md}px;
        justify-content: space-between;
      `,
      featured: `
        width: 100%;
      `,
      compact: `
        flex: 1;
        padding-left: ${theme.spacing.sm}px;
        justify-content: center;
      `,
    };

    return variantStyles[props.variant];
  }}
`;

const CardContent = styled.View<{ variant: 'default' | 'featured' | 'compact' }>`
  ${(props) => {
    const variantStyles = {
      default: 'flex-direction: row;',
      featured: 'flex-direction: column;',
      compact: 'flex-direction: row;',
    };

    return variantStyles[props.variant];
  }}
`;

const MetaContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: ${(props) => props.theme.spacing.sm}px;
`;

const MetaInfo = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const MetaItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-right: ${(props) => props.theme.spacing.md}px;
`;

const BookmarkButton = styled(TouchableOpacity)`
  padding: ${(props) => props.theme.spacing.sm}px;
  border-radius: 20px;
  background-color: ${(props) => props.theme.surface}95;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

const CategoryBadge = styled.View`
  background-color: ${(props) => props.theme.primaryLight};
  padding: ${(props) => props.theme.spacing.xs}px ${(props) => props.theme.spacing.md}px;
  border-radius: 16px;
  margin-bottom: ${(props) => props.theme.spacing.sm}px;
  align-self: flex-start;
`;

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';

  return date.toLocaleDateString();
};

const NewsCard: React.FC<NewsCardProps> = ({
  news,
  index = 0,
  variant = 'default',
  style,
  onBookmark,
  isBookmarked = false,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const handlePress = () => {
    scale.value = 0.98;
    setTimeout(() => (scale.value = 1), 100);
    navigation.navigate('NewsDetail', { newsId: news._id });
  };

  const handleBookmark = () => {
    onBookmark?.(news._id);
  };

  const imageSource = news.image
    ? { uri: news.image }
    : require('../assets/placeholder.png');

  return (
    <CardContainer variant={variant} style={style}>
      <AnimatedView
        style={animatedStyle}
        entering={FadeInDown.delay(index * 100).duration(500)}
      >
        <Card
          variant="elevated"
          padding="md"
          onPress={handlePress}
        >
        <CardContent variant={variant}>
          <NewsImage
            source={imageSource}
            variant={variant}
            resizeMode="cover"
          />

          <ContentContainer variant={variant}>
            {variant === 'featured' && (
              <CategoryBadge>
                <Caption color="primary" weight="medium">
                  {news.category}
                </Caption>
              </CategoryBadge>
            )}

            <Typography
              variant={variant === 'featured' ? 'h3' : variant === 'compact' ? 'body2' : 'body1'}
              weight="semiBold"
              numberOfLines={variant === 'compact' ? 2 : 3}
              style={{ marginBottom: theme.spacing.xs }}
            >
              {news.title}
            </Typography>

            {variant !== 'compact' && (
              <Body2
                color="secondary"
                numberOfLines={variant === 'featured' ? 3 : 2}
                style={{ marginBottom: theme.spacing.sm }}
              >
                {news.content.substring(0, 150)}...
              </Body2>
            )}

            <MetaContainer>
              <MetaInfo>
                <MetaItem>
                  <Icon
                    name="time-outline"
                    size={14}
                    color={theme.text.tertiary}
                    style={{ marginRight: theme.spacing.xs }}
                  />
                  <Caption color="tertiary">
                    {formatDate(news.createdAt)}
                  </Caption>
                </MetaItem>

                {variant !== 'compact' && (
                  <>
                    <MetaItem>
                      <Icon
                        name="eye-outline"
                        size={14}
                        color={theme.text.tertiary}
                        style={{ marginRight: theme.spacing.xs }}
                      />
                      <Caption color="tertiary">
                        {news.viewCount}
                      </Caption>
                    </MetaItem>

                    <MetaItem>
                      <Icon
                        name="heart-outline"
                        size={14}
                        color={theme.text.tertiary}
                        style={{ marginRight: theme.spacing.xs }}
                      />
                      <Caption color="tertiary">
                        {news.likeCount}
                      </Caption>
                    </MetaItem>
                  </>
                )}
              </MetaInfo>

              {onBookmark && (
                <BookmarkButton onPress={handleBookmark}>
                  <Icon
                    name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color={isBookmarked ? theme.primary : theme.text.tertiary}
                  />
                </BookmarkButton>
              )}
            </MetaContainer>
          </ContentContainer>
        </CardContent>
        </Card>
      </AnimatedView>
    </CardContainer>
  );
};

export default NewsCard;
