import { InteractionManager, Platform } from 'react-native';

// Performance metrics interface
interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface MemoryInfo {
  jsHeapSizeLimit?: number;
  totalJSHeapSize?: number;
  usedJSHeapSize?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled = __DEV__; // Only enable in development
  private memoryWarningThreshold = 100 * 1024 * 1024; // 100MB

  constructor() {
    if (this.isEnabled) {
      this.setupMemoryWarning();
    }
  }

  // Start timing a performance metric
  startTiming(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      startTime: Date.now(),
      metadata,
    };

    this.metrics.set(name, metric);
  }

  // End timing a performance metric
  endTiming(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration}ms`, metric.metadata);
    }

    // Clean up completed metrics
    this.metrics.delete(name);

    return duration;
  }

  // Measure function execution time
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTiming(name, metadata);
    try {
      const result = await fn();
      return result;
    } finally {
      this.endTiming(name);
    }
  }

  // Measure synchronous function execution time
  measure<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.startTiming(name, metadata);
    try {
      const result = fn();
      return result;
    } finally {
      this.endTiming(name);
    }
  }

  // Measure component render time
  measureRender(componentName: string, renderFn: () => React.ReactElement): React.ReactElement {
    if (!this.isEnabled) return renderFn();

    this.startTiming(`render_${componentName}`);
    const result = renderFn();
    
    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(() => {
      this.endTiming(`render_${componentName}`);
    });

    return result;
  }

  // Measure navigation performance
  measureNavigation(screenName: string): void {
    if (!this.isEnabled) return;

    this.startTiming(`navigation_${screenName}`);
    
    // End timing when interactions are complete
    InteractionManager.runAfterInteractions(() => {
      this.endTiming(`navigation_${screenName}`);
    });
  }

  // Monitor memory usage
  getMemoryInfo(): MemoryInfo | null {
    if (!this.isEnabled) return null;

    // Web-specific memory info
    if (Platform.OS === 'web' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize: memory.usedJSHeapSize,
      };
    }

    return null;
  }

  // Check for memory warnings
  private setupMemoryWarning(): void {
    if (Platform.OS === 'web' && 'memory' in performance) {
      setInterval(() => {
        const memoryInfo = this.getMemoryInfo();
        if (memoryInfo && memoryInfo.usedJSHeapSize) {
          if (memoryInfo.usedJSHeapSize > this.memoryWarningThreshold) {
            console.warn('High memory usage detected:', {
              used: `${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
              limit: `${(memoryInfo.jsHeapSizeLimit! / 1024 / 1024).toFixed(2)}MB`,
            });
          }
        }
      }, 30000); // Check every 30 seconds
    }
  }

  // Log performance summary
  logSummary(): void {
    if (!this.isEnabled) return;

    const memoryInfo = this.getMemoryInfo();
    console.group('Performance Summary');
    
    if (memoryInfo) {
      console.log('Memory Usage:', {
        used: `${((memoryInfo.usedJSHeapSize || 0) / 1024 / 1024).toFixed(2)}MB`,
        total: `${((memoryInfo.totalJSHeapSize || 0) / 1024 / 1024).toFixed(2)}MB`,
        limit: `${((memoryInfo.jsHeapSizeLimit || 0) / 1024 / 1024).toFixed(2)}MB`,
      });
    }

    // Log any ongoing metrics
    if (this.metrics.size > 0) {
      console.log('Ongoing Operations:', Array.from(this.metrics.keys()));
    }

    console.groupEnd();
  }

  // Performance optimization utilities
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Batch operations for better performance
  static batchUpdates<T>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<void>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let index = 0;

      const processBatch = async () => {
        try {
          const batch = items.slice(index, index + batchSize);
          if (batch.length === 0) {
            resolve();
            return;
          }

          await processor(batch);
          index += batchSize;

          // Use setImmediate for better performance
          setImmediate(processBatch);
        } catch (error) {
          reject(error);
        }
      };

      processBatch();
    });
  }

  // Lazy loading utility
  static createLazyLoader<T>(
    loader: () => Promise<T>
  ): () => Promise<T> {
    let promise: Promise<T> | null = null;
    
    return () => {
      if (!promise) {
        promise = loader();
      }
      return promise;
    };
  }

  // Image preloading with priority
  static async preloadImagesWithPriority(
    images: { url: string; priority: number }[]
  ): Promise<void> {
    // Sort by priority (higher priority first)
    const sortedImages = images.sort((a, b) => b.priority - a.priority);
    
    // Load high priority images first
    const highPriority = sortedImages.filter(img => img.priority >= 5);
    const lowPriority = sortedImages.filter(img => img.priority < 5);
    
    // Load high priority images immediately
    await Promise.allSettled(
      highPriority.map(img => 
        import('../services/imageCache').then(({ imageCacheService }) =>
          imageCacheService.preloadImage(img.url)
        )
      )
    );
    
    // Load low priority images after interactions
    InteractionManager.runAfterInteractions(() => {
      Promise.allSettled(
        lowPriority.map(img =>
          import('../services/imageCache').then(({ imageCacheService }) =>
            imageCacheService.preloadImage(img.url)
          )
        )
      );
    });
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
