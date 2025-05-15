import styled from '@emotion/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// SafeAreaContainer to handle safe area across different devices
export const SafeAreaContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

export const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background};
  padding: 15px;
  padding-bottom: 0; // Remove bottom padding as it will be handled by FlatList
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 15px;
`;

export const HeaderTitle = styled.Text`
  font-size: 22px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
`;

export const NewsCard = styled.TouchableOpacity`
  flex-direction: row;
  padding: 15px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.cardBackground};
`;

export const NewsImage = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 5px;
  margin-right: 15px;
`;

export const NewsContent = styled.View`
  flex: 1;
`;

export const NewsTitle = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
  margin-bottom: 5px;
`;

export const NewsDescription = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  margin-bottom: 5px;
`;

export const NewsMeta = styled.Text`
  font-size: 12px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  opacity: 0.7;
`;

export const ActionButton = styled.TouchableOpacity`
  padding: 5px;
  margin-left: 10px;
`;

export const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const ErrorContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

export const ErrorText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-align: center;
  margin-bottom: 10px;
`;

export const EmptyStateContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

export const EmptyStateText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-align: center;
`;