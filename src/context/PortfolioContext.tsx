import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ETF, PortfolioHolding, PriceAlert, Transaction } from "@/types";
import { MOCK_ETFS } from "@/data/mockETFs";

interface PortfolioContextValue {
  transactions: Transaction[];
  watchlist: string[];
  alerts: PriceAlert[];
  holdings: PortfolioHolding[];
  totalMarketValue: number;
  totalCost: number;
  totalUnrealizedPL: number;
  totalUnrealizedPLPercent: number;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  removeTransaction: (id: string) => void;
  toggleWatchlist: (symbol: string) => void;
  isWatchlisted: (symbol: string) => boolean;
  addAlert: (a: Omit<PriceAlert, "id" | "createdAt">) => void;
  removeAlert: (id: string) => void;
}

const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  transactions: "@etf_manager/transactions",
  watchlist: "@etf_manager/watchlist",
  alerts: "@etf_manager/alerts",
};

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(["0050", "00878", "VOO"]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 啟動時讀取本機儲存
  useEffect(() => {
    (async () => {
      try {
        const [txRaw, wlRaw, alRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.transactions),
          AsyncStorage.getItem(STORAGE_KEYS.watchlist),
          AsyncStorage.getItem(STORAGE_KEYS.alerts),
        ]);
        if (txRaw) setTransactions(JSON.parse(txRaw));
        if (wlRaw) setWatchlist(JSON.parse(wlRaw));
        if (alRaw) setAlerts(JSON.parse(alRaw));
      } catch (e) {
        console.warn("讀取本機資料失敗", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // 變動時寫回本機儲存
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
  }, [transactions, loaded]);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(watchlist));
  }, [watchlist, loaded]);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(alerts));
  }, [alerts, loaded]);

  const addTransaction = (t: Omit<Transaction, "id">) => {
    setTransactions((prev) => [...prev, { ...t, id: `tx_${Date.now()}` }]);
  };

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleWatchlist = (symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const isWatchlisted = (symbol: string) => watchlist.includes(symbol);

  const addAlert = (a: Omit<PriceAlert, "id" | "createdAt">) => {
    setAlerts((prev) => [
      ...prev,
      { ...a, id: `alert_${Date.now()}`, createdAt: new Date().toISOString() },
    ]);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // 依交易紀錄計算目前持倉（先進先出簡化為加權平均成本法）
  const holdings: PortfolioHolding[] = useMemo(() => {
    const bySymbol: Record<string, { shares: number; cost: number }> = {};
    transactions.forEach((t) => {
      if (!bySymbol[t.symbol]) bySymbol[t.symbol] = { shares: 0, cost: 0 };
      if (t.type === "buy") {
        bySymbol[t.symbol].shares += t.shares;
        bySymbol[t.symbol].cost += t.shares * t.price + t.fee;
      } else if (t.type === "sell") {
        const avgCost =
          bySymbol[t.symbol].shares > 0
            ? bySymbol[t.symbol].cost / bySymbol[t.symbol].shares
            : 0;
        bySymbol[t.symbol].shares -= t.shares;
        bySymbol[t.symbol].cost -= t.shares * avgCost;
      }
    });

    const totalMV = Object.entries(bySymbol).reduce((sum, [symbol, v]) => {
      const etf = MOCK_ETFS.find((e) => e.symbol === symbol);
      if (!etf || v.shares <= 0) return sum;
      return sum + v.shares * etf.price;
    }, 0);

    return Object.entries(bySymbol)
      .filter(([, v]) => v.shares > 0.0001)
      .map(([symbol, v]) => {
        const etf = MOCK_ETFS.find((e) => e.symbol === symbol);
        const currentPrice = etf?.price ?? 0;
        const marketValue = v.shares * currentPrice;
        const avgCost = v.cost / v.shares;
        const unrealizedPL = marketValue - v.cost;
        return {
          symbol,
          totalShares: v.shares,
          avgCost,
          currentPrice,
          marketValue,
          unrealizedPL,
          unrealizedPLPercent: v.cost > 0 ? (unrealizedPL / v.cost) * 100 : 0,
          weight: totalMV > 0 ? (marketValue / totalMV) * 100 : 0,
        };
      });
  }, [transactions]);

  const totalMarketValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  const totalCost = holdings.reduce((s, h) => s + h.avgCost * h.totalShares, 0);
  const totalUnrealizedPL = totalMarketValue - totalCost;
  const totalUnrealizedPLPercent = totalCost > 0 ? (totalUnrealizedPL / totalCost) * 100 : 0;

  const value: PortfolioContextValue = {
    transactions,
    watchlist,
    alerts,
    holdings,
    totalMarketValue,
    totalCost,
    totalUnrealizedPL,
    totalUnrealizedPLPercent,
    addTransaction,
    removeTransaction,
    toggleWatchlist,
    isWatchlisted,
    addAlert,
    removeAlert,
  };

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio 必須在 PortfolioProvider 內使用");
  return ctx;
}
