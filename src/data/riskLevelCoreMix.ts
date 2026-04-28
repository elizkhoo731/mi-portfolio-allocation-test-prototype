/**
 * Default risk score and stock/bond mix by portfolio risk level.
 * Sourced from WEAL: "Understanding Risk Level, Portfolio Theme and Goals in Managed Investing"
 * (internal PDF, Apr 2024). Moderate band uses a balanced 55/45 split where the PDF table
 * omits explicit percentages in the extract we have.
 */

import type { RiskLevel } from "@/types/portfolio";

export const RISK_LEVEL_ORDER: readonly RiskLevel[] = [
  "steady_income",
  "conservative",
  "moderately_conservative",
  "moderate",
  "moderately_aggressive",
  "aggressive",
  "equity_only",
] as const;

export const RISK_LEVEL_CORE_DEFAULTS: Record<
  RiskLevel,
  { riskScore: number; stockPct: number; bondPct: number }
> = {
  steady_income: { riskScore: 0.12, stockPct: 0, bondPct: 100 },
  conservative: { riskScore: 0.2, stockPct: 25, bondPct: 75 },
  moderately_conservative: { riskScore: 0.35, stockPct: 40, bondPct: 60 },
  moderate: { riskScore: 0.53, stockPct: 55, bondPct: 45 },
  moderately_aggressive: { riskScore: 0.7, stockPct: 70, bondPct: 30 },
  aggressive: { riskScore: 0.85, stockPct: 85, bondPct: 15 },
  equity_only: { riskScore: 0.95, stockPct: 98, bondPct: 2 },
};
