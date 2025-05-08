import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from '@emotion/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './src/theme';
import Navigation from './src/navigation';
import { useAppStore } from './src/store';

enableScreens();

const App = () => {
  const theme = useTheme();
  const { setToken, addNotification } = useAppStore();

  useEffect(() => {
    // Load token from AsyncStorage
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setToken(token);
      }
    };

    loadToken();

    // Simulate adding notifications on app start
    addNotification({
      id: '1',
      title: 'New Event',
      body: 'There is a new event on campus!',
      read: false,
      createdAt: new Date().toISOString(),
    });
    addNotification({
      id: '2',
      title: 'Deadline Reminder',
      body: 'Assignment due tomorrow!',
      read: false,
      createdAt: new Date().toISOString(),
    });
  }, [setToken, addNotification]);

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