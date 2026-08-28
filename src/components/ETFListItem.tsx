import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ETF } from "@/types";
import { formatCurrency, formatPercent } from "@/utils/formatters";

interface Props {
  etf: ETF;
  onPress: () => void;
  onToggleWatch?: () => void;
  isWatchlisted?: boolean;
}

export default function ETFListItem({ etf, onPress, onToggleWatch, isWatchlisted }: Props) {
  const isUp = etf.change >= 0;
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <Text style={styles.symbol}>{etf.symbol}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {etf.name}
        </Text>
        <Text style={styles.category}>{etf.category}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>{formatCurrency(etf.price, etf.market)}</Text>
        <Text style={[styles.change, { color: isUp ? "#16A34A" : "#DC2626" }]}>
          {isUp ? "▲" : "▼"} {formatPercent(etf.changePercent)}
        </Text>
      </View>
      {onToggleWatch && (
        <TouchableOpacity onPress={onToggleWatch} style={styles.star} hitSlop={10}>
          <Ionicons
            name={isWatchlisted ? "star" : "star-outline"}
            size={20}
            color={isWatchlisted ? "#F59E0B" : "#94A3B8"}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#fff",
  },
  left: { flex: 1 },
  symbol: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  name: { fontSize: 13, color: "#475569", marginTop: 2 },
  category: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  right: { alignItems: "flex-end", marginRight: 8 },
  price: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  change: { fontSize: 12, marginTop: 2, fontWeight: "600" },
  star: { paddingLeft: 4 },
});
