import styled from '@emotion/native';
import { Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CategoryButtonProps {
  selected: boolean;
}

export const SafeContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: ${(props) => props.theme.cardBackground};
`;

export const HeaderTitle = styled.Text`
  font-size: 22px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
`;

export const CategoryList = styled(FlatList<string>)`
  padding: 10px 0;
  margin-horizontal: 10px;
`;

export const CategoryButton = styled.TouchableOpacity<CategoryButtonProps>`
  background-color: ${(props) => (props.selected ? props.theme.primary : props.theme.cardBackground)};
  padding: 8px 16px;
  border-radius: 20px;
  margin-right: 10px;
  min-width: 80px;
  align-items: center;
  height: 40px;
`;

export const CategoryText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-align: center;
`;

export const FeaturedCarouselContainer = styled.View`
  margin: 15px 15px 0 15px;
  border-radius: 10px;
  overflow: hidden;
`;

export const FixedContentContainer = styled.View`
  background-color: ${(props) => props.theme.background};
`;

export const ScrollableContentContainer = styled.ScrollView`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

export const FeaturedCard = styled.TouchableOpacity`
  width: ${SCREEN_WIDTH - 30}px;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  background-color: ${(props) => props.theme.cardBackground};
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
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
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const FeaturedTitle = styled.Text`
  font-size: 18px;
  font-family: 'Roboto-Bold';
  color: #ffffff;
`;

export const NewsListContainer = styled.View`
  margin-top: 15px;
  flex: 1;
`;

export const NewsCard = styled.TouchableOpacity`
  flex-direction: row;
  padding: 15px 20px;
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

export const ErrorText = styled.Text`
  font-size: 16px;
  font-family.

// ... (Previous message was cut off mid-sentence) ... 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-align: center;
  margin: 20px;
`;

export const IconContainer = styled.View`
  flex-direction: row;
  width: 120px;
  justify-content: space-between;
  margin-left: 10px;
`;

export const NotificationIconContainer = styled.View`
  position: relative;
`;

export const Badge = styled.View`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff0000;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
  padding: 2px;
`;

export const BadgeText = styled.Text`
  font-family: 'Roboto-Regular';
  color: #ffffff;
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
  color: ${(props) => props.theme.text};
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