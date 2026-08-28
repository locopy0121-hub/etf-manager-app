import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { fetchAllETFs } from "@/services/etfApiService";
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

  useEffect(() => {
    fetchAllETFs().then(setEtfs);
  }, []);

  const filtered = etfs.filter((e) => {
    const matchesKeyword =
      !keyword ||
      e.symbol.toLowerCase().includes(keyword.toLowerCase()) ||
      e.name.toLowerCase().includes(keyword.toLowerCase());
    const matchesFilter =
      filter === "全部" || e.market === filter || e.category === filter;
    return matchesKeyword && matchesFilter;
  });

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
      <FlatList
        data={filtered}
        keyExtractor={(e) => e.symbol}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  filterChip: {
    fontSize: 13,
    color: "#475569",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },
  filterChipActive: { backgroundColor: "#2563EB", color: "#fff", borderColor: "#2563EB" },
  empty: { padding: 24, textAlign: "center", color: "#94A3B8" },
});
