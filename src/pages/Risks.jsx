import { useApp } from '../App.jsx';
import LessonHeader from '../components/LessonHeader.jsx';

const RISKS = [
  { title: 'Mixed results', text: 'Research finds that gamification effects vary by context and user. Source: Hamari et al. (2014).' },
  { title: 'Competition over collaboration', text: 'Individual leaderboards can pit teammates against each other instead of rewarding shared outcomes.' },
  { title: 'Gaming the metric', text: 'If points reward ticket counts rather than value, teams may optimize the score instead of real outcomes.' },
];

export default function Risks() {
  const { go, progress, actions } = useApp();
  const done = progress.done.risks;

  return (
    <section id="risks" className="page active" aria-labelledby="risks-title">
      <LessonHeader id="risks-title" label="mission 4" title="When gamification backfires" />
      <p className="sub">Rewards can help motivation, but badly designed incentives may hurt team collaboration.</p>
      <div className="topics">
        {RISKS.map((r) => (
          <div className="topic" key={r.title}>
            <strong>{r.title}</strong>
            <p>{r.text}</p>
          </div>
        ))}
      </div>
      <div className="buttonrow">
        <button className="button" onClick={() => { actions.complete('risks'); go('dashboard'); }}>
          {done ? 'Completed · Go to dashboard' : 'I understand the risks, +10 XP'} <span className="arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
