import type { ThemeCatalogueItem } from "@/types/portfolio";

export const THEME_CATALOGUE: readonly ThemeCatalogueItem[] = [
  {
    themeId: "earn_and_grow",
    displayName: "Earn and Grow",
    description:
      "Dividend-paying equity ETFs that offer higher yield with some growth.",
    etfCount: 4,
    eligibleRiskLevels: [
      "steady_income",
      "conservative",
      "moderately_conservative",
      "moderate",
      "moderately_aggressive",
      "aggressive",
      "equity_only",
    ],
    color: "#534AB7",
  },
  {
    themeId: "future_innovation",
    displayName: "Future Innovation",
    description:
      "ETFs focused on disruptive technologies like robotics, artificial intelligence, and autonomous cars.",
    etfCount: 5,
    eligibleRiskLevels: [
      "moderate",
      "moderately_aggressive",
      "aggressive",
      "equity_only",
    ],
    color: "#EF9F27",
  },
  {
    themeId: "greater_good",
    displayName: "Greater Good",
    description:
      "ETFs aligned to companies that exhibit positive environmental, social, and corporate governance (ESG) characteristics.",
    etfCount: 3,
    eligibleRiskLevels: [
      "steady_income",
      "conservative",
      "moderately_conservative",
      "moderate",
      "moderately_aggressive",
      "aggressive",
      "equity_only",
    ],
    color: "#1D9E75",
  },
] as const;
