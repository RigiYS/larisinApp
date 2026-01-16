/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Image,
  StatusBar,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
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

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARD_WIDTH = (width / 2) - (CARD_MARGIN * 2);

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
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // --- LOGIC CART ---
  const addToCart = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product && (cart[id] || 0) < product.stock) {
        setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    } else {
        Alert.alert('Stok Habis', 'Stok produk tidak mencukupi.');
    }
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

  const totalQty = Object.values(cart).reduce((a, b) => a + b, 0);

  const handleCheckout = async () => {
    if (Object.keys(cart).length === 0) return;
    
    const user = firebaseAuth.currentUser;
    if (!user) return Alert.alert('Autentikasi', 'Silakan login ulang');

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

      // Update Stok
      for (const id of Object.keys(cart)) {
        const product = products.find((p) => p.id === id)!;
        await updateProduct(id, { stock: product.stock - cart[id] });
      }

      const newTransaction: any = {
        userId: user.uid,
        items,
        totalAmount: total,
        status: 'completed',
        paymentMethod: 'cash',
        createdAt: new Date().toISOString(),
      };

      await addTransaction(newTransaction);
      setReceipt({ ...newTransaction, id: 'local' });
      setModalVisible(true);
      setCart({});
    } catch (e) {
      Alert.alert('Error', 'Gagal memproses transaksi');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

  // --- RENDER ITEMS ---
  const renderProductItem = ({ item }: { item: Product }) => {
    const qty = cart[item.id] || 0;
    const isOutOfStock = item.stock <= 0;
    
    return (
      <View style={styles.cardContainer}>
        <View style={[styles.card, isOutOfStock && styles.cardDisabled]}>
            {/* Badge Qty */}
            {qty > 0 && (
            <View style={styles.badgeQty}>
                <Text style={styles.badgeQtyText}>{qty}</Text>
            </View>
            )}

            <View style={styles.imageWrapper}>
                 <Image source={{ uri: item.image }} style={[styles.productImage, isOutOfStock && { opacity: 0.5 }]} />
                 {isOutOfStock && (
                     <View style={styles.outOfStockOverlay}>
                         <Text style={styles.outOfStockText}>Habis</Text>
                     </View>
                 )}
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productPrice}>{formatRupiah(item.price)}</Text>
                
                <View style={styles.stockRow}>
                    <Icon name="package-variant-closed" size={12} color="#9CA3AF" />
                    <Text style={styles.productStock}>Stok: {item.stock}</Text>
                </View>

                {/* Controls */}
                <View style={styles.actionContainer}>
                    {qty > 0 ? (
                        <View style={styles.stepper}>
                            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.stepBtn}>
                                <Icon name="minus" size={16} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.stepVal}>{qty}</Text>
                            <TouchableOpacity onPress={() => addToCart(item.id)} style={styles.stepBtn}>
                                <Icon name="plus" size={16} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            style={[styles.btnAdd, isOutOfStock && styles.btnAddDisabled]} 
                            onPress={() => !isOutOfStock && addToCart(item.id)}
                            disabled={isOutOfStock}
                        >
                            <Text style={styles.btnAddText}>{isOutOfStock ? 'Habis' : 'Tambah'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header Fixed */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
             <View>
                <Text style={styles.headerTitle}>Kasir</Text>
                <Text style={styles.headerSubtitle}>Pilih produk untuk transaksi</Text>
             </View>
             <View style={styles.headerIconBg}>
                <Icon name="cart-outline" size={24} color={theme.colors.primary} />
             </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#9CA3AF" />
            <TextInput
                placeholder="Cari produk..."
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholderTextColor="#9CA3AF"
            />
            {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                    <Icon name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
            )}
        </View>
      </View>

      {/* Product List */}
      <FlatList
        data={products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 120 }} />} // PENTING: Space agar item terakhir tidak ketutup
      />

      {/* Checkout Floating Bar - FIXED POSITION */}
      {totalQty > 0 && (
        <View style={styles.checkoutWrapper}>
            <View style={styles.checkoutBar}>
                <View style={styles.totalInfo}>
                    <Text style={styles.totalLabel}>Total ({totalQty} item)</Text>
                    <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
                </View>

                <TouchableOpacity 
                    style={styles.payButton} 
                    onPress={handleCheckout}
                    disabled={loading}
                >
                    <Text style={styles.payButtonText}>{loading ? '...' : 'Bayar'}</Text>
                    <Icon name="arrow-right" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
      )}

      {/* Receipt Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.receiptPaper}>
             <View style={styles.holePattern}>
                {[...Array(12)].map((_, i) => <View key={i} style={styles.hole} />)}
             </View>
             
             <View style={styles.receiptBody}>
                <View style={styles.successIcon}>
                    <Icon name="check" size={32} color="#FFF" />
                </View>
                <Text style={styles.receiptHeader}>Transaksi Berhasil!</Text>
                <Text style={styles.receiptDate}>
                    {new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                </Text>

                <View style={styles.divider} />

                <View style={styles.itemsList}>
                    {receipt?.items.map((item, idx) => (
                        <View key={idx} style={styles.itemRow}>
                            <View style={{flex: 1}}>
                                <Text style={styles.itemName}>{item.productName}</Text>
                                <Text style={styles.itemDetail}>{item.quantity} x {formatRupiah(item.price)}</Text>
                            </View>
                            <Text style={styles.itemTotal}>{formatRupiah(item.price * item.quantity)}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabelFinal}>TOTAL BAYAR</Text>
                    <Text style={styles.totalValueFinal}>{formatRupiah(receipt?.totalAmount || 0)}</Text>
                </View>

                <TouchableOpacity 
                    style={styles.closeBtn} 
                    onPress={() => setModalVisible(false)}
                >
                    <Text style={styles.closeBtnText}>Tutup & Transaksi Baru</Text>
                </TouchableOpacity>
             </View>
             
             {/* Zigzag Bottom Effect */}
             <View style={styles.zigzagContainer} /> 
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default TransactionsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // Header
  header: {
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerIconBg: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1F2937',
  },

  // List
  listContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingTop: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'visible', // allow badge to pop out
  },
  cardDisabled: {
    opacity: 0.8,
    backgroundColor: '#F3F4F6',
  },
  badgeQty: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.secondary,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFF',
    paddingHorizontal: 6,
  },
  badgeQtyText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  imageWrapper: {
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#FFF',
    fontWeight: 'bold',
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  cardContent: {
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
    gap: 4,
  },
  productStock: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  actionContainer: {
    height: 32,
  },
  btnAdd: {
    flex: 1,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAddDisabled: {
    backgroundColor: '#E5E7EB',
  },
  btnAddText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    height: '100%',
  },
  stepBtn: {
    width: 32,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },

  // Checkout Bar (Floating)
  checkoutWrapper: {
    position: 'absolute',
    // INI PERBAIKANNYA: Diangkat 90px agar tidak tertutup Navbar
    bottom: Platform.OS === 'ios' ? 100 : 90, 
    left: 20,
    right: 20,
    zIndex: 100,
  },
  checkoutBar: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  totalInfo: {
    flex: 1,
  },
  totalLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  totalValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Modal Receipt
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  receiptPaper: {
    width: '100%',
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  holePattern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937', 
    height: 12,
    marginBottom: -6,
    zIndex: 1,
  },
  hole: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    marginTop: -10,
  },
  receiptBody: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 30,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  receiptDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 1,
  },
  itemsList: {
    width: '100%',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  itemDetail: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  totalLabelFinal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  totalValueFinal: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  closeBtn: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  zigzagContainer: {
    height: 10,
    backgroundColor: '#FFF',
  }
});