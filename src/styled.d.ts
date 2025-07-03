import '@emotion/react';
import { Theme } from './theme';

declare module '@emotion/react' {
  export interface Theme {
    // Core colors
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

    // UI colors
    cardBackground: string;
    border: string;
    divider: string;
    placeholder: string;
    disabled: string;

    // Semantic colors
    success: string;
    warning: string;
    error: string;
    info: string;

    // College-specific colors
    college: {
      gold: string;
      crimson: string;
      forest: string;
      navy: string;
      purple: string;
    };

    // Modern gradients
    gradient: {
      primary: string[];
      header: string[];
      card: string[];
      accent: string[];
      hero: string[];
      news: string[];
    };

    // Design system
    typography: {
      fontFamily: {
        regular: string;
        medium: string;
        semiBold: string;
        bold: string;
      };
      fontSize: {
        xs: number;
        sm: number;
        base: number;
        lg: number;
        xl: number;
        '2xl': number;
        '3xl': number;
        '4xl': number;
      };
      lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
      };
      fontWeight: {
        normal: string;
        medium: string;
        semiBold: string;
        bold: string;
      };
    };
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
    };
    borderRadius: {
      none: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
      '4xl': number;
      elegant: number;
      full: number;
    };
    shadows: {
      sm: object;
      md: object;
      lg: object;
      xl: object;
    };

    // Legacy support
    secondary: string;
    font: any;
    getHeaderGradient: () => string[];
  }
}