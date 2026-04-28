import { Navigate, Route, Routes } from "react-router-dom";
import { AddThemePage } from "@/pages/AddThemePage";
import { AllocationPickerPage } from "@/pages/AllocationPickerPage";
import { AllocationConfirmPage } from "@/pages/AllocationConfirmPage";
import { AllocationEditorPage } from "@/pages/AllocationEditorPage";
import { HoldingsPage } from "@/pages/HoldingsPage";
import { AppShell } from "@/shell/AppShell";
import { HomePage } from "@/shell/HomePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/managed-investing" replace />} />
        <Route path="/managed-investing" element={<HomePage />} />
        <Route path="/allocation-editor" element={<AllocationEditorPage />} />
        <Route path="/allocation-confirm" element={<AllocationConfirmPage />} />
        <Route path="/add-theme" element={<AddThemePage />} />
        <Route path="/add-theme/pick" element={<AllocationPickerPage />} />
        <Route path="/holdings" element={<HoldingsPage />} />
      </Route>
    </Routes>
  );
}
