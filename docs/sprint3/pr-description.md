## What does this PR do?

Makes Sprint Quest comfortable on phones:

- adds an accessible menu button below 768px;
- gives every tap target at least 44px on narrow screens;
- raises reading text in the Quiz and Planning Poker to 15 to 16px on phones.

Desktop looks the same. No content, logic or dependencies changed.

Stories: SCRUM-37 Mobile responsiveness and navigation fixes, SCRUM-40 Sprint 3 documentation

## Changes

- `src/components/Nav.jsx`: new menu toggle `<button>`:
  - `aria-expanded` and `aria-controls="main-menu"`, accessible name "Menu";
  - closes on link click, Escape (focus returns to the button) and a tap outside;
  - choosing the current page keeps focus on the button.
- `src/styles.css`:
  - mobile navigation below 768px: one header row, full-width 48px menu rows, green bar for the current page;
  - the 44px minimum tap size now also applies to screens narrower than 768px, not only touch screens;
  - source links in opened practice cards (Mission 2) are at least 44px tall on narrow screens;
  - `scroll-padding-top` keeps focused elements clear of the sticky header (WCAG 2.4.11);
  - card and lesson body text at 16px on phones;
  - the menu animation respects `prefers-reduced-motion`.
- `src/pages/Quiz.css`, `src/pages/Poker.css`: one appended `max-width: 767px` block each that only changes font sizes. Existing lines are untouched, which keeps merge conflicts small.
- `scripts/quiz-browser-smoke.mjs`, `scripts/bot-browser-checks.mjs`: two small fixes so the browser test suite runs again (see Notes for the reviewer).
- `README.md` and `docs/sprint3/` (SCRUM-40):
  - README updated for Sprint 3: features, structure, test commands, mobile and accessibility, and the Netlify badge decision;
  - new Sprint 3 drafts: report outline, Review and Retrospective templates, SCRUM-37 summary and test checklist.

## Test results

- `npm run build`: passes, no warnings.
- `npm test`: 77 of 77 pass.
- `npm run test:browser` (team browser suite): all 11 sections pass.
- Automated layout check in headless Chrome:
  - all 10 pages at 320, 375, 768, 1024 and 1280px, with touch emulation on and off;
  - also interactive states: role chosen, all practice cards open, quiz after a wrong answer, quiz victory, Planning Poker reveal and results;
  - no sideways scrolling, nothing outside the screen, every button at least 44px below 768px.
- Full user journey at 1280px and 375px (roles, all four missions, quiz XP 10/5/0, levels, badges, reset, reload, Planning Poker, Agile Bot, Sources, Back/Forward): no app errors found.
- Mobile menu: Enter/Space opens it, Tab order, Escape, link click, tap outside and focus handling all work. At 768px and above the full nav is shown.
- Lighthouse Accessibility (Mobile, deploy preview): **Home 100, Mission 2 100, Quiz 100, Planning Poker 100**.
- Browser console on the deploy preview: no app errors. The only messages are from BOTSchool (`403 Forbidden` and "Website chat is unavailable"), because the preview address is not on the widget's list of approved websites. This is expected and must be rechecked on the live site after merge.

## How to test

Use Chrome DevTools device mode. Test with touch emulation on and off.

1. **375px (iPhone SE)**
   - The header is one row with the logo, XP, level and a menu button.
   - Open the menu, choose each page and check that it closes.
   - Check that no page scrolls sideways.
   - Quiz: answer a question wrong, then right.
   - Planning Poker: play all three rounds and view the results table.
2. **768px (iPad portrait)**
   - The full navigation is shown in two rows and there is no menu button.
   - Cards use two columns where they did before.
3. **1280px (laptop)**
   - The navigation and all pages look exactly like `main`.
4. **Keyboard only, at 375px**
   - Tab to the menu button and press Enter: the menu opens.
   - Tab goes through the five links. Escape closes the menu and focus is back on the button.
   - Enter on a link opens the page and focus moves to its heading.
   - Focus is always visible.
5. **Lighthouse** (deploy preview, Mobile, Accessibility category): score of 90 or more.

## Definition of Done

- [x] Acceptance criteria of SCRUM-37 are met
- [ ] Reviewed by at least one teammate before merge
- [x] `npm run build` passes (no warnings)
- [x] `npm test` passes (77 of 77), `npm run test:browser` passes (11 of 11)
- [x] Works at 375px and 1280px (also checked at 320px, 768px and 1024px)
- [x] Keyboard accessible (Tab / Enter / Escape), visible focus, no colour-only information
- [x] Lighthouse Accessibility 90 or more on the deploy preview (Home 100, Mission 2 100, Quiz 100, Poker 100)
- [x] No errors in the browser console (only the expected BOTSchool 403 on the preview address)
- [x] Progress (XP, badges) still saves and loads correctly
- [x] Checked on the Netlify deploy preview

## Notes for the reviewer

- `scripts/quiz-browser-smoke.mjs`: the suite crashed at its first step because it read a test page before it had loaded. It now waits for the page. This was an old timing issue, not caused by this PR.
- `scripts/bot-browser-checks.mjs`: the Agile Bot keyboard check ran at 375px, where the nav links are now behind the menu button, so it could not reach "Agile Bot". This PR caused that failure. The check now sets a 1440px viewport first, because it tests the desktop navigation. The mobile menu itself is checked separately (see "How to test").
- To run the browser suite on a Mac, set the browser path: `SPRINT_QUEST_BROWSER="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run test:browser` (with `npm run dev` running).
- Agile Bot cannot be checked on the deploy preview, because BOTSchool only allows approved websites. Please check it on https://erasmuspr.netlify.app after merge.
- `package-lock.json` has a local npm-version change (removed `libc` fields). It is not part of this PR.

## Screenshots

| Desktop (1280px) | Mobile (375px, menu open) |
|---------|--------|
| <img width="480" alt="sprint3_homepage_responsive" src="https://github.com/user-attachments/assets/d85eb7b0-45f8-4f57-90d2-dc711be391e3" /> | <img width="240" alt="sprint3_homepage_mobile" src="https://github.com/user-attachments/assets/9b96457f-6fa6-4b83-8214-ed37ab352a6d" /> |
