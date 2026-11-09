import { useApp } from '../App.jsx';
import Icon from '../components/Icon.jsx';
import LessonHeader from '../components/LessonHeader.jsx';

const TOPICS = [
  { icon: 'star', title: 'Points', text: 'Instant feedback for completing activities and learning challenges.' },
  { icon: 'medal', title: 'Badges', text: 'A visible sign of something achieved, such as finishing a mission.' },
  { icon: 'chart', title: 'Leaderboards', text: 'Rankings can motivate but may encourage unhealthy competition.' },
];

export default function Lesson1() {
  const { go, progress, actions } = useApp();
  const done = progress.done.intro;

  return (
    <section id="lesson1" className="page active" aria-labelledby="lesson1-title">
      <LessonHeader id="lesson1-title" label="mission 1" title="What is gamification?" />
      <blockquote className="card lesson-quote">
        <p className="quote-text">“The use of game design elements in non-game contexts”</p>
        <cite className="small">Deterding et al. (2011)</cite>
      </blockquote>
      <p className="sub">
        Gamification does not mean playing video games at work. It means using elements like points, achievements and
        progress bars in everyday activities to increase engagement.
      </p>
      <div className="topics">
        {TOPICS.map((t) => (
          <div className="topic" key={t.title}>
            <span className="topic-icon" aria-hidden="true"><Icon name={t.icon} /></span>
            <strong>{t.title}</strong>
            <p>{t.text}</p>
          </div>
        ))}
      </div>
      <div className="buttonrow">
        <button className="button" onClick={() => { actions.complete('intro'); go('lesson2'); }}>
          {done ? 'Completed · Next mission' : 'Got it, +10 XP'} <span className="arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
