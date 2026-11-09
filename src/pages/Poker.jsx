import { useState } from 'react';
import { ESTIMATES } from '../data.js';
import { useApp } from '../App.jsx';

export default function Poker() {
  const { notify } = useApp();
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(null);

  const submit = () => {
    if (selected === null) {
      notify('Choose an estimate first');
      return;
    }
    setSubmitted(selected);
  };

  return (
    <section id="poker" className="page active" aria-labelledby="poker-title">
      <span className="eyebrow">practice round</span>
      <h1 id="poker-title" className="page-title lesson-title">Planning Poker</h1>
      <p className="sub">Practice estimating a user story using a simplified Planning Poker exercise.</p>
      <div className="poker-grid">
        <div className="card">
          <span className="tag">User story</span>
          <h2 className="card-title">Save favorite articles</h2>
          <p className="sub">As a user, I want to save my favorite articles so that I can read them later.</p>
          <hr className="divider" />
          <strong>How does it work?</strong>
          <p className="sub">Choose how much effort this story might need. The exercise gives you a suggested estimate and explains the reasoning.</p>
        </div>
        <div className="card">
          <h2 id="estimate-title" className="card-title">Select your estimate</h2>
          <div className="estimate-buttons" role="group" aria-labelledby="estimate-title">
            {ESTIMATES.map((n) => (
              <button key={n} aria-pressed={selected === n} aria-label={n === '?' ? 'Not sure (?)' : undefined} onClick={() => setSelected(n)}>
                {n}
              </button>
            ))}
          </div>
          <button className="button" onClick={submit}>Submit estimate</button>
          <div aria-live="polite">
            {submitted !== null && (
              <div className="feedback" style={{ marginTop: 22 }}>
                Your estimate: <strong>{submitted}</strong> story points.
                <br /><br />
                Suggested discussion estimate: <strong>5 points</strong>. This story may require UI, saved state and testing.
                There is no single objectively correct answer: in real Planning Poker, the team discusses different
                assumptions before agreeing on an estimate.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
