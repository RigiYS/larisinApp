import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CoolTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const anims = useRef(state.routes.map((r, i) => new Animated.Value(state.index === i ? 1 : 0))).current;

  useEffect(() => {
    anims.forEach((v, i) => {
      Animated.spring(v, {
        toValue: state.index === i ? 1 : 0,
        useNativeDriver: true,
        friction: 12,
        tension: 160,
      }).start();
    });
  }, [state.index, anims]);

  const handlePress = (routeName: string, routeKey: string) => {
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(routeName);
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
  let iconName = 'receipt';
  if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
  else if (route.name === 'Products') iconName = focused ? 'cube' : 'cube-outline';
  else if (route.name === 'Transactions') iconName = 'receipt';
        const anim = anims[index];

        const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
        const labelOpacity = anim;
        const labelTranslate = anim.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });

  const descriptor = descriptors?.[route.key];
  const badge = descriptor?.options?.tabBarBadge ?? (route as any).params?.badge;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            activeOpacity={0.9}
            onPress={() => handlePress(route.name, route.key)}
          >
        <Animated.View style={{ transform: [{ scale }] }}>
          <MaterialCommunityIcons name={iconName} size={22} color={focused ? '#ffffff' : '#ffffffde'} />
              {badge != null && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{String(badge)}</Text>
                </View>
              )}
            </Animated.View>
            <Animated.Text style={[styles.label, focused ? styles.labelActive : styles.labelInactive, { opacity: labelOpacity, transform: [{ translateY: labelTranslate }] }]}> 
              {route.name}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CoolTabBar;

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#000000ff',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  label: {
    fontSize: 11,
    color: '#e6e6e6',
    marginTop: 2,
  },
  labelActive: {
    color: '#ffffff',
  },
  labelInactive: {
    color: '#ffffde',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
