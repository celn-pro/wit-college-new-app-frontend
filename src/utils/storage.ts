import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  image: string;
  date: string;
}

const NEWS_KEY = '@news';

export const saveNews = async (news: NewsItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(NEWS_KEY, JSON.stringify(news));
  } catch (error) {
    console.error('Error saving news:', error);
  }
};

export const getNews = async (): Promise<NewsItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(NEWS_KEY);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting news:', error);
    return [];
  }
};