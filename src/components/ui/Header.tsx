import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import styled from '@emotion/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import { Typography } from './Typography';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  gradient?: boolean;
  style?: ViewStyle;
}

const HeaderContainer = styled.View`
  padding: ${(props) => props.theme.spacing.md}px ${(props) => props.theme.spacing.lg}px;
  padding-top: ${(props) => props.theme.spacing.lg}px;
  min-height: 80px;
  justify-content: flex-end;
`;

const GradientContainer = styled(LinearGradient)`
  min-height: 100px;
  justify-content: flex-end;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 12px;
  elevation: 8;
  padding-bottom: 10px;
`;

const HeaderContentWrapper = styled.View`
  padding-vertical: ${(props) => props.theme.spacing.md}px;
  padding-horizontal: 20px;
  padding-top: ${(props) => props.theme.spacing.xl}px;
`;

const HeaderContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LeftSection = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const TitleSection = styled.View`
  flex: 1;
`;

const BackButton = styled(TouchableOpacity)`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: rgba(255, 255, 255, 0.2);
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const RightSection = styled.View`
  margin-left: ${(props) => props.theme.spacing.md}px;
`;

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightComponent,
  gradient = true,
  style,
}) => {
  const theme = useTheme();

  const content = (
    <HeaderContent>
      <LeftSection>
        {showBackButton && (
          <BackButton onPress={onBackPress}>
            <Icon
              name="arrow-back"
              size={24}
              color={gradient ? theme.text.inverse : theme.text.primary}
            />
          </BackButton>
        )}
        
        <TitleSection style={{ marginLeft: showBackButton ? theme.spacing.md : 0 }}>
          <Typography
            variant="h3"
            color={gradient ? 'inverse' : 'primary'}
            weight="bold"
            numberOfLines={1}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography
              variant="body2"
              color={gradient ? 'inverse' : 'secondary'}
              style={{ marginTop: 2 }}
              numberOfLines={1}
            >
              {subtitle}
            </Typography>
          )}
        </TitleSection>
      </LeftSection>
      
      {rightComponent && (
        <RightSection>
          {rightComponent}
        </RightSection>
      )}
    </HeaderContent>
  );

  if (gradient) {
    return (
      <GradientContainer
        colors={theme.gradient.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.8 }}
        locations={[0, 0.5, 1]}
        style={style}
      >
        <HeaderContentWrapper>
          {content}
        </HeaderContentWrapper>
      </GradientContainer>
    );
  }

  return (
    <HeaderContainer style={[{ backgroundColor: theme.background }, style]}>
      {content}
    </HeaderContainer>
  );
};

export default Header;
