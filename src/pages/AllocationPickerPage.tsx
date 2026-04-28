import { Link, useLocation } from "react-router-dom";
import { MobileDeviceFrame } from "@/components/ui/MobileDeviceFrame";
import { getAddThemePickThemeIds } from "@/navigation/addThemePickState";
import { AllocationPickerScreen } from "@/screens/AllocationPickerScreen";
import { usePortfolio } from "@/portfolio";
import "@/pages/page-placeholder.css";

export function AllocationPickerPage() {
  const location = useLocation();
  const pickIds = getAddThemePickThemeIds(location.state);
  const pickKey = pickIds?.join(",") ?? "invalid";
  const { portfolio, isLoading, isRebalanceLocked } = usePortfolio();

  if (isLoading || !portfolio) {
    return (
      <div className="page-device-wrap">
        <MobileDeviceFrame>
          <div className="page-placeholder">
            <p className="page-placeholder__text">Loading portfolio…</p>
            <Link to="/add-theme" className="page-placeholder__link">
              Back to theme catalogue
            </Link>
          </div>
        </MobileDeviceFrame>
      </div>
    );
  }

  return (
    <div className="page-device-wrap">
      <MobileDeviceFrame>
        <AllocationPickerScreen
          key={pickKey}
          portfolio={portfolio}
          isRebalanceLocked={isRebalanceLocked}
        />
      </MobileDeviceFrame>
    </div>
  );
}
