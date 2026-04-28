import { PortfolioDonut } from "@/components/portfolio/PortfolioDonut";
import type { DonutSegment } from "@/types/portfolio";
import "@/components/allocation/allocation-donut-core-row.css";

export type AllocationDonutCoreRowProps = {
  totalValue: number;
  segments: DonutSegment[];
  corePct: number;
  /** When themes push core below the product floor */
  coreWarning?: boolean;
  donutSize?: number;
};

/**
 * Donut plus a compact core portfolio share card (Choose allocation layout).
 */
export function AllocationDonutCoreRow({
  totalValue,
  segments,
  corePct,
  coreWarning = false,
  donutSize = 112,
}: AllocationDonutCoreRowProps) {
  return (
    <div className="allocation-donut-core-row">
      <div className="allocation-donut-core-row__donut">
        <PortfolioDonut totalValue={totalValue} segments={segments} size={donutSize} />
      </div>
      <div className="allocation-donut-core-row__core">
        <p className="allocation-donut-core-row__core-label">Core portfolio</p>
        <p
          className={`allocation-donut-core-row__core-value${coreWarning ? " allocation-donut-core-row__core-value--warn" : ""}`}
        >
          {corePct}%
        </p>
      </div>
    </div>
  );
}
