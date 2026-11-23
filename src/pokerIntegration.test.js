import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { QUESTIONS, STORAGE_KEY } from './data.js';
import { derive, emptyProgress, loadProgress, recordQuizAnswer } from './progress.js';
import { emptyPokerExercise, pokerReducer } from './poker.js';

afterEach(() => { delete globalThis.localStorage; });

test('completing, reviewing and restarting Poker preserves saved XP, level 5, badges and role recommendations', () => {
  let progress = { ...emptyProgress(), role: 'Scrum Master', done: { intro: true, risks: true }, opened: [0, 1, 2, 3] };
  for (const question of QUESTIONS) progress = recordQuizAnswer(progress, question.id, question.correct);
  const saved = JSON.stringify(progress);
  let writes = 0;
  globalThis.localStorage = {
    getItem: (key) => key === STORAGE_KEY ? saved : null,
    setItem: () => { writes++; },
  };
  const before = derive(loadProgress());
  assert.equal(before.xp, 140);
  assert.equal(before.level, 5);
  let exercise = emptyPokerExercise();
  for (const index of [0, 2, 1]) {
    exercise = pokerReducer(exercise, { type: 'navigate', index });
    exercise = pokerReducer(exercise, { type: 'select', estimate: '?' });
    exercise = pokerReducer(exercise, { type: 'reveal' });
  }
  exercise = pokerReducer(exercise, { type: 'navigate', index: 0 });
  exercise = pokerReducer(exercise, { type: 'restart' });
  assert.deepEqual(exercise, emptyPokerExercise());
  assert.equal(writes, 0);
  assert.deepEqual(loadProgress(), progress);
  assert.deepEqual(derive(loadProgress()), before);
});
