import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ESTIMATES } from '../data.js';
import { derivePokerRewards, emptyPokerExercise, POKER_SCENARIOS, pokerReducer } from '../poker.js';
import Icon from '../components/Icon.jsx';
import PlayingCard from '../components/poker/PlayingCard.jsx';
import InsightStars from '../components/poker/InsightStars.jsx';
import PokerVictory from '../components/poker/PokerVictory.jsx';
import './Poker.css';

const estimateLabel = (estimate) => estimate === '?' ? 'Not sure (?)' : estimate + ' story points';
const ROUND_THEMES = ['A familiar change', 'Connect the pieces', 'Navigate the unknown'];
const FACTORS = [{ key: 'complexity', label: 'Complexity', icon: 'code' },
  { key: 'uncertainty', label: 'Uncertainty', icon: 'compass' }, { key: 'effort', label: 'Effort', icon: 'chart' }];

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

export default function Poker() {
  const [exercise, dispatch] = useReducer(pokerReducer, undefined, emptyPokerExercise);
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [showVictory, setShowVictory] = useState(false);
  const [recentStar, setRecentStar] = useState(null);
  const [expanded, setExpanded] = useState({});
  const reducedMotion = useReducedMotion();
  const revealInFlight = useRef(false);
  const storyHeading = useRef(null);
  const feedbackHeading = useRef(null);
  const firstEstimate = useRef(null);
  const focusTarget = useRef(null);
  const scenario = POKER_SCENARIOS[exercise.currentIndex];
  const selected = exercise.estimates[scenario.id] ?? null;
  const revealed = exercise.revealed.includes(scenario.id);
  const { insightStars, pokerPro } = derivePokerRewards(exercise);
  const isCounting = countdown !== null;

  useEffect(() => {
    if (focusTarget.current === 'story') storyHeading.current?.focus();
    if (focusTarget.current === 'feedback') feedbackHeading.current?.focus();
    focusTarget.current = null;
  }, [exercise, showVictory]);

  const finishReveal = useCallback(() => {
    if (!revealInFlight.current || revealed) return;
    revealInFlight.current = false;
    setCountdown(null);
    focusTarget.current = insightStars === 2 ? null : 'feedback';
    dispatch({ type: 'reveal' });
    setRecentStar(scenario.id);
    setAnnouncement('Estimate saved for ' + scenario.title + '. Discussion guide: ' + scenario.suggestedEstimate
      + ' points. One Insight Star earned. ' + (insightStars + 1) + ' of 3 stars.'
      + (insightStars === 2 ? ' Exercise complete. Poker Pro unlocked.' : ' Explore the reasoning below.'));
    if (insightStars === 2) setShowVictory(true);
  }, [revealed, scenario, insightStars]);

  useEffect(() => {
    if (countdown === null) return;
    if (reducedMotion) { finishReveal(); return; }
    const timer = setTimeout(() => {
      if (!revealInFlight.current) return;
      if (countdown > 1) setCountdown(countdown - 1);
      else finishReveal();
    }, 550);
    return () => clearTimeout(timer);
  }, [countdown, reducedMotion, finishReveal]);

  function cancelReveal() {
    revealInFlight.current = false;
    setCountdown(null);
  }

  function rememberExpansion(key, event) {
    const open = event.currentTarget.open;
    setExpanded((previous) => previous[key] === open ? previous : { ...previous, [key]: open });
  }

  function navigate(index) {
    if (index === exercise.currentIndex) return;
    cancelReveal();
    focusTarget.current = 'story';
    setError('');
    setAnnouncement('');
    setRecentStar(null);
    dispatch({ type: 'navigate', index });
  }

  function submit() {
    if (revealed || revealInFlight.current) return;
    if (selected === null) {
      setError('Choose an estimate, including ? if you need more information, before revealing the discussion.');
      firstEstimate.current?.focus();
      return;
    }
    revealInFlight.current = true;
    setError('');
    if (reducedMotion) finishReveal();
    else {
      setCountdown(3);
      setAnnouncement('Revealing cards. You can skip the animation.');
    }
  }

  function restart() {
    cancelReveal();
    focusTarget.current = 'story';
    setError('');
    setRecentStar(null);
    setShowVictory(false);
    setExpanded({});
    setAnnouncement('Exercise restarted. All estimates, Insight Stars and the in-game Poker Pro achievement have been reset.');
    dispatch({ type: 'restart' });
  }

  return (
    <section id="poker" className="page active poker-exercise poker-game" aria-labelledby="poker-title">
      <div className="poker-topbar">
        <span className="poker-room-brand"><span aria-hidden="true">♦</span> SPRINT QUEST <i>/</i> THE ESTIMATION ROOM</span>
        <span className="poker-session"><span /> Solo practice · 3 rounds</span>
      </div>
      <header className="poker-hero">
        <div><span className="poker-kicker">A SMALL DECK. A BIGGER PERSPECTIVE.</span>
          <h1 id="poker-title">Planning <em>Poker.</em></h1>
          <p>Play your instinct. Reveal the possibilities.<br />Discover why the conversation matters more than the number.</p>
        </div>
        <InsightStars count={insightStars} />
      </header>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>

      {pokerPro && showVictory ? <PokerVictory exercise={exercise} onRestart={restart} onReview={() => {
        focusTarget.current = 'story'; setShowVictory(false); setRecentStar(null);
      }} /> : <>
        <div className="poker-progress">
          <div className="poker-progress-caption"><span>YOUR LEARNING HAND</span><span>{insightStars} / 3 rounds explored</span></div>
          <div className="poker-progress-track" role="progressbar" aria-label="Planning Poker exercise progress"
            aria-valuemin={0} aria-valuemax={3} aria-valuenow={insightStars}
            aria-valuetext={insightStars + ' of 3 rounds explored'}>
            <span style={{ width: insightStars / 3 * 100 + '%' }} />
          </div>
          <div className="poker-steps" role="group" aria-label="Choose a round">
            {POKER_SCENARIOS.map((story, index) => (
              <button type="button" key={story.id} aria-current={index === exercise.currentIndex ? 'step' : undefined}
                onClick={() => navigate(index)} className={exercise.revealed.includes(story.id) ? 'is-explored' : ''}>
                <span className="poker-step-number" aria-hidden="true">{exercise.revealed.includes(story.id) ? <Icon name="check" /> : '0' + (index + 1)}</span>
                <span><small>ROUND 0{index + 1}<span className="poker-step-theme"> · {exercise.revealed.includes(story.id) ? 'EXPLORED' : ROUND_THEMES[index]}</span></small>{story.title}</span>
                {index === exercise.currentIndex && <span className="poker-round-dot" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>

        <div className="poker-round-layout" key={scenario.id}>
          <aside className="poker-story">
            <span className="poker-kicker">THE STORY · ROUND 0{exercise.currentIndex + 1}</span>
            <span className="poker-story-symbol" aria-hidden="true"><Icon name={['code', 'compass', 'chart'][exercise.currentIndex]} /></span>
            <h2 id="poker-story-title" tabIndex={-1} ref={storyHeading}>{scenario.title}</h2>
            <p className="poker-user-story">{scenario.story}</p>
            <details className="poker-scope" open={expanded[scenario.id + '.scope'] ?? false}
              onToggle={(event) => rememberExpansion(scenario.id + '.scope', event)}>
              <summary>What is in scope? <span aria-hidden="true">+</span></summary><p>{scenario.scope}</p>
            </details>
            <div className="poker-story-note"><Icon name="bulb" /><p>Think relative effort, complexity and uncertainty. Points are not hours.</p></div>
            <div className="poker-round-marker"><span>0{exercise.currentIndex + 1}</span> / 03 <span>{ROUND_THEMES[exercise.currentIndex]}</span></div>
          </aside>

          <div className="poker-play-area">
            <div className={'poker-table' + (revealed ? ' is-revealed' : '')} aria-label="Estimation table">
              <span className="poker-table-stamp" aria-hidden="true">SPRINT QUEST <span>♦</span> EST. 2026</span>
              <div className="poker-table-cards">
                <div className="poker-seat poker-player-seat">
                  <span className="poker-seat-label">YOUR ESTIMATE</span>
                  <div className="poker-card-space">
                    {selected === null ? <span className="poker-empty-card" aria-hidden="true"><span>+</span>YOUR CARD</span>
                      : <PlayingCard key={String(selected)} value={selected} faceUp={revealed} className="poker-selected-card" />}
                  </div>
                  <span className="poker-seat-caption">{selected === null ? 'Choose from your hand' : estimateLabel(selected)}</span>
                </div>
                <span className="poker-table-diamond" aria-hidden="true">✧</span>
                <div className="poker-seat poker-guide-seat">
                  <span className="poker-seat-label">DISCUSSION GUIDE</span>
                  <div className="poker-card-space"><PlayingCard value={revealed ? scenario.suggestedEstimate : null} faceUp={revealed} /></div>
                  <span className="poker-seat-caption">{revealed ? 'A starting point, not an answer' : 'A different perspective awaits'}</span>
                </div>
              </div>
              <span className="poker-table-motto">DIFFERENT CARDS. SHARED UNDERSTANDING.</span>
              {isCounting && <div className="poker-countdown" aria-hidden="true"><small>READY TO REVEAL?</small><strong key={countdown}>{countdown}</strong><span>A little suspense. A new perspective.</span></div>}
              {recentStar === scenario.id && <div className="poker-star-pop" aria-hidden="true"><Icon name="star" /> +1 Insight Star <small>Curiosity looks good on you.</small></div>}
            </div>

            <div className="poker-hand">
              <div className="poker-hand-heading"><h3 id="estimate-title">Your hand</h3><span id="estimate-help">{revealed ? 'Round explored. Your card is saved.' : isCounting ? 'Cards on the table…' : 'Choose a card. Trust your reasoning.'}</span></div>
              <div className="poker-hand-cards" role="group" aria-labelledby="estimate-title" aria-describedby="estimate-help poker-input-error">
                {ESTIMATES.map((estimate, index) => <button type="button" key={estimate}
                  className={'poker-hand-card' + (selected === estimate ? ' is-selected' : '')}
                  style={{ '--deal-order': index }} ref={index === 0 ? firstEstimate : undefined}
                  aria-pressed={selected === estimate} aria-label={estimateLabel(estimate)} disabled={revealed || isCounting}
                  onClick={() => { setError(''); dispatch({ type: 'select', estimate }); }}>
                  <PlayingCard value={estimate} /><span className="poker-card-state">{selected === estimate ? 'In play' : estimate === '?' ? 'Unsure' : 'Select'}</span>
                </button>)}
              </div>
              <p id="poker-input-error" className="poker-error" role="alert">{error}</p>
              <div className="poker-reveal-row">
                <span><Icon name="users" /> No right or wrong cards.<br /><small>Just better questions.</small></span>
                {isCounting ? <button type="button" className="poker-button is-gold poker-skip" onClick={finishReveal}>Skip animation <span aria-hidden="true">→</span></button>
                  : <button type="button" className="poker-button is-gold poker-reveal" onClick={submit} disabled={revealed}>
                    <Icon name={revealed ? 'check' : 'compass'} />{revealed ? 'Round explored' : 'Reveal Cards'}<span aria-hidden="true">↗</span>
                  </button>}
              </div>
            </div>
          </div>
        </div>

        {revealed && <section className="poker-feedback" aria-labelledby="poker-feedback-title">
          <div className="poker-feedback-heading"><span className="poker-kicker">THE REAL WIN IS THE REASONING</span>
            <h2 id="poker-feedback-title" tabIndex={-1} ref={feedbackHeading}>Let’s talk about <em>the why.</em></h2>
            <p>Suggested discussion estimate: <strong>{scenario.suggestedEstimate} points</strong>. {scenario.rationale}</p>
            {selected === '?' && <p className="poker-unsure-note">Asking for clarity is useful. Explore these assumptions before choosing points with your team.</p>}
          </div>
          <div className="poker-factors">
            {FACTORS.map((factor, index) => <details key={scenario.id + factor.key} className="poker-factor" style={{ '--factor-order': index }}
              open={expanded[scenario.id + '.' + factor.key] ?? false}
              onToggle={(event) => rememberExpansion(scenario.id + '.' + factor.key, event)}>
              <summary><span><Icon name={factor.icon} />{factor.label}</span><span className="poker-factor-toggle" aria-hidden="true">+</span></summary>
              <div className="poker-factor-content"><p>{scenario[factor.key]}</p></div>
            </details>)}
          </div>
          <p className="poker-reflection"><Icon name="users" /><span><strong>BRING IT TO THE TEAM</strong>{scenario.discussion}</span></p>
        </section>}

        <div className="poker-controls">
          <button type="button" className="poker-button is-outline poker-previous" disabled={exercise.currentIndex === 0}
            onClick={() => navigate(exercise.currentIndex - 1)}><span aria-hidden="true">←</span> Previous round</button>
          <span className="poker-round-position">ROUND 0{exercise.currentIndex + 1} <span>/ 03</span></span>
          {pokerPro ? <button type="button" className="poker-button is-gold poker-results" onClick={() => { cancelReveal(); setShowVictory(true); }}>View results <Icon name="trophy" /></button>
            : <button type="button" className="poker-button is-outline poker-next" disabled={exercise.currentIndex === POKER_SCENARIOS.length - 1}
              onClick={() => navigate(exercise.currentIndex + 1)}>Next round <span aria-hidden="true">→</span></button>}
        </div>
        <div className="poker-bottom-note"><p><Icon name="bulb" /> Story points are relative estimates, not objectively correct answers. Explore every round to collect all three Insight Stars.</p>
          <button type="button" className="poker-text-button poker-restart" onClick={restart}>Restart exercise ↻</button>
        </div>
      </>}
    </section>
  );
}
