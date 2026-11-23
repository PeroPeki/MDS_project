import assert from 'node:assert/strict';
import { test } from 'node:test';
import { REFERENCES, REFERENCES_BY_ID } from './references.js';
import { MISSION_PAGES, PAGES, PRACTICES } from './data.js';

test('the bibliography contains exactly the eleven approved, unique link targets', () => {
  assert.deepEqual(REFERENCES.map((reference) => reference.url), [
    'https://doi.org/10.1016/j.infsof.2022.107142',
    'https://support.atlassian.com/jira-software-cloud/docs/what-is-the-sprint-burndown-report/',
    'https://doi.org/10.1145/2181037.2181040',
    'https://wingman-sw.com/papers/PlanningPoker-v1.1.pdf',
    'https://doi.org/10.1109/HICSS.2014.377',
    'https://doi.org/10.1016/j.compedu.2014.08.019',
    'https://www.lukehohmann.com/innovation-games/speed-boat',
    'https://www.informit.com/store/innovation-games-creating-breakthrough-products-through-9780321437297',
    'https://www.microsoftpressstore.com/store/agile-project-management-with-scrum-9780735619937',
    'https://scrumguides.org/scrum-guide.html',
    'https://www.cambridge.org/core/journals/european-review/article/abs/improving-ratings-audit-in-the-british-university-system/FC2EE640C0C44E3DB87C29FB666E9AAB',
  ]);
  assert.equal(new Set(REFERENCES.map((reference) => reference.id)).size, 11);
  assert.equal(new Set(REFERENCES.map((reference) => reference.url)).size, 11);
  for (const reference of REFERENCES) {
    assert.ok(reference.authors && reference.year && reference.title && reference.shortCitation);
    assert.strictEqual(REFERENCES_BY_ID[reference.id], reference);
  }
});

test('Almeida retains the supplied full citation and sources without a date remain undated', () => {
  const almeida = REFERENCES_BY_ID['almeida-2023'];
  assert.equal(almeida.authors, 'Almeida, C., Kalinowski, M., Uchôa, A., & Feijó, B.');
  assert.equal(almeida.year, '2023');
  assert.equal(almeida.title, 'Negative effects of gamification in education software: Systematic mapping and practitioner perceptions');
  assert.equal(almeida.publication, 'Information and Software Technology, 156, 107142');
  assert.equal(REFERENCES_BY_ID['atlassian-burndown'].year, 'n.d.');
  assert.equal(REFERENCES_BY_ID['hohmann-speed-boat'].year, 'n.d.');
});

test('the existing Speed Boat book link remains unique and agrees with the full bibliography', () => {
  const speedBoat = PRACTICES.find((practice) => practice.title === 'Speed Boat retro');
  const book = REFERENCES_BY_ID['hohmann-2006'];
  assert.equal(speedBoat.sources.length, 1);
  assert.equal(speedBoat.sources[0].url, book.url);
  assert.ok(speedBoat.sources[0].text.includes('Hohmann, L. (2006)'));
});

test('Sources has a hash route without becoming a reward-bearing mission', () => {
  assert.equal(PAGES.sources, 'Sources & references');
  assert.ok(!MISSION_PAGES.includes('sources'));
});
