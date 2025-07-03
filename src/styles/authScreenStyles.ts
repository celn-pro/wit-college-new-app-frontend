import styled from '@emotion/native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');



export const FormCard = styled.View`
  background-color: ${(props) => props.theme.surface};
  border-radius: 28px;
  padding: 32px 24px;
  width: 100%;
  max-width: 400px;
  shadow-color: #000;
  shadow-offset: 0px 12px;
  shadow-opacity: 0.18;
  shadow-radius: 24px;
  elevation: 16;
  border: 1px solid ${(props) => props.theme.border};
  margin-vertical: 20px;
  align-self: center;
  min-height: auto;
  overflow: hidden;
`;

export const HeaderSection = styled.View`
  align-items: center;
  margin-bottom: 32px;
`;

export const Title = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: ${(props) => props.theme.text.primary};
  margin-bottom: 8px;
  text-align: center;
  letter-spacing: -0.5px;
`;

export const Subtitle = styled.Text`
  font-size: 16px;
  color: ${(props) => props.theme.text.secondary};
  text-align: center;
  margin-bottom: 8px;
`;

export const InputContainer = styled.View`
  margin-bottom: 20px;
`;

export const InputLabel = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.text.primary};
  margin-bottom: 8px;
  margin-left: 4px;
`;

export const Input = styled.TextInput`
  background-color: ${(props) => props.theme.background};
  border: 2px solid ${(props) => props.theme.border};
  border-radius: 16px;
  padding: 16px;
  font-size: 16px;
  color: ${(props) => props.theme.text.primary};

  &:focus {
    border-color: ${(props) => props.theme.primary};
  }
`;

export const RoleSection = styled.View`
  margin-bottom: 24px;
`;

export const RoleLabel = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.text.primary};
  margin-bottom: 12px;
`;

export const RoleButtonsContainer = styled.View`
  flex-direction: row;
  gap: 12px;
`;

export const RoleButton = styled.TouchableOpacity<{ selected: boolean }>`
  flex: 1;
  background-color: ${(props) =>
    props.selected ? props.theme.primary : props.theme.background};
  border: 2px solid ${(props) =>
    props.selected ? props.theme.primary : props.theme.border};
  border-radius: 24px;
  padding: 16px;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  shadow-color: ${(props) => props.selected ? props.theme.primary : 'transparent'};
  shadow-offset: 0px 4px;
  shadow-opacity: ${(props) => props.selected ? 0.15 : 0};
  shadow-radius: 8px;
  elevation: ${(props) => props.selected ? 4 : 0};
`;

export const RoleText = styled.Text<{ selected: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) =>
    props.selected ? props.theme.text.inverse : props.theme.text.primary};
`;

export const RoleIcon = styled.View`
  margin-bottom: 4px;
`;

export const ActionButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>`
  background-color: ${(props) =>
    props.variant === 'secondary' ? props.theme.background : props.theme.primary};
  border: 2px solid ${(props) =>
    props.variant === 'secondary' ? props.theme.border : props.theme.primary};
  border-radius: 32px;
  padding: 18px;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  min-height: 56px;
  shadow-color: ${(props) => props.theme.primary};
  shadow-offset: 0px 6px;
  shadow-opacity: ${(props) => props.variant === 'secondary' ? 0 : 0.25};
  shadow-radius: 12px;
  elevation: ${(props) => props.variant === 'secondary' ? 0 : 6};
`;

export const ActionText = styled.Text<{ variant?: 'primary' | 'secondary' }>`
  font-size: 16px;
  font-weight: bold;
  color: ${(props) =>
    props.variant === 'secondary' ? props.theme.text.primary : props.theme.text.inverse};
`;

export const AccentButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.accent};
  border-radius: 24px;
  padding: 16px;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  shadow-color: ${(props) => props.theme.accent};
  shadow-offset: 0px 6px;
  shadow-opacity: 0.3;
  shadow-radius: 10px;
  elevation: 6;
`;

export const AccentButtonText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.text.inverse};
`;

export const SwitchMode = styled.TouchableOpacity`
  margin-top: 24px;
  align-items: center;
  padding: 12px;
`;

export const SwitchModeText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${(props) => props.theme.primary};
`;

export const NoteText = styled.Text`
  font-size: 14px;
  color: ${(props) => props.theme.text.secondary};
  margin-bottom: 16px;
  text-align: center;
  line-height: 20px;
`;

export const PasswordContainer = styled.View`
  position: relative;
`;

export const PasswordToggle = styled.TouchableOpacity`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-12px);
  padding: 4px;
`;

export const CollegeIcon = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 32px;
  background-color: ${(props) => props.theme.primaryLight};
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  border: 3px solid ${(props) => props.theme.primary};
  shadow-color: ${(props) => props.theme.primary};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 8px;
  elevation: 4;
`;
