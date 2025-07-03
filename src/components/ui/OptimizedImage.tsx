import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Image,
  ImageProps,
  ImageStyle,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '../../theme';
import imageCacheService from '../../services/imageCache';
import performanceMonitor from '../../services/performanceMonitor';

export interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  placeholder?: React.ReactNode;
  errorComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  priority?: number; // 1-10, higher = more important
  lazy?: boolean;
  fadeInDuration?: number;
  retryCount?: number;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  style?: ImageStyle;
}

const Container = styled.View`
  position: relative;
  overflow: hidden;
`;

const StyledImage = styled(Image)<{ fadeInDuration: number }>`
  width: 100%;
  height: 100%;
`;

const LoadingContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.background};
`;

const ErrorContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.cardBackground};
`;

const PlaceholderContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(props) => props.theme.cardBackground};
`;

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  source,
  placeholder,
  errorComponent,
  loadingComponent,
  priority = 5,
  lazy = false,
  fadeInDuration = 300,
  retryCount = 3,
  onLoadStart,
  onLoadEnd,
  onError,
  style,
  ...props
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retries, setRetries] = useState(0);
  const [imageSource, setImageSource] = useState<any>(null);
  const [shouldLoad, setShouldLoad] = useState(!lazy);

  // Handle image source
  const imageUri = typeof source === 'object' && 'uri' in source ? source.uri : null;

  // Load image with caching
  const loadImage = useCallback(async () => {
    if (!imageUri || !shouldLoad) return;

    setLoading(true);
    setError(false);
    onLoadStart?.();

    try {
      performanceMonitor.startTiming(`image_load_${imageUri}`, {
        uri: imageUri,
        priority,
      });

      // Check cache first
      const cached = await imageCacheService.getCachedImage(imageUri);
      if (cached) {
        setImageSource({ uri: `data:image/jpeg;base64,${cached}` });
        setLoading(false);
        onLoadEnd?.();
        performanceMonitor.endTiming(`image_load_${imageUri}`);
        return;
      }

      // Preload image
      await imageCacheService.preloadImage(imageUri);
      setImageSource({ uri: imageUri });
      setLoading(false);
      onLoadEnd?.();
      performanceMonitor.endTiming(`image_load_${imageUri}`);
    } catch (err) {
      console.error('Error loading image:', err);
      
      if (retries < retryCount) {
        setRetries(prev => prev + 1);
        setTimeout(() => loadImage(), 1000 * (retries + 1)); // Exponential backoff
      } else {
        setError(true);
        setLoading(false);
        onError?.(err);
        performanceMonitor.endTiming(`image_load_${imageUri}`);
      }
    }
  }, [imageUri, shouldLoad, retries, retryCount, priority, onLoadStart, onLoadEnd, onError]);

  // Load image when component mounts or dependencies change
  useEffect(() => {
    if (typeof source === 'number') {
      // Local image
      setImageSource(source);
      setLoading(false);
      return;
    }

    loadImage();
  }, [loadImage, source]);

  // Lazy loading intersection observer (simplified)
  useEffect(() => {
    if (lazy && !shouldLoad) {
      // In a real implementation, you'd use an intersection observer
      // For now, we'll just load after a short delay
      const timer = setTimeout(() => setShouldLoad(true), 100);
      return () => clearTimeout(timer);
    }
  }, [lazy, shouldLoad]);

  // Handle image load events
  const handleLoadStart = useCallback(() => {
    setLoading(true);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

  const handleError = useCallback((err: any) => {
    if (retries < retryCount) {
      setRetries(prev => prev + 1);
      setTimeout(() => loadImage(), 1000 * (retries + 1));
    } else {
      setError(true);
      setLoading(false);
      onError?.(err);
    }
  }, [retries, retryCount, loadImage, onError]);

  // Render loading state
  const renderLoading = () => {
    if (loadingComponent) {
      return loadingComponent;
    }

    return (
      <LoadingContainer>
        <ActivityIndicator size="small" color={theme.primary} />
      </LoadingContainer>
    );
  };

  // Render error state
  const renderError = () => {
    if (errorComponent) {
      return errorComponent;
    }

    return (
      <ErrorContainer>
        <View style={{
          width: 24,
          height: 24,
          backgroundColor: theme.text.tertiary,
          borderRadius: 4,
        }} />
      </ErrorContainer>
    );
  };

  // Render placeholder
  const renderPlaceholder = () => {
    if (placeholder) {
      return (
        <PlaceholderContainer>
          {placeholder}
        </PlaceholderContainer>
      );
    }

    return (
      <PlaceholderContainer style={{
        backgroundColor: theme.cardBackground,
      }} />
    );
  };

  return (
    <Container style={style}>
      {/* Placeholder */}
      {!imageSource && !error && renderPlaceholder()}
      
      {/* Main image */}
      {imageSource && !error && (
        <StyledImage
          {...props}
          source={imageSource}
          fadeInDuration={fadeInDuration}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          style={StyleSheet.absoluteFill}
        />
      )}
      
      {/* Loading overlay */}
      {loading && !error && renderLoading()}
      
      {/* Error state */}
      {error && renderError()}
    </Container>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
