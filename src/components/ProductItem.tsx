import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../theme';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface ProductItemProps {
  item: Product;
  onEdit: (item: Product) => void;
  onDelete: (id: string) => void;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARD_WIDTH = (width / 2) - (CARD_MARGIN * 2);

const ProductItem = memo(({ item, onEdit, onDelete }: ProductItemProps) => {
    return (
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
              onPress={() => onEdit(item)}
              activeOpacity={0.7}
            >
              <Icon name="pencil" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.deleteBtn]} 
              onPress={() => onDelete(item.id)}
              activeOpacity={0.7}
            >
              <Icon name="trash-can-outline" size={18} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
    return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.price === nextProps.item.price &&
    prevProps.item.stock === nextProps.item.stock &&
    prevProps.item.image === nextProps.item.image
  );
});

export default ProductItem;

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
    height: 36,
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
    backgroundColor: '#FEE2E2',
  },
});