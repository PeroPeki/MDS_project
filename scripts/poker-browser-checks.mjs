import assert from 'node:assert/strict';
import { ESTIMATES, QUESTIONS, STORAGE_KEY } from '../src/data.js';
import { emptyProgress, recordQuizAnswer } from '../src/progress.js';
import { POKER_SCENARIOS } from '../src/poker.js';

/** Exercise real keyboard/touch inputs, countdown races, animation preferences and storage isolation. */
export async function runPokerChecks({ evaluate, send, click, navigate, route, viewport, screenshot, readProgress, waitFor }) {
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  let saved = { ...emptyProgress(), role: 'Scrum Master', done: { intro: true, risks: true }, opened: [0, 1, 2, 3] };
  for (const question of QUESTIONS) saved = recordQuizAnswer(saved, question.id, question.correct);
  await evaluate('localStorage.setItem(' + JSON.stringify(STORAGE_KEY) + ', ' + JSON.stringify(JSON.stringify(saved)) + ')');
  await navigate('poker');
  const storageKeys = await evaluate('Object.keys(localStorage).sort()');
  const stars = () => evaluate("parseInt(document.querySelector('.poker-hero .poker-star-icons').getAttribute('aria-label'), 10)");
  const progress = () => evaluate("Number(document.querySelector('.poker-progress [role=progressbar]').getAttribute('aria-valuenow'))");
  const title = () => evaluate("document.querySelector('#poker-story-title').textContent");
  const idle = () => evaluate('new Promise(resolve => setTimeout(resolve, 1800))');
  async function key(key) {
    const params = key === 'Enter' ? { key, code: 'Enter', text: '\r', unmodifiedText: '\r', windowsVirtualKeyCode: 13 }
      : key === ' ' ? { key, code: 'Space', text: ' ', unmodifiedText: ' ', windowsVirtualKeyCode: 32 }
        : { key, code: 'Tab', windowsVirtualKeyCode: 9 };
    await send('Input.dispatchKeyEvent', { type: 'keyDown', ...params });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
  }
  async function focus(selector) {
    await evaluate('document.querySelector(' + JSON.stringify(selector) + ').focus()');
  }
  async function assertGlobalUnchanged() {
    assert.deepEqual(await readProgress(), saved);
    assert.deepEqual(await evaluate('Object.keys(localStorage).sort()'), storageKeys);
    assert.equal(await evaluate("document.querySelector('.level-pill').getAttribute('aria-label')"), 'Level 5 · Scrum Pro');
  }

  assert.equal(await title(), POKER_SCENARIOS[0].title);
  assert.equal(await stars(), 0);
  assert.equal(await progress(), 0);
  assert.equal(await evaluate("document.querySelector('.poker-previous').disabled"), true);
  assert.equal(await evaluate("document.querySelectorAll('.poker-story').length"), 1);
  assert.equal(await evaluate("document.querySelectorAll('.poker-feedback, .poker-summary').length"), 0);
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.poker-hand-card')].map(button => button.getAttribute('aria-label'))"),
    ESTIMATES.map((estimate) => estimate === '?' ? 'Not sure (?)' : estimate + ' story points'));
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.poker-hand-card')).animationName"), 'poker-deal');
  for (const width of [1440, 1024, 768, 375, 320]) await viewport(width);
  // A tall capture viewport also paints the offscreen composited back face in headless Chrome.
  // Touch/interaction checks below use an ordinary phone-height viewport.
  await viewport(375, 2000); await screenshot('poker-table-mobile.png');
  await viewport(1440); await screenshot('poker-table-desktop.png');

  // Input validation, Tab/Space selection and visibly focused native buttons.
  await focus('.poker-reveal'); await key('Enter');
  await waitFor("document.querySelector('#poker-input-error').textContent.includes('Choose an estimate')");
  assert.equal(await stars(), 0);
  assert.equal(await evaluate("document.activeElement === document.querySelector('.poker-hand-card')"), true);
  await key('Tab');
  assert.equal(await evaluate("document.activeElement.getAttribute('aria-label')"), '2 story points');
  assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineWidth'), '3px');
  await key(' ');
  await waitFor("document.querySelector('.poker-hand-card:nth-child(2)').getAttribute('aria-pressed') === 'true'");
  assert.equal(await evaluate("document.querySelector('#poker-input-error').textContent"), '');
  assert.equal(await evaluate("document.querySelectorAll('.poker-player-seat .poker-selected-card').length"), 1);
  assert.equal(await evaluate("document.querySelectorAll('.poker-player-seat .is-face-up').length"), 0);

  // Keep a draft when moving to another story, then run the full 3-2-1 countdown.
  await focus('.poker-next'); await key('Enter');
  await waitFor('document.querySelector("#poker-story-title").textContent === ' + JSON.stringify(POKER_SCENARIOS[1].title));
  assert.equal(await evaluate('document.activeElement.id'), 'poker-story-title');
  assert.equal(await evaluate("document.querySelectorAll('.poker-hand-card[aria-pressed=true]').length"), 0);
  await focus('.poker-hand-card:last-child'); await key('Enter');
  await evaluate("{ const button = document.querySelector('.poker-reveal'); for (let repeat = 0; repeat < 20; repeat++) button.click(); }");
  await waitFor("document.querySelector('.poker-countdown strong')?.textContent === '3'");
  assert.equal(await stars(), 0);
  assert.equal(await evaluate("document.querySelectorAll('.poker-feedback').length"), 0);
  assert.equal(await evaluate("document.querySelectorAll('.poker-hand-card:not(:disabled)').length"), 0);
  await waitFor("document.querySelector('.poker-countdown strong')?.textContent === '2'");
  await waitFor("document.querySelector('.poker-countdown strong')?.textContent === '1'");
  await waitFor("!!document.querySelector('.poker-feedback')");
  assert.equal(await stars(), 1);
  assert.equal(await progress(), 1);
  assert.equal(await evaluate("document.activeElement.id"), 'poker-feedback-title');
  assert.equal(await evaluate("document.querySelectorAll('.poker-table .is-face-up').length"), 2);
  assert.ok(await evaluate("document.querySelector('.poker-feedback').textContent.includes('Asking for clarity')"));
  assert.equal(await evaluate("document.querySelector('#poker [role=status]').getAttribute('aria-live')"), 'polite');
  assert.ok(await evaluate("document.querySelector('#poker [role=status]').textContent.includes('One Insight Star earned')"));
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.poker-factor summary > span:first-child')].map(node => node.textContent)"),
    ['Complexity', 'Uncertainty', 'Effort']);
  await focus('.poker-factor summary'); await key('Enter');
  assert.equal(await evaluate("document.querySelector('.poker-factor').open"), true);
  assert.ok(await evaluate("document.querySelector('.poker-factor[open] p').textContent.length > 20"));
  for (const width of [1440, 1024, 768, 375, 320]) await viewport(width);
  await viewport(375, 844); await screenshot('poker-feedback-mobile.png');
  await viewport(1440); await screenshot('poker-feedback-desktop.png');
  await assertGlobalUnchanged();

  // Reveal the retained draft using Skip animation; disabled repeats cannot reward it again.
  await click('.poker-previous');
  assert.equal(await evaluate("document.querySelector('.poker-hand-card[aria-pressed=true]').getAttribute('aria-label')"), '2 story points');
  assert.equal(await evaluate("document.querySelectorAll('.poker-feedback').length"), 0);
  await click('.poker-reveal');
  await waitFor("!!document.querySelector('.poker-skip')");
  await focus('.poker-skip'); await key('Enter');
  await waitFor("!!document.querySelector('.poker-feedback')");
  assert.equal(await stars(), 2);
  await evaluate("{ const button = document.querySelector('.poker-reveal'); for (let repeat = 0; repeat < 20; repeat++) button.click(); }");
  assert.equal(await stars(), 2);
  assert.equal(await evaluate("document.querySelectorAll('.poker-hand-card:not(:disabled)').length"), 0);
  await click('.poker-steps button:nth-child(2)');
  assert.equal(await evaluate("document.querySelector('.poker-hand-card[aria-pressed=true]').getAttribute('aria-label')"), 'Not sure (?)');
  assert.equal(await evaluate("document.querySelector('.poker-factor').open"), true);
  assert.equal(await stars(), 2);

  // Finish with a different estimate: stars reward exploration, never matching a guide.
  await click('.poker-next');
  assert.equal(await title(), POKER_SCENARIOS[2].title);
  assert.equal(await evaluate("document.querySelector('.poker-next').disabled"), true);
  await focus('.poker-hand-card:nth-child(7)'); await key(' ');
  await focus('.poker-reveal'); await key('Enter');
  await waitFor("!!document.querySelector('.poker-skip')");
  await click('.poker-skip');
  await waitFor("!!document.querySelector('.poker-victory')");
  assert.equal(await stars(), 3);
  assert.equal(await evaluate('document.activeElement.id'), 'poker-victory-title');
  assert.equal(await evaluate("document.querySelectorAll('.poker-pro-achievement').length"), 1);
  assert.equal(await evaluate("document.querySelectorAll('.poker-confetti i').length"), 18);
  assert.ok(await evaluate("document.querySelector('#poker [role=status]').textContent.includes('Poker Pro unlocked')"));
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.poker-summary tbody td:nth-child(2)')].map(node => node.textContent)"),
    ['2 points', 'Not sure (?)', '21 points']);
  for (const width of [1440, 1024, 768, 375, 320]) await viewport(width);
  await viewport(375, 844); await screenshot('poker-victory-mobile.png');
  await viewport(1440); await screenshot('poker-victory-desktop.png');
  await assertGlobalUnchanged();

  await click('.poker-review');
  assert.equal(await stars(), 3);
  assert.equal(await evaluate('document.activeElement.id'), 'poker-story-title');
  await click('.poker-steps button:first-child');
  assert.equal(await stars(), 3);
  await click('.poker-reveal');
  assert.equal(await stars(), 3);
  await click('.poker-results');
  await focus('.poker-restart'); await key('Enter');
  await waitFor("!document.querySelector('.poker-summary')");
  assert.equal(await stars(), 0);
  assert.equal(await progress(), 0);
  assert.equal(await title(), POKER_SCENARIOS[0].title);
  assert.equal(await evaluate('document.activeElement.id'), 'poker-story-title');
  assert.equal(await evaluate("document.querySelectorAll('.poker-hand-card[aria-pressed=true], .poker-feedback').length"), 0);

  // Cancel pending timers on navigation, reset and unmount. No stale reveal may earn stars.
  await click('.poker-hand-card'); await click('.poker-reveal'); await click('.poker-next');
  await idle();
  assert.equal(await stars(), 0);
  assert.equal(await evaluate("document.querySelectorAll('.poker-countdown, .poker-feedback').length"), 0);
  await click('.poker-hand-card'); await click('.poker-reveal'); await click('.poker-restart');
  await idle();
  assert.equal(await stars(), 0);
  assert.equal(await evaluate("document.querySelectorAll('.poker-countdown, .poker-feedback').length"), 0);
  await click('.poker-hand-card'); await click('.poker-reveal'); await route('home');
  await idle(); await route('poker');
  assert.equal(await stars(), 0);
  console.log('PASS Poker card dealing, 3-2-1 reveal, flip, skipped animation, keyboard, retained drafts, local stars, victory, review and countdown cancellation');

  // Reduced motion removes the countdown, flips/transitions, rewards and confetti motion.
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await click('.poker-hand-card:last-child'); await click('.poker-reveal');
  await waitFor("!!document.querySelector('.poker-feedback')");
  assert.equal(await evaluate("document.querySelectorAll('.poker-countdown').length"), 0);
  assert.equal(await stars(), 1);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.poker-hand-card')).animationName"), 'none');
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.poker-card-rotator')).transitionDuration"), '0s');
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.poker-star-pop')).display"), 'none');
  for (const index of [2, 1]) {
    await click('.poker-steps button:nth-child(' + (index + 1) + ')');
    await click('.poker-hand-card:last-child'); await click('.poker-reveal');
  }
  await waitFor("!!document.querySelector('.poker-victory')");
  assert.equal(await stars(), 3);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.poker-confetti')).display"), 'none');
  await click('.poker-restart');

  // Touch the real card at a mobile viewport (no synthetic DOM click).
  await viewport(375, 844);
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await evaluate("document.querySelector('.poker-hand-card:nth-child(6)').scrollIntoView({ block: 'center' })");
  const point = await evaluate("{ const r = document.querySelector('.poker-hand-card:nth-child(6)').getBoundingClientRect(); ({ x: r.x + r.width / 2, y: r.y + r.height / 2 }); }");
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await waitFor("document.querySelector('.poker-hand-card:nth-child(6)').getAttribute('aria-pressed') === 'true'");
  assert.equal(await evaluate("document.querySelector('.poker-player-seat .poker-seat-caption').textContent"), '13 story points');
  await send('Emulation.setTouchEmulationEnabled', { enabled: false });
  await assertGlobalUnchanged();
  await route('dashboard');
  assert.ok(await evaluate("document.querySelector('#dashboard').textContent.includes('140 XP')"));
  await route('missions');
  assert.ok(await evaluate("document.querySelector('.route-note').textContent.includes('Scrum Master route')"));
  await assertGlobalUnchanged();
  console.log('PASS Poker reduced motion, touch, 320/375/768/desktop layouts, complete reset, unchanged XP/levels/badges/roles/localStorage and no new storage keys');
}
