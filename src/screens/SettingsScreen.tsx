import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);

  const rows = [
    { label: "推播通知（價格提醒／新聞）", value: notifications, onChange: setNotifications },
    { label: "深色模式", value: darkMode, onChange: setDarkMode },
    { label: "生物辨識登入（Face ID／指紋）", value: biometric, onChange: setBiometric },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {rows.map((r) => (
          <View key={r.label} style={styles.row}>
            <Text style={styles.label}>{r.label}</Text>
            <Switch value={r.value} onValueChange={r.onChange} />
          </View>
        ))}

        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>關於此 App</Text>
          <Text style={styles.aboutText}>
            ETF 資產管理家 v1.0.0{"\n"}
            使用 Expo + React Native 建置，整合報價、觀察清單、投資組合追蹤、價格提醒、定期定額試算與市場新聞等功能。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  label: { fontSize: 14, color: "#0F172A", flex: 1, paddingRight: 12 },
  aboutCard: { marginTop: 28, padding: 16, backgroundColor: "#F8FAFC", borderRadius: 12 },
  aboutTitle: { fontWeight: "700", fontSize: 14, color: "#0F172A", marginBottom: 6 },
  aboutText: { fontSize: 12, color: "#64748B", lineHeight: 18 },
});
