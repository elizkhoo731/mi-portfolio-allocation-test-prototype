import { ALLOCATION_PRESETS } from "@/constants/allocationPresets";
import { THEME_CATALOGUE } from "@/constants/themeCatalogue";
import { PortfolioDonut } from "@/components/portfolio/PortfolioDonut";
import { buildThemeAssignmentsFromPreset } from "@/lib/allocation";
import { segmentsForPresetPreview } from "@/lib/presetDonutSegments";
import type {
  AllocationPreset,
  AllocationPresetLabel,
  DonutSegment,
  ThemeId,
} from "@/types/portfolio";
import "@/components/allocation/allocation-preset-picker.css";

function defaultThemeDisplayName(themeId: ThemeId): string {
  return THEME_CATALOGUE.find((t) => t.themeId === themeId)?.displayName ?? themeId;
}

export type AllocationPresetPickerProps = {
  activePreset: AllocationPresetLabel | "custom" | null;
  onSelect: (preset: AllocationPreset | "custom") => void;
  themeIds: readonly ThemeId[];
  /** Shown in mini donuts (spec: total value only in center). */
  totalValue: number;
  /** When Custom is active, drives the mini donut on the Custom card. */
  customPreviewSegments?: DonutSegment[] | null;
  disabled?: boolean;
  /** Labels for theme rows on preset cards (defaults to theme catalogue names). */
  getThemeDisplayName?: (themeId: ThemeId) => string;
};

function isSelected(
  active: AllocationPresetPickerProps["activePreset"],
  label: AllocationPresetLabel | "custom"
) {
  return active === label;
}

/**
 * Preset row (Light touch / Balanced / Emphasised) plus Custom (spec §4.6).
 */
export function AllocationPresetPicker({
  activePreset,
  onSelect,
  themeIds,
  totalValue,
  customPreviewSegments = null,
  disabled = false,
  getThemeDisplayName = defaultThemeDisplayName,
}: AllocationPresetPickerProps) {
  const themeCount = themeIds.length;
  const presetsDisabled = disabled || themeCount < 1;
  const balancedThemesPct =
    ALLOCATION_PRESETS.find((p) => p.label === "balanced")?.themesPct ?? 20;
  const customCardSegments =
    activePreset === "custom" &&
    customPreviewSegments &&
    customPreviewSegments.length > 0
      ? customPreviewSegments
      : segmentsForPresetPreview(themeIds, balancedThemesPct);

  return (
    <div className="preset-picker">
      <p className="preset-picker__label">Preset allocation</p>
      <div className="preset-picker__grid" role="group" aria-label="Allocation presets">
        {ALLOCATION_PRESETS.map((preset) => {
          const segs = segmentsForPresetPreview(themeIds, preset.themesPct);
          const selected = isSelected(activePreset, preset.label);
          const built = buildThemeAssignmentsFromPreset(themeIds, preset.themesPct);
          return (
            <button
              key={preset.label}
              type="button"
              className={`preset-picker__card${selected ? " preset-picker__card--selected" : ""}`}
              disabled={presetsDisabled}
              onClick={() => onSelect(preset)}
            >
              <div className="preset-picker__card-donut">
                <PortfolioDonut
                  totalValue={totalValue}
                  segments={segs}
                  size={56}
                  hideTotal
                />
              </div>
              <p className="preset-picker__card-title">{preset.displayLabel}</p>
              {built.ok ? (
                <>
                  <ul className="preset-picker__card-themes" aria-label="Per-theme allocation">
                    {built.assignments.map((a) => (
                      <li key={a.themeId}>
                        <span className="preset-picker__card-theme-name">
                          {getThemeDisplayName(a.themeId)}
                        </span>
                        <span className="preset-picker__card-theme-pct">{a.targetPct}%</span>
                      </li>
                    ))}
                  </ul>
                  <p className="preset-picker__card-core">{100 - preset.themesPct}% core</p>
                </>
              ) : (
                <p className="preset-picker__card-sub">{built.message}</p>
              )}
            </button>
          );
        })}
        <button
          type="button"
          className={`preset-picker__card${isSelected(activePreset, "custom") ? " preset-picker__card--selected" : ""}`}
          disabled={disabled || themeCount < 1}
          onClick={() => onSelect("custom")}
        >
          <div className="preset-picker__card-donut">
            <PortfolioDonut
              totalValue={totalValue}
              segments={customCardSegments}
              size={56}
              hideTotal
            />
          </div>
          <p className="preset-picker__card-title">Custom</p>
          <p className="preset-picker__card-sub">Set each theme in 5% steps</p>
        </button>
      </div>
      {themeCount < 1 ? (
        <p className="preset-picker__hint">
          Add at least one theme to your portfolio to use presets or custom allocation.
        </p>
      ) : null}
    </div>
  );
}
