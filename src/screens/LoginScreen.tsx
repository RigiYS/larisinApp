/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions
} from 'react-native';
import theme from '../theme';
import { signIn } from '../services/authService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props {
  onLoginSuccess?: () => void;
  goToRegister?: () => void;
}

const { width } = Dimensions.get('window');

const LoginScreen: React.FC<Props> = ({ onLoginSuccess, goToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validasi', 'Mohon isi email dan kata sandi Anda.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Feedback sukses opsional, biasanya langsung redirect
      onLoginSuccess && onLoginSuccess();
    } catch (error: any) {
      Alert.alert('Gagal Masuk', error.message || 'Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decorative Circle Background */}
        <View style={styles.decorativeCircle} />

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="storefront" size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Selamat Datang!</Text>
          <Text style={styles.subtitle}>
            Silakan masuk untuk mengelola toko Anda.
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Icon name="email-outline" size={22} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="contoh@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={22} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.forgotPassBtn}>
                <Text style={styles.forgotPassText}>Lupa kata sandi?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.btnPrimary, loading && styles.btnDisabled]} 
            onPress={handleLogin} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.btnPrimaryText}>Masuk Sekarang</Text>
            )}
            {!loading && <Icon name="arrow-right" size={20} color="#FFFFFF" style={styles.arrowIcon} />}
          </TouchableOpacity>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Belum memiliki akun? </Text>
          <TouchableOpacity onPress={goToRegister}>
            <Text style={styles.linkText}>Daftar Gratis</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Clean White Background
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 30,
  },
  decorativeCircle: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.primary + '10', // 10% opacity
    zIndex: -1,
  },

  // Header Styles
  header: {
    alignItems: 'flex-start', // Left align looks more modern for forms
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15', // Light tint background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937', // Darker text for readability
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280', // Soft gray
    lineHeight: 24,
  },

  // Form Styles
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // Light gray background instead of border
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPassText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Button Styles
  btnPrimary: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    // Modern Shadow
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  btnDisabled: {
    opacity: 0.7,
    elevation: 0,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  arrowIcon: {
    marginLeft: 8,
  },

  // Footer Styles
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto', // Push to bottom if space available
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});