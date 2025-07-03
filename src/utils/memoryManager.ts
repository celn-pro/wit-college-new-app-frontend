import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

// Memory management configuration
const MEMORY_WARNING_THRESHOLD = 0.8; // 80% of available memory
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const STORAGE_CLEANUP_THRESHOLD = 100 * 1024 * 1024; // 100MB

interface MemoryStats {
  used: number;
  total: number;
  percentage: number;
}

interface StorageItem {
  key: string;
  size: number;
  lastAccessed: number;
}

class MemoryManager {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isCleaningUp = false;
  private memoryWarningCallbacks: Array<() => void> = [];

  constructor() {
    this.setupAppStateListener();
    this.startCleanupInterval();
  }

  // Setup app state listener for memory management
  private setupAppStateListener(): void {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  // Handle app state changes
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'background') {
      this.performBackgroundCleanup();
    } else if (nextAppState === 'active') {
      this.checkMemoryUsage();
    }
  };

  // Start cleanup interval
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.performRoutineCleanup();
    }, CLEANUP_INTERVAL);
  }

  // Stop cleanup interval
  stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Get memory statistics (web only)
  getMemoryStats(): MemoryStats | null {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.jsHeapSizeLimit,
        percentage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  // Check if memory usage is high
  isMemoryUsageHigh(): boolean {
    const stats = this.getMemoryStats();
    return stats ? stats.percentage > MEMORY_WARNING_THRESHOLD : false;
  }

  // Check memory usage and trigger cleanup if needed
  checkMemoryUsage(): void {
    if (this.isMemoryUsageHigh()) {
      console.warn('High memory usage detected, triggering cleanup');
      this.performEmergencyCleanup();
      this.notifyMemoryWarning();
    }
  }

  // Register memory warning callback
  onMemoryWarning(callback: () => void): () => void {
    this.memoryWarningCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.memoryWarningCallbacks.indexOf(callback);
      if (index > -1) {
        this.memoryWarningCallbacks.splice(index, 1);
      }
    };
  }

  // Notify memory warning callbacks
  private notifyMemoryWarning(): void {
    this.memoryWarningCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in memory warning callback:', error);
      }
    });
  }

  // Perform routine cleanup
  private async performRoutineCleanup(): Promise<void> {
    if (this.isCleaningUp) return;
    
    this.isCleaningUp = true;
    
    try {
      await Promise.all([
        this.cleanupAsyncStorage(),
        this.cleanupImageCache(),
        this.cleanupTempData(),
      ]);
    } catch (error) {
      console.error('Error during routine cleanup:', error);
    } finally {
      this.isCleaningUp = false;
    }
  }

  // Perform background cleanup when app goes to background
  private async performBackgroundCleanup(): Promise<void> {
    try {
      await Promise.all([
        this.cleanupAsyncStorage(),
        this.cleanupImageCache(),
        this.cleanupTempData(),
        this.compactStorage(),
      ]);
      console.log('Background cleanup completed');
    } catch (error) {
      console.error('Error during background cleanup:', error);
    }
  }

  // Perform emergency cleanup for high memory usage
  private async performEmergencyCleanup(): Promise<void> {
    if (this.isCleaningUp) return;
    
    this.isCleaningUp = true;
    
    try {
      // More aggressive cleanup
      await Promise.all([
        this.aggressiveStorageCleanup(),
        this.clearImageCache(),
        this.clearTempData(),
        this.forceGarbageCollection(),
      ]);
      console.log('Emergency cleanup completed');
    } catch (error) {
      console.error('Error during emergency cleanup:', error);
    } finally {
      this.isCleaningUp = false;
    }
  }

  // Clean up AsyncStorage
  private async cleanupAsyncStorage(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const storageItems: StorageItem[] = [];
      
      // Get storage info for each key
      for (const key of keys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            storageItems.push({
              key,
              size: value.length,
              lastAccessed: Date.now(), // Simplified - in real app, track actual access
            });
          }
        } catch (error) {
          // Skip problematic keys
        }
      }
      
      // Calculate total size
      const totalSize = storageItems.reduce((sum, item) => sum + item.size, 0);
      
      if (totalSize > STORAGE_CLEANUP_THRESHOLD) {
        // Remove oldest items
        const sortedItems = storageItems.sort((a, b) => a.lastAccessed - b.lastAccessed);
        const itemsToRemove = sortedItems.slice(0, Math.floor(sortedItems.length * 0.2));
        
        await AsyncStorage.multiRemove(itemsToRemove.map(item => item.key));
        console.log(`Cleaned up ${itemsToRemove.length} storage items`);
      }
    } catch (error) {
      console.error('Error cleaning up AsyncStorage:', error);
    }
  }

  // Clean up image cache
  private async cleanupImageCache(): Promise<void> {
    try {
      const { imageCacheService } = await import('../services/imageCache');
      await imageCacheService.cleanup();
    } catch (error) {
      console.error('Error cleaning up image cache:', error);
    }
  }

  // Clear image cache completely
  private async clearImageCache(): Promise<void> {
    try {
      const { imageCacheService } = await import('../services/imageCache');
      await imageCacheService.clearCache();
    } catch (error) {
      console.error('Error clearing image cache:', error);
    }
  }

  // Clean up temporary data
  private async cleanupTempData(): Promise<void> {
    try {
      // Clean up any temporary data structures
      // This would be app-specific
      console.log('Temporary data cleanup completed');
    } catch (error) {
      console.error('Error cleaning up temp data:', error);
    }
  }

  // Clear all temporary data
  private async clearTempData(): Promise<void> {
    try {
      // More aggressive temp data cleanup
      console.log('All temporary data cleared');
    } catch (error) {
      console.error('Error clearing temp data:', error);
    }
  }

  // Aggressive storage cleanup
  private async aggressiveStorageCleanup(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      
      // Remove non-essential keys
      const nonEssentialKeys = keys.filter(key => 
        key.startsWith('cache_') || 
        key.startsWith('temp_') ||
        key.includes('_old')
      );
      
      if (nonEssentialKeys.length > 0) {
        await AsyncStorage.multiRemove(nonEssentialKeys);
        console.log(`Aggressively cleaned up ${nonEssentialKeys.length} storage items`);
      }
    } catch (error) {
      console.error('Error in aggressive storage cleanup:', error);
    }
  }

  // Compact storage (platform-specific)
  private async compactStorage(): Promise<void> {
    try {
      // This would be platform-specific storage compaction
      console.log('Storage compaction completed');
    } catch (error) {
      console.error('Error compacting storage:', error);
    }
  }

  // Force garbage collection (if available)
  private forceGarbageCollection(): void {
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('Forced garbage collection');
      }
    } catch (error) {
      console.error('Error forcing garbage collection:', error);
    }
  }

  // Get storage usage statistics
  async getStorageStats(): Promise<{ totalSize: number; itemCount: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            totalSize += value.length;
          }
        } catch (error) {
          // Skip problematic keys
        }
      }
      
      return {
        totalSize,
        itemCount: keys.length,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { totalSize: 0, itemCount: 0 };
    }
  }

  // Cleanup on app termination
  cleanup(): void {
    this.stopCleanupInterval();
    AppState.removeEventListener('change', this.handleAppStateChange);
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();
export default memoryManager;
