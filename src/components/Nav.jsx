import { useEffect, useRef, useState } from 'react';
import { NAV, MISSION_PAGES } from '../data.js';
import { useApp } from '../App.jsx';
import Icon from './Icon.jsx';

/* Below 768px the page links collapse behind a "Menu" button (SCRUM-37).
   On wider screens the toggle is hidden by CSS and the links are always shown. */
export default function Nav() {
  const { page, go, d } = useApp();
  const current = MISSION_PAGES.includes(page) ? 'missions' : page;
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);
  const toggleRef = useRef(null);

  // Escape closes the menu and returns focus to the toggle; a tap outside the nav closes it too.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (e) => {
      if (!navRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  const choose = (key) => {
    setOpen(false);
    // A new page moves focus to its heading (App.jsx). Choosing the page you are
    // already on changes nothing, so keep focus on the visible toggle instead.
    if (key === page) toggleRef.current?.focus();
    go(key);
  };

  return (
    <nav aria-label="Main" ref={navRef}>
      <div className="navinner">
        <div className="brand">
          <span className="logo" aria-hidden="true"><Icon name="check" /></span> Sprint Quest
        </div>
        <button
          type="button"
          ref={toggleRef}
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="nav-toggle-bars" aria-hidden="true"><span /></span>
          <span className="sr-only">Menu</span>
        </button>
        <div className={`links ${open ? 'is-open' : ''}`} id="main-menu">
          {Object.entries(NAV).map(([key, label]) => (
            <button key={key} onClick={() => choose(key)} aria-current={key === current ? 'page' : undefined}>
              {label}
            </button>
          ))}
        </div>
        <span className="xp-pill"><Icon name="star" /> {d.xp} XP</span>
        <span className="level-pill" role="group" aria-label={`Level ${d.level} · ${d.levelTitle}`} title={d.levelTitle}>
          <span>Level {d.level}</span><span className="level-title">{d.levelTitle}</span>
        </span>
      </div>
    </nav>
  );
}
