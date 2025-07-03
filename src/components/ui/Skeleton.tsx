import React from 'react';
import { ViewStyle } from 'react-native';
import styled from '@emotion/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
}

const SkeletonContainer = styled(Animated.View)<{
  width: number | string;
  height: number | string;
  borderRadius: number;
}>`
  width: ${(props) => typeof props.width === 'number' ? `${props.width}px` : props.width};
  height: ${(props) => typeof props.height === 'number' ? `${props.height}px` : props.height};
  border-radius: ${(props) => props.borderRadius}px;
  background-color: ${(props) => props.theme.cardBackground};
  overflow: hidden;
`;

const ShimmerOverlay = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(props) => props.theme.background};
  opacity: 0.3;
`;

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius,
  style,
  animated = true,
}) => {
  const theme = useTheme();
  const shimmerValue = useSharedValue(0);
  
  const defaultBorderRadius = borderRadius ?? theme.borderRadius.sm;

  React.useEffect(() => {
    if (animated) {
      shimmerValue.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
    }
  }, [animated, shimmerValue]);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-100, 100]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <SkeletonContainer
      width={width}
      height={height}
      borderRadius={defaultBorderRadius}
      style={style}
    >
      {animated && <ShimmerOverlay style={shimmerStyle} />}
    </SkeletonContainer>
  );
};

// Skeleton variants for common use cases
export const SkeletonText: React.FC<{
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  lastLineWidth?: string;
}> = ({
  lines = 1,
  lineHeight = 16,
  spacing = 8,
  lastLineWidth = '60%',
}) => {
  const theme = useTheme();
  
  return (
    <>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          borderRadius={theme.borderRadius.sm}
          style={{ marginBottom: index < lines - 1 ? spacing : 0 }}
        />
      ))}
    </>
  );
};

export const SkeletonCircle: React.FC<{
  size: number;
  style?: ViewStyle;
}> = ({ size, style }) => (
  <Skeleton
    width={size}
    height={size}
    borderRadius={size / 2}
    style={style}
  />
);

export const SkeletonCard: React.FC<{
  imageHeight?: number;
  showImage?: boolean;
  showAvatar?: boolean;
  textLines?: number;
}> = ({
  imageHeight = 200,
  showImage = true,
  showAvatar = false,
  textLines = 3,
}) => {
  const theme = useTheme();
  
  return (
    <SkeletonContainer
      width="100%"
      height="auto"
      borderRadius={theme.borderRadius.lg}
      style={{ padding: theme.spacing.md }}
    >
      {showImage && (
        <Skeleton
          height={imageHeight}
          borderRadius={theme.borderRadius.md}
          style={{ marginBottom: theme.spacing.md }}
        />
      )}
      
      {showAvatar && (
        <SkeletonContainer
          width="100%"
          height="auto"
          borderRadius={0}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
            backgroundColor: 'transparent',
          }}
        >
          <SkeletonCircle
            size={40}
            style={{ marginRight: theme.spacing.sm }}
          />
          <SkeletonContainer
            width="100%"
            height="auto"
            borderRadius={0}
            style={{ flex: 1, backgroundColor: 'transparent' }}
          >
            <Skeleton
              height={16}
              width="40%"
              style={{ marginBottom: theme.spacing.xs }}
            />
            <Skeleton height={12} width="60%" />
          </SkeletonContainer>
        </SkeletonContainer>
      )}
      
      <SkeletonText lines={textLines} />
    </SkeletonContainer>
  );
};

export const SkeletonNewsCard: React.FC = () => {
  const theme = useTheme();
  
  return (
    <SkeletonContainer
      width="100%"
      height="auto"
      borderRadius={theme.borderRadius.lg}
      style={{
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
      }}
    >
      <SkeletonContainer
        width="100%"
        height="auto"
        borderRadius={0}
        style={{ flexDirection: 'row', backgroundColor: 'transparent' }}
      >
        <Skeleton
          width={100}
          height={100}
          borderRadius={theme.borderRadius.md}
          style={{ marginRight: theme.spacing.md }}
        />
        <SkeletonContainer
          width="100%"
          height="auto"
          borderRadius={0}
          style={{ flex: 1, backgroundColor: 'transparent' }}
        >
          <Skeleton
            height={8}
            width="30%"
            style={{ marginBottom: theme.spacing.sm }}
          />
          <SkeletonText
            lines={2}
            lineHeight={18}
            spacing={theme.spacing.xs}
            lastLineWidth="80%"
          />
          <Skeleton
            height={12}
            width="50%"
            style={{ marginTop: theme.spacing.sm }}
          />
        </SkeletonContainer>
      </SkeletonContainer>
    </SkeletonContainer>
  );
};

export const SkeletonList: React.FC<{
  count?: number;
  itemHeight?: number;
  spacing?: number;
}> = ({
  count = 5,
  itemHeight = 80,
  spacing = 16,
}) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <Skeleton
        key={index}
        height={itemHeight}
        style={{ marginBottom: index < count - 1 ? spacing : 0 }}
      />
    ))}
  </>
);

export default Skeleton;
