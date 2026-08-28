import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { usePortfolio } from "@/context/PortfolioContext";
import { fetchAllETFs } from "@/services/etfApiService";
import { ETF } from "@/types";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import ETFListItem from "@/components/ETFListItem";
import { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { holdings, totalMarketValue, totalUnrealizedPL, totalUnrealizedPLPercent, watchlist } =
    usePortfolio();
  const [etfs, setEtfs] = useState<ETF[]>([]);

  useEffect(() => {
    fetchAllETFs().then(setEtfs);
  }, []);

  const watchedETFs = etfs.filter((e) => watchlist.includes(e.symbol)).slice(0, 3);
  const isUp = totalUnrealizedPL >= 0;
  const topMovers = [...etfs].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  const topLosers = [...etfs].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);

  const quickActions = [
    { label: "新增交易", icon: "add-circle-outline" as const, onPress: () => navigation.navigate("AddTransaction", {}) },
    { label: "定期定額試算", icon: "calculator-outline" as const, onPress: () => navigation.navigate("DCACalculator") },
    { label: "價格提醒", icon: "notifications-outline" as const, onPress: () => navigation.navigate("Alerts") },
    { label: "市場新聞", icon: "newspaper-outline" as const, onPress: () => navigation.navigate("News") },
    { label: "配息行事曆", icon: "calendar-outline" as const, onPress: () => navigation.navigate("DividendCalendar") },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>投資組合總市值</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalMarketValue)}</Text>
          <View style={styles.plRow}>
            <Ionicons
              name={isUp ? "trending-up" : "trending-down"}
              size={16}
              color={isUp ? "#16A34A" : "#DC2626"}
            />
            <Text style={[styles.plText, { color: isUp ? "#16A34A" : "#DC2626" }]}>
              {formatCurrency(totalUnrealizedPL)} ({formatPercent(totalUnrealizedPLPercent)})
            </Text>
          </View>
          <Text style={styles.holdingsCount}>持有 {holdings.length} 檔 ETF</Text>
        </View>

        <View style={styles.actionsGrid}>
          {quickActions.map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionItem} onPress={a.onPress}>
              <Ionicons name={a.icon} size={24} color="#2563EB" />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>今日漲幅排行</Text>
        </View>
        <View style={styles.moversRow}>
          {topMovers.map((etf) => (
            <TouchableOpacity
              key={etf.symbol}
              style={styles.moverCard}
              onPress={() => navigation.navigate("ETFDetail", { symbol: etf.symbol })}
            >
              <Text style={styles.moverSymbol}>{etf.symbol}</Text>
              <Text style={[styles.moverPct, { color: "#16A34A" }]}>
                {formatPercent(etf.changePercent)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>今日跌幅排行</Text>
        </View>
        <View style={styles.moversRow}>
          {topLosers.map((etf) => (
            <TouchableOpacity
              key={etf.symbol}
              style={styles.moverCard}
              onPress={() => navigation.navigate("ETFDetail", { symbol: etf.symbol })}
            >
              <Text style={styles.moverSymbol}>{etf.symbol}</Text>
              <Text style={[styles.moverPct, { color: "#DC2626" }]}>
                {formatPercent(etf.changePercent)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>我的觀察清單</Text>
        </View>
        {watchedETFs.length === 0 ? (
          <Text style={styles.empty}>尚無觀察標的，前往「市場」加入 ETF</Text>
        ) : (
          watchedETFs.map((etf) => (
            <ETFListItem
              key={etf.symbol}
              etf={etf}
              onPress={() => navigation.navigate("ETFDetail", { symbol: etf.symbol })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  summaryCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#0F172A",
  },
  summaryLabel: { color: "#94A3B8", fontSize: 13 },
  summaryValue: { color: "#fff", fontSize: 32, fontWeight: "700", marginTop: 4 },
  plRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 },
  plText: { fontSize: 14, fontWeight: "600" },
  holdingsCount: { color: "#64748B", fontSize: 12, marginTop: 12 },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  actionItem: {
    width: "25%",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionLabel: { fontSize: 11, color: "#334155", marginTop: 6, textAlign: "center" },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  empty: { padding: 16, color: "#94A3B8", fontSize: 13 },
});
