import React from 'react';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../theme';

export interface AppIconProps {
  width?: number;
  height?: number;
  variant?: 'default' | 'monochrome' | 'outline';
  style?: any;
}

export const AppIcon: React.FC<AppIconProps> = ({ 
  width = 100, 
  height = 100, 
  variant = 'default',
  style 
}) => {
  const theme = useTheme();

  // Color schemes based on variant and theme
  const getColors = () => {
    switch (variant) {
      case 'monochrome':
        return {
          bulb: theme.text.primary,
          bulbBase: theme.text.secondary,
          news: theme.text.primary,
          lines: theme.border,
          notification: theme.accent,
          background: 'transparent',
        };
      case 'outline':
        return {
          bulb: 'transparent',
          bulbBase: theme.text.secondary,
          news: 'transparent',
          lines: theme.border,
          notification: theme.accent,
          background: 'transparent',
          stroke: theme.text.primary,
        };
      default:
        return {
          bulb: theme.college.gold,
          bulbBase: theme.text.secondary,
          news: theme.primary,
          lines: theme.border,
          notification: theme.accent,
          background: theme.surface,
        };
    }
  };

  const colors = getColors();

  return (
    <Svg 
      viewBox="0 0 512 512" 
      width={width} 
      height={height}
      style={style}
    >
      <Defs>
        {/* Modern gradient for light bulb */}
        <LinearGradient id="bulbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors.bulb} />
          <Stop offset="100%" stopColor={theme.college.gold} />
        </LinearGradient>
        
        {/* Gradient for news lines */}
        <LinearGradient id="newsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors.news} />
          <Stop offset="100%" stopColor={theme.primaryLight} />
        </LinearGradient>
        
        {/* Background gradient for default variant */}
        {variant === 'default' && (
          <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.05" />
            <Stop offset="100%" stopColor={theme.accent} stopOpacity="0.05" />
          </LinearGradient>
        )}
      </Defs>
      
      {/* Background circle for default variant */}
      {variant === 'default' && (
        <Circle 
          cx="256" 
          cy="256" 
          r="240" 
          fill="url(#bgGradient)" 
          stroke={theme.primary} 
          strokeWidth="2" 
          opacity="0.3"
        />
      )}
      
      {/* Light bulb (knowledge/idea) */}
      <Path 
        d="M256 140a80 80 0 0 1 80 80c0 28-16 52-32 68v16h-96v-16c-16-16-32-40-32-68a80 80 0 0 1 80-80z" 
        fill={variant === 'outline' ? 'transparent' : 'url(#bulbGradient)'}
        stroke={variant === 'outline' ? colors.stroke : 'none'}
        strokeWidth={variant === 'outline' ? 3 : 0}
      />
      
      {/* Bulb base */}
      <Rect 
        x="224" 
        y="308" 
        width="64" 
        height="24" 
        rx="8" 
        fill={colors.bulbBase}
        stroke={variant === 'outline' ? colors.stroke : 'none'}
        strokeWidth={variant === 'outline' ? 2 : 0}
      />
      <Rect 
        x="236" 
        y="336" 
        width="40" 
        height="12" 
        rx="6" 
        fill={colors.bulbBase}
        opacity="0.7"
      />

      {/* News/content lines */}
      <Rect 
        x="140" 
        y="220" 
        width="90" 
        height="12" 
        rx="6" 
        fill={variant === 'outline' ? 'transparent' : 'url(#newsGradient)'}
        stroke={variant === 'outline' ? colors.stroke : 'none'}
        strokeWidth={variant === 'outline' ? 2 : 0}
      />
      <Rect 
        x="140" 
        y="240" 
        width="120" 
        height="10" 
        rx="5" 
        fill={colors.lines}
        opacity="0.8"
      />
      <Rect 
        x="140" 
        y="260" 
        width="100" 
        height="10" 
        rx="5" 
        fill={colors.lines}
        opacity="0.6"
      />
      <Rect 
        x="140" 
        y="280" 
        width="60" 
        height="10" 
        rx="5" 
        fill={colors.lines}
        opacity="0.4"
      />

      {/* Modern notification dot */}
      <Circle 
        cx="360" 
        cy="160" 
        r="16" 
        fill={colors.notification} 
        stroke={theme.surface} 
        strokeWidth="4"
      />
      <Circle 
        cx="360" 
        cy="160" 
        r="6" 
        fill={theme.surface}
      />
    </Svg>
  );
};

// Preset variants for common use cases
export const AppIconDefault = (props: Omit<AppIconProps, 'variant'>) => (
  <AppIcon {...props} variant="default" />
);

export const AppIconMonochrome = (props: Omit<AppIconProps, 'variant'>) => (
  <AppIcon {...props} variant="monochrome" />
);

export const AppIconOutline = (props: Omit<AppIconProps, 'variant'>) => (
  <AppIcon {...props} variant="outline" />
);

export default AppIcon;
