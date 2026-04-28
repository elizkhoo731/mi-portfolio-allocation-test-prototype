import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MobileDeviceFrame } from "@/components/ui/MobileDeviceFrame";
import { usePortfolio } from "@/portfolio";
import "@/shell/app-shell.css";

// ── Scenarios panel (always visible) ──────────────────────────────────────
function ScenariosPanel() {
  const {
    portfolio,
    isRefreshing,
    isRebalanceLocked,
    lastRebalanceStatusPoll,
    refreshPortfolio,
    updateAllocation,
    completeRebalancingDemo,
    resetDemo,
    pollRebalancingStatus,
  } = usePortfolio();

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  return (
    <aside className="app-shell__scenarios" aria-label="Prototype scenarios">
      <h2 className="app-shell__scenarios-title">Scenarios</h2>
      <p className="app-shell__scenarios-hint">
        Use these controls to change mock data. The phone shows the mobile UI at 375×812px.
      </p>

      {lastRebalanceStatusPoll ? (
        <p className="app-shell__meta app-shell__meta--spaced">
          Last rebalance: {lastRebalanceStatusPoll.status}
          {lastRebalanceStatusPoll.estimatedCompletionDays != null
            ? ` · ~${lastRebalanceStatusPoll.estimatedCompletionDays} days`
            : null}
        </p>
      ) : null}

      {actionMessage ? (
        <p className="app-shell__action-msg" role="status">{actionMessage}</p>
      ) : null}

      <div className="app-shell__actions">
        <button
          type="button"
          className="app-shell__btn"
          onClick={() => void refreshPortfolio()}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing…" : "Refresh data"}
        </button>

        <button
          type="button"
          className="app-shell__btn"
          onClick={() => void pollRebalancingStatus()}
        >
          Check rebalance status
        </button>

        <button
          type="button"
          className="app-shell__btn app-shell__btn--primary"
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
              setActionMessage(
                r.success
                  ? "Save succeeded — rebalancing started."
                  : r.message
              );
            })();
          }}
        >
          Save current mix again
        </button>

        <button
          type="button"
          className="app-shell__btn"
          disabled={!portfolio || isRebalanceLocked}
          onClick={() => {
            if (!portfolio) return;
            setActionMessage(null);
            void (async () => {
              const r = await updateAllocation({ themes: [] });
              setActionMessage(
                r.success
                  ? "Demo: core-only (100%). Rebalancing started."
                  : r.message
              );
            })();
          }}
        >
          Demo: core-only portfolio
        </button>

        {isRebalanceLocked ? (
          <button
            type="button"
            className="app-shell__btn app-shell__btn--primary"
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
          className="app-shell__btn"
          onClick={() => {
            setActionMessage(null);
            void (async () => {
              await resetDemo();
              setActionMessage("Demo data reset to starting portfolio.");
            })();
          }}
        >
          Reset demo data
        </button>
      </div>
    </aside>
  );
}

// ── App shell ──────────────────────────────────────────────────────────────
export function AppShell() {
  const { pathname } = useLocation();

  // Kicker label changes per route
  const routeLabel: Record<string, string> = {
    "/managed-investing": "Dashboard",
    "/allocation-editor": "Edit allocation",
    "/allocation-confirm": "Confirm allocation",
    "/add-theme": "Add a theme",
    "/add-theme/pick": "Pick allocation",
    "/holdings": "Holdings",
  };
  const currentLabel = routeLabel[pathname] ?? "View";

  return (
    <div className="app-shell">
      {/* ── Brand header ── */}
      <header className="app-shell__header">
        <span className="app-shell__logo">MoneyLion</span>
        <span className="app-shell__header-subtitle">Managed Investing Prototype</span>
      </header>

      {/* ── Two-column body: scenarios always visible ── */}
      <div className="app-shell__body">
        <ScenariosPanel />

        <div className="app-shell__device-col">
          <p className="app-shell__device-kicker">
            {currentLabel} · 375 × 812px
          </p>
          <MobileDeviceFrame>
            <Outlet />
          </MobileDeviceFrame>
        </div>
      </div>
    </div>
  );
}
