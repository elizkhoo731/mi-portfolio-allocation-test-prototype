import { useContext } from "react";
import { PortfolioContext, type PortfolioContextValue } from "@/portfolio/portfolioContext";

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error("usePortfolio must be used within PortfolioProvider");
  }
  return ctx;
}
