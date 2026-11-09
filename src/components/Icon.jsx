/* One line-icon set for the whole site (24x24, stroked). */
const PATHS = {
  star: <path d="M12 2.8l2.8 5.8 6.4.8-4.7 4.4 1.2 6.3L12 17l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8L12 2.8Z" />,
  code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5" />
      <path d="M15.5 5a3 3 0 0 1 0 6M17.5 14.6c1.8.7 2.9 2.3 3.3 4.9" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="15" r="5.2" />
      <path d="M8.6 10.8 6 3h4l2 5.2L14 3h4l-2.6 7.8" />
    </>
  ),
  chart: <path d="M5 20v-8M11 20V5M17 20v-5M3 20h18" />,
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5a3 3 0 0 0 3.2 4.2M16 6h3a3 3 0 0 1-3.2 4.2M12 13v4M8.5 20.5h7M10 17h4v3.5h-4z" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r=".6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  flag: <path d="M5 21V4M5 4h12l-2.5 4.5L17 13H5" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  cap: (
    <>
      <path d="m2.5 9 9.5-4.5L21.5 9 12 13.5 2.5 9Z" />
      <path d="M6.5 11v4.5c1.5 1.5 3.5 2.2 5.5 2.2s4-.7 5.5-2.2V11M21.5 9v5" />
    </>
  ),
  bulb: <path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />,
};

export default function Icon({ name }) {
  return (
    <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {PATHS[name]}
    </svg>
  );
}
