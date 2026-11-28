# Sprint Quest: final report (outline)

Course: Metodologias de Desenvolvimento de Software, IPC Coimbra.
Final presentation: Monday 30 November 2026.

Facts marked "(from repo)" were checked in the Git repository on 27 and 28 November 2026. Everything marked [TODO Petar: ...] must be filled in by the team.

## 1. Cover page and team

- Project name: Sprint Quest (from repo)
- Team members and Scrum roles: [TODO Petar: names. The README lists the roles Product Owner, Scrum Master, Frontend Developer, Gamification Developer and Research & QA, but not the names.]
- Course, teacher, date: [TODO Petar]

## 2. Design Thinking output

- Empathize (who are our users, what we learned about them): [TODO Petar]
- Define (problem statement / point of view): [TODO Petar]
- Ideate (ideas we considered, which we chose and why): [TODO Petar]
- Prototype (first version; the first commit "Add Sprint Quest website" is from 9 November 2026 (from repo)): [TODO Petar: describe and add screenshots]
- Test (who tested, what changed after testing): [TODO Petar]

## 3. Project plan

### 3.1 Goals

[TODO Petar: project goals as agreed with the teacher]

### 3.2 Product vision

Draft based on the README (from repo), to be confirmed by the Product Owner:

> Sprint Quest is an interactive learning website that teaches gamification in Scrum through four short missions, XP, levels and badges, a Planning Poker exercise and an Agile chatbot.

[TODO Petar: confirm or replace with the official vision statement]

### 3.3 General requirements

Functional (implemented, from repo):

- Four learning missions:
  1. What is gamification?
  2. Gamified practices: Planning Poker, Speed Boat retro, Burndown as a level bar, Team badges.
  3. Quiz with 10 questions.
  4. When gamification backfires.
- Gamification:
  - XP: 10 per completed lesson, 5 per practice card, 10/5/0 per quiz question by attempt; 140 XP in total.
  - Five levels: Rookie, Agile Explorer, Sprinter, Sprint Strategist, Scrum Pro.
  - Four badges and quiz stars.
- Two learning roles (Developer, Scrum Master), each with its own suggested mission order.
- Planning Poker practice with three user stories and Insight Stars. It gives no XP.
- Agile Bot page with the official BOTSchool webchat widget.
- Sources page with eleven references.
- Progress saved in the browser (localStorage), with no account needed.

Non-functional (from repo):

- Works on phones, tablets and desktops (see section 9).
- Keyboard accessible, with visible focus (see section 9).
- Static site, no backend, deployed on Netlify.

[TODO Petar: add any requirements from the assignment that are not listed here]

### 3.4 Release plan

| Release | Sprint | Date | Content |
|---------|--------|------|---------|
| [TODO Petar] | 1 | [TODO] | [TODO] |
| [TODO Petar] | 2 | [TODO] | [TODO] |
| [TODO Petar] | 3 | [TODO] | [TODO] |

### 3.5 Team rules (working agreement)

From the README (from repo):

- Nobody commits directly to `main`. `main` is what Netlify deploys.
- One branch per story, named `SCRUM-<key>-<short-name>`.
- Commit messages start with the Jira key.
- Every change goes through a Pull Request that at least one teammate reviews, using the Netlify deploy preview.
- After merging, the card moves to Done on the board.

[TODO Petar: add meeting times, communication channels and other agreements]

### 3.6 Definition of Done

From `.github/pull_request_template.md` (from repo):

- Acceptance criteria of the user story are met
- Works on desktop and mobile (checked at about 375px width)
- Keyboard usable (Tab / Enter), visible focus, no colour-only information
- No errors in the browser console
- Progress (XP, badges) still saves and loads correctly
- Checked on the Netlify deploy preview
- Reviewed by at least one teammate

## 4. Product backlog

[TODO Petar: export the Product Backlog from Jira with priority and estimates]

Jira keys that appear in the Git history (from repo), as a starting point:

| Key | Commit title in Git | First commit date |
|-----|---------------------|-------------------|
| SCRUM-10 | Migrate site to React + Vite | 2026-11-09 |
| SCRUM-17 | Make practice cards expandable | 2026-11-16 |
| SCRUM-27 | Show in-progress status in mission tracker | 2026-11-16 |
| SCRUM-28 | Fix mobile navbar truncation and page title spacing at 375px | 2026-11-16 |
| SCRUM-31, 32, 33 | Implement Sprint 2 gamification improvements | 2026-11-16 |
| SCRUM-20 | Implement five-level XP progression | 2026-11-23 |
| SCRUM-15 | Implement Planning Poker exercise; gamify it with cards and Insight Stars | 2026-11-23 |
| SCRUM-17, 18, 19 | Fix citations and Sources | 2026-11-23 |
| SCRUM-23 | Integrate BOTSchool Agile Bot | 2026-11-25 |
| SCRUM-37 | Mobile responsiveness and navigation fixes | 2026-11-27 |
| SCRUM-40 | Sprint 3 documentation drafts | 2026-11-27 |

User story IDs mentioned in the code: US-03 (roles), US-08 (practice cards), US-11 (levels), US-13 (saved progress), US-14 (Agile Bot). [TODO Petar: match US numbers to Jira keys]

## 5. Sprints

Repeat this section for Sprints 1, 2 and 3.

### Sprint [N]

- Dates: [TODO Petar]
- Sprint Goal: [TODO Petar]
- Sprint Backlog (stories, estimates, owner): [TODO Petar: export from Jira]
- Burndown chart: [TODO Petar: export the image from Jira]
- What was delivered: [TODO Petar]
- Sprint Review minutes: [TODO Petar]
- Sprint Retrospective minutes and action items: [TODO Petar]

Notes for Sprint 3 (from repo):

- SCRUM-23 (Agile Bot) was merged on 25 November 2026.
- SCRUM-37 (mobile responsiveness) and SCRUM-40 (Sprint 3 documentation) were done on branch `petar-sprint3`, Pull Request #12. See `docs/sprint3/scrum-37-summary.md`. [TODO Petar: add the review and merge date]
- "Powered by Netlify" badge: hiding it is only available on paid Netlify plans (checked on 28 November 2026). The team decided to keep it.
- Templates for the Sprint 3 Review and Retrospective are in `docs/sprint3/sprint3-minutes-template.md`.

## 6. Technical overview (from repo)

- Stack:
  - React 19 and Vite 6;
  - no other runtime dependencies;
  - unit tests with the Node.js built-in test runner (77 tests passing on 28 November 2026);
  - browser checks driven through Chrome (11 of 11 sections passing on 28 November 2026).
- Structure:
  - hash routing (`#missions`, `#quiz`, ...), so every page can be refreshed and linked;
  - all content in `src/data.js`;
  - progress logic in `src/progress.js`;
  - game logic in `src/quiz.js`, `src/poker.js` and `src/levels.js`.
- Deployment: Netlify builds `main` with `npm run build` on Node 22 and publishes `dist`. Every Pull Request gets a deploy preview.
- Security headers set in `netlify.toml`: `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`.

## 7. Links

- Live site (Netlify): https://erasmuspr.netlify.app
- Source code: https://github.com/PeroPeki/MDS_project
- Jira board: [TODO Petar: link]
- Google Drive folder: [TODO Petar: link]

## 8. AI usage

[TODO Petar: copy the entries from the team's AI Usage Log. For each one: tool, who used it, for what, how the result was checked.]

Known entry for Sprint 3:

- Claude Code (Anthropic) was used on 27 and 28 November 2026 by Petar for SCRUM-37 and SCRUM-40:
  - audit of the mobile layout and the code changes;
  - two test sub-agents (Claude Sonnet) checked the layout, keyboard use and the full user journey;
  - first drafts of these documents and the README update.
- Petar checked the result:
  - Lighthouse on the deploy preview;
  - the browser console;
  - screenshots and the PR description.

  [TODO Petar: add your manual checklist results and the teammate review.]

## 9. Accessibility and responsive design (from repo)

Measures in the code:

- "Skip to content" link as the first focusable element.
- On every page change, the page title updates and focus moves to the page heading.
- Visible focus outline on all interactive elements.
- `aria-current` on the active page link; `aria-live` for toast messages and quiz feedback; labelled progress bars.
- Animations turn off when the user's system asks for reduced motion.
- SCRUM-37 (Sprint 3):
  - accessible menu button below 768px (`aria-expanded`, `aria-controls`, Escape to close);
  - at least 44px tap targets on narrow screens;
  - 15 to 16px reading text on phones;
  - focused elements are not hidden behind the sticky header.
- Tested at 320, 375, 768, 1024 and 1280px with no horizontal scrolling.

Lighthouse Accessibility score (Mobile), Netlify deploy preview of PR #12, 28 November 2026: Home 100, Mission 2 100, Quiz 100, Planning Poker 100. [TODO Petar: repeat on the live site after merge]

## 10. Lessons learned

- About Scrum: [TODO Petar]
- About teamwork: [TODO Petar]
- About the technology: [TODO Petar]
- What we would do differently: [TODO Petar]

## 11. Appendices

- Screenshots (desktop and mobile): [TODO Petar]
- Burndown charts: [TODO Petar]
- References: see the Sources page of the site (eleven references).
