import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { usePortfolio } from "@/context/PortfolioContext";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { Transaction } from "@/types";

type AddRoute = RouteProp<RootStackParamList, "AddTransaction">;

const TYPES: { key: Transaction["type"]; label: string }[] = [
  { key: "buy", label: "買進" },
  { key: "sell", label: "賣出" },
  { key: "dividend", label: "配息" },
];

export default function AddTransactionScreen() {
  const navigation = useNavigation();
  const route = useRoute<AddRoute>();
  const { addTransaction } = usePortfolio();

  const [symbol, setSymbol] = useState(route.params?.symbol ?? "");
  const [type, setType] = useState<Transaction["type"]>("buy");
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [fee, setFee] = useState("0");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!symbol || !shares || !price) {
      Alert.alert("請完整填寫", "代碼、股數與價格為必填欄位");
      return;
    }
    addTransaction({
      symbol: symbol.toUpperCase(),
      type,
      shares: parseFloat(shares),
      price: parseFloat(price),
      fee: parseFloat(fee) || 0,
      date: new Date().toISOString(),
      note,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.label}>交易類型</Text>
        <View style={styles.typeRow}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeChip, type === t.key && styles.typeChipActive]}
              onPress={() => setType(t.key)}
            >
              <Text style={[styles.typeChipText, type === t.key && { color: "#fff" }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>ETF 代碼</Text>
        <TextInput
          style={styles.input}
          placeholder="例如 0050"
          value={symbol}
          onChangeText={setSymbol}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>股數</Text>
        <TextInput
          style={styles.input}
          placeholder="例如 1000"
          keyboardType="decimal-pad"
          value={shares}
          onChangeText={setShares}
        />

        <Text style={styles.label}>成交價格</Text>
        <TextInput
          style={styles.input}
          placeholder="例如 182.35"
          keyboardType="decimal-pad"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>手續費／稅金</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          keyboardType="decimal-pad"
          value={fee}
          onChangeText={setFee}
        />

        <Text style={styles.label}>備註（選填）</Text>
        <TextInput style={styles.input} placeholder="備註" value={note} onChangeText={setNote} />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>儲存交易紀錄</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  typeChipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  typeChipText: { color: "#334155", fontWeight: "600", fontSize: 13 },
  submitBtn: {
    marginTop: 28,
    backgroundColor: "#0F172A",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
