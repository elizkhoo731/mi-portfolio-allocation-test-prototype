import { useCallback, useId, useState } from "react";
import {
  MAX_COMBINED_THEMES_PCT,
  MIN_THEME_ALLOCATION_PCT,
  THEME_ALLOCATION_STEP_PCT,
  validateThemeAllocations,
  type AllocationValidationError,
  type ThemeTarget,
} from "@/lib/allocation";
import type { ThemeId } from "@/types/portfolio";
import "@/components/allocation/custom-allocation-inputs.css";

export type CustomAllocationThemeRow = ThemeTarget & { displayName: string };

export type CustomAllocationInputsProps = {
  rows: CustomAllocationThemeRow[];
  onRowChange: (themeId: ThemeId, targetPct: number) => void;
};

function snapToStep(value: number): number {
  return Math.round(value / THEME_ALLOCATION_STEP_PCT) * THEME_ALLOCATION_STEP_PCT;
}

const MAX_SINGLE_THEME_PCT = MAX_COMBINED_THEMES_PCT;

type ThemePercentRowProps = {
  row: CustomAllocationThemeRow;
  fieldId: string;
  rowErrors: AllocationValidationError[];
  onRowChange: (themeId: ThemeId, targetPct: number) => void;
};

function ThemePercentRow({ row, fieldId, rowErrors, onRowChange }: ThemePercentRowProps) {
  const [text, setText] = useState<string | null>(null);

  const commitText = useCallback(() => {
    if (text === null) return;
    const trimmed = text.trim();
    if (trimmed === "") {
      setText(null);
      return;
    }
    const digits = trimmed.replace(/\D/g, "");
    if (digits === "") {
      setText(null);
      return;
    }
    const parsed = parseInt(digits, 10);
    if (Number.isNaN(parsed)) {
      setText(null);
      return;
    }
    const clamped = Math.min(MAX_SINGLE_THEME_PCT, Math.max(0, parsed));
    const snapped = snapToStep(clamped);
    const final = Math.min(
      MAX_SINGLE_THEME_PCT,
      Math.max(MIN_THEME_ALLOCATION_PCT, snapped)
    );
    onRowChange(row.themeId, final);
    setText(null);
  }, [onRowChange, row.themeId, text]);

  const bump = (delta: number) => {
    setText(null);
    const next = snapToStep(row.targetPct + delta);
    const clamped = Math.min(
      MAX_SINGLE_THEME_PCT,
      Math.max(MIN_THEME_ALLOCATION_PCT, next)
    );
    onRowChange(row.themeId, clamped);
  };

  const minusDisabled = row.targetPct <= MIN_THEME_ALLOCATION_PCT;
  const plusDisabled = row.targetPct >= MAX_SINGLE_THEME_PCT;

  const inputValue = text !== null ? text : String(row.targetPct);

  return (
    <div className="custom-allocation__row">
      <div className="custom-allocation__field">
        <label className="custom-allocation__theme-label" htmlFor={fieldId}>
          {row.displayName}
        </label>
        <div className="custom-allocation__stepper" role="group" aria-label={row.displayName}>
          <button
            type="button"
            className="custom-allocation__step-btn"
            aria-label={`Decrease ${row.displayName} by ${THEME_ALLOCATION_STEP_PCT} percent`}
            disabled={minusDisabled}
            onClick={() => bump(-THEME_ALLOCATION_STEP_PCT)}
          >
            −
          </button>
          <div className="custom-allocation__pct-wrap">
            <input
              id={fieldId}
              className="custom-allocation__pct-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              enterKeyHint="done"
              aria-describedby={rowErrors.length ? `${fieldId}-errors` : undefined}
              value={inputValue}
              onFocus={() => setText(String(row.targetPct))}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d]/g, "");
                setText(v);
              }}
              onBlur={commitText}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
            />
            <span className="custom-allocation__pct-suffix" aria-hidden>
              %
            </span>
          </div>
          <button
            type="button"
            className="custom-allocation__step-btn"
            aria-label={`Increase ${row.displayName} by ${THEME_ALLOCATION_STEP_PCT} percent`}
            disabled={plusDisabled}
            onClick={() => bump(THEME_ALLOCATION_STEP_PCT)}
          >
            +
          </button>
        </div>
        {rowErrors.length > 0 ? (
          <div id={`${fieldId}-errors`}>
            {rowErrors.map((err) => (
              <p key={err.code} className="custom-allocation__row-error" role="alert">
                {err.message}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Per-theme % controls: +/- steppers and numeric entry (mobile numpad). Parent should show
 * donut + core share for orientation (e.g. Choose allocation screen).
 */
export function CustomAllocationInputs({ rows, onRowChange }: CustomAllocationInputsProps) {
  const baseId = useId();
  const assignments: ThemeTarget[] = rows.map(({ themeId, targetPct }) => ({
    themeId,
    targetPct,
  }));
  const validation = validateThemeAllocations(assignments, {
    enforceFivePctStep: true,
  });
  const overThemeCap = validation.themesTotal > MAX_COMBINED_THEMES_PCT;

  return (
    <div className="custom-allocation">
      <p className="custom-allocation__label">Custom allocation</p>

      {rows.map((row) => {
        const fieldId = `${baseId}-${row.themeId}`;
        const rowErrors = validation.errors.filter((e) => e.themeId === row.themeId);

        return (
          <ThemePercentRow
            key={row.themeId}
            row={row}
            fieldId={fieldId}
            rowErrors={rowErrors}
            onRowChange={onRowChange}
          />
        );
      })}

      {overThemeCap ? (
        <p className="custom-allocation__inline-alert" role="alert">
          Combined themes are {validation.themesTotal}% (max {MAX_COMBINED_THEMES_PCT}%). Lower a
          row or pick a preset.
        </p>
      ) : null}

      {!validation.valid && validation.errors.some((e) => !e.themeId) ? (
        <ul className="custom-allocation__list-error">
          {validation.errors
            .filter((e) => !e.themeId)
            .map((e) => (
              <li key={e.code}>{e.message}</li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}
