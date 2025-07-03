import React, { forwardRef } from 'react';
import { ViewStyle } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  onPress?: () => void;
}

const StyledCard = styled.View<{
  variant: string;
  padding: string;
  pressable: boolean;
}>`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: ${(props) => props.theme.borderRadius.lg}px;
  
  ${(props) => {
    const { theme } = props;
    
    // Padding styles
    const paddingStyles = {
      none: '',
      sm: `padding: ${theme.spacing.sm}px;`,
      md: `padding: ${theme.spacing.md}px;`,
      lg: `padding: ${theme.spacing.lg}px;`,
    };
    
    // Variant styles
    const variantStyles = {
      default: '',
      elevated: `
        shadow-color: #000;
        shadow-offset: 0px 2px;
        shadow-opacity: 0.1;
        shadow-radius: 8px;
        elevation: 4;
      `,
      outlined: `
        border: 1px solid ${theme.border};
      `,
    };
    
    return `
      ${paddingStyles[props.padding]}
      ${variantStyles[props.variant]}
    `;
  }}
`;

const StyledTouchableCard = styled.TouchableOpacity<{
  variant: string;
  padding: string;
}>`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: ${(props) => props.theme.borderRadius.lg}px;
  
  ${(props) => {
    const { theme } = props;
    
    // Padding styles
    const paddingStyles = {
      none: '',
      sm: `padding: ${theme.spacing.sm}px;`,
      md: `padding: ${theme.spacing.md}px;`,
      lg: `padding: ${theme.spacing.lg}px;`,
    };
    
    // Variant styles
    const variantStyles = {
      default: '',
      elevated: `
        shadow-color: #000;
        shadow-offset: 0px 2px;
        shadow-opacity: 0.1;
        shadow-radius: 8px;
        elevation: 4;
      `,
      outlined: `
        border: 1px solid ${theme.border};
      `,
    };
    
    return `
      ${paddingStyles[props.padding]}
      ${variantStyles[props.variant]}
    `;
  }}
`;

const CardComponent = forwardRef<any, CardProps>(({
  children,
  variant = 'elevated',
  padding = 'md',
  style,
  onPress,
}, ref) => {
  if (onPress) {
    return (
      <StyledTouchableCard
        ref={ref}
        variant={variant}
        padding={padding}
        onPress={onPress}
        activeOpacity={0.95}
        style={style}
      >
        {children}
      </StyledTouchableCard>
    );
  }

  return (
    <StyledCard
      ref={ref}
      variant={variant}
      padding={padding}
      pressable={false}
      style={style}
    >
      {children}
    </StyledCard>
  );
});

CardComponent.displayName = 'Card';

export const Card = CardComponent;
export default CardComponent;
