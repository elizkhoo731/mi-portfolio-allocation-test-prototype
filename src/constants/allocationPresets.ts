import type { AllocationPreset } from "@/types/portfolio";

export const ALLOCATION_PRESETS: readonly AllocationPreset[] = [
  { label: "light_touch", displayLabel: "Light touch", themesPct: 10 },
  { label: "balanced", displayLabel: "Balanced", themesPct: 20 },
  { label: "emphasised", displayLabel: "Emphasised", themesPct: 30 },
] as const;
