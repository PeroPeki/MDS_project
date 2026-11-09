import { BADGES } from '../data.js';
import { useApp } from '../App.jsx';
import Icon from '../components/Icon.jsx';

export default function Dashboard() {
  const { go, d, actions } = useApp();
  const badgeCount = d.badges.filter(Boolean).length;

  const stats = [
    { icon: 'trophy', label: 'Your level', value: `Level ${d.level}`, foot: <span className="small">{d.levelTitle}</span> },
    { icon: 'star', label: 'Total XP', value: `${d.xp} XP`, foot: <div className="bar"><span style={{ width: `${d.percent}%` }} /></div> },
    { icon: 'target', label: 'Missions completed', value: `${d.doneCount} / 4`, foot: <span className="small">Keep going</span> },
    { icon: 'medal', label: 'Badges unlocked', value: `${badgeCount} / 4`, foot: <span className="small">Collect all four</span> },
  ];

  return (
    <section id="dashboard" className="page active" aria-labelledby="dashboard-title">
      <span className="eyebrow">your progress</span>
      <h1 id="dashboard-title" className="page-title lesson-title">Your dashboard</h1>
      <p className="sub">Track your progress, XP, level and achievements.</p>

      <div className="dashboard-stats">
        {stats.map((s) => (
          <div className="card" key={s.label}>
            <span className="small stat-label"><Icon name={s.icon} /> {s.label}</span>
            <div className="big-number">{s.value}</div>
            {s.foot}
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card">
          <h2 className="card-title">Your badges</h2>
          <div className="badge-grid">
            {BADGES.map((b, i) => {
              const unlocked = d.badges[i];
              return (
                <div key={b.name} className={`badge ${unlocked ? '' : 'locked'}`}>
                  <span className="symbol"><Icon name={unlocked ? b.icon : 'lock'} /></span>
                  <strong>{b.name}</strong>
                  <p>{b.text}</p>
                  <span className="small">{unlocked ? 'Unlocked' : 'Locked'}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <h2 className="card-title">Learning progress</h2>
          {d.perMission.map((p, i) => (
            <div key={i} style={{ margin: '16px 0' }}>
              <div className="row"><strong style={{ fontSize: 13 }}>Mission {i + 1}</strong><span className="small">{p}%</span></div>
              <div className="bar" style={{ marginTop: 8 }} role="progressbar" aria-label={`Mission ${i + 1}`} aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
                <span style={{ width: `${p}%` }} />
              </div>
            </div>
          ))}
          <button className="button secondary" style={{ marginTop: 15 }} onClick={() => go('missions')}>
            Continue learning <span className="arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div className="buttonrow">
        <button className="button ghost" onClick={actions.reset}>Reset saved progress</button>
      </div>
    </section>
  );
}
