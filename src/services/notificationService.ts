import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string | object>;
}

/**
 * Request permission untuk push notification (iOS)
 */
export const requestUserPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    }
    // Android otomatis granted
    return true;
  } catch (error) {
    console.log('Gagal request permission notifikasi:', error);
    return false;
  }
};

/**
 * Dapatkan FCM token perangkat
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.log('Gagal dapatkan FCM token:', error);
    return null;
  }
};

/**
 * Setup handler untuk notifikasi saat app di foreground
 */
export const setupForegroundNotificationHandler = (
  onNotification: (payload: NotificationPayload) => void
) => {
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log('Notifikasi diterima (foreground):', remoteMessage);
    if (remoteMessage.notification) {
      onNotification({
        title: remoteMessage.notification.title || 'Notifikasi',
        body: remoteMessage.notification.body || '',
        data: remoteMessage.data,
      });
    }
  });
  return unsubscribe;
};

/**
 * Setup handler untuk notifikasi background
 * Harus dipanggil di luar component, di awal app
 */
export const setupBackgroundNotificationHandler = (
  onNotification: (payload: NotificationPayload) => void
) => {
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('App dibuka dari notifikasi:', remoteMessage);
    if (remoteMessage?.notification) {
      onNotification({
        title: remoteMessage.notification.title || 'Notifikasi',
        body: remoteMessage.notification.body || '',
        data: remoteMessage.data as Record<string, string | object> | undefined,
      });
    }
  });

  // Cek notifikasi yang dibuka saat cold start
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage?.notification) {
        onNotification({
          title: remoteMessage.notification.title || 'Notifikasi',
          body: remoteMessage.notification.body || '',
          data: remoteMessage.data as Record<string, string | object> | undefined,
        });
      }
    });
};

/**
 * Subscribe ke topic untuk notifikasi broadcast
 */
export const subscribeToTopic = async (topic: string): Promise<void> => {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`Subscribe ke topic: ${topic}`);
  } catch (error) {
    console.log('Gagal subscribe topic:', error);
  }
};

/**
 * Unsubscribe dari topic
 */
export const unsubscribeFromTopic = async (topic: string): Promise<void> => {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`Unsubscribe dari topic: ${topic}`);
  } catch (error) {
    console.log('Gagal unsubscribe topic:', error);
  }
};

/**
 * Cek apakah notifikasi enabled
 */
export const isNotificationEnabled = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    }
    return true;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
};

/**
 * Setup notifikasi saat app startup
 * Panggil ini di App.tsx atau index.js
 */
export const initializeNotifications = async (
  onNotification: (payload: NotificationPayload) => void
): Promise<string | null> => {
  try {
    // Request permission
    const permitted = await requestUserPermission();
    if (!permitted) {
      console.log('User tidak memberikan permission notifikasi');
      return null;
    }

    // Setup handlers
    setupBackgroundNotificationHandler(onNotification);
    setupForegroundNotificationHandler(onNotification);

    // Get FCM token
    const token = await getFCMToken();
    if (token) {
      console.log('FCM Token:', token);
    }

    // Subscribe ke topic default (opsional)
    await subscribeToTopic('all_users');

    return token;
  } catch (error) {
    console.log('Error initialize notifikasi:', error);
    return null;
  }
};
