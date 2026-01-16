/* eslint-disable react-native/no-inline-styles */
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
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import {
  onProductsChanged,
  addProduct as addProductDb,
  updateProduct as updateProductDb,
  deleteProduct as deleteProductDb,
  Product as ProductDb,
} from '../services/productService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../theme';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

const { width } = Dimensions.get('window');
// Menghitung lebar kartu agar pas 2 kolom dengan margin
const CARD_MARGIN = 12;
const CARD_WIDTH = (width / 2) - (CARD_MARGIN * 2);

const ProductsScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // State Form
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    image: '',
  });

  const fetchProducts = () => {
    setLoading(true);
    const unsubscribe = onProductsChanged(
      (items) => {
        const mapped: Product[] = items.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          image: p.image || '',
        }));
        setProducts(mapped);
        setLoading(false);
      },
      () => {
        Alert.alert('Error', 'Gagal memuat produk');
        setLoading(false);
      }
    );
    return unsubscribe;
  };

  useEffect(() => {
    const unsub = fetchProducts();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const handleSave = async () => {
    try {
      if (!form.name || !form.price || !form.stock || !form.image) {
        Alert.alert('Validasi', 'Semua kolom wajib diisi');
        return;
      }

      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        image: form.image,
      };

      if (selectedProduct) {
        await updateProductDb(selectedProduct.id, payload);
      } else {
        await addProductDb(payload as Omit<ProductDb, 'id'>);
      }

      setModalVisible(false);
      resetForm();
    } catch {
      Alert.alert('Error', 'Gagal menyimpan data');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
        'Hapus Produk',
        'Yakin ingin menghapus produk ini selamanya?',
        [
            { text: 'Batal', style: 'cancel' },
            { 
                text: 'Hapus', 
                style: 'destructive', 
                onPress: async () => {
                    try {
                        await deleteProductDb(id);
                    } catch {
                        Alert.alert('Error', 'Gagal menghapus produk');
                    }
                } 
            }
        ]
    );
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

  const resetForm = () => {
      setSelectedProduct(null);
      setForm({ name: '', price: '', stock: '', image: '' });
  };

  // --- RENDER ITEM ---
  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        {/* Image Section */}
        <View style={styles.imageWrapper}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            {/* Floating Stock Badge */}
            <View style={[styles.stockBadge, item.stock < 5 && styles.stockLow]}>
                <Icon name="package-variant" size={12} color="#FFF" />
                <Text style={styles.stockText}>{item.stock} Unit</Text>
            </View>
        </View>

        {/* Content Section */}
        <View style={styles.cardContent}>
            <Text style={styles.productPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            
            <View style={styles.divider} />

            {/* Actions Row */}
            <View style={styles.actionRow}>
                <TouchableOpacity 
                    style={[styles.actionBtn, styles.editBtn]} 
                    onPress={() => openEditModal(item)}
                >
                    <Icon name="pencil" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.actionBtn, styles.deleteBtn]} 
                    onPress={() => handleDelete(item.id)}
                >
                    <Icon name="trash-can-outline" size={18} color={theme.colors.danger} />
                </TouchableOpacity>
            </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Header Fixed */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Manajemen Produk</Text>
            <View style={styles.productCountBadge}>
                <Text style={styles.productCountText}>{products.length}</Text>
            </View>
        </View>
        
        {/* Search Bar Modern */}
        <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#9CA3AF" />
            <TextInput
                placeholder="Cari nama barang..."
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

      {/* Content */}
      {loading ? (
        <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : products.length === 0 ? (
         <View style={styles.emptyState}>
             <View style={styles.emptyIconBg}>
                <Icon name="cube-outline" size={40} color="#9CA3AF" />
             </View>
             <Text style={styles.emptyTitle}>Belum Ada Produk</Text>
             <Text style={styles.emptySubtitle}>Tekan tombol + untuk menambahkan produk pertama Anda.</Text>
         </View>
      ) : (
        <FlatList
            data={products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))}
            keyExtractor={(item) => item.id}
            renderItem={renderProductItem}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.columnWrapper}
        />
      )}

      {/* FAB Add Button */}
      <TouchableOpacity 
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => {
            resetForm();
            setModalVisible(true);
        }}
      >
        <Icon name="plus" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Modal Form */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
         <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.modalOverlay}
         >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Icon name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nama Produk</Text>
                        <View style={styles.inputBox}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Contoh: Kopi Susu Gula Aren"
                                value={form.name}
                                onChangeText={(t) => setForm({...form, name: t})}
                            />
                        </View>
                    </View>

                    <View style={styles.rowInputs}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Harga (Rp)</Text>
                            <View style={styles.inputBox}>
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={form.price}
                                    onChangeText={(t) => setForm({...form, price: t})}
                                />
                            </View>
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Stok Awal</Text>
                            <View style={styles.inputBox}>
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={form.stock}
                                    onChangeText={(t) => setForm({...form, stock: t})}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Link Gambar (URL)</Text>
                        <View style={styles.inputBox}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="https://..."
                                value={form.image}
                                onChangeText={(t) => setForm({...form, image: t})}
                            />
                        </View>
                        {form.image ? (
                            <Image source={{uri: form.image}} style={styles.previewImage} />
                        ) : null}
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Simpan Produk</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
         </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

export default ProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  productCountBadge: {
    backgroundColor: theme.colors.primary + '20', // Tint
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productCountText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
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

  // List Styling
  listContent: {
    paddingVertical: 20,
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 100, // Space for FAB
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    // Modern shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageWrapper: {
    height: 140,
    width: '100%',
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  stockLow: {
    backgroundColor: theme.colors.danger,
  },
  stockText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardContent: {
    padding: 12,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 18,
    height: 36, // 2 baris text
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: theme.colors.primary + '15',
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2', // Light red
  },

  // Empty State
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: '70%',
    marginTop: 8,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90, // Above bottom nav
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // Bottom Sheet style
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: '85%', // Occupy 85% screen
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  inputGroup: {
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  input: {
    fontSize: 15,
    color: '#1F2937',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});