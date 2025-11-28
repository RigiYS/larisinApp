import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../theme';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

const API_URL = 'https://690eea50bd0fefc30a0607e8.mockapi.io/products';

const ProductsScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    image: '',
  });

  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data || []);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  
  const handleSave = async () => {
    try {
      if (!form.name || !form.price || !form.stock || !form.image) {
        Alert.alert('Validasi', 'Semua kolom harus diisi');
        return;
      }

      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        image: form.image,
      };

      if (selectedProduct) {
        await axios.put(`${API_URL}/${selectedProduct.id}`, payload);
        Alert.alert('Sukses', 'Produk berhasil diperbarui');
      } else {
        await axios.post(API_URL, payload);
        Alert.alert('Sukses', 'Produk berhasil ditambahkan');
      }

      setModalVisible(false);
      setSelectedProduct(null);
      setForm({ name: '', price: '', stock: '', image: '' });
      fetchProducts();
    } catch {
      Alert.alert('Error', 'Gagal menyimpan produk');
    }
  };

  
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchProducts();
      Alert.alert('Sukses', 'Produk berhasil dihapus');
    } catch {
      Alert.alert('Error', 'Gagal menghapus produk');
    }
  };

  
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setForm({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: product.image,
    });
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Daftar Produk</Text>

      {loading ? (
        <ActivityIndicator size="large" style={styles.activityIndicator} />
      ) : (
        <>
          <View style={styles.searchWrapper}>
            <Icon name="magnify" size={20} color={theme.colors.muted} style={styles.searchIcon} />
            <TextInput
              placeholder="Kamu nyari produk apa?"
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>
          <FlatList
            data={products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))}
            numColumns={2}
            keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>Rp {item.price.toLocaleString()}</Text>
              <Text style={styles.stock}>Stok: {item.stock}</Text>

              <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openEditModal(item)}>
                    <Icon name="pencil" size={20} color={theme.colors.accent} />
                  </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Icon name="delete" size={20} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          />
        </>
  )}

      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setSelectedProduct(null);
          setForm({ name: '', price: '', stock: '', image: '' });
          setModalVisible(true);
        }}>
        <Icon name="plus" size={26} color={theme.colors.card} />
      </TouchableOpacity>

      
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {selectedProduct ? 'Edit Produk' : 'Tambah Produk'}
            </Text>

            <TextInput
              placeholder="Nama Produk"
              style={styles.input}
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
            <TextInput
              placeholder="Harga"
              keyboardType="numeric"
              style={styles.input}
              value={form.price}
              onChangeText={(text) => setForm({ ...form, price: text })}
            />
            <TextInput
              placeholder="Stok"
              keyboardType="numeric"
              style={styles.input}
              value={form.stock}
              onChangeText={(text) => setForm({ ...form, stock: text })}
            />
            <TextInput
              placeholder="URL Gambar Produk"
              style={styles.input}
              value={form.image}
              onChangeText={(text) => setForm({ ...form, image: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnTextCancel}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
                <Text style={styles.btnTextSave}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 15 },
  header: { fontSize: 22, fontWeight: '700', marginVertical: 10, color: theme.colors.text },
  activityIndicator: { marginTop: 50 },
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    margin: 8,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  image: { width: 100, height: 100, borderRadius: 10, marginBottom: 8 },
  name: { fontWeight: '600', fontSize: 16, color: theme.colors.text },
  price: { color: theme.colors.accent, fontWeight: '600', marginVertical: 4 },
  stock: { color: theme.colors.muted, fontSize: 13 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: theme.colors.accent,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 12 },
  btnCancel: {
    marginRight: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  btnSave: { backgroundColor: theme.colors.accent, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  btnTextCancel: { color: theme.colors.placeholder, fontWeight: '600' },
  btnTextSave: { color: theme.colors.card, fontWeight: '700' },
  listContent: { paddingBottom: 180 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, paddingHorizontal: 10, borderRadius: 8, marginBottom: 8 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 8 },
});
