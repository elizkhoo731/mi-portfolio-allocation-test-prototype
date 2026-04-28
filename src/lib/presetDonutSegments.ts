import { THEME_CATALOGUE } from "@/constants/themeCatalogue";
import {
  buildThemeAssignmentsFromPreset,
  computeCorePct,
  type ThemeTarget,
} from "@/lib/allocation";
import type { DonutSegment, ThemeId } from "@/types/portfolio";

const CORE_COLOR = "#006657";

/**
 * Donut segments for a preset card mini preview (theme order preserved).
 */
export function segmentsForPresetPreview(
  themeIds: readonly ThemeId[],
  themesPct: number
): DonutSegment[] {
  const built = buildThemeAssignmentsFromPreset(themeIds, themesPct);
  if (!built.ok) {
    return [{ label: "Core", pct: 100, color: CORE_COLOR }];
  }
  const corePct = computeCorePct(built.assignments.map((a) => a.targetPct));
  const out: DonutSegment[] = [{ label: "Core", pct: corePct, color: CORE_COLOR }];
  for (const a of built.assignments) {
    const cat = THEME_CATALOGUE.find((t) => t.themeId === a.themeId);
    out.push({
      label: cat?.displayName ?? a.themeId,
      pct: a.targetPct,
      color: cat?.color ?? "#888888",
    });
  }
  return out;
}

/** Live donut preview from draft theme targets (same ordering as `assignments`). */
export function segmentsFromAssignments(assignments: readonly ThemeTarget[]): DonutSegment[] {
  if (assignments.length === 0) {
    return [{ label: "Core", pct: 100, color: CORE_COLOR }];
  }
  const corePct = computeCorePct(assignments.map((a) => a.targetPct));
  const out: DonutSegment[] = [{ label: "Core", pct: corePct, color: CORE_COLOR }];
  for (const a of assignments) {
    const cat = THEME_CATALOGUE.find((t) => t.themeId === a.themeId);
    out.push({
      label: cat?.displayName ?? a.themeId,
      pct: a.targetPct,
      color: cat?.color ?? "#888888",
    });
  }
  return out;
}
