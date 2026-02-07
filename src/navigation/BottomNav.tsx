/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from '../theme';

import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import TransactionScreen from '../screens/TransactionScreen'; 
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const ICONS: Record<string, string[]> = {
  Home: ['home-outline', 'home'],
  Products: ['grid-outline', 'grid'],
  Transactions: ['receipt-outline', 'receipt'],
  Profile: ['person-outline', 'person'],
};

const MyTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;
          const iconName = ICONS[route.name] || ['help-circle-outline', 'help-circle'];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
                <Ionicons
                  name={isFocused ? iconName[1] : iconName[0]}
                  size={20}
                  color={isFocused ? theme.colors.primary : '#A0A0A0'}
                />
                <Text style={[styles.label, isFocused && styles.labelActive]}>
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const BottomNav = () => {
  return (
    <Tab.Navigator
      tabBar={props => <MyTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Products" component={ProductsScreen} options={{ title: 'Produk' }} />
      <Tab.Screen name="Transactions" component={TransactionScreen} options={{ title: 'Transaksi' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Akun' }} />
    </Tab.Navigator>
  );
}

export default BottomNav;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, 
    backgroundColor: 'transparent', 
  },
  
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    width: width * 0.92, 
    height: 65,
    borderRadius: 20, 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },

  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  iconWrapperActive: {
    backgroundColor: theme.colors.primary + '10', 
  },

  label: {
    fontSize: 10,
    marginTop: 4,
    color: '#A0A0A0', 
    fontWeight: '500',
  },

  labelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});