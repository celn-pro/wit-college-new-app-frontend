import React, { useEffect } from 'react';
import { StatusBar, Platform, AppState } from 'react-native';
import { ThemeProvider } from '@emotion/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { useTheme } from './src/theme';
import Navigation from './src/navigation';
import { useAppStore } from './src/store';
import io from 'socket.io-client';

enableScreens();
const BASE_URL = 'http://10.0.2.2:5000';

// Create a notification channel for Android
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
  const theme = useTheme();
  const { user, token, setToken, addNotification, setNotifications } = useAppStore();

  useEffect(() => {
    // Create notification channel on app start
    createNotificationChannel();
    
    // Load token and notifications from AsyncStorage
    const initialize = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setToken(token);
      }
      
      const storedNotifications = await AsyncStorage.getItem('notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    };
    initialize();

    // Request notification permissions on iOS
    const requestPermissions = async () => {
      if (Platform.OS === 'ios') {
        await notifee.requestPermission();
      }
    };
    requestPermissions();

    // Initialize Socket.IO
    const socket = io(BASE_URL, { transports: ['websocket'] });
    
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      if (user?._id) {
        socket.emit('join', user._id);
      }
    });
    
    socket.on('notification', (notification: any) => {
      if (notification.userId === user?._id) {
        addNotification(notification);
        
        // Display the notification if app is not in foreground on iOS or always on Android
        if (Platform.OS !== 'ios' || AppState.currentState === 'active') {
          displayNotification(notification);
        }
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    // Fetch notifications on app start
    const fetchNotifications = async () => {
      if (!token || !user) return;
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

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [user, token, setToken, addNotification, setNotifications]);

  // Function to display a notification
  const displayNotification = async (notification:any) => {
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