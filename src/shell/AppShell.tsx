import { Outlet } from "react-router-dom";
import "@/shell/app-shell.css";

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <h1 className="app-shell__title">Managed Investing</h1>
        <p className="app-shell__subtitle">Portfolio allocation prototype</p>
      </header>
      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  );
}
