import { useApp } from '../App.jsx';
import Icon from '../components/Icon.jsx';
import MissionList from '../components/MissionList.jsx';

export default function Missions() {
  const { progress, d } = useApp();

  return (
    <section id="missions" className="page active" aria-labelledby="missions-title">
      <div className="section-head">
        <div>
          <h1 id="missions-title" className="page-title">Learning missions</h1>
          <p className="sub">
            Complete four missions, earn XP and unlock badges. {progress.role && `Your role: ${progress.role}.`}
          </p>
        </div>
      </div>
      <div className="side-grid">
        <MissionList id="missionList" headingLevel="h2" />
        <div className="card tracker">
          <strong>Your learning path</strong>
          <div className="circle" style={{ '--angle': `${(d.doneCount / 4) * 360}deg` }}>
            <div><strong>{d.doneCount} / 4</strong><span className="small">Missions</span></div>
          </div>
          <div>
            {d.completed.map((done, i) => (
              <p key={i} className={`small checklist-item ${done ? 'done' : ''}`}>
                <span className="dot" aria-hidden="true">{done && <Icon name="check" />}</span>
                Mission {i + 1}: {done ? 'complete' : 'not started'}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
