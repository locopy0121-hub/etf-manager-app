/**
 * ETF 資料服務層
 * ---------------------------------------------------------
 * 台股ETF：串接「台灣證券交易所 OpenAPI」的公開資料集
 *   https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL
 *   → 回傳「前一個交易日」全市場（含所有ETF）收盤行情，免金鑰、免申請。
 *   → 注意：這是「收盤後更新」的資料，不是盤中逐筆跳動的即時報價；
 *     若要做到盤中即時（約5秒更新一次），可改用下方 fetchTWSERealtimeQuotes()，
 *     這支是證交所「基本市況報導網站」的端點，適合用在觀察清單等小範圍更新。
 *
 * 美股ETF：目前仍為模擬資料。要接上真實美股報價，建議：
 *   - Alpha Vantage（https://www.alphavantage.co）— 有免費額度
 *   - Finnhub（https://finnhub.io）— 有免費額度，支援即時報價
 *   申請到API Key後，比照 fetchTWSEStockDayAll() 的寫法新增 fetchUSQuotes() 即可。
 *
 * 成分股／內扣費用率／殖利率等「基金公開說明書」層級的資料，TWSE免費API不提供，
 * 這裡採「已知代碼補完」策略：常見ETF的這類資料維護在 src/data/mockETFs.ts 的
 * ETF_ENRICHMENT，抓到即時價格後會自動用代碼比對補上；沒有維護到的代碼則會顯示
 * 「暫無詳細資料」，但價格本身一樣是真實資料。
 */

import { ETF, NewsItem } from "@/types";
import { ETF_ENRICHMENT, US_ETFS, MOCK_NEWS } from "@/data/mockETFs";

const TWSE_STOCK_DAY_ALL_URL = "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL";

// 簡易記憶體快取，同一次App使用期間30分鐘內重用同一份資料，避免過度呼叫
let cachedTWETFs: ETF[] | null = null;
let cachedAt = 0;
let lastFetchFailed = false;
const CACHE_TTL_MS = 30 * 60 * 1000;

function toNumber(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/,/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * 台股代碼是否為ETF的簡易判斷：
 * 台灣掛牌ETF代碼慣例以「00」開頭（例如 0050、0056、006208、00878），
 * 一般個股代碼則是 1xxx～9xxx，不會以00開頭，因此用這個規則即可從
 * 全市場資料中篩出所有ETF，不需要另外維護一份「全部ETF代碼清單」。
 */
function isETFCode(code: string): boolean {
  return /^00\d{2,4}$/.test(code);
}

interface TWSERow {
  Code: string;
  Name: string;
  ClosingPrice: string;
  Change: string;
}

async function fetchTWSEStockDayAll(): Promise<ETF[]> {
  const res = await fetch(TWSE_STOCK_DAY_ALL_URL);
  if (!res.ok) throw new Error(`TWSE OpenAPI 回應錯誤：${res.status}`);
  const rows: TWSERow[] = await res.json();

  return rows
    .filter((r) => isETFCode(r.Code) && r.ClosingPrice)
    .map((r) => {
      const price = toNumber(r.ClosingPrice);
      const change = toNumber(r.Change);
      const prevClose = price - change;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
      const enrichment = ETF_ENRICHMENT[r.Code];

      const etf: ETF = {
        symbol: r.Code,
        name: r.Name?.trim() || enrichment?.name || r.Code,
        market: "TW",
        price,
        change,
        changePercent,
        expenseRatio: enrichment?.expenseRatio ?? 0,
        dividendYield: enrichment?.dividendYield ?? 0,
        aum: enrichment?.aum ?? 0,
        category: enrichment?.category ?? "其他",
        holdings: enrichment?.holdings ?? [],
        priceHistory: enrichment?.priceHistory ?? [prevClose, price],
        description: enrichment?.description ?? "此檔ETF暫無維護詳細基本資料，但價格為即時抓取。",
        dividendFrequency: enrichment?.dividendFrequency,
        nextExDividendDate: enrichment?.nextExDividendDate,
        nextPayDate: enrichment?.nextPayDate,
      };
      return etf;
    })
    // 有維護詳細資料、規模較大的ETF排前面，體驗較好；其餘依代碼排序
    .sort((a, b) => b.aum - a.aum || a.symbol.localeCompare(b.symbol));
}

export async function fetchAllETFs(forceRefresh = false): Promise<ETF[]> {
  const now = Date.now();
  if (!forceRefresh && cachedTWETFs && now - cachedAt < CACHE_TTL_MS) {
    return [...cachedTWETFs, ...US_ETFS];
  }

  try {
    const twETFs = await fetchTWSEStockDayAll();
    cachedTWETFs = twETFs;
    cachedAt = now;
    lastFetchFailed = false;
    return [...twETFs, ...US_ETFS];
  } catch (e) {
    console.warn("串接台灣證交所OpenAPI失敗，改用備援資料：", e);
    lastFetchFailed = true;
    const fallback = Object.values(ETF_ENRICHMENT).map((entry) => entry.fallbackETF);
    return [...fallback, ...US_ETFS];
  }
}

/** 上一次呼叫 fetchAllETFs() 是否改用了備援資料（可用來在畫面上提示使用者） */
export function didLastFetchFail(): boolean {
  return lastFetchFailed;
}

/** 目前快取資料的時間，用於畫面顯示「最後更新時間」 */
export function getLastFetchedAt(): number {
  return cachedAt;
}

export async function fetchETFBySymbol(symbol: string): Promise<ETF | undefined> {
  const all = await fetchAllETFs();
  return all.find((e) => e.symbol === symbol);
}

export async function searchETFs(keyword: string): Promise<ETF[]> {
  const all = await fetchAllETFs();
  const kw = keyword.trim().toLowerCase();
  if (!kw) return all;
  return all.filter(
    (e) =>
      e.symbol.toLowerCase().includes(kw) ||
      e.name.toLowerCase().includes(kw) ||
      e.category.toLowerCase().includes(kw)
  );
}

export async function fetchNews(): Promise<NewsItem[]> {
  return MOCK_NEWS;
}

/**
 * 【進階／選用】盤中即時報價（約5秒更新一次）
 * 證交所「基本市況報導網站」提供的端點，非正式文件化API，但業界廣泛使用、免金鑰。
 * 一次最多建議查詢數十檔（用 | 分隔），適合用在「觀察清單」「持有中」這種小範圍、
 * 需要接近即時更新的畫面，不適合拿來一次抓全市場。
 *
 * 用法範例：
 *   const quotes = await fetchTWSERealtimeQuotes(["0050", "0056"]);
 *   // => { "0050": 182.4, "0056": 38.75 }
 */
export async function fetchTWSERealtimeQuotes(
  symbols: string[]
): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};
  const ex_ch = symbols.map((s) => `tse_${s}.tw`).join("|");
  const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${ex_ch}&json=1&delay=0`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const result: Record<string, number> = {};
    (data?.msgArray ?? []).forEach((item: any) => {
      if (item?.c && item?.z && item.z !== "-") {
        result[item.c] = parseFloat(item.z);
      }
    });
    return result;
  } catch (e) {
    console.warn("盤中即時報價取得失敗：", e);
    return {};
  }
}

/**
 * 輪詢式價格更新（示範用）：每隔 intervalMs 呼叫一次盤中即時報價，
 * 用於觀察清單／持股等小範圍即時更新場景。目前僅支援台股代碼。
 */
export function subscribeToPriceUpdates(
  symbols: string[],
  onUpdate: (symbol: string, price: number) => void,
  intervalMs = 15000
): () => void {
  const twSymbols = symbols.filter((s) => /^00/.test(s));
  if (twSymbols.length === 0) return () => {};

  let cancelled = false;
  const tick = async () => {
    const quotes = await fetchTWSERealtimeQuotes(twSymbols);
    if (cancelled) return;
    Object.entries(quotes).forEach(([symbol, price]) => onUpdate(symbol, price));
  };

  tick();
  const interval = setInterval(tick, intervalMs);
  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}
