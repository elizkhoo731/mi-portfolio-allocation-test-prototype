import { Link } from "react-router-dom";
import { MobileDeviceFrame } from "@/components/ui/MobileDeviceFrame";
import { ThemeCatalogueScreen } from "@/screens/ThemeCatalogueScreen";
import { usePortfolio } from "@/portfolio";
import "@/pages/page-placeholder.css";

export function AddThemePage() {
  const { portfolio, isLoading, isRebalanceLocked } = usePortfolio();

  if (isLoading || !portfolio) {
    return (
      <div className="page-device-wrap">
        <MobileDeviceFrame>
          <div className="page-placeholder">
            <p className="page-placeholder__text">Loading portfolio…</p>
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
        <ThemeCatalogueScreen portfolio={portfolio} isRebalanceLocked={isRebalanceLocked} />
      </MobileDeviceFrame>
    </div>
  );
}
