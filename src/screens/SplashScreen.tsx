import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Animated, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import theme from '../theme';

const SplashScreen: React.FC<{onFinish?: () => void}> = ({ onFinish }) => {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        onFinish && onFinish();
      });
    }, 2000);
    return () => clearTimeout(t);
  }, [fade, onFinish]);

  return (
    <ImageBackground
      source={require('../../src/assets/splash.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Animated.View style={[styles.content, { opacity: fade }]}>
        <View style={styles.logoWrapper}>
          {/* native blur behind logo for glass effect */}
          <BlurView
            style={styles.blur}
            blurType={Platform.OS === 'ios' ? 'light' : 'light'}
            blurAmount={18}
            reducedTransparencyFallbackColor="rgba(255,255,255,0.06)"
          />
          <View style={styles.glassHighlight} />
          <Image source={require('../../src/assets/logo-small-circle-512.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>Larisin</Text>
      </Animated.View>
    </ImageBackground>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: theme.colors.accent || '#5B4BFF', justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  logoWrapper: {
    width: 220,
    height: 220,
    borderRadius: 220 / 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: { width: 160, height: 160, resizeMode: 'contain', backgroundColor: 'transparent' },
  glassHighlight: {
    position: 'absolute',
    top: 28,
    left: 36,
    width: 84,
    height: 84,
    borderRadius: 84 / 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
    transform: [{ rotate: '-12deg' }],
  },
  blur: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: 220 / 2,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
});
