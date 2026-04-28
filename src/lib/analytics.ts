export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

/**
 * Prototype analytics stub. Replace body with real pipeline integration later.
 */
export function track(event: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  if (import.meta.env.DEV) {
    console.info("[track]", event, payload);
  }
}
