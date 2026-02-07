/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Dimensions, Animated } from 'react-native';
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

const TabButton = ({ item, onPress, accessibilityState }: any) => {
  const focused = accessibilityState.selected;
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animation, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      friction: 5,
      tension: 60,
    }).start();
  }, [focused, animation]);

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1]
  });

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2]
  });

  const bgScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const iconName = ICONS[item.route.name] || ['help-circle-outline', 'help-circle'];
  const iconColor = focused ? theme.colors.primary : '#A0A0A0';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tabItem}
    >
      <View style={styles.iconWrapper}>
        <Animated.View 
          style={[
            StyleSheet.absoluteFillObject, 
            styles.activeBackground, 
            { transform: [{ scale: bgScale }] }
          ]} 
        />
        
        <Animated.View style={{ transform: [{ scale }, { translateY }] }}>
          <Ionicons
            name={focused ? iconName[1] : iconName[0]}
            size={24}
            color={iconColor}
            style={styles.icon}
          />
          
          <Animated.Text style={[
            styles.label, 
            { 
              color: iconColor,
              opacity: animation,
              transform: [{ scale: animation }]
            }
          ]}>
            {item.label}
          </Animated.Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
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
            <TabButton 
              key={index}
              item={{ route, label }}
              onPress={onPress}
              accessibilityState={{ selected: isFocused }}
            />
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
      <Tab.Screen name="Transactions" component={TransactionScreen} options={{ title: 'Catat' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
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
    paddingBottom: Platform.OS === 'ios' ? 25 : 15, 
    backgroundColor: 'transparent', 
  },
  
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    width: width * 0.92, 
    height: 70, 
    borderRadius: 25, 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },

  activeBackground: {
    backgroundColor: theme.colors.primary + '15', 
    borderRadius: 30,
  },

  label: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '700',
  },

  icon: {
    alignSelf: 'center',
  },
});