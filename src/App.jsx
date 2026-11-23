import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { PAGES } from './data.js';
import { useProgress, derive, emptyProgress, recordQuizAnswer, moveQuizQuestion, recordMissionCompletion, recordPracticeOpen } from './progress.js';
import { createQuizChallenge } from './quiz.js';
import Nav from './components/Nav.jsx';
import LevelUpNotice from './components/LevelUpNotice.jsx';
import Home from './pages/Home.jsx';
import Missions from './pages/Missions.jsx';
import Lesson1 from './pages/Lesson1.jsx';
import Lesson2 from './pages/Lesson2.jsx';
import Quiz from './pages/Quiz.jsx';
import Risks from './pages/Risks.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Poker from './pages/Poker.jsx';
import Bot from './pages/Bot.jsx';
import Sources from './pages/Sources.jsx';

const SCREENS = { home: Home, missions: Missions, lesson1: Lesson1, lesson2: Lesson2, quiz: Quiz, risks: Risks, dashboard: Dashboard, poker: Poker, bot: Bot, sources: Sources };

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

/* ---------- Hash routing (#missions, #quiz …) ----------
   Browser Back/Forward work, refresh keeps the page, and no server
   redirects are needed on Netlify. */
const pageFromHash = () => {
  const page = window.location.hash.slice(1);
  return page in PAGES ? page : 'home';
};

function useHashPage() {
  const [page, setPage] = useState(pageFromHash);
  useEffect(() => {
    const onChange = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const go = useCallback((next) => {
    if (!(next in PAGES)) next = 'home';
    if (window.location.hash.slice(1) !== next) window.location.hash = next;
    else setPage(next);
  }, []);
  return [page, go];
}

export default function App() {
  const [page, go] = useHashPage();
  const [progress, setProgress] = useProgress();
  const [toast, setToast] = useState({ text: '', show: false });
  const toastTimer = useRef();
  const mainRef = useRef(null);
  const firstRender = useRef(true);
  const previousCorrect = useRef(progress.correct);
  const d = derive(progress);

  const notify = useCallback((text) => {
    setToast({ text, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2400);
  }, []);

  // Notify after the state update, so rapid submissions use the actual saved reward.
  useEffect(() => {
    for (const q of progress.correct) {
      if (!previousCorrect.current.includes(q)) notify(`Correct! +${progress.quizXp[q]} XP`);
    }
    previousCorrect.current = progress.correct;
  }, [progress.correct, progress.quizXp, notify]);

  const startQuiz = useCallback(() => {
    // Prepare randomness outside the state updater (which React may invoke twice).
    const challenge = createQuizChallenge();
    setProgress((p) => p.quizChallenge ? p : { ...p, quizChallenge: challenge });
  }, [setProgress]);

  /* ---------- Actions ---------- */
  const actions = {
    startQuiz,
    chooseRole(role) {
      setProgress((p) => ({ ...p, role }));
      go('missions');
      notify(`${role} route selected`);
    },
    clearRole() {
      setProgress((p) => ({ ...p, role: null }));
      notify('Role cleared');
    },
    complete(key) {
      if (progress.done[key]) return;
      setProgress((p) => recordMissionCompletion(p, key));
      notify('+10 XP, nice!');
    },
    openPractice(i) {
      if (progress.opened.includes(i)) return;
      setProgress((p) => recordPracticeOpen(p, i));
      notify('+5 XP');
    },
    answerQuestion(q, option) {
      setProgress((p) => recordQuizAnswer(p, q, option));
    },
    moveQuizQuestion(q) {
      setProgress((p) => moveQuizQuestion(p, q));
    },
    reset() {
      if (!window.confirm('Reset all progress and badges?')) return;
      setProgress(emptyProgress());
      notify('Progress reset');
    },
  };

  // On every page change: tab title, scroll to top, move focus to the heading
  // so keyboard and screen-reader users know the "page" changed.
  useEffect(() => {
    document.title = `${PAGES[page]} | Sprint Quest`;
    window.scrollTo(0, 0);
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const heading = mainRef.current?.querySelector('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }, [page]);

  const focusMain = (e) => {
    e.preventDefault();
    const heading = mainRef.current?.querySelector('h1');
    if (heading) heading.setAttribute('tabindex', '-1');
    (heading || mainRef.current).focus();
  };

  const Screen = SCREENS[page];

  return (
    <AppContext.Provider value={{ page, go, progress, d, notify, actions }}>
      <a className="skip-link" href="#main" onClick={focusMain}>Skip to content</a>
      <Nav />
      <main className="container" id="main" tabIndex={-1} ref={mainRef}>
        <LevelUpNotice level={d.level} title={d.levelTitle} />
        <Screen key={page} />
      </main>
      <div className={`toast ${toast.show ? 'show' : ''}`} role="status" aria-live="polite">{toast.text}</div>
      <footer className="footer">
        <div className="footer-inner">
          <span><strong>Sprint Quest</strong> · Agile Methodologies, university project</span>
          <span className="hand">made by our team for MDS, 2026</span>
          <a className="footer-sources" href="#sources" aria-current={page === 'sources' ? 'page' : undefined}>Sources & references</a>
        </div>
      </footer>
    </AppContext.Provider>
  );
}
