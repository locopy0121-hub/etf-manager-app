import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { fetchAllETFs, didLastFetchFail } from "@/services/etfApiService";
import { ETF } from "@/types";
import { usePortfolio } from "@/context/PortfolioContext";
import ETFListItem from "@/components/ETFListItem";
import { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WatchlistScreen() {
  const navigation = useNavigation<Nav>();
  const { watchlist, toggleWatchlist, isWatchlisted } = usePortfolio();
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
    await load(true);
    setRefreshing(false);
  };

  const list = etfs.filter((e) => watchlist.includes(e.symbol));

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {fetchFailed && (
        <View style={styles.warningBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color="#B45309" />
          <Text style={styles.warningText}>目前顯示備援參考價格，下拉可重試連線</Text>
        </View>
      )}
      <View style={styles.listCard}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#2563EB" />
          </View>
        ) : (
          <FlatList
            data={list}
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
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="star-outline" size={32} color="#CBD5E1" />
                <Text style={styles.empty}>尚未加入任何觀察標的</Text>
                <Text style={styles.emptySub}>到「市場」頁點選星號即可加入觀察清單</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9", paddingTop: 12 },
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
  listCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  loadingBox: { padding: 32, alignItems: "center" },
  emptyBox: { padding: 40, alignItems: "center", gap: 6 },
  empty: { fontSize: 15, color: "#334155", fontWeight: "600" },
  emptySub: { fontSize: 13, color: "#94A3B8", textAlign: "center" },
});
