import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import theme from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, price: number, stock: number) => void;
}

const AddProductModal: React.FC<Props> = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const handleSave = () => {
    if (!name.trim() || !price || !stock) {
      Alert.alert('Error', 'Semua field wajib diisi!');
      return;
    }
    onSave(name, parseFloat(price), parseInt(stock, 10));
    setName('');
    setPrice('');
    setStock('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Tambah  Produk Baru</Text>
          <TextInput placeholder="Nama Produk" style={styles.input} value={name} onChangeText={setName} />
          <TextInput placeholder="Harga" keyboardType="numeric" style={styles.input} value={price} onChangeText={setPrice} />
          <TextInput placeholder="Stok" keyboardType="numeric" style={styles.input} value={stock} onChangeText={setStock} />
          <View style={styles.buttons}>
            <Button title="Batal" onPress={onClose} />
            <Button title="Simpan" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: theme.colors.card, padding: 20, borderRadius: 10, width: '85%' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: theme.colors.border, padding: 10, borderRadius: 8, marginVertical: 5 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});

export default AddProductModal;