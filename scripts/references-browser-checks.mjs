import assert from 'node:assert/strict';
import { REFERENCES, REFERENCES_BY_ID } from '../src/references.js';

/** Browser checks cover rendered citations, the existing Speed Boat link and hash navigation. */
export async function runReferencesChecks({ evaluate, send, route, navigate, viewport, screenshot, readProgress, waitFor }) {
  await route('home');
  const before = await readProgress();
  const storageKeys = await evaluate('Object.keys(localStorage).sort()');
  async function key(key) {
    const params = key === 'Enter' ? { key, code: 'Enter', text: '\r', unmodifiedText: '\r', windowsVirtualKeyCode: 13 }
      : { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 };
    await send('Input.dispatchKeyEvent', { type: 'keyDown', ...params });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
  }
  await evaluate("document.querySelector('.footer-sources').focus()");
  await key('Enter');
  await waitFor("!!document.querySelector('#sources')");
  assert.equal(await evaluate('document.activeElement.id'), 'sources-title');
  assert.equal(await evaluate('document.title'), 'Sources & references | Sprint Quest');
  assert.equal(await evaluate("document.querySelector('.footer-sources').getAttribute('aria-current')"), 'page');
  assert.equal(await evaluate("document.querySelectorAll('.references-list li').length"), 11);
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.references-list a')].map(link => link.href)"), REFERENCES.map((reference) => reference.url));
  assert.equal(await evaluate("[...document.querySelectorAll('.references-list a')].every(link => link.target === '_blank' && link.relList.contains('noopener') && link.relList.contains('noreferrer') && link.textContent.includes('opens in a new tab'))"), true);
  assert.ok(await evaluate("document.querySelector('#reference-almeida-2023').textContent.includes('Uchôa, A., & Feijó, B.')"));
  for (const reference of REFERENCES) {
    await key('Tab');
    assert.equal(await evaluate('document.activeElement.href'), reference.url);
    assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineWidth'), '3px');
  }
  for (const width of [1440, 768, 375, 320]) await viewport(width);
  await viewport(375, 844); await screenshot('sources-mobile.png');
  await viewport(1440); await screenshot('sources-desktop.png');

  // Back/Forward and a direct refreshed URL use the application's existing hash router.
  await evaluate('window.history.back()');
  await waitFor("!!document.querySelector('#home')");
  await evaluate('window.history.forward()');
  await waitFor("!!document.querySelector('#sources')");
  await navigate('sources');
  assert.equal(await evaluate("document.querySelectorAll('.references-list li').length"), 11);
  assert.deepEqual(await readProgress(), before);

  await route('risks');
  const riskExplanations = [
    'Research finds that gamification effects vary by context and user.',
    'Individual leaderboards can pit teammates against each other instead of rewarding shared outcomes.',
    'If points reward ticket counts rather than value, teams may optimize the score instead of real outcomes.',
  ];
  assert.deepEqual(await evaluate("[...document.querySelectorAll('#risks .topic > p:first-of-type')].map(node => node.textContent)"), riskExplanations);
  assert.deepEqual(await evaluate("[...document.querySelectorAll('#risks .risk-citation a')].map(link => link.href)"), [
    REFERENCES_BY_ID['hamari-2014'].url, REFERENCES_BY_ID['almeida-2023'].url, REFERENCES_BY_ID['almeida-2023'].url,
  ]);
  assert.equal(await evaluate("[...document.querySelectorAll('#risks .risk-citation a')].every(link => link.target === '_blank' && link.relList.contains('noopener') && link.relList.contains('noreferrer') && link.textContent.includes('opens in a new tab'))"), true);
  await viewport(375, 844); await screenshot('risks-citations-mobile.png');
  await evaluate("document.querySelector('#risks .risk-citation a').focus()");
  await key('Tab');
  assert.equal(await evaluate('document.activeElement.href'), REFERENCES_BY_ID['almeida-2023'].url);
  assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineWidth'), '3px');

  // The Hohmann link was already implemented. Exercise its existing disclosure and rendering.
  await route('lesson2');
  await evaluate("document.querySelectorAll('.practice-toggle')[1].focus()");
  await key('Enter');
  await waitFor("document.querySelectorAll('.practice-toggle')[1].getAttribute('aria-expanded') === 'true'");
  const speedBoatLinks = await evaluate("[...document.querySelectorAll('#practice-details-1 .practice-sources a')].map(link => ({ href: link.href, target: link.target, rel: link.rel, text: link.textContent }))");
  assert.equal(speedBoatLinks.length, 1);
  assert.equal(speedBoatLinks[0].href, REFERENCES_BY_ID['hohmann-2006'].url);
  assert.equal(speedBoatLinks[0].target, '_blank');
  assert.ok(speedBoatLinks[0].rel.includes('noopener') && speedBoatLinks[0].rel.includes('noreferrer'));
  assert.ok(speedBoatLinks[0].text.includes('opens in a new tab'));
  await key('Tab');
  assert.equal(await evaluate('document.activeElement.href'), REFERENCES_BY_ID['hohmann-2006'].url);
  assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineWidth'), '3px');
  await viewport(375, 844); await screenshot('speed-boat-source-mobile.png');
  // The harness seeds completed practice cards, so opening this card must not change XP.
  assert.deepEqual(await readProgress(), before);
  assert.deepEqual(await evaluate('Object.keys(localStorage).sort()'), storageKeys);
  console.log('PASS eleven bibliography links, footer keyboard navigation, Back/Forward/reload, Mission 4 citations, existing Speed Boat source, mobile layout and unchanged saved progress');
}
