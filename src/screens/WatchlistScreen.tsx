import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { fetchAllETFs } from "@/services/etfApiService";
import { ETF } from "@/types";
import { usePortfolio } from "@/context/PortfolioContext";
import ETFListItem from "@/components/ETFListItem";
import { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WatchlistScreen() {
  const navigation = useNavigation<Nav>();
  const { watchlist, toggleWatchlist, isWatchlisted } = usePortfolio();
  const [etfs, setEtfs] = useState<ETF[]>([]);

  useEffect(() => {
    fetchAllETFs().then(setEtfs);
  }, []);

  const list = etfs.filter((e) => watchlist.includes(e.symbol));

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        data={list}
        keyExtractor={(e) => e.symbol}
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
            <Text style={styles.empty}>尚未加入任何觀察標的</Text>
            <Text style={styles.emptySub}>到「市場」頁點選星號即可加入觀察清單</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  emptyBox: { padding: 32, alignItems: "center" },
  empty: { fontSize: 15, color: "#334155", fontWeight: "600" },
  emptySub: { fontSize: 13, color: "#94A3B8", marginTop: 6, textAlign: "center" },
});
