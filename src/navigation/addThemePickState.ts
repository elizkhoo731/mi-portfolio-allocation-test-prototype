import { THEME_CATALOGUE } from "@/constants/themeCatalogue";
import type { ThemeId } from "@/types/portfolio";

/** Passed via `location.state` to `/add-theme/pick` (use `getAddThemePickThemeIds` to read). */
export type AddThemePickLocationState = {
  themeIds: ThemeId[];
};

const KNOWN_IDS = new Set<ThemeId>(THEME_CATALOGUE.map((t) => t.themeId));

function isValidThemeId(v: unknown): v is ThemeId {
  return typeof v === "string" && KNOWN_IDS.has(v as ThemeId);
}

/**
 * Returns new theme ids to add, in order. Supports `{ themeIds }` or legacy `{ themeId }`.
 */
export function getAddThemePickThemeIds(value: unknown): ThemeId[] | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;

  if (Array.isArray(v.themeIds)) {
    if (!v.themeIds.every(isValidThemeId)) return null;
    const ids = v.themeIds as ThemeId[];
    const unique = new Set(ids);
    if (unique.size !== ids.length) return null;
    if (ids.length === 0) return null;
    return ids;
  }

  if (isValidThemeId(v.themeId)) {
    return [v.themeId];
  }

  return null;
}
