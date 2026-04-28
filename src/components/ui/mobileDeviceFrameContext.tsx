import { createContext, type RefObject } from "react";

/**
 * Root element of {@link MobileDeviceFrame}. Bottom sheets portal here so overlays stay inside
 * the 390px prototype frame instead of the full browser viewport.
 */
export const MobileDeviceRootRefContext = createContext<RefObject<HTMLDivElement | null> | null>(
  null
);
