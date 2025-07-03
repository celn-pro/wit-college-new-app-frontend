import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  FlatListProps,
  RefreshControl,
  ListRenderItem,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { LoadingSpinner } from './LoadingSpinner';
import { Typography } from './Typography';
import { Center } from '../layout';

export interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  loadingComponent?: React.ComponentType<any> | React.ReactElement | null;
  contentPadding?: boolean;
  keyExtractor?: (item: T, index: number) => string;
  estimatedItemSize?: number;
}

export function OptimizedFlatList<T>({
  data,
  renderItem,
  loading = false,
  refreshing = false,
  onRefresh,
  emptyTitle = 'No items found',
  emptyDescription = 'There are no items to display at the moment.',
  emptyComponent,
  loadingComponent,
  contentPadding = true,
  keyExtractor,
  estimatedItemSize = 100,
  style,
  contentContainerStyle,
  ...props
}: OptimizedFlatListProps<T>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Optimized render item with useCallback
  const optimizedRenderItem = useCallback<ListRenderItem<T>>(
    (info) => renderItem(info),
    [renderItem]
  );

  // Memoized empty component
  const EmptyComponent = useMemo((): React.ComponentType<any> | React.ReactElement | null => {
    if (loading && loadingComponent) {
      return loadingComponent;
    }

    if (loading) {
      return (
        <Center flex={1} paddingVertical="xl">
          <LoadingSpinner size="large" />
        </Center>
      );
    }

    if (emptyComponent) {
      return emptyComponent;
    }

    return (
      <Center flex={1} paddingHorizontal="lg" paddingVertical="xl">
        <Typography
          variant="h4"
          color="secondary"
          align="center"
          style={{ marginBottom: theme.spacing.sm }}
        >
          {emptyTitle}
        </Typography>
        <Typography
          variant="body2"
          color="tertiary"
          align="center"
        >
          {emptyDescription}
        </Typography>
      </Center>
    );
  }, [loading, loadingComponent, emptyComponent, emptyTitle, emptyDescription, theme.spacing.sm]);

  // Memoized refresh control with safety checks
  const refreshControl = useMemo(() => {
    if (!onRefresh || typeof onRefresh !== 'function') return undefined;

    return (
      <RefreshControl
        refreshing={Boolean(refreshing)}
        onRefresh={onRefresh}
        colors={[theme.primary]}
        tintColor={theme.primary}
        progressBackgroundColor={theme.cardBackground}
      />
    );
  }, [refreshing, onRefresh, theme.primary, theme.cardBackground]);

  // Memoized content container style
  const memoizedContentContainerStyle = useMemo(() => {
    const baseStyle: ViewStyle = {
      flexGrow: 1,
    };

    if (contentPadding) {
      baseStyle.paddingBottom = Math.max(insets.bottom, theme.spacing.lg);
      baseStyle.paddingHorizontal = theme.spacing.md;
    }

    return [baseStyle, contentContainerStyle];
  }, [contentPadding, insets.bottom, theme.spacing.lg, theme.spacing.md, contentContainerStyle]);

  // Performance optimizations
  const getItemLayout = useCallback(
    (data: ArrayLike<T> | null | undefined, index: number) => {
      if (!data || index < 0 || index >= data.length) {
        return { length: 0, offset: 0, index };
      }
      return {
        length: estimatedItemSize,
        offset: estimatedItemSize * index,
        index,
      };
    },
    [estimatedItemSize]
  );

  // Ensure data is always an array to prevent getScrollableNode errors
  const safeData = Array.isArray(data) ? data : [];

  // Safe keyExtractor with fallback
  const safeKeyExtractor = useCallback((item: T, index: number) => {
    if (keyExtractor && typeof keyExtractor === 'function') {
      try {
        return keyExtractor(item, index);
      } catch (error) {
        console.warn('KeyExtractor error:', error);
        return `fallback-${index}`;
      }
    }
    return `item-${index}`;
  }, [keyExtractor]);

  return (
    <FlatList
      data={safeData}
      renderItem={optimizedRenderItem}
      keyExtractor={safeKeyExtractor}
      style={[{ backgroundColor: theme.background }, style]}
      contentContainerStyle={memoizedContentContainerStyle}
      ListEmptyComponent={EmptyComponent}
      refreshControl={refreshControl}

      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      initialNumToRender={10}
      windowSize={10}
      getItemLayout={estimatedItemSize && safeData.length > 0 ? getItemLayout : undefined}

      // Scroll optimizations
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"

      {...props}
    />
  );
}

export default OptimizedFlatList;
