import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePortfolio } from "@/context/PortfolioContext";
import { formatCurrency, formatDate } from "@/utils/formatters";

export default function AlertsScreen() {
  const { alerts, addAlert, removeAlert } = usePortfolio();
  const [symbol, setSymbol] = useState("");
  const [target, setTarget] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");

  const handleAdd = () => {
    if (!symbol || !target) return;
    addAlert({ symbol: symbol.toUpperCase(), targetPrice: parseFloat(target), direction, active: true });
    setSymbol("");
    setTarget("");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="代碼"
          value={symbol}
          onChangeText={setSymbol}
          autoCapitalize="characters"
        />
        <TextInput
          style={[styles.input, { width: 90 }]}
          placeholder="目標價"
          keyboardType="decimal-pad"
          value={target}
          onChangeText={setTarget}
        />
        <TouchableOpacity
          style={styles.dirBtn}
          onPress={() => setDirection((d) => (d === "above" ? "below" : "above"))}
        >
          <Text style={styles.dirText}>{direction === "above" ? "漲到" : "跌到"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>新增</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.sub}>
                {item.direction === "above" ? "價格漲到" : "價格跌到"}{" "}
                {formatCurrency(item.targetPrice)}
              </Text>
              <Text style={styles.date}>建立於 {formatDate(item.createdAt)}</Text>
            </View>
            <TouchableOpacity onPress={() => removeAlert(item.id)}>
              <Text style={styles.remove}>刪除</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>尚未設定任何價格提醒</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  form: { flexDirection: "row", gap: 8, padding: 16, backgroundColor: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  dirBtn: { justifyContent: "center", paddingHorizontal: 10, backgroundColor: "#F1F5F9", borderRadius: 8 },
  dirText: { fontSize: 12, color: "#334155", fontWeight: "600" },
  addBtn: { backgroundColor: "#2563EB", borderRadius: 8, justifyContent: "center", paddingHorizontal: 14 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
  },
  symbol: { fontWeight: "700", fontSize: 14, color: "#0F172A" },
  sub: { fontSize: 13, color: "#334155", marginTop: 2 },
  date: { fontSize: 11, color: "#94A3B8", marginTop: 4 },
  remove: { color: "#DC2626", fontWeight: "600", fontSize: 12 },
  empty: { textAlign: "center", color: "#94A3B8", marginTop: 32 },
});
