import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if app is running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Only set notification handler if not in Expo Go
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function registerForPushNotificationsAsync() {
  // Skip push notification registration in Expo Go
  if (isExpoGo) {
    console.warn(
      'Push notifications are not supported in Expo Go. ' +
        'To use push notifications, create a development build. ' +
        'Learn more: https://docs.expo.dev/develop/development-builds/introduction/'
    );
    return;
  }

  try {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1E40AF',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;

    await saveTokenToDatabase(token);

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    // Don't throw - gracefully handle the error
    return;
  }
}

async function saveTokenToDatabase(token: string) {
  try {
    const savedToken = await AsyncStorage.getItem('expo_push_token');

    if (savedToken === token) {
      return;
    }

    const { error } = await supabase.from('user_devices').upsert(
      [
        {
          expo_push_token: token,
          platform: Platform.OS as 'ios' | 'android' | 'windows' | 'macos' | 'web',
          is_active: true,
        },
      ] as any,
      {
        onConflict: 'expo_push_token',
      }
    );

    if (error) {
      console.error('Error saving push token:', error);
    } else {
      await AsyncStorage.setItem('expo_push_token', token);
    }
  } catch (error) {
    console.error('Error in saveTokenToDatabase:', error);
  }
}

export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationTapped: (response: Notifications.NotificationResponse) => void
) {
  const receivedSubscription =
    Notifications.addNotificationReceivedListener(onNotificationReceived);

  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener(onNotificationTapped);

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
