import React from 'react';
import { ActivityIndicator, ViewStyle } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '../../theme';

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

const Container = styled.View<{ fullScreen: boolean }>`
  ${(props) => props.fullScreen && `
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: ${props.theme.background};
  `}
`;

const SpinnerContainer = styled.View`
  justify-content: center;
  align-items: center;
  padding: ${(props) => props.theme.spacing.md}px;
`;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  style,
  fullScreen = false,
}) => {
  const theme = useTheme();
  const spinnerColor = color || theme.primary;

  if (fullScreen) {
    return (
      <Container fullScreen={fullScreen}>
        <ActivityIndicator size={size} color={spinnerColor} />
      </Container>
    );
  }

  return (
    <SpinnerContainer style={style}>
      <ActivityIndicator size={size} color={spinnerColor} />
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
