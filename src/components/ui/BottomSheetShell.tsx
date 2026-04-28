import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { MobileDeviceRootRefContext } from "@/components/ui/mobileDeviceFrameContext";
import "@/components/ui/bottom-sheet-shell.css";

export type BottomSheetShellProps = {
  open: boolean;
  titleId?: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  );
}

/**
 * Bottom sheet frame: overlay, handle, `role="dialog"`, Escape to close.
 * When used under {@link MobileDeviceFrame}, the overlay portals to the device shell so it does
 * not cover the prototype scenarios column.
 */
export function BottomSheetShell({
  open,
  titleId: titleIdProp,
  title,
  onClose,
  children,
}: BottomSheetShellProps) {
  const deviceRootRef = useContext(MobileDeviceRootRefContext);
  const autoId = useId();
  const titleId = titleIdProp ?? `${autoId}-title`;
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = getFocusableElements(panel);
        if (focusable.length === 0) {
          e.preventDefault();
          panel.focus();
          return;
        }
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        const active = document.activeElement as HTMLElement | null;
        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 0);
    return () => {
      window.clearTimeout(t);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const mountEl = deviceRootRef?.current ?? null;
  const overlayClassName = mountEl
    ? "ml-sheet-overlay"
    : "ml-sheet-overlay ml-sheet-overlay--viewport";

  const overlay = (
    <div
      className={overlayClassName}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="ml-sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className="ml-sheet-handle" aria-hidden />
        <h2 id={titleId} className="ml-sheet-title">
          {title}
        </h2>
        <div className="ml-sheet-body">{children}</div>
      </div>
    </div>
  );

  return createPortal(overlay, mountEl ?? document.body);
}
