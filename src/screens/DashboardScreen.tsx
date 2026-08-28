import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { usePortfolio } from "@/context/PortfolioContext";
import { fetchAllETFs, didLastFetchFail } from "@/services/etfApiService";
import { ETF } from "@/types";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import ETFListItem from "@/components/ETFListItem";
import SectionCard from "@/components/SectionCard";
import { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const {
    holdings,
    totalMarketValue,
    totalUnrealizedPL,
    totalUnrealizedPLPercent,
    watchlist,
    refreshPrices,
  } = usePortfolio();
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);

  const load = useCallback(async (forceRefresh = false) => {
    const data = await fetchAllETFs(forceRefresh);
    setEtfs(data);
    setFetchFailed(didLastFetchFail());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([load(true), refreshPrices()]);
    setRefreshing(false);
  };

  const watchedETFs = etfs.filter((e) => watchlist.includes(e.symbol)).slice(0, 4);
  const isUp = totalUnrealizedPL >= 0;

  const quickActions = [
    { label: "新增交易", icon: "add-circle-outline" as const, onPress: () => navigation.navigate("AddTransaction", {}) },
    { label: "定期定額試算", icon: "calculator-outline" as const, onPress: () => navigation.navigate("DCACalculator") },
    { label: "價格提醒", icon: "notifications-outline" as const, onPress: () => navigation.navigate("Alerts") },
    { label: "市場新聞", icon: "newspaper-outline" as const, onPress: () => navigation.navigate("News") },
    { label: "配息行事曆", icon: "calendar-outline" as const, onPress: () => navigation.navigate("DividendCalendar") },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>投資組合總市值</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalMarketValue)}</Text>
          <View style={styles.plRow}>
            <Ionicons
              name={isUp ? "trending-up" : "trending-down"}
              size={16}
              color={isUp ? "#4ADE80" : "#F87171"}
            />
            <Text style={[styles.plText, { color: isUp ? "#4ADE80" : "#F87171" }]}>
              {formatCurrency(totalUnrealizedPL)} ({formatPercent(totalUnrealizedPLPercent)})
            </Text>
          </View>
          <Text style={styles.holdingsCount}>持有 {holdings.length} 檔 ETF</Text>
        </View>

        {fetchFailed && (
          <View style={styles.warningBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color="#B45309" />
            <Text style={styles.warningText}>
              目前無法連上證交所即時資料，顯示為備援參考價格，下拉可重試
            </Text>
          </View>
        )}

        <SectionCard noPadding>
          <View style={styles.actionsGrid}>
            {quickActions.map((a) => (
              <TouchableOpacity key={a.label} style={styles.actionItem} onPress={a.onPress}>
                <View style={styles.actionIconWrap}>
                  <Ionicons name={a.icon} size={20} color="#2563EB" />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        <SectionCard title="我的觀察清單" subtitle={loading ? "" : `共 ${watchedETFs.length} 檔`} noPadding>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#2563EB" />
            </View>
          ) : watchedETFs.length === 0 ? (
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
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  summaryCard: {
    margin: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#0F172A",
    shadowColor: "#0F172A",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  summaryLabel: { color: "#94A3B8", fontSize: 13 },
  summaryValue: { color: "#fff", fontSize: 32, fontWeight: "700", marginTop: 4 },
  plRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 },
  plText: { fontSize: 14, fontWeight: "600" },
  holdingsCount: { color: "#64748B", fontSize: 12, marginTop: 12 },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  warningText: { flex: 1, fontSize: 12, color: "#92400E" },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  actionItem: {
    width: "20%",
    alignItems: "center",
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontSize: 10, color: "#334155", marginTop: 6, textAlign: "center" },
  loadingBox: { paddingVertical: 24, alignItems: "center" },
  empty: { padding: 16, color: "#94A3B8", fontSize: 13 },
});
