import { ETF, ETFHolding, NewsItem } from "@/types";

/**
 * 「已知ETF補完資料」：台灣證交所免費OpenAPI只提供價格，不提供成分股、
 * 內扣費用率、殖利率等基金公開說明書層級的資訊。這裡針對市場上討論度
 * 較高的常見ETF維護一份補完資料，抓到即時價格後會自動用代碼比對補上；
 * 同時附上 fallbackETF（含示範價格），在裝置離線或API暫時打不通時，
 * App仍能顯示合理的畫面而不是整頁空白。
 */
interface EnrichmentEntry {
  name: string;
  expenseRatio: number;
  dividendYield: number;
  aum: number;
  category: string;
  holdings: ETFHolding[];
  priceHistory: number[];
  description: string;
  dividendFrequency?: ETF["dividendFrequency"];
  nextExDividendDate?: string;
  nextPayDate?: string;
  fallbackETF: ETF;
}

function makeFallback(
  symbol: string,
  e: Omit<EnrichmentEntry, "fallbackETF">,
  price: number,
  change: number
): ETF {
  const prevClose = price - change;
  return {
    symbol,
    name: e.name,
    market: "TW",
    price,
    change,
    changePercent: prevClose > 0 ? (change / prevClose) * 100 : 0,
    expenseRatio: e.expenseRatio,
    dividendYield: e.dividendYield,
    aum: e.aum,
    category: e.category,
    holdings: e.holdings,
    priceHistory: e.priceHistory,
    description: e.description,
    dividendFrequency: e.dividendFrequency,
    nextExDividendDate: e.nextExDividendDate,
    nextPayDate: e.nextPayDate,
  };
}

const RAW: Record<string, Omit<EnrichmentEntry, "fallbackETF"> & { price: number; change: number }> = {
  "0050": {
    name: "元大台灣50",
    price: 182.35,
    change: 1.25,
    expenseRatio: 0.43,
    dividendYield: 2.1,
    aum: 3500,
    category: "市值型",
    holdings: [
      { name: "台積電", weight: 52.3 },
      { name: "鴻海", weight: 6.1 },
      { name: "聯發科", weight: 4.2 },
      { name: "廣達", weight: 2.8 },
      { name: "其他", weight: 34.6 },
    ],
    priceHistory: [170, 172, 175, 174, 178, 180, 179, 181, 182.35],
    description: "追蹤台灣50指數，涵蓋台股市值前50大公司，為台灣規模最大的ETF。",
    dividendFrequency: "semiannual",
    nextExDividendDate: "2026-10-15",
    nextPayDate: "2026-11-05",
  },
  "0056": {
    name: "元大高股息",
    price: 38.72,
    change: -0.15,
    expenseRatio: 0.66,
    dividendYield: 6.8,
    aum: 2900,
    category: "高股息",
    holdings: [
      { name: "聯電", weight: 5.2 },
      { name: "仁寶", weight: 4.8 },
      { name: "光寶科", weight: 4.1 },
      { name: "其他", weight: 85.9 },
    ],
    priceHistory: [37, 37.5, 38, 37.8, 38.1, 38.9, 38.6, 38.9, 38.72],
    description: "精選台灣高殖利率股票，每年配息，適合追求現金流的投資人。",
    dividendFrequency: "quarterly",
    nextExDividendDate: "2026-09-18",
    nextPayDate: "2026-10-08",
  },
  "00878": {
    name: "國泰永續高股息",
    price: 21.45,
    change: 0.08,
    expenseRatio: 0.59,
    dividendYield: 5.9,
    aum: 3300,
    category: "高股息",
    holdings: [
      { name: "台達電", weight: 4.5 },
      { name: "研華", weight: 3.9 },
      { name: "其他", weight: 91.6 },
    ],
    priceHistory: [20.8, 21, 21.2, 21.1, 21.3, 21.5, 21.4, 21.5, 21.45],
    description: "採季配息，聚焦MSCI永續指數成分股中高股息個股。",
    dividendFrequency: "quarterly",
    nextExDividendDate: "2026-09-22",
    nextPayDate: "2026-10-12",
  },
  "006208": {
    name: "富邦台灣采吉50",
    price: 98.65,
    change: 0.55,
    expenseRatio: 0.35,
    dividendYield: 2.3,
    aum: 1450,
    category: "市值型",
    holdings: [
      { name: "台積電", weight: 51.8 },
      { name: "鴻海", weight: 5.9 },
      { name: "聯發科", weight: 4.0 },
      { name: "其他", weight: 38.3 },
    ],
    priceHistory: [92, 93.5, 95, 94.5, 96, 97.5, 97, 98.2, 98.65],
    description: "同樣追蹤台灣50指數，內扣費用率為市值型ETF中最低之一。",
    dividendFrequency: "semiannual",
    nextExDividendDate: "2026-10-20",
    nextPayDate: "2026-11-10",
  },
  "00713": {
    name: "元大台灣高息低波",
    price: 55.8,
    change: -0.2,
    expenseRatio: 0.65,
    dividendYield: 7.2,
    aum: 1800,
    category: "高股息",
    holdings: [
      { name: "統一", weight: 5.1 },
      { name: "中華電", weight: 4.6 },
      { name: "其他", weight: 90.3 },
    ],
    priceHistory: [54, 54.5, 55, 54.8, 55.2, 56, 55.6, 55.9, 55.8],
    description: "篩選低波動、高股息的台股標的，訴求相對抗震的配息型ETF。",
    dividendFrequency: "quarterly",
    nextExDividendDate: "2026-09-16",
    nextPayDate: "2026-10-06",
  },
  "00919": {
    name: "群益台灣精選高息",
    price: 23.15,
    change: 0.1,
    expenseRatio: 0.5,
    dividendYield: 9.1,
    aum: 2600,
    category: "高股息",
    holdings: [
      { name: "聯發科", weight: 6.0 },
      { name: "台達電", weight: 5.2 },
      { name: "其他", weight: 88.8 },
    ],
    priceHistory: [22.5, 22.7, 22.9, 22.8, 23, 23.3, 23.1, 23.2, 23.15],
    description: "採季配息，主打高股利率選股邏輯，是近年討論度極高的高股息ETF。",
    dividendFrequency: "quarterly",
    nextExDividendDate: "2026-09-10",
    nextPayDate: "2026-09-30",
  },
  "00929": {
    name: "復華台灣科技優息",
    price: 20.4,
    change: 0.12,
    expenseRatio: 0.55,
    dividendYield: 8.4,
    aum: 3100,
    category: "高股息",
    holdings: [
      { name: "台積電", weight: 7.5 },
      { name: "聯電", weight: 5.8 },
      { name: "其他", weight: 86.7 },
    ],
    priceHistory: [19.8, 20, 20.2, 20.1, 20.3, 20.5, 20.35, 20.45, 20.4],
    description: "月配息，聚焦台灣科技產業並結合covered call策略增加收益。",
    dividendFrequency: "monthly",
    nextExDividendDate: "2026-09-15",
    nextPayDate: "2026-09-25",
  },
  "0052": {
    name: "富邦科技",
    price: 148.3,
    change: -1.1,
    expenseRatio: 0.44,
    dividendYield: 1.8,
    aum: 620,
    category: "產業主題",
    holdings: [
      { name: "台積電", weight: 62.1 },
      { name: "鴻海", weight: 8.3 },
      { name: "其他", weight: 29.6 },
    ],
    priceHistory: [142, 144, 146, 145, 147, 149, 148, 149.5, 148.3],
    description: "集中投資台灣科技產業龍頭股，波動度較市值型ETF高。",
    dividendFrequency: "annual",
    nextExDividendDate: "2026-11-01",
    nextPayDate: "2026-11-20",
  },
  "00692": {
    name: "富邦公司治理",
    price: 41.6,
    change: 0.25,
    expenseRatio: 0.36,
    dividendYield: 2.6,
    aum: 380,
    category: "市值型",
    holdings: [
      { name: "台積電", weight: 48.9 },
      { name: "聯發科", weight: 4.5 },
      { name: "其他", weight: 46.6 },
    ],
    priceHistory: [39.5, 40, 40.5, 40.2, 40.8, 41.3, 41, 41.7, 41.6],
    description: "篩選公司治理評鑑優良企業，兼顧市值型與公司治理品質。",
    dividendFrequency: "semiannual",
    nextExDividendDate: "2026-10-25",
    nextPayDate: "2026-11-15",
  },
  "00850": {
    name: "元大臺灣ESG永續",
    price: 39.2,
    change: 0.05,
    expenseRatio: 0.42,
    dividendYield: 2.9,
    aum: 320,
    category: "市值型",
    holdings: [
      { name: "台積電", weight: 33.4 },
      { name: "鴻海", weight: 5.0 },
      { name: "其他", weight: 61.6 },
    ],
    priceHistory: [37.8, 38, 38.3, 38.1, 38.6, 39, 38.9, 39.3, 39.2],
    description: "結合ESG永續評分篩選成分股，兼顧環境、社會與公司治理表現。",
    dividendFrequency: "semiannual",
    nextExDividendDate: "2026-10-18",
    nextPayDate: "2026-11-08",
  },
  "00922": {
    name: "國泰台灣領袖50",
    price: 24.75,
    change: 0.18,
    expenseRatio: 0.48,
    dividendYield: 5.2,
    aum: 1750,
    category: "市值型",
    holdings: [
      { name: "台積電", weight: 30.2 },
      { name: "鴻海", weight: 6.5 },
      { name: "其他", weight: 63.3 },
    ],
    priceHistory: [23.8, 24, 24.2, 24.1, 24.4, 24.6, 24.5, 24.8, 24.75],
    description: "結合台灣龍頭權值股與獲利品質篩選，兼具成長與配息潛力。",
    dividendFrequency: "quarterly",
    nextExDividendDate: "2026-09-28",
    nextPayDate: "2026-10-18",
  },
  "00915": {
    name: "凱基優選高股息30",
    price: 26.9,
    change: -0.08,
    expenseRatio: 0.55,
    dividendYield: 7.8,
    aum: 950,
    category: "高股息",
    holdings: [
      { name: "廣達", weight: 5.5 },
      { name: "緯創", weight: 4.8 },
      { name: "其他", weight: 89.7 },
    ],
    priceHistory: [26, 26.2, 26.5, 26.3, 26.6, 27, 26.8, 27.1, 26.9],
    description: "精選30檔高股息成分股，訴求穩定季配息現金流。",
    dividendFrequency: "quarterly",
    nextExDividendDate: "2026-09-12",
    nextPayDate: "2026-10-02",
  },
};

export const ETF_ENRICHMENT: Record<string, EnrichmentEntry> = Object.fromEntries(
  Object.entries(RAW).map(([symbol, r]) => {
    const { price, change, ...rest } = r;
    return [symbol, { ...rest, fallbackETF: makeFallback(symbol, rest, price, change) }];
  })
);

export const US_ETFS: ETF[] = [
  {
    symbol: "VOO",
    name: "Vanguard S&P 500 ETF",
    market: "US",
    price: 512.8,
    change: 3.4,
    changePercent: 0.67,
    nav: 512.75,
    premiumDiscount: 0.01,
    expenseRatio: 0.03,
    dividendYield: 1.3,
    aum: 480000,
    category: "市值型",
    holdings: [
      { name: "Apple", weight: 7.1 },
      { name: "Microsoft", weight: 6.8 },
      { name: "Nvidia", weight: 6.2 },
      { name: "其他", weight: 79.9 },
    ],
    priceHistory: [495, 498, 502, 500, 505, 508, 510, 511, 512.8],
    description: "追蹤S&P 500指數，全球規模最大的ETF之一，內扣費用極低。",
    dividendFrequency: "quarterly",
    nextExDividendDate: "2026-09-25",
    nextPayDate: "2026-10-02",
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    market: "US",
    price: 478.2,
    change: -2.1,
    changePercent: -0.44,
    nav: 478.3,
    premiumDiscount: -0.02,
    expenseRatio: 0.2,
    dividendYield: 0.6,
    aum: 260000,
    category: "科技產業",
    holdings: [
      { name: "Nvidia", weight: 8.9 },
      { name: "Apple", weight: 8.1 },
      { name: "Microsoft", weight: 7.6 },
      { name: "其他", weight: 75.4 },
    ],
    priceHistory: [465, 470, 472, 468, 474, 480, 479, 480.3, 478.2],
    description: "追蹤那斯達克100指數，集中於科技與成長股。",
    dividendFrequency: "quarterly",
    nextExDividendDate: "2026-09-20",
    nextPayDate: "2026-09-27",
  },
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "台股ETF規模續創新高，00878單月受益人數突破紀錄",
    summary: "高股息ETF買氣持續發燒，投信法人分析資金動向與配息穩定度為主因。",
    source: "市場觀察",
    publishedAt: new Date().toISOString(),
    relatedSymbols: ["00878", "0056"],
  },
  {
    id: "n2",
    title: "Fed利率決策前夕，美股ETF資金流向分歧",
    summary: "市場等待聯準會最新利率決議，科技類與大盤型ETF資金流向出現分化。",
    source: "國際財經",
    publishedAt: new Date().toISOString(),
    relatedSymbols: ["VOO", "QQQ"],
  },
];
