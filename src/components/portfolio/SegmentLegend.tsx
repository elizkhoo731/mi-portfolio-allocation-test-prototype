import { riskLevelDisplayName } from "@/constants/riskLevelDisplay";
import type { CoreAllocation, ThemeAllocation } from "@/types/portfolio";
import "@/components/portfolio/segment-legend.css";

const CORE_LEGEND_COLOR = "#1D9E75";

export type SegmentLegendProps = {
  coreAllocation: CoreAllocation;
  themes: ThemeAllocation[];
};

export function SegmentLegend({ coreAllocation, themes }: SegmentLegendProps) {
  const coreTitle = `Core · ${riskLevelDisplayName(coreAllocation.riskLevel)}`;

  return (
    <ul className="segment-legend">
      <li className="segment-legend__item">
        <span
          className="segment-legend__dot"
          style={{ background: CORE_LEGEND_COLOR }}
          aria-hidden
        />
        <div className="segment-legend__body">
          <div className="segment-legend__row">
            <span className="segment-legend__label">{coreTitle}</span>
            <span className="segment-legend__pct">{coreAllocation.targetPct}%</span>
          </div>
          <div className="segment-legend__track" aria-hidden>
            <div
              className="segment-legend__fill"
              style={{
                width: `${coreAllocation.targetPct}%`,
                background: CORE_LEGEND_COLOR,
              }}
            />
          </div>
        </div>
      </li>
      {themes.map((th) => (
        <li key={th.themeId} className="segment-legend__item">
          <span
            className="segment-legend__dot"
            style={{ background: th.color }}
            aria-hidden
          />
          <div className="segment-legend__body">
            <div className="segment-legend__row">
              <span className="segment-legend__label">{th.displayName}</span>
              <span className="segment-legend__pct">{th.targetPct}%</span>
            </div>
            <div className="segment-legend__track" aria-hidden>
              <div
                className="segment-legend__fill"
                style={{
                  width: `${th.targetPct}%`,
                  background: th.color,
                }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
