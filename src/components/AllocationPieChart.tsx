import React from "react";
import { Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";

interface Slice {
  name: string;
  value: number;
  color: string;
}

const PALETTE = ["#2563EB", "#16A34A", "#F59E0B", "#DC2626", "#7C3AED", "#0891B2", "#94A3B8"];

export default function AllocationPieChart({ items }: { items: { name: string; value: number }[] }) {
  const width = Dimensions.get("window").width - 32;
  const data: Slice[] = items.map((it, i) => ({
    name: it.name,
    value: it.value,
    color: PALETTE[i % PALETTE.length],
  }));

  return (
    <PieChart
      data={data.map((d) => ({
        name: d.name,
        population: d.value,
        color: d.color,
        legendFontColor: "#334155",
        legendFontSize: 12,
      }))}
      width={width}
      height={200}
      chartConfig={{ color: () => "#000" }}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="8"
    />
  );
}
