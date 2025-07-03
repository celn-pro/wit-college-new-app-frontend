import React from 'react';
import { ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styled from '@emotion/native';
import { useTheme } from '../../theme';
import { Typography } from './Typography';
import { Button } from './Button';
import { Container, Column } from '../layout';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  onRetry?: () => void;
  retryText?: string;
  showRetry?: boolean;
  style?: ViewStyle;
  variant?: 'default' | 'network' | 'notFound' | 'permission' | 'server';
}

const ErrorContainer = styled(Container)`
  padding: ${(props) => props.theme.spacing.xl}px;
`;

const IconContainer = styled.View`
  margin-bottom: ${(props) => props.theme.spacing.lg}px;
`;

const getErrorConfig = (variant: ErrorStateProps['variant']) => {
  switch (variant) {
    case 'network':
      return {
        icon: 'wifi-outline',
        title: 'No Internet Connection',
        message: 'Please check your internet connection and try again.',
        iconColor: '#F59E0B',
      };
    case 'notFound':
      return {
        icon: 'search-outline',
        title: 'Not Found',
        message: 'The content you are looking for could not be found.',
        iconColor: '#6B7280',
      };
    case 'permission':
      return {
        icon: 'lock-closed-outline',
        title: 'Access Denied',
        message: 'You do not have permission to access this content.',
        iconColor: '#EF4444',
      };
    case 'server':
      return {
        icon: 'server-outline',
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        iconColor: '#EF4444',
      };
    default:
      return {
        icon: 'alert-circle-outline',
        title: 'Something went wrong',
        message: 'An unexpected error occurred. Please try again.',
        iconColor: '#EF4444',
      };
  }
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  icon,
  iconSize = 64,
  iconColor,
  onRetry,
  retryText = 'Try Again',
  showRetry = true,
  style,
  variant = 'default',
}) => {
  const theme = useTheme();
  const config = getErrorConfig(variant);

  const finalIcon = icon || config.icon;
  const finalTitle = title || config.title;
  const finalMessage = message || config.message;
  const finalIconColor = iconColor || config.iconColor;

  return (
    <ErrorContainer
      flex={1}
      justify="center"
      align="center"
      style={style}
    >
      <Column align="center">
        <IconContainer>
          <Icon
            name={finalIcon}
            size={iconSize}
            color={finalIconColor}
          />
        </IconContainer>
        
        <Typography
          variant="h3"
          weight="bold"
          align="center"
          style={{ marginBottom: theme.spacing.sm }}
        >
          {finalTitle}
        </Typography>
        
        <Typography
          variant="body2"
          color="secondary"
          align="center"
          style={{ 
            marginBottom: showRetry && onRetry ? theme.spacing.xl : 0,
            maxWidth: 300,
          }}
        >
          {finalMessage}
        </Typography>
        
        {showRetry && onRetry && (
          <Button
            title={retryText}
            onPress={onRetry}
            variant="primary"
            icon={<Icon name="refresh" size={16} color={theme.text.inverse} />}
          />
        )}
      </Column>
    </ErrorContainer>
  );
};

// Specific error state components
export const NetworkErrorState: React.FC<Omit<ErrorStateProps, 'variant'>> = (props) => (
  <ErrorState variant="network" {...props} />
);

export const NotFoundErrorState: React.FC<Omit<ErrorStateProps, 'variant'>> = (props) => (
  <ErrorState variant="notFound" {...props} />
);

export const PermissionErrorState: React.FC<Omit<ErrorStateProps, 'variant'>> = (props) => (
  <ErrorState variant="permission" {...props} />
);

export const ServerErrorState: React.FC<Omit<ErrorStateProps, 'variant'>> = (props) => (
  <ErrorState variant="server" {...props} />
);

export default ErrorState;
