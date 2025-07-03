import React from 'react';
import { TextStyle } from 'react-native';
import styled from '@emotion/native';

export interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'warning' | 'error';
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'medium' | 'semiBold' | 'bold';
  numberOfLines?: number;
  style?: TextStyle;
}

const StyledText = styled.Text<{
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'overline';
  color: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'warning' | 'error';
  align: 'left' | 'center' | 'right';
  weight: 'normal' | 'medium' | 'semiBold' | 'bold';
}>`
  ${(props) => {
    const { theme } = props;
    
    // Variant styles
    const variantStyles = {
      h1: `
        font-size: ${theme.typography.fontSize['4xl']}px;
        line-height: ${theme.typography.fontSize['4xl'] * theme.typography.lineHeight.tight}px;
        font-weight: ${theme.typography.fontWeight.bold};
      `,
      h2: `
        font-size: ${theme.typography.fontSize['3xl']}px;
        line-height: ${theme.typography.fontSize['3xl'] * theme.typography.lineHeight.tight}px;
        font-weight: ${theme.typography.fontWeight.bold};
      `,
      h3: `
        font-size: ${theme.typography.fontSize['2xl']}px;
        line-height: ${theme.typography.fontSize['2xl'] * theme.typography.lineHeight.tight}px;
        font-weight: ${theme.typography.fontWeight.semiBold};
      `,
      h4: `
        font-size: ${theme.typography.fontSize.xl}px;
        line-height: ${theme.typography.fontSize.xl * theme.typography.lineHeight.normal}px;
        font-weight: ${theme.typography.fontWeight.semiBold};
      `,
      body1: `
        font-size: ${theme.typography.fontSize.base}px;
        line-height: ${theme.typography.fontSize.base * theme.typography.lineHeight.normal}px;
        font-weight: ${theme.typography.fontWeight.normal};
      `,
      body2: `
        font-size: ${theme.typography.fontSize.sm}px;
        line-height: ${theme.typography.fontSize.sm * theme.typography.lineHeight.normal}px;
        font-weight: ${theme.typography.fontWeight.normal};
      `,
      caption: `
        font-size: ${theme.typography.fontSize.xs}px;
        line-height: ${theme.typography.fontSize.xs * theme.typography.lineHeight.normal}px;
        font-weight: ${theme.typography.fontWeight.normal};
      `,
      overline: `
        font-size: ${theme.typography.fontSize.xs}px;
        line-height: ${theme.typography.fontSize.xs * theme.typography.lineHeight.normal}px;
        font-weight: ${theme.typography.fontWeight.medium};
        text-transform: uppercase;
        letter-spacing: 1px;
      `,
    };
    
    // Color styles
    const colorStyles = {
      primary: `color: ${theme.text.primary};`,
      secondary: `color: ${theme.text.secondary};`,
      tertiary: `color: ${theme.text.tertiary};`,
      inverse: `color: ${theme.text.inverse};`,
      success: `color: ${theme.success};`,
      warning: `color: ${theme.warning};`,
      error: `color: ${theme.error};`,
    };
    
    // Weight override
    const weightStyles = {
      normal: `font-weight: ${theme.typography.fontWeight.normal};`,
      medium: `font-weight: ${theme.typography.fontWeight.medium};`,
      semiBold: `font-weight: ${theme.typography.fontWeight.semiBold};`,
      bold: `font-weight: ${theme.typography.fontWeight.bold};`,
    };
    
    return `
      ${variantStyles[props.variant]}
      ${colorStyles[props.color]}
      ${props.weight !== 'normal' ? weightStyles[props.weight] : ''}
      text-align: ${props.align};
    `;
  }}
`;

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body1',
  color = 'primary',
  align = 'left',
  weight = 'normal',
  numberOfLines,
  style,
}) => {
  return (
    <StyledText
      variant={variant}
      color={color}
      align={align}
      weight={weight}
      numberOfLines={numberOfLines}
      style={style}
    >
      {children}
    </StyledText>
  );
};

// Convenience components
export const Heading1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
);

export const Heading2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
);

export const Heading3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
);

export const Heading4: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h4" {...props} />
);

export const Body1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body1" {...props} />
);

export const Body2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body2" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption" {...props} />
);

export const Overline: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="overline" {...props} />
);

export default Typography;
