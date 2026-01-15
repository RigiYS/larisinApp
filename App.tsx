import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNav from './src/navigation/BottomNav';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { onAuthStateChanged } from './src/services/authService';
import { initializeNotifications } from './src/services/notificationService';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    // Subscribe ke auth state
    const unsubscribe = onAuthStateChanged((user) => {
      setAuthenticated(!!user);
    });

    // Init notifikasi (ignore hasil token di sini)
    initializeNotifications(() => {
      // Bisa arahkan ke halaman tertentu berdasarkan data notifikasi
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      {authenticated ? (
        <BottomNav />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {({ navigation }) => (
              <LoginScreen
                onLoginSuccess={() => setAuthenticated(true)}
                goToRegister={() => navigation.navigate('Register')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {({ navigation }) => (
              <RegisterScreen
                onRegisterSuccess={() => setAuthenticated(true)}
                goToLogin={() => navigation.navigate('Login')}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
