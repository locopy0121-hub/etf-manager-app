import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

interface Props {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

/**
 * 統一的卡片容器：白底、圓角、輕微陰影、標題列。
 * 讓「總覽」「市場」「觀察清單」「投資組合」等畫面有一致的視覺分區，
 * 而不是內容直接貼齊螢幕邊緣。
 */
export default function SectionCard({ title, subtitle, children, style, noPadding }: Props) {
  return (
    <View style={[styles.card, style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={noPadding ? undefined : styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  subtitle: { fontSize: 12, color: "#94A3B8" },
  body: { paddingBottom: 4 },
});
