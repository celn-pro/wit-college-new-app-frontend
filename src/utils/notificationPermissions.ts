import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await messaging().requestPermission();
    const enabled = granted === messaging.AuthorizationStatus.AUTHORIZED;
    if (!enabled) {
      Alert.alert(
        'Notification Permission',
        'Please enable notifications to receive news updates.'
      );
    }
    return enabled;
  }
  return true;
};

export const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};