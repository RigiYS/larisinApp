/* eslint-disable no-undef */
import 'react-native-gesture-handler/jestSetup';

// Mock Firebase Auth
jest.mock('@react-native-firebase/auth', () => {
  return () => ({
    onAuthStateChanged: jest.fn(),
    currentUser: { uid: 'test-user', email: 'test@example.com' },
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  });
});

jest.mock('@react-native-firebase/firestore', () => {
  const mockCollection = {
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      onSnapshot: jest.fn(),
    })),
    where: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ docs: [] })),
      onSnapshot: jest.fn(),
      orderBy: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({ docs: [] })),
      })),
    })),
    add: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
    orderBy: jest.fn(() => ({
       get: jest.fn(() => Promise.resolve({ docs: [] })),
    })),
  };

  return () => ({
    collection: jest.fn(() => mockCollection),
  });
});

jest.mock('@react-native-firebase/storage', () => {
  return () => ({
    ref: jest.fn(() => ({
      putFile: jest.fn(),
      getDownloadURL: jest.fn(() => Promise.resolve('https://mock-url.com/img.png')),
    })),
  });
});

jest.mock('@react-native-firebase/messaging', () => {
  return () => ({
    getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    setBackgroundMessageHandler: jest.fn(),
    requestPermission: jest.fn(() => Promise.resolve(1)),
  });
});