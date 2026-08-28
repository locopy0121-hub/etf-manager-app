import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import DashboardScreen from "@/screens/DashboardScreen";
import MarketScreen from "@/screens/MarketScreen";
import WatchlistScreen from "@/screens/WatchlistScreen";
import PortfolioScreen from "@/screens/PortfolioScreen";
import MoreScreen from "@/screens/MoreScreen";
import ETFDetailScreen from "@/screens/ETFDetailScreen";
import AddTransactionScreen from "@/screens/AddTransactionScreen";
import AlertsScreen from "@/screens/AlertsScreen";
import NewsScreen from "@/screens/NewsScreen";
import DCACalculatorScreen from "@/screens/DCACalculatorScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import DividendCalendarScreen from "@/screens/DividendCalendarScreen";

export type RootStackParamList = {
  Tabs: undefined;
  ETFDetail: { symbol: string };
  AddTransaction: { symbol?: string };
  Alerts: undefined;
  News: undefined;
  DCACalculator: undefined;
  Settings: undefined;
  DividendCalendar: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            總覽: "home",
            市場: "trending-up",
            觀察清單: "star",
            投資組合: "briefcase",
            更多: "menu",
          };
          return <Ionicons name={icons[route.name] ?? "ellipse"} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="總覽" component={DashboardScreen} />
      <Tab.Screen name="市場" component={MarketScreen} />
      <Tab.Screen name="觀察清單" component={WatchlistScreen} />
      <Tab.Screen name="投資組合" component={PortfolioScreen} />
      <Tab.Screen name="更多" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="ETFDetail"
          component={ETFDetailScreen}
          options={{ title: "ETF 詳情" }}
        />
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{ title: "新增交易紀錄", presentation: "modal" }}
        />
        <Stack.Screen name="Alerts" component={AlertsScreen} options={{ title: "價格提醒" }} />
        <Stack.Screen name="News" component={NewsScreen} options={{ title: "市場新聞" }} />
        <Stack.Screen
          name="DCACalculator"
          component={DCACalculatorScreen}
          options={{ title: "定期定額試算" }}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "設定" }} />
        <Stack.Screen
          name="DividendCalendar"
          component={DividendCalendarScreen}
          options={{ title: "配息行事曆" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
