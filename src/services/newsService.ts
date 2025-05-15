import axios from 'axios';
import { useAppStore } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  category: string;
  image?: string;
  createdAt: string;
  role?: string;
  updatedAt?: string;
}

export const toggleArchiveNews = async (newsId: string) => {
  const { token } = useAppStore.getState();
  try {
    const response = await axios.post(
      `${API_BASE_URL}/news/toggle-archive`,
      { newsId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error toggling archive:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to toggle archive');
  }
};

export const fetchUserPreferences = async () => {
  const { token, user } = useAppStore.getState();
  if (!user) throw new Error('User not logged in');
  try {
    const response = await axios.get(`${API_BASE_URL}/userpreferences/${user._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user preferences:', error.response?.data || error.message);
    return { archivedNewsIds: [] }; // Fallback to empty array
  }
};

export const fetchNews = async (
  role: string,
  category: string = '',
  query: string = '',
  since?: string
): Promise<NewsItem[]> => {
  try {
    const token = useAppStore.getState().token;
    console.log('Fetching news with role:', role, 'category:', category, 'query:', query, 'since:', since, 'token:', token);

    const headers = {
      Authorization: token ? `Bearer ${token}` : '',
    };

    const params: any = { role, category };
    if (since) {
      params.since = since;
    }

    if (query) {
      const response = await axios.get(`${API_BASE_URL}/news/search`, {
        headers,
        params: { q: query, role },
      });
      return response.data;
    }

    const response = await axios.get(`${API_BASE_URL}/news`, {
      headers,
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching news:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });
    throw error;
  }
};

export const fetchArchivedNews = async (role: string, since?: string): Promise<NewsItem[]> => {
  const { token } = useAppStore.getState();
  try {
    const params: any = { role };
    if (since) {
      params.since = since;
    }
    const response = await axios.get(`${API_BASE_URL}/news/archived`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching archived news:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch archived news');
  }
};

export const createNews = async (newsData: {
  title: string;
  content: string;
  category: string;
  image?: string;
  role: string;
}) => {
  const { token } = useAppStore.getState();
  try {
    const response = await axios.post(`${API_BASE_URL}/news`, newsData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error in createNews:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create news');
  }
};

export const addComment = async (newsId: string, content: string) => {
  const { token, user } = useAppStore.getState();
  if (!user) throw new Error('User not logged in');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/comments`,
      { newsId, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding comment:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to add comment');
  }
};

export const fetchComments = async (newsId: string) => {
  const { token } = useAppStore.getState();
  try {
    const response = await axios.get(`${API_BASE_URL}/comments/${newsId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching comments:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch comments');
  }
};

export const likeNews = async (newsId: string) => {
  const { token } = useAppStore.getState();
  try {
    const response = await axios.post(
      `${API_BASE_URL}/news/like`,
      { newsId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error liking news:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to like news');
  }
};

export const incrementViewCount = async (newsId: string, userId?: string) => {
  const { token } = useAppStore.getState();
  try {
    const response = await axios.post(
      `${API_BASE_URL}/news/view`,
      { newsId, userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error incrementing view count:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to increment view count');
  }
};

export const fetchNewsById = async (newsId: string) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch news item');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching news by ID:', error);
    throw new Error(error.message || 'Failed to fetch news item');
  }
};

export const updateNews = async (newsId: string, updates: { title: string; content: string; image?: string }) => {
  const { token } = useAppStore.getState();
  try {
    const response = await axios.put(
      `${API_BASE_URL}/news/${newsId}`,
      updates,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating news:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update news');
  }
};