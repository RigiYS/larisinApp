/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions
} from 'react-native';
import theme from '../theme';
import { signUp } from '../services/authService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props {
  onRegisterSuccess?: () => void;
  goToLogin?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { width } = Dimensions.get('window');

const RegisterScreen: React.FC<Props> = ({ onRegisterSuccess, goToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Validasi', 'Mohon lengkapi semua data diri Anda.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Kata Sandi Lemah', 'Kata sandi minimal harus 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      Alert.alert('Berhasil', 'Akun berhasil dibuat! Silakan login.');
      onRegisterSuccess && onRegisterSuccess();
    } catch (error: any) {
      Alert.alert('Gagal Daftar', error.message || 'Terjadi kesalahan saat mendaftar.');
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
        {/* Decorative Circle (Top Left) - Mirroring Login Screen style but inverted position */}
        <View style={styles.decorativeCircle} />

        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goToLogin} style={styles.backButton}>
             <Icon name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Buat Akun Baru</Text>
          <Text style={styles.subtitle}>Bergabunglah untuk mengelola bisnis Anda.</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <View style={styles.inputContainer}>
              <Icon name="account-outline" size={22} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nama Toko / Pemilik"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alamat Email</Text>
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
            <Text style={styles.label}>Kata Sandi</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={22} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Minimal 6 karakter"
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
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.btnPrimary, loading && styles.btnDisabled]} 
            onPress={handleRegister} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.btnPrimaryText}>Daftar Sekarang</Text>
            )}
            {!loading && <Icon name="chevron-right" size={20} color="#FFFFFF" style={{marginLeft: 4}} />}
          </TouchableOpacity>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Sudah memiliki akun? </Text>
          <TouchableOpacity onPress={goToLogin}>
            <Text style={styles.linkText}>Masuk di sini</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  
  // Elemen Dekoratif (Lingkaran di pojok kiri atas)
  decorativeCircle: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primary + '10', // Transparan 10%
    zIndex: -1,
  },

  // Header Styles
  header: {
    marginBottom: 30,
    marginTop: 20, // Tambah jarak dari status bar
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 10,
    marginLeft: -8, // Align optik dengan margin kiri
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },

  // Form Styles
  formContainer: {
    marginBottom: 20,
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
    backgroundColor: '#F3F4F6', // Abu-abu muda modern
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

  // Button Styles
  btnPrimary: {
    backgroundColor: theme.colors.primary, // Gunakan Primary agar konsisten dengan Login
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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

  // Footer Styles
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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