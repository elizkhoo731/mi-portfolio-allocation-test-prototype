import { Link } from "react-router-dom";
import { track } from "@/lib/analytics";
import "@/components/portfolio/add-theme-button.css";

export type AddThemeButtonProps = {
  /** Number of themes currently active (0–3). */
  activeThemeCount: number;
  to: string;
};

/**
 * CTA when fewer than three themes are active. Hidden when rebalancing (parent).
 * Spec §4.1: "Add a theme (N of 3)".
 */
export function AddThemeButton({ activeThemeCount, to }: AddThemeButtonProps) {
  return (
    <Link
      to={to}
      className="add-theme-btn"
      onClick={() => track("add_theme_cta_tapped", { activeThemeCount })}
    >
      <span className="add-theme-btn__icon" aria-hidden>
        +
      </span>
      Add a theme ({activeThemeCount} of 3)
    </Link>
  );
}
