import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ToastContext,
  type ShowToastOptions,
  type ToastVariant,
} from "@/toast/toastContext";
import "@/toast/toast.css";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
    setToasts((list) => list.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const t of timers.values()) {
        clearTimeout(t);
      }
      timers.clear();
    };
  }, []);

  const showToast = useCallback(
    (opts: ShowToastOptions) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const variant = opts.variant ?? "info";
      const durationMs = opts.durationMs ?? 4800;

      setToasts((list) => [...list, { id, message: opts.message, variant }]);

      if (durationMs > 0) {
        const timer = setTimeout(() => dismiss(id), durationMs);
        timersRef.current.set(id, timer);
      }
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="ml-toast-host" aria-label="Notifications">
        {toasts.map((t) => (
          <p
            key={t.id}
            className={`ml-toast ml-toast--${t.variant}`}
            role={t.variant === "error" ? "alert" : "status"}
          >
            {t.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
