import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Accessible dropdown menu.
 * - Toggle button is the trigger.
 * - Menu closes on Escape, outside click, or item selection.
 * - Focus is trapped inside the menu while open (Tab cycling on items).
 */
export default function Dropdown({ trigger, children, align = 'right', width = 240 }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        close(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
      if (e.key === 'Tab') {
        // Focus trap inside menu
        const focusables = menuRef.current?.querySelectorAll(
          'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
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
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    // Focus first item
    setTimeout(() => {
      const first = menuRef.current?.querySelector(
        'a,button,[tabindex]:not([tabindex="-1"])'
      );
      first?.focus?.();
    }, 0);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={triggerRef}
        type="button"
        className="dropdown-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="dropdown-menu"
          style={{
            right: align === 'right' ? 0 : 'auto',
            left: align === 'left' ? 0 : 'auto',
            width,
          }}
        >
          {children({ close })}
        </div>
      )}
    </div>
  );
}
