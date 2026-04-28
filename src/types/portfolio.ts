/** Domain and API types — aligned with engineering spec (Managed Investing portfolio allocation). */

export type RiskLevel =
  | "steady_income"
  | "conservative"
  | "moderately_conservative"
  | "moderate"
  | "moderately_aggressive"
  | "aggressive"
  | "equity_only";

export type ThemeId = "earn_and_grow" | "future_innovation" | "greater_good";

export interface CoreAllocation {
  riskLevel: RiskLevel;
  /** 0.00–1.00 */
  riskScore: number;
  /** Integer % — auto-calculated as 100 − sum(themes) */
  targetPct: number;
  stockPct: number;
  bondPct: number;
}

export interface ThemeAllocation {
  themeId: ThemeId;
  displayName: string;
  /** Integer, minimum 5 */
  targetPct: number;
  /** Hex — donut segment */
  color: string;
}

export interface RebalancingState {
  status: "in_progress" | "complete" | "failed";
  initiatedAt: string;
  estimatedCompletionDays: number;
  targetAllocation: {
    corePct: number;
    themes: { themeId: ThemeId; targetPct: number }[];
  };
}

export interface ManagedInvestingPortfolio {
  accountId: string;
  /** Canonical portfolio dollar value */
  totalValue: number;
  coreAllocation: CoreAllocation;
  /** 0–3 items */
  themes: ThemeAllocation[];
  rebalancingState: RebalancingState | null;
}

export interface ThemeCatalogueItem {
  themeId: ThemeId;
  displayName: string;
  description: string;
  etfCount: number;
  eligibleRiskLevels: RiskLevel[];
  color: string;
}

export type AllocationPresetLabel = "light_touch" | "balanced" | "emphasised";

export interface AllocationPreset {
  label: AllocationPresetLabel;
  displayLabel: string;
  /** Total % allocated to all themes combined */
  themesPct: number;
}

/** Donut chart segment — spec §4.2 */
export interface DonutSegment {
  label: string;
  /** Integer 0–100 */
  pct: number;
  color: string;
}

export interface PortfolioDonutProps {
  totalValue: number;
  segments: DonutSegment[];
  isPending?: boolean;
  size?: number;
}

/** POST /v1/managed-investing/portfolio/allocation */
export interface UpdateAllocationRequestBody {
  themes: {
    themeId: ThemeId;
    targetPct: number;
  }[];
}

export interface UpdateAllocationResponseBody {
  portfolio: ManagedInvestingPortfolio;
}

export type AllocationApiErrorCode =
  | "REBALANCE_IN_PROGRESS"
  | "INVALID_ALLOCATION";

export interface AllocationApiErrorBody {
  code: AllocationApiErrorCode;
  message?: string;
}

/** GET /v1/managed-investing/portfolio/rebalancing-status */
export interface RebalancingStatusResponse {
  status: RebalancingState["status"];
  estimatedCompletionDays?: number;
}

/** Holdings tab — spec §4.9 */
export interface ETF {
  ticker: string;
  name: string;
}

/** Props model for `HoldingRow` — spec §4.9 */
export interface HoldingRowProps {
  etf: ETF;
  segments: ("core" | ThemeId)[];
  /** Optional weight for display */
  weightPct?: number;
}
