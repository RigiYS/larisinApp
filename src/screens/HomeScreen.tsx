import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert, StatusBar, Platform } from "react-native";
import theme from '../theme';
import { firebaseAuth } from '../services/firebase';
import { onUserTransactionsChanged, Transaction } from '../services/transactionService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const dailyRevenue = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((t) => {
        const tDate = new Date(t.createdAt);
        return (
          tDate.getDate() === now.getDate() &&
          tDate.getMonth() === now.getMonth() &&
          tDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  }, [transactions]);

  const weeklyRevenue = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return transactions
      .filter((t) => new Date(t.createdAt) >= weekAgo)
      .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  }, [transactions]);

  useEffect(() => {
    const user = firebaseAuth.currentUser;
    if (!user) {
      Alert.alert('Autentikasi', 'Login ulang untuk melihat transaksi');
      return;
    }

    const unsubscribe = onUserTransactionsChanged(
      user.uid,
      (data) => {
        const sortedData = [...data].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTransactions(sortedData);
      },
      (error) => console.log('Subscribe transaksi error:', error.message)
    );

    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTextContainer}>
        <View>
          <Text style={styles.greetingText}>Selamat Datang di Larisin</Text>
          <Text style={styles.headerTitle}>Ringkasan Bisnis</Text>
        </View>
        <View style={styles.profileBadge}>
           <Icon name="store" size={20} color="#FFF" />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.shadowSubtle]}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
            <Icon name="cash-fast" size={22} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={styles.statLabel}>Omzet Hari Ini</Text>
            <Text style={styles.statValue}>Rp {dailyRevenue.toLocaleString('id-ID')}</Text>
          </View>
        </View>

        <View style={[styles.statCard, styles.shadowSubtle]}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.secondary + '15' }]}>
            <Icon name="chart-timeline-variant" size={22} color={theme.colors.secondary} />
          </View>
          <View>
            <Text style={styles.statLabel}>Minggu Ini</Text>
            <Text style={styles.statValue}>Rp {weeklyRevenue.toLocaleString('id-ID')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
        <View style={styles.badgeCount}>
            <Text style={styles.badgeText}>{transactions.length}</Text>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <Icon name="receipt" size={40} color={theme.colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>Belum Ada Penjualan</Text>
      <Text style={styles.emptySubtitle}>Transaksi baru akan muncul di sini secara real-time.</Text>
    </View>
  );

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={[styles.transactionCard, styles.shadowSubtle]}>
      {/* Top Row: Date & Status */}
      <View style={styles.cardTopRow}>
        <View style={styles.dateBadge}>
          <Icon name="calendar-month-outline" size={14} color={theme.colors.textMuted} />
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'
            })}
          </Text>
        </View>
        <View style={styles.statusPill}>
            <Icon name="check-circle" size={12} color="#10B981" />
            <Text style={styles.statusText}>Sukses</Text>
        </View>
      </View>

      {/* Middle: Products */}
      <View style={styles.productList}>
        {item.items?.map((product, index) => (
          <View key={index} style={styles.productRow}>
            <Text style={styles.productName} numberOfLines={1}>
              {product?.productName || 'Produk Tanpa Nama'}
            </Text>
            <Text style={styles.productQty}>x{product?.quantity}</Text>
          </View>
        ))}
      </View>

      {/* Bottom: Total Divider */}
      <View style={styles.divider} />
      <View style={styles.cardBottomRow}>
        <Text style={styles.totalLabel}>Total Bayar</Text>
        <Text style={styles.totalAmount}>Rp {(item.totalAmount || 0).toLocaleString('id-ID')}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={renderTransactionItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Layout Dasar
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Background sedikit abu-abu muda (Modern Standard)
  },
  listContent: {
    paddingBottom: 100,
  },
  shadowSubtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, // Shadow sangat tipis (Premium feel)
    shadowRadius: 10,
    elevation: 3,
  },

  // Header Styles
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 60,
    paddingBottom: 10,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    // Header punya shadow sendiri agar terpisah dari list
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
  },
  headerTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  profileBadge: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats Cards
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'space-between',
    minHeight: 110,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
  },
  badgeCount: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },

  // Transaction Item Styles
  transactionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5', // Light emerald green
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981', // Darker emerald
  },
  productList: {
    marginBottom: 12,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  productQty: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});