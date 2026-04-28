import { createContext } from "react";
import type {
  ManagedInvestingPortfolio,
  RebalancingStatusResponse,
  RiskLevel,
  UpdateAllocationRequestBody,
} from "@/types/portfolio";

export type UpdateAllocationResult =
  | { success: true }
  | { success: false; message: string; code?: string };

export type UpdateCoreRiskLevelResult =
  | { success: true }
  | { success: false; message: string };

export type PortfolioContextValue = {
  portfolio: ManagedInvestingPortfolio | null;
  isLoading: boolean;
  isRefreshing: boolean;
  loadError: string | null;
  isRebalanceLocked: boolean;
  lastRebalanceStatusPoll: RebalancingStatusResponse | null;
  refreshPortfolio: () => Promise<void>;
  updateAllocation: (body: UpdateAllocationRequestBody) => Promise<UpdateAllocationResult>;
  /** Prototype: set mandatory core risk level (WEAL PDF stock/bond table). */
  updateCoreRiskLevel: (level: RiskLevel) => Promise<UpdateCoreRiskLevelResult>;
  completeRebalancingDemo: () => Promise<void>;
  resetDemo: () => Promise<void>;
  pollRebalancingStatus: () => Promise<void>;
};

export const PortfolioContext = createContext<PortfolioContextValue | null>(null);
