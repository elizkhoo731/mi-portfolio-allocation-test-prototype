import type { DonutSegment } from "@/types/portfolio";
import "@/components/portfolio/portfolio-donut.css";

export type PortfolioDonutComponentProps = {
  totalValue: number;
  segments: DonutSegment[];
  isPending?: boolean;
  size?: number;
  /**
   * `center` (default): total inside the ring. `beside`: ring only, total to the right
   * (avoids overlap in small preset cards).
   */
  labelPlacement?: "center" | "beside";
  /** Ring only (no Total / dollar label). Useful when value is duplicated elsewhere (e.g. presets). */
  hideTotal?: boolean;
};

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/** Boost tiny slices for arc legibility; labels still use true `segments[].pct` (spec §4.2). */
function normalizeVisualPercents(pcts: readonly number[]): number[] {
  if (pcts.length === 0) return [];
  const boosted = pcts.map((p) => (p > 0 && p < 5 ? 5 : p));
  const sum = boosted.reduce((a, b) => a + b, 0);
  if (sum === 0) return pcts.map(() => 0);
  return boosted.map((b) => (b / sum) * 100);
}

function buildAriaLabel(segments: readonly DonutSegment[]): string {
  const parts = segments.map((s) => `${s.label} ${s.pct}%`);
  return `Portfolio composition: ${parts.join(", ")}`;
}

export function PortfolioDonut({
  totalValue,
  segments,
  isPending,
  size = 120,
  labelPlacement = "center",
  hideTotal = false,
}: PortfolioDonutComponentProps) {
  const stroke = 12;
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.max((size - stroke) / 2 - 1, 1);
  const c = 2 * Math.PI * r;
  const pcts = segments.map((s) => s.pct);
  const visual = normalizeVisualPercents(pcts);
  const n = segments.length;
  const gapPx = n > 1 ? 2 : 0;
  const totalGap = n > 1 ? gapPx * n : 0;
  const usable = Math.max(c - totalGap, 0.0001);

  let rotation = -90;
  const gapDeg = n > 1 ? (gapPx / c) * 360 : 0;

  const rings =
    n === 0 ? null : n === 1 ? (
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={segments[0]!.color}
        strokeWidth={totalValue <= 0 ? 1 : stroke}
        strokeDasharray={totalValue <= 0 ? `1 ${c}` : `${c * 0.998} ${c}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    ) : (
      segments.map((seg, i) => {
        const len = (visual[i]! / 100) * usable;
        const angleDelta = (len / c) * 360 + gapDeg;
        const el = (
          <g key={`${seg.label}-${i}`} transform={`rotate(${rotation} ${cx} ${cy})`}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeLinecap="butt"
              strokeDasharray={`${len} ${c}`}
            />
          </g>
        );
        rotation += angleDelta;
        return el;
      })
    );

  const valueBlock = (
    <>
      <p className="portfolio-donut__kicker">Total</p>
      <p className="portfolio-donut__value">{formatUsd(totalValue)}</p>
      {isPending ? <p className="portfolio-donut__pending">Pending</p> : null}
    </>
  );

  const svg = (
    <svg
      className="portfolio-donut__svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
    >
      {rings}
    </svg>
  );

  if (hideTotal) {
    return (
      <div
        className="portfolio-donut portfolio-donut--chart-only"
        style={{ ["--donut-size" as string]: `${size}px` }}
        role="img"
        aria-label={buildAriaLabel(segments)}
      >
        {svg}
      </div>
    );
  }

  if (labelPlacement === "beside") {
    return (
      <div
        className="portfolio-donut portfolio-donut--beside"
        style={{ ["--donut-size" as string]: `${size}px` }}
        role="img"
        aria-label={`${buildAriaLabel(segments)}. Total ${formatUsd(totalValue)}.`}
      >
        {svg}
        <div className="portfolio-donut__aside">{valueBlock}</div>
      </div>
    );
  }

  return (
    <div
      className="portfolio-donut"
      style={{ ["--donut-size" as string]: `${size}px` }}
      role="img"
      aria-label={buildAriaLabel(segments)}
    >
      {svg}
      <div className="portfolio-donut__center">{valueBlock}</div>
    </div>
  );
}
