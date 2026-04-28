import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  mockCompleteRebalancingForDemo,
  mockGetPortfolio,
  mockGetRebalancingStatus,
  mockPostAllocation,
  mockResetPortfolio,
  mockSetCoreRiskLevel,
} from "@/lib/mockPortfolioStore";
import {
  PortfolioContext,
  type PortfolioContextValue,
} from "@/portfolio/portfolioContext";

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [portfolio, setPortfolio] = useState<PortfolioContextValue["portfolio"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastRebalanceStatusPoll, setLastRebalanceStatusPoll] =
    useState<PortfolioContextValue["lastRebalanceStatusPoll"]>(null);

  const loadInitial = useCallback(async () => {
    setLoadError(null);
    setIsLoading(true);
    try {
      const p = await mockGetPortfolio();
      setPortfolio(p);
      setLoadError(null);
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshPortfolio = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const p = await mockGetPortfolio();
      setPortfolio(p);
      setLoadError(null);
    } catch {
      /* keep last good portfolio */
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const isRebalanceLocked =
    portfolio?.rebalancingState?.status === "in_progress";

  const updateCoreRiskLevel = useCallback<
    PortfolioContextValue["updateCoreRiskLevel"]
  >(async (level) => {
    const result = await mockSetCoreRiskLevel(level);
    if (result.ok) {
      setPortfolio(result.portfolio);
      return { success: true };
    }
    return { success: false, message: result.message };
  }, []);

  const updateAllocation = useCallback<
    PortfolioContextValue["updateAllocation"]
  >(async (body) => {
    const result = await mockPostAllocation(body);
    if (result.ok) {
      setPortfolio(result.data.portfolio);
      return { success: true };
    }
    if (result.status === 400 && "code" in result.body) {
      const msg =
        result.body.code === "REBALANCE_IN_PROGRESS"
          ? "A rebalance is already in progress. Please wait until it completes."
          : "Invalid allocation. Please check your percentages and try again.";
      return { success: false, message: msg, code: result.body.code };
    }
    const fallback = "Something went wrong. Please try again.";
    const b = result.body;
    const msg =
      "message" in b && typeof b.message === "string" ? b.message : fallback;
    return { success: false, message: msg };
  }, []);

  const completeRebalancingDemo = useCallback(async () => {
    const p = await mockCompleteRebalancingForDemo();
    setPortfolio(p);
  }, []);

  const resetDemo = useCallback(async () => {
    const p = await mockResetPortfolio();
    setPortfolio(p);
    setLastRebalanceStatusPoll(null);
  }, []);

  const pollRebalancingStatus = useCallback(async () => {
    const status = await mockGetRebalancingStatus();
    setLastRebalanceStatusPoll(status);
  }, []);

  const value = useMemo<PortfolioContextValue>(
    () => ({
      portfolio,
      isLoading,
      isRefreshing,
      loadError,
      isRebalanceLocked,
      lastRebalanceStatusPoll,
      refreshPortfolio,
      updateAllocation,
      updateCoreRiskLevel,
      completeRebalancingDemo,
      resetDemo,
      pollRebalancingStatus,
    }),
    [
      portfolio,
      isLoading,
      isRefreshing,
      loadError,
      isRebalanceLocked,
      lastRebalanceStatusPoll,
      refreshPortfolio,
      updateAllocation,
      updateCoreRiskLevel,
      completeRebalancingDemo,
      resetDemo,
      pollRebalancingStatus,
    ]
  );

  return (
    <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
  );
}
