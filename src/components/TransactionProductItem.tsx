import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../theme';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARD_WIDTH = (width / 2) - (CARD_MARGIN * 2);

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface Props {
  item: Product;
  qty: number;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}

const TransactionProductItem = memo(({ item, qty, onAdd, onRemove }: Props) => {
  const isOutOfStock = item.stock <= 0;
  const formatRupiah = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;

  return (
    <View style={styles.cardContainer}>
      <View style={[styles.card, isOutOfStock && styles.cardDisabled]}>
          {qty > 0 && (
          <View style={styles.badgeQty}>
              <Text style={styles.badgeQtyText}>{qty}</Text>
          </View>
          )}

          <View style={styles.imageWrapper}>
               <Image source={{ uri: item.image }} style={[styles.productImage, isOutOfStock && styles.productImageDisabled]} />
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

              <View style={styles.actionContainer}>
                  {qty > 0 ? (
                      <View style={styles.stepper}>
                          <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.stepBtn}>
                              <Icon name="minus" size={16} color={theme.colors.primary} />
                          </TouchableOpacity>
                          <Text style={styles.stepVal}>{qty}</Text>
                          <TouchableOpacity onPress={() => onAdd(item.id)} style={styles.stepBtn}>
                              <Icon name="plus" size={16} color={theme.colors.primary} />
                          </TouchableOpacity>
                      </View>
                  ) : (
                      <TouchableOpacity 
                          style={[styles.btnAdd, isOutOfStock && styles.btnAddDisabled]} 
                          onPress={() => !isOutOfStock && onAdd(item.id)}
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
}, (prev, next) => {
  return prev.qty === next.qty && 
         prev.item.stock === next.item.stock &&
         prev.item.price === next.item.price;
});

export default TransactionProductItem;

const styles = StyleSheet.create({
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
  productImageDisabled: {
    opacity: 0.5,
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
});