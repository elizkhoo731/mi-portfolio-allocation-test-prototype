import { Link } from "react-router-dom";
import { AllocationConfirmScreen } from "@/screens/AllocationConfirmScreen";
import { usePortfolio } from "@/portfolio";
import "@/pages/page-placeholder.css";

export function AllocationConfirmPage() {
  const { portfolio, isLoading } = usePortfolio();

  if (isLoading || !portfolio) {
    return (
      <div className="page-placeholder">
        <p className="page-placeholder__text">Loading portfolio…</p>
        <Link to="/managed-investing" className="page-placeholder__link">Back to dashboard</Link>
      </div>
    );
  }

  return <AllocationConfirmScreen />;
}
