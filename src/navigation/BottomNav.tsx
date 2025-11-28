import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';

import theme from '../theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import TransactionsScreen from '../screens/TransactionScreen';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, string> = {
  Home: 'home',
  Products: 'cube',
  Transactions: 'receipt',
};

function TabItem({ label, iconName, isFocused, onPress }: any) {
  const scale = useSharedValue(isFocused ? 1.12 : 1);
  const translateY = useSharedValue(isFocused ? -8 : 0);
  const labelOp = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withTiming(isFocused ? 1.12 : 1, { duration: 200 });
    translateY.value = withTiming(isFocused ? -8 : 0, { duration: 200 });
    labelOp.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused, scale, translateY, labelOp]);

  const animatedIcon = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const animatedLabel = useAnimatedStyle(() => ({
    opacity: labelOp.value,
    transform: [{ translateY: 6 - 6 * labelOp.value }],
  }));

  return (
    <TouchableOpacity onPress={onPress} style={styles.tabButton} activeOpacity={0.8}>
      <Animated.View style={[styles.iconContainer, isFocused && styles.iconActive, animatedIcon]}>
        <Ionicons name={iconName} size={26} color={isFocused ? theme.colors.accent : theme.colors.icon} />
      </Animated.View>

      <Animated.Text style={[styles.label, isFocused && styles.labelActive, animatedLabel]}>
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

function FloatingTabBar({ state, descriptors: _descriptors, navigation }: any) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.floatingBar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const label = route.name;
          const iconName = ICONS[label];

          const onPress = () => {
            navigation.navigate(route.name);
          };

          return (
            <TabItem key={label} label={label} iconName={iconName} isFocused={isFocused} onPress={onPress} />
          );
        })}
      </View>
    </View>
  );
}

export default function BottomNav() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={FloatingTabBar}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.accent,
    borderRadius: 35,
    paddingHorizontal: 25,
    height: 70,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActive: {
    backgroundColor: theme.colors.card,
  },
  label: {
    fontSize: 11,
    color: theme.colors.icon,
    marginTop: 4,
  },
  labelActive: {
    color: theme.colors.card,
    fontWeight: '600',
  },
});
