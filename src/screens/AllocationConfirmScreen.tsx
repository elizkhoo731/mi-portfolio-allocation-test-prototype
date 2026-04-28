import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/toast/useToast";
import { THEME_CATALOGUE } from "@/constants/themeCatalogue";
import { computeCorePct, validateThemeAllocations } from "@/lib/allocation";
import { track } from "@/lib/analytics";
import {
  isAllocationConfirmState,
  type AllocationConfirmLocationState,
} from "@/navigation/allocationConfirmState";
import { usePortfolio } from "@/portfolio";
import type { ThemeId } from "@/types/portfolio";
import "@/pages/allocation-editor-page.css";
import "@/screens/allocation-editor-screen.css";

function themeLabel(themeId: ThemeId): string {
  return THEME_CATALOGUE.find((t) => t.themeId === themeId)?.displayName ?? themeId;
}

function formatThemeListSentence(ids: readonly ThemeId[]): string {
  const labels = ids.map((id) => themeLabel(id));
  if (labels.length === 1) return labels[0]!;
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]!}`;
}

export function AllocationConfirmScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { updateAllocation, isRebalanceLocked, refreshPortfolio } = usePortfolio();
  const [postError, setPostError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const state = location.state as unknown;
  const valid = isAllocationConfirmState(state) ? state : null;

  const validation = useMemo(() => {
    if (!valid) return null;
    return validateThemeAllocations(valid.assignments, { enforceFivePctStep: false });
  }, [valid]);

  if (!valid || !validation?.valid) {
    return <Navigate to="/managed-investing" replace />;
  }

  const body: AllocationConfirmLocationState = valid;
  const corePct = computeCorePct(body.assignments.map((a) => a.targetPct));
  const isAdd = body.action === "add";
  const addedHeadline = isAdd
    ? `You are adding ${formatThemeListSentence(body.addThemeIds)} to your portfolio.`
    : null;

  const onConfirm = () => {
    if (isRebalanceLocked || pending) return;
    setPostError(null);
    setPending(true);
    track("allocation_confirm_submitted", {
      action: body.action,
      themesCount: body.assignments.length,
    });
    void (async () => {
      const r = await updateAllocation({ themes: body.assignments });
      setPending(false);
      if (r.success) {
        track("allocation_confirm_success", {
          action: body.action,
          themesCount: body.assignments.length,
        });
        showToast({
          message:
            body.action === "add"
              ? body.addThemeIds.length > 1
                ? "Themes added. Rebalancing may be in progress."
                : "Theme added. Rebalancing may be in progress."
              : "Allocation updated. Rebalancing may be in progress.",
          variant: "success",
        });
        navigate("/managed-investing", { replace: true });
        return;
      }
      await refreshPortfolio();
      track("allocation_confirm_failed", { action: body.action, message: r.message });
      setPostError(r.message);
      showToast({
        message: r.message,
        variant: "error",
      });
    })();
  };

  const onCancel = () => {
    track("allocation_confirm_cancelled", { action: body.action });
    navigate(-1);
  };

  return (
    <div className="allocation-editor-preview">
      <Link to="/managed-investing" className="allocation-editor-preview__back">
        Back
      </Link>
      <h1 className="allocation-editor-preview__title">
        {isAdd
          ? body.addThemeIds.length > 1
            ? "Confirm new themes"
            : "Confirm new theme"
          : "Confirm allocation"}
      </h1>

      {addedHeadline ? (
        <p className="allocation-editor-preview__theme-note" role="status">
          {addedHeadline}
        </p>
      ) : null}

      <p className="allocation-editor-preview__theme-note">
        Review your theme targets below. Confirming will update your portfolio and may start a
        rebalance. This is a prototype: changes apply against mock data only.
      </p>

      {body.assignments.length === 0 ? (
        <p className="allocation-editor-preview__empty">No theme sleeves — 100% core.</p>
      ) : (
        <ul className="editor-screen__theme-list">
          {body.assignments.map((row) => (
            <li key={row.themeId} className="editor-screen__theme-row">
              <div>
                <div className="editor-screen__theme-meta">{themeLabel(row.themeId)}</div>
                <div className="editor-screen__theme-pct">{row.targetPct}%</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="editor-screen__core-line">Core allocation after update: {corePct}%</p>

      {postError ? (
        <p className="allocation-editor-preview__preset-error" role="alert">
          {postError}
        </p>
      ) : null}

      <div className="editor-screen__sheet-actions">
        <button
          type="button"
          className="editor-screen__sheet-btn editor-screen__sheet-btn--primary"
          disabled={pending}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="editor-screen__update"
          disabled={isRebalanceLocked || pending}
          onClick={onConfirm}
        >
          {pending ? "Saving…" : "Confirm"}
        </button>
      </div>
    </div>
  );
}
