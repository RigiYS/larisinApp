import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomNav from './src/navigation/BottomNav';

export default function App() {
  return (
    <NavigationContainer>
      <BottomNav />
    </NavigationContainer>
  );
}
