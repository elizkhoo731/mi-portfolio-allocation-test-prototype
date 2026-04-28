import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  AllocationDonutCoreRow,
  AllocationPresetPicker,
  CustomAllocationInputs,
  type CustomAllocationThemeRow,
} from "@/components/allocation";
import { ALLOCATION_PRESETS } from "@/constants/allocationPresets";
import { THEME_CATALOGUE } from "@/constants/themeCatalogue";
import {
  buildThemeAssignmentsFromPreset,
  isThemeEligibleForRiskLevel,
  MIN_CORE_ALLOCATION_PCT,
  validateThemeAllocations,
} from "@/lib/allocation";
import { track } from "@/lib/analytics";
import type { AllocationConfirmLocationState } from "@/navigation/allocationConfirmState";
import { getAddThemePickThemeIds } from "@/navigation/addThemePickState";
import { segmentsFromAssignments } from "@/lib/presetDonutSegments";
import type {
  AllocationPreset,
  AllocationPresetLabel,
  ManagedInvestingPortfolio,
  ThemeId,
} from "@/types/portfolio";
import "@/pages/allocation-editor-page.css";
import "@/screens/allocation-editor-screen.css";

export type AllocationPickerScreenProps = {
  portfolio: ManagedInvestingPortfolio;
  isRebalanceLocked: boolean;
};

function formatThemeListSentence(ids: readonly ThemeId[]): string {
  const labels = ids.map(
    (id) => THEME_CATALOGUE.find((t) => t.themeId === id)?.displayName ?? id
  );
  if (labels.length === 1) return labels[0]!;
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]!}`;
}

export function AllocationPickerScreen({
  portfolio,
  isRebalanceLocked,
}: AllocationPickerScreenProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const newThemeIds = getAddThemePickThemeIds(location.state);

  const [activePreset, setActivePreset] = useState<AllocationPresetLabel | "custom" | null>(null);
  const [draft, setDraft] = useState<CustomAllocationThemeRow[]>([]);
  const [presetError, setPresetError] = useState<string | null>(null);
  const initRef = useRef(false);

  const themeIds = useMemo(() => {
    if (!newThemeIds) return [] as ThemeId[];
    return [...portfolio.themes.map((t) => t.themeId), ...newThemeIds];
  }, [newThemeIds, portfolio.themes]);

  useEffect(() => {
    if (!newThemeIds || initRef.current) return;
    initRef.current = true;

    const ids = [...portfolio.themes.map((t) => t.themeId), ...newThemeIds];
    const baseRows: CustomAllocationThemeRow[] = [
      ...portfolio.themes.map((t) => ({
        themeId: t.themeId,
        targetPct: t.targetPct,
        displayName: t.displayName,
      })),
      ...newThemeIds.map((themeId) => {
        const cat = THEME_CATALOGUE.find((c) => c.themeId === themeId)!;
        return {
          themeId,
          targetPct: 5,
          displayName: cat.displayName,
        };
      }),
    ];

    const balanced = ALLOCATION_PRESETS.find((p) => p.label === "balanced");
    if (!balanced) {
      setDraft(baseRows);
      return;
    }

    const built = buildThemeAssignmentsFromPreset(ids, balanced.themesPct);
    if (built.ok) {
      setDraft(
        baseRows.map((row) => {
          const m = built.assignments.find((a) => a.themeId === row.themeId);
          return m ? { ...row, targetPct: m.targetPct } : row;
        })
      );
      setActivePreset("balanced");
    } else {
      setDraft(baseRows);
    }
  }, [newThemeIds, portfolio.themes]);

  const customPreviewSegments = useMemo(() => segmentsFromAssignments(draft), [draft]);

  const validation = useMemo(
    () =>
      validateThemeAllocations(
        draft.map(({ themeId, targetPct }) => ({ themeId, targetPct })),
        { enforceFivePctStep: activePreset === "custom" }
      ),
    [draft, activePreset]
  );

  const getThemeDisplayName = useCallback(
    (id: ThemeId) =>
      portfolio.themes.find((t) => t.themeId === id)?.displayName ??
      THEME_CATALOGUE.find((c) => c.themeId === id)?.displayName ??
      id,
    [portfolio.themes]
  );

  if (!newThemeIds) {
    return <Navigate to="/add-theme" replace />;
  }

  const activeIds = new Set(portfolio.themes.map((t) => t.themeId));
  const invalidPick =
    newThemeIds.length === 0 ||
    newThemeIds.some((id) => activeIds.has(id)) ||
    portfolio.themes.length + newThemeIds.length > 3 ||
    newThemeIds.some(
      (id) => !isThemeEligibleForRiskLevel(id, portfolio.coreAllocation.riskLevel)
    );

  if (invalidPick) {
    return <Navigate to="/add-theme" replace />;
  }

  if (isRebalanceLocked) {
    return <Navigate to="/managed-investing" replace />;
  }

  const initialized =
    draft.length === themeIds.length && themeIds.length > 0;

  const applyPreset = (preset: AllocationPreset | "custom") => {
    setPresetError(null);
    if (preset === "custom") {
      track("allocation_preset_selected", { preset: "custom", screen: "add_theme_picker" });
      setActivePreset("custom");
      return;
    }
    const built = buildThemeAssignmentsFromPreset(themeIds, preset.themesPct);
    if (!built.ok) {
      setPresetError(built.message);
      return;
    }
    track("allocation_preset_selected", {
      preset: preset.label,
      screen: "add_theme_picker",
    });
    setActivePreset(preset.label);
    setDraft((prev) =>
      prev.map((row) => {
        const match = built.assignments.find((a) => a.themeId === row.themeId);
        return match ? { ...row, targetPct: match.targetPct } : row;
      })
    );
  };

  const onRowChange = (themeId: ThemeId, targetPct: number) => {
    setActivePreset("custom");
    setDraft((prev) =>
      prev.map((r) => (r.themeId === themeId ? { ...r, targetPct } : r))
    );
  };

  const goToConfirm = () => {
    const state: AllocationConfirmLocationState = {
      action: "add",
      addThemeIds: newThemeIds,
      assignments: draft.map(({ themeId, targetPct }) => ({ themeId, targetPct })),
    };
    track("allocation_update_continue_tapped", {
      action: "add",
      addThemeCount: newThemeIds.length,
      addThemeIds: newThemeIds.join(","),
    });
    navigate("/allocation-confirm", { state });
  };

  const addedSentence = formatThemeListSentence(newThemeIds);

  if (!initialized) {
    return (
      <div className="allocation-editor-preview">
        <Link to="/add-theme" className="allocation-editor-preview__back">
          Back
        </Link>
        <h1 className="allocation-editor-preview__title">Choose allocation</h1>
        <p className="allocation-editor-preview__empty">Preparing allocation…</p>
      </div>
    );
  }

  return (
    <div className="allocation-editor-preview">
      <Link to="/add-theme" className="allocation-editor-preview__back">
        Back
      </Link>
      <h1 className="allocation-editor-preview__title">Choose allocation</h1>

      <p className="allocation-editor-preview__theme-note">
        Adding <strong>{addedSentence}</strong> to your portfolio. Pick a preset or set custom
        percentages, then continue to confirm.
      </p>

      <AllocationPresetPicker
        activePreset={activePreset}
        onSelect={applyPreset}
        themeIds={themeIds}
        totalValue={portfolio.totalValue}
        customPreviewSegments={customPreviewSegments}
        getThemeDisplayName={getThemeDisplayName}
      />

      {presetError ? (
        <p className="allocation-editor-preview__preset-error" role="alert">
          {presetError}
        </p>
      ) : null}

      {activePreset === "custom" ? (
        <>
          <AllocationDonutCoreRow
            totalValue={portfolio.totalValue}
            segments={segmentsFromAssignments(draft)}
            corePct={validation.corePct}
            coreWarning={validation.corePct < MIN_CORE_ALLOCATION_PCT}
            donutSize={112}
          />
          <CustomAllocationInputs rows={draft} onRowChange={onRowChange} />
        </>
      ) : null}

      <p
        className={`allocation-editor-preview__status${validation.valid ? " allocation-editor-preview__status--ok" : ""}`}
        aria-live="polite"
      >
        {validation.valid
          ? "Allocation passes checks."
          : "Fix the issues above before you can continue."}
      </p>

      <button
        type="button"
        className="editor-screen__update"
        disabled={!validation.valid}
        onClick={() => goToConfirm()}
      >
        Continue to confirm
      </button>
    </div>
  );
}
