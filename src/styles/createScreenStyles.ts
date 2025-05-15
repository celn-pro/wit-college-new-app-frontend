import styled from '@emotion/native';
import { Platform } from 'react-native';

// Add extra bottom padding for screens with tab navigation
const TAB_BAR_HEIGHT = 60;

export const Container = styled.ScrollView`
  flex: 1;
  background-color: ${(props) => props.theme.background};
  padding: 20px;
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  margin-top: ${Platform.OS === 'ios' ? '0px' : '20px'};
`;

export const HeaderTitle = styled.Text`
  font-size: 24px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
`;

export const FormField = styled.View`
  margin-bottom: 20px;
`;

export const Label = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Medium';
  color: ${(props) => props.theme.text};
  margin-bottom: 8px;
`;

export const Input = styled.TextInput`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  border: 1px solid ${(props) => props.theme.border};
`;

export const TextArea = styled.TextInput`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  border: 1px solid ${(props) => props.theme.border};
  height: 120px;
  text-align-vertical: top;
`;

export const PickerContainer = styled.View`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.border};
`;

export const ToggleButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

export const ToggleText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Medium';
  color: ${(props) => props.theme.primary};
  margin-left: 8px;
`;

export const SubmitButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.primary};
  border-radius: 8px;
  padding: 15px;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
`;

export const SubmitButtonText = styled.Text`
  font-size: 18px;
  font-family: 'Roboto-Bold';
  color: #ffffff;
`;

export const ImageSelectButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  padding: 12px;
  border: 1px solid ${(props) => props.theme.border};
  align-items: center;
`;

export const ImageNameText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  margin-top: 8px;
`;

export const LoadingText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-align: center;
  margin: 10px 0;
`;

// Add these new styles to help with tab navigation layout
export const ContentContainer = styled.View`
  flex: 1;
  padding-bottom: ${TAB_BAR_HEIGHT + 20}px;
`;

export const SafeContainer = styled.SafeAreaView`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;