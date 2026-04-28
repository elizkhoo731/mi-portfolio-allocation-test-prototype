/**
 * Managed Investing allocation math and validation.
 *
 * Business rules come from the portfolio allocation engineering spec (theme min/max,
 * core remainder, preset splits). Product context: Investing sits under the Grow pillar
 * (`docs/company-context.md`). This module has no UI; MLDS tokens do not apply here
 * (`docs/moneylion-project-instructions.md`, `MLDS-4_0-Reference.md`).
 */

import { THEME_CATALOGUE } from "@/constants/themeCatalogue";
import type { RiskLevel, ThemeCatalogueItem, ThemeId } from "@/types/portfolio";

/** Maximum number of thematic sleeves in one blended portfolio. */
export const MAX_THEMES = 3;

/** Minimum % for any single theme; enforced in UI and expected server-side. */
export const MIN_THEME_ALLOCATION_PCT = 5;

/** Minimum % reserved for core (core = 100 − sum(themes)). */
export const MIN_CORE_ALLOCATION_PCT = 5;

/** Maximum combined theme % so core never drops below `MIN_CORE_ALLOCATION_PCT`. */
export const MAX_COMBINED_THEMES_PCT = 100 - MIN_CORE_ALLOCATION_PCT;

/** Step size for custom theme inputs in the allocation editor. */
export const THEME_ALLOCATION_STEP_PCT = 5;

export interface ThemeTarget {
  themeId: ThemeId;
  /** Integer percentage */
  targetPct: number;
}

export type AllocationValidationErrorCode =
  | "TOO_MANY_THEMES"
  | "DUPLICATE_THEME_ID"
  | "THEME_BELOW_MIN"
  | "THEMES_EXCEED_CORE_MIN"
  | "NOT_INCREMENT_OF_FIVE"
  | "PRESET_CANNOT_SATISFY_MIN_PER_THEME";

export interface AllocationValidationError {
  code: AllocationValidationErrorCode;
  /** Present for row-level issues */
  themeId?: ThemeId;
  message: string;
}

export interface AllocationValidationResult {
  valid: boolean;
  errors: AllocationValidationError[];
  /** 100 − sum(theme %); may be negative if inputs are invalid */
  corePct: number;
  themesTotal: number;
}

export interface ValidateThemeAllocationsOptions {
  /** When true, each theme % must be a multiple of `THEME_ALLOCATION_STEP_PCT` (custom editor). */
  enforceFivePctStep?: boolean;
}

/**
 * Core allocation % as remainder of theme targets (never user-edited in product).
 */
export function computeCorePct(themeTargetPcts: readonly number[]): number {
  const sum = themeTargetPcts.reduce((a, b) => a + b, 0);
  return 100 - sum;
}

/**
 * Whether a theme is allowed for the user's current risk level (catalogue-driven).
 */
export function isThemeEligibleForRiskLevel(
  themeId: ThemeId,
  riskLevel: RiskLevel,
  catalogue: readonly ThemeCatalogueItem[] = THEME_CATALOGUE
): boolean {
  const item = catalogue.find((t) => t.themeId === themeId);
  if (!item) return false;
  return item.eligibleRiskLevels.includes(riskLevel);
}

/**
 * Split total theme % across `themeCount` sleeves using minimum 5% each, then
 * distributing the remainder in `THEME_ALLOCATION_STEP_PCT` steps round-robin
 * so the array sums to `themesPct`.
 *
 * @returns `null` if `themesPct < themeCount * MIN_THEME_ALLOCATION_PCT` or `themeCount < 1`
 */
export function splitPresetAcrossThemeCount(
  themesPct: number,
  themeCount: number
): number[] | null {
  if (themeCount < 1) return null;
  if (themeCount > MAX_THEMES) return null;
  const minTotal = themeCount * MIN_THEME_ALLOCATION_PCT;
  if (themesPct < minTotal) return null;
  if (themesPct > MAX_COMBINED_THEMES_PCT) return null;

  const pcts = Array.from({ length: themeCount }, () => MIN_THEME_ALLOCATION_PCT);
  let remainder = themesPct - minTotal;
  let i = 0;
  while (remainder >= THEME_ALLOCATION_STEP_PCT) {
    pcts[i % themeCount] += THEME_ALLOCATION_STEP_PCT;
    remainder -= THEME_ALLOCATION_STEP_PCT;
    i += 1;
  }
  if (remainder !== 0) {
    return null;
  }
  return pcts;
}

export type BuildPresetAssignmentsResult =
  | { ok: true; assignments: ThemeTarget[] }
  | {
      ok: false;
      code: AllocationValidationErrorCode;
      message: string;
    };

/**
 * Build per-theme integer targets from a preset total and ordered active theme ids.
 */
export function buildThemeAssignmentsFromPreset(
  themeIds: readonly ThemeId[],
  themesPct: number
): BuildPresetAssignmentsResult {
  if (themeIds.length === 0) {
    if (themesPct !== 0) {
      return {
        ok: false,
        code: "PRESET_CANNOT_SATISFY_MIN_PER_THEME",
        message: "Themes percentage must be 0 when there are no themes.",
      };
    }
    return { ok: true, assignments: [] };
  }

  const unique = new Set(themeIds);
  if (unique.size !== themeIds.length) {
    return {
      ok: false,
      code: "DUPLICATE_THEME_ID",
      message: "Each theme may only appear once.",
    };
  }

  if (themeIds.length > MAX_THEMES) {
    return {
      ok: false,
      code: "TOO_MANY_THEMES",
      message: `At most ${MAX_THEMES} themes are allowed.`,
    };
  }

  const pcts = splitPresetAcrossThemeCount(themesPct, themeIds.length);
  if (!pcts) {
    return {
      ok: false,
      code: "PRESET_CANNOT_SATISFY_MIN_PER_THEME",
      message:
        "This preset cannot be applied with the current number of themes while respecting the 5% minimum per theme.",
    };
  }

  const assignments: ThemeTarget[] = themeIds.map((themeId, idx) => ({
    themeId,
    targetPct: pcts[idx]!,
  }));

  return { ok: true, assignments };
}

/**
 * Full validation for POST-shaped theme targets (order preserved).
 */
export function validateThemeAllocations(
  assignments: readonly ThemeTarget[],
  options: ValidateThemeAllocationsOptions = {}
): AllocationValidationResult {
  const { enforceFivePctStep = false } = options;
  const errors: AllocationValidationError[] = [];

  if (assignments.length === 0) {
    return { valid: true, errors: [], corePct: 100, themesTotal: 0 };
  }

  if (assignments.length > MAX_THEMES) {
    errors.push({
      code: "TOO_MANY_THEMES",
      message: `At most ${MAX_THEMES} themes are allowed.`,
    });
  }

  const seen = new Set<ThemeId>();
  for (const row of assignments) {
    if (seen.has(row.themeId)) {
      errors.push({
        code: "DUPLICATE_THEME_ID",
        themeId: row.themeId,
        message: "Each theme may only appear once.",
      });
    }
    seen.add(row.themeId);

    if (!Number.isInteger(row.targetPct)) {
      errors.push({
        code: "NOT_INCREMENT_OF_FIVE",
        themeId: row.themeId,
        message: "Use whole percentage numbers.",
      });
    }

    if (row.targetPct < MIN_THEME_ALLOCATION_PCT) {
      errors.push({
        code: "THEME_BELOW_MIN",
        themeId: row.themeId,
        message: `Minimum theme allocation is ${MIN_THEME_ALLOCATION_PCT}%.`,
      });
    }

    if (
      Number.isInteger(row.targetPct) &&
      enforceFivePctStep &&
      row.targetPct % THEME_ALLOCATION_STEP_PCT !== 0
    ) {
      errors.push({
        code: "NOT_INCREMENT_OF_FIVE",
        themeId: row.themeId,
        message: `Theme allocations must be in ${THEME_ALLOCATION_STEP_PCT}% steps.`,
      });
    }
  }

  const themesTotal = assignments.reduce((s, a) => s + a.targetPct, 0);
  if (themesTotal > MAX_COMBINED_THEMES_PCT) {
    errors.push({
      code: "THEMES_EXCEED_CORE_MIN",
      message: `Themes cannot exceed ${MAX_COMBINED_THEMES_PCT}% so core stays at least ${MIN_CORE_ALLOCATION_PCT}%.`,
    });
  }

  const corePct = computeCorePct(assignments.map((a) => a.targetPct));

  return {
    valid: errors.length === 0 && corePct >= MIN_CORE_ALLOCATION_PCT,
    errors,
    corePct,
    themesTotal,
  };
}
