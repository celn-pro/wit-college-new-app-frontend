import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface User {
  _id: string;
  username: string;
  role: string;
  email: string;
  lastLogin: string;
  isAdmin: boolean;
}

interface Notification {
  _id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface News {
  _id: string;
  title: string;
  content: string;
  category: string;
  image?: string;
  role: string;
  createdBy: string;
  createdAt: string;
  likeCount: number;
  viewCount: number;
  likedBy: string[];
}

interface AppStore {
  user: User | null;
  themeMode: 'system' | 'light' | 'dark';
  notifications: Notification[];
  allNews: News[];
  lastUpdated: string | null;
  availableCategories: string[];
  token: string | null;
  archivedNewsIds: string[];
  setArchivedNewsIds: (ids: string[]) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setThemeMode: (themeMode: 'system' | 'light' | 'dark') => void;
  toggleTheme: () => void;
  addNotification: (notification: Notification) => void;
  setNotifications: (notifications: Notification[]) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  getUnreadCount: () => number;
  setAllNews: (news: News[]) => void;
  updateNewsItem: (news: News) => void;
  toggleArchiveNews: (id: string) => void;
  createAdmin: (username: string) => void;
  addNews: (news: News) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  themeMode: 'system',
  notifications: [],
  allNews: [],
  lastUpdated: null,
  availableCategories: ['General', 'Sports', 'Events', 'Academics'],
  token: null,
  archivedNewsIds: [],
  setArchivedNewsIds: (ids) => {
    set({ archivedNewsIds: ids });
    AsyncStorage.setItem('archived_news_ids', JSON.stringify(ids)).catch((error) =>
      console.error('Error saving archivedNewsIds:', error)
    );
  },
  setUser: async (user) => {
    set({ user });
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem('user');
    }
  },
  setToken: async (token) => {
    set({ token });
    if (token) {
      await AsyncStorage.setItem('authToken', token);
    } else {
      await AsyncStorage.removeItem('authToken');
    }
  },
  setThemeMode: async (themeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', themeMode);
      set({ themeMode });
    } catch (error) {
      console.error('Error saving themeMode to AsyncStorage:', error);
    }
  },
  getUnreadCount: () => {
    const notifications = Array.isArray(get().notifications) ? get().notifications : [];
    return notifications.filter((n) => !n.read).length;
  },
  toggleTheme: async () => {
    set((state) => {
      const modes: ('system' | 'light' | 'dark')[] = ['system', 'light', 'dark'];
      const currentIndex = modes.indexOf(state.themeMode);
      const newThemeMode = modes[(currentIndex + 1) % modes.length];
      AsyncStorage.setItem('themeMode', newThemeMode).catch((error) =>
        console.error('Error saving themeMode to AsyncStorage:', error)
      );
      return { themeMode: newThemeMode };
    });
  },
  addNotification: (notification) =>
    set((state) => {
      const updatedNotifications = [...state.notifications, notification];
      AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications)).catch((error) =>
        console.error('Error saving notifications:', error)
      );
      return { notifications: updatedNotifications };
    }),
  setNotifications: (notifications) => {
    AsyncStorage.setItem('notifications', JSON.stringify(notifications)).catch((error) =>
      console.error('Error saving notifications:', error)
    );
    set({ notifications });
  },
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif._id === id ? { ...notif, read: true } : notif
      ),
    })),
  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
    })),
  setAllNews: (news) => set({ allNews: news, lastUpdated: new Date().toISOString() }),
  updateNewsItem: (news) =>
    set((state) => ({
      allNews: state.allNews.map((item) => (item._id === news._id ? news : item)),
    })),
  toggleArchiveNews: (id) =>
    set((state) => ({
      archivedNewsIds: state.archivedNewsIds.includes(id)
        ? state.archivedNewsIds.filter((archivedId) => archivedId !== id)
        : [...state.archivedNewsIds, id],
    })),
  createAdmin: (username) => {
    console.log(`Creating admin with username: ${username}`);
  },
  addNews: (news) =>
    set((state) => ({
      allNews: [news, ...state.allNews],
    })),
}));