import assert from 'node:assert/strict';
import { ESTIMATES, QUESTIONS, STORAGE_KEY } from '../src/data.js';
import { emptyProgress, recordQuizAnswer } from '../src/progress.js';
import { POKER_SCENARIOS } from '../src/poker.js';

/** Real keyboard/DOM integration checks using the existing isolated browser harness. */
export async function runPokerChecks({ evaluate, send, click, navigate, route, viewport, screenshot, readProgress, waitFor }) {
  let saved = { ...emptyProgress(), role: 'Scrum Master', done: { intro: true, risks: true }, opened: [0, 1, 2, 3] };
  for (const question of QUESTIONS) saved = recordQuizAnswer(saved, question.id, question.correct);
  await evaluate(`localStorage.setItem(${JSON.stringify(STORAGE_KEY)}, ${JSON.stringify(JSON.stringify(saved))})`);
  // Reload the app so its in-memory progress matches the populated saved progress.
  await navigate('poker');
  await waitFor("document.querySelector('.level-pill')?.textContent.includes('Level 5')");

  const progress = () => evaluate("Number(document.querySelector('.poker-progress [role=progressbar]').getAttribute('aria-valuenow'))");
  const title = () => evaluate("document.querySelector('#poker-story-title').textContent");
  async function key(key) {
    const params = key === 'Enter' ? { key, code: 'Enter', text: '\r', unmodifiedText: '\r', windowsVirtualKeyCode: 13 }
      : key === ' ' ? { key, code: 'Space', text: ' ', unmodifiedText: ' ', windowsVirtualKeyCode: 32 }
        : { key, code: 'Tab', windowsVirtualKeyCode: 9 };
    await send('Input.dispatchKeyEvent', { type: 'keyDown', ...params });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
  }
  async function focus(selector) {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
  }

  assert.equal(await title(), POKER_SCENARIOS[0].title);
  assert.equal(await progress(), 0);
  assert.equal(await evaluate("document.querySelector('.poker-previous').disabled"), true);
  assert.equal(await evaluate("document.querySelectorAll('.poker-story').length"), 1);
  assert.equal(await evaluate("document.querySelectorAll('.poker-feedback, .poker-summary').length"), 0);
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.estimate-buttons button')].map(button => button.getAttribute('aria-label'))"),
    ESTIMATES.map((estimate) => estimate === '?' ? 'Not sure (?)' : `${estimate} story points`));

  // Submitting without a card reveals no estimate, announces the error and focuses input.
  await focus('.poker-reveal'); await key('Enter');
  await waitFor("document.querySelector('#poker-input-error').textContent.includes('Choose an estimate')");
  assert.equal(await progress(), 0);
  assert.equal(await evaluate("document.querySelectorAll('.poker-feedback').length"), 0);
  assert.equal(await evaluate("document.activeElement === document.querySelector('.estimate-buttons button')"), true);
  await key('Tab');
  assert.equal(await evaluate("document.activeElement.getAttribute('aria-label')"), '2 story points');
  assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineWidth'), '3px');
  await key(' ');
  await waitFor("document.querySelector('.estimate-buttons button:nth-child(2)').getAttribute('aria-pressed') === 'true'");
  assert.equal(await evaluate("document.querySelector('#poker-input-error').textContent"), '');

  // A draft survives leaving its scenario. Focus follows navigation to the new story.
  await focus('.poker-next'); await key('Enter');
  await waitFor(`document.querySelector('#poker-story-title').textContent === ${JSON.stringify(POKER_SCENARIOS[1].title)}`);
  assert.equal(await evaluate('document.activeElement.id'), 'poker-story-title');
  assert.equal(await evaluate("document.querySelectorAll('.estimate-buttons [aria-pressed=true]').length"), 0);
  await focus('.estimate-buttons button:last-child'); await key('Enter');
  await focus('.poker-reveal'); await key('Enter');
  await waitFor("!!document.querySelector('.poker-feedback')");
  assert.equal(await progress(), 1);
  assert.ok(await evaluate("document.querySelector('.poker-feedback').textContent.includes('Asking for clarity')"));
  assert.equal(await evaluate("document.activeElement === document.querySelector('.poker-feedback h3')"), true);
  assert.equal(await evaluate("document.querySelector('#poker [role=status]').getAttribute('aria-live')"), 'polite');
  assert.ok(await evaluate("document.querySelector('#poker [role=status]').textContent.includes('Estimate saved')"));
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.poker-factors dt')].map(node => node.textContent)"), ['Complexity', 'Uncertainty', 'Effort']);
  for (const width of [1440, 1024, 850, 768, 375, 320]) await viewport(width);
  await viewport(375, 844); await screenshot('poker-feedback-mobile.png');
  await viewport(1440); await screenshot('poker-feedback-desktop.png');

  await click('.poker-previous');
  assert.equal(await title(), POKER_SCENARIOS[0].title);
  assert.equal(await evaluate("document.querySelector('.estimate-buttons [aria-pressed=true]').getAttribute('aria-label')"), '2 story points');
  assert.equal(await evaluate("document.querySelectorAll('.poker-feedback').length"), 0);
  await click('.poker-reveal');
  assert.equal(await progress(), 2);
  await evaluate("{ const button = document.querySelector('.poker-reveal'); for (let repeat = 0; repeat < 10; repeat++) button.click(); }");
  assert.equal(await progress(), 2);
  assert.equal(await evaluate("document.querySelectorAll('.estimate-buttons button:not(:disabled)').length"), 0);

  // Direct navigation can review a recorded estimate without adding completion.
  await click('.poker-steps button:nth-child(2)');
  assert.equal(await evaluate("document.querySelector('.estimate-buttons [aria-pressed=true]').getAttribute('aria-label')"), 'Not sure (?)');
  assert.equal(await progress(), 2);
  await click('.poker-next');
  assert.equal(await title(), POKER_SCENARIOS[2].title);
  assert.equal(await evaluate("document.querySelector('.poker-next').disabled"), true);
  assert.equal(await evaluate("document.querySelectorAll('.poker-feedback, .poker-summary').length"), 0);
  await focus('.estimate-buttons button:nth-child(7)'); await key(' ');
  await focus('.poker-reveal'); await key('Enter');
  await waitFor("!!document.querySelector('.poker-summary')");
  assert.equal(await progress(), 3);
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.poker-summary tbody td:nth-child(2)')].map(node => node.textContent)"),
    ['2 story points', 'Not sure (?)', '21 story points']);
  assert.ok(await evaluate("document.querySelector('#poker [role=status]').textContent.includes('Exercise complete')"));
  for (const width of [1440, 1024, 768, 375, 320]) await viewport(width);
  await viewport(375, 844); await screenshot('poker-summary-mobile.png');
  await viewport(1440); await screenshot('poker-summary-desktop.png');
  assert.deepEqual(await readProgress(), saved);

  // Restart works by keyboard and clears the entire exercise, never learning progress.
  await focus('.poker-restart'); await key('Enter');
  await waitFor("!document.querySelector('.poker-summary')");
  assert.equal(await title(), POKER_SCENARIOS[0].title);
  assert.equal(await progress(), 0);
  assert.equal(await evaluate("document.querySelectorAll('.estimate-buttons [aria-pressed=true], .poker-feedback').length"), 0);
  assert.equal(await evaluate('document.activeElement.id'), 'poker-story-title');
  assert.ok(await evaluate("document.querySelector('#poker [role=status]').textContent.includes('restarted')"));
  assert.deepEqual(await readProgress(), saved);
  await route('dashboard');
  assert.ok(await evaluate("document.querySelector('#dashboard').textContent.includes('140 XP')"));
  assert.equal(await evaluate("document.querySelector('.level-pill').getAttribute('aria-label')"), 'Level 5 · Scrum Pro');
  await route('missions');
  assert.ok(await evaluate("document.querySelector('.route-note').textContent.includes('Scrum Master route')"));
  assert.deepEqual(await readProgress(), saved);
  console.log('PASS Poker keyboard selection/reveal/navigation/restart, validation, three scenarios, summary, responsive layouts and unchanged saved XP/levels/badges/role');
}
