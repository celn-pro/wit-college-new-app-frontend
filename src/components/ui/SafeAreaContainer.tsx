import React from 'react';
import { ViewStyle } from 'react-native';
import styled from '@emotion/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface SafeAreaContainerProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
  backgroundColor?: string;
}

const StyledSafeAreaView = styled(SafeAreaView)<{ backgroundColor?: string }>`
  flex: 1;
  background-color: ${(props) => props.backgroundColor || props.theme.background};
`;

export const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({
  children,
  edges = ['top', 'bottom'],
  style,
  backgroundColor,
}) => {
  return (
    <StyledSafeAreaView
      edges={edges}
      style={style}
      backgroundColor={backgroundColor}
    >
      {children}
    </StyledSafeAreaView>
  );
};

export default SafeAreaContainer;
