import styled from '@emotion/native';
import { Animated, Platform } from 'react-native';

interface RoleBadgeProps {
  userRole: 'admin' | 'faculty' | 'student';
}

// Main container that ensures safe area and proper height
export const PageContainer = styled.View`
  flex: 1;
  background-color: transparent;
`;

// Scrollable content container with proper padding
export const ContentContainer = styled.ScrollView`
  flex: 1;
  background-color: transparent;
  padding: 20px;
  padding-bottom: ${Platform.OS === 'ios' ? '100px' : '80px'}; // Extra bottom padding to avoid tab bar overlap
`;

// Legacy container maintained for backwards compatibility
export const Container = styled.ScrollView`
  flex: 1;
  background-color: ${(props) => props.theme.background};
  padding: 20px;
  padding-bottom: ${Platform.OS === 'ios' ? '100px' : '80px'}; // Extra bottom padding to avoid tab bar overlap
`;

export const Card = styled(Animated.View)`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 15px;
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;

export const SectionTitle = styled.Text`
  font-size: 18px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
  margin-bottom: 10px;
`;

export const Option = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 15px;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 10px;
  margin-bottom: 10px;
`;

export const OptionText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  flex: 1;
`;

export const Input = styled.TextInput`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  border: 1px solid ${(props) => props.theme.border};
  margin-bottom: 10px;
`;

export const ActionButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.primary};
  border-radius: 8px;
  padding: 15px;
  align-items: center;
  margin-top: 10px;
`;

export const ActionText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text.inverse};
`;

export const StatText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text.primary};
  margin-bottom: 5px;
`;

export const RoleBadge = styled(Animated.View)<RoleBadgeProps>`
  background-color: ${(props) => {
    switch (props.userRole) {
      case 'admin': return props.theme.error;
      case 'faculty': return props.theme.primary;
      case 'student': return props.theme.accent;
      default: return props.theme.primary;
    }
  }};
  border-radius: 12px;
  padding: 5px 10px;
`;

export const RoleBadgeText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Medium';
  color: ${(props) => props.theme.text.inverse};
`;

export const UserItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  margin-bottom: 5px;
`;

export const SearchInput = styled.TextInput`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text.primary};
  border: 1px solid ${(props) => props.theme.border};
  margin-bottom: 15px;
`;

export const PillsContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
`;

export const Pill = styled.TouchableOpacity<{ selected?: boolean }>`
  padding: 8px 20px;
  border-radius: 20px;
  background-color: ${({ selected, theme }) =>
    selected ? theme.primary : theme.cardBackground};
  margin: 0 6px;
`;

// Optionally, update GradientHeader for a more modern look:
export const GradientHeader = styled.View`
  padding: 24px 16px 16px 16px;
  background-color: ${({ theme }) => theme.primary};
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  align-items: flex-start;
  justify-content: flex-end;
  min-height: 80px;
  position: relative;
`;