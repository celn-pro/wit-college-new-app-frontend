import axios from 'axios';
import { BASE_URL } from '../utils';
import { useAppStore } from '../store';
import { cacheService } from './cacheService';
import Toast from 'react-native-toast-message';
import { fetchCache } from '../utils/fetchCache';
import AsyncStorage from '@react-native-async-storage/async-storage';

// News item interface
export interface NewsItem {
  _id: string;
  title: string;
  content: string;
  category: string;
  image?: string;
  role: string;
  createdBy: string;
  createdAt: string;
  likeCount?: number;
  viewCount?: number;
  likedBy: string[];
  viewedBy?: string[]
}

// Comment interface
export interface Comment {
  _id: string;
  newsId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

// Debounce utility
const debounce = <T extends (...args: any[]) => Promise<any>>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  let resolveList: ((value: any) => void)[] = [];
  return (...args: Parameters<T>): Promise<ReturnType<T> extends Promise<infer R> ? R : never> => {
    if (timeout) clearTimeout(timeout);
    return new Promise((resolve) => {
      resolveList.push(resolve);
      timeout = setTimeout(async () => {
        const result = await func(...args);
        resolveList.forEach(r => r(result));
        resolveList = [];
      }, wait);
    });
  };
};

export const fetchNews = async (
  role: string,
  category: string = '',
  query: string = '',
  since?: string,
  includeArchived: boolean = false
): Promise<NewsItem[]> => {
  const cacheKey = `news_${role}_${category}_${query}_${since}_${includeArchived}`;
  const cached = fetchCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const { token } = useAppStore.getState();
  try {
    const params: any = { role, category, query };
    if (since) params.since = since;
    if (includeArchived) params.includeArchived = true;

    const response = await axios.get(`${BASE_URL}/api/news`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    const data = response.data;
    fetchCache.set(cacheKey, data);

    if (!category && !query && !since) {
      const newsCache = await cacheService.getNewsCache();
      await cacheService.setNewsCache(data, newsCache?.archivedIds || []);
    }

    return data;
  } catch (error: any) {
    console.error('Fetch news error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch news');
  }
};

export const debouncedFetchNews = debounce(fetchNews, 300);

export const createNews = async (newsData: {
  title: string;
  content: string;
  category: string;
  image?: string;
  role: string;
}): Promise<NewsItem> => {
  const { token } = useAppStore.getState();
  try {
    const response = await axios.post(`${BASE_URL}/api/news`, newsData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchCache.clear();
    return response.data;
  } catch (error: any) {
    console.error('Create news error:', error);
    throw new Error(error.response?.data?.message || 'Failed to create news');
  }
};

export const fetchNewsById = async (newsId: string): Promise<NewsItem> => {
  const cacheKey = `news_${newsId}`;
  const cached = fetchCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const { token } = useAppStore.getState();
  try {
    const response = await axios.get(`${BASE_URL}/api/news/${newsId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = response.data;
    fetchCache.set(cacheKey, data);
    return data;
  } catch (error: any) {
    console.error('Fetch news by ID error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch news');
  }
};

export const fetchComments = async (newsId: string): Promise<Comment[]> => {
  const cacheKey = `comments_${newsId}`;
  const cached = fetchCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const { token } = useAppStore.getState();
  try {
    const response = await axios.get(`${BASE_URL}/api/comments/${newsId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = response.data;
    fetchCache.set(cacheKey, data);
    return data;
  } catch (error: any) {
    console.error('Fetch comments error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch comments');
  }
};

export const addComment = async (newsId: string, content: string): Promise<Comment> => {
  const { token } = useAppStore.getState();
  try {
    const response = await axios.post(
      `${BASE_URL}/api/comments/`,
      { content, newsId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCache.clear();
    return response.data;
  } catch (error: any) {
    console.error('Add comment error:', error);
    throw new Error(error.response?.data?.message || 'Failed to add comment');
  }
};

export const likeNews = async (newsId: string): Promise<NewsItem> => {
  const { token } = useAppStore.getState();
  try {
    const response = await axios.post(
      `${BASE_URL}/api/news/like`,
      {newsId},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCache.clear();
    return response.data;
  } catch (error: any) {
    console.error('Like news error:', error);
    throw new Error(error.response?.data?.message || 'Failed to like news');
  }
};

export const incrementViewCount = async (newsId: string, userId?: string): Promise<NewsItem> => {
  if (!userId) {
    const news = await fetchNewsById(newsId);
    return news;
  }

  const viewedKey = `viewed_news_${userId}`;
  try {
    const viewedNews = await AsyncStorage.getItem(viewedKey);
    const viewedArray = viewedNews ? JSON.parse(viewedNews) : [];
    if (viewedArray.includes(newsId)) {
      const news = await fetchNewsById(newsId);
      return news;
    }

    const { token } = useAppStore.getState();
    const response = await axios.post(
      `${BASE_URL}/api/news/${newsId}/view`,
      { userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await AsyncStorage.setItem(viewedKey, JSON.stringify([...viewedArray, newsId]));
    fetchCache.clear();
    return response.data;
  } catch (error: any) {
    console.error('Increment view count error:', error);
    throw new Error(error.response?.data?.message || 'Failed to increment view count');
  }
};

export const toggleArchiveNews = async (newsId: string): Promise<{ archivedNewsIds: string[]; newsItem?: NewsItem }> => {
  const { token } = useAppStore.getState();
  try {
    const response = await axios.post(
      `${BASE_URL}/api/news/${newsId}/toggle-archive`,
      {newsId},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCache.clear();
    return response.data;
  } catch (error: any) {
    console.error('Toggle archive error:', error);
    throw new Error(error.response?.data?.message || 'Failed to toggle archive');
  }
};

export const updateNews = async (
  newsId: string,
  newsData: { title: string; content: string; image?: string }
): Promise<NewsItem> => {
  const { token } = useAppStore.getState();
  try {
    const response = await axios.put(`${BASE_URL}/api/news/${newsId}`, newsData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCache.clear();
    return response.data;
  } catch (error: any) {
    console.error('Update news error:', error);
    throw new Error(error.response?.data?.message || 'Failed to update news');
  }
};

export const deleteNews = async (newsId: string): Promise<void> => {
  const { token } = useAppStore.getState();
  try {
    await axios.delete(`${BASE_URL}/api/news/${newsId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCache.clear();
    const cached = await cacheService.getNewsCache();
    if (cached) {
      const updatedNews = cached.news.filter((n) => n._id !== newsId);
      await cacheService.setNewsCache(updatedNews, cached.archivedIds);
    }
  } catch (error: any) {
    console.error('Delete news error:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete news');
  }
};

export const uploadImage = async (uri: string, newsId: string): Promise<string> => {
  const { token } = useAppStore.getState();
  try {
    const formData = new FormData();
    formData.append('image', {
      uri,
      name: `news_${newsId}.jpg`,
      type: 'image/jpeg',
    } as any);
    
    const response = await axios.post(`${BASE_URL}/api/news/upload-image`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.data.imagePath) {
      throw new Error('Image upload failed');
    }
    
    return response.data.imagePath;
  } catch (error: any) {
    console.error('Upload image error:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload image');
  }
};

export const fetchUserPreferences = async (): Promise<{ selectedCategories: string[]; archivedNewsIds: string[] }> => {
  const { token, user } = useAppStore.getState();
  if (!user?._id || !token) {
    console.warn('No user or token available for preferences');
    return { selectedCategories: [], archivedNewsIds: [] };
  }

  const cacheKey = `user_preferences_${user._id}`;
  const cached = fetchCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/userpreferences/${user._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = response.data || { selectedCategories: [], archivedNewsIds: [] };
    fetchCache.set(cacheKey, data);
    return data;
  } catch (error: any) {
    console.error('Fetch preferences error:', error);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Failed to fetch preferences',
    });
    return { selectedCategories: [], archivedNewsIds: [] };
  }
};