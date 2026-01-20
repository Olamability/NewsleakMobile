import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
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
    console.log('Failed to get push token for push notification!');
    return;
  }
  
  token = (await Notifications.getExpoPushTokenAsync()).data;
  
  await saveTokenToDatabase(token);

  return token;
}

async function saveTokenToDatabase(token: string) {
  try {
    const savedToken = await AsyncStorage.getItem('expo_push_token');
    
    if (savedToken === token) {
      return;
    }

    const { error } = await supabase
      .from('user_devices')
      .upsert(
        {
          expo_push_token: token,
          platform: Platform.OS,
          is_active: true,
        },
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
  const receivedSubscription = Notifications.addNotificationReceivedListener(onNotificationReceived);

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(onNotificationTapped);

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
