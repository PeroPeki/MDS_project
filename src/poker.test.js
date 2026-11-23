import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ESTIMATES } from './data.js';
import { emptyPokerExercise, POKER_SCENARIOS, pokerReducer } from './poker.js';

const select = (state, estimate) => pokerReducer(state, { type: 'select', estimate });
const reveal = (state) => pokerReducer(state, { type: 'reveal' });
const navigate = (state, index) => pokerReducer(state, { type: 'navigate', index });

test('three distinct scenarios provide scoped stories and reasoning for discussion estimates', () => {
  assert.equal(POKER_SCENARIOS.length, 3);
  assert.equal(new Set(POKER_SCENARIOS.map((scenario) => scenario.id)).size, 3);
  assert.equal(POKER_SCENARIOS[0].title, 'Save favorite articles');
  assert.equal(POKER_SCENARIOS[0].suggestedEstimate, 5);
  assert.deepEqual(ESTIMATES, [1, 2, 3, 5, 8, 13, 21, '?']);
  for (const scenario of POKER_SCENARIOS) {
    assert.ok(ESTIMATES.includes(scenario.suggestedEstimate));
    for (const field of ['story', 'scope', 'complexity', 'uncertainty', 'effort', 'rationale', 'discussion']) {
      assert.ok(scenario[field].length > 20, `${scenario.id} needs meaningful ${field}`);
    }
  }
});

test('revealing requires a selected card and never completes an unestimated story', () => {
  const initial = emptyPokerExercise();
  assert.strictEqual(reveal(initial), initial);
  const drafted = select(initial, 13);
  assert.deepEqual(drafted.revealed, []);
  assert.deepEqual(reveal(drafted).revealed, [POKER_SCENARIOS[0].id]);
  assert.deepEqual(initial, emptyPokerExercise());
});

test('only the exact supported cards are valid, including unsure; numeric strings are rejected', () => {
  for (const invalid of [null, undefined, 0, -1, 4, 100, '5', '', '??', NaN, {}, []]) {
    const state = emptyPokerExercise();
    assert.strictEqual(select(state, invalid), state);
  }
  for (const estimate of ESTIMATES) {
    const state = reveal(select(emptyPokerExercise(), estimate));
    assert.equal(state.estimates[POKER_SCENARIOS[0].id], estimate);
    assert.equal(state.revealed.length, 1);
  }
});

test('navigation retains unrevealed drafts and already discussed estimates independently', () => {
  const [first, second] = POKER_SCENARIOS;
  let state = select(emptyPokerExercise(), 8);
  state = navigate(state, 1);
  assert.equal(state.currentIndex, 1);
  assert.equal(state.estimates[second.id], undefined);
  state = reveal(select(state, '?'));
  const before = structuredClone(state);
  state = navigate(state, 0);
  assert.equal(state.estimates[first.id], 8);
  assert.deepEqual(state.revealed, [second.id]);
  state = reveal(select(state, 5));
  state = navigate(state, 1);
  assert.equal(state.estimates[second.id], '?');
  assert.deepEqual(before.estimates, { [first.id]: 8, [second.id]: '?' });
  assert.deepEqual(before.revealed, [second.id]);
});

test('invalid navigation cannot leave the exercise or change its estimates', () => {
  const state = select(emptyPokerExercise(), 3);
  for (const index of [-1, 3, 99, 0.5, '1', null, undefined, NaN, 0]) {
    assert.strictEqual(navigate(state, index), state);
  }
});

test('repeated reveals and card changes after revealing cannot alter a recorded estimate', () => {
  const state = reveal(select(emptyPokerExercise(), 21));
  for (let repeat = 0; repeat < 20; repeat++) {
    assert.strictEqual(reveal(state), state);
    assert.strictEqual(select(state, 2), state);
  }
  assert.equal(state.estimates[POKER_SCENARIOS[0].id], 21);
  assert.equal(state.revealed.length, 1);
});

test('all stories can be completed in any order, without matching the suggested estimates', () => {
  let state = emptyPokerExercise();
  for (const index of [2, 0, 1]) state = reveal(select(navigate(state, index), '?'));
  assert.equal(state.revealed.length, 3);
  for (const scenario of POKER_SCENARIOS) assert.equal(state.estimates[scenario.id], '?');
});

test('restart clears navigation, drafts and revealed estimates without mutating the previous round', () => {
  let state = reveal(select(emptyPokerExercise(), 5));
  state = select(navigate(state, 2), 8);
  const snapshot = structuredClone(state);
  const restarted = pokerReducer(state, { type: 'restart' });
  assert.deepEqual(restarted, emptyPokerExercise());
  assert.deepEqual(state, snapshot);
  assert.notStrictEqual(restarted.estimates, state.estimates);
  assert.notStrictEqual(restarted.revealed, state.revealed);
});
