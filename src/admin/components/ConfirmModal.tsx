import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ModalState {
  opts: ConfirmOptions;
  resolve: (v: boolean) => void;
}

function ConfirmDialog({
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmOptions & { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="adm-confirm-overlay" onClick={onCancel}>
      <div className="adm-confirm" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="adm-confirm__icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>
        <h3 className="adm-confirm__title">{title}</h3>
        <p className="adm-confirm__message">{message}</p>
        <div className="adm-confirm__actions">
          <button type="button" className="adm-confirm__btn adm-confirm__btn--cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="adm-confirm__btn adm-confirm__btn--confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const [state, setState] = useState<ModalState | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => setState({ opts, resolve }));
  }, []);

  const handleConfirm = () => { state?.resolve(true);  setState(null); };
  const handleCancel  = () => { state?.resolve(false); setState(null); };

  const modal = state ? (
    <ConfirmDialog
      {...state.opts}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, modal };
}
