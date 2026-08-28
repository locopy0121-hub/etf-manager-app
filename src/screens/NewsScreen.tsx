import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchNews } from "@/services/etfApiService";
import { NewsItem } from "@/types";
import { formatDate } from "@/utils/formatters";

export default function NewsScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetchNews().then(setNews);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        data={news}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.summary}>{item.summary}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{item.source}</Text>
              <Text style={styles.meta}>{formatDate(item.publishedAt)}</Text>
            </View>
            <View style={styles.tagRow}>
              {item.relatedSymbols.map((s) => (
                <Text key={s} style={styles.tag}>
                  {s}
                </Text>
              ))}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>目前沒有新聞</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12 },
  title: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  summary: { fontSize: 13, color: "#475569", marginTop: 6, lineHeight: 18 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  meta: { fontSize: 11, color: "#94A3B8" },
  tagRow: { flexDirection: "row", gap: 6, marginTop: 8 },
  tag: {
    fontSize: 11,
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  empty: { textAlign: "center", color: "#94A3B8", marginTop: 32 },
});
