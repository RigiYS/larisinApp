import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import theme from '../theme';

interface Props {
  onLoginSuccess?: () => void;
  goToRegister?: () => void;
}

const LoginScreen: React.FC<Props> = ({ onLoginSuccess, goToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Validasi', 'Email dan kata sandi wajib diisi');
      return;
    }
    onLoginSuccess && onLoginSuccess();
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

      <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
        <Text style={styles.btnPrimaryText}>Masuk</Text>
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
