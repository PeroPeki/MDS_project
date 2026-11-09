# Sprint Quest 🏆

An interactive learning website about **gamification in Scrum**, built as a university project for *Agile Methodologies*.

Users complete four learning missions, earn XP, unlock badges, practise **Planning Poker** and ask questions to **Agile Bot** (chatbot, to be powered by BOTSchool.ai).

## Project structure

```
sprint-quest/
├── index.html          # all pages (Home, Missions, Lessons, Quiz, Dashboard, Poker, Bot)
├── css/styles.css      # all styles + responsive breakpoints (850px, 530px)
├── js/app.js           # state, routing, rendering, quiz, poker, chatbot
├── netlify.toml        # Netlify deploy config
└── .github/pull_request_template.md   # Definition of Done checklist for every PR
```

No build step, no dependencies: it is plain HTML, CSS and JavaScript.

## Run locally

Open `index.html` in a browser, or (recommended, closer to Netlify):

```bash
npx serve .
# or
python3 -m http.server 8000
```

Pages are addressed with the URL hash, e.g. `/#missions`, `/#quiz`, `/#poker`, `/#bot`.
Progress is stored in the browser's `localStorage` (key `sprintquest-progress-v1`).

## Team workflow

1. **Never commit directly to `main`.** `main` is what Netlify deploys.
2. Pick a story from the board and create a branch named after it:
   `feature/<short-name>` or `fix/<short-name>` (e.g. `fix/mobile-nav`, `feature/botschool-chat`).
3. Commit small, with clear messages: `Fix mobile nav overflow`, `Add quiz retry limit`.
4. Open a **Pull Request** into `main`. The PR template contains the Definition of Done checklist.
5. At least **one teammate reviews** the PR and checks the Netlify deploy preview.
6. Merge, then move the card to *Done* on the board.

Keep `main` up to date before starting new work:

```bash
git checkout main && git pull
git checkout -b feature/my-story
```

## Deployment (Netlify)

1. Netlify → *Add new site* → *Import an existing project* → GitHub → select this repo.
2. Build command: *(leave empty)* · Publish directory: `.` (already set in `netlify.toml`).
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
