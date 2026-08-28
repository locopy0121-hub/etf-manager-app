import React from "react";
import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

interface Props {
  data: number[];
  isUp: boolean;
}

export default function PriceChart({ data, isUp }: Props) {
  const width = Dimensions.get("window").width - 32;
  return (
    <View>
      <LineChart
        data={{
          labels: data.map((_, i) => (i % Math.ceil(data.length / 5) === 0 ? `${i}` : "")),
          datasets: [{ data }],
        }}
        width={width}
        height={200}
        withDots={false}
        withInnerLines={false}
        withOuterLines={false}
        bezier
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 2,
          color: () => (isUp ? "#16A34A" : "#DC2626"),
          labelColor: () => "#94A3B8",
          propsForBackgroundLines: { stroke: "#F1F5F9" },
        }}
        style={{ borderRadius: 12 }}
      />
    </View>
  );
}
