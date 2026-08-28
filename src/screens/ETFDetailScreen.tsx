import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { fetchETFBySymbol } from "@/services/etfApiService";
import { ETF } from "@/types";
import { usePortfolio } from "@/context/PortfolioContext";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import PriceChart from "@/components/PriceChart";
import { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type DetailRoute = RouteProp<RootStackParamList, "ETFDetail">;

export default function ETFDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const { symbol } = route.params;
  const { toggleWatchlist, isWatchlisted, addAlert } = usePortfolio();
  const [etf, setEtf] = useState<ETF | null>(null);

  useEffect(() => {
    fetchETFBySymbol(symbol).then((e) => setEtf(e ?? null));
  }, [symbol]);

  if (!etf) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.empty}>載入中…</Text>
      </SafeAreaView>
    );
  }

  const isUp = etf.change >= 0;
  const watched = isWatchlisted(etf.symbol);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView>
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.symbol}>{etf.symbol}</Text>
              <Text style={styles.name}>{etf.name}</Text>
            </View>
            <TouchableOpacity
              style={[styles.watchBtn, watched && styles.watchBtnActive]}
              onPress={() => toggleWatchlist(etf.symbol)}
            >
              <Text style={[styles.watchBtnText, watched && { color: "#fff" }]}>
                {watched ? "已加入觀察" : "＋ 加入觀察"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.price}>{formatCurrency(etf.price, etf.market)}</Text>
          <Text style={{ color: isUp ? "#16A34A" : "#DC2626", fontWeight: "600" }}>
            {isUp ? "▲" : "▼"} {etf.change.toFixed(2)} ({formatPercent(etf.changePercent)})
          </Text>
          {etf.market === "TW" && (
            <Text style={styles.dataSourceNote}>資料來源：台灣證交所・前一交易日收盤價</Text>
          )}
        </View>

        <View style={styles.card}>
          <PriceChart data={etf.priceHistory} isUp={isUp} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>基本資料</Text>
          <InfoRow label="淨值 (NAV)" value={etf.nav ? formatCurrency(etf.nav, etf.market) : "—"} />
          <InfoRow
            label="溢／折價"
            value={etf.premiumDiscount !== undefined ? formatPercent(etf.premiumDiscount) : "—"}
          />
          <InfoRow label="內扣費用率" value={`${etf.expenseRatio}%`} />
          <InfoRow label="殖利率" value={`${etf.dividendYield}%`} />
          <InfoRow label="資產規模" value={`${etf.aum.toLocaleString()} 億`} />
          <InfoRow label="類型" value={etf.category} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>前五大成分股</Text>
          {etf.holdings.map((h) => (
            <View key={h.name} style={styles.holdingBarRow}>
              <Text style={styles.holdingName}>{h.name}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${Math.min(h.weight, 100)}%` }]} />
              </View>
              <Text style={styles.holdingWeight}>{h.weight}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>簡介</Text>
          <Text style={styles.description}>{etf.description}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#16A34A" }]}
            onPress={() => navigation.navigate("AddTransaction", { symbol: etf.symbol })}
          >
            <Text style={styles.actionBtnText}>記錄買進</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#2563EB" }]}
            onPress={() =>
              addAlert({ symbol: etf.symbol, targetPrice: etf.price, direction: "above", active: true })
            }
          >
            <Text style={styles.actionBtnText}>設定價格提醒</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  empty: { padding: 24, textAlign: "center", color: "#94A3B8" },
  headerCard: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  symbol: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  name: { fontSize: 14, color: "#475569", marginTop: 2 },
  price: { fontSize: 30, fontWeight: "700", color: "#0F172A", marginTop: 12 },
  dataSourceNote: { fontSize: 11, color: "#94A3B8", marginTop: 6 },
  watchBtn: {
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  watchBtnActive: { backgroundColor: "#2563EB" },
  watchBtnText: { color: "#2563EB", fontSize: 12, fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A", marginBottom: 10 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  infoLabel: { color: "#64748B", fontSize: 13 },
  infoValue: { color: "#0F172A", fontSize: 13, fontWeight: "600" },
  holdingBarRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  holdingName: { width: 70, fontSize: 12, color: "#334155" },
  barTrack: { flex: 1, height: 8, backgroundColor: "#E2E8F0", borderRadius: 4, overflow: "hidden" },
  barFill: { height: 8, backgroundColor: "#2563EB" },
  holdingWeight: { width: 40, fontSize: 12, textAlign: "right", color: "#334155" },
  description: { fontSize: 13, color: "#475569", lineHeight: 20 },
  actionsRow: { flexDirection: "row", gap: 12, padding: 16 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  actionBtnText: { color: "#fff", fontWeight: "700" },
});
