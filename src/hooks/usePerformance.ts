import React, { useEffect, useCallback, useRef, useMemo } from 'react';
import { InteractionManager } from 'react-native';
import performanceMonitor from '../services/performanceMonitor';
import memoryManager from '../utils/memoryManager';

// Performance hook for components
export const usePerformance = (componentName: string) => {
  const mountTimeRef = useRef<number>(Date.now());
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    // Track component mount
    performanceMonitor.startTiming(`mount_${componentName}`);
    
    // End timing when interactions are complete
    InteractionManager.runAfterInteractions(() => {
      performanceMonitor.endTiming(`mount_${componentName}`);
    });

    return () => {
      // Track component unmount
      const mountDuration = Date.now() - mountTimeRef.current;
      if (mountDuration > 10000) { // Component was mounted for more than 10 seconds
        console.log(`Component ${componentName} was mounted for ${mountDuration}ms with ${renderCountRef.current} renders`);
      }
    };
  }, [componentName]);

  // Track renders
  useEffect(() => {
    renderCountRef.current += 1;
  });

  // Memoized performance utilities
  const measureAsync = useCallback(
    <T>(name: string, fn: () => Promise<T>) => 
      performanceMonitor.measureAsync(`${componentName}_${name}`, fn),
    [componentName]
  );

  const measure = useCallback(
    <T>(name: string, fn: () => T) => 
      performanceMonitor.measure(`${componentName}_${name}`, fn),
    [componentName]
  );

  return {
    measureAsync,
    measure,
    renderCount: renderCountRef.current,
  };
};

// Memory monitoring hook
export const useMemoryMonitor = () => {
  const memoryWarningRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Register memory warning callback
    const unsubscribe = memoryManager.onMemoryWarning(() => {
      console.warn('Memory warning triggered in component');
    });

    memoryWarningRef.current = unsubscribe;

    return () => {
      if (memoryWarningRef.current) {
        memoryWarningRef.current();
      }
    };
  }, []);

  const getMemoryStats = useCallback(() => {
    return memoryManager.getMemoryStats();
  }, []);

  const isMemoryHigh = useCallback(() => {
    return memoryManager.isMemoryUsageHigh();
  }, []);

  return {
    getMemoryStats,
    isMemoryHigh,
  };
};

// Debounced callback hook
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useMemo(
    () =>
      ((...args: Parameters<T>) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
        }, delay);
      }) as T,
    [delay]
  );
};

// Throttled callback hook
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T => {
  const callbackRef = useRef(callback);
  const lastCallRef = useRef<number>(0);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useMemo(
    () =>
      ((...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastCallRef.current >= limit) {
          lastCallRef.current = now;
          callbackRef.current(...args);
        }
      }) as T,
    [limit]
  );
};

// Lazy loading hook
export const useLazyLoad = <T>(
  loader: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const loaderRef = useRef<(() => Promise<T>) | null>(null);

  // Create lazy loader
  useEffect(() => {
    loaderRef.current = performanceMonitor.createLazyLoader(loader);
  }, dependencies);

  const load = useCallback(async () => {
    if (!loaderRef.current || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await loaderRef.current();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return {
    data,
    loading,
    error,
    load,
  };
};

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (
  callback: () => void,
  options: {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
  } = {}
) => {
  const elementRef = useRef<any>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggeredRef = useRef(false);

  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!hasTriggeredRef.current || !triggerOnce) {
              callback();
              hasTriggeredRef.current = true;
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, threshold, rootMargin, triggerOnce]);

  return elementRef;
};

// Batch updates hook
export const useBatchUpdates = <T>(
  items: T[],
  batchSize: number = 10
) => {
  const [processedItems, setProcessedItems] = React.useState<T[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const currentIndexRef = useRef(0);

  const processBatch = useCallback(async () => {
    if (isProcessing || currentIndexRef.current >= items.length) return;

    setIsProcessing(true);

    try {
      const batch = items.slice(
        currentIndexRef.current,
        currentIndexRef.current + batchSize
      );

      // Process batch after interactions
      await new Promise(resolve => {
        InteractionManager.runAfterInteractions(() => {
          setProcessedItems(prev => [...prev, ...batch]);
          currentIndexRef.current += batchSize;
          resolve(void 0);
        });
      });
    } finally {
      setIsProcessing(false);
    }
  }, [items, batchSize, isProcessing]);

  const reset = useCallback(() => {
    setProcessedItems([]);
    currentIndexRef.current = 0;
  }, []);

  useEffect(() => {
    reset();
  }, [items, reset]);

  return {
    processedItems,
    isProcessing,
    processBatch,
    reset,
    hasMore: currentIndexRef.current < items.length,
  };
};
