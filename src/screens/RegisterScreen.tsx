import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import theme from '../theme';
import { signUp } from '../services/authService';

interface Props {
  onRegisterSuccess?: () => void;
  goToLogin?: () => void;
}

const RegisterScreen: React.FC<Props> = ({ onRegisterSuccess, goToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Validasi', 'Semua kolom wajib diisi');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      Alert.alert('Sukses', 'Pendaftaran berhasil, silakan login');
      onRegisterSuccess && onRegisterSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal mendaftar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar</Text>

      <TextInput
        style={styles.input}
        placeholder="Nama"
        placeholderTextColor={theme.colors.placeholder}
        value={name}
        onChangeText={setName}
      />
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

      <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={theme.colors.card} />
        ) : (
          <Text style={styles.btnPrimaryText}>Daftar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnLink} onPress={goToLogin}>
        <Text style={styles.btnLinkText}>Sudah punya akun? Masuk</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text, marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: theme.colors.inputBackground, borderRadius: 8, padding: 12, marginBottom: 10 },
  btnPrimary: { backgroundColor: theme.colors.accent, paddingVertical: 12, borderRadius: 8, marginTop: 6 },
  btnPrimaryText: { color: theme.colors.card, textAlign: 'center', fontWeight: '700' },
  btnLink: { marginTop: 12 },
  btnLinkText: { color: theme.colors.accent, textAlign: 'center', fontWeight: '600' },
});
