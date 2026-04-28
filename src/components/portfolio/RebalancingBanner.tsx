import "@/components/portfolio/rebalancing-banner.css";

export type RebalancingBannerStatus = "in_progress" | "failed" | "delayed";

export type RebalancingBannerProps = {
  estimatedDays: number;
  status: RebalancingBannerStatus;
};

export function RebalancingBanner({ estimatedDays, status }: RebalancingBannerProps) {
  const copy =
    status === "in_progress"
      ? `Your portfolio is rebalancing. This usually takes ${estimatedDays} business days. You'll get a notification when it's complete.`
      : "Your rebalance is taking longer than expected due to market conditions. We'll notify you when it's complete.";

  return (
    <div className="rebalancing-banner" role="status" aria-live="polite">
      {copy}
    </div>
  );
}
