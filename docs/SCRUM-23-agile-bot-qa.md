# SCRUM-23 / US-14: Agile Bot integration QA

Verified on 25 November 2026. Branch: `feature/SCRUM-23-agile-bot-integration`.

## Implementation

- Added the supplied official async BOTSchool loader once, immediately before `</body>` in `index.html`. The same script remains outside React across hash navigation and Strict Mode mounts.
- Replaced the prototype at `#bot` with an educational landing page using Sprint Quest's paper cards, yellow note, typography and responsive layout. Preserved the Agile Bot navigation item and route.
- Kept suggested questions as selectable text to copy into the official widget. Removed predefined answers, message state, the imitation chat form and obsolete chat styles.
- Added no programmatic widget controls. No supported opening API was verified in the official documentation inspected at https://docs.botschool.ai/; the page directs users to the vendor's floating launcher.
- The supplied BOTSchool settings screenshots confirm that only public HTTPS websites can be authorized and that localhost is explicitly rejected even over HTTPS. Live widget testing requires a public deployment with an approved origin.
- Added browser regression checks for the landing page, keyboard access, all hash routes, one persistent loader, Back/Forward, direct `#bot` reload and saved progress.
- No dependencies or private credentials were added. Missions, quizzes, XP, badges, levels, Planning Poker and all eleven references retain their existing implementation.
- The externally configured Knowledge Base was left untouched. Seven indexed Markdown documents, eleven approved references and four successful retrieval scenarios are user-provided context, not tests repeated during this implementation.

## Validation

| Check | Result |
| --- | --- |
| Git preparation | Clean initial working tree; fetched origin; fast-forwarded main from `3eac246` to `53880eb`; created the requested feature branch. Previous branches preserved. |
| `npm test` | PASS: 77 tests. Initial sandbox run was blocked by `spawn EPERM`; rerun with subprocess permissions passed. |
| `npm run build` | PASS. Initial sandbox run was blocked by esbuild `spawn EPERM`; rerun with subprocess permissions passed. Built HTML retains one loader immediately before `</body>`. |
| `npm run test:browser` | PASS: final pre-push run against the fresh production build served by Vite preview at `http://localhost:4173` (`SPRINT_QUEST_URL` set to that origin). Existing quiz, mission, XP, badge, level, Planning Poker and references regressions pass, plus Agile Bot keyboard navigation, all hash routes, persistent script identity, Back/Forward and direct reload. Desktop/tablet/mobile widths from 320px to 1440px have no horizontal overflow. Desktop and mobile screenshots of this production build were reviewed. |
| Visual review | PASS: inspected the generated 1440px desktop and 375px mobile Agile Bot screenshots. Cards stack on mobile and retain the existing visual identity. The vendor widget is absent, so expanded chat layout remains unverified. |
| Browser console | No JavaScript exceptions or `console.error` calls in the regression suite. Follow-up diagnostics found that the default headless User-Agent is blocked at the loader (`net::ERR_BLOCKED_BY_ORB` / HTTP 403). With an ordinary Chrome User-Agent, both official JavaScript assets load with HTTP 200, but the channel configuration request fails with HTTP 403. The browser logs the failed resource. |
| BOTSchool configuration follow-up | Confirmed `403 origin_not_allowed` for `Origin: http://localhost:5173`, with detail `this website may not open the chat`. The same observed configuration endpoint returns HTTP 200 for `Origin: https://erasmuspr.netlify.app`. A normal-browser diagnostic creates one `bsc-chat` element but cannot display the launcher because local origin authorization fails. |
| Localhost restriction | Confirmed by the user's BOTSchool settings screenshot: `Addresses on your own computer (localhost) cannot be added. To test, publish the page on an https address.` Local HTTPS cannot satisfy this channel restriction. |
| Live widget, replies and conversation continuity | Pending: deploy this branch to a public HTTPS site and authorize its exact origin. Configuration success for the existing production origin does not establish that the deployed widget or replies work. |

## Acceptance criteria

| Criterion | Status |
| --- | --- |
| Exact official installation snippet, once in persistent shell | PASS; source and production HTML inspected. |
| Preserve Agile Bot navigation and `#bot` route | PASS; keyboard navigation, direct reload and Back/Forward checked. |
| Educational purpose, suggestions, direction to official widget | Implemented. |
| No invented API endpoints, SDK methods or widget controls | Met; only the supplied endpoint is configured. |
| No obsolete predefined-response logic | Met. |
| Existing visual identity, desktop/mobile layout and keyboard access | PASS for application page; browser checks and visual review completed. Vendor widget accessibility and layout remain a deployment check. |
| Preserve existing learning content and gamification | PASS; existing application logic unchanged; 77 tests and the browser regression suite pass. |
| No duplicate initialization during hash navigation | PASS for integration: same single script element and document across all routes, with no additional loader resource entries. Live widget instance count remains a deployment check. |
| External Knowledge Base preserved | Met; no external changes made. |
| Official widget loads and works on every page with no console errors | Pending: external channel currently rejects localhost with `origin_not_allowed`; live deployment verification also remains outstanding. |

## Remaining deployment checks and configuration

No new environment variables, API keys or Knowledge Base uploads are required by this code. After manually pushing the branch and opening a PR, use its Netlify deploy preview, then repeat on https://erasmuspr.netlify.app/ after the approved merge:

1. After manually pushing and creating the PR, use its public HTTPS Netlify deploy preview. Add that exact preview origin to the BOTSchool Webchat channel's allowed websites and save; preserve the existing production entry. Localhost is explicitly forbidden, even with HTTPS, so local certificate setup is not a testing solution. Open the authorized public preview in an ordinary browser, confirm the channel configuration succeeds, and check for a single launcher. Default headless requests may be rejected separately by the vendor. No deployment or BOTSchool settings changes were performed by the implementation agent.
2. Open the widget using mouse and Tab/Enter. Verify accessible launcher/input names, visible focus, message entry, close/reopen and focus restoration. Report vendor accessibility defects to the channel owner rather than adding undocumented controls.
3. Send an educational question, navigate through Home, Missions, Quiz, Dashboard, Planning Poker, Agile Bot and Sources, and use Back/Forward. Confirm the same widget and conversation survive hash navigation without additional loader requests or duplicate launchers. A full browser reload is a new document and may reload the vendor script normally.
4. Re-run the four previously approved retrieval scenarios against the existing Knowledge Base and check the cited references. Do not recreate or replace the Knowledge Base.
5. At desktop and 375px/320px mobile widths, check the launcher and expanded chat, touch keyboard, scrolling, close control, navigation, quiz controls, Poker controls, toast and footer for overlap or clipping.
6. Check the browser Console and Network tabs for JavaScript errors, failed resources, CORS/CSP or channel errors. Confirm quiz rewards, missions, badges, saved XP and Planning Poker still work with the live widget present.

No commit, push, deployment, merge or PR creation was performed by the implementation agent.
