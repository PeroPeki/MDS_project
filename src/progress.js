import { useEffect, useState } from 'react';
import { STORAGE_KEY, MAX_XP, QUESTIONS, PRACTICES } from './data.js';

export const emptyProgress = () => ({ role: null, done: {}, opened: [], correct: [] });

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return { ...emptyProgress(), ...saved };
  } catch {
    return emptyProgress();
  }
}

/** Progress state, saved to localStorage on every change (US-13). */
export function useProgress() {
  const [progress, setProgress] = useState(load);

  useEffect(() => {
    // localStorage can throw (private mode, storage full): progress just won't persist
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* ignore */
    }
  }, [progress]);

  return [progress, setProgress];
}

/** Everything that is calculated from the saved progress. */
export function derive(p) {
  const xp = (p.done.intro ? 10 : 0) + (p.done.risks ? 10 : 0) + p.opened.length * 5 + p.correct.length * 10;
  const completed = [!!p.done.intro, p.opened.length === PRACTICES.length, p.correct.length === QUESTIONS.length, !!p.done.risks];
  const level = xp >= 40 ? 2 : 1;
  return {
    xp,
    percent: Math.min(100, Math.round((xp / MAX_XP) * 100)),
    completed,
    badges: completed, // one badge per completed mission
    doneCount: completed.filter(Boolean).length,
    nextIndex: completed.indexOf(false), // first unfinished mission, -1 when all done
    level,
    levelTitle: level === 1 ? 'Rookie' : 'Apprentice',
    perMission: [
      p.done.intro ? 100 : 0,
      Math.round((p.opened.length / PRACTICES.length) * 100),
      Math.round((p.correct.length / QUESTIONS.length) * 100),
      p.done.risks ? 100 : 0,
    ],
  };
}
