export function formatCurrency(value: number, market: "TW" | "US" = "TW"): string {
  const symbol = market === "TW" ? "NT$" : "US$";
  return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function calcCAGR(begin: number, end: number, years: number): number {
  if (begin <= 0 || years <= 0) return 0;
  return (Math.pow(end / begin, 1 / years) - 1) * 100;
}
