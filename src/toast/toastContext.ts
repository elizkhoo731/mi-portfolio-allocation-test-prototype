import { createContext } from "react";

export type ToastVariant = "success" | "error" | "info";

export type ShowToastOptions = {
  message: string;
  variant?: ToastVariant;
  /** Auto-dismiss ms; default 4800. Set 0 to disable. */
  durationMs?: number;
};

export type ToastContextValue = {
  showToast: (opts: ShowToastOptions) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);
