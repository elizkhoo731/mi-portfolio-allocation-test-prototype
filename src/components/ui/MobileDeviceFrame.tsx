import { useRef, type ReactNode } from "react";
import { MobileDeviceRootRefContext } from "@/components/ui/mobileDeviceFrameContext";
import "@/components/ui/mobile-device-frame.css";

export function MobileDeviceFrame({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  return (
    <MobileDeviceRootRefContext.Provider value={rootRef}>
      <div className="mobile-device" ref={rootRef}>
        <div className="mobile-device__inner">{children}</div>
      </div>
    </MobileDeviceRootRefContext.Provider>
  );
}
