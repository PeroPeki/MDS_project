import { MISSIONS, MAX_XP } from '../data.js';
import { useApp } from '../App.jsx';
import Icon from '../components/Icon.jsx';
import MissionList from '../components/MissionList.jsx';

const ROLES = [
  { role: 'Developer', icon: 'code', text: 'Practice collaboration, estimation and daily Scrum habits.' },
  { role: 'Scrum Master', icon: 'users', text: 'Explore facilitation, team motivation and risks of gamification.' },
];

/** Hero board: done missions in Done, the next one in Doing, the rest in To do. */
function SprintBoard() {
  const { d } = useApp();
  const cols = { todo: [], doing: [], done: [] };
  MISSIONS.forEach((m, i) => {
    const done = d.completed[i];
    const col = done ? 'done' : i === d.nextIndex ? 'doing' : 'todo';
    cols[col].push(<div key={m.page} className={`mini c${i} ${done ? 'done' : ''}`}>{m.short}</div>);
  });
  const badgeCount = d.badges.filter(Boolean).length;

  return (
    <div className="progressbox">
      <span className="board-label" aria-hidden="true">your sprint board ↓</span>
      <div className="board">
        <div className="board-cols" aria-label="Missions by status">
          {[['To do', cols.todo], ['Doing', cols.doing], ['Done', cols.done]].map(([name, notes]) => (
            <div className="board-col" key={name}>
              <span>{name} <small>{notes.length}</small></span>
              <div>{notes}</div>
            </div>
          ))}
        </div>
        <div className="board-foot">
          <div className="row"><strong>Your progress</strong><span className="stat">{d.xp} / {MAX_XP} XP</span></div>
          <div className="bar"><span style={{ width: `${d.percent}%` }} /></div>
          <div className="row">
            <span className="small">Level {d.level} · {d.levelTitle}</span>
            <span className="small">{badgeCount} of 4 badges</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { go, progress, actions } = useApp();

  return (
    <section id="home" className="page active" aria-labelledby="home-title">
      <div className="hero">
        <div>
          <span className="eyebrow">a Scrum learning project</span>
          <h1 id="home-title">Gamification<br /><em>in Scrum</em></h1>
          <p>An interactive learning project about gamification in Scrum, with practical examples, a short quiz and a look at its limitations.</p>
          <div className="buttonrow">
            <button className="button" onClick={() => go('missions')}>Get started <span className="arrow" aria-hidden="true">→</span></button>
            <button className="button secondary" onClick={() => go('lesson1')}>How it works</button>
          </div>
        </div>
        <SprintBoard />
      </div>

      <div className="section-head">
        <div>
          <h2>Choose your learning path</h2>
          <p className="sub">Select your role to receive a suggested route through Sprint Quest.</p>
        </div>
      </div>
      <div className="roles">
        {ROLES.map((r) => (
          <button key={r.role} className="role" aria-pressed={progress.role === r.role} onClick={() => actions.chooseRole(r.role)}>
            <span className="icon" aria-hidden="true"><Icon name={r.icon} /></span>
            <span>
              <strong>I'm a {r.role} <span className="arrow" aria-hidden="true">→</span></strong>
              <small>{r.text}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="section-head">
        <h2>Learning missions</h2>
        <button className="button ghost" onClick={() => go('missions')}>All missions <span className="arrow" aria-hidden="true">→</span></button>
      </div>
      <MissionList id="homeMissions" headingLevel="h3" />
    </section>
  );
}
