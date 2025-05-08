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
  id: string;
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
  theme: 'light' | 'dark';
  notifications: Notification[];
  allNews: News[];
  availableCategories: string[];
  token: string | null;
  archivedNewsIds: string[];
  setArchivedNewsIds: (ids: string[]) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  toggleTheme: () => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  getUnreadCount: () => number;
  setAllNews: (news: News[]) => void;
  toggleArchiveNews: (id: string) => void;
  createAdmin: (username: string) => void;
  addNews: (news: News) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  theme: 'light',
  notifications: [],
  allNews: [],
  availableCategories: ['General', 'Sports', 'Events', 'Academics'],
  token: null,
  archivedNewsIds: [],
  setArchivedNewsIds: (ids) => set({ archivedNewsIds: ids }),
  setUser: (user) => set({ user }),
  setToken: async (token) => {
    set({ token });
    if (token) {
      await AsyncStorage.setItem('authToken', token);
    } else {
      await AsyncStorage.removeItem('authToken');
    }
  },
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  addNotification: (notification) =>
    set((state) => ({ notifications: [...state.notifications, notification] })),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ),
    })),
  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
    })),
  getUnreadCount: () => get().notifications.filter((notif) => !notif.read).length,
  setAllNews: (news) => set({ allNews: news }),
  toggleArchiveNews: (id) =>
    set((state) => ({
      allNews: state.allNews.map((news) =>
        news._id === id ? { ...news } : news
      ),
    })),
  createAdmin: (username) => {
    console.log(`Creating admin with username: ${username}`);
  },
  addNews: (news) =>
    set((state) => ({
      allNews: [news, ...state.allNews],
    })),
}));