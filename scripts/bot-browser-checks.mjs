import assert from 'node:assert/strict';
import { BOT_SUGGESTIONS, PAGES, STORAGE_KEY } from '../src/data.js';

/** Verify the application integration without calling any undocumented widget API. */
export async function runBotChecks({ evaluate, send, route, navigate, viewport, screenshot, readProgress, waitFor, botNetwork }) {
  const selector = 'script[src="https://webchat-cc.ng.botschool.ai/loader.js"]';
  // Quiz legitimately initializes its saved challenge on first visit; settle that
  // existing behaviour before taking the snapshot used by the all-routes check.
  await route('quiz');
  await waitFor(`!!JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})).quizChallenge`);
  await route('home');
  const before = await readProgress();
  await evaluate(`globalThis.__botLoaderCheck = { script: document.querySelector(${JSON.stringify(selector)}), origin: performance.timeOrigin }`);
  const requestCount = await evaluate("performance.getEntriesByType('resource').filter(entry => entry.name === 'https://webchat-cc.ng.botschool.ai/loader.js').length");

  // Use the existing navigation button with a keyboard, including its focus indicator.
  // Desktop width: earlier checks end at 375px, where .links is collapsed behind .nav-toggle (SCRUM-37).
  await viewport(1440);
  await evaluate("[...document.querySelectorAll('.links button')].find(button => button.textContent === 'Agile Bot').focus()");
  assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineWidth'), '3px');
  async function key(key, code) {
    const text = key === 'Enter' ? { text: '\r', unmodifiedText: '\r' } : {};
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: code, ...text });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: code });
  }
  await key('Enter', 13);
  await waitFor("!!document.querySelector('#bot')");
  assert.equal(await evaluate('document.activeElement.id'), 'bot-title');
  assert.equal(await evaluate('document.title'), 'Agile Bot | Sprint Quest');
  assert.equal(await evaluate("document.querySelector('.links [aria-current=page]').textContent"), 'Agile Bot');
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.bot-questions li')].map(item => item.textContent)"), BOT_SUGGESTIONS);
  assert.equal(await evaluate("document.querySelectorAll('#bot form, #bot input, #bot button').length"), 0);
  await key('Tab', 9);
  assert.equal(await evaluate('document.activeElement.hash'), '#missions');
  await key('Tab', 9);
  assert.equal(await evaluate('document.activeElement.hash'), '#sources');
  assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineWidth'), '3px');

  for (const width of [1440, 1024, 850, 768, 390, 375, 320]) await viewport(width);
  await viewport(375, 844); await screenshot('bot-mobile.png');
  await viewport(1440); await screenshot('bot-desktop.png');

  // All hash routes keep the same shell and exact loader node, including repeat visits.
  for (const page of [...Object.keys(PAGES), 'home', 'bot']) {
    await route(page);
    assert.equal(await evaluate(`document.querySelectorAll(${JSON.stringify(selector)}).length`), 1);
    assert.ok(await evaluate(`document.querySelector(${JSON.stringify(selector)}) === globalThis.__botLoaderCheck.script && performance.timeOrigin === globalThis.__botLoaderCheck.origin`));
  }
  assert.equal(await evaluate("performance.getEntriesByType('resource').filter(entry => entry.name === 'https://webchat-cc.ng.botschool.ai/loader.js').length"), requestCount);
  assert.deepEqual(await readProgress(), before);
  await evaluate('window.history.back()'); await waitFor("!!document.querySelector('#home')");
  await evaluate('window.history.forward()'); await waitFor("!!document.querySelector('#bot')");
  await navigate('bot');
  // The vendor may append its component after the loader at runtime. Placement
  // before </body> is a source/build-HTML requirement, not a live DOM invariant.
  const config = await evaluate(`{ const script = document.querySelector(${JSON.stringify(selector)}); ({ count: document.querySelectorAll(${JSON.stringify(selector)}).length, channel: script.dataset.channelId, endpoint: script.dataset.endpoint, async: script.async }); }`);
  assert.deepEqual(config, { count: 1, channel: '01a21316-a27b-70a2-82b2-75464e39681f', endpoint: 'https://api-cc.ng.botschool.ai', async: true });
  assert.deepEqual(await readProgress(), before);
  console.log('PASS Agile Bot keyboard navigation, responsive landing page, all hash routes, one persistent loader, Back/Forward/direct reload and unchanged progress');
  console.log('BOTSchool browser network observations (unique):', JSON.stringify([...new Set(botNetwork.map(entry => JSON.stringify(entry)))].map(entry => JSON.parse(entry))));
  console.log('Widget opening, replies and conversation persistence require a live BOTSchool widget; shell checks alone do not verify those behaviours.');
}
