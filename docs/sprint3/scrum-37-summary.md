# SCRUM-37: Mobile responsiveness and navigation fixes

Branch: `petar-sprint3`, Pull Request #12. Commits: `fb987cb` (navigation and touch targets), `44afd35` (text sizes) and `c796c7c` (browser test fixes and Mission 2 source links).

## Why we did this

Sprint Quest is a learning site that students will mostly open on a phone. Before this story, the site did not overflow horizontally, but phone users had three real problems:

1. **The navigation was cramped.** Below 850px the five page links moved to a second row. At 375px they were squeezed to 13px condensed text, the "Home" link was only 42px wide and the links were 34px tall. The sticky header took about 100px of a phone screen.
2. **Some buttons were too small to tap.** The 44px minimum tap size only applied to touch devices. In a narrow window with a mouse, or in DevTools without touch emulation, "Back to missions" was 23px tall, "Switch to Developer" and "Clear role" were 29px, and normal buttons were 36 to 40px.
3. **Text in the Quiz and Planning Poker was hard to read on phones.** Answer options were 13px, the user story was 13px, explanations were 12px and some captions were 5 to 9px.

## What we changed

### 1. A mobile menu button (below 768px)

- The header is now one row on phones: logo, XP, level and a menu button. Its height went from about 100px to 62px at 375px.
- The menu button is a real `<button>`. It has the accessible name "Menu", `aria-expanded` (open or closed) and `aria-controls` pointing to the list of links.
- When the menu is open, the links are full-width rows, 48px tall, with 16px text. The current page is marked with a green bar on the left.
- The menu closes when you choose a link, press Escape or tap outside it.
- Focus stays sensible. Escape returns focus to the menu button. Choosing a new page moves focus to the page heading, as before. Choosing the page you are already on keeps focus on the menu button.
- At 768px and wider nothing changes. The menu button is hidden and the full navigation is shown as before.
- The opening animation is short and turns off when the user's system asks for reduced motion.

### 2. 44px tap targets on every narrow screen

The existing 44px rule now applies on touch screens **and** on any screen narrower than 768px. The source links in opened practice cards (Mission 2) also got a 44px minimum height, because they stand alone in a list and are not part of a sentence.

### 3. Readable text on phones

- Below 768px, reading text is 15 to 16px. This covers quiz answers and explanations, Planning Poker stories, scope, factors and feedback, mission and lesson cards.
- Labels and captions are at least 9 to 13px.
- Only font sizes changed. Colours, fonts, spacing and layout are the same.
- Purely decorative micro text, such as the "SPRINT QUEST" signature on playing cards, was left as it is.

### 4. Focused elements are not hidden behind the sticky header

We added `scroll-padding-top`. When keyboard users tab through a long page, the focused element scrolls into view below the sticky navigation and not under it (WCAG 2.4.11).

## What we did not change

- Content, `data.js` texts, quiz, XP and progress logic, and the chatbot were not touched.
- No new dependencies.
- The existing breakpoints (1000/850/530px in the main styles, 760/530px in the Quiz, 1024/850/600px in Planning Poker) were kept. Changing them would move layouts at in-between widths and cause merge conflicts with teammates. New rules use one breakpoint: 767/768px.

## How we checked it

- Measured in headless Chrome at 320, 375, 768, 1024 and 1280px on all ten pages, with touch emulation on and off:
  - the starting state;
  - eight interactive states: role chosen, all progress complete, quiz victory, quiz after an answer, all practice cards open, Planning Poker after a reveal, and Planning Poker results.
  - Result: no horizontal overflow, no element outside the screen and no button or link under 44px below 768px. Links inside sentences are exempt under WCAG 2.5.8.
- Menu behaviour test (all passed):
  - closed by default;
  - Enter opens it and Tab reaches the first link;
  - Escape closes it and returns focus to the button;
  - a link closes it and moves focus to the new page heading;
  - a tap outside closes it;
  - at 768 and 1280px the button is hidden and the links are visible.
- A second automated test went through the full user journey at 1280px and 375px: roles, all four missions, quiz XP 10/5/0, levels, badges, reset, reload, Planning Poker, Agile Bot, Sources, Back/Forward. No app errors were found.
- `npm run build` passes. `npm test`: 77 of 77 pass.
- Browser console on the deploy preview: no app errors. The only messages come from BOTSchool (HTTP 403), because the preview address is not on the widget's list of approved websites.
- Lighthouse Accessibility (Mobile) on the Netlify deploy preview of PR #12, 28 November 2026: Home 100, Mission 2 (Lesson 2) 100, Quiz 100, Planning Poker 100.
- `npm run test:browser` (the team's browser suite): all 11 sections pass after two small script fixes (see the PR description).

## For the Sprint Review demo (about 2 minutes)

1. Open the site in Chrome DevTools at 375px (iPhone SE). Show the one-row header and the menu button.
2. Open the menu, pick "Planning Poker", and show that the menu closes and the page changes.
3. Use only the keyboard: Tab to the menu button, Enter, Tab through the links, Escape.
4. Show the Quiz at 375px: answers are now easy to read and tap.
5. Switch to 1280px: the desktop navigation looks exactly as before.
6. Show the Lighthouse Accessibility result: 100 on Home, Mission 2, Quiz and Planning Poker (mobile).
