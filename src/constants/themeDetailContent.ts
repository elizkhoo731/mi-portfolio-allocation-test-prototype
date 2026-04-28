import type { ThemeId } from "@/types/portfolio";

/** Single line in the illustrative holdings list shown in theme Details. */
export type ThemeHoldingLine = {
  name: string;
  ticker: string;
  /** Weight as % of theme sleeve (illustrative). */
  weightPct: number;
};

export type ThemeDetailSheetContent = {
  overview: string;
  holdingsLabel: string;
  holdings: readonly ThemeHoldingLine[];
};

/**
 * Overview + representative holdings for the Details bottom sheet (prototype illustrative data).
 */
export const THEME_DETAIL_SHEET: Record<ThemeId, ThemeDetailSheetContent> = {
  earn_and_grow: {
    overview:
      "Stocks that give you cash! Pursue more income and growth by investing in this set of equity ETFs designed to pay off today and tomorrow.",
    holdingsLabel: "Stocks and ETFs",
    holdings: [
      { name: "iShares Core Dividend Growth ETF", ticker: "DGRO", weightPct: 13 },
      { name: "High Dividend Yield ETF Vanguard", ticker: "VYM", weightPct: 13 },
      { name: "Global X S&P 500 Covered Call ETF", ticker: "XYLD", weightPct: 12 },
      { name: "Global X NASDAQ 100 Covered Call ETF", ticker: "QYLD", weightPct: 9 },
      { name: "Fidelity MSCI Information Tech ETF", ticker: "FTEC", weightPct: 8 },
      { name: "Global X US Preferred", ticker: "PFFD", weightPct: 7 },
    ],
  },
  future_innovation: {
    overview:
      "Tap into companies driving the next wave of progress. This sleeve focuses on innovators in areas like cloud, semiconductors, software, and emerging tech through a diversified set of equity ETFs.",
    holdingsLabel: "Stocks and ETFs",
    holdings: [
      { name: "Invesco QQQ Trust Series 1", ticker: "QQQ", weightPct: 18 },
      { name: "Global X Robotics & Artificial Intelligence ETF", ticker: "BOTZ", weightPct: 14 },
      { name: "VanEck Semiconductor ETF", ticker: "SMH", weightPct: 13 },
      { name: "Global X Cloud Computing ETF", ticker: "CLOU", weightPct: 11 },
      { name: "First Trust Nasdaq Cybersecurity ETF", ticker: "CIBR", weightPct: 10 },
      { name: "ARK Next Generation Internet ETF", ticker: "ARKW", weightPct: 9 },
      { name: "Global X Autonomous & Electric Vehicles ETF", ticker: "DRIV", weightPct: 8 },
    ],
  },
  greater_good: {
    overview:
      "Align your investments with what matters to you. This sleeve emphasizes companies screened for environmental, social, and governance leadership while staying broadly diversified across sectors.",
    holdingsLabel: "Stocks and ETFs",
    holdings: [
      { name: "iShares ESG Aware MSCI USA ETF", ticker: "ESGU", weightPct: 22 },
      { name: "Vanguard ESG U.S. Stock ETF", ticker: "ESGV", weightPct: 18 },
      { name: "SPDR S&P 500 ESG ETF", ticker: "EFIV", weightPct: 15 },
      { name: "iShares MSCI USA ESG Select ETF", ticker: "SUSA", weightPct: 14 },
      { name: "Nuveen ESG Large-Cap Growth ETF", ticker: "NULG", weightPct: 11 },
      { name: "Xtrackers MSCI USA ESG Leaders Equity ETF", ticker: "USSG", weightPct: 10 },
    ],
  },
};
