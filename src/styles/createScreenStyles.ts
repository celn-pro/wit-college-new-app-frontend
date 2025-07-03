import styled from '@emotion/native';
import { Platform } from 'react-native';

// Add extra bottom padding for screens with tab navigation
const TAB_BAR_HEIGHT = 60;

export const Container = styled.ScrollView`
  flex: 1;
  background-color: transparent;
  padding: 20px;
`;

export const Header = styled.View`
 flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  margin-top: ${Platform.OS === 'ios' ? '60px' : '40px'};
  margin-left: 15px;
  
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

export const ToggleButton = styled.TouchableOpacity<{ selected?: boolean }>`
  flex: 1;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  background-color: ${(props) => (props.selected ? props.theme.primary + '20' : props.theme.cardBackground)};
  border: 1px solid ${(props) => (props.selected ? props.theme.primary : props.theme.border)};
  margin-right: 8px;
`;

export const ToggleText = styled.Text<{ selected?: boolean }>`
  font-size: 14px;
  font-family: 'Roboto-Medium';
  color: ${(props) => (props.selected ? props.theme.primary : props.theme.text)};
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
  color: ${(props) => props.theme.text.inverse};
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
  color: ${(props) => props.theme.text.primary};
  margin-top: 8px;
`;

export const LoadingText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-align: center;
  margin: 10px 0;
`;

export const ContentContainer = styled.View`
  flex: 1;
  padding-bottom: ${TAB_BAR_HEIGHT + 20}px;
`;

export const SafeContainer = styled.SafeAreaView`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

export const NewsListContainer = styled.View`
  margin-top: 20px;
`;

export const NewsItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid ${(props) => props.theme.border};
`;

export const NewsTitle = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  flex: 1;
  margin-right: 8px;
`;

export const DeleteButton = styled.TouchableOpacity`
  padding: 8px;
`;