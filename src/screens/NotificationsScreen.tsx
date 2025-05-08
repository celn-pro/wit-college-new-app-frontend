import React from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import styled from '@emotion/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store';
import { useTheme } from '../theme';

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background};
  padding: 15px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 15px;
`;

const HeaderTitle = styled.Text`
  font-size: 22px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
`;

const ClearButton = styled.TouchableOpacity`
  padding: 5px 10px;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 15px;
`;

const ClearButtonText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
`;

const NotificationCard = styled.View`
  flex-direction: row;
  padding: 15px;
  margin-bottom: 10px;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 10px;
  align-items: center;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
`;

const NotificationContent = styled.View`
  flex: 1;
`;

const NotificationTitle = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
  margin-bottom: 5px;
`;

const NotificationBody = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  margin-bottom: 5px;
`;

const NotificationMeta = styled.Text`
  font-size: 12px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  opacity: 0.7;
`;

const ActionButton = styled.TouchableOpacity`
  padding: 5px;
  margin-left: 10px;
`;

const EmptyStateContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const EmptyStateText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-align: center;
`;

const NotificationsScreen = () => {
  const notifications = useAppStore((state) => state.notifications);
  const markNotificationAsRead = useAppStore((state) => state.markNotificationAsRead);
  const markAllNotificationsAsRead = useAppStore((state) => state.markAllNotificationsAsRead);
  const theme = useTheme();

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  const renderNotification = ({ item }: { item: { id: string; title: string; body: string; read: boolean; createdAt: string } }) => (
    <NotificationCard>
      <NotificationContent>
        <NotificationTitle>{item.title}</NotificationTitle>
        <NotificationBody numberOfLines={2}>{item.body}</NotificationBody>
        <NotificationMeta>{new Date(item.createdAt).toLocaleString()}</NotificationMeta>
      </NotificationContent>
      {!item.read && (
        <ActionButton onPress={() => markNotificationAsRead(item.id)}>
          <Icon name="checkmark-circle" size={20} color={theme.primary} />
        </ActionButton>
      )}
    </NotificationCard>
  );

  return (
    <Container>
      <Header>
        <HeaderTitle>Notifications</HeaderTitle>
        {notifications.length > 0 && unreadCount > 0 && (
          <ClearButton onPress={markAllNotificationsAsRead}>
            <ClearButtonText>Clear All</ClearButtonText>
          </ClearButton>
        )}
      </Header>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <EmptyStateContainer>
          <Icon name="notifications-outline" size={50} color={theme.text} style={{ opacity: 0.5 }} />
          <EmptyStateText>No notifications available.</EmptyStateText>
        </EmptyStateContainer>
      )}
    </Container>
  );
};

export default NotificationsScreen;