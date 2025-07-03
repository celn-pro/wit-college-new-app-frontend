import React from 'react';
import { ViewStyle, ActivityIndicator } from 'react-native';
import styled from '@emotion/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Typography } from './Typography';
import { Container, Column } from '../layout';
import { Skeleton, SkeletonNewsCard, SkeletonList } from './Skeleton';

export interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'dots' | 'news' | 'list';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
  showMessage?: boolean;
  skeletonCount?: number;
}

const LoadingContainer = styled(Container)<{ fullScreen: boolean }>`
  ${(props) => props.fullScreen && `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props.theme.background};
    z-index: 1000;
  `}
  padding: ${(props) => props.theme.spacing.xl}px;
`;

const DotsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const Dot = styled(Animated.View)<{ size: number; color: string }>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: ${(props) => props.size / 2}px;
  background-color: ${(props) => props.color};
  margin: 0 4px;
`;

const PulseContainer = styled(Animated.View)<{ size: number; color: string }>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: ${(props) => props.size / 2}px;
  background-color: ${(props) => props.color};
`;

const LoadingDots: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  React.useEffect(() => {
    const duration = 600;
    const delay = 200;

    dot1.value = withRepeat(
      withTiming(1, { duration }),
      -1,
      true
    );

    setTimeout(() => {
      dot2.value = withRepeat(
        withTiming(1, { duration }),
        -1,
        true
      );
    }, delay);

    setTimeout(() => {
      dot3.value = withRepeat(
        withTiming(1, { duration }),
        -1,
        true
      );
    }, delay * 2);
  }, [dot1, dot2, dot3]);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot1.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot2.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot3.value, [0, 1], [0.8, 1.2]) }],
  }));

  return (
    <DotsContainer>
      <Dot size={size} color={color} style={dot1Style} />
      <Dot size={size} color={color} style={dot2Style} />
      <Dot size={size} color={color} style={dot3Style} />
    </DotsContainer>
  );
};

const PulseAnimation: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.8, 1.2]) }],
  }));

  return <PulseContainer size={size} color={color} style={pulseStyle} />;
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  variant = 'spinner',
  size = 'medium',
  color,
  style,
  fullScreen = false,
  showMessage = true,
  skeletonCount = 5,
}) => {
  const theme = useTheme();
  
  const sizeMap = {
    small: { spinner: 'small' as const, dots: 6, pulse: 24 },
    medium: { spinner: 'large' as const, dots: 8, pulse: 32 },
    large: { spinner: 'large' as const, dots: 10, pulse: 40 },
  };
  
  const finalColor = color || theme.primary;
  const sizeConfig = sizeMap[size];

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <Column align="center">
            <ActivityIndicator
              size={sizeConfig.spinner}
              color={finalColor}
              style={{ marginBottom: showMessage ? theme.spacing.md : 0 }}
            />
            {showMessage && (
              <Typography variant="body2" color="secondary" align="center">
                {message}
              </Typography>
            )}
          </Column>
        );

      case 'dots':
        return (
          <Column align="center">
            <LoadingDots
              size={sizeConfig.dots}
              color={finalColor}
            />
            {showMessage && (
              <Typography
                variant="body2"
                color="secondary"
                align="center"
                style={{ marginTop: theme.spacing.md }}
              >
                {message}
              </Typography>
            )}
          </Column>
        );

      case 'pulse':
        return (
          <Column align="center">
            <PulseAnimation
              size={sizeConfig.pulse}
              color={finalColor}
            />
            {showMessage && (
              <Typography
                variant="body2"
                color="secondary"
                align="center"
                style={{ marginTop: theme.spacing.md }}
              >
                {message}
              </Typography>
            )}
          </Column>
        );

      case 'news':
        return (
          <Column>
            {Array.from({ length: skeletonCount }, (_, index) => (
              <SkeletonNewsCard key={index} />
            ))}
          </Column>
        );

      case 'list':
        return (
          <Column>
            <SkeletonList count={skeletonCount} />
          </Column>
        );

      case 'skeleton':
        return (
          <Column>
            <Skeleton height={200} style={{ marginBottom: theme.spacing.lg }} />
            <Skeleton height={24} width="60%" style={{ marginBottom: theme.spacing.md }} />
            <Skeleton height={16} width="80%" style={{ marginBottom: theme.spacing.sm }} />
            <Skeleton height={16} width="70%" style={{ marginBottom: theme.spacing.sm }} />
            <Skeleton height={16} width="90%" />
          </Column>
        );

      default:
        return null;
    }
  };

  if (fullScreen) {
    return (
      <LoadingContainer
        fullScreen={fullScreen}
        flex={1}
        justify="center"
        align="center"
        style={style}
      >
        {renderLoader()}
      </LoadingContainer>
    );
  }

  return (
    <Container
      flex={1}
      justify="center"
      align="center"
      style={style}
    >
      {renderLoader()}
    </Container>
  );
};

// Convenience components
export const SpinnerLoader: React.FC<Omit<LoadingStateProps, 'variant'>> = (props) => (
  <LoadingState variant="spinner" {...props} />
);

export const DotsLoader: React.FC<Omit<LoadingStateProps, 'variant'>> = (props) => (
  <LoadingState variant="dots" {...props} />
);

export const PulseLoader: React.FC<Omit<LoadingStateProps, 'variant'>> = (props) => (
  <LoadingState variant="pulse" {...props} />
);

export const NewsSkeletonLoader: React.FC<Omit<LoadingStateProps, 'variant'>> = (props) => (
  <LoadingState variant="news" {...props} />
);

export const ListSkeletonLoader: React.FC<Omit<LoadingStateProps, 'variant'>> = (props) => (
  <LoadingState variant="list" {...props} />
);

export default LoadingState;
