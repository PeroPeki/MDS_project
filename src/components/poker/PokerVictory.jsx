import { useEffect, useRef } from 'react';
import { POKER_SCENARIOS } from '../../poker.js';
import Icon from '../Icon.jsx';
import InsightStars from './InsightStars.jsx';

export default function PokerVictory({ exercise, onRestart, onReview }) {
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  return (
    <section className="poker-victory poker-summary" aria-labelledby="poker-victory-title">
      <div className="poker-confetti" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => <i key={index} style={{ '--particle-x': `${5 + index * 37 % 90}%`,
          '--particle-delay': `${index % 6 * .1}s`, '--particle-turn': `${index % 2 ? 260 : -220}deg` }} />)}
      </div>
      <span className="poker-kicker">ALL THREE ROUNDS EXPLORED</span>
      <div className="poker-trophy" aria-hidden="true"><span>✦</span><Icon name="trophy" /><span>✧</span></div>
      <h2 id="poker-victory-title" ref={heading} tabIndex={-1}>You played for <em>perspective.</em></h2>
      <p className="poker-victory-intro">Three stories. Different possibilities. A better conversation.</p>
      <InsightStars count={3} victory />
      <div className="poker-pro-achievement"><Icon name="medal" /><div><small>IN-GAME ACHIEVEMENT UNLOCKED</small><strong>Poker Pro</strong><span>Curiosity was your winning hand.</span></div><Icon name="check" /></div>
      <div className="poker-summary-scroll">
        <table>
          <caption>Your round, at a glance</caption>
          <thead><tr><th scope="col">User story</th><th scope="col">Your estimate</th><th scope="col">Discussion guide</th></tr></thead>
          <tbody>{POKER_SCENARIOS.map((story, index) => <tr key={story.id}>
            <th scope="row"><span>0{index + 1}</span>{story.title}</th>
            <td>{exercise.estimates[story.id] === '?' ? 'Not sure (?)' : `${exercise.estimates[story.id]} points`}</td>
            <td>{story.suggestedEstimate} points</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="poker-victory-note">There is no perfect hand. Story points are relative estimates, not objectively correct answers. Your stars celebrate exploring every story, whatever cards you chose.</p>
      <div className="poker-victory-actions">
        <button type="button" className="poker-button is-gold poker-restart" onClick={onRestart}>Play Again <span aria-hidden="true">↻</span></button>
        <button type="button" className="poker-button is-outline poker-review" onClick={onReview}>Review the rounds <span aria-hidden="true">→</span></button>
      </div>
    </section>
  );
}
