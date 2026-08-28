export interface ETF {
  symbol: string;
  name: string;
  market: "TW" | "US";
  price: number;
  change: number;
  changePercent: number;
  nav?: number;
  premiumDiscount?: number;
  expenseRatio: number;
  dividendYield: number;
  aum: number;
  category: string;
  holdings: ETFHolding[];
  priceHistory: number[];
  description: string;
  dividendFrequency?: "monthly" | "quarterly" | "semiannual" | "annual";
  nextExDividendDate?: string; // ISO date，預估除息日
  nextPayDate?: string; // ISO date，預估發放日
}

export interface ETFHolding {
  name: string;
  weight: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: "buy" | "sell" | "dividend";
  shares: number;
  price: number;
  fee: number;
  date: string;
  note?: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: "above" | "below";
  active: boolean;
  createdAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  relatedSymbols: string[];
}

export interface PortfolioHolding {
  symbol: string;
  totalShares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  weight: number;
}
