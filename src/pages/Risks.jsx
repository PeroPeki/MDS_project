import { useApp } from '../App.jsx';
import LessonHeader from '../components/LessonHeader.jsx';
import ReferenceLink from '../components/ReferenceLink.jsx';
import { REFERENCES_BY_ID } from '../references.js';

const RISKS = [
  { title: 'Mixed results', text: 'Research finds that gamification effects vary by context and user.', source: REFERENCES_BY_ID['hamari-2014'] },
  { title: 'Competition over collaboration', text: 'Individual leaderboards can pit teammates against each other instead of rewarding shared outcomes.', source: REFERENCES_BY_ID['almeida-2023'] },
  { title: 'Gaming the metric', text: 'If points reward ticket counts rather than value, teams may optimize the score instead of real outcomes.', source: REFERENCES_BY_ID['almeida-2023'] },
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
            <p className="risk-citation">Source: <ReferenceLink reference={r.source} />.</p>
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
