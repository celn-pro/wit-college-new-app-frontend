import { useColorScheme } from 'react-native';

export const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#007AFF',
  secondary: '#5856D6',
  cardBackground: '#F5F5F5',
  border: '#E0E0E0', // Added border property
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
  border: '#3A3A3C', // Added border property
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
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
};