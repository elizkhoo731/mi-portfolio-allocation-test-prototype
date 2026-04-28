/**
 * Builds donut/legend display from portfolio + rebalance rules (spec §4.1).
 * Core segment color matches product spec (#1D9E75).
 */

import { THEME_CATALOGUE } from "@/constants/themeCatalogue";
import type {
  CoreAllocation,
  DonutSegment,
  ManagedInvestingPortfolio,
  ThemeAllocation,
  ThemeId,
} from "@/types/portfolio";

const CORE_DONUT_COLOR = "#1D9E75";

function themeMeta(themeId: ThemeId) {
  return THEME_CATALOGUE.find((t) => t.themeId === themeId);
}

/**
 * Segments for `PortfolioDonut` / aria labels. When rebalancing is in progress,
 * uses `targetAllocation` so the chart matches the pending target.
 */
export function getPortfolioDonutSegments(
  portfolio: ManagedInvestingPortfolio
): DonutSegment[] {
  const rb = portfolio.rebalancingState;
  const pending = rb?.status === "in_progress";

  if (pending && rb) {
    const { corePct, themes } = rb.targetAllocation;
    const out: DonutSegment[] = [
      { label: "Core", pct: corePct, color: CORE_DONUT_COLOR },
    ];
    for (const row of themes) {
      const cat = themeMeta(row.themeId);
      out.push({
        label: cat?.displayName ?? row.themeId,
        pct: row.targetPct,
        color: cat?.color ?? "#888888",
      });
    }
    return out;
  }

  if (portfolio.themes.length === 0) {
    return [{ label: "Core", pct: 100, color: CORE_DONUT_COLOR }];
  }

  const out: DonutSegment[] = [
    {
      label: "Core",
      pct: portfolio.coreAllocation.targetPct,
      color: CORE_DONUT_COLOR,
    },
  ];
  for (const th of portfolio.themes) {
    out.push({
      label: th.displayName,
      pct: th.targetPct,
      color: th.color,
    });
  }
  return out;
}

/** Core + themes for `SegmentLegend`, using target weights while rebalancing. */
export function getSegmentLegendData(portfolio: ManagedInvestingPortfolio): {
  coreAllocation: CoreAllocation;
  themes: ThemeAllocation[];
} {
  const rb = portfolio.rebalancingState;
  const pending = rb?.status === "in_progress";

  if (pending && rb) {
    const { corePct, themes: tThemes } = rb.targetAllocation;
    const themes: ThemeAllocation[] = tThemes.map((row) => {
      const cat = themeMeta(row.themeId);
      return {
        themeId: row.themeId,
        displayName: cat?.displayName ?? row.themeId,
        targetPct: row.targetPct,
        color: cat?.color ?? "#888888",
      };
    });
    return {
      coreAllocation: { ...portfolio.coreAllocation, targetPct: corePct },
      themes,
    };
  }

  return {
    coreAllocation: portfolio.coreAllocation,
    themes: portfolio.themes,
  };
}
