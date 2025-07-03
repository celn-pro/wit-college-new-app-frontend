import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Image cache configuration
const CACHE_KEY_PREFIX = 'image_cache_';
const CACHE_METADATA_KEY = 'image_cache_metadata';
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const CACHE_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheMetadata {
  [url: string]: {
    size: number;
    timestamp: number;
    lastAccessed: number;
  };
}

class ImageCacheService {
  private metadata: CacheMetadata = {};
  private totalCacheSize = 0;
  private lastCleanup = 0;

  constructor() {
    this.loadMetadata();
    this.scheduleCleanup();
  }

  // Load cache metadata from storage
  private async loadMetadata(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      if (stored) {
        this.metadata = JSON.parse(stored);
        this.calculateTotalSize();
      }
    } catch (error) {
      console.error('Error loading image cache metadata:', error);
    }
  }

  // Save cache metadata to storage
  private async saveMetadata(): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(this.metadata));
    } catch (error) {
      console.error('Error saving image cache metadata:', error);
    }
  }

  // Calculate total cache size
  private calculateTotalSize(): void {
    this.totalCacheSize = Object.values(this.metadata).reduce(
      (total, item) => total + item.size,
      0
    );
  }

  // Generate cache key for URL
  private getCacheKey(url: string): string {
    return `${CACHE_KEY_PREFIX}${encodeURIComponent(url)}`;
  }

  // Check if image is cached and valid
  async isCached(url: string): Promise<boolean> {
    try {
      const metadata = this.metadata[url];
      if (!metadata) return false;

      const isExpired = Date.now() - metadata.timestamp > MAX_CACHE_AGE;
      if (isExpired) {
        await this.removeFromCache(url);
        return false;
      }

      const cacheKey = this.getCacheKey(url);
      const cached = await AsyncStorage.getItem(cacheKey);
      return cached !== null;
    } catch (error) {
      console.error('Error checking cache:', error);
      return false;
    }
  }

  // Get cached image data
  async getCachedImage(url: string): Promise<string | null> {
    try {
      const cacheKey = this.getCacheKey(url);
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached && this.metadata[url]) {
        // Update last accessed time
        this.metadata[url].lastAccessed = Date.now();
        await this.saveMetadata();
      }
      
      return cached;
    } catch (error) {
      console.error('Error getting cached image:', error);
      return null;
    }
  }

  // Cache image data
  async cacheImage(url: string, base64Data: string): Promise<void> {
    try {
      const size = base64Data.length;
      
      // Check if we need to make space
      await this.ensureSpace(size);
      
      const cacheKey = this.getCacheKey(url);
      await AsyncStorage.setItem(cacheKey, base64Data);
      
      // Update metadata
      this.metadata[url] = {
        size,
        timestamp: Date.now(),
        lastAccessed: Date.now(),
      };
      
      this.totalCacheSize += size;
      await this.saveMetadata();
    } catch (error) {
      console.error('Error caching image:', error);
    }
  }

  // Remove image from cache
  async removeFromCache(url: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(url);
      await AsyncStorage.removeItem(cacheKey);
      
      if (this.metadata[url]) {
        this.totalCacheSize -= this.metadata[url].size;
        delete this.metadata[url];
        await this.saveMetadata();
      }
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  }

  // Ensure there's enough space for new cache entry
  private async ensureSpace(requiredSize: number): Promise<void> {
    if (this.totalCacheSize + requiredSize <= MAX_CACHE_SIZE) {
      return;
    }

    // Sort by last accessed time (oldest first)
    const sortedEntries = Object.entries(this.metadata).sort(
      ([, a], [, b]) => a.lastAccessed - b.lastAccessed
    );

    // Remove oldest entries until we have enough space
    for (const [url] of sortedEntries) {
      await this.removeFromCache(url);
      if (this.totalCacheSize + requiredSize <= MAX_CACHE_SIZE) {
        break;
      }
    }
  }

  // Clean up expired cache entries
  async cleanup(): Promise<void> {
    try {
      const now = Date.now();
      const expiredUrls: string[] = [];

      for (const [url, metadata] of Object.entries(this.metadata)) {
        if (now - metadata.timestamp > MAX_CACHE_AGE) {
          expiredUrls.push(url);
        }
      }

      for (const url of expiredUrls) {
        await this.removeFromCache(url);
      }

      this.lastCleanup = now;
      console.log(`Image cache cleanup: removed ${expiredUrls.length} expired entries`);
    } catch (error) {
      console.error('Error during cache cleanup:', error);
    }
  }

  // Schedule periodic cleanup
  private scheduleCleanup(): void {
    setInterval(() => {
      if (Date.now() - this.lastCleanup > CACHE_CLEANUP_INTERVAL) {
        this.cleanup();
      }
    }, CACHE_CLEANUP_INTERVAL);
  }

  // Clear entire cache
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
      
      await AsyncStorage.multiRemove([...cacheKeys, CACHE_METADATA_KEY]);
      
      this.metadata = {};
      this.totalCacheSize = 0;
      
      console.log('Image cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Get cache statistics
  getCacheStats(): { size: number; count: number; maxSize: number } {
    return {
      size: this.totalCacheSize,
      count: Object.keys(this.metadata).length,
      maxSize: MAX_CACHE_SIZE,
    };
  }

  // Preload image
  async preloadImage(url: string): Promise<void> {
    try {
      if (await this.isCached(url)) {
        return;
      }

      // Use React Native's Image.prefetch for better performance
      await Image.prefetch(url);
    } catch (error) {
      console.error('Error preloading image:', error);
    }
  }

  // Preload multiple images
  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.preloadImage(url));
    await Promise.allSettled(promises);
  }
}

// Export singleton instance
export const imageCacheService = new ImageCacheService();
export default imageCacheService;
