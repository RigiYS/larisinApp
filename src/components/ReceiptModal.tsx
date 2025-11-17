import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import theme from '../theme';

interface ReceiptProps {
  cart: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  onClose: () => void;
}

export default function ReceiptModal({ cart, total, onClose }: ReceiptProps) {
  const date = new Date().toLocaleString("id-ID");

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>🧾 Struk Pembayaran</Text>
        <Text style={styles.date}>{date}</Text>
        <ScrollView style={styles.scrollView}>
          {cart.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.itemName}>
                {item.name} × {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                Rp {(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
        </ScrollView>
        <Text style={styles.total}>Total: Rp {total.toLocaleString()}</Text>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Tutup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: theme.colors.card,
    width: "85%",
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  title: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  date: { textAlign: "center", color: theme.colors.muted, marginVertical: 6 },
  scrollView: { marginVertical: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  itemName: { fontSize: 15 },
  itemPrice: { fontWeight: "600" },
  total: { fontSize: 18, fontWeight: "700", marginTop: 10, textAlign: "right" },
  closeBtn: {
    marginTop: 14,
    backgroundColor: theme.colors.accent,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeText: { color: theme.colors.card, fontWeight: "700", textAlign: "center" },
});
