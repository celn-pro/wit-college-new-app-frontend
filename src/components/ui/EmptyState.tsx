import React from 'react';
import { ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styled from '@emotion/native';
import { useTheme } from '../../theme';
import { Typography } from './Typography';
import { Button } from './Button';
import { Container, Column } from '../layout';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
  style?: ViewStyle;
  variant?: 'default' | 'search' | 'bookmarks' | 'notifications' | 'news' | 'categories';
  illustration?: React.ReactNode;
}

const EmptyContainer = styled(Container)`
  padding: ${(props) => props.theme.spacing.xl}px;
`;

const IconContainer = styled.View`
  margin-bottom: ${(props) => props.theme.spacing.lg}px;
  opacity: 0.6;
`;

const IllustrationContainer = styled.View`
  margin-bottom: ${(props) => props.theme.spacing.lg}px;
  align-items: center;
`;

const getEmptyConfig = (variant: EmptyStateProps['variant']) => {
  switch (variant) {
    case 'search':
      return {
        icon: 'search-outline',
        title: 'No Results Found',
        message: 'Try adjusting your search terms or filters to find what you\'re looking for.',
        actionText: 'Clear Filters',
      };
    case 'bookmarks':
      return {
        icon: 'bookmark-outline',
        title: 'No Bookmarks Yet',
        message: 'Start bookmarking articles you want to read later. Tap the bookmark icon on any article to save it here.',
        actionText: 'Browse News',
      };
    case 'notifications':
      return {
        icon: 'notifications-outline',
        title: 'No Notifications',
        message: 'You\'re all caught up! New notifications will appear here when they arrive.',
        actionText: 'Refresh',
      };
    case 'news':
      return {
        icon: 'newspaper-outline',
        title: 'No News Available',
        message: 'There are no news articles available at the moment. Please check back later.',
        actionText: 'Refresh',
      };
    case 'categories':
      return {
        icon: 'folder-outline',
        title: 'No Categories Selected',
        message: 'Select categories you\'re interested in to see relevant news articles.',
        actionText: 'Select Categories',
      };
    default:
      return {
        icon: 'document-outline',
        title: 'Nothing Here Yet',
        message: 'This section is empty. Content will appear here when available.',
        actionText: 'Refresh',
      };
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  iconSize = 64,
  iconColor,
  actionText,
  onAction,
  showAction = true,
  style,
  variant = 'default',
  illustration,
}) => {
  const theme = useTheme();
  const config = getEmptyConfig(variant);

  const finalIcon = icon || config.icon;
  const finalTitle = title || config.title;
  const finalMessage = message || config.message;
  const finalActionText = actionText || config.actionText;
  const finalIconColor = iconColor || theme.text.tertiary;

  return (
    <EmptyContainer
      flex={1}
      justify="center"
      align="center"
      style={style}
    >
      <Column align="center">
        {illustration ? (
          <IllustrationContainer>
            {illustration}
          </IllustrationContainer>
        ) : (
          <IconContainer>
            <Icon
              name={finalIcon}
              size={iconSize}
              color={finalIconColor}
            />
          </IconContainer>
        )}
        
        <Typography
          variant="h3"
          weight="bold"
          align="center"
          color="secondary"
          style={{ marginBottom: theme.spacing.sm }}
        >
          {finalTitle}
        </Typography>
        
        <Typography
          variant="body2"
          color="tertiary"
          align="center"
          style={{ 
            marginBottom: showAction && onAction ? theme.spacing.xl : 0,
            maxWidth: 300,
            lineHeight: theme.typography.lineHeight.relaxed,
          }}
        >
          {finalMessage}
        </Typography>
        
        {showAction && onAction && (
          <Button
            title={finalActionText}
            onPress={onAction}
            variant="outline"
            icon={<Icon name="arrow-forward" size={16} color={theme.primary} />}
          />
        )}
      </Column>
    </EmptyContainer>
  );
};

// Specific empty state components
export const SearchEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState variant="search" {...props} />
);

export const BookmarksEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState variant="bookmarks" {...props} />
);

export const NotificationsEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState variant="notifications" {...props} />
);

export const NewsEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState variant="news" {...props} />
);

export const CategoriesEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState variant="categories" {...props} />
);

export default EmptyState;
