import { useEffect, useId, useState } from "react";
import { BottomSheetShell } from "@/components/ui/BottomSheetShell";
import { THEME_DETAIL_SHEET } from "@/constants/themeDetailContent";
import type { ThemeCatalogueItem } from "@/types/portfolio";
import "@/components/add-theme/theme-detail-drawer.css";

export type ThemeDetailDrawerProps = {
  theme: ThemeCatalogueItem | null;
  open: boolean;
  onClose: () => void;
};

type DetailTab = "overview" | "holdings";

function formatWeight(pct: number): string {
  return `${pct.toFixed(2)}%`;
}

/**
 * Theme details: Overview summary and illustrative holdings (tabs).
 */
export function ThemeDetailDrawer({ theme, open, onClose }: ThemeDetailDrawerProps) {
  const baseId = useId();
  const [tab, setTab] = useState<DetailTab>("overview");

  useEffect(() => {
    if (theme) setTab("overview");
  }, [theme]);

  if (!theme) return null;

  const detail = THEME_DETAIL_SHEET[theme.themeId];
  const tabOverviewId = `${baseId}-tab-overview`;
  const tabHoldingsId = `${baseId}-tab-holdings`;
  const panelOverviewId = `${baseId}-panel-overview`;
  const panelHoldingsId = `${baseId}-panel-holdings`;

  return (
    <BottomSheetShell open={open} title={theme.displayName} onClose={onClose}>
      <div className="theme-detail-drawer__tabs-wrap">
        <div
          className="theme-detail-drawer__tabs"
          role="tablist"
          aria-label="Theme details sections"
        >
          <button
            type="button"
            role="tab"
            id={tabOverviewId}
            className={`theme-detail-drawer__tab${tab === "overview" ? " theme-detail-drawer__tab--active" : ""}`}
            aria-selected={tab === "overview"}
            aria-controls={panelOverviewId}
            onClick={() => setTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            role="tab"
            id={tabHoldingsId}
            className={`theme-detail-drawer__tab${tab === "holdings" ? " theme-detail-drawer__tab--active" : ""}`}
            aria-selected={tab === "holdings"}
            aria-controls={panelHoldingsId}
            onClick={() => setTab("holdings")}
          >
            Holdings
          </button>
        </div>
      </div>

      {/*
        Both panels occupy the same grid cell so row height is the max of both (MLDS sheet does not
        jump when switching tabs). Hidden panel uses visibility only so it still contributes to layout.
      */}
      <div className="theme-detail-drawer__panel-stack">
        <div
          id={panelOverviewId}
          role="tabpanel"
          aria-labelledby={tabOverviewId}
          aria-hidden={tab !== "overview"}
          className={`theme-detail-drawer__panel theme-detail-drawer__panel--overview${tab !== "overview" ? " theme-detail-drawer__panel--concealed" : ""}`}
        >
          <p className="theme-detail-drawer__overview">{detail.overview}</p>
          <p className="theme-detail-drawer__footnote">
            Illustrative sleeve composition. Actual weights change with fund updates and rebalances.
          </p>
        </div>

        <div
          id={panelHoldingsId}
          role="tabpanel"
          aria-labelledby={tabHoldingsId}
          aria-hidden={tab !== "holdings"}
          className={`theme-detail-drawer__panel theme-detail-drawer__panel--holdings${tab !== "holdings" ? " theme-detail-drawer__panel--concealed" : ""}`}
        >
          <h3 className="theme-detail-drawer__holdings-heading">{detail.holdingsLabel}</h3>
          <ul className="theme-detail-drawer__holdings-list">
            {detail.holdings.map((line) => (
              <li key={line.ticker} className="theme-detail-drawer__holding-row">
                <span className="theme-detail-drawer__holding-name">
                  {line.name} ({line.ticker})
                </span>
                <span className="theme-detail-drawer__holding-pct">{formatWeight(line.weightPct)}</span>
              </li>
            ))}
          </ul>
          <p className="theme-detail-drawer__footnote">
            Percentages show representative weights within this theme sleeve (prototype data).
          </p>
        </div>
      </div>

      <div className="theme-detail-drawer__actions">
        <button
          type="button"
          className="theme-detail-drawer__btn theme-detail-drawer__btn--primary"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </BottomSheetShell>
  );
}
