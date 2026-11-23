// Optional browser QA: start Vite, then run npm run test:browser.
// Uses installed Chrome/Edge and Node 22 built-ins; never touches your normal browser profile.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { QUESTIONS, STORAGE_KEY } from '../src/data.js';
import { derive, emptyProgress, recordQuizAnswer } from '../src/progress.js';
import { runPokerChecks } from './poker-browser-checks.mjs';
import { runReferencesChecks } from './references-browser-checks.mjs';

const base = process.env.SPRINT_QUEST_URL || 'http://localhost:5173';
const executable = [process.env.SPRINT_QUEST_BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium'].find((candidate) => candidate && existsSync(candidate));
assert.ok(executable, 'Install Chrome/Edge or set SPRINT_QUEST_BROWSER to an existing Chromium executable.');
assert.equal((await fetch(base)).status, 200, 'Start the Vite server first (npm run dev).');
const profile = await mkdtemp(path.join(tmpdir(), 'sprintquest-quiz-ui-profile-'));
const artifacts = await mkdtemp(path.join(tmpdir(), 'sprintquest-quiz-ui-screens-'));
const browser = spawn(executable, ['--headless=new', '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--disable-gpu', '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let socket;
let serial = 0;
let sessionId;
const pending = new Map();
const runtimeErrors = [];
const consoleErrors = [];

function send(method, params = {}, session = sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++serial;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 30000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }));
  });
}
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || 'Browser evaluation failed');
  return response.result.value;
}
async function waitFor(expression) {
  const end = Date.now() + 8000;
  while (Date.now() < end) {
    if (await evaluate(expression)) return;
    await delay(40);
  }
  throw new Error(`Timed out waiting for ${expression}`);
}
const storage = `JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}))`;
const readProgress = () => evaluate(storage);
async function click(selector) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  await delay(50);
}
async function navigate(page = 'quiz') {
  // Force a real document reload even when the URL has not changed.
  await send('Page.navigate', { url: 'about:blank' });
  await send('Page.navigate', { url: `${base}/#${page}` });
  await waitFor(page === 'quiz' ? "!!document.querySelector('.quiz-game-card, .quiz-victory')" : `!!document.querySelector('#${page}')`);
}
async function route(page) {
  await evaluate(`window.location.hash = ${JSON.stringify(page)}`);
  await waitFor(page === 'quiz' ? "!!document.querySelector('.quiz-game-card, .quiz-victory')" : `!!document.querySelector('#${page}')`);
}
async function viewport(width, height = 1000) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await delay(80);
  assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), `Horizontal overflow at ${width}px`);
}
async function screenshot(name) {
  await delay(900); // Capture the settled card/stars rather than an animation's first frame.
  await evaluate('window.scrollTo(0, 0)');
  const { cssContentSize } = await send('Page.getLayoutMetrics');
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: cssContentSize.width, height: cssContentSize.height, scale: 1 } });
  await writeFile(path.join(artifacts, name), Buffer.from(data, 'base64'));
}
async function move(position) {
  await click(`.quiz-map-step:nth-child(${position + 1})`);
  const progress = await readProgress();
  assert.equal(progress.quizChallenge.currentQuestionId, progress.quizChallenge.questionOrder[position]);
}
async function answer(correct, repeat = 1, keyboard = false) {
  const before = await readProgress();
  const id = before.quizChallenge.currentQuestionId;
  const q = QUESTIONS.find((question) => question.id === id);
  const option = correct ? q.correct : (q.correct + 1) % q.a.length;
  const position = before.quizChallenge.answerOrder[id].indexOf(option);
  const selector = `.quiz-answer:nth-child(${position + 1})`;
  if (keyboard) {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', unmodifiedText: '\r', windowsVirtualKeyCode: 13 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  } else {
    await evaluate(`{ const button = document.querySelector(${JSON.stringify(selector)}); for(let i=0;i<${repeat};i++) button.click(); }`);
  }
  await waitFor(`${storage}.quizAttempts[${JSON.stringify(id)}] > ${before.quizAttempts[id] ?? 0}`);
  return { id, progress: await readProgress() };
}

try {
  let debugPort;
  for (let i = 0; i < 150; i++) {
    try { debugPort = (await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n'); break; }
    catch { await delay(100); }
  }
  assert.ok(debugPort, 'Headless browser did not start.');
  socket = new WebSocket(`ws://127.0.0.1:${debugPort[0]}${debugPort[1]}`);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      const entry = pending.get(message.id);
      clearTimeout(entry.timeout); pending.delete(message.id);
      if (message.error) entry.reject(new Error(message.error.message)); else entry.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      consoleErrors.push(message.params.args.map((argument) => argument.value ?? argument.description ?? '').join(' '));
    }
    if (message.method === 'Fetch.requestPaused') {
      // Optional local transport bridge for environments where headless browser loopback is restricted.
      fetch(message.params.request.url).then(async (response) => send('Fetch.fulfillRequest', {
        requestId: message.params.requestId, responseCode: response.status,
        responseHeaders: [{ name: 'Content-Type', value: response.headers.get('content-type') || 'application/octet-stream' }],
        body: Buffer.from(await response.arrayBuffer()).toString('base64'),
      })).catch((error) => console.error('Local request bridge:', error.message));
    }
    if (message.method === 'Page.javascriptDialogOpening') send('Page.handleJavaScriptDialog', { accept: true }).catch(() => {});
  });
  const target = await send('Target.createTarget', { url: 'about:blank' }, null);
  sessionId = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true }, null)).sessionId;
  await send('Page.enable'); await send('Runtime.enable');
  // Keep local QA independent of the existing site's optional Google Fonts network request.
  await send('Network.enable');
  await send('Network.setBlockedURLs', { urls: ['https://fonts.googleapis.com/*', 'https://fonts.gstatic.com/*'] });
  if (process.env.SPRINT_QUEST_BRIDGE) await send('Fetch.enable', { patterns: [{ urlPattern: `${base}/*`, requestStage: 'Request' }] });
  await viewport(1440);
  await send('Page.navigate', { url: 'data:text/html,<h1>Browser ready</h1>' });
  assert.equal(await evaluate('document.querySelector("h1").textContent'), 'Browser ready');
  console.log('Headless browser connected. Opening local quiz…');
  await navigate();
  const initial = await readProgress();
  assert.equal(new Set(initial.quizChallenge.questionOrder).size, 10);
  assert.equal(await evaluate('document.activeElement.id'), 'quiz-question');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  assert.ok(await evaluate("document.activeElement.classList.contains('quiz-answer')"), 'Tab reaches answer buttons');
  assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineWidth'), '3px');
  assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineColor'), 'rgb(35, 98, 78)');
  await screenshot('quiz-desktop.png');
  for (const width of [1280, 1024, 768, 390, 320]) await viewport(width);
  await viewport(390, 844); await screenshot('quiz-mobile.png'); await viewport(1440);
  console.log('PASS desktop/tablet/mobile layout, keyboard navigation and visible focus');

  const first = await answer(true, 20);
  assert.equal(first.progress.quizAttempts[first.id], 1);
  assert.equal(first.progress.quizXp[first.id], 10);
  assert.ok(await evaluate("document.querySelector('.quiz-xp-pop').textContent.includes('+10 XP')"));
  assert.ok(await evaluate("document.activeElement.classList.contains('is-primary')"));
  await move(1);
  const wrong = await answer(false, 1, true);
  assert.equal(await evaluate("document.querySelectorAll('.quiz-answer.is-correct').length"), 0);
  await navigate();
  assert.deepEqual((await readProgress()).quizChallenge, wrong.progress.quizChallenge);
  assert.ok(await evaluate("!!document.querySelector('.quiz-answer.is-wrong')"));
  const second = await answer(true);
  assert.equal(second.progress.quizXp[second.id], 5);
  await move(2); await answer(false); await answer(false);
  const third = await answer(true);
  assert.equal(third.progress.quizXp[third.id], 0);
  assert.ok(await evaluate("document.querySelector('.quiz-answer-feedback').textContent.includes('Keep learning!')"));
  await route('dashboard');
  assert.ok(await evaluate("document.querySelector('#dashboard').textContent.includes('15 XP')"));
  await route('quiz');
  assert.equal((await readProgress()).quizChallenge.currentQuestionId, third.id);
  assert.equal(await evaluate("document.querySelectorAll('.quiz-xp-pop').length"), 0);
  assert.equal(await evaluate("document.querySelectorAll('.quiz-victory').length"), 0);
  console.log('PASS 10 / 5 / 0 XP, repeated clicks, wrong-answer persistence, navigation and dashboard totals');

  await route('home');
  await click('.roles .role:nth-child(2)');
  await waitFor("!!document.querySelector('.route-note')");
  assert.ok(await evaluate("document.querySelector('.route-note').textContent.includes('Scrum Master route')"));
  assert.deepEqual(await evaluate("[...document.querySelectorAll('#missionList .number')].map((el) => el.textContent)"), ['#1', '#4', '#2', '#3']);
  assert.ok(await evaluate("[...document.querySelectorAll('.tracker .checklist-item')].some((el) => el.textContent.includes('Mission 3: in progress (30%)'))"));
  await click('.route-actions button:first-child');
  assert.equal((await readProgress()).role, 'Developer');
  assert.deepEqual(await evaluate("[...document.querySelectorAll('#missionList .number')].map((el) => el.textContent)"), ['#1', '#2', '#3', '#4']);
  await click('.route-actions button:last-child');
  assert.equal((await readProgress()).role, null);
  assert.equal(derive(await readProgress()).quizXp, 15);
  await route('quiz');
  assert.equal((await readProgress()).quizChallenge.currentQuestionId, third.id);
  console.log('PASS teammate role selection, switching, clearing, mission ordering and 0-XP in-progress tracking');

  await move(9); await answer(true);
  assert.ok(await evaluate("document.querySelector('.quiz-navigation .is-primary').textContent.includes('Find next question')"));
  await click('.quiz-navigation .is-primary');
  for (let position = 0; position < 10; position++) {
    const progress = await readProgress();
    if (progress.correct.includes(progress.quizChallenge.questionOrder[position])) continue;
    await move(position); await answer(true);
  }
  await waitFor("!!document.querySelector('.quiz-victory')");
  const completed = await readProgress();
  assert.equal(derive(completed).quizXp, 85);
  assert.equal(await evaluate("document.querySelector('.quiz-stars').getAttribute('aria-label')"), '2 out of 3 stars');
  assert.equal(await evaluate("document.querySelectorAll('.quiz-victory-badge').length"), 1);
  assert.equal(await evaluate('document.activeElement.id'), 'quiz-victory-title');
  await screenshot('victory-desktop.png');
  for (const width of [1280, 768, 390, 320]) await viewport(width);
  await viewport(390, 844); await screenshot('victory-mobile.png');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.quiz-confetti')).display"), 'none');
  await click('.quiz-text-button');
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.quiz-game-card')).animationName"), 'none');
  assert.equal(await evaluate("document.querySelectorAll('.quiz-answer:not(:disabled)').length"), 0);
  assert.deepEqual(await readProgress(), completed);
  await click('.quiz-navigation .is-primary'); await navigate();
  assert.ok(await evaluate("!!document.querySelector('.quiz-victory')"));
  assert.deepEqual(await readProgress(), completed);
  console.log('PASS victory eligibility, 2-star results, badge, review/reload without rewards and reduced motion');

  // Complete a zero-XP challenge using the same mechanics, then check its rendered results.
  let zero = emptyProgress();
  for (const q of QUESTIONS) {
    for (let i = 0; i < 2; i++) zero = recordQuizAnswer(zero, q.id, (q.correct + 1) % q.a.length);
    zero = recordQuizAnswer(zero, q.id, q.correct);
  }
  await evaluate(`localStorage.setItem(${JSON.stringify(STORAGE_KEY)}, ${JSON.stringify(JSON.stringify(zero))})`);
  await navigate();
  assert.equal(await evaluate("document.querySelector('.quiz-stars').getAttribute('aria-label')"), '1 out of 3 stars');
  assert.equal(await evaluate("document.querySelectorAll('.quiz-victory-badge').length"), 1);
  await route('dashboard'); await click('#dashboard .button.ghost');
  await waitFor(`${storage}.correct.length === 0`);
  const reset = await readProgress();
  assert.equal(reset.quizChallenge, null);
  assert.deepEqual(reset.quizAttempts, {}); assert.deepEqual(reset.quizXp, {}); assert.deepEqual(reset.quizAnswers, {});
  await navigate();
  assert.equal(await evaluate("document.querySelectorAll('.quiz-victory').length"), 0);

  // US-11: render saved levels consistently without replaying level-up feedback.
  function progressAtXp(xp) {
    let progress = emptyProgress();
    let remaining = xp;
    if (xp > 100) {
      progress = { ...progress, done: { intro: true, risks: true }, opened: [0, 1, 2, 3] };
      remaining -= 40;
    }
    for (const q of QUESTIONS) {
      if (!remaining) break;
      if (remaining === 5) progress = recordQuizAnswer(progress, q.id, (q.correct + 1) % q.a.length);
      progress = recordQuizAnswer(progress, q.id, q.correct);
      remaining -= progress.quizXp[q.id];
    }
    assert.equal(derive(progress).xp, xp);
    return progress;
  }
  async function seedProgress(progress) {
    await evaluate(`localStorage.setItem(${JSON.stringify(STORAGE_KEY)}, ${JSON.stringify(JSON.stringify(progress))})`);
  }
  for (const [xp, level, title] of [[0, 1, 'Rookie'], [25, 2, 'Agile Explorer'],
    [55, 3, 'Sprinter'], [90, 4, 'Sprint Strategist'], [125, 5, 'Scrum Pro'], [140, 5, 'Scrum Pro']]) {
    const saved = progressAtXp(xp);
    await seedProgress(saved);
    await navigate('home');
    assert.equal(await evaluate("document.querySelector('.level-pill').getAttribute('aria-label')"), `Level ${level} · ${title}`);
    assert.equal(await evaluate("document.querySelector('.level-up-notice [role=status]').textContent"), '');
    assert.ok(await evaluate(`document.querySelector('.board-foot').textContent.includes(${JSON.stringify(`Level ${level} · ${title}`)})`));
    const expected = xp >= 125 ? 'Maximum level reached' : `${derive(saved).xpToNextLevel} XP to Level ${level + 1}`;
    for (const page of ['home', 'dashboard']) {
      await route(page);
      assert.ok(await evaluate(`document.querySelector('#${page} .level-progress').textContent.includes(${JSON.stringify(expected)})`));
      assert.equal(await evaluate(`document.querySelector('#${page} [aria-label="Level progress"]').getAttribute('aria-valuenow')`), String(Math.round(derive(saved).levelPercent)));
      for (const width of [1440, 1024, 768, 375, 320]) await viewport(width);
      if (xp === 90 || xp === 125) {
        await viewport(375, 844); await screenshot(`level-${level}-${page}-mobile.png`);
        await viewport(1440); await screenshot(`level-${level}-${page}-desktop.png`);
      }
    }
    assert.deepEqual(await readProgress(), saved);
  }
  console.log('PASS all five saved levels on Header, Home and Dashboard, next-level progress, maximum level and responsive layout');

  // A real reward crosses 25 XP. Repeated clicks and notification dismissal add no XP.
  await seedProgress({ ...emptyProgress(), done: { intro: true, risks: true } });
  await navigate('lesson2');
  await evaluate("{ const button = document.querySelector('.practice-toggle'); for (let i = 0; i < 20; i++) button.click(); }");
  await waitFor("document.querySelector('.level-up-notice [role=status]').textContent.includes('Level 2')");
  assert.equal(derive(await readProgress()).xp, 25);
  assert.deepEqual((await readProgress()).opened, [0]);
  assert.equal(await evaluate("document.querySelector('.level-up-notice [role=status]').getAttribute('aria-live')"), 'polite');
  assert.equal(await evaluate("document.querySelector('.level-up-notice [role=status]').getAttribute('aria-atomic')"), 'true');
  const dismiss = '.level-up-notice button';
  await evaluate(`document.querySelector(${JSON.stringify(dismiss)}).focus()`);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', unmodifiedText: '\r', windowsVirtualKeyCode: 13 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await waitFor("document.querySelector('.level-up-notice [role=status]').textContent === ''");
  await click('.practice-toggle');
  assert.equal(derive(await readProgress()).xp, 25);
  await route('dashboard'); await route('home');
  assert.equal(await evaluate("document.querySelector('.level-up-notice [role=status]').textContent"), '');
  await navigate('dashboard');
  assert.equal(await evaluate("document.querySelector('.level-up-notice [role=status]').textContent"), '');
  // Planning Poker is still a practice exercise, with no new XP reward.
  const beforePoker = await readProgress();
  await route('poker'); await click('.poker-hand-card'); await click('.poker-reveal');
  assert.deepEqual(await readProgress(), beforePoker);
  await route('dashboard'); await click('#dashboard .button.ghost');
  await waitFor(`${storage}.correct.length === 0 && ${storage}.opened.length === 0`);
  assert.equal(await evaluate("document.querySelector('.level-up-notice [role=status]').textContent"), '');
  assert.equal(await evaluate("document.querySelector('.level-pill').getAttribute('aria-label')"), 'Level 1 · Rookie');
  console.log('PASS accessible level-up feedback, keyboard dismissal, repeated practice clicks, no reload replay, reset and unchanged Planning Poker XP');
  await runPokerChecks({ evaluate, send, click, navigate, route, viewport, screenshot, readProgress, waitFor });
  await runReferencesChecks({ evaluate, send, route, navigate, viewport, screenshot, readProgress, waitFor });
  assert.deepEqual(runtimeErrors, []);
  assert.deepEqual(consoleErrors, []);
  console.log('PASS zero-XP victory, reset and no browser JavaScript exceptions');
  console.log(`Screenshots: ${artifacts}`);
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    try { await send('Browser.close', {}, null); } catch { /* browser closes its socket */ }
    socket.close();
  }
  if (browser.exitCode === null) browser.kill();
  const resolved = path.resolve(profile);
  const tempRoot = path.resolve(tmpdir()) + path.sep;
  if (resolved.startsWith(tempRoot) && path.basename(resolved).startsWith('sprintquest-quiz-ui-profile-')) {
    await rm(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 }).catch(() => {});
  }
}
