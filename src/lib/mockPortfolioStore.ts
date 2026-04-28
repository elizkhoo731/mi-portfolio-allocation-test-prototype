/**
 * In-memory mock for Managed Investing portfolio APIs (spec §5).
 * Mirrors GET portfolio, POST allocation, and GET rebalancing-status contracts.
 *
 * No UI in this module (MLDS does not apply). Investing aligns with Grow pillar
 * per `docs/company-context.md`.
 */

import { THEME_CATALOGUE } from "@/constants/themeCatalogue";
import { RISK_LEVEL_CORE_DEFAULTS } from "@/data/riskLevelCoreMix";
import {
  computeCorePct,
  isThemeEligibleForRiskLevel,
  validateThemeAllocations,
} from "@/lib/allocation";
import type {
  AllocationApiErrorBody,
  ManagedInvestingPortfolio,
  RebalancingStatusResponse,
  RiskLevel,
  ThemeAllocation,
  ThemeId,
  UpdateAllocationRequestBody,
  UpdateAllocationResponseBody,
} from "@/types/portfolio";

/** Spec-aligned paths for wiring a real `fetch` later. */
export const MANAGED_INVESTING_API_PATHS = {
  portfolio: "/v1/managed-investing/portfolio",
  allocation: "/v1/managed-investing/portfolio/allocation",
  rebalancingStatus: "/v1/managed-investing/portfolio/rebalancing-status",
} as const;

export type PostAllocationResult =
  | { ok: true; data: UpdateAllocationResponseBody }
  | { ok: false; status: 400; body: AllocationApiErrorBody }
  | { ok: false; status: 500; body: { message: string } };

function catalogueItem(themeId: ThemeId) {
  return THEME_CATALOGUE.find((t) => t.themeId === themeId);
}

function clonePortfolio(p: ManagedInvestingPortfolio): ManagedInvestingPortfolio {
  return structuredClone(p);
}

function createInitialPortfolio(): ManagedInvestingPortfolio {
  return {
    accountId: "demo-account",
    totalValue: 152.46,
    coreAllocation: {
      riskLevel: "moderately_aggressive",
      riskScore: 0.7,
      targetPct: 80,
      stockPct: 70,
      bondPct: 30,
    },
    themes: [
      {
        themeId: "earn_and_grow",
        displayName: "Earn and Grow",
        targetPct: 10,
        color: catalogueItem("earn_and_grow")!.color,
      },
      {
        themeId: "greater_good",
        displayName: "Greater Good",
        targetPct: 10,
        color: catalogueItem("greater_good")!.color,
      },
    ],
    rebalancingState: null,
  };
}

let portfolio: ManagedInvestingPortfolio = createInitialPortfolio();

/** Optional artificial latency so async flows feel realistic in the UI later. */
let networkDelayMs = 0;

export function mockSetNetworkDelayMs(ms: number) {
  networkDelayMs = ms;
}

async function delay() {
  if (networkDelayMs > 0) {
    await new Promise((r) => setTimeout(r, networkDelayMs));
  }
}

/** GET /v1/managed-investing/portfolio */
export async function mockGetPortfolio(): Promise<ManagedInvestingPortfolio> {
  await delay();
  return clonePortfolio(portfolio);
}

/** GET /v1/managed-investing/portfolio/rebalancing-status */
export async function mockGetRebalancingStatus(): Promise<RebalancingStatusResponse> {
  await delay();
  const rb = portfolio.rebalancingState;
  if (!rb) {
    return { status: "complete" };
  }
  return {
    status: rb.status,
    estimatedCompletionDays: rb.estimatedCompletionDays,
  };
}

let simulateServerError = false;

/** When true, the next POST allocation returns HTTP 500 (then resets). */
export function mockSetSimulateServerErrorOnce(value: boolean) {
  simulateServerError = value;
}

/**
 * POST /v1/managed-investing/portfolio/allocation
 * On success: updates portfolio allocation and sets `rebalancingState` to in progress.
 */
export async function mockPostAllocation(
  body: UpdateAllocationRequestBody
): Promise<PostAllocationResult> {
  await delay();

  if (simulateServerError) {
    simulateServerError = false;
    return {
      ok: false,
      status: 500,
      body: { message: "Something went wrong. Please try again." },
    };
  }

  if (portfolio.rebalancingState?.status === "in_progress") {
    return {
      ok: false,
      status: 400,
      body: {
        code: "REBALANCE_IN_PROGRESS",
        message:
          "A rebalance is already in progress. Please wait until it completes.",
      },
    };
  }

  const assignments = body.themes.map((t) => ({
    themeId: t.themeId,
    targetPct: t.targetPct,
  }));

  for (const row of body.themes) {
    if (!catalogueItem(row.themeId)) {
      return {
        ok: false,
        status: 400,
        body: {
          code: "INVALID_ALLOCATION",
          message: "Invalid allocation. Please check your percentages and try again.",
        },
      };
    }
    if (!isThemeEligibleForRiskLevel(row.themeId, portfolio.coreAllocation.riskLevel)) {
      return {
        ok: false,
        status: 400,
        body: {
          code: "INVALID_ALLOCATION",
          message: "Invalid allocation. Please check your percentages and try again.",
        },
      };
    }
  }

  const validation = validateThemeAllocations(assignments, {
    enforceFivePctStep: false,
  });
  if (!validation.valid) {
    return {
      ok: false,
      status: 400,
      body: {
        code: "INVALID_ALLOCATION",
        message: "Invalid allocation. Please check your percentages and try again.",
      },
    };
  }

  const nextThemes: ThemeAllocation[] = body.themes.map((t) => {
    const cat = catalogueItem(t.themeId)!;
    return {
      themeId: t.themeId,
      displayName: cat.displayName,
      targetPct: t.targetPct,
      color: cat.color,
    };
  });

  const corePct = computeCorePct(nextThemes.map((t) => t.targetPct));

  portfolio = {
    ...portfolio,
    themes: nextThemes,
    coreAllocation: {
      ...portfolio.coreAllocation,
      targetPct: corePct,
    },
    rebalancingState: {
      status: "in_progress",
      initiatedAt: new Date().toISOString(),
      estimatedCompletionDays: 3,
      targetAllocation: {
        corePct,
        themes: body.themes.map((t) => ({
          themeId: t.themeId,
          targetPct: t.targetPct,
        })),
      },
    },
  };

  return {
    ok: true,
    data: { portfolio: clonePortfolio(portfolio) },
  };
}

/**
 * Clears an in-flight rebalance (demo substitute for poll returning complete).
 * Spec: refresh portfolio and clear banner; here allocation already matches target.
 */
export async function mockCompleteRebalancingForDemo(): Promise<ManagedInvestingPortfolio> {
  await delay();
  if (portfolio.rebalancingState?.status === "in_progress") {
    portfolio = {
      ...portfolio,
      rebalancingState: null,
    };
  }
  return clonePortfolio(portfolio);
}

/** Reset store to the seeded demo portfolio (handy after playing with the mock). */
export async function mockResetPortfolio(): Promise<ManagedInvestingPortfolio> {
  await delay();
  portfolio = createInitialPortfolio();
  return clonePortfolio(portfolio);
}

export type SetCoreRiskLevelResult =
  | { ok: true; portfolio: ManagedInvestingPortfolio }
  | { ok: false; message: string };

/**
 * Prototype-only: change mandatory core risk level (stock/bond mix per WEAL PDF).
 * Does not hit a separate API path in the engineering spec.
 */
export async function mockSetCoreRiskLevel(
  level: RiskLevel
): Promise<SetCoreRiskLevelResult> {
  await delay();
  if (portfolio.rebalancingState?.status === "in_progress") {
    return {
      ok: false,
      message:
        "A rebalance is in progress. Wait until it finishes before changing risk level.",
    };
  }
  const d = RISK_LEVEL_CORE_DEFAULTS[level];
  portfolio = {
    ...portfolio,
    coreAllocation: {
      ...portfolio.coreAllocation,
      riskLevel: level,
      riskScore: d.riskScore,
      stockPct: d.stockPct,
      bondPct: d.bondPct,
    },
  };
  return { ok: true, portfolio: clonePortfolio(portfolio) };
}
