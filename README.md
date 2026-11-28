# Sprint Quest 🏆

An interactive learning website about **gamification in Scrum**, built as a university project for *Agile Methodologies*.

Users complete four learning missions, earn XP, level up, unlock badges, practise **Planning Poker** and ask questions to **Agile Bot** (powered by the official BOTSchool webchat).

**Live site:** https://erasmuspr.netlify.app

## Features

- **Four learning missions:**
  1. What is gamification?
  2. Gamified practices in a sprint (four expandable practice cards).
  3. A quiz with 10 questions.
  4. When gamification backfires.
- **XP, levels and badges.** Earning XP:
  - 10 XP per completed lesson;
  - 5 XP per practice card;
  - 10 / 5 / 0 XP per quiz question, depending on the attempt.

  There is 140 XP in total, five levels (Rookie to Scrum Pro) and four badges.
- **Learning roles:** Developer and Scrum Master. Each role suggests its own mission order.
- **Planning Poker:** three user stories to estimate, with Insight Stars. It gives no XP.
- **Agile Bot:** a page that explains the BOTSchool chat widget (see below).
- **Sources & references:** eleven references, linked from the footer.
- **Progress is saved in the browser.** No account is needed.

## Project structure

Built with **React 19 + Vite 6**. There are no other runtime dependencies.

```
MDS_project/
├── index.html               # Vite entry (fonts, favicon, #root, BOTSchool loader)
├── src/
│   ├── main.jsx             # mounts <App />
│   ├── App.jsx              # hash routing, toast, actions, focus on page change
│   ├── data.js              # all content: missions, practices, quiz, badges, suggested bot questions
│   ├── progress.js          # saved progress (localStorage) + derived XP, level, badges
│   ├── levels.js            # the five levels and XP thresholds
│   ├── quiz.js              # quiz order, answer shuffling, stars
│   ├── poker.js             # Planning Poker scenarios and exercise state
│   ├── references.js        # the eleven references shown on the Sources page
│   ├── *.test.js            # unit tests (Node.js test runner)
│   ├── styles.css           # shared styles; main breakpoints 1000, 850, 768 (mobile menu) and 530px
│   ├── components/          # Nav, Icon, MissionList, LessonHeader, LevelProgress, LevelUpNotice,
│   │                        # ReferenceLink, RouteNote, quiz/ and poker/ sub-components
│   └── pages/               # Home, Missions, Lesson1, Lesson2, Quiz, Risks, Dashboard, Poker, Bot, Sources
│                            # (Quiz.css and Poker.css hold the styles of those two pages)
├── scripts/                 # optional browser checks (run through Chrome)
├── docs/                    # QA records and Sprint 3 drafts
├── netlify.toml             # build: npm run build, publish: dist, Node 22
└── .github/pull_request_template.md   # Definition of Done checklist for every PR
```

## Run locally

Use Node 22, the version Netlify builds with. The browser checks need Node 22 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the build locally
npm test           # unit tests
```

Pages are addressed with the URL hash, e.g. `/#missions`, `/#quiz`, `/#poker`, `/#bot`, `/#sources`.
Progress is stored in the browser's `localStorage` (key `sprintquest-progress-v1`).

### Browser checks

With `npm run dev` running in another terminal, run `npm run test:browser`. The script looks for Chrome or Edge in the usual Windows and Linux locations. On a Mac, give it the path:

```bash
SPRINT_QUEST_BROWSER="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run test:browser
```

The suite checks the following and reports BOTSchool HTTP statuses separately:
- the quiz, XP, roles, levels and Planning Poker;
- the references;
- the Agile Bot page;
- layout at several widths.

Passing application checks do not prove that the third-party chat widget works.

## Mobile and accessibility (SCRUM-37)

- **Below 768px the page links are behind a menu button.**
  - The button has `aria-expanded` and `aria-controls`.
  - It closes on link click, Escape or a tap outside.
  - From 768px up the full navigation is shown.
- **Buttons and standalone links are at least 44px tall** on touch screens and on screens narrower than 768px.
- **Reading text is 15 to 16px on phones.**
- **Keyboard support:**
  - a "Skip to content" link;
  - focus moves to the page heading on every page change;
  - a visible focus outline;
  - focused elements are not hidden under the sticky header.
- **Animations turn off** when the system asks for reduced motion.
- **Tested** at 320, 375, 768, 1024 and 1280px. Lighthouse Accessibility (Mobile) on the deploy preview of PR #12 (28 November 2026): Home, Mission 2, Quiz and Planning Poker all scored 100.

See [docs/sprint3/scrum-37-summary.md](docs/sprint3/scrum-37-summary.md) for details.

## Agile Bot (SCRUM-23 / US-14)

**Setup**
- The official BOTSchool Webchat loader is included once, just before `</body>` in `index.html`.
- Its public channel ID and service endpoint come from the supplied installation snippet. No private credentials or new dependencies are needed.
- Hash navigation only changes the React page inside `#root`, so the loader and its widget stay in place.

**The `#bot` page**
- It explains how to use the floating widget and offers questions to copy into it.
- It does not start another chat or call undocumented widget controls.

**Where the widget works**
- BOTSchool only allows **approved public HTTPS websites**. It explicitly rejects localhost, including HTTPS localhost, so the widget cannot be tested locally.
- The production address `https://erasmuspr.netlify.app` is on the approved list.
- A Netlify deploy preview has its own address. Unless that address is added to the BOTSchool channel's allowed websites, the widget does not appear and the console shows `403 Forbidden`. This was observed on the deploy preview of PR #12 on 28 November 2026.

**Knowledge Base**
- The external Knowledge Base is configured in BOTSchool, with seven indexed Markdown documents and eleven approved references.
- This repository does not modify it.

See [the integration QA record](docs/SCRUM-23-agile-bot-qa.md) for results and acceptance criteria.

## Team workflow

1. **Never commit directly to `main`.** `main` is what Netlify deploys.
2. Pick a story from the board and create a branch named after it:
   `SCRUM-<key>-<short-name>` (e.g. `SCRUM-10-vite-setup`, `SCRUM-23-botschool-chat`).
3. Commit small, with the Jira key first: `SCRUM-11 Fix mobile nav overflow`.
4. Open a **Pull Request** into `main`. The PR template contains the Definition of Done checklist.
5. At least **one teammate reviews** the PR and checks the Netlify deploy preview.
6. Merge, then move the card to *Done* on the board.

Keep `main` up to date before starting new work:

```bash
git checkout main && git pull
git checkout -b SCRUM-<key>-my-story
```

## Deployment (Netlify)

1. Netlify → *Add new site* → *Import an existing project* → GitHub → select this repo.
2. Build command `npm run build`, publish directory `dist`, Node 22 (already set in `netlify.toml`).
3. Every push to `main` deploys to production. Every Pull Request gets its own **deploy preview** link.

### "Powered by Netlify" badge

- Netlify adds a small "Powered by Netlify" badge to the live site. It is not part of this repository.
- On 28 November 2026 we checked the setting in **Project configuration > General > Powered by Netlify badge**. Hiding the badge is only available on paid Netlify plans, and this project uses the free plan.
- **Decision:** keep the badge. We do not hide it with CSS or scripts.
- More information: [Powered by Netlify badge](https://docs.netlify.com/manage/projects/powered-by-netlify-badge/).

## Documentation

- [docs/SCRUM-23-agile-bot-qa.md](docs/SCRUM-23-agile-bot-qa.md): Agile Bot integration QA record.
- [docs/sprint3/](docs/sprint3/): Sprint 3 drafts:
  - final report outline;
  - Review and Retrospective templates;
  - SCRUM-37 summary and manual test checklist;
  - PR description.

## Team

| Role | Member |
|------|--------|
| Product Owner | Member 1 |
| Scrum Master | Member 2 |
| Frontend Developer | Member 3 |
| Gamification Developer | Member 4 |
| Research & QA | Member 5 |

## References

The site lists all eleven references on its **Sources & references** page (`/#sources`), from `src/references.js`. The two core papers are:

- Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). *From game design elements to gamefulness: defining "gamification".*
- Hamari, J., Koivisto, J., & Sarsa, H. (2014). *Does gamification work? A literature review of empirical studies on gamification.*

---

Project - Erasmus course *Metodologias de Desenvolvimento de Software*.
