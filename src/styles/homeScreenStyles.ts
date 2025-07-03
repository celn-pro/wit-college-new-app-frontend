import styled from '@emotion/native';
import { Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SafeContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px 10px 20px;
  background-color: transparent;
  elevation: 8;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
`;

export const HeaderTitle = styled.Text`
  font-size: 26px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text.inverse};
  text-shadow: 0px 2px 8px rgba(0,0,0,0.25);
  letter-spacing: 1px;
`;

export const CategoryListWrapper = styled.View`
  background-color: ${(props) => props.theme.background};
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 4px;
  padding-bottom: 2px;
`;

export const CategoryList = styled(FlatList<string>)`
  padding: 10px 0;
  margin-horizontal: 10px;
`;

export const CategoryButton = styled.TouchableOpacity<{ selected: boolean }>`
  background-color: ${(props) => (props.selected ? props.theme.primary : props.theme.cardBackground)};
  padding: 8px 16px;
  border-radius: 20px;
  margin-right: 10px;
  min-width: 80px;
  align-items: center;
  height: 40px;
  elevation: ${(props) => (props.selected ? 2 : 0)};
`;

export const CategoryText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-align: center;
`;

export const FeaturedCardWrapper = styled.View`
  width: 100%;
  align-items: center;
  justify-content: center;
  height: 210px;
  margin-top: 20px;
`;

export const FeaturedCard = styled.TouchableOpacity`
  width: 92%;
  max-width: 420px;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  background-color: ${(props) => props.theme.cardBackground};
  align-self: center;
  elevation: 6;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 8px;
`;

export const FeaturedImage = styled.Image`
  width: 100%;
  height: 100%;
`;

export const FeaturedOverlay = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 18px 15px 15px 15px;
  background-color: rgba(0, 0, 0, 0.45);
`;

export const FeaturedTitle = styled.Text`
  font-size: 20px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text.inverse};
  text-shadow: 0px 2px 8px rgba(0,0,0,0.25);
`;

export const NewsCard = styled.TouchableOpacity`
  flex-direction: row;
  padding: 15px 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.cardBackground};
  background-color: ${(props) => props.theme.background};
  elevation: 1;
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

export const ErrorText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-align: center;
  margin: 20px;
`;

export const IconContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-left: 10px;
`;

export const NotificationIconContainer = styled.View`
  position: relative;
`;

export const Badge = styled.View`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: ${(props) => props.theme.error};
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
  padding: 2px;
`;

export const BadgeText = styled.Text`
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text.inverse};
  font-size: 12px;
  font-weight: bold;
`;

export const EmptyStateContainer = styled.View`
  padding: 40px 20px;
  align-items: center;
`;

export const EmptyStateText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text.primary};
  text-align: center;
  margin-top: 10px;
`;

export const ManageCategoriesButton = styled.TouchableOpacity`
  margin-top: 15px;
  padding: 10px 15px;
  background-color: ${(props) => props.theme.primary};
  border-radius: 10px;
`;

export const ManageCategoriesText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Bold';
  color: #ffffff;
`;

export const CircleIconButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: ${({ theme }) =>
    theme.background === '#1C1C1E' ? '#333' : '#f0f0f0'};
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  elevation: 2;
`;