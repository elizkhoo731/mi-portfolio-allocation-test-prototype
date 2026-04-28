import { BottomSheetShell } from "@/components/ui/BottomSheetShell";

export type RemovalThemeLine = {
  displayName: string;
};

export type ConfirmationBottomSheetProps = {
  open: boolean;
  /** Themes queued for removal (one confirmation updates allocation once). */
  themesToRemove: readonly RemovalThemeLine[] | null;
  pending?: boolean;
  onKeep: () => void;
  onRemove: () => void;
};

/**
 * Remove-theme confirmation before posting updated allocations (single or bulk).
 */
export function ConfirmationBottomSheet({
  open,
  themesToRemove,
  pending = false,
  onKeep,
  onRemove,
}: ConfirmationBottomSheetProps) {
  const n = themesToRemove?.length ?? 0;
  const title =
    n === 0
      ? "Remove themes"
      : n === 1
        ? `Remove ${themesToRemove![0]!.displayName}?`
        : `Remove ${n} themes?`;

  return (
    <BottomSheetShell open={open} title={title} onClose={pending ? () => undefined : onKeep}>
      {n > 1 ? (
        <ul className="confirmation-sheet__theme-list">
          {themesToRemove!.map((t, i) => (
            <li key={`${t.displayName}-${i}`}>{t.displayName}</li>
          ))}
        </ul>
      ) : null}
      <p className="allocation-editor-preview__theme-note">
        Your allocation updates to Core plus any themes you keep. This change triggers one
        rebalance.
      </p>
      <div className="editor-screen__sheet-actions">
        <button
          type="button"
          className="editor-screen__sheet-btn editor-screen__sheet-btn--primary"
          disabled={pending}
          onClick={onKeep}
        >
          {n === 1 ? "Keep it" : "Keep them"}
        </button>
        <button
          type="button"
          className="editor-screen__sheet-btn editor-screen__sheet-btn--destructive"
          disabled={pending}
          onClick={onRemove}
        >
          {pending ? "Removing..." : n > 1 ? `Remove ${n} themes` : "Remove theme"}
        </button>
      </div>
    </BottomSheetShell>
  );
}
