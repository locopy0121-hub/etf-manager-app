import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAllETFs } from "@/services/etfApiService";
import { ETF } from "@/types";
import { usePortfolio } from "@/context/PortfolioContext";
import { formatCurrency, formatDate } from "@/utils/formatters";

const FREQUENCY_LABEL: Record<string, string> = {
  monthly: "月配",
  quarterly: "季配",
  semiannual: "半年配",
  annual: "年配",
};

interface DividendRow {
  etf: ETF;
  isHeld: boolean;
}

export default function DividendCalendarScreen() {
  const { holdings, watchlist } = usePortfolio();
  const [etfs, setEtfs] = useState<ETF[]>([]);

  useEffect(() => {
    fetchAllETFs().then(setEtfs);
  }, []);

  const heldSymbols = new Set(holdings.map((h) => h.symbol));
  const relevantSymbols = new Set([...heldSymbols, ...watchlist]);

  const rows: DividendRow[] = etfs
    .filter((e) => e.nextExDividendDate && relevantSymbols.has(e.symbol))
    .map((e) => ({ etf: e, isHeld: heldSymbols.has(e.symbol) }))
    .sort((a, b) =>
      (a.etf.nextExDividendDate ?? "") < (b.etf.nextExDividendDate ?? "") ? -1 : 1
    );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.headerNote}>
        <Text style={styles.headerNoteText}>
          顯示你「持有」與「觀察清單」中，即將除息的 ETF（依除息日排序）
        </Text>
      </View>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.etf.symbol}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const held = holdings.find((h) => h.symbol === item.etf.symbol);
          const estimatedDividend =
            held && item.etf.dividendYield
              ? (held.marketValue * (item.etf.dividendYield / 100)) /
                (item.etf.dividendFrequency === "monthly"
                  ? 12
                  : item.etf.dividendFrequency === "quarterly"
                  ? 4
                  : item.etf.dividendFrequency === "semiannual"
                  ? 2
                  : 1)
              : null;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.symbol}>{item.etf.symbol}</Text>
                  <Text style={styles.name}>{item.etf.name}</Text>
                </View>
                <View style={styles.freqBadge}>
                  <Text style={styles.freqText}>
                    {FREQUENCY_LABEL[item.etf.dividendFrequency ?? ""] ?? "—"}
                  </Text>
                </View>
              </View>

              <View style={styles.dateRow}>
                <View style={styles.dateBlock}>
                  <Text style={styles.dateLabel}>預估除息日</Text>
                  <Text style={styles.dateValue}>
                    {item.etf.nextExDividendDate ? formatDate(item.etf.nextExDividendDate) : "—"}
                  </Text>
                </View>
                <View style={styles.dateBlock}>
                  <Text style={styles.dateLabel}>預估發放日</Text>
                  <Text style={styles.dateValue}>
                    {item.etf.nextPayDate ? formatDate(item.etf.nextPayDate) : "—"}
                  </Text>
                </View>
              </View>

              {item.isHeld && estimatedDividend !== null && (
                <View style={styles.estimateBox}>
                  <Text style={styles.estimateLabel}>依目前持股預估可領股利</Text>
                  <Text style={styles.estimateValue}>{formatCurrency(estimatedDividend)}</Text>
                </View>
              )}
              {!item.isHeld && (
                <Text style={styles.watchOnlyNote}>目前尚未持有，僅在觀察清單中</Text>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            尚無即將除息的標的，請先在「市場」加入觀察清單或建立持倉
          </Text>
        }
      />
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimer}>
          日期與配息金額皆為示範用估算資料，實際除息／發放日與金額請以各投信官方公告為準。
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  headerNote: { paddingHorizontal: 16, paddingTop: 12 },
  headerNoteText: { fontSize: 12, color: "#64748B" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  symbol: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  name: { fontSize: 12, color: "#64748B", marginTop: 2 },
  freqBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  freqText: { color: "#2563EB", fontSize: 11, fontWeight: "700" },
  dateRow: { flexDirection: "row", marginTop: 14, gap: 24 },
  dateBlock: {},
  dateLabel: { fontSize: 11, color: "#94A3B8" },
  dateValue: { fontSize: 14, fontWeight: "700", color: "#0F172A", marginTop: 2 },
  estimateBox: {
    marginTop: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  estimateLabel: { fontSize: 12, color: "#166534" },
  estimateValue: { fontSize: 13, fontWeight: "800", color: "#166534" },
  watchOnlyNote: { fontSize: 11, color: "#94A3B8", marginTop: 10 },
  empty: { textAlign: "center", color: "#94A3B8", marginTop: 32, paddingHorizontal: 24 },
  disclaimerBox: { padding: 16 },
  disclaimer: { fontSize: 11, color: "#94A3B8", lineHeight: 16 },
});
