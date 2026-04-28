import type { RiskLevel } from "@/types/portfolio";

/** User-facing risk names (engineering spec, sentence case). */
export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  steady_income: "Steady income",
  conservative: "Conservative",
  moderately_conservative: "Moderately conservative",
  moderate: "Moderate",
  moderately_aggressive: "Moderately aggressive",
  aggressive: "Aggressive",
  equity_only: "Equity only",
};

export function riskLevelDisplayName(level: RiskLevel): string {
  return RISK_LEVEL_LABELS[level];
}
