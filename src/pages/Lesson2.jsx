import { PRACTICES } from '../data.js';
import { useApp } from '../App.jsx';
import LessonHeader from '../components/LessonHeader.jsx';

export default function Lesson2() {
  const { go, progress, actions } = useApp();

  return (
    <section id="lesson2" className="page active" aria-labelledby="lesson2-title">
      <LessonHeader id="lesson2-title" label="mission 2" title="Gamified practices to try in your next sprint" />
      <p className="sub">Open each practice card to learn how it works. Every new card earns +5 XP.</p>
      <div className="practice-grid">
        {PRACTICES.map((p, i) => {
          const opened = progress.opened.includes(i);
          return (
            <button key={p.title} className={`practice ${opened ? 'opened' : ''}`} onClick={() => actions.openPractice(i)}>
              <span className="tag">{p.tag}</span>
              <span className="title">{p.title}</span>
              <span className="text">{p.text}</span>
              <span className="cta">{opened ? 'Explored · +5 XP' : 'Open card, +5 XP →'}</span>
            </button>
          );
        })}
      </div>
      <div className="buttonrow">
        <button className="button" onClick={() => go('quiz')}>Continue to quiz <span className="arrow" aria-hidden="true">→</span></button>
      </div>
    </section>
  );
}
