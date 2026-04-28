import type { HoldingRowProps, ThemeId } from "@/types/portfolio";

type MockHolding = {
  etf: HoldingRowProps["etf"];
  weightPct: number;
  segments: ("core" | ThemeId)[];
};

const MASTER_HOLDINGS: readonly MockHolding[] = [
  {
    etf: { ticker: "VTI", name: "Vanguard Total Stock Market ETF" },
    weightPct: 34,
    segments: ["core"],
  },
  {
    etf: { ticker: "BND", name: "Vanguard Total Bond Market ETF" },
    weightPct: 24,
    segments: ["core"],
  },
  {
    etf: { ticker: "SCHD", name: "Schwab US Dividend Equity ETF" },
    weightPct: 9,
    segments: ["core", "earn_and_grow"],
  },
  {
    etf: { ticker: "VIG", name: "Vanguard Dividend Appreciation ETF" },
    weightPct: 8,
    segments: ["earn_and_grow"],
  },
  {
    etf: { ticker: "ICLN", name: "iShares Global Clean Energy ETF" },
    weightPct: 6,
    segments: ["greater_good"],
  },
  {
    etf: { ticker: "ESGU", name: "iShares ESG Aware MSCI USA ETF" },
    weightPct: 7,
    segments: ["core", "greater_good"],
  },
  {
    etf: { ticker: "BOTZ", name: "Global X Robotics and AI ETF" },
    weightPct: 7,
    segments: ["future_innovation"],
  },
  {
    etf: { ticker: "ARKQ", name: "ARK Autonomous Technology and Robotics ETF" },
    weightPct: 5,
    segments: ["future_innovation"],
  },
] as const;

/**
 * Prototype-only holding composition for overlap tagging in HoldingsTab.
 */
export function getMockHoldings(activeThemeIds: readonly ThemeId[]): HoldingRowProps[] {
  const active = new Set(activeThemeIds);
  return MASTER_HOLDINGS.map((row) => {
    const segments = row.segments.filter((segment) => {
      if (segment === "core") return true;
      return active.has(segment);
    });
    return {
      etf: row.etf,
      segments,
      weightPct: row.weightPct,
    };
  }).filter((row) => row.segments.length > 0);
}
