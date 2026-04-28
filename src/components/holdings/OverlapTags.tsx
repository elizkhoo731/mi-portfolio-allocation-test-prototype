import { THEME_CATALOGUE } from "@/constants/themeCatalogue";
import type { ThemeId } from "@/types/portfolio";
import "@/components/holdings/overlap-tags.css";

export type OverlapTagsProps = {
  segments: ("core" | ThemeId)[];
};

function segmentLabel(segment: "core" | ThemeId) {
  if (segment === "core") return "Core";
  return THEME_CATALOGUE.find((item) => item.themeId === segment)?.displayName ?? segment;
}

export function OverlapTags({ segments }: OverlapTagsProps) {
  return (
    <div className="overlap-tags" aria-label="Holding allocation segments">
      {segments.map((segment) => (
        <span key={segment} className="overlap-tags__tag">
          {segmentLabel(segment)}
        </span>
      ))}
    </div>
  );
}
