import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from '@emotion/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { useAppStore } from './src/store';
import { useTheme } from './src/theme';
import Navigation from './src/navigation';
import { cacheService } from './src/services/cacheService';
import { notificationService } from './src/services/notificationService';
import { socketService } from './src/services/socketService';
import Toast from 'react-native-toast-message';
import SplashScreen from './src/screens/SplashScreen';

enableScreens();

const App = () => {
  const { user, token, setToken, setNotifications, setUser, setThemeMode } = useAppStore();
  const theme = useTheme();
  const [showSplash, setShowSplash] = useState(true);

   useEffect(() => {
    // Hide splash after 2 seconds (or after initialization)
    if (showSplash) {
      const timer = setTimeout(() => setShowSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Initialize app state
  useEffect(() => {
    const initialize = async () => {
      try {
        await notificationService.initialize();

        const [storedToken, userData, notifications, themeMode] = await Promise.all([
          cacheService.getAuthToken(),
          cacheService.getUser(),
          cacheService.getNotifications(),
          cacheService.getThemeMode(),
        ]);

        if (storedToken) setToken(storedToken);
        if (userData) setUser(userData);
        if (notifications) setNotifications(notifications || []);

        // Initialize theme: use cached theme or detect from system
        if (themeMode && (themeMode === 'light' || themeMode === 'dark')) {
          setThemeMode(themeMode);
        } else {
          // Use system theme to initialize app theme
          const systemTheme = colorScheme || 'light';
          setThemeMode(systemTheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Initialization error:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to initialize app',
        });
      }
    };

    initialize();
  }, [setToken, setUser, setNotifications, setThemeMode]);

  // Handle socket connections and notifications
  useEffect(() => {
    if (!user || !token) {
      socketService.disconnect();
      return;
    }

    socketService.initialize(user._id, token);

    const fetchNotifications = async () => {
      try {
        const data = await notificationService.fetchNotifications(token);
        const notificationsWithRead = data.map((n: any) => ({
          _id: n._id,
          title: n.title,
          body: n.body,
          read: typeof n.read === 'boolean' ? n.read : false,
          createdAt: n.createdAt,
        }));
        setNotifications(notificationsWithRead);
        await cacheService.setNotifications(notificationsWithRead);
      } catch (error) {
        // Error handled in notificationService
      }
    };

    fetchNotifications();

    return () => {
      socketService.disconnect();
    };
  }, [user?._id, token, setNotifications]);

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <StatusBar
          barStyle={theme.text.primary === '#FFFFFF' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        {showSplash ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : (
          <>
            <Navigation />
            <Toast />
          </>
        )}
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;