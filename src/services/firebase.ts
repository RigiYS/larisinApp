import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';

/**
 * Firebase services for React Native
 * @react-native-firebase auto-initializes from native config files:
 * - Android: google-services.json
 * - iOS: GoogleService-Info.plist
 */

export const firebaseAuth = auth();
export const firebaseDb = firestore();
export const firebaseStorage = storage();
export const firebaseMessaging = messaging();

export default {
  auth: firebaseAuth,
  db: firebaseDb,
  storage: firebaseStorage,
  messaging: firebaseMessaging,
};
