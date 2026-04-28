import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@/toast/ToastProvider";
import { PortfolioProvider } from "@/portfolio";
import { AppRoutes } from "@/routes/AppRoutes";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PortfolioProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </PortfolioProvider>
    </BrowserRouter>
  </StrictMode>
);
