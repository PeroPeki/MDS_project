import { useEffect, useRef } from 'react';
import { NAV, MISSION_PAGES } from '../data.js';
import { useApp } from '../App.jsx';
import Icon from './Icon.jsx';

export default function Nav() {
  const { page, go, d } = useApp();
  const current = MISSION_PAGES.includes(page) ? 'missions' : page;
  const linksRef = useRef(null);

  // keep the active tab visible in the horizontally scrolling mobile nav
  useEffect(() => {
    const links = linksRef.current;
    const btn = links?.querySelector('[aria-current="page"]');
    if (btn) links.scrollLeft = btn.offsetLeft - links.offsetLeft - (links.clientWidth - btn.offsetWidth) / 2;
  }, [current]);

  return (
    <nav aria-label="Main">
      <div className="navinner">
        <div className="brand">
          <span className="logo" aria-hidden="true"><Icon name="check" /></span> Sprint Quest
        </div>
        <div className="links" ref={linksRef}>
          {Object.entries(NAV).map(([key, label]) => (
            <button key={key} onClick={() => go(key)} aria-current={key === current ? 'page' : undefined}>
              {label}
            </button>
          ))}
        </div>
        <span className="xp-pill"><Icon name="star" /> {d.xp} XP</span>
        <span className="level-pill">Level {d.level}</span>
      </div>
    </nav>
  );
}
