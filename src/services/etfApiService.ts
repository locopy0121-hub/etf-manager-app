/**
 * ETF 資料服務層
 * ---------------------------------------------------------
 * 目前預設回傳 mock 資料，方便直接在 Expo 上預覽 App。
 * 要接上「真實報價」，建議依市場選擇下列其中一種資料源，
 * 並在 fetchQuote() / fetchHistory() 中改為呼叫真實 API：
 *
 * 台股：
 *  - 台灣證券交易所 OpenAPI（https://openapi.twse.com.tw）— 免費，適合日線／基本資料
 *  - 證券商官方 API（如：元大、永豐金、富邦，皆需簽署使用合約與API金鑰）
 *
 * 美股／全球：
 *  - Alpha Vantage（https://www.alphavantage.co）— 有免費額度
 *  - Finnhub（https://finnhub.io）— 有免費額度，支援即時報價
 *  - Yahoo Finance 非官方套件（僅供學習用途，正式產品建議使用官方授權資料）
 *
 * 建議做法：
 *  1. 將 API Key 放在 .env（不要提交到 GitHub，已加入 .gitignore）
 *  2. 用 expo-constants 或 react-native-dotenv 讀取
 *  3. 在後端（如 Supabase / Firebase Functions）做代理呼叫，避免金鑰外洩到前端
 */

import { ETF, NewsItem } from "@/types";
import { MOCK_ETFS, MOCK_NEWS } from "@/data/mockETFs";

const SIMULATED_DELAY = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY));
}

export async function fetchAllETFs(): Promise<ETF[]> {
  // TODO: 正式串接時改為 fetch(`${API_BASE}/quotes`)
  return delay(MOCK_ETFS);
}

export async function fetchETFBySymbol(symbol: string): Promise<ETF | undefined> {
  return delay(MOCK_ETFS.find((e) => e.symbol === symbol));
}

export async function searchETFs(keyword: string): Promise<ETF[]> {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return delay(MOCK_ETFS);
  return delay(
    MOCK_ETFS.filter(
      (e) =>
        e.symbol.toLowerCase().includes(kw) ||
        e.name.toLowerCase().includes(kw) ||
        e.category.toLowerCase().includes(kw)
    )
  );
}

export async function fetchNews(): Promise<NewsItem[]> {
  return delay(MOCK_NEWS);
}

/**
 * 模擬即時報價更新（示範用）。
 * 正式環境建議改用 WebSocket 或定時輪詢真實 API。
 */
export function subscribeToPriceUpdates(
  symbols: string[],
  onUpdate: (symbol: string, price: number) => void
): () => void {
  const interval = setInterval(() => {
    symbols.forEach((symbol) => {
      const etf = MOCK_ETFS.find((e) => e.symbol === symbol);
      if (!etf) return;
      const drift = (Math.random() - 0.5) * (etf.price * 0.002);
      const newPrice = Math.round((etf.price + drift) * 100) / 100;
      etf.price = newPrice;
      onUpdate(symbol, newPrice);
    });
  }, 5000);

  return () => clearInterval(interval);
}
