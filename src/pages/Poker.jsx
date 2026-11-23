import { useEffect, useReducer, useRef, useState } from 'react';
import { ESTIMATES } from '../data.js';
import { emptyPokerExercise, POKER_SCENARIOS, pokerReducer } from '../poker.js';
import './Poker.css';

const estimateLabel = (estimate) => estimate === '?' ? 'Not sure (?)' : `${estimate} story points`;

export default function Poker() {
  const [exercise, dispatch] = useReducer(pokerReducer, undefined, emptyPokerExercise);
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const storyHeading = useRef(null);
  const feedbackHeading = useRef(null);
  const firstEstimate = useRef(null);
  const focusTarget = useRef(null);
  const scenario = POKER_SCENARIOS[exercise.currentIndex];
  const selected = exercise.estimates[scenario.id] ?? null;
  const revealed = exercise.revealed.includes(scenario.id);
  const completedCount = exercise.revealed.length;
  const isComplete = completedCount === POKER_SCENARIOS.length;

  useEffect(() => {
    if (focusTarget.current === 'story') storyHeading.current?.focus();
    if (focusTarget.current === 'feedback') feedbackHeading.current?.focus();
    focusTarget.current = null;
  }, [exercise]);

  function navigate(index) {
    if (index === exercise.currentIndex) return;
    focusTarget.current = 'story';
    setError('');
    setAnnouncement('');
    dispatch({ type: 'navigate', index });
  }

  function submit() {
    if (selected === null) {
      setError('Choose an estimate, including ? if you need more information, before revealing the discussion.');
      firstEstimate.current?.focus();
      return;
    }
    focusTarget.current = 'feedback';
    dispatch({ type: 'reveal' });
    setAnnouncement(`Estimate saved for ${scenario.title}. Suggested discussion estimate: ${scenario.suggestedEstimate} points.${completedCount === POKER_SCENARIOS.length - 1 ? ' Exercise complete. Your estimate summary is below.' : ''}`);
  }

  function restart() {
    focusTarget.current = 'story';
    setError('');
    setAnnouncement('Exercise restarted. All three estimates have been cleared.');
    dispatch({ type: 'restart' });
  }

  return (
    <section id="poker" className="page active poker-exercise" aria-labelledby="poker-title">
      <span className="eyebrow">estimate · reveal · reflect</span>
      <h1 id="poker-title" className="page-title lesson-title">Planning Poker</h1>
      <p className="sub">Try three user stories in this single-player practice round. Choose a card, then explore the reasoning behind a suggested estimate.</p>
      <div className="poker-principle">
        <strong>Estimate together, learn on your own.</strong>
        <p>Story points compare relative effort, complexity and uncertainty; they are not hours or objectively correct answers. In team Planning Poker, everyone estimates independently, reveals together and discusses differences. Here, the examples give you a starting point for that discussion.</p>
      </div>

      <div className="poker-progress">
        <div className="row"><strong>Your practice round</strong><span>{completedCount} / {POKER_SCENARIOS.length} stories discussed</span></div>
        <div className="bar" role="progressbar" aria-label="Planning Poker exercise progress"
          aria-valuemin={0} aria-valuemax={POKER_SCENARIOS.length} aria-valuenow={completedCount}
          aria-valuetext={`${completedCount} of ${POKER_SCENARIOS.length} stories discussed`}>
          <span style={{ width: `${completedCount / POKER_SCENARIOS.length * 100}%` }} />
        </div>
        <div className="poker-steps" role="group" aria-label="Choose a scenario">
          {POKER_SCENARIOS.map((story, index) => (
            <button type="button" key={story.id} aria-current={index === exercise.currentIndex ? 'step' : undefined}
              onClick={() => navigate(index)}>
              <span className="poker-step-number" aria-hidden="true">{index + 1}</span>
              <span>{story.title}<small>{exercise.revealed.includes(story.id) ? 'Discussed' : 'To explore'}</small></span>
            </button>
          ))}
        </div>
      </div>

      <div className="poker-grid">
        <div className="card poker-story">
          <span className="tag">User story {exercise.currentIndex + 1} of {POKER_SCENARIOS.length}</span>
          <h2 id="poker-story-title" className="card-title" tabIndex={-1} ref={storyHeading}>{scenario.title}</h2>
          <p className="poker-user-story">{scenario.story}</p>
          <hr className="divider" />
          <h3>What is included?</h3>
          <p>{scenario.scope}</p>
          <p className="small">Consider the work and unknowns. Choose ? if you need clarification before estimating.</p>
        </div>
        <div className="card poker-estimation">
          <h2 id="estimate-title" className="card-title">Select your estimate</h2>
          <p id="estimate-help" className="small">{revealed ? 'Your estimate is saved for this round. Explore another story or restart to try again.' : 'Choose one card, then reveal the discussion. Every estimate is a conversation starter.'}</p>
          <div className="estimate-buttons" role="group" aria-labelledby="estimate-title" aria-describedby="estimate-help poker-input-error">
            {ESTIMATES.map((estimate, index) => (
              <button type="button" key={estimate} ref={index === 0 ? firstEstimate : undefined}
                aria-pressed={selected === estimate} aria-label={estimateLabel(estimate)} disabled={revealed}
                onClick={() => { setError(''); dispatch({ type: 'select', estimate }); }}>
                {estimate}<span className="poker-card-state">{selected === estimate ? 'Selected' : estimate === '?' ? 'Unsure' : 'Points'}</span>
              </button>
            ))}
          </div>
          <p id="poker-input-error" className="poker-error" role="alert">{error}</p>
          <button type="button" className="button poker-reveal" onClick={submit} disabled={revealed}>
            {revealed ? 'Estimate saved' : 'Reveal discussion estimate'}
          </button>
          {revealed && (
            <div className="feedback poker-feedback">
              <h3 ref={feedbackHeading} tabIndex={-1}>Let’s discuss the estimate</h3>
              <div className="poker-estimate-comparison">
                <p>Your estimate<strong>{estimateLabel(selected)}</strong></p>
                <p>Suggested discussion estimate<strong>{scenario.suggestedEstimate} points</strong></p>
              </div>
              {selected === '?' && <p>Asking for clarity is useful. Talk through these assumptions before choosing points with your team.</p>}
              <p>{scenario.rationale}</p>
              <dl className="poker-factors">
                <div><dt>Complexity</dt><dd>{scenario.complexity}</dd></div>
                <div><dt>Uncertainty</dt><dd>{scenario.uncertainty}</dd></div>
                <div><dt>Effort</dt><dd>{scenario.effort}</dd></div>
              </dl>
              <p className="poker-reflection"><strong>Discuss with your team:</strong> {scenario.discussion}</p>
              <p className="small">A different estimate can be reasonable with different assumptions, experience or a different team baseline.</p>
            </div>
          )}
        </div>
      </div>

      <div className="poker-controls">
        <div className="buttonrow">
          <button type="button" className="button secondary poker-previous" disabled={exercise.currentIndex === 0}
            onClick={() => navigate(exercise.currentIndex - 1)}>Previous story</button>
          <button type="button" className="button poker-next" disabled={exercise.currentIndex === POKER_SCENARIOS.length - 1}
            onClick={() => navigate(exercise.currentIndex + 1)}>Next story</button>
        </div>
        <button type="button" className="button ghost poker-restart" onClick={restart}>Restart exercise</button>
      </div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>

      {isComplete && (
        <div className="card poker-summary" aria-labelledby="poker-summary-title">
          <span className="tag">Practice round complete</span>
          <h2 id="poker-summary-title" className="card-title">Three stories, three conversations</h2>
          <p>You explored all three stories. There is no score: the goal is to explain your assumptions and learn from different estimates.</p>
          <div className="poker-summary-scroll">
            <table>
              <caption>Your estimates and the suggested discussion estimates</caption>
              <thead><tr><th scope="col">User story</th><th scope="col">Your estimate</th><th scope="col">Discussion estimate</th></tr></thead>
              <tbody>{POKER_SCENARIOS.map((story) => (
                <tr key={story.id}><th scope="row">{story.title}</th><td>{estimateLabel(exercise.estimates[story.id])}</td><td>{story.suggestedEstimate} points</td></tr>
              ))}</tbody>
            </table>
          </div>
          <p className="small">Carry the reasoning into your next team discussion. Story points belong to the team’s shared understanding, not an answer key.</p>
        </div>
      )}
    </section>
  );
}
