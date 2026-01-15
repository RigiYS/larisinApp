import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import theme from '../theme';
import { firebaseAuth } from '../services/firebase';
import {
  onUserTransactionsChanged,
  getTotalTransactionAmount,
  Transaction,
} from '../services/transactionService';

export default function HomeScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);

  useEffect(() => {
    const user = firebaseAuth.currentUser;
    if (!user) {
      Alert.alert('Autentikasi', 'Silakan login ulang untuk melihat transaksi');
      return;
    }

    // Realtime transaksi user
    const unsubscribe = onUserTransactionsChanged(
      user.uid,
      (data) => {
        setTransactions(data);

        // Hitung daily & weekly dari data realtime
        const today = new Date().toISOString().split("T")[0];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const daily = data
          .filter((t) => t.createdAt.startsWith(today))
          .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

        const weekly = data
          .filter((t) => new Date(t.createdAt) >= weekAgo)
          .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

        setDailyRevenue(daily);
        setWeeklyRevenue(weekly);
      },
      () => {
        Alert.alert('Error', 'Gagal memuat transaksi');
      }
    );

    // Hitung total weekly via query (redundant but keeps logic simple if listener empty)
    getTotalTransactionAmount(user.uid).then(setWeeklyRevenue).catch(() => {});

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pendapatan Hari ini</Text>
          <Text style={styles.cardValue}>Rp {dailyRevenue.toLocaleString()}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pendapatan Minggu ini</Text>
          <Text style={styles.cardValue}>Rp {weeklyRevenue.toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Riwayat Transaksi</Text>
      <FlatList
        data={transactions.slice(0, 5)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <View style={styles.flexOne}>
              <Text style={styles.transactionDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>

              {item.items && item.items.length > 0 && (
                <View style={styles.transactionDetails}>
                  {item.items.map((it, idx) => (
                    <View key={idx} style={styles.detailRow}>
                      <Text style={styles.detailName}>{it.productName} x{it.quantity}</Text>
                      <Text style={styles.detailPrice}>Rp {(it.price * it.quantity).toLocaleString()}</Text>
                    </View>
                  ))}

                  <View style={styles.transactionSummary}>
                    <Text style={styles.receiptTotal}>Total: Rp {item.totalAmount?.toLocaleString()}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      />

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  cardContainer: { flexDirection: "row", justifyContent: "space-between" },
  card: {
    backgroundColor: theme.colors.card,
    flex: 1,
    margin: 6,
    padding: 16,
    borderRadius: 12,
  },
  cardLabel: { fontSize: 14, color: theme.colors.muted },
  cardValue: { fontSize: 18, fontWeight: "700", color: theme.colors.text, marginTop: 4 },
  subtitle: { marginTop: 20, fontSize: 18, fontWeight: "600" },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.colors.card,
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
  },
  transactionDate: { color: theme.colors.placeholder },
  transactionTotal: { fontWeight: "700", color: theme.colors.text },
  transactionDetails: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  detailName: { color: theme.colors.text, fontSize: 13 },
  detailPrice: { color: theme.colors.accent, fontWeight: '600' },
  detailContainer: { marginVertical: 6 },
  detailMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailTotal: { color: theme.colors.text, fontWeight: '700' },
  detailSub: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  detailUnit: { color: theme.colors.muted, fontSize: 12 },
  detailNote: { color: theme.colors.placeholder, fontSize: 12 },
  flexOne: { flex: 1 },
  transactionSummary: { marginTop: 6, alignItems: 'flex-end' },
  modalOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '90%', backgroundColor: theme.colors.card, borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  receiptItem: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  itemText: { color: theme.colors.text },
  itemPrice: { color: theme.colors.accent, fontWeight: '600' },
  receiptDivider: { borderBottomWidth: 1, borderColor: theme.colors.border, marginVertical: 8 },
  receiptTotal: { textAlign: 'right', fontWeight: '700', marginTop: 6 },
  btnClose: { marginTop: 12, backgroundColor: theme.colors.accent, padding: 10, borderRadius: 8 },
  btnTextSave: { color: theme.colors.card, textAlign: 'center', fontWeight: '700' },
  detailList: { maxHeight: 300 },
});
