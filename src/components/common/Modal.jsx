import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

export default function Modal({
  open,
  title,
  children,
  footer,
  onClose,
  size = 'md',
  closable = true,
}) {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previouslyFocused.current = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape' && closable) onClose?.();
      if (e.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll(
          'a,button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const first = dialogRef.current?.querySelector(
        'button,input,select,textarea,a[href]'
      );
      first?.focus?.();
    }, 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused.current?.focus?.();
    };
  }, [open, closable, onClose]);

  if (!open) return null;
  const maxWidth = size === 'sm' ? 400 : size === 'lg' ? 720 : 560;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && closable) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{ maxWidth }}
      >
        <div className="modal-head">
          <h3 id="modal-title">{title}</h3>
          {closable && (
            <button
              type="button"
              className="icon-btn"
              onClick={onClose}
              aria-label="Tutup dialog"
            >
              <Icon name="close" size={18} />
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-actions">{footer}</div>}
      </div>
    </div>
  );
}
