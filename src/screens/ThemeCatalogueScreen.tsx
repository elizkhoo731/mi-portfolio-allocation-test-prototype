import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeDetailDrawer } from "@/components/add-theme/ThemeDetailDrawer";
import { THEME_CATALOGUE } from "@/constants/themeCatalogue";
import { isThemeEligibleForRiskLevel, MAX_THEMES } from "@/lib/allocation";
import { track } from "@/lib/analytics";
import type { ManagedInvestingPortfolio, ThemeCatalogueItem, ThemeId } from "@/types/portfolio";
import "@/pages/allocation-editor-page.css";
import "@/screens/theme-catalogue-screen.css";

export type ThemeCatalogueScreenProps = {
  portfolio: ManagedInvestingPortfolio;
  isRebalanceLocked: boolean;
};

export function ThemeCatalogueScreen({
  portfolio,
  isRebalanceLocked,
}: ThemeCatalogueScreenProps) {
  const navigate = useNavigate();
  const [detailTheme, setDetailTheme] = useState<ThemeCatalogueItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<ThemeId[]>([]);

  const activeIds = useMemo(() => new Set(portfolio.themes.map((t) => t.themeId)), [portfolio.themes]);
  const slotsLeft = MAX_THEMES - portfolio.themes.length;
  const atCapacity = portfolio.themes.length >= MAX_THEMES;

  const toggleSelect = (themeId: ThemeId) => {
    setSelectedIds((prev) => {
      if (prev.includes(themeId)) {
        track("theme_catalogue_deselected", { themeId });
        return prev.filter((id) => id !== themeId);
      }
      if (prev.length >= slotsLeft) {
        track("theme_catalogue_select_blocked", { themeId, reason: "capacity" });
        return prev;
      }
      track("theme_catalogue_selected", { themeId });
      return [...prev, themeId];
    });
  };

  const goToPicker = () => {
    if (selectedIds.length === 0 || isRebalanceLocked || atCapacity) return;
    track("theme_catalogue_continue_to_picker", {
      count: selectedIds.length,
      themeIds: selectedIds.join(","),
    });
    navigate("/add-theme/pick", { state: { themeIds: selectedIds } });
  };

  return (
    <div className="allocation-editor-preview">
      <Link to="/managed-investing" className="allocation-editor-preview__back">
        Back
      </Link>
      <h1 className="allocation-editor-preview__title">Choose a theme</h1>

      <p className="theme-catalogue__intro">
        Invest in your interests. Take more control of your portfolio by adding a specialized set
        of ETFs aligned to themes like tech or the environment.
      </p>

      {isRebalanceLocked ? (
        <p className="allocation-editor-preview__lock" role="alert">
          Your portfolio is rebalancing. You can add themes after this finishes.
        </p>
      ) : null}

      {atCapacity ? (
        <p className="allocation-editor-preview__preset-error" role="status">
          You already have three themes. Remove one in Manage before adding more.
        </p>
      ) : (
        <p className="theme-catalogue__hint">
          Select one or more themes, then choose how to split your allocation. You confirm once,
          and rebalancing runs a single time after that.
        </p>
      )}

      {!atCapacity && !isRebalanceLocked ? (
        <p className="theme-catalogue__capacity" role="status">
          You can add up to {slotsLeft} more {slotsLeft === 1 ? "theme" : "themes"}.
        </p>
      ) : null}

      <ul className="theme-catalogue__list">
        {THEME_CATALOGUE.map((item) => {
          const alreadyActive = activeIds.has(item.themeId);
          const eligible = isThemeEligibleForRiskLevel(
            item.themeId,
            portfolio.coreAllocation.riskLevel
          );
          const rowDisabled =
            isRebalanceLocked || atCapacity || alreadyActive || !eligible;
          const selected = selectedIds.includes(item.themeId);
          const selectBlocked =
            !selected && !rowDisabled && selectedIds.length >= slotsLeft;

          let reason: string | null = null;
          if (alreadyActive) reason = "Already in your portfolio";
          else if (!eligible) reason = "Not offered at your current risk level";
          else if (atCapacity) reason = "Portfolio is full (3 themes)";
          else if (isRebalanceLocked) reason = "Unavailable while rebalancing";
          else if (selectBlocked) reason = "Remove a selection to add another theme";

          const addCtaDisabled =
            isRebalanceLocked || (!selected && (rowDisabled || selectBlocked));

          const onAddOrRemoveClick = () => {
            if (addCtaDisabled) return;
            toggleSelect(item.themeId);
          };

          return (
            <li key={item.themeId} className="theme-catalogue__item">
              <div
                className={`theme-catalogue__card${selected ? " theme-catalogue__card--selected" : ""}`}
              >
                <div className="theme-catalogue__body">
                  <p className="theme-catalogue__card-title">{item.displayName}</p>
                  <p className="theme-catalogue__card-desc">{item.description}</p>
                  {reason ? (
                    <p className="theme-catalogue__card-reason" role="status">
                      {reason}
                    </p>
                  ) : null}
                </div>
                <div className="theme-catalogue__ctas">
                  <button
                    type="button"
                    className="theme-catalogue__cta-add"
                    disabled={addCtaDisabled}
                    aria-label={
                      selected
                        ? `Remove ${item.displayName} from your choices`
                        : `Add ${item.displayName} to your choices`
                    }
                    onClick={onAddOrRemoveClick}
                  >
                    {selected ? "Remove" : "Add theme"}
                  </button>
                  <button
                    type="button"
                    className="theme-catalogue__cta-details"
                    aria-label={`View details and holdings for ${item.displayName}`}
                    onClick={() => {
                      track("theme_catalogue_details_opened", { themeId: item.themeId });
                      setDetailTheme(item);
                    }}
                  >
                    View details
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {!isRebalanceLocked && !atCapacity ? (
        <div className="theme-catalogue__footer">
          <button
            type="button"
            className="theme-catalogue__continue"
            disabled={selectedIds.length === 0}
            onClick={() => goToPicker()}
          >
            Choose allocation
            {selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
          </button>
        </div>
      ) : null}

      <ThemeDetailDrawer
        theme={detailTheme}
        open={detailTheme !== null}
        onClose={() => setDetailTheme(null)}
      />
    </div>
  );
}
