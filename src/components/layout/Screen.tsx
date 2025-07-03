import React from 'react';
import { StatusBar, ViewStyle, ScrollViewProps } from 'react-native';
import styled from '@emotion/native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

export interface ScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  statusBarBackgroundColor?: string;
  style?: ViewStyle;
  scrollable?: boolean;
  scrollViewProps?: ScrollViewProps;
}

const StyledSafeAreaView = styled(SafeAreaView)<{ backgroundColor: string }>`
  flex: 1;
  background-color: ${(props) => props.backgroundColor};
`;

const Container = styled.View`
  flex: 1;
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
`;

export const Screen: React.FC<ScreenProps> = ({
  children,
  edges = ['top', 'bottom'],
  backgroundColor,
  statusBarStyle,
  statusBarBackgroundColor,
  style,
  scrollable = false,
  scrollViewProps,
}) => {
  const theme = useTheme();
  
  const bgColor = backgroundColor || theme.background;
  const barStyle = statusBarStyle || (theme.text.primary === '#FFFFFF' ? 'light-content' : 'dark-content');
  const barBgColor = statusBarBackgroundColor || bgColor;

  const content = scrollable ? (
    <ScrollContainer
      {...scrollViewProps}
      contentContainerStyle={[
        { flexGrow: 1 },
        scrollViewProps?.contentContainerStyle,
      ]}
    >
      {children}
    </ScrollContainer>
  ) : (
    <Container style={style}>
      {children}
    </Container>
  );

  return (
    <StyledSafeAreaView
      edges={edges}
      backgroundColor={bgColor}
    >
      <StatusBar
        barStyle={barStyle}
        backgroundColor={barBgColor}
        translucent={false}
      />
      {content}
    </StyledSafeAreaView>
  );
};

export default Screen;
