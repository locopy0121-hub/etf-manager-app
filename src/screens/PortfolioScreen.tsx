import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { usePortfolio } from "@/context/PortfolioContext";
import { formatCurrency, formatPercent, formatDate } from "@/utils/formatters";
import AllocationPieChart from "@/components/AllocationPieChart";
import { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function PortfolioScreen() {
  const navigation = useNavigation<Nav>();
  const {
    holdings,
    transactions,
    totalMarketValue,
    totalUnrealizedPL,
    totalUnrealizedPLPercent,
    removeTransaction,
    refreshPrices,
    pricesLoading,
  } = usePortfolio();
  const [refreshing, setRefreshing] = useState(false);

  const isUp = totalUnrealizedPL >= 0;
  const sortedTx = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1));

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPrices();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing || pricesLoading} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>總市值</Text>
            <Text style={styles.headerValue}>{formatCurrency(totalMarketValue)}</Text>
            <Text style={{ color: isUp ? "#16A34A" : "#DC2626", fontWeight: "600" }}>
              {formatCurrency(totalUnrealizedPL)} ({formatPercent(totalUnrealizedPLPercent)})
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("AddTransaction", {})}
          >
            <Text style={styles.addBtnText}>＋ 新增交易</Text>
          </TouchableOpacity>
        </View>

        {holdings.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>資產配置</Text>
            <AllocationPieChart
              items={holdings.map((h) => ({ name: h.symbol, value: h.marketValue }))}
            />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>持倉明細</Text>
          {holdings.length === 0 ? (
            <Text style={styles.empty}>尚無持倉，點右上方新增交易開始記錄</Text>
          ) : (
            holdings.map((h) => (
              <View key={h.symbol} style={styles.holdingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.holdingSymbol}>{h.symbol}</Text>
                  <Text style={styles.holdingSub}>
                    {h.totalShares.toFixed(2)} 股 ・ 均價 {formatCurrency(h.avgCost)}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.holdingSymbol}>{formatCurrency(h.marketValue)}</Text>
                  <Text
                    style={{
                      color: h.unrealizedPL >= 0 ? "#16A34A" : "#DC2626",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {formatPercent(h.unrealizedPLPercent)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>交易紀錄</Text>
          {sortedTx.length === 0 ? (
            <Text style={styles.empty}>尚無交易紀錄</Text>
          ) : (
            sortedTx.map((t) => (
              <View key={t.id} style={styles.txRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.holdingSymbol}>
                    {t.symbol} ・ {t.type === "buy" ? "買進" : t.type === "sell" ? "賣出" : "配息"}
                  </Text>
                  <Text style={styles.holdingSub}>
                    {formatDate(t.date)} ・ {t.shares} 股 @ {formatCurrency(t.price)}
                  </Text>
                </View>
                <Text style={styles.removeBtn} onPress={() => removeTransaction(t.id)}>
                  刪除
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
  },
  headerLabel: { color: "#64748B", fontSize: 13 },
  headerValue: { fontSize: 26, fontWeight: "700", color: "#0F172A", marginVertical: 2 },
  addBtn: { backgroundColor: "#2563EB", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A", marginBottom: 8 },
  empty: { color: "#94A3B8", fontSize: 13, paddingVertical: 8 },
  holdingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  holdingSymbol: { fontWeight: "700", color: "#0F172A", fontSize: 14 },
  holdingSub: { color: "#64748B", fontSize: 12, marginTop: 2 },
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  removeBtn: { color: "#DC2626", fontSize: 12, fontWeight: "600" },
});
