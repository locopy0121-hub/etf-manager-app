import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { fetchAllETFs, didLastFetchFail, getLastFetchedAt } from "@/services/etfApiService";
import { ETF } from "@/types";
import { usePortfolio } from "@/context/PortfolioContext";
import ETFListItem from "@/components/ETFListItem";
import { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FILTERS = ["全部", "TW", "US", "市值型", "高股息"];

export default function MarketScreen() {
  const navigation = useNavigation<Nav>();
  const { toggleWatchlist, isWatchlisted } = usePortfolio();
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number>(0);

  const load = useCallback(async (forceRefresh = false) => {
    const data = await fetchAllETFs(forceRefresh);
    setEtfs(data);
    setFetchFailed(didLastFetchFail());
    setUpdatedAt(getLastFetchedAt());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  const filtered = etfs.filter((e) => {
    const matchesKeyword =
      !keyword ||
      e.symbol.toLowerCase().includes(keyword.toLowerCase()) ||
      e.name.toLowerCase().includes(keyword.toLowerCase());
    const matchesFilter =
      filter === "全部" || e.market === filter || e.category === filter;
    return matchesKeyword && matchesFilter;
  });

  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="搜尋代碼或名稱，例如 0050、VOO"
          value={keyword}
          onChangeText={setKeyword}
        />
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(i) => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <Text
            onPress={() => setFilter(item)}
            style={[styles.filterChip, filter === item && styles.filterChipActive]}
          >
            {item}
          </Text>
        )}
      />

      <View style={styles.statusRow}>
        <Text style={styles.statusText}>
          {fetchFailed
            ? "⚠️ 目前顯示備援參考價格"
            : `台股ETF：台灣證交所前一交易日收盤 ${updatedLabel ? `・${updatedLabel} 更新` : ""}`}
        </Text>
        <Text style={styles.statusCount}>共 {filtered.length} 檔</Text>
      </View>

      <View style={styles.listCard}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#2563EB" />
            <Text style={styles.loadingText}>正在向證交所取得最新資料…</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(e) => e.symbol}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <ETFListItem
                etf={item}
                onPress={() => navigation.navigate("ETFDetail", { symbol: item.symbol })}
                onToggleWatch={() => toggleWatchlist(item.symbol)}
                isWatchlisted={isWatchlisted(item.symbol)}
              />
            )}
            ListEmptyComponent={<Text style={styles.empty}>查無符合條件的 ETF</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    gap: 8,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  filterChip: {
    fontSize: 13,
    color: "#475569",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: "hidden",
  },
  filterChipActive: { backgroundColor: "#2563EB", color: "#fff" },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statusText: { fontSize: 11, color: "#94A3B8", flex: 1 },
  statusCount: { fontSize: 11, color: "#94A3B8" },
  listCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    marginBottom: 8,
  },
  loadingBox: { padding: 32, alignItems: "center", gap: 8 },
  loadingText: { fontSize: 12, color: "#94A3B8" },
  empty: { padding: 24, textAlign: "center", color: "#94A3B8" },
});
