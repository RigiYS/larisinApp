import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import TransactionsScreen from '../screens/TransactionScreen';
import CoolTabBar from '../components/CoolTabBar';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const renderTabBar = (props: BottomTabBarProps) => <CoolTabBar {...props} />;

import theme from '../theme';

const screenOptions = () => ({
  headerShown: false,
  tabBarActiveTintColor: theme.colors.accent,
  tabBarInactiveTintColor: theme.colors.icon,
});

export default function BottomNav() {
  return (
    <Tab.Navigator screenOptions={screenOptions} tabBar={renderTabBar}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
    </Tab.Navigator>
  );
}
