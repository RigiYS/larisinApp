import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNav from './src/navigation/BottomNav';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);

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
