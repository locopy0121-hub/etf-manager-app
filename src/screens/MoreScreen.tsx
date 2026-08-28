import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function MoreScreen() {
  const navigation = useNavigation<Nav>();

  const items: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }[] = [
    { label: "價格提醒", icon: "notifications-outline", onPress: () => navigation.navigate("Alerts") },
    { label: "配息行事曆", icon: "calendar-outline", onPress: () => navigation.navigate("DividendCalendar") },
    { label: "市場新聞", icon: "newspaper-outline", onPress: () => navigation.navigate("News") },
    { label: "定期定額試算", icon: "calculator-outline", onPress: () => navigation.navigate("DCACalculator") },
    { label: "設定", icon: "settings-outline", onPress: () => navigation.navigate("Settings") },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {items.map((item) => (
        <TouchableOpacity key={item.label} style={styles.row} onPress={item.onPress}>
          <Ionicons name={item.icon} size={20} color="#2563EB" style={{ width: 28 }} />
          <Text style={styles.label}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", paddingTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
  },
  label: { flex: 1, fontSize: 15, color: "#0F172A", fontWeight: "500" },
});
