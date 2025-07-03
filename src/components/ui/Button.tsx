import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '../../theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const StyledButton = styled(TouchableOpacity)<{
  variant: string;
  size: string;
  fullWidth: boolean;
  disabled: boolean;
}>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.variant === 'error' ? '16px' : props.theme.borderRadius.md + 'px'};
  
  ${(props) => {
    const { theme } = props;
    
    // Size styles
    const sizeStyles = {
      sm: `
        padding: ${theme.spacing.sm}px ${theme.spacing.md}px;
        min-height: 36px;
      `,
      md: `
        padding: ${theme.spacing.md}px ${theme.spacing.lg}px;
        min-height: 44px;
      `,
      lg: `
        padding: ${theme.spacing.lg}px ${theme.spacing.xl}px;
        min-height: 52px;
      `,
    };
    
    // Variant styles
    const variantStyles = {
      primary: `
        background-color: ${props.disabled ? theme.disabled : theme.primary};
        shadow-color: ${theme.primary};
        shadow-offset: 0px 2px;
        shadow-opacity: 0.2;
        shadow-radius: 4px;
        elevation: 3;
      `,
      accent: `
        background-color: ${props.disabled ? theme.disabled : theme.accent};
        shadow-color: ${theme.accent};
        shadow-offset: 0px 2px;
        shadow-opacity: 0.25;
        shadow-radius: 6px;
        elevation: 4;
      `,
      error: `
        background-color: ${props.disabled ? theme.disabled : theme.error};
        shadow-color: ${theme.error};
        shadow-offset: 0px 2px;
        shadow-opacity: 0.25;
        shadow-radius: 6px;
        elevation: 4;
      `,
      secondary: `
        background-color: ${props.disabled ? theme.disabled : theme.cardBackground};
        border: 1px solid ${theme.border};
      `,
      outline: `
        background-color: transparent;
        border: 2px solid ${props.disabled ? theme.disabled : theme.primary};
      `,
      ghost: `
        background-color: transparent;
      `,
    };
    
    return `
      ${sizeStyles[props.size]}
      ${variantStyles[props.variant]}
      ${props.fullWidth ? 'width: 100%;' : ''}
      opacity: ${props.disabled ? 0.6 : 1};
    `;
  }}
`;

const ButtonText = styled(Text)<{
  variant: string;
  size: string;
  disabled: boolean;
}>`
  font-family: ${(props) => props.theme.typography.fontFamily.semiBold};
  text-align: center;
  
  ${(props) => {
    const { theme } = props;
    
    // Size styles
    const sizeStyles = {
      sm: `font-size: ${theme.typography.fontSize.sm}px;`,
      md: `font-size: ${theme.typography.fontSize.base}px;`,
      lg: `font-size: ${theme.typography.fontSize.lg}px;`,
    };
    
    // Variant styles
    const variantStyles = {
      primary: `color: ${theme.text.inverse};`,
      accent: `color: ${theme.text.inverse};`,
      error: `color: ${theme.text.inverse};`,
      secondary: `color: ${theme.text.primary};`,
      outline: `color: ${props.disabled ? theme.disabled : theme.primary};`,
      ghost: `color: ${props.disabled ? theme.disabled : theme.primary};`,
    };
    
    return `
      ${sizeStyles[props.size]}
      ${variantStyles[props.variant]}
    `;
  }}
`;

const IconContainer = styled.View<{ hasText: boolean }>`
  ${(props) => props.hasText && `margin-right: ${props.theme.spacing.sm}px;`}
`;

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={isDisabled}
      onPress={onPress}
      activeOpacity={0.8}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.text.inverse : theme.primary}
        />
      ) : (
        <>
          {icon && <IconContainer hasText={!!title}>{icon}</IconContainer>}
          {title && (
            <ButtonText
              variant={variant}
              size={size}
              disabled={isDisabled}
              style={textStyle}
            >
              {title}
            </ButtonText>
          )}
        </>
      )}
    </StyledButton>
  );
};

export default Button;
