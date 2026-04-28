import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { PortfolioAllocationWidget } from "@/components/portfolio/PortfolioAllocationWidget";
import { usePortfolio } from "@/portfolio";
import "@/shell/managed-investing-dashboard.css";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

type RangeKey = "1D" | "1W" | "1M" | "1Y" | "All";
type HeroTab = "activity" | "allocations";

/** Decorative area chart — prototype-only. */
function PerformanceSpark({ range }: { range: RangeKey }) {
  const paths: Record<RangeKey, string> = {
    "1D": "M0 88 L40 82 L90 96 L140 58 L190 68 L240 42 L290 52 L343 38",
    "1W": "M0 96 L60 80 L120 72 L180 64 L240 50 L300 44 L343 36",
    "1M": "M0 100 L80 88 L150 76 L220 60 L290 46 L343 38",
    "1Y": "M0 110 L100 90 L200 70 L280 52 L343 34",
    "All": "M0 108 L70 96 L140 80 L210 62 L280 48 L343 32",
  };
  const d = paths[range];
  return (
    <svg
      className="mi-dash__spark"
      viewBox="0 0 343 120"
      aria-hidden
      focusable="false"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="mi-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--teal-primary)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--teal-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1="72" x2="343" y2="72" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="4 6" />
      <path fill="url(#mi-spark-fill)" d={`${d} L343 120 L0 120 Z`} />
      <path fill="none" stroke="var(--teal-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

/** Pill button matching MLDS secondary chip style (#eee bg). */
function PillBtn({ children, onClick }: { children: string; onClick?: () => void }) {
  return (
    <button type="button" className="mi-dash__pill-btn" onClick={onClick}>
      {children}
    </button>
  );
}

/** Teal circle icon matching Figma Circle+Icon 3.0. */
function TxIcon({ positive }: { positive: boolean }) {
  return (
    <div className="mi-dash__tx-circle" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        {positive ? (
          /* Arrow up — deposit/income */
          <path d="M10 14V6M10 6L6.5 9.5M10 6l3.5 3.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          /* Arrow down — withdrawal */
          <path d="M10 6v8M10 14l-3.5-3.5M10 14l3.5-3.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </div>
  );
}

const TRANSACTIONS = [
  { id: 1, label: "Dividend", sub: "Feb 19 · RoarMoney · 1234", amount: "+$1.00", positive: true },
  { id: 2, label: "Managed Investing Auto-Invest", sub: "Feb 19 · RoarMoney · 1234", amount: "+$1.00", positive: true },
  { id: 3, label: "Interest", sub: "Feb 19 · RoarMoney · 1234", amount: "+$1.00", positive: true },
  { id: 4, label: "Withdrawal", sub: "Feb 19 · RoarMoney · 1234", amount: "-$1.00", positive: false },
  { id: 5, label: "Deposit", sub: "Feb 19 · RoarMoney · 1234", amount: "+$1.00", positive: true },
];

const NEWS = [
  { id: 1, source: "CNBC", time: "10 hours ago", sentiment: "Positive", headline: "S&P 500 rises to start week, Nasdaq gains 1.9% on tech comeback" },
  { id: 2, source: "Reuters", time: "12 hours ago", sentiment: "Positive", headline: "Peloton bets big on body tracking" },
  { id: 3, source: "Walmart", time: "12 hours ago", sentiment: "Positive", headline: "Walmart Marketplace Offers New-Seller Savings" },
];

export function ManagedInvestingDashboard() {
  const navigate = useNavigate();
  const { portfolio } = usePortfolio();
  const [heroTab, setHeroTab] = useState<HeroTab>("activity");
  const [range, setRange] = useState<RangeKey>("1D");

  const balance = portfolio?.totalValue ?? 0;
  const accountLabel = useMemo(() => {
    const id = portfolio?.accountId ?? "";
    const last4 = id.replace(/\D/g, "").slice(-4);
    return last4.length >= 4 ? last4 : "1234";
  }, [portfolio?.accountId]);

  if (!portfolio) return null;

  const ranges: RangeKey[] = ["1D", "1W", "1M", "1Y", "All"];

  return (
    <div className="mi-dash">
      {/* ── Top bar ── */}
      <header className="mi-dash__topbar">
        <button type="button" className="mi-dash__icon-btn" aria-label="Back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden fill="currentColor">
            <path d="M15.5 19.5 8 12l7.5-7.5 1.4 1.4L10.8 12l6.1 6.1-1.4 1.4Z" />
          </svg>
        </button>
        <button type="button" className="mi-dash__icon-btn" aria-label="More options">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden fill="currentColor">
            <circle cx="12" cy="5" r="1.75" />
            <circle cx="12" cy="12" r="1.75" />
            <circle cx="12" cy="19" r="1.75" />
          </svg>
        </button>
      </header>

      {/* ── Page title ── */}
      <div className="mi-dash__title-block">
        <h1 className="mi-dash__screen-title">Managed Investing</h1>
        <p className="mi-dash__account-sub">Account · {accountLabel}</p>
      </div>

      {/* ── Summary card ── */}
      <Card elevated className="mi-dash__summary-card">
        <div className="mi-dash__summary-header">
          <p className="mi-dash__balance">{fmt(balance)}</p>
          <p className="mi-dash__delta">
            <span className="mi-dash__delta-arrow" aria-hidden>↑</span>
            {" $0.95 (4.82%) past day"}
          </p>
        </div>

        {/* Tabs 3.0 */}
        <div className="mi-dash__tabs" role="tablist" aria-label="Portfolio view">
          {(["activity", "allocations"] as HeroTab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={heroTab === t}
              className={heroTab === t ? "mi-dash__tab mi-dash__tab--active" : "mi-dash__tab"}
              onClick={() => setHeroTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {heroTab === "activity" ? (
          <>
            <PerformanceSpark range={range} />
            <div className="mi-dash__ranges" role="group" aria-label="Time range">
              {ranges.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={range === r ? "mi-dash__range mi-dash__range--active" : "mi-dash__range"}
                  onClick={() => setRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="mi-dash__alloc-hint">
            Full allocation detail in{" "}
            <Link to="/allocation-editor" className="mi-dash__link">Edit allocation</Link>.
          </p>
        )}

        <div className="mi-dash__hero-ctas">
          <button type="button" className="mi-dash__btn-primary">Add money</button>
          <button type="button" className="mi-dash__btn-secondary">Withdraw</button>
        </div>
      </Card>

      {/* ── MoneyLion AI ── */}
      <Card elevated className="mi-dash__ai-card">
        <div className="mi-dash__ai-head">
          <span className="mi-dash__ai-icon" aria-hidden>✦</span>
          <span className="mi-dash__ai-brand">MoneyLion AI</span>
          <span className="mi-dash__ai-badge">BETA</span>
        </div>
        <p className="mi-dash__ai-body">
          Why These Market Insights Matter for Your Investments: 1. Nvidia's Earnings signal: The
          tech sector, particularly AI-related stocks, showing promising ou…{" "}
          <span className="mi-dash__ai-more">See more</span>
        </p>
      </Card>

      {/* ── My Portfolio card (wraps the widget) ── */}
      <Card elevated className="mi-dash__portfolio-card">
        <PortfolioAllocationWidget />
      </Card>

      {/* ── Feature grid — two separate white cards ── */}
      <div className="mi-dash__feature-grid">
        <Card elevated className="mi-dash__feature">
          <div className="mi-dash__feature-top">
            <p className="mi-dash__feature-title">Round Ups</p>
            <span className="mi-dash__feature-icon" aria-hidden>↺</span>
          </div>
          <p className="mi-dash__feature-desc">Track and manage your Round Ups</p>
          <span className="mi-dash__feature-badge">ENABLED</span>
        </Card>
        <Card elevated className="mi-dash__feature">
          <div className="mi-dash__feature-top">
            <p className="mi-dash__feature-title">Auto Invest</p>
            <span className="mi-dash__feature-icon" aria-hidden>↗</span>
          </div>
          <p className="mi-dash__feature-desc">Next deposit on May 24 · Every 2 weeks</p>
          <span className="mi-dash__feature-badge">ENABLED</span>
        </Card>
      </div>

      {/* ── Recent transactions card (header inside card) ── */}
      <Card elevated className="mi-dash__list-card">
        <div className="mi-dash__card-header">
          <h2 className="mi-dash__card-title">Recent transactions</h2>
          <PillBtn>See all</PillBtn>
        </div>
        {TRANSACTIONS.map((tx, i) => (
          <div key={tx.id} className={i < TRANSACTIONS.length - 1 ? "mi-dash__tx-row mi-dash__tx-row--bordered" : "mi-dash__tx-row"}>
            <TxIcon positive={tx.positive} />
            <div className="mi-dash__tx-body">
              <p className="mi-dash__tx-label">{tx.label}</p>
              <p className="mi-dash__tx-sub">{tx.sub}</p>
            </div>
            <span className={tx.positive ? "mi-dash__tx-amt mi-dash__tx-amt--pos" : "mi-dash__tx-amt mi-dash__tx-amt--neg"}>
              {tx.amount}
            </span>
          </div>
        ))}
      </Card>

      {/* ── Watchlist card (header inside card) ── */}
      <Card elevated className="mi-dash__list-card">
        <div className="mi-dash__card-header">
          <h2 className="mi-dash__card-title">Watchlist</h2>
          <PillBtn>View all</PillBtn>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className={i < 3 ? "mi-dash__watch-row mi-dash__watch-row--bordered" : "mi-dash__watch-row"}>
            <div className="mi-dash__watch-logo" aria-hidden>V</div>
            <div className="mi-dash__watch-body">
              <p className="mi-dash__watch-name">Vanguard S&P 500 ETF</p>
            </div>
            <div className="mi-dash__watch-right">
              <svg className="mi-dash__watch-spark" viewBox="0 0 60 20" aria-hidden>
                <polyline points="0,16 10,12 20,14 30,8 40,10 50,5 60,4" fill="none" stroke="var(--color-positive-text)" strokeWidth="1.5" />
              </svg>
              <p className="mi-dash__watch-price">$50,000.00</p>
            </div>
          </div>
        ))}
      </Card>

      {/* ── News card (header inside card) ── */}
      <Card elevated className="mi-dash__list-card mi-dash__list-card--last">
        <div className="mi-dash__card-header">
          <h2 className="mi-dash__card-title">News</h2>
          <PillBtn>See all</PillBtn>
        </div>
        {NEWS.map((n, i) => (
          <div key={n.id} className={i < NEWS.length - 1 ? "mi-dash__news-row mi-dash__news-row--bordered" : "mi-dash__news-row"}>
            <div className="mi-dash__news-meta">
              <span className="mi-dash__news-source">{n.source}</span>
              <span className="mi-dash__news-dot" aria-hidden>·</span>
              <span className="mi-dash__news-time">{n.time}</span>
              <span className="mi-dash__news-sentiment-badge">{n.sentiment}</span>
            </div>
            <p className="mi-dash__news-headline">{n.headline}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
