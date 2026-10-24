/**
 * Minimal inline-SVG icon set. No external library.
 * Decorative by default (aria-hidden). Add title via `label` prop.
 */
const ICONS = {
  menu: (
    <path d="M3 6h18M3 12h18M3 18h18" />
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  home: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />,
  devices: <path d="M4 6h12v10H4zM20 8v10M4 20h12" />,
  link: <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />,
  download: <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" />,
  logs: <path d="M4 4h16v4H4zM4 12h16M4 20h16" />,
  settings: <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8 4 2 2-2 2-2-2m-4 6-2 2-2-2 2-2M4 12l2-2 2 2-2 2m4-10-2-2 2-2 2 2" />,
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 8a8 8 0 0 1 16 0" />,
  logout: <path d="M9 3H4v18h5M16 17l5-5-5-5M21 12H9" />,
  api: <path d="M4 7h16M4 12h10M4 17h16" />,
  refresh: <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4" />,
  check: <path d="M5 12l5 5L20 7" />,
  alert: <path d="M12 3 2 21h20L12 3zm0 6v6m0 3v.5" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  edit: <path d="M4 20h4l10-10-4-4L4 16v4zM14 6l4 4" />,
  search: <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5" />,
  wifi: <path d="M5 12a10 10 0 0 1 14 0M8 15a6 6 0 0 1 8 0M12 18v.5" />,
};

export default function Icon({ name, size = 18, label, className = '', ...rest }) {
  const path = ICONS[name];
  if (!path) return null;
  const ariaProps = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true };
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...ariaProps}
      {...rest}
    >
      {path}
    </svg>
  );
}
