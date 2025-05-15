import React, { useEffect } from 'react';
import { StatusBar, Platform, AppState } from 'react-native';
import { ThemeProvider } from '@emotion/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { useAppStore } from './src/store';
import { useTheme } from './src/theme';
import Navigation from './src/navigation';
import io from 'socket.io-client';
import { BASE_URL } from './src/utils';

enableScreens();

async function createNotificationChannel() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
  }
}

const App = () => {
  const { user, token, setToken, addNotification, setNotifications, setUser, setThemeMode } = useAppStore();
  const theme = useTheme();

  // Initialize app state, including theme
  useEffect(() => {
    createNotificationChannel();

    if (Platform.OS === 'ios') {
      notifee.requestPermission();
    }

    const initialize = async () => {
      try {
        const [storedToken, userData, storedNotifications, storedThemeMode] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('notifications'),
          AsyncStorage.getItem('themeMode'),
        ]);

        if (storedToken) await setToken(storedToken);
        if (userData) await setUser(JSON.parse(userData));
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        }
        if (storedThemeMode && ['system', 'light', 'dark'].includes(storedThemeMode)) {
          setThemeMode(storedThemeMode as 'system' | 'light' | 'dark');
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initialize();
  }, []);

  // Handle socket connections and notifications
  useEffect(() => {
    if (!user || !token) return;

    const socket = io(BASE_URL, { transports: ['websocket'] });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      socket.emit('join', user._id);
    });

    socket.on('notification', (notification: any) => {
      if (notification.userId === user._id) {
        addNotification(notification);

        if (Platform.OS !== 'ios' || AppState.currentState === 'active') {
          displayNotification(notification);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    return () => {
      socket.disconnect();
    };
  }, [user?._id, token]);

  const displayNotification = async (notification: any) => {
    await notifee.displayNotification({
      title: notification.title,
      body: notification.body,
      android: {
        channelId: 'default',
        pressAction: {
          id: 'default',
        },
      },
      data: {
        newsId: notification.newsId,
      },
    });
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <StatusBar
          barStyle={theme.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <Navigation />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;