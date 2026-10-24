import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';

/**
 * Minimal dark/light toggle stored in localStorage. Dark is default.
 * Applies via `data-theme` attribute on <html>.
 */
const KEY = 'rayan_guardian_theme_v1';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.localStorage.getItem(KEY) || 'dark';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(KEY, theme);
    }
  }, [theme]);

  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={theme === 'dark' ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'}
      title={theme === 'dark' ? 'Tema terang' : 'Tema gelap'}
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
    >
      <span aria-hidden="true" style={{ fontSize: 14 }}>
        {theme === 'dark' ? '☾' : '☀'}
      </span>
    </button>
  );
}
