/* All content of Sprint Quest in one place. */

export const STORAGE_KEY = 'sprintquest-progress-v1';

// Pages reachable from the top navigation (label shown in the nav bar)
export const NAV = { home: 'Home', missions: 'Missions', dashboard: 'Dashboard', poker: 'Planning Poker', bot: 'Agile Bot' };

// Every page that exists, with its browser tab title
export const PAGES = {
  home: 'Home',
  missions: 'Learning Missions',
  lesson1: 'Mission 1: What is gamification?',
  lesson2: 'Mission 2: Gamified practices',
  quiz: 'Mission 3: Quiz',
  risks: 'Mission 4: When gamification backfires',
  dashboard: 'Dashboard',
  poker: 'Planning Poker',
  bot: 'Agile Bot',
};
export const MISSION_PAGES = ['lesson1', 'lesson2', 'quiz', 'risks'];

export const MISSIONS = [
  { title: 'What is gamification?', short: 'What is gamification?', desc: 'Learn what gamification means and its core elements.', page: 'lesson1', xp: 10 },
  { title: 'Gamified practices in a sprint', short: 'Sprint practices', desc: 'Explore Planning Poker, retrospectives, sprint tracking and team badges.', page: 'lesson2', xp: 20 },
  { title: 'Quiz: Test your knowledge', short: 'Quiz', desc: 'Answer three multiple-choice questions.', page: 'quiz', xp: 30 },
  { title: 'When gamification backfires', short: 'When it backfires', desc: 'Discover potential risks and how to avoid them.', page: 'risks', xp: 10 },
];

export const PRACTICES = [
  { title: 'Planning Poker', tag: 'Sprint Planning', text: 'Estimate stories with cards to discuss effort and uncertainty.' },
  { title: 'Speed Boat retro', tag: 'Retrospective', text: 'Invite everyone to identify what moves the team forward and what holds it back.' },
  { title: 'Burndown as a level bar', tag: 'Sprint tracking', text: 'Visualize remaining work as a game-style progress bar.' },
  { title: 'Team badges', tag: 'Definition of Done', text: 'Celebrate shared milestones rather than rewarding individuals only.' },
];

export const QUESTIONS = [
  {
    q: 'What does gamification mean?',
    a: ['Building a video game for the team', 'Using game design elements in non-game contexts', 'Playing games during sprint breaks'],
    correct: 1,
    why: 'Gamification applies game-design elements to activities that are not games.',
  },
  {
    q: 'Which activity is useful for estimating Scrum user stories?',
    a: ['Planning Poker', 'A personal leaderboard', 'Randomly assigning points'],
    correct: 0,
    why: 'Planning Poker uses estimation cards and discussion to compare effort and uncertainty.',
  },
  {
    q: 'What is a potential risk of gamification?',
    a: ['Better visibility of progress', 'Unhealthy competition between teammates', 'More opportunities for feedback'],
    correct: 1,
    why: 'Individual competition can distract from Scrum’s emphasis on teamwork.',
  },
];

export const BADGES = [
  { name: 'First Step', text: 'Read about gamification.', icon: 'flag' },
  { name: 'Explorer', text: 'Explore all four practice cards.', icon: 'compass' },
  { name: 'Quiz Master', text: 'Answer all quiz questions correctly.', icon: 'cap' },
  { name: 'Critical Thinker', text: 'Read the risks section.', icon: 'bulb' },
];

export const ESTIMATES = [1, 2, 3, 5, 8, 13, 21, '?'];

export const MAX_XP = 70;

/* Agile Bot: placeholder answers until BOTSchool.ai is connected (US-14) */
export const BOT_SUGGESTIONS = [
  'What is Scrum?',
  'How can I gamify a sprint?',
  'What are the risks of gamification?',
  'Explain Planning Poker',
];

export function botAnswer(s) {
  const v = s.toLowerCase();
  if (v.includes('poker') || v.includes('estimate'))
    return 'Planning Poker is a collaborative estimation technique. Team members independently select story-point cards, reveal their estimates and discuss differences. Try the Planning Poker page!';
  if (v.includes('risk') || v.includes('bad') || v.includes('competition'))
    return 'Gamification can backfire when people chase points instead of value, or when leaderboards create competition. Reward team achievements and keep the learning goals clear.';
  if (v.includes('gamif') || v.includes('sprint'))
    return 'You can gamify sprint work with small XP rewards, shared badges, progress indicators, Planning Poker or a playful retrospective. Make sure rewards support collaboration.';
  if (v.includes('scrum'))
    return 'Scrum is a lightweight framework for helping teams deliver value through iterative work in Sprints. It includes accountabilities (Product Owner, Scrum Master, Developers), events and artifacts.';
  if (v.includes('agile'))
    return 'Agile is a mindset emphasizing collaboration, feedback, adapting to change and delivering value in small increments.';
  return 'I can help with Scrum, Agile, gamification risks, sprint activities, or Planning Poker. Try one of the suggested questions!';
}
