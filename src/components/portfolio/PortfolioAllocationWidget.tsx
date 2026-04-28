import { Link } from "react-router-dom";
import { AddThemeButton } from "@/components/portfolio/AddThemeButton";
import { PortfolioDonut } from "@/components/portfolio/PortfolioDonut";
import { RebalancingBanner } from "@/components/portfolio/RebalancingBanner";
import { SegmentLegend } from "@/components/portfolio/SegmentLegend";
import { CORE_PORTFOLIO_WIDGET_EXPLAINER } from "@/copy/wealManagedInvesting";
import {
  getPortfolioDonutSegments,
  getSegmentLegendData,
} from "@/lib/portfolioDisplay";
import { track } from "@/lib/analytics";
import { usePortfolio } from "@/portfolio";
import "@/components/portfolio/portfolio-allocation-widget.css";

const MANAGE_PATH = "/allocation-editor";
const ADD_THEME_PATH = "/add-theme";
const HOLDINGS_PATH = "/holdings";

/**
 * Unified Managed Investing portfolio block (spec §4.1).
 * Header uses the same card-header / pill-btn pattern as other dashboard sections.
 */
export function PortfolioAllocationWidget() {
  const { portfolio, isRebalanceLocked } = usePortfolio();

  if (!portfolio) return null;

  const locked = isRebalanceLocked;
  const rebalance = portfolio.rebalancingState;
  const segments = getPortfolioDonutSegments(portfolio);
  const legend = getSegmentLegendData(portfolio);
  const themeCount = portfolio.themes.length;
  const showAddTheme = themeCount < 3 && !locked;

  return (
    <section className="portfolio-widget" aria-labelledby="portfolio-widget-heading">

      {/* Header row — same pattern as Recent Transactions / Watchlist / News */}
      <div className="mi-dash__card-header" style={{ padding: 0, marginBottom: "var(--space-8)" }}>
        <h2 id="portfolio-widget-heading" className="mi-dash__card-title" style={{ fontSize: "1.125rem" }}>
          My Portfolio
        </h2>
        {!locked ? (
          <Link
            to={MANAGE_PATH}
            className="mi-dash__pill-btn"
            onClick={() => track("manage_allocation_tapped")}
          >
            Manage
          </Link>
        ) : null}
      </div>

      <p className="portfolio-widget__explainer">{CORE_PORTFOLIO_WIDGET_EXPLAINER}</p>

      <div className="portfolio-widget__row">
        <PortfolioDonut
          totalValue={portfolio.totalValue}
          segments={segments}
          isPending={locked}
          size={120}
        />
        <div className="portfolio-widget__copy">
          <SegmentLegend
            coreAllocation={legend.coreAllocation}
            themes={legend.themes}
          />
        </div>
      </div>

      <Link
        to={HOLDINGS_PATH}
        className="portfolio-widget__holdings-link"
        onClick={() => track("view_holdings_tapped")}
      >
        View holdings and overlap
      </Link>

      {showAddTheme ? (
        <AddThemeButton activeThemeCount={themeCount} to={ADD_THEME_PATH} />
      ) : null}

      {locked && rebalance ? (
        <RebalancingBanner
          estimatedDays={rebalance.estimatedCompletionDays}
          status={rebalance.status === "failed" ? "failed" : "in_progress"}
        />
      ) : null}
    </section>
  );
}
