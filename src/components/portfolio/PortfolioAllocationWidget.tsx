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
 * Hides Manage and Add theme while rebalancing; shows target allocation as pending on the donut.
 */
export function PortfolioAllocationWidget() {
  const { portfolio, isRebalanceLocked } = usePortfolio();

  if (!portfolio) {
    return null;
  }

  const locked = isRebalanceLocked;
  const rebalance = portfolio.rebalancingState;
  const segments = getPortfolioDonutSegments(portfolio);
  const legend = getSegmentLegendData(portfolio);
  const pending = locked;
  const themeCount = portfolio.themes.length;
  const showAddTheme = themeCount < 3 && !locked;

  return (
    <section className="portfolio-widget" aria-labelledby="portfolio-widget-heading">
      <div className="portfolio-widget__header">
        <div>
          <h2 id="portfolio-widget-heading" className="portfolio-widget__title">
            My portfolio
          </h2>
          <p className="portfolio-widget__explainer">{CORE_PORTFOLIO_WIDGET_EXPLAINER}</p>
        </div>
        {!locked ? (
          <Link
            to={MANAGE_PATH}
            className="portfolio-widget__manage"
            onClick={() => track("manage_allocation_tapped")}
          >
            Manage
          </Link>
        ) : null}
      </div>

      <div className="portfolio-widget__row">
        <PortfolioDonut
          totalValue={portfolio.totalValue}
          segments={segments}
          isPending={pending}
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
