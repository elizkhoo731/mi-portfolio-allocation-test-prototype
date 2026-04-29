import { useRef, type ReactNode } from "react";
import { MobileDeviceRootRefContext } from "@/components/ui/mobileDeviceFrameContext";
import "@/components/ui/mobile-device-frame.css";

/** Decorative status bar with notch — matches reference phone mockup */
function StatusBar() {
  return (
    <div className="phone-shell__status-bar" aria-hidden="true">
      <span className="phone-shell__time">9:41</span>
      <div className="phone-shell__notch" />
      <div className="phone-shell__status-icons">
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <rect x="0"    y="7.5" width="3" height="4.5" rx="0.75" opacity="0.35" />
          <rect x="4.5"  y="5"   width="3" height="7"   rx="0.75" opacity="0.35" />
          <rect x="9"    y="2.5" width="3" height="9.5" rx="0.75" opacity="0.35" />
          <rect x="13.5" y="0"   width="3" height="12"  rx="0.75" />
        </svg>
        {/* Wi-Fi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <circle cx="8" cy="11" r="1.5" />
          <path
            d="M4.7 7.5A4.7 4.7 0 0 1 8 6.2a4.7 4.7 0 0 1 3.3 1.3l1.3-1.4A6.6 6.6 0 0 0 8 4.3a6.6 6.6 0 0 0-4.6 1.8l1.3 1.4z"
            opacity="0.7"
          />
          <path
            d="M1.4 4.1A9.4 9.4 0 0 1 8 1.5a9.4 9.4 0 0 1 6.6 2.6L16 2.7A11.3 11.3 0 0 0 8 0 11.3 11.3 0 0 0 0 2.7l1.4 1.4z"
            opacity="0.35"
          />
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
          <rect x="0.75" y="0.75" width="20.5" height="10.5" rx="3.25"
            stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35" fill="none" />
          <rect x="22"   y="4"    width="2.5"  height="4"    rx="1.25" opacity="0.4" />
          <rect x="2"    y="2"    width="15"   height="8"    rx="2" />
        </svg>
      </div>
    </div>
  );
}

export function MobileDeviceFrame({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  return (
    <MobileDeviceRootRefContext.Provider value={rootRef}>
      <div className="phone-shell">
        {/* Physical side buttons — decorative only */}
        <div className="phone-shell__btn-vol-up"    aria-hidden="true" />
        <div className="phone-shell__btn-vol-down"  aria-hidden="true" />
        <div className="phone-shell__btn-power"     aria-hidden="true" />

        {/* Screen — portal target for bottom sheets */}
        <div className="mobile-device" ref={rootRef}>
          <StatusBar />
          <div className="mobile-device__inner">{children}</div>
          <div className="phone-shell__home-bar" aria-hidden="true" />
        </div>
      </div>
    </MobileDeviceRootRefContext.Provider>
  );
}
