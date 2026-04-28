import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AllocationPresetPicker,
  ConfirmationBottomSheet,
  CustomAllocationInputs,
  type CustomAllocationThemeRow,
} from "@/components/allocation";
import { PortfolioDonut } from "@/components/portfolio/PortfolioDonut";
import { useToast } from "@/toast/useToast";
import {
  CORE_PORTFOLIO_EDITOR_INTRO,
  THEME_OPTIONAL_NOTE,
} from "@/copy/wealManagedInvesting";
import { riskLevelDisplayName } from "@/constants/riskLevelDisplay";
import { THEME_CATALOGUE } from "@/constants/themeCatalogue";
import { RISK_LEVEL_ORDER } from "@/data/riskLevelCoreMix";
import {
  buildThemeAssignmentsFromPreset,
  computeCorePct,
  isThemeEligibleForRiskLevel,
  validateThemeAllocations,
  type ThemeTarget,
} from "@/lib/allocation";
import { track } from "@/lib/analytics";
import type { AllocationConfirmLocationState } from "@/navigation/allocationConfirmState";
import { segmentsFromAssignments } from "@/lib/presetDonutSegments";
import { usePortfolio } from "@/portfolio";
import type {
  AllocationPreset,
  AllocationPresetLabel,
  ManagedInvestingPortfolio,
  RiskLevel,
  ThemeId,
} from "@/types/portfolio";
import "@/pages/allocation-editor-page.css";
import "@/screens/allocation-editor-screen.css";

function serializeThemeTargets(rows: readonly ThemeTarget[]): string {
  return JSON.stringify(
    [...rows]
      .map((r) => ({ themeId: r.themeId, targetPct: r.targetPct }))
      .sort((a, b) => a.themeId.localeCompare(b.themeId))
  );
}

export type AllocationEditorScreenProps = {
  portfolio: ManagedInvestingPortfolio;
};

export function AllocationEditorScreen({ portfolio }: AllocationEditorScreenProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isRebalanceLocked, updateAllocation, updateCoreRiskLevel } = usePortfolio();

  const [activePreset, setActivePreset] = useState<AllocationPresetLabel | "custom" | null>(
    null
  );
  const [draft, setDraft] = useState<CustomAllocationThemeRow[]>([]);
  const [presetError, setPresetError] = useState<string | null>(null);
  const [coreRiskError, setCoreRiskError] = useState<string | null>(null);
  /** Themes selected via checkbox for bulk remove */
  const [selectedForRemove, setSelectedForRemove] = useState<ThemeId[]>([]);
  /** Snapshot opened in the confirmation sheet (single POST on confirm) */
  const [removeSheetPayload, setRemoveSheetPayload] = useState<
    { themeId: ThemeId; displayName: string }[] | null
  >(null);
  const [removePending, setRemovePending] = useState(false);
  const baselineInitRef = useRef(false);
  const [baseline, setBaseline] = useState<{
    themes: ThemeTarget[];
    risk: RiskLevel;
  } | null>(null);

  useEffect(() => {
    setDraft(
      portfolio.themes.map((t) => ({
        themeId: t.themeId,
        targetPct: t.targetPct,
        displayName: t.displayName,
      }))
    );
    setActivePreset(null);
    setPresetError(null);
    if (!baselineInitRef.current) {
      baselineInitRef.current = true;
      setBaseline({
        themes: portfolio.themes.map((t) => ({
          themeId: t.themeId,
          targetPct: t.targetPct,
        })),
        risk: portfolio.coreAllocation.riskLevel,
      });
    }
  }, [portfolio]);

  useEffect(() => {
    setSelectedForRemove((prev) => prev.filter((id) => draft.some((r) => r.themeId === id)));
  }, [draft]);

  const themeIds = useMemo(() => draft.map((d) => d.themeId), [draft]);

  const applyPreset = (preset: AllocationPreset | "custom") => {
    if (isRebalanceLocked) return;
    setPresetError(null);
    if (preset === "custom") {
      track("allocation_preset_selected", { preset: "custom", screen: "editor" });
      setActivePreset("custom");
      return;
    }
    const built = buildThemeAssignmentsFromPreset(themeIds, preset.themesPct);
    if (!built.ok) {
      setPresetError(built.message);
      return;
    }
    track("allocation_preset_selected", { preset: preset.label, screen: "editor" });
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

  const customPreviewSegments = useMemo(() => segmentsFromAssignments(draft), [draft]);

  const validation = validateThemeAllocations(
    draft.map(({ themeId, targetPct }) => ({ themeId, targetPct })),
    { enforceFivePctStep: activePreset === "custom" }
  );

  const corePct = computeCorePct(draft.map((d) => d.targetPct));

  const ineligibleActiveThemes = useMemo(() => {
    return portfolio.themes.filter(
      (t) => !isThemeEligibleForRiskLevel(t.themeId, portfolio.coreAllocation.riskLevel)
    );
  }, [portfolio]);

  const themesDirty =
    !!baseline &&
    serializeThemeTargets(draft) !== serializeThemeTargets(baseline.themes);
  const riskDirty =
    !!baseline && portfolio.coreAllocation.riskLevel !== baseline.risk;
  const isDirty = themesDirty || riskDirty;

  const toggleSelectForRemove = (themeId: ThemeId) => {
    if (isRebalanceLocked) return;
    setSelectedForRemove((prev) =>
      prev.includes(themeId) ? prev.filter((id) => id !== themeId) : [...prev, themeId]
    );
  };

  const selectAllForRemove = () => {
    if (isRebalanceLocked) return;
    setSelectedForRemove(draft.map((r) => r.themeId));
  };

  const clearRemoveSelection = () => setSelectedForRemove([]);

  const openRemoveSheet = () => {
    if (isRebalanceLocked || removePending) return;
    const picked = draft.filter((r) => selectedForRemove.includes(r.themeId));
    if (picked.length === 0) return;
    track("remove_themes_sheet_opened", {
      count: picked.length,
      themeIds: picked.map((p) => p.themeId).join(","),
    });
    setRemoveSheetPayload(
      picked.map(({ themeId, displayName }) => ({ themeId, displayName }))
    );
  };

  const closeRemoveSheet = () => {
    setRemoveSheetPayload(null);
  };

  const confirmRemoveThemes = () => {
    if (!removeSheetPayload?.length || isRebalanceLocked || removePending) return;
    setRemovePending(true);
    const previousDraft = draft;
    const previousPreset = activePreset;
    const removeIds = new Set(removeSheetPayload.map((p) => p.themeId));
    const next = draft
      .filter((r) => !removeIds.has(r.themeId))
      .map(({ themeId, targetPct, displayName }) => ({
        themeId,
        targetPct,
        displayName,
      }));
    const nextTargets = next.map(({ themeId, targetPct }) => ({ themeId, targetPct }));
    const removedCount = removeSheetPayload.length;
    setDraft(next);
    setActivePreset(null);
    setSelectedForRemove([]);
    closeRemoveSheet();
    track("remove_themes_confirmed", {
      count: removedCount,
      themeIds: [...removeIds].join(","),
    });
    void (async () => {
      const r = await updateAllocation({ themes: nextTargets });
      setRemovePending(false);
      if (r.success) {
        setBaseline({
          themes: nextTargets,
          risk: portfolio.coreAllocation.riskLevel,
        });
        showToast({
          message:
            removedCount === 1
              ? "Theme removed from your portfolio."
              : "Themes removed from your portfolio.",
          variant: "success",
        });
      } else {
        setDraft(previousDraft);
        setActivePreset(previousPreset);
        showToast({ message: r.message, variant: "error" });
      }
    })();
  };

  const getThemeDisplayName = useCallback(
    (id: ThemeId) =>
      draft.find((r) => r.themeId === id)?.displayName ??
      THEME_CATALOGUE.find((c) => c.themeId === id)?.displayName ??
      id,
    [draft]
  );

  const goToConfirm = () => {
    const state: AllocationConfirmLocationState = {
      action: "edit",
      assignments: draft.map(({ themeId, targetPct }) => ({ themeId, targetPct })),
    };
    track("allocation_update_continue_tapped", { action: "edit" });
    navigate("/allocation-confirm", { state });
  };

  return (
    <div className="allocation-editor-preview">
      <Link to="/managed-investing" className="allocation-editor-preview__back">
        Back
      </Link>
      <h1 className="allocation-editor-preview__title">Edit allocation</h1>

      {isRebalanceLocked ? (
        <p className="allocation-editor-preview__lock" role="alert">
          Your portfolio is rebalancing. Allocation controls stay off until this finishes.
        </p>
      ) : null}

      <div className="editor-screen__preview-donut">
        <PortfolioDonut
          totalValue={portfolio.totalValue}
          segments={segmentsFromAssignments(draft)}
          size={120}
        />
      </div>

      <div className="allocation-editor-preview__core">
        <p className="allocation-editor-preview__core-label">Core portfolio (mandatory)</p>
        <p className="allocation-editor-preview__core-intro">{CORE_PORTFOLIO_EDITOR_INTRO}</p>
        <p className="allocation-editor-preview__core-mix">
          Illustrative stock / bond mix: {portfolio.coreAllocation.stockPct}% stocks ·{" "}
          {portfolio.coreAllocation.bondPct}% bonds
        </p>
        <label className="sr-only" htmlFor="risk-level-select-editor">
          Portfolio risk level
        </label>
        <select
          id="risk-level-select-editor"
          className="allocation-editor-preview__select"
          value={portfolio.coreAllocation.riskLevel}
          disabled={isRebalanceLocked}
          onChange={(e) => {
            const level = e.target.value as RiskLevel;
            setCoreRiskError(null);
            void (async () => {
              const r = await updateCoreRiskLevel(level);
              if (!r.success) {
                setCoreRiskError(r.message);
                showToast({ message: r.message, variant: "error" });
                track("risk_level_update_failed", { level, message: r.message });
                return;
              }
              track("risk_level_updated", { level });
            })();
          }}
        >
          {RISK_LEVEL_ORDER.map((level) => (
            <option key={level} value={level}>
              {riskLevelDisplayName(level)}
            </option>
          ))}
        </select>
        {coreRiskError ? (
          <p className="allocation-editor-preview__core-error" role="alert">
            {coreRiskError}
          </p>
        ) : null}
      </div>

      <p className="allocation-editor-preview__theme-note">{THEME_OPTIONAL_NOTE}</p>

      {ineligibleActiveThemes.length > 0 ? (
        <p className="allocation-editor-preview__preset-error" role="status">
          At this risk level, these themes are not offered:{" "}
          {ineligibleActiveThemes.map((t) => t.displayName).join(", ")}. Lower your risk only if
          you plan to remove or replace them on a later screen.
        </p>
      ) : null}

      {draft.length > 0 ? (
        <>
          <p className="editor-screen__section-label">Active themes</p>
          <ul className="editor-screen__theme-list">
            {draft.map((row) => {
              const checked = selectedForRemove.includes(row.themeId);
              return (
                <li key={row.themeId} className="editor-screen__theme-row">
                  <label className="editor-screen__theme-select-label">
                    <input
                      type="checkbox"
                      className="editor-screen__theme-checkbox"
                      checked={checked}
                      disabled={isRebalanceLocked}
                      onChange={() => toggleSelectForRemove(row.themeId)}
                      aria-label={`Select ${row.displayName} for removal`}
                    />
                    <span className="editor-screen__theme-row-body">
                      <span className="editor-screen__theme-meta">{row.displayName}</span>
                      <span className="editor-screen__theme-pct">{row.targetPct}%</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="editor-screen__bulk-remove-toolbar">
            <button
              type="button"
              className="editor-screen__bulk-remove-link"
              disabled={isRebalanceLocked || draft.length === 0}
              onClick={selectAllForRemove}
            >
              Select all
            </button>
            <button
              type="button"
              className="editor-screen__bulk-remove-link"
              disabled={isRebalanceLocked || selectedForRemove.length === 0}
              onClick={clearRemoveSelection}
            >
              Clear selection
            </button>
            <button
              type="button"
              className="editor-screen__bulk-remove-primary"
              disabled={
                isRebalanceLocked || selectedForRemove.length === 0 || removePending
              }
              onClick={openRemoveSheet}
            >
              Remove selected
              {selectedForRemove.length > 0 ? ` (${selectedForRemove.length})` : ""}
            </button>
          </div>
        </>
      ) : (
        <p className="allocation-editor-preview__empty">
          You do not have any themes yet. Add a theme from the dashboard, then return here to
          adjust percentages.
        </p>
      )}

      {draft.length > 0 ? (
        <>
          <AllocationPresetPicker
            activePreset={activePreset}
            onSelect={applyPreset}
            themeIds={themeIds}
            totalValue={portfolio.totalValue}
            customPreviewSegments={customPreviewSegments}
            disabled={isRebalanceLocked}
            getThemeDisplayName={getThemeDisplayName}
          />
          {presetError ? (
            <p className="allocation-editor-preview__preset-error" role="alert">
              {presetError}
            </p>
          ) : null}

          {activePreset === "custom" ? (
            <CustomAllocationInputs rows={draft} onRowChange={onRowChange} />
          ) : null}
        </>
      ) : null}

      <p className="editor-screen__core-line">
        Core allocation (auto-adjusted): {corePct}%
      </p>

      <p
        className={`allocation-editor-preview__status${validation.valid ? " allocation-editor-preview__status--ok" : ""}`}
        aria-live="polite"
      >
        {validation.valid
          ? "Allocation passes checks."
          : "Fix the issues above before you can save."}
      </p>

      <button
        type="button"
        className="editor-screen__update"
        disabled={isRebalanceLocked || !validation.valid || !isDirty}
        onClick={() => goToConfirm()}
      >
        Update portfolio
      </button>

      <ConfirmationBottomSheet
        open={removeSheetPayload !== null && removeSheetPayload.length > 0}
        themesToRemove={removeSheetPayload}
        pending={removePending}
        onKeep={closeRemoveSheet}
        onRemove={confirmRemoveThemes}
      />
    </div>
  );
}
