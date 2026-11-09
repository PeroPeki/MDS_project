# Sprint Quest 🏆

An interactive learning website about **gamification in Scrum**, built as a university project for *Agile Methodologies*.

Users complete four learning missions, earn XP, unlock badges, practise **Planning Poker** and ask questions to **Agile Bot** (chatbot, to be powered by BOTSchool.ai).

## Project structure

Built with **React + Vite**.

```
MDS_project/
├── index.html               # Vite entry (fonts, favicon, #root)
├── src/
│   ├── main.jsx             # mounts <App />
│   ├── App.jsx              # hash routing, toast, actions, page switch
│   ├── data.js              # all content: missions, practices, quiz, badges, bot answers
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
