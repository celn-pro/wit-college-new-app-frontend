import styled from '@emotion/native';
import { KeyboardAvoidingView } from 'react-native';


export const Container = styled(KeyboardAvoidingView)`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  margin-bottom: 10px;
`;

export const ScrollContainer = styled.ScrollView`
  flex: 1;
`;

export const ContentContainer = styled.View`
  flex: 1;
  padding: 0 15px;
`;

export const Title = styled.Text`
  font-size: 24px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
  margin-bottom: 10px;
`;

export const Content = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  line-height: 24px;
  margin-bottom: 15px;
`;

export const Meta = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  opacity: 0.7;
  margin-bottom: 10px;
`;

export const ReadTime = styled.Text`
  font-size: 12px;
  font-family: 'Roboto-Italic';
  color: ${(props) => props.theme.text};
  opacity: 0.7;
  margin-bottom: 15px;
`;

export const ImageContainer = styled.View`
  margin-bottom: 15px;
  border-radius: 10px;
  overflow: hidden;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
`;

export const NewsImage = styled.Image`
  width: 100%;
  height: 250px;
`;

export const ActionBar = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 15px;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 10px;
  elevation: 1;
`;

export const ActionItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 5px 10px;
`;

export const ActionText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  margin-left: 5px;
`;

export const ActionButton = styled.TouchableOpacity`
  padding: 10px;
  border-radius: 20px;
  align-items: center;
`;

export const CommentSection = styled.View`
  margin-top: 15px;
  padding: 10px;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 10px;
`;

export const CommentInputContainer = styled.View`
  margin-bottom: 10px;
`;

export const CommentInput = styled.TextInput`
  border-width: 1px;
  border-color: ${(props) => props.theme.text}20;
  border-radius: 10px;
  padding: 10px;
  font-family: 'Roboto-Regular';
  font-size: 16px;
  color: ${(props) => props.theme.text};
  background-color: ${(props) => props.theme.background};
  min-height: 80px;
`;

export const CommentButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.primary};
  padding: 10px;
  border-radius: 10px;
  align-items: center;
  margin-top: 10px;
`;

export const CommentButtonText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: #ffffff;
`;

export const CommentCard = styled.View`
  padding: 10px;
  margin-bottom: 10px;
  background-color: ${(props) => props.theme.background};
  border-radius: 10px;
  elevation: 1;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
`;

export const CommentUser = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
  margin-bottom: 5px;
`;

export const CommentContent = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
`;

export const CommentMeta = styled.Text`
  font-size: 12px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  opacity: 0.7;
  margin-top: 5px;
`;

export const SortButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 5px 10px;
  margin-bottom: 10px;
`;

export const SortText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  margin-left: 5px;
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${(props) => props.theme.text}10;
  margin: 10px 0;
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

export const RetryButton = styled.TouchableOpacity`
  padding: 10px 20px;
  background-color: ${(props) => props.theme.primary};
  border-radius: 10px;
`;

export const RetryButtonText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: #ffffff;
`;

// New components for our restructured layout
export const NewsContent = styled.View`
  padding-bottom: 15px;
`;

export const CommentsHeader = styled.View`
  padding: 10px 15px;
  background-color: ${props => props.theme.cardBackground};
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`;

export const CommentsList = styled.View`
  padding: 0 15px 20px 15px;
`;

export const EmptyCommentText = styled.Text`
  color: ${(props) => props.theme.text};
  font-family: 'Roboto-Regular';
  text-align: center;
  padding: 20px;
`;

export const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;