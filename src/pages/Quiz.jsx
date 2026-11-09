import { useState } from 'react';
import { QUESTIONS } from '../data.js';
import { useApp } from '../App.jsx';
import LessonHeader from '../components/LessonHeader.jsx';

export default function Quiz() {
  const { go, progress, actions } = useApp();
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState(null); // index of the last wrong option
  const q = QUESTIONS[index];
  const answered = progress.correct.includes(index);
  const last = index === QUESTIONS.length - 1;

  const choose = (i) => {
    if (answered) return;
    if (i === q.correct) {
      setWrong(null);
      actions.answerCorrect(index);
    } else {
      setWrong(i);
    }
  };

  const move = (to) => {
    setWrong(null);
    setIndex(to);
  };

  return (
    <section id="quiz" className="page active" aria-labelledby="quiz-title">
      <LessonHeader id="quiz-title" label="mission 3 · quiz" title="Test your knowledge" />
      <p className="sub">Question {index + 1} of {QUESTIONS.length} · +10 XP per correct answer</p>
      <div className="bar" style={{ margin: '18px 0' }}>
        <span style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }} />
      </div>
      <div className="card question">
        <h2 id="questionText" className="question-text">{q.q}</h2>
        <div className="options" role="group" aria-labelledby="questionText">
          {q.a.map((a, i) => {
            const isCorrect = answered && i === q.correct;
            const isWrong = !answered && i === wrong;
            return (
              <button key={a} className={`option ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`} onClick={() => choose(i)}>
                {/* a symbol as well as colour, so the result is not colour-only */}
                <span className="mark">{isCorrect ? '✓ ' : isWrong ? '✗ ' : ''}</span>
                {a}
              </button>
            );
          })}
        </div>
        <div aria-live="polite">
          {answered && <div className="feedback"><strong>Correct.</strong> {q.why}</div>}
          {!answered && wrong !== null && (
            <div className="feedback bad"><strong>Not quite.</strong> Have another look and try again.</div>
          )}
        </div>
      </div>
      <div className="buttonrow row">
        <button className="button secondary" onClick={() => move(Math.max(0, index - 1))}>
          <span aria-hidden="true">←</span> Previous
        </button>
        <button className="button" onClick={() => (last ? go('dashboard') : move(index + 1))}>
          {last ? 'Finish quiz' : 'Next question'} <span className="arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
