# Sprint Quest 🏆

An interactive learning website about **gamification in Scrum**, built as a university project for *Agile Methodologies*.

Users complete four learning missions, earn XP, unlock badges, practise **Planning Poker** and ask questions to **Agile Bot** (powered by the official BOTSchool webchat).

## Project structure

Built with **React + Vite**.

```
MDS_project/
├── index.html               # Vite entry (fonts, favicon, #root)
├── src/
│   ├── main.jsx             # mounts <App />
│   ├── App.jsx              # hash routing, toast, actions, page switch
│   ├── data.js              # all content: missions, practices, quiz, badges, suggested bot questions
│   ├── progress.js          # saved progress (localStorage) + derived XP, level, badges
│   ├── styles.css           # all styles + responsive breakpoints (1000px, 850px, 530px)
│   ├── components/          # Nav, Icon, MissionList, LessonHeader
│   └── pages/               # Home, Missions, Lesson1, Lesson2, Quiz, Risks, Dashboard, Poker, Bot
├── netlify.toml             # build: npm run build, publish: dist
└── .github/pull_request_template.md   # Definition of Done checklist for every PR
```

## Run locally

Needs Node 20+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the build locally
```

Pages are addressed with the URL hash, e.g. `/#missions`, `/#quiz`, `/#poker`, `/#bot`.
Progress is stored in the browser's `localStorage` (key `sprintquest-progress-v1`).

## Agile Bot (SCRUM-23 / US-14)

The official BOTSchool Webchat loader is included once, immediately before `</body>` in `index.html`. Its public channel ID and service endpoint come from the supplied installation snippet; no private credentials or new dependencies are needed. Hash navigation changes the React page inside `#root`, leaving the loader and any widget it creates in place.

The `#bot` page explains how to use the floating widget and offers questions to copy into it. It does not start another chat or call undocumented widget controls. The old predefined-response prototype has been removed.

BOTSchool's website settings require a **public HTTPS website and explicitly reject localhost, including HTTPS localhost**. The application and its landing page can be developed locally, but this Webchat channel cannot be authorized for localhost. Local TLS certificates do not resolve that restriction.

To verify the live widget, publish the feature to a Netlify deploy preview and add that exact public HTTPS origin to the BOTSchool channel's allowed websites. Keep the production entry `https://erasmuspr.netlify.app`. Deployment and channel authorization are manual steps; they have not been performed here. The localhost configuration request returned `403 origin_not_allowed`, whereas a request using the already approved production origin returned HTTP 200. A successful configuration response alone does not establish that live chat works.

The external Knowledge Base is already configured with seven indexed Markdown documents and eleven approved references; its four successful retrieval scenarios were reported before this integration. This implementation does not modify or recreate it.

Run `npm test` and `npm run build`. With Vite running in another terminal, run `npm run test:browser` for the existing regression suite plus Agile Bot keyboard, responsive layout and persistent-loader checks. The browser suite reports observed BOTSchool HTTP statuses separately: passing application checks do not establish that the third-party widget or replies work.

See [the integration QA record](docs/SCRUM-23-agile-bot-qa.md) for results, acceptance criteria and the remaining Netlify checks.

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
2. Build command `npm run build`, publish directory `dist` (already set in `netlify.toml`).
3. Every push to `main` deploys to production; every Pull Request gets its own **deploy preview** link.

## Research & QA follow-up: Netlify badge

The repository contains no application-owned Netlify promotional badge or badge-injection script. Removing an edge-injected **Powered by Netlify** badge remains an external configuration action, not a code fix.

**Petar:** open the Netlify project, go to **Project configuration > General > Powered by Netlify badge**, switch it off and save. If the setting is locked, review the available plan options with the project owner. Then verify the public site in a fresh browser session. This action has not been performed or verified here.

Netlify documents that the badge is injected at the edge and that the setting takes effect without a redeploy: [Powered by Netlify badge](https://docs.netlify.com/manage/projects/powered-by-netlify-badge/). No CSS hiding rules, script removal or security-policy workarounds were added.

## Team

| Role | Member |
|------|--------|
| Product Owner | Member 1 |
| Scrum Master | Member 2 |
| Frontend Developer | Member 3 |
| Gamification Developer | Member 4 |
| Research & QA | Member 5 |

## References

- Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). *From game design elements to gamefulness: defining "gamification".*
- Hamari, J., Koivisto, J., & Sarsa, H. (2014). *Does gamification work? A literature review of empirical studies on gamification.*

---

Project - Erasmus course *Metodologias de Desenvolvimento de Software*.
