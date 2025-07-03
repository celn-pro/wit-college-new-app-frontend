import React from 'react';
import { Modal, TouchableOpacity, Dimensions } from 'react-native';
import styled from '@emotion/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import { Typography } from './Typography';
import { Button } from './Button';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ModernAlertProps {
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

const Overlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const AlertContainer = styled.View`
  background-color: ${(props) => props.theme.surface};
  border-radius: 24px;
  padding: 32px 24px 24px 24px;
  width: 100%;
  max-width: 340px;
  shadow-color: #000;
  shadow-offset: 0px 20px;
  shadow-opacity: 0.25;
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
  background-color: ${(props) => props.theme.background};
  border: 1px solid ${(props) => props.theme.border};
  align-items: center;
  justify-content: center;
`;

const SecondaryButtonText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Medium';
  color: ${(props) => props.theme.text.primary};
`;

export const ModernAlert: React.FC<ModernAlertProps> = ({
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Overlay>
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
        <AlertContainer>
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
        </AlertContainer>
      </Overlay>
    </Modal>
  );
};

// Convenience function for logout confirmation
export const showLogoutAlert = (onConfirm: () => void, onCancel?: () => void) => {
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
      onPress: onCancel || (() => {}),
    },
  };
};

export default ModernAlert;
