import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import theme from '../theme';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import eventBus from '../utils/eventBus';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface Transaction {
  id?: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
  date: string;
}

const PRODUCTS_API = 'https://690eea50bd0fefc30a0607e8.mockapi.io/products';
const TRANSACTIONS_API = 'https://691159ac7686c0e9c20d1ec7.mockapi.io/transactions';

const TransactionsScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [query, setQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [receipt, setReceipt] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  
  const fetchProducts = async () => {
    try {
      const res = await axios.get(PRODUCTS_API);
      setProducts(res.data);
    } catch {
      Alert.alert('Error', 'Gagal mengambil data produk');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  
  const addToCart = (id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  
  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id] -= 1;
      else delete newCart[id];
      return newCart;
    });
  };

  
  const total = Object.keys(cart).reduce((sum, id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return sum;
    return sum + product.price * cart[id];
  }, 0);

  
  const handleCheckout = async () => {
    if (Object.keys(cart).length === 0) {
      Alert.alert('Kosong', 'Keranjang masih kosong');
      return;
    }

    try {
      setLoading(true);

      const items = Object.keys(cart).map((id) => {
        const product = products.find((p) => p.id === id)!;
        return {
          name: product.name,
          price: product.price,
          quantity: cart[id],
        };
      });

      
      for (const id of Object.keys(cart)) {
        const product = products.find((p) => p.id === id)!;
        const newStock = product.stock - cart[id];
        await axios.put(`${PRODUCTS_API}/${id}`, { ...product, stock: newStock });
      }

      
      const newTransaction = {
        items,
        total,
        date: new Date().toISOString(),
      };

      await axios.post(TRANSACTIONS_API, newTransaction);
      
      eventBus.emit('transactions:changed', newTransaction);
      setReceipt(newTransaction);
      setModalVisible(true);

      setCart({});
      fetchProducts();
    } catch {
      Alert.alert('Error', 'Gagal menyimpan transaksi');
    } finally {
      setLoading(false);
    }
  };

  
  const formatRupiah = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;
  const formatDate = (date: string) =>
    new Date(date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaksi Penjualan</Text>

      <TextInput
        placeholder="Kamu nyari produk apa?"
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
      />

      <FlatList
        data={products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{formatRupiah(item.price)}</Text>
            <Text style={styles.stock}>Stok: {item.stock}</Text>

            <View style={styles.cartActions}>
              <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                <Icon name="minus-circle" size={22} color="#E94F37" />
              </TouchableOpacity>
              <Text style={styles.qty}>{cart[item.id] || 0}</Text>
              <TouchableOpacity onPress={() => addToCart(item.id)}>
                <Icon name="plus-circle" size={22} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      
      <View style={styles.footer}>
        <Text style={styles.totalText}>Total: {formatRupiah(total)}</Text>
        <TouchableOpacity
          style={styles.btnCheckout}
          onPress={handleCheckout}
          disabled={loading}>
          <Text style={styles.btnCheckoutText}>
            {loading ? 'Memproses...' : 'Catat transaksi'}
          </Text>
        </TouchableOpacity>
      </View>

      
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptBox}>
            <Text style={styles.receiptTitle}>Struk Pembayaran</Text>
            <ScrollView>
              {receipt?.items.map((item, idx) => (
                <View key={idx} style={styles.receiptItem}>
                  <Text style={styles.itemText}>
                    {item.name} x {item.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>{formatRupiah(item.price * item.quantity)}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.receiptDivider} />
            <Text style={styles.receiptTotal}>Total: {formatRupiah(receipt?.total || 0)}</Text>
            <Text style={styles.receiptDate}>{formatDate(receipt?.date || '')}</Text>

            <TouchableOpacity
              style={styles.btnClose}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.btnCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TransactionsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 15 },
  header: { fontSize: 22, fontWeight: '700', marginVertical: 10, color: '#333' },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 12,
    padding: 10,
  },
  name: { fontWeight: '600', fontSize: 16, color: '#333' },
  price: { color: '#4A90E2', fontWeight: '600', marginVertical: 4 },
  stock: { color: '#888', fontSize: 13 },
  cartActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  qty: { fontSize: 16, fontWeight: '700', color: '#333' },
  listContent: { paddingBottom: 120 },
  searchInput: { backgroundColor: '#fff', padding: 8, borderRadius: 8, marginBottom: 8 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: { fontSize: 18, fontWeight: '700', color: '#333' },
  btnCheckout: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnCheckoutText: { color: '#fff', fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  receiptTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  itemText: { color: '#333', fontSize: 15 },
  itemPrice: { fontWeight: '600', color: '#4A90E2' },
  receiptDivider: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10,
  },
  receiptTotal: { fontSize: 18, fontWeight: '700', textAlign: 'right', color: '#000' },
  receiptDate: { fontSize: 13, color: '#666', textAlign: 'right', marginTop: 6 },
  btnClose: {
    backgroundColor: '#4A90E2',
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
  },
  btnCloseText: { textAlign: 'center', color: '#fff', fontWeight: '700' },
});
