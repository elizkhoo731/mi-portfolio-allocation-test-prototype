import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HoldingRow } from "@/components/holdings";
import { BottomSheetShell } from "@/components/ui/BottomSheetShell";
import { THEME_CATALOGUE } from "@/constants/themeCatalogue";
import { track } from "@/lib/analytics";
import { getMockHoldings } from "@/lib/mockHoldings";
import type { HoldingRowProps, ManagedInvestingPortfolio } from "@/types/portfolio";
import "@/pages/allocation-editor-page.css";
import "@/screens/holdings-tab.css";

export type HoldingsTabProps = {
  portfolio: ManagedInvestingPortfolio;
};

export function HoldingsTab({ portfolio }: HoldingsTabProps) {
  const [selected, setSelected] = useState<HoldingRowProps | null>(null);
  const rows = useMemo(
    () => getMockHoldings(portfolio.themes.map((theme) => theme.themeId)),
    [portfolio.themes]
  );
  const overlappingCount = rows.filter((row) => row.segments.length > 1).length;
  const segmentLabel = (segment: HoldingRowProps["segments"][number]) => {
    if (segment === "core") return "Core";
    return THEME_CATALOGUE.find((item) => item.themeId === segment)?.displayName ?? segment;
  };

  return (
    <div className="allocation-editor-preview">
      <Link to="/managed-investing" className="allocation-editor-preview__back">
        Back
      </Link>
      <h1 className="allocation-editor-preview__title">Holdings</h1>
      <p className="holdings-tab__helper">
        {overlappingCount > 0
          ? `${overlappingCount} holdings belong to more than one segment. Tap a row to see overlap details.`
          : "Each holding currently maps to one segment. Tap a row to review allocation details."}
      </p>

      <ul className="holdings-tab__list">
        {rows.map((row) => (
          <li key={row.etf.ticker}>
            <HoldingRow
              etf={row.etf}
              segments={row.segments}
              weightPct={row.weightPct}
              onOpenDetails={() => {
                track("holding_row_tapped", { ticker: row.etf.ticker });
                setSelected(row);
              }}
            />
          </li>
        ))}
      </ul>

      <BottomSheetShell
        open={selected !== null}
        title={selected ? `${selected.etf.ticker} segment details` : "Holding details"}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div className="holdings-tab__sheet">
            <p className="holdings-tab__sheet-name">{selected.etf.name}</p>
            <p className="holdings-tab__sheet-sub">
              Portfolio weight: {typeof selected.weightPct === "number" ? `${selected.weightPct}%` : "N/A"}
            </p>
            <p className="holdings-tab__sheet-list-label">This holding appears in:</p>
            <ul className="holdings-tab__sheet-list">
              {selected.segments.map((segment) => (
                <li key={segment}>{segmentLabel(segment)}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </BottomSheetShell>
    </div>
  );
}
