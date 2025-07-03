import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from '@emotion/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import { Typography } from './Typography';
import { Button } from './Button';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown } from 'react-native-reanimated';

interface ModernConfirmCardProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  primaryButton?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'accent' | 'error';
  };
  secondaryButton?: {
    title: string;
    onPress: () => void;
  };
  icon?: string;
}

const Overlay = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(props) => props.theme.text.primary === '#FFFFFF' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.6)'};
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 1000;
`;

const CardContainer = styled(Animated.View)`
  background-color: ${(props) => props.theme.surface};
  border-radius: 24px;
  padding: 32px 24px 24px 24px;
  width: 100%;
  max-width: 340px;
  shadow-color: ${(props) => props.theme.text.primary === '#FFFFFF' ? '#FFFFFF' : '#000000'};
  shadow-offset: 0px 20px;
  shadow-opacity: ${(props) => props.theme.text.primary === '#FFFFFF' ? '0.15' : '0.25'};
  shadow-radius: 25px;
  elevation: 20;
  border: 1px solid ${(props) => props.theme.border};
`;

const IconContainer = styled.View<{ type: string }>`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: ${(props) => {
    switch (props.type) {
      case 'error': return props.theme.error + '15';
      case 'warning': return props.theme.warning + '15';
      case 'success': return props.theme.success + '15';
      default: return props.theme.primary + '15';
    }
  }};
  justify-content: center;
  align-items: center;
  align-self: center;
  margin-bottom: 20px;
`;

const TitleContainer = styled.View`
  margin-bottom: 12px;
`;

const MessageContainer = styled.View`
  margin-bottom: 32px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const SecondaryButtonStyled = styled.TouchableOpacity`
  flex: 1;
  padding: 16px;
  border-radius: 16px;
  background-color: ${(props) => props.theme.cardBackground};
  border: 2px solid ${(props) => props.theme.border};
  align-items: center;
  justify-content: center;
  shadow-color: ${(props) => props.theme.text.primary === '#FFFFFF' ? '#FFFFFF' : '#000000'};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

const SecondaryButtonText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-SemiBold';
  color: ${(props) => props.theme.text.primary};
  font-weight: 600;
`;

export const ModernConfirmCard: React.FC<ModernConfirmCardProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  primaryButton,
  secondaryButton,
  icon
}) => {
  const theme = useTheme();

  const getIconName = () => {
    if (icon) return icon;
    switch (type) {
      case 'error': return 'alert-circle';
      case 'warning': return 'warning';
      case 'success': return 'checkmark-circle';
      default: return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error': return theme.error;
      case 'warning': return theme.warning;
      case 'success': return theme.success;
      default: return theme.primary;
    }
  };

  const handleOverlayPress = () => {
    if (secondaryButton) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Overlay
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
    >
      <TouchableOpacity
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        activeOpacity={1}
        onPress={handleOverlayPress}
      />
      
      <CardContainer
        entering={SlideInUp.duration(300).springify()}
        exiting={SlideOutDown.duration(200)}
      >
        <IconContainer type={type}>
          <Icon
            name={getIconName()}
            size={32}
            color={getIconColor()}
          />
        </IconContainer>

        <TitleContainer>
          <Typography
            variant="h3"
            color="primary"
            weight="bold"
            align="center"
          >
            {title}
          </Typography>
        </TitleContainer>

        <MessageContainer>
          <Typography
            variant="body1"
            color="secondary"
            align="center"
            style={{ lineHeight: 24 }}
          >
            {message}
          </Typography>
        </MessageContainer>

        <ButtonContainer>
          {secondaryButton && (
            <SecondaryButtonStyled
              onPress={secondaryButton.onPress}
              activeOpacity={0.7}
            >
              <SecondaryButtonText>
                {secondaryButton.title}
              </SecondaryButtonText>
            </SecondaryButtonStyled>
          )}

          {primaryButton && (
            <Button
              title={primaryButton.title}
              onPress={primaryButton.onPress}
              variant={primaryButton.variant || 'primary'}
              style={{ flex: 1 }}
            />
          )}
        </ButtonContainer>
      </CardContainer>
    </Overlay>
  );
};

// Convenience function for logout confirmation
export const createLogoutConfirm = (onConfirm: () => void, onCancel: () => void) => {
  return {
    visible: true,
    title: 'Sign Out',
    message: 'Are you sure you want to sign out of your account?',
    type: 'warning' as const,
    icon: 'log-out-outline',
    primaryButton: {
      title: 'Sign Out',
      onPress: onConfirm,
      variant: 'error' as const,
    },
    secondaryButton: {
      title: 'Cancel',
      onPress: onCancel,
    },
  };
};

export default ModernConfirmCard;
