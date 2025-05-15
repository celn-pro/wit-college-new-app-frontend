// services/fetchNewsWithCaching.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// import axios from '../utils/axiosInstance'; // your axios instance
// import { NewsItem } from '../types/news';    // define this type if not already
// import { setNews } from '../store/newsStore'; // update this as per your store

export const fetchNewsWithCaching = async () => {
  try {
    const localTimestamp = await AsyncStorage.getItem('news_last_updated');

    const res = await axios.get('/news');
    const { lastUpdated, news } = res.data;

    if (!lastUpdated) return;

    const isFresh = localTimestamp && new Date(lastUpdated) <= new Date(localTimestamp);

    if (!isFresh) {
      await AsyncStorage.setItem('news_last_updated', lastUpdated);
      setNews(news);
      console.log('[News] Updated with new data');
    } else {
      console.log('[News] Skipped fetching - data is up to date');
    }
  } catch (err) {
    console.error('[News] Failed to fetch:', err);
  }
};
