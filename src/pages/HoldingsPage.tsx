import { Link } from "react-router-dom";
import { MobileDeviceFrame } from "@/components/ui/MobileDeviceFrame";
import { HoldingsTab } from "@/screens/HoldingsTab";
import { usePortfolio } from "@/portfolio";
import "@/pages/page-placeholder.css";

export function HoldingsPage() {
  const { portfolio, isLoading } = usePortfolio();

  if (isLoading || !portfolio) {
    return (
      <div className="page-device-wrap">
        <MobileDeviceFrame>
          <div className="page-placeholder">
            <p className="page-placeholder__text">Loading holdings…</p>
            <Link to="/managed-investing" className="page-placeholder__link">
              Back to Managed Investing
            </Link>
          </div>
        </MobileDeviceFrame>
      </div>
    );
  }

  return (
    <div className="page-device-wrap">
      <MobileDeviceFrame>
        <HoldingsTab portfolio={portfolio} />
      </MobileDeviceFrame>
    </div>
  );
}
