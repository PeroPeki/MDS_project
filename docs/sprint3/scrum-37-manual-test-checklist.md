# SCRUM-37 manual test checklist

Use Chrome DevTools (F12, then the phone icon for device mode). Run every row once with touch emulation on (device "iPhone SE") and once with it off ("Responsive", width typed in by hand). Reset progress first (Dashboard, "Reset saved progress").

## Every page at every width

At each of the three widths, check:

- [ ] No sideways scrolling: drag the page left. Nothing may move.
- [ ] No text or button is cut off at the right edge.
- [ ] Every button looks large enough to tap with a thumb.

| Page | 375px | 768px | 1280px |
|------|-------|-------|--------|
| Home: hero, sprint board, role cards, mission notes | [ ] | [ ] | [ ] |
| Home after choosing a role: route note with "Switch" and "Clear role" | [ ] | [ ] | [ ] |
| Missions: notes and the progress circle | [ ] | [ ] | [ ] |
| Mission 1 (Lesson 1) | [ ] | [ ] | [ ] |
| Mission 2 (Lesson 2) with all four cards open | [ ] | [ ] | [ ] |
| Mission 3 Quiz: one wrong answer, then the right one | [ ] | [ ] | [ ] |
| Quiz results screen after all 10 questions | [ ] | [ ] | [ ] |
| Mission 4 (Risks) | [ ] | [ ] | [ ] |
| Planning Poker: one round revealed, factors opened | [ ] | [ ] | [ ] |
| Planning Poker: results table after all 3 rounds | [ ] | [ ] | [ ] |
| Agile Bot | [ ] | [ ] | [ ] |
| Dashboard | [ ] | [ ] | [ ] |
| Sources (footer link) | [ ] | [ ] | [ ] |

## Navigation per width

- **375px:**
  - [ ] One header row: logo, XP, level, menu button.
  - [ ] The menu opens and closes.
  - [ ] Each link opens its page and closes the menu.
  - [ ] Tapping outside the menu closes it.
- **768px:**
  - [ ] No menu button. All five links are visible in the second row.
- **1280px:**
  - [ ] The navigation looks exactly like the current live site.

## Keyboard only (375px, then 1280px)

Put the mouse away.

- [ ] First Tab shows "Skip to content". Enter jumps to the page heading.
- [ ] Tab to the menu button. Its focus ring is clearly visible.
- [ ] Enter opens the menu. Tab moves through Home, Missions, Dashboard, Planning Poker, Agile Bot.
- [ ] Escape closes the menu and focus is back on the menu button.
- [ ] Open the menu again and press Enter on "Dashboard". The page changes and focus is on the "Your dashboard" heading.
- [ ] Tab through a long page (Planning Poker). The focused element is never hidden under the sticky header.
- [ ] Quiz: answer with Tab and Enter only.
- [ ] Planning Poker: choose a card and reveal with Tab and Enter only.
- [ ] At 1280px: Tab through the five nav links. No menu button is reached.

## Reduced motion

- [ ] DevTools, then More tools, then Rendering, then "Emulate CSS prefers-reduced-motion: reduce". At 375px the menu opens without animation and the menu icon changes without animation.

## Lighthouse

- [ ] Open the Netlify deploy preview (not localhost) in an incognito window.
- [ ] DevTools, then Lighthouse, then Mode "Navigation", Device "Mobile", Category "Accessibility" only, then "Analyze page load".
- [ ] Run it on Home, Quiz and Planning Poker. Target: 90 or more on each.
- [ ] Write the scores into the PR and into the final report (section 9).

## Results

| Check | Result | Notes |
|-------|--------|-------|
| Pages at 375 / 768 / 1280px | [TODO Petar] | |
| Keyboard only | [TODO Petar] | |
| Lighthouse Home / Mission 2 / Quiz / Poker | 100 / 100 / 100 / 100 | Mobile, deploy preview of PR #12, 28 November 2026 |
| Browser console (deploy preview) | No app errors | Only the expected BOTSchool 403, because the preview address is not approved |
| Real phone (optional) | [TODO Petar] | |
