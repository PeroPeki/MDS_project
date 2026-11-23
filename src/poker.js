import { ESTIMATES } from './data.js';

/** Discussion examples, not an answer key: a real team estimates against its own baseline. */
export const POKER_SCENARIOS = Object.freeze([
  {
    id: 'saved-articles', title: 'Save favorite articles', suggestedEstimate: 5,
    story: 'As a reader, I want to save favorite articles so that I can find and read them later.',
    scope: 'Add a Save button and a saved-articles list for signed-in readers. Keep the list after refresh. Offline access and folders are outside this story.',
    complexity: 'Connect the article button, the saved list and existing account storage. Prevent duplicate saves and handle removing an article.',
    uncertainty: 'Confirm how deleted articles appear in the list and what happens when saving fails.',
    effort: 'Build two UI states, connect persistence and test saving, removing, reloading and empty/error states.',
    rationale: '5 points is a useful discussion starting point because this spans UI, saved state and several test paths. It is larger than changing one field, but assumes account storage already exists.',
    discussion: 'Would your estimate change if the team had to build account storage from scratch?',
  },
  {
    id: 'rename-task', title: 'Rename a task', suggestedEstimate: 2,
    story: 'As a team member, I want to rename a task so that its title reflects our current understanding.',
    scope: 'Edit one task title using the existing form and update endpoint. Show a validation message for an empty title. Permissions and task history already exist.',
    complexity: 'Reuse a familiar form and API for one field, without introducing a new workflow.',
    uncertainty: 'Confirm the title-length limit and how simultaneous edits are handled by the existing endpoint.',
    effort: 'Add an edit control, wire up validation and test success, empty input and a failed save.',
    rationale: '2 points reflects a small, familiar change with limited integration work. Compared with saving articles, it touches fewer states and reuses more existing behavior.',
    discussion: 'What would make this story larger: unfamiliar code, new permissions or a full edit history?',
  },
  {
    id: 'email-reminders', title: 'Send due-date reminders', suggestedEstimate: 8,
    story: 'As a team member, I want an email reminder before a task is due so that I can act before the deadline.',
    scope: 'Let members opt in to one reminder per task. Use an existing email provider, respect time zones and avoid duplicate sends when a delivery is retried.',
    complexity: 'Coordinate user preferences, a scheduled job and email delivery, including changed due dates and retry behavior.',
    uncertainty: 'The team has not used the scheduling service yet. Clarify time-zone rules, provider limits and how cancelled tasks affect queued reminders.',
    effort: 'Implement scheduling and opt-out behavior, integrate email and test time boundaries, retries and delivery failures.',
    rationale: '8 points reflects more integration and uncertainty than the other examples. A short investigation could reduce uncertainty; splitting preferences from delivery could produce smaller stories.',
    discussion: 'Which unknown would you investigate first, and how could the team split this story?',
  },
// Start with a familiar edit, then add persistence and finally scheduling uncertainty.
].sort((a, b) => a.suggestedEstimate - b.suggestedEstimate).map(Object.freeze));

export const emptyPokerExercise = () => ({ currentIndex: 0, estimates: {}, revealed: [] });

/** Local recognition for exploration, independent of estimates, XP and global badges. */
export function derivePokerRewards(exercise) {
  const insightStars = POKER_SCENARIOS.filter((scenario) => exercise.revealed.includes(scenario.id)).length;
  return { insightStars, pokerPro: insightStars === POKER_SCENARIOS.length };
}

/** Session-only exercise state. It never writes learning progress or grants XP. */
export function pokerReducer(state, action) {
  const scenario = POKER_SCENARIOS[state.currentIndex];
  switch (action.type) {
    case 'select':
      if (!ESTIMATES.includes(action.estimate) || state.revealed.includes(scenario.id)
        || state.estimates[scenario.id] === action.estimate) return state;
      return { ...state, estimates: { ...state.estimates, [scenario.id]: action.estimate } };
    case 'reveal':
      if (!ESTIMATES.includes(state.estimates[scenario.id]) || state.revealed.includes(scenario.id)) return state;
      return { ...state, revealed: [...state.revealed, scenario.id] };
    case 'navigate':
      if (!Number.isInteger(action.index) || !POKER_SCENARIOS[action.index] || action.index === state.currentIndex) return state;
      return { ...state, currentIndex: action.index };
    case 'restart':
      return emptyPokerExercise();
    default:
      return state;
  }
}
