import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';
import { BASE_URL } from '../utils';
// import { fetchCache } from './fetchCache';
import Toast from 'react-native-toast-message';
import { useAppStore } from '../store';
import { fetchCache } from '../utils/fetchCache';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  newsId?: string;
  createdAt: string;
  read: boolean;
}

export const notificationService = {
  /**
   * Initialize notification channel and permissions
   */
  async initialize(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });
      }
      if (Platform.OS === 'ios') {
        await notifee.requestPermission();
      }
    } catch (error) {
      console.error('Notification initialization error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to initialize notifications',
      });
    }
  },

  /**
   * Fetch notifications from API
   * @param token Auth token
   * @returns Array of notifications
   */
  async fetchNotifications(token: string): Promise<Notification[]> {
    const cacheKey = `notifications_${token}`;
    const cached = fetchCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data: Notification[] = await response.json();
      fetchCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load notifications',
      });
      throw error;
    }
  },

  /**
   * Display a notification
   * @param notification Notification data
   */
  async displayNotification(notification: Notification): Promise<void> {
    try {
      await notifee.displayNotification({
        title: notification.title,
        body: notification.body,
        android: {
          channelId: 'default',
          pressAction: { id: 'default' },
        },
        data: {
          newsId: notification.newsId || '',
        },
      });
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
  },
};