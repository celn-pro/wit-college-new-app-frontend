import React, { useEffect } from 'react';
import { TouchableOpacity, View, Text, FlatList, ActivityIndicator } from 'react-native';
import styled from '@emotion/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const BASE_URL = 'http://10.0.2.2:5000';

const SafeContainer = styled(SafeAreaView)`flex: 1; background-color: ${(props) => props.theme.background};`;
const Header = styled.View`flex-direction: row; justify-content: space-between; align-items: center; padding: 15px 20px; background-color: ${(props) => props.theme.cardBackground};`;
const HeaderTitle = styled.Text`font-size: 22px; font-family: 'Roboto-Bold'; color: ${(props) => props.theme.text};`;
const NotificationCard = styled.TouchableOpacity`flex-direction: row; padding: 15px 20px; border-bottom-width: 1px; border-bottom-color: ${(props) => props.theme.cardBackground}; background-color: ${(props: any) => (props.read ? props.theme.background : '#f0f0f0')};`;
const NotificationContent = styled.View`flex: 1;`;
const NotificationTitle = styled.Text`font-size: 16px; font-family: 'Roboto-Bold'; color: ${(props) => props.theme.text}; margin-bottom: 5px;`;
const NotificationBody = styled.Text`font-size: 14px; font-family: 'Roboto-Regular'; color: ${(props) => props.theme.text}; margin-bottom: 5px;`;
const NotificationMeta = styled.Text`font-size: 12px; font-family: 'Roboto-Regular'; color: ${(props) => props.theme.text}; opacity: 0.7;`;
const EmptyStateContainer = styled.View`flex: 1; justify-content: center; align-items: center;`;
const EmptyStateText = styled.Text`font-size: 16px; font-family: 'Roboto-Regular'; color: ${(props) => props.theme.text};`;
const MarkAllButton = styled.TouchableOpacity`padding: 8px 16px; background-color: ${(props) => props.theme.primary}; border-radius: 20px;`;
const MarkAllText = styled.Text`font-size: 14px; font-family: 'Roboto-Bold'; color: #ffffff;`;

const NotificationsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { notifications, token, markNotificationAsRead, markAllNotificationsAsRead, getUnreadCount } = useAppStore();
  const theme = useTheme();

  const handleNotificationPress = async (notification: any) => {
    if (!notification.read) {
      try {
        const response = await fetch(`${BASE_URL}/api/notifications/mark-read/${notification._id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          markNotificationAsRead(notification._id);
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to mark notification as read',
        });
      }
    }

    if (notification.newsId) {
      navigation.navigate('NewsDetail', { newsId: notification.newsId });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        markAllNotificationsAsRead();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'All notifications marked as read',
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to mark all notifications as read',
      });
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <NotificationCard read={item.read} onPress={() => handleNotificationPress(item)}>
      <NotificationContent>
        <NotificationTitle>{item.title}</NotificationTitle>
        <NotificationBody>{item.body}</NotificationBody>
        <NotificationMeta>{new Date(item.createdAt).toLocaleString()}</NotificationMeta>
      </NotificationContent>
      {!item.read && (
        <View style={{ justifyContent: 'center' }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#007BFF' }} />
        </View>
      )}
    </NotificationCard>
  );

  return (
    <SafeContainer>
      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <HeaderTitle>Notifications</HeaderTitle>
        {getUnreadCount() > 0 && (
          <MarkAllButton onPress={handleMarkAllRead}>
            <MarkAllText>Mark All Read {getUnreadCount()}</MarkAllText>
          </MarkAllButton>
        )}
      </Header>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
        />
      ) : (
        <EmptyStateContainer>
          <EmptyStateText>No notifications yet.</EmptyStateText>
        </EmptyStateContainer>
      )}
    </SafeContainer>
  );
};

export default NotificationsScreen;