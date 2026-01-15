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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { firebaseAuth } from '../services/firebase';
import {
  onProductsChanged,
  updateProduct,
  Product,
} from '../services/productService';
import {
  addTransaction,
  Transaction,
} from '../services/transactionService';

const TransactionsScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [query, setQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [receipt, setReceipt] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    const unsubscribe = onProductsChanged(
      (items) => setProducts(items),
      () => Alert.alert('Error', 'Gagal mengambil data produk')
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
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

    const user = firebaseAuth.currentUser;
    if (!user) {
      Alert.alert('Autentikasi', 'Silakan login ulang');
      return;
    }

    try {
      setLoading(true);

      const items = Object.keys(cart).map((id) => {
        const product = products.find((p) => p.id === id)!;
        return {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: cart[id],
          subtotal: product.price * cart[id],
        };
      });

      // Kurangi stok di Firestore
      for (const id of Object.keys(cart)) {
        const product = products.find((p) => p.id === id)!;
        const newStock = product.stock - cart[id];
        await updateProduct(id, { stock: newStock });
      }

      const newTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        items,
        totalAmount: total,
        status: 'completed',
        paymentMethod: 'cash',
        notes: '',
        receiptUrl: '',
      };

      await addTransaction(newTransaction);

      const now = new Date().toISOString();
      setReceipt({
        ...newTransaction,
        id: 'local',
        createdAt: now,
        updatedAt: now,
      });
      setModalVisible(true);

      setCart({});
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
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{formatRupiah(item.price)}</Text>
            <Text style={styles.stock}>Stok: {item.stock}</Text>

            <View style={styles.cartActions}>
              <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                <Icon name="minus-circle" size={22} color={theme.colors.danger} />
              </TouchableOpacity>
              <Text style={styles.qty}>{cart[item.id] || 0}</Text>
              <TouchableOpacity onPress={() => addToCart(item.id)}>
                <Icon name="plus-circle" size={22} color={theme.colors.accent} />
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
                    {item.productName} x {item.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>{formatRupiah(item.price * item.quantity)}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.receiptDivider} />
            <Text style={styles.receiptTotal}>Total: {formatRupiah(receipt?.totalAmount || 0)}</Text>
            <Text style={styles.receiptDate}>{formatDate(receipt?.createdAt || '')}</Text>

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
  header: { fontSize: 22, fontWeight: '700', marginVertical: 10, color: theme.colors.text },
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    margin: 8,
    borderRadius: 12,
    padding: 10,
  },
  name: { fontWeight: '600', fontSize: 16, color: theme.colors.text },
  price: { color: theme.colors.accent, fontWeight: '600', marginVertical: 4 },
  stock: { color: theme.colors.muted, fontSize: 13 },
  cartActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  qty: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  listContent: { paddingBottom: 200 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, paddingHorizontal: 10, borderRadius: 8, marginBottom: 8 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 8 },
  footer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    padding: 16,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  btnCheckout: {
    backgroundColor: theme.colors.accent,
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
    backgroundColor: theme.colors.card,
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
  itemText: { color: theme.colors.text, fontSize: 15 },
  itemPrice: { fontWeight: '600', color: theme.colors.accent },
  receiptDivider: {
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    marginVertical: 10,
  },
  receiptTotal: { fontSize: 18, fontWeight: '700', textAlign: 'right', color: theme.colors.text },
  receiptDate: { fontSize: 13, color: theme.colors.placeholder, textAlign: 'right', marginTop: 6 },
  btnClose: {
    backgroundColor: theme.colors.accent,
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
  },
  btnCloseText: { textAlign: 'center', color: theme.colors.card, fontWeight: '700' },
});
