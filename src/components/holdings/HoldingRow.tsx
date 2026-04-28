import { OverlapTags } from "@/components/holdings/OverlapTags";
import type { HoldingRowProps } from "@/types/portfolio";
import "@/components/holdings/holding-row.css";

export type HoldingRowComponentProps = HoldingRowProps & {
  onOpenDetails?: () => void;
};

export function HoldingRow({
  etf,
  segments,
  weightPct,
  onOpenDetails,
}: HoldingRowComponentProps) {
  return (
    <button type="button" className="holding-row" onClick={onOpenDetails}>
      <div className="holding-row__top">
        <div>
          <p className="holding-row__ticker">{etf.ticker}</p>
          <p className="holding-row__name">{etf.name}</p>
        </div>
        {typeof weightPct === "number" ? (
          <p className="holding-row__weight" aria-label={`${weightPct}% portfolio weight`}>
            {weightPct}%
          </p>
        ) : null}
      </div>
      <OverlapTags segments={segments} />
    </button>
  );
}
