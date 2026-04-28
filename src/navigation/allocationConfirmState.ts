import type { ThemeId } from "@/types/portfolio";

function isAssignmentRow(row: unknown): row is { themeId: ThemeId; targetPct: number } {
  return (
    !!row &&
    typeof row === "object" &&
    typeof (row as { themeId?: unknown }).themeId === "string" &&
    typeof (row as { targetPct?: unknown }).targetPct === "number"
  );
}

/** Passed via `react-router` location state to `/allocation-confirm`. */
export type AllocationConfirmLocationState =
  | {
      action: "edit";
      assignments: { themeId: ThemeId; targetPct: number }[];
    }
  | {
      action: "add";
      /** Themes newly added in this flow (subset of `assignments`). */
      addThemeIds: ThemeId[];
      assignments: { themeId: ThemeId; targetPct: number }[];
    };

export function isAllocationConfirmState(
  value: unknown
): value is AllocationConfirmLocationState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.assignments) || !v.assignments.every(isAssignmentRow)) {
    return false;
  }
  if (v.action === "edit") {
    return true;
  }
  if (v.action === "add") {
    if (!Array.isArray(v.addThemeIds) || v.addThemeIds.length === 0) return false;
    const addIds = v.addThemeIds as unknown[];
    if (!addIds.every((id) => typeof id === "string")) return false;
    const set = new Set(v.addThemeIds as string[]);
    if (set.size !== addIds.length) return false;
    const rows = v.assignments.filter(isAssignmentRow);
    return (v.addThemeIds as ThemeId[]).every((id) => rows.some((r) => r.themeId === id));
  }
  return false;
}
