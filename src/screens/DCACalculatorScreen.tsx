import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatCurrency } from "@/utils/formatters";

export default function DCACalculatorScreen() {
  const [monthlyAmount, setMonthlyAmount] = useState("10000");
  const [years, setYears] = useState("10");
  const [annualReturn, setAnnualReturn] = useState("6");

  const result = useMemo(() => {
    const monthly = parseFloat(monthlyAmount) || 0;
    const y = parseFloat(years) || 0;
    const r = (parseFloat(annualReturn) || 0) / 100 / 12;
    const months = y * 12;

    let futureValue = 0;
    for (let i = 0; i < months; i++) {
      futureValue = (futureValue + monthly) * (1 + r);
    }
    const totalInvested = monthly * months;
    const totalReturn = futureValue - totalInvested;
    return { futureValue, totalInvested, totalReturn };
  }, [monthlyAmount, years, annualReturn]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.label}>每月投入金額</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={monthlyAmount}
          onChangeText={setMonthlyAmount}
        />

        <Text style={styles.label}>投資年期（年）</Text>
        <TextInput style={styles.input} keyboardType="decimal-pad" value={years} onChangeText={setYears} />

        <Text style={styles.label}>預期年化報酬率（%）</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={annualReturn}
          onChangeText={setAnnualReturn}
        />

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>預估最終資產</Text>
          <Text style={styles.resultValue}>{formatCurrency(result.futureValue)}</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultSub}>累積投入本金</Text>
            <Text style={styles.resultSubValue}>{formatCurrency(result.totalInvested)}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultSub}>預估投資收益</Text>
            <Text style={[styles.resultSubValue, { color: "#16A34A" }]}>
              {formatCurrency(result.totalReturn)}
            </Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          此試算結果為根據固定報酬率假設之估算值，僅供參考，不代表未來實際投資報酬，實際報酬會因市場波動而異。
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  resultCard: { backgroundColor: "#0F172A", borderRadius: 16, padding: 20, marginTop: 28 },
  resultLabel: { color: "#94A3B8", fontSize: 13 },
  resultValue: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 4, marginBottom: 12 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  resultSub: { color: "#94A3B8", fontSize: 13 },
  resultSubValue: { color: "#fff", fontSize: 13, fontWeight: "600" },
  disclaimer: { fontSize: 11, color: "#94A3B8", marginTop: 16, lineHeight: 16 },
});
