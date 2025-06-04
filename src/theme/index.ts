import { useColorScheme } from 'react-native';
import { useAppStore } from '../store';

export const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#007AFF',
  secondary: '#5856D6',
  cardBackground: '#F5F5F5',
  border: '#E0E0E0',
  placeholder: '#888',
  font: {
    regular: 'System',
    bold: 'System',
    size: {
      small: 12,
      medium: 14,
      large: 16,
      title: 18,
      header: 22,
    },
  },
};

export const darkTheme = {
  background: '#1C1C1E',
  text: '#FFFFFF',
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  cardBackground: '#2C2C2E',
  border: '#3A3A3C',
  placeholder: '#aaa',
  font: {
    regular: 'System',
    bold: 'System',
    size: {
      small: 12,
      medium: 14,
      large: 16,
      title: 18,
      header: 22,
    },
  },
};

export const useTheme = () => {
  const { themeMode } = useAppStore();
  const systemTheme = useColorScheme();
  if (themeMode === 'system') {
    return systemTheme === 'dark' ? darkTheme : lightTheme;
  }
  return themeMode === 'dark' ? darkTheme : lightTheme;
};