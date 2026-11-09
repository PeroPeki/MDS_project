/* ==========================================================================
   Sprint Quest – app logic
   ========================================================================== */

/* ---------- Data ---------- */

const STORAGE_KEY = 'sprintquest-progress-v1';

// Pages reachable from the top navigation (label shown in the nav bar)
const NAV = { home: 'Home', missions: 'Missions', dashboard: 'Dashboard', poker: 'Planning Poker', bot: 'Agile Bot' };

// Every page that exists, with its browser tab title
const PAGES = {
  home: 'Home',
  missions: 'Learning Missions',
  lesson1: 'Mission 1: What is gamification?',
  lesson2: 'Mission 2: Gamified practices',
  quiz: 'Mission 3: Quiz',
  risks: 'Mission 4: When gamification backfires',
  dashboard: 'Dashboard',
  poker: 'Planning Poker',
  bot: 'Agile Bot',
};
const MISSION_PAGES = ['lesson1', 'lesson2', 'quiz', 'risks'];

// [title, description, page, xp]
const missionData = [
  ['What is gamification?', 'Learn what gamification means and its core elements.', 'lesson1', 10],
  ['Gamified practices in a sprint', 'Explore Planning Poker, retrospectives, sprint tracking and team badges.', 'lesson2', 20],
  ['Quiz: Test your knowledge', 'Answer three multiple-choice questions.', 'quiz', 30],
  ['When gamification backfires', 'Discover potential risks and how to avoid them.', 'risks', 10],
];

// [title, tag, description]
const practiceData = [
  ['Planning Poker', 'Sprint Planning', 'Estimate stories with cards to discuss effort and uncertainty.'],
  ['Speed Boat retro', 'Retrospective', 'Invite everyone to identify what moves the team forward and what holds it back.'],
  ['Burndown as a level bar', 'Sprint tracking', 'Visualize remaining work as a game-style progress bar.'],
  ['Team badges', 'Definition of Done', 'Celebrate shared milestones rather than rewarding individuals only.'],
];

const qs = [
  {
    q: 'What does gamification mean?',
    a: ['Building a video game for the team', 'Using game design elements in non-game contexts', 'Playing games during sprint breaks'],
    correct: 1,
    why: 'Gamification applies game-design elements to activities that are not games.',
  },
  {
    q: 'Which activity is useful for estimating Scrum user stories?',
    a: ['Planning Poker', 'A personal leaderboard', 'Randomly assigning points'],
    correct: 0,
    why: 'Planning Poker uses estimation cards and discussion to compare effort and uncertainty.',
  },
  {
    q: 'What is a potential risk of gamification?',
    a: ['Better visibility of progress', 'Unhealthy competition between teammates', 'More opportunities for feedback'],
    correct: 1,
    why: 'Individual competition can distract from Scrum’s emphasis on teamwork.',
  },
];

const badgesInfo = [
  ['First Step', 'Read about gamification.'],
  ['Explorer', 'Explore all four practice cards.'],
  ['Quiz Master', 'Answer all quiz questions correctly.'],
  ['Critical Thinker', 'Read the risks section.'],
];

const ESTIMATES = [1, 2, 3, 5, 8, 13, 21, '?'];

// One icon per badge (symbols live in the SVG sprite at the top of index.html)
const BADGE_ICONS = ['flag', 'compass', 'cap', 'bulb'];
const icon = (name) => `<svg class="icon-svg" aria-hidden="true"><use href="#i-${name}"/></svg>`;

/* ---------- State (saved in localStorage) ---------- */

const emptyState = () => ({ role: null, done: {}, opened: [], correct: [] });

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return { ...emptyState(), ...saved };
  } catch (e) {
    return emptyState();
  }
}

// localStorage can throw (private mode, storage full, blocked cookies) – never let that break a click
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    /* progress just won't persist */
  }
}

let state = loadState();
let current = 'home';
let question = 0;
let selectedEstimate = null;

/* ---------- Derived values ---------- */

function xp() {
  return (state.done.intro ? 10 : 0) + (state.done.risks ? 10 : 0) + state.opened.length * 5 + state.correct.length * 10;
}
function completed() {
  return [!!state.done.intro, state.opened.length === 4, state.correct.length === 3, !!state.done.risks];
}
const badges = completed; // one badge per completed mission
function level() {
  return xp() >= 40 ? 2 : 1;
}
const levelTitle = () => (level() === 1 ? 'Rookie' : 'Apprentice');

/* ---------- Routing (hash based: #missions, #quiz …) ----------
   Gives working browser Back/Forward, keeps the page on refresh and
   allows direct links such as sprintquest.netlify.app/#poker          */

function pageFromHash() {
  const page = location.hash.slice(1);
  return page in PAGES ? page : 'home';
}

function go(page) {
  if (!(page in PAGES)) page = 'home';
  if (location.hash.slice(1) !== page) {
    location.hash = page; // triggers hashchange → show()
  } else {
    show(page);
  }
}

function show(page, moveFocus = true) {
  current = page;
  document.querySelectorAll('.page').forEach((el) => el.classList.toggle('active', el.id === page));

  const navKey = MISSION_PAGES.includes(page) ? 'missions' : page;
  document.querySelectorAll('#navlinks button').forEach((btn) => {
    if (btn.dataset.page === navKey) {
      btn.setAttribute('aria-current', 'page');
      // keep the active tab visible in the scrollable mobile nav
      const links = btn.parentElement;
      links.scrollLeft = btn.offsetLeft - links.offsetLeft - (links.clientWidth - btn.offsetWidth) / 2;
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  document.title = `${PAGES[page]} | Sprint Quest`;
  window.scrollTo(0, 0);
  render();

  // Tell keyboard / screen-reader users that the "page" changed
  if (moveFocus) {
    const heading = document.querySelector(`#${page} h1, #${page} h2`);
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }
}

window.addEventListener('hashchange', () => show(pageFromHash()));

function focusMain() {
  const heading = document.querySelector('.page.active h1, .page.active h2');
  (heading || document.getElementById('main')).focus();
}

/* ---------- Actions ---------- */

function chooseRole(role) {
  state.role = role;
  save();
  go('missions');
  notify(`${role} path selected`);
}

function complete(key) {
  if (!state.done[key]) {
    state.done[key] = true;
    save();
    notify('+10 XP, nice!');
  }
  render();
}

function notify(text) {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => el.classList.remove('show'), 2400);
}

function openPractice(i) {
  if (!state.opened.includes(i)) {
    state.opened.push(i);
    save();
    notify('+5 XP');
  }
  render();
}

function resetProgress() {
  if (!confirm('Reset all progress and badges?')) return;
  state = emptyState();
  save();
  question = 0;
  selectedEstimate = null;
  document.getElementById('estimateResult').innerHTML = '';
  render();
  notify('Progress reset');
}

/* ---------- Rendering ---------- */

const $ = (id) => document.getElementById(id);

function render() {
  const total = xp();
  const progress = Math.min(100, Math.round((total / 70) * 100));
  const cm = completed();
  const bc = badges();
  const doneCount = cm.filter(Boolean).length;
  const badgeCount = bc.filter(Boolean).length;

  // Top bar
  $('topxp').innerHTML = `${icon('star')} ${total} XP`;
  $('toplevel').textContent = 'Level ' + level();

  // Home
  $('homeX').textContent = `${total} / 70 XP`;
  $('homeBar').style.width = progress + '%';
  $('homeLevel').textContent = `Level ${level()} · ${levelTitle()}`;
  $('homeBadges').textContent = `${badgeCount} of 4 badges`;
  document.querySelectorAll('[data-role]').forEach((el) => {
    el.setAttribute('aria-pressed', String(el.dataset.role === state.role));
  });
  $('roleNote').textContent = state.role ? `Your role: ${state.role}.` : '';

  // Mission lists (home + missions page)
  // h3 on Home (under an h2), h2 on the Missions page (under the h1)
  // only the next unfinished mission gets the filled button, the rest stay quiet
  const nextIdx = cm.indexOf(false);
  const missionHtml = (hTag) => missionData
    .map((m, i) => {
      const verb = cm[i] ? 'Review' : i === nextIdx ? 'Start' : 'Open';
      return `
      <div class="mission c${i} ${cm[i] ? 'done' : ''}">
        <div class="mission-top">
          <span class="number">#${i + 1}</span>
          <span class="reward">${icon('star')} ${m[3]} XP</span>
        </div>
        <${hTag}>${m[0]}</${hTag}>
        <p>${m[1]}</p>
        <button class="button ${i === nextIdx ? '' : 'secondary'}" onclick="go('${m[2]}')"
          aria-label="${verb} mission ${i + 1}: ${m[0]}${cm[i] ? ' (completed)' : ''}">
          ${verb} <span class="arrow" aria-hidden="true">→</span>
        </button>
        ${cm[i] ? '<span class="stamp" aria-hidden="true">done!</span>' : ''}
      </div>`;
    })
    .join('');
  $('missionList').innerHTML = missionHtml('h2');
  $('homeMissions').innerHTML = missionHtml('h3');

  // Sprint board in the hero: done missions in Done, the next one in Doing
  const short = ['What is gamification?', 'Sprint practices', 'Quiz', 'When it backfires'];
  const cols = { todo: [], doing: [], done: [] };
  cm.forEach((d, i) => {
    const col = d ? 'done' : i === nextIdx ? 'doing' : 'todo';
    cols[col].push(`<div class="mini c${i} ${d ? 'done' : ''}">${short[i]}</div>`);
  });
  $('colTodo').innerHTML = cols.todo.join('');
  $('colDoing').innerHTML = cols.doing.join('');
  $('colDone').innerHTML = cols.done.join('');
  $('nTodo').textContent = cols.todo.length;
  $('nDoing').textContent = cols.doing.length;
  $('nDone').textContent = cols.done.length;

  // Tracker ring
  $('ring').style.setProperty('--angle', (doneCount / 4) * 360 + 'deg');
  $('ringNumber').textContent = `${doneCount} / 4`;
  $('missionChecklist').innerHTML = cm
    .map((d, i) => `<p class="small checklist-item ${d ? 'done' : ''}"><span class="dot" aria-hidden="true">${d ? icon('check') : ''}</span> Mission ${i + 1}: ${d ? 'complete' : 'not started'}</p>`)
    .join('');

  // Lesson buttons
  $('introButton').textContent = state.done.intro ? 'Completed · Next mission →' : 'Got it, +10 XP →';
  $('riskButton').textContent = state.done.risks ? 'Completed · Go to dashboard →' : 'I understand the risks, +10 XP →';

  // Practice cards (only phrasing content inside <button> – <p> is not allowed there)
  $('practices').innerHTML = practiceData
    .map((p, i) => {
      const opened = state.opened.includes(i);
      return `
      <button class="practice ${opened ? 'opened' : ''}" onclick="openPractice(${i})">
        <span class="tag">${p[1]}</span>
        <span class="title">${p[0]}</span>
        <span class="text">${p[2]}</span>
        <span class="cta">${opened ? 'Explored · +5 XP' : 'Open card, +5 XP →'}</span>
      </button>`;
    })
    .join('');

  // Dashboard
  $('dashLevel').textContent = 'Level ' + level();
  $('dashTitle').textContent = levelTitle();
  $('dashXp').textContent = total + ' XP';
  $('dashBar').style.width = progress + '%';
  $('dashMissions').textContent = `${doneCount} / 4`;
  $('dashBadges').textContent = `${badgeCount} / 4`;
  $('badges').innerHTML = badgesInfo
    .map(
      (b, i) => `
      <div class="badge ${bc[i] ? '' : 'locked'}">
        <span class="symbol">${icon(bc[i] ? BADGE_ICONS[i] : 'lock')}</span>
        <strong>${b[0]}</strong>
        <p>${b[1]}</p>
        <span class="small">${bc[i] ? 'Unlocked' : 'Locked'}</span>
      </div>`
    )
    .join('');

  const perMission = [
    state.done.intro ? 100 : 0,
    state.opened.length * 25,
    Math.round((state.correct.length / 3) * 100),
    state.done.risks ? 100 : 0,
  ];
  $('dashProgress').innerHTML = perMission
    .map(
      (p, i) => `
      <div style="margin:16px 0">
        <div class="row"><strong style="font-size:12px">Mission ${i + 1}</strong><span class="small">${p}%</span></div>
        <div class="bar" style="height:7px;margin-top:8px" role="progressbar" aria-label="Mission ${i + 1}" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><span style="width:${p}%"></span></div>
      </div>`
    )
    .join('');

  renderQuiz();
  renderPoker();
}

/* ---------- Quiz ---------- */

function renderQuiz() {
  const q = qs[question];
  const answered = state.correct.includes(question);
  $('questionText').textContent = q.q;
  $('quizCount').textContent = `Question ${question + 1} of 3 · +10 XP per correct answer`;
  $('quizBar').style.width = ((question + 1) / 3) * 100 + '%';
  $('quizOptions').innerHTML = q.a
    .map((a, i) => {
      const isCorrect = answered && i === q.correct;
      return `<button class="option ${isCorrect ? 'correct' : ''}" onclick="answer(${i})"><span class="mark">${isCorrect ? '✓ ' : ''}</span>${a}</button>`;
    })
    .join('');
  $('quizFeedback').innerHTML = answered ? `<div class="feedback"><strong>Correct.</strong> ${q.why}</div>` : '';
  $('nextQuestion').textContent = question === 2 ? 'Finish quiz →' : 'Next question →';
}

function answer(i) {
  const q = qs[question];
  if (state.correct.includes(question)) return;
  if (i === q.correct) {
    state.correct.push(question);
    save();
    notify('Correct! +10 XP');
    render();
  } else {
    $('quizFeedback').innerHTML = '<div class="feedback bad"><strong>Not quite.</strong> Have another look and try again.</div>';
    // mark the wrong choice with a symbol too, not only with colour
    document.querySelectorAll('#quizOptions .option').forEach((btn, j) => {
      btn.classList.toggle('wrong', i === j);
      btn.querySelector('.mark').textContent = i === j ? '✗ ' : '';
    });
  }
}

function nextQ() {
  if (question < 2) {
    question++;
    renderQuiz();
  } else {
    go('dashboard');
  }
}

function prevQ() {
  question = Math.max(0, question - 1);
  renderQuiz();
}

/* ---------- Planning Poker ---------- */

function renderPoker() {
  $('estimates').innerHTML = ESTIMATES.map(
    (n, i) =>
      `<button data-index="${i}" aria-pressed="${selectedEstimate === n}" ${n === '?' ? 'aria-label="Not sure (?)"' : ''}>${n}</button>`
  ).join('');
}

$('estimates').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-index]');
  if (!btn) return;
  selectedEstimate = ESTIMATES[Number(btn.dataset.index)];
  renderPoker();
  $('estimates').querySelector(`[data-index="${btn.dataset.index}"]`).focus();
});

function submitEstimate() {
  if (selectedEstimate === null) {
    notify('Choose an estimate first');
    return;
  }
  $('estimateResult').innerHTML = `
    <div class="feedback" style="margin-top:22px">
      Your estimate: <strong>${selectedEstimate}</strong> story points.<br><br>
      Suggested discussion estimate: <strong>5 points</strong>. This story may require UI, saved state and testing.
      There is no single objectively correct answer: in real Planning Poker, the team discusses different
      assumptions before agreeing on an estimate.
    </div>`;
}

/* ---------- Agile Bot (placeholder until BOTSchool.ai is connected) ---------- */

function respond(s) {
  const v = s.toLowerCase();
  if (v.includes('poker') || v.includes('estimate'))
    return 'Planning Poker is a collaborative estimation technique. Team members independently select story-point cards, reveal their estimates and discuss differences. Try the Planning Poker page!';
  if (v.includes('risk') || v.includes('bad') || v.includes('competition'))
    return 'Gamification can backfire when people chase points instead of value, or when leaderboards create competition. Reward team achievements and keep the learning goals clear.';
  if (v.includes('gamif') || v.includes('sprint'))
    return 'You can gamify sprint work with small XP rewards, shared badges, progress indicators, Planning Poker or a playful retrospective. Make sure rewards support collaboration.';
  if (v.includes('scrum'))
    return 'Scrum is a lightweight framework for helping teams deliver value through iterative work in Sprints. It includes accountabilities (Product Owner, Scrum Master, Developers), events and artifacts.';
  if (v.includes('agile'))
    return 'Agile is a mindset emphasizing collaboration, feedback, adapting to change and delivering value in small increments.';
  return 'I can help with Scrum, Agile, gamification risks, sprint activities, or Planning Poker. Try one of the suggested questions!';
}

function ask(s) {
  const box = $('messages');
  const user = document.createElement('div');
  user.className = 'bubble user';
  user.textContent = s;
  box.appendChild(user);
  const bot = document.createElement('div');
  bot.className = 'bubble bot';
  bot.textContent = respond(s);
  box.appendChild(bot);
  box.scrollTop = box.scrollHeight;
}

function sendChat() {
  const field = $('chatInput');
  const v = field.value.trim();
  if (!v) return;
  field.value = '';
  ask(v);
}

/* ---------- Start ---------- */

$('navlinks').innerHTML = Object.entries(NAV)
  .map(([key, label]) => `<button data-page="${key}" onclick="go('${key}')">${label}</button>`)
  .join('');

show(pageFromHash(), false);
