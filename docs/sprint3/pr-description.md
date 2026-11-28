## What does this PR do?

Makes Sprint Quest comfortable on phones:

- adds an accessible menu button below 768px;
- gives every tap target at least 44px on narrow screens;
- raises reading text in the Quiz and Planning Poker to 15 to 16px on phones.

Desktop looks the same. No content, logic or dependencies changed.

Story: SCRUM-37 Mobile responsiveness and navigation fixes

## Changes

- `src/components/Nav.jsx`: new menu toggle `<button>`:
  - `aria-expanded` and `aria-controls="main-menu"`, accessible name "Menu";
  - closes on link click, Escape (focus returns to the button) and a tap outside;
  - choosing the current page keeps focus on the button.
- `src/styles.css`:
  - mobile navigation below 768px: one header row, full-width 48px menu rows, green bar for the current page;
  - the 44px minimum tap size now also applies to screens narrower than 768px, not only touch screens;
  - `scroll-padding-top` keeps focused elements clear of the sticky header (WCAG 2.4.11);
  - card and lesson body text at 16px on phones;
  - the menu animation respects `prefers-reduced-motion`.
- `src/pages/Quiz.css`, `src/pages/Poker.css`: one appended `max-width: 767px` block each that only changes font sizes. Existing lines are untouched, which keeps merge conflicts small.

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

- [ ] Acceptance criteria of SCRUM-37 are met
- [ ] Reviewed by at least one teammate before merge
- [ ] `npm run build` passes (checked locally: passes, no warnings)
- [ ] `npm test` passes (checked locally: 77 of 77)
- [ ] Works at 375px and 1280px (also checked at 320px and 768px)
- [ ] Keyboard accessible (Tab / Enter / Escape), visible focus, no colour-only information
- [ ] Lighthouse Accessibility 90 or more on the deploy preview
- [ ] No errors in the browser console
- [ ] Progress (XP, badges) still saves and loads correctly
- [ ] Checked on the Netlify deploy preview

## Notes for the reviewer

- `scripts/quiz-browser-smoke.mjs`: the suite crashed at its first step because it read a test page before it had loaded. It now waits for the page. This was an old timing issue, not caused by this PR.
- `scripts/bot-browser-checks.mjs`: the Agile Bot keyboard check ran at 375px, where the nav links are now behind the menu button, so it could not reach "Agile Bot". This PR caused that failure. The check now sets a 1440px viewport first, because it tests the desktop navigation. The mobile menu itself is checked separately (see "How to test").
- `src/styles.css`: source links in opened practice cards (Mission 2) are now at least 44px tall on narrow screens.
- To run the browser suite on a Mac, set the browser path: `SPRINT_QUEST_BROWSER="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run test:browser` (with `npm run dev` running).
- `package-lock.json` has a local npm-version change (removed `libc` fields). It is not part of this PR.

## Screenshots

| Desktop (1280px) | Mobile (375px, menu open) |
|---------|--------|
| [TODO Petar: screenshot] | [TODO Petar: screenshot] |

🤖 Generated with [Claude Code](https://claude.com/claude-code)
