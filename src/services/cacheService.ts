import AsyncStorage from '@react-native-async-storage/async-storage';
import { News } from '../store/index';

// Cache keys
const KEYS = {
  NEWS: 'news_cache',
  LAST_FETCHED: 'last_fetched',
  ARCHIVED_IDS: 'archived_news_ids',
  NOTIFICATIONS: 'notifications',
  USER: 'user',
  AUTH_TOKEN: 'authToken',
  THEME_MODE: 'themeMode',
};

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const cacheService = {
  /**
   * Get cached news data
   * @returns News array or null if not found/expired
   */
  async getNewsCache(): Promise<{ news: News[]; archivedIds: string[] } | null> {
    try {
      const [cachedNews, cachedArchivedIds, lastFetched] = await AsyncStorage.multiGet([
        KEYS.NEWS,
        KEYS.ARCHIVED_IDS,
        KEYS.LAST_FETCHED,
      ]);

      if (cachedNews[1] && cachedArchivedIds[1] && lastFetched[1]) {
        const lastFetchedTime = parseInt(lastFetched[1], 10);
        if (Date.now() - lastFetchedTime < CACHE_DURATION) {
          return {
            news: JSON.parse(cachedNews[1]),
            archivedIds: JSON.parse(cachedArchivedIds[1]),
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting news cache:', error);
      return null;
    }
  },

  /**
   * Set news cache with news data and archived IDs
   * @param news News array
   * @param archivedIds Array of archived news IDs
   */
  async setNewsCache(news: News[], archivedIds: string[]): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [KEYS.NEWS, JSON.stringify(news)],
        [KEYS.ARCHIVED_IDS, JSON.stringify(archivedIds)],
        [KEYS.LAST_FETCHED, Date.now().toString()],
      ]);
    } catch (error) {
      console.error('Error setting news cache:', error);
      throw new Error('Failed to save cache');
    }
  },

  /**
   * Clear all cache keys
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.NEWS,
        KEYS.LAST_FETCHED,
        KEYS.ARCHIVED_IDS,
        KEYS.NOTIFICATIONS,
        KEYS.USER,
        KEYS.AUTH_TOKEN,
        KEYS.THEME_MODE,
      ]);
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw new Error('Failed to clear cache');
    }
  },

  /**
   * Get cached user data
   * @returns User object or null
   */
  async getUser(): Promise<any | null> {
    try {
      const user = await AsyncStorage.getItem(KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user cache:', error);
      return null;
    }
  },

  /**
   * Set user data in cache
   * @param user User object
   */
  async setUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user cache:', error);
      throw new Error('Failed to save user');
    }
  },

  /**
   * Get auth token
   * @returns Token string or null
   */
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  /**
   * Set auth token
   * @param token Token string
   */
  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error setting auth token:', error);
      throw new Error('Failed to save auth token');
    }
  },

  /**
   * Get cached notifications
   * @returns Notifications array or null
   */
  async getNotifications(): Promise<any[] | null> {
    try {
      const notifications = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
      return notifications ? JSON.parse(notifications) : null;
    } catch (error) {
      console.error('Error getting notifications cache:', error);
      return null;
    }
  },

  /**
   * Set notifications in cache
   * @param notifications Notifications array
   */
  async setNotifications(notifications: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error setting notifications cache:', error);
      throw new Error('Failed to save notifications');
    }
  },

  /**
   * Get cached theme mode
   * @returns Theme mode string or null
   */
  async getThemeMode(): Promise<'system' | 'light' | 'dark' | null> {
    try {
      const themeMode = await AsyncStorage.getItem(KEYS.THEME_MODE);
      return themeMode && ['system', 'light', 'dark'].includes(themeMode)
        ? (themeMode as 'system' | 'light' | 'dark')
        : null;
    } catch (error) {
      console.error('Error getting theme mode:', error);
      return null;
    }
  },

  /**
   * Set theme mode in cache
   * @param themeMode Theme mode string
   */
  async setThemeMode(themeMode: 'system' | 'light' | 'dark'): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.THEME_MODE, themeMode);
    } catch (error) {
      console.error('Error setting theme mode:', error);
      throw new Error('Failed to save theme mode');
    }
  },

  /**
   * Check if cache is expired
   * @returns Boolean indicating if cache is expired
   */
  async isCacheExpired(): Promise<boolean> {
    try {
      const lastFetched = await AsyncStorage.getItem(KEYS.LAST_FETCHED);
      if (!lastFetched) return true;
      return Date.now() - parseInt(lastFetched, 10) >= CACHE_DURATION;
    } catch (error) {
      console.error('Error checking cache expiration:', error);
      return true;
    }
  },
};
