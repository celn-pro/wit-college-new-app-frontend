import { useColorScheme } from 'react-native';
import { useAppStore } from '../store';

// Modern college-focused color palette for news app
const colors = {
  // Primary brand colors - Vibrant College Blue
  primary: {
    50: '#EBF4FF',
    100: '#C3DAFE',
    200: '#A3BFFA',
    300: '#7C3AED',
    400: '#6366F1',
    500: '#4F46E5', // Main primary - Modern Indigo
    600: '#4338CA',
    700: '#3730A3',
    800: '#312E81',
    900: '#1E1B4B',
  },
  // Secondary accent - Energetic Orange
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // Main accent - Vibrant Orange
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  // Neutral grays - Warmer tones
  gray: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },
  // Semantic colors - College-friendly
  success: '#059669', // Forest Green
  warning: '#D97706', // Amber
  error: '#DC2626',   // Red
  info: '#0284C7',    // Sky Blue
  // Special college colors
  college: {
    gold: '#F59E0B',      // Academic Gold
    crimson: '#DC2626',   // University Crimson
    forest: '#059669',    // Campus Green
    navy: '#1E3A8A',      // Academic Navy
    purple: '#7C3AED',    // School Spirit Purple
  },
};

// Typography system
const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

// Spacing system (8pt grid)
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  // Standard page margins for consistent layout
  pageMargin: 20,  // Reasonable margin for all content
};

// Border radius system - Modern, elegant curves
const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,     // Extra large for cards
  '4xl': 40,     // Premium card styling
  elegant: 28,   // Perfect balance for forms
  full: 9999,
};

// Shadow system
const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
};

export const lightTheme = {
  // Core colors
  background: colors.gray[50],
  surface: '#FFFFFF',
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    tertiary: colors.gray[500],
    inverse: '#FFFFFF',
  },
  primary: colors.primary[500],
  primaryLight: colors.primary[100],
  primaryDark: colors.primary[700],

  // Accent colors for modern UI
  accent: colors.accent[500],
  accentLight: colors.accent[100],
  accentDark: colors.accent[700],

  // UI colors
  cardBackground: '#FFFFFF',
  border: colors.gray[200],
  divider: colors.gray[100],
  placeholder: colors.gray[400],
  disabled: colors.gray[300],

  // Semantic colors
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,

  // College-specific colors
  college: colors.college,

  // Modern gradients
  gradient: {
    primary: [colors.primary[400], colors.primary[600]],
    header: [colors.primary[500], colors.accent[500], colors.primary[700]],
    card: ['#FFFFFF', colors.gray[50]],
    accent: [colors.accent[400], colors.accent[600]],
    hero: [colors.primary[500], colors.accent[500]],
    news: [colors.primary[600], colors.college.navy],
  },

  // System integration
  typography,
  spacing,
  borderRadius,
  shadows,

  // Legacy support
  secondary: colors.primary[400],
  font: typography,

  getHeaderGradient: function () {
    return this.gradient.header;
  },
};

export const darkTheme = {
  // Core colors
  background: colors.gray[900],
  surface: colors.gray[800],
  text: {
    primary: '#FFFFFF',
    secondary: colors.gray[200], // Light gray for good contrast without being harsh
    tertiary: colors.gray[300],  // Medium gray for subtle elements
    inverse: '#FFFFFF', // White for dark theme (inverse of light theme's dark text)
  },
  primary: colors.primary[400],
  primaryLight: colors.primary[200],
  primaryDark: colors.primary[600],

  // Accent colors for modern UI
  accent: colors.accent[400],
  accentLight: colors.accent[200],
  accentDark: colors.accent[600],

  // UI colors
  cardBackground: colors.gray[800],
  border: colors.gray[700],
  divider: colors.gray[700],
  placeholder: colors.gray[500],
  disabled: colors.gray[600],

  // Semantic colors
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',

  // College-specific colors (adjusted for dark mode)
  college: {
    gold: '#FBBF24',
    crimson: '#F87171',
    forest: '#34D399',
    navy: '#60A5FA',
    purple: '#A78BFA',
  },

  // Modern gradients
  gradient: {
    primary: [colors.primary[400], colors.primary[600]],
    header: [colors.primary[400], colors.accent[400], colors.primary[600]],
    card: [colors.gray[800], colors.gray[700]],
    accent: [colors.accent[400], colors.accent[600]],
    hero: [colors.primary[400], colors.accent[400]],
    news: [colors.primary[500], colors.college.navy],
  },

  // System integration
  typography,
  spacing,
  borderRadius,
  shadows,

  // Legacy support
  secondary: colors.primary[300],
  font: typography,

  getHeaderGradient: function () {
    return this.gradient.header;
  },
};

// Theme type definitions
export type Theme = typeof lightTheme;

export type ThemeColors = {
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  cardBackground: string;
  border: string;
  divider: string;
  placeholder: string;
  disabled: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  college: {
    gold: string;
    crimson: string;
    forest: string;
    navy: string;
    purple: string;
  };
  gradient: {
    primary: string[];
    header: string[];
    card: string[];
    accent: string[];
    hero: string[];
    news: string[];
  };
};

export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;

export const useTheme = (): Theme => {
  const { themeMode } = useAppStore();

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return theme;
};

// Utility functions for theme usage
export const getThemeColor = (theme: Theme, colorPath: string): string => {
  const keys = colorPath.split('.');
  let value: any = theme;

  for (const key of keys) {
    value = value?.[key];
  }

  return typeof value === 'string' ? value : theme.text.primary;
};

export const getSpacing = (theme: Theme, size: keyof typeof spacing): number => {
  return theme.spacing[size];
};

export const getBorderRadius = (theme: Theme, size: keyof typeof borderRadius): number => {
  return theme.borderRadius[size];
};

export const getShadow = (theme: Theme, size: keyof typeof shadows) => {
  return theme.shadows[size];
};