import axios from 'axios';
import { useAppStore } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils';

interface UserPreferences {
  archivedNewsIds: string[];
  // Add other preferences later if needed
}

interface NewsItem {
    _id: string;
    title: string;
    content: string;
    category: string;
    image?: string;
    createdAt: string;
    role?: string;
}

export const getArchivedNewsIds = async (userId: string): Promise<UserPreferences> => {
  try {
    const token = useAppStore.getState().token;

    const response = await axios.get(`${API_BASE_URL}/users/${userId}/preferences`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    console.log('Fetched user preferences:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user preferences:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });
    throw new Error(error.response?.data?.message || 'Failed to fetch user preferences');
  }
};

export const toggleArchiveNews = async (newsId: string): Promise<NewsItem> => {
    try {
      const token = useAppStore.getState().token;
      console.log('Toggling archive for newsId:', newsId, 'token:', token, 'url:', `${API_BASE_URL}/news/${newsId}/archive`);
  
      if (!newsId) {
        throw new Error('News ID is undefined');
      }
  
      const response = await axios.patch(
        `${API_BASE_URL}/news/${newsId}/archive`,
        {},
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );
  
      console.log('Archive toggle response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error toggling archive status:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
      throw new Error(error.response?.data?.message || 'Failed to toggle archive status');
    }
  };

export const updateUserPreferences = async (userId: string, preferences: Partial<UserPreferences>) => {  }

export const fetchUserProfile = async (userId: string) => {  }

export const updateUserRole = async (userId: string, role: string) => {  }
