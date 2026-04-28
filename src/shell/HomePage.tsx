import { useState } from "react";
import { BottomSheetShell } from "@/components/ui/BottomSheetShell";
import { Card } from "@/components/ui/Card";
import { MobileDeviceFrame } from "@/components/ui/MobileDeviceFrame";
import { PortfolioAllocationWidget } from "@/components/portfolio/PortfolioAllocationWidget";
import type { PortfolioContextValue } from "@/portfolio";
import { usePortfolio } from "@/portfolio";
import "@/shell/home-page.css";

type ScenariosPanelProps = {
  portfolio: PortfolioContextValue["portfolio"];
  isRefreshing: boolean;
  isRebalanceLocked: boolean;
  lastRebalanceStatusPoll: PortfolioContextValue["lastRebalanceStatusPoll"];
  actionMessage: string | null;
  refreshPortfolio: PortfolioContextValue["refreshPortfolio"];
  pollRebalancingStatus: PortfolioContextValue["pollRebalancingStatus"];
  updateAllocation: PortfolioContextValue["updateAllocation"];
  completeRebalancingDemo: PortfolioContextValue["completeRebalancingDemo"];
  resetDemo: PortfolioContextValue["resetDemo"];
  setActionMessage: (v: string | null) => void;
};

function ScenariosPanel({
  portfolio,
  isRefreshing,
  isRebalanceLocked,
  lastRebalanceStatusPoll,
  actionMessage,
  refreshPortfolio,
  pollRebalancingStatus,
  updateAllocation,
  completeRebalancingDemo,
  resetDemo,
  setActionMessage,
}: ScenariosPanelProps) {
  return (
    <aside className="home-page__scenarios" aria-label="Prototype scenarios">
      <h2 className="home-page__scenarios-title">Scenarios</h2>
      <p className="home-page__hint">
        Use these controls to change mock data. The phone on the right shows the mobile UI at
        390px width (MoneyLion MLDS prototype frame).
      </p>

      {lastRebalanceStatusPoll ? (
        <p className="home-page__meta home-page__meta--spaced">
          Last rebalance status check: {lastRebalanceStatusPoll.status}
          {lastRebalanceStatusPoll.estimatedCompletionDays != null
            ? ` · ~${lastRebalanceStatusPoll.estimatedCompletionDays} business days`
            : null}
        </p>
      ) : null}

      {actionMessage ? (
        <p className="home-page__action-msg" role="status">
          {actionMessage}
        </p>
      ) : null}

      <div className="home-page__actions">
        <button
          type="button"
          className="home-page__btn"
          onClick={() => void refreshPortfolio()}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing…" : "Refresh data"}
        </button>
        <button type="button" className="home-page__btn" onClick={() => void pollRebalancingStatus()}>
          Check rebalance status
        </button>
        <button
          type="button"
          className="home-page__btn home-page__btn--primary"
          disabled={!portfolio || isRebalanceLocked}
          onClick={() => {
            if (!portfolio) return;
            setActionMessage(null);
            void (async () => {
              const r = await updateAllocation({
                themes: portfolio.themes.map((t) => ({
                  themeId: t.themeId,
                  targetPct: t.targetPct,
                })),
              });
              if (r.success) {
                setActionMessage("Save succeeded. Rebalancing is now in progress in the mock.");
              } else {
                setActionMessage(r.message);
              }
            })();
          }}
        >
          Save current mix again
        </button>
        <button
          type="button"
          className="home-page__btn"
          disabled={!portfolio || isRebalanceLocked}
          onClick={() => {
            if (!portfolio) return;
            setActionMessage(null);
            void (async () => {
              const r = await updateAllocation({ themes: [] });
              if (r.success) {
                setActionMessage("Demo: switched to core-only (100%). Rebalancing started.");
              } else {
                setActionMessage(r.message);
              }
            })();
          }}
        >
          Demo: core-only portfolio
        </button>
        {isRebalanceLocked ? (
          <button
            type="button"
            className="home-page__btn home-page__btn--primary"
            onClick={() => {
              setActionMessage(null);
              void (async () => {
                await completeRebalancingDemo();
                setActionMessage("Demo: rebalance cleared. You can edit again.");
              })();
            }}
          >
            Demo: finish rebalance
          </button>
        ) : null}
        <button
          type="button"
          className="home-page__btn"
          onClick={() => {
            setActionMessage(null);
            void (async () => {
              await resetDemo();
              setActionMessage("Demo data reset to the starting portfolio.");
            })();
          }}
        >
          Reset demo data
        </button>
      </div>
    </aside>
  );
}

export function HomePage() {
  const {
    portfolio,
    isLoading,
    isRefreshing,
    loadError,
    isRebalanceLocked,
    lastRebalanceStatusPoll,
    refreshPortfolio,
    updateAllocation,
    completeRebalancingDemo,
    resetDemo,
    pollRebalancingStatus,
  } = usePortfolio();

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const scenariosProps: ScenariosPanelProps = {
    portfolio,
    isRefreshing,
    isRebalanceLocked,
    lastRebalanceStatusPoll,
    actionMessage,
    refreshPortfolio,
    pollRebalancingStatus,
    updateAllocation,
    completeRebalancingDemo,
    resetDemo,
    setActionMessage,
  };

  if (isLoading && !portfolio) {
    return (
      <div className="home-page home-page--proto">
        <ScenariosPanel {...scenariosProps} />
        <div className="home-page__device-col">
          <MobileDeviceFrame>
            <p className="home-page__meta" aria-busy="true">
              Loading your portfolio…
            </p>
          </MobileDeviceFrame>
        </div>
      </div>
    );
  }

  if (loadError && !portfolio) {
    return (
      <div className="home-page home-page--proto">
        <ScenariosPanel {...scenariosProps} />
        <div className="home-page__device-col">
          <MobileDeviceFrame>
            <div className="home-page__alert" role="alert">
              {loadError}
            </div>
            <button type="button" className="home-page__btn" onClick={() => void refreshPortfolio()}>
              Try again
            </button>
          </MobileDeviceFrame>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page home-page--proto">
      <ScenariosPanel {...scenariosProps} />

      <div className="home-page__device-col">
        <MobileDeviceFrame>
          <p className="home-page__device-kicker">Mobile preview · 390px</p>
          {portfolio ? (
            <Card elevated={false} className="home-page__card">
              <PortfolioAllocationWidget />
            </Card>
          ) : null}
          <BottomSheetShell
            open={sheetOpen}
            title="Sample bottom sheet"
            onClose={() => setSheetOpen(false)}
          >
            <p className="home-page__sheet-demo">
              This shell is used for theme details and remove confirmations. Press Escape or tap
              the dimmed area to close.
            </p>
          </BottomSheetShell>
        </MobileDeviceFrame>
      </div>
    </div>
  );
}
