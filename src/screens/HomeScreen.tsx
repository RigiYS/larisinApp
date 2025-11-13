import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity, ScrollView } from "react-native";
import theme from '../theme';
import axios from "axios";
import eventBus from '../utils/eventBus';

interface Transaction {
  id: string;
  total: number;
  date: string;
  items?: { name: string; price: number; quantity: number }[];
}

export default function HomeScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    const res = await axios.get("https://691159ac7686c0e9c20d1ec7.mockapi.io/transactions");
    const data = res.data;
    setTransactions(data);

    
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const daily = data
      .filter((t: Transaction) => t.date.startsWith(today))
      .reduce((sum: number, t: Transaction) => sum + t.total, 0);

    const weekly = data
      .filter((t: Transaction) => new Date(t.date) >= weekAgo)
      .reduce((sum: number, t: Transaction) => sum + t.total, 0);

    setDailyRevenue(daily);
    setWeeklyRevenue(weekly);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    const unsub = eventBus.on('transactions:changed', () => {
      fetchTransactions();
    });
    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pendapatan Harian</Text>
          <Text style={styles.cardValue}>Rp {dailyRevenue.toLocaleString()}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pendapatan Mingguan</Text>
          <Text style={styles.cardValue}>Rp {weeklyRevenue.toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Riwayat Transaksi</Text>
      <FlatList
        data={transactions.slice(-5).reverse()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <View style={styles.flexOne}>
              <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>

              
              {item.items && item.items.length > 0 && (
                <View style={styles.transactionDetails}>
                  {item.items.map((it, idx) => (
                    <View key={idx} style={styles.detailRow}>
                      <Text style={styles.detailName}>{it.name} x{it.quantity}</Text>
                      <Text style={styles.detailPrice}>Rp {(it.price * it.quantity).toLocaleString()}</Text>
                    </View>
                  ))}

                  <View style={styles.transactionSummary}>
                    <Text style={styles.receiptTotal}>Total: Rp {item.total?.toLocaleString()}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      />

      
      <Modal visible={!!selectedTransaction} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Detail Transaksi</Text>
            <ScrollView style={styles.detailList}>
              {selectedTransaction?.items?.map((it, idx) => (
                <View key={idx} style={styles.receiptItem}>
                  <Text style={styles.itemText}>{it.name} x {it.quantity}</Text>
                  <Text style={styles.itemPrice}>Rp {(it.price * it.quantity).toLocaleString()}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.receiptDivider} />
            <Text style={styles.receiptTotal}>Total: Rp {selectedTransaction?.total?.toLocaleString()}</Text>
            <TouchableOpacity style={styles.btnClose} onPress={() => setSelectedTransaction(null)}>
              <Text style={styles.btnTextSave}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  cardContainer: { flexDirection: "row", justifyContent: "space-between" },
  card: {
    backgroundColor: "#fff",
    flex: 1,
    margin: 6,
    padding: 16,
    borderRadius: 12,
  },
  cardLabel: { fontSize: 14, color: "#555" },
  cardValue: { fontSize: 18, fontWeight: "700", color: "#333", marginTop: 4 },
  subtitle: { marginTop: 20, fontSize: 18, fontWeight: "600" },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
  },
  transactionDate: { color: "#666" },
  transactionTotal: { fontWeight: "700", color: "#222" },
  transactionDetails: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  detailName: { color: '#333', fontSize: 13 },
  detailPrice: { color: '#4A90E2', fontWeight: '600' },
  detailContainer: { marginVertical: 6 },
  detailMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailTotal: { color: '#222', fontWeight: '700' },
  detailSub: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  detailUnit: { color: '#888', fontSize: 12 },
  detailNote: { color: '#666', fontSize: 12 },
  flexOne: { flex: 1 },
  transactionSummary: { marginTop: 6, alignItems: 'flex-end' },
  modalOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  receiptItem: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  itemText: { color: '#333' },
  itemPrice: { color: '#4A90E2', fontWeight: '600' },
  receiptDivider: { borderBottomWidth: 1, borderColor: '#ddd', marginVertical: 8 },
  receiptTotal: { textAlign: 'right', fontWeight: '700', marginTop: 6 },
  btnClose: { marginTop: 12, backgroundColor: '#4A90E2', padding: 10, borderRadius: 8 },
  btnTextSave: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  detailList: { maxHeight: 300 },
});
