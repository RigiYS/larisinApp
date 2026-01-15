import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import theme from '../theme';
import { signIn } from '../services/authService';

interface Props {
  onLoginSuccess?: () => void;
  goToRegister?: () => void;
}

const LoginScreen: React.FC<Props> = ({ onLoginSuccess, goToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validasi', 'Email dan kata sandi wajib diisi');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      Alert.alert('Sukses', 'Login berhasil');
      onLoginSuccess && onLoginSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Masuk</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={theme.colors.placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Kata Sandi"
        placeholderTextColor={theme.colors.placeholder}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={theme.colors.card} />
        ) : (
          <Text style={styles.btnPrimaryText}>Masuk</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnLink} onPress={goToRegister}>
        <Text style={styles.btnLinkText}>Belum punya akun? Daftar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text, marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: theme.colors.inputBackground, borderRadius: 8, padding: 12, marginBottom: 10 },
  btnPrimary: { backgroundColor: theme.colors.accent, paddingVertical: 12, borderRadius: 8, marginTop: 6 },
  btnPrimaryText: { color: theme.colors.card, textAlign: 'center', fontWeight: '700' },
  btnLink: { marginTop: 12 },
  btnLinkText: { color: theme.colors.accent, textAlign: 'center', fontWeight: '600' },
});
