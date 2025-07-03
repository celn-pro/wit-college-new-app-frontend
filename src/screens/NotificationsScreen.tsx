import React, { useCallback, useState, useEffect } from 'react';
import { View, FlatList, RefreshControl, Platform } from 'react-native';
import styled from '@emotion/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store';
import { useTheme } from '../theme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { BASE_URL } from '../utils';
import { Header } from '../components/ui/Header';
import { notificationService } from '../services/notificationService';

const SafeContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

const ContentContainer = styled.View<{ bottomInset: number }>`
  flex: 1;
  padding-bottom: ${(props) => props.bottomInset}px;
`;

const MarkAllButton = styled.TouchableOpacity`
  padding: 8px 16px;
  background-color: ${(props) => props.theme.primary}20;
  border-radius: 20px;
  border: 1px solid ${(props) => props.theme.primary}30;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

const MarkAllText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text.inverse};
`;

const NotificationCard = styled.TouchableOpacity<{ read: boolean }>`
  flex-direction: row;
  padding: 15px 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.divider};
  background-color: ${(props) => (props.read ? props.theme.surface : props.theme.primary + '10')};
  border-radius: 12px;
  margin: 6px 12px;
  elevation: ${(props) => (props.read ? 0 : 2)};
  shadow-color: ${(props) => props.theme.primary}22;
  shadow-offset: 0px 2px;
  shadow-opacity: ${(props) => (props.read ? 0 : 0.10)};
  shadow-radius: 6px;
`;

const NotificationContent = styled.View`
  flex: 1;
`;

const NotificationTitle = styled.Text<{ read: boolean }>`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: ${(props) =>
    props.read
      ? props.theme.text.secondary
      : props.theme.text.primary};
  margin-bottom: 5px;
`;

const NotificationBody = styled.Text<{ read: boolean }>`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) =>
    props.read
      ? props.theme.text.tertiary
      : props.theme.text.secondary};
  margin-bottom: 5px;
`;

const NotificationMeta = styled.Text`
  font-size: 12px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text.tertiary};
  opacity: 0.7;
`;

const EmptyStateContainer = styled.View<{ bottomInset: number }>`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-bottom: ${(props) => props.bottomInset}px;
`;

const EmptyStateText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text.primary};
`;

const NotificationsScreen = () => {
  const { themeMode, notifications, token, markNotificationAsRead, markAllNotificationsAsRead, getUnreadCount, setNotifications } = useAppStore();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch notifications function
  const fetchNotifications = useCallback(async () => {
    if (!token) {
      console.log('No token available for fetching notifications');
      return;
    }

    try {
      console.log('Fetching notifications with token:', token.substring(0, 10) + '...');
      const data = await notificationService.fetchNotifications(token);
      console.log('Fetched notifications data:', data);

      const notificationsWithRead = data.map((n: any) => ({
        _id: n._id,
        title: n.title,
        body: n.body,
        read: typeof n.read === 'boolean' ? n.read : false,
        createdAt: n.createdAt,
        newsId: n.newsId,
      }));

      console.log('Processed notifications:', notificationsWithRead);
      setNotifications(notificationsWithRead);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load notifications',
      });
    }
  }, [token, setNotifications]);

  // Initial load
  useEffect(() => {
    const loadNotifications = async () => {
      console.log('NotificationsScreen: Initial load starting');
      console.log('Current notifications in store:', notifications);
      console.log('Token available:', !!token);

      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    };

    loadNotifications();
  }, [fetchNotifications]);

  // Debug current state
  useEffect(() => {
    console.log('NotificationsScreen: Current state - notifications count:', notifications.length);
    console.log('NotificationsScreen: Loading state:', loading);
    console.log('NotificationsScreen: Refreshing state:', refreshing);
  }, [notifications, loading, refreshing]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
    Toast.show({
      type: 'success',
      text1: 'Refreshed',
      text2: 'Notifications updated',
    });
  }, [fetchNotifications]);

  const handleNotificationPress = async (notification: { _id: string; read: boolean; newsId?: string; title: string; body: string; createdAt: string }) => {
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
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to mark notification as read',
        });
      }
    }

    if (notification.newsId) {
      // @ts-ignore
      // eslint-disable-next-line
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to mark all notifications as read',
      });
    }
  };

  // Define the type for a notification
  interface Notification {
    _id: string;
    read: boolean;
    newsId?: string;
    title: string;
    body: string;
    createdAt: string;
  }

  const renderNotification = ({ item }: { item: Notification }) => (
    <NotificationCard read={item.read} onPress={() => handleNotificationPress(item)}>
      <NotificationContent>
        <NotificationTitle read={item.read}>{item.title}</NotificationTitle>
        <NotificationBody read={item.read}>{item.body}</NotificationBody>
        <NotificationMeta>{new Date(item.createdAt).toLocaleString()}</NotificationMeta>
      </NotificationContent>
      {!item.read && (
        <View style={{ justifyContent: 'center' }}>
          <View style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.primary,
          }} />
        </View>
      )}
    </NotificationCard>
  );

  // Create the right component for the header
  const rightComponent = getUnreadCount() > 0 ? (
    <MarkAllButton onPress={handleMarkAllRead}>
      <MarkAllText>Mark All Read ({getUnreadCount()})</MarkAllText>
    </MarkAllButton>
  ) : null;

  return (
    <SafeContainer edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="Notifications"
        gradient={true}
        rightComponent={rightComponent}
      />

      {loading ? (
        <EmptyStateContainer bottomInset={insets.bottom}>
          <EmptyStateText>Loading notifications...</EmptyStateText>
        </EmptyStateContainer>
      ) : notifications.length > 0 ? (
        <ContentContainer bottomInset={insets.bottom}>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 20),
              paddingTop: 20,
              paddingHorizontal: 0,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
          />
        </ContentContainer>
      ) : (
        <EmptyStateContainer bottomInset={insets.bottom}>
          <EmptyStateText>No notifications yet.</EmptyStateText>
        </EmptyStateContainer>
      )}
    </SafeContainer>
  );
};

export default NotificationsScreen;