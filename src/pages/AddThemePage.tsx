import { Link } from "react-router-dom";
import { ThemeCatalogueScreen } from "@/screens/ThemeCatalogueScreen";
import { usePortfolio } from "@/portfolio";
import "@/pages/page-placeholder.css";

export function AddThemePage() {
  const { portfolio, isLoading, isRebalanceLocked } = usePortfolio();

  if (isLoading || !portfolio) {
    return (
      <div className="page-placeholder">
        <p className="page-placeholder__text">Loading portfolio…</p>
        <Link to="/managed-investing" className="page-placeholder__link">Back to dashboard</Link>
      </div>
    );
  }

  return <ThemeCatalogueScreen portfolio={portfolio} isRebalanceLocked={isRebalanceLocked} />;
}
