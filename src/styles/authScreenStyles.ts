import styled from '@emotion/native';

export const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background};
  padding: 20px;
  justify-content: center;
`;

export const Title = styled.Text`
  font-size: 28px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
  margin-bottom: 20px;
  text-align: center;
`;

export const Input = styled.TextInput`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
`;

export const RoleButton = styled.TouchableOpacity<{ selected: boolean }>`
  background-color: ${(props) => (props.selected ? props.theme.primary : props.theme.cardBackground)};
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  align-items: center;
`;

export const RoleText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
`;

export const ActionButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.primary};
  border-radius: 10px;
  padding: 15px;
  align-items: center;
  margin-top: 20px;
`;

export const ActionText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: #ffffff;
`;

export const SwitchMode = styled.TouchableOpacity`
  margin-top: 15px;
  align-items: center;
`;

export const SwitchModeText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-decoration-line: underline;
`;

export const RoleLabel = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Medium';
  color: ${(props) => props.theme.text};
  margin-bottom: 10px;
`;

export const NoteText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text + '80'};
  margin-bottom: 15px;
  text-align: center;
`;
