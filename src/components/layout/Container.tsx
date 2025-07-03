import React from 'react';
import { ViewStyle } from 'react-native';
import styled from '@emotion/native';

export interface ContainerProps {
  children: React.ReactNode;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'pageMargin';
  paddingHorizontal?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'pageMargin';
  paddingVertical?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'pageMargin';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'pageMargin';
  marginHorizontal?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'pageMargin';
  marginVertical?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'pageMargin';
  flex?: number;
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  backgroundColor?: string;
  style?: ViewStyle;
}

const StyledContainer = styled.View<{
  padding: string;
  paddingHorizontal: string;
  paddingVertical: string;
  margin: string;
  marginHorizontal: string;
  marginVertical: string;
  flex?: number;
  direction: string;
  align: string;
  justify: string;
  backgroundColor?: string;
}>`
  ${(props) => {
    const { theme } = props;
    
    const spacingMap = {
      none: 0,
      xs: theme.spacing.xs,
      sm: theme.spacing.sm,
      md: theme.spacing.md,
      lg: theme.spacing.lg,
      xl: theme.spacing.xl,
      pageMargin: theme.spacing.pageMargin,
    };
    
    const paddingValue = spacingMap[props.padding];
    const paddingHorizontalValue = spacingMap[props.paddingHorizontal];
    const paddingVerticalValue = spacingMap[props.paddingVertical];
    const marginValue = spacingMap[props.margin];
    const marginHorizontalValue = spacingMap[props.marginHorizontal];
    const marginVerticalValue = spacingMap[props.marginVertical];
    
    return `
      ${props.flex !== undefined ? `flex: ${props.flex};` : ''}
      flex-direction: ${props.direction};
      align-items: ${props.align};
      justify-content: ${props.justify};
      ${props.backgroundColor ? `background-color: ${props.backgroundColor};` : ''}
      
      ${paddingValue !== undefined ? `padding: ${paddingValue}px;` : ''}
      ${paddingHorizontalValue !== undefined ? `padding-horizontal: ${paddingHorizontalValue}px;` : ''}
      ${paddingVerticalValue !== undefined ? `padding-vertical: ${paddingVerticalValue}px;` : ''}
      
      ${marginValue !== undefined ? `margin: ${marginValue}px;` : ''}
      ${marginHorizontalValue !== undefined ? `margin-horizontal: ${marginHorizontalValue}px;` : ''}
      ${marginVerticalValue !== undefined ? `margin-vertical: ${marginVerticalValue}px;` : ''}
    `;
  }}
`;

export const Container: React.FC<ContainerProps> = ({
  children,
  padding = 'none',
  paddingHorizontal = 'none',
  paddingVertical = 'none',
  margin = 'none',
  marginHorizontal = 'none',
  marginVertical = 'none',
  flex,
  direction = 'column',
  align = 'stretch',
  justify = 'flex-start',
  backgroundColor,
  style,
}) => {
  return (
    <StyledContainer
      padding={padding}
      paddingHorizontal={paddingHorizontal}
      paddingVertical={paddingVertical}
      margin={margin}
      marginHorizontal={marginHorizontal}
      marginVertical={marginVertical}
      flex={flex}
      direction={direction}
      align={align}
      justify={justify}
      backgroundColor={backgroundColor}
      style={style}
    >
      {children}
    </StyledContainer>
  );
};

// Convenience components
export const Row: React.FC<Omit<ContainerProps, 'direction'>> = (props) => (
  <Container direction="row" {...props} />
);

export const Column: React.FC<Omit<ContainerProps, 'direction'>> = (props) => (
  <Container direction="column" {...props} />
);

export const Center: React.FC<Omit<ContainerProps, 'align' | 'justify'>> = (props) => (
  <Container align="center" justify="center" {...props} />
);

export const Spacer: React.FC<{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => (
  <Container padding={size} />
);

export default Container;
