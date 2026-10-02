import { addDays, toISO } from './dates';

export const HOUR_HEIGHT = 72; // px per hour in the time grid
export const DEFAULT_START_HOUR = 8; // grid grows automatically if an event falls outside
export const DEFAULT_END_HOUR = 19;

export const VIEWS = ['Day', 'Week', 'Month'];

export const CATEGORIES = {
  Design: { label: 'Design', color: '#00FFA3' },
  Management: { label: 'Management', color: '#8B8D98' },
  Client: { label: 'Client', color: '#6CB8FF' },
  Focus: { label: 'Focus Session', color: '#B79CFF' },
  Team: { label: 'Team', color: '#E3A54B' },
};

export const FILTERS = [
  { id: 'all', label: 'All Schedules', categories: null },
  { id: 'sprint', label: 'Sprint Design', categories: ['Design', 'Management', 'Team'] },
  { id: 'client', label: 'Client Syncs', categories: ['Client'] },
  { id: 'focus', label: 'Deep Focus', categories: ['Focus'] },
];

export const CURRENT_USER_ID = 'u1';

export const TEAM = [
  { id: 'u1', name: 'Elena Rostova', role: 'Lead Product Designer' },
  { id: 'u2', name: 'Marcus Lee', role: 'Frontend Engineer' },
  { id: 'u3', name: 'Sara Haddad', role: 'Product Manager' },
  { id: 'u4', name: 'Omar Khalil', role: 'Design Engineer' },
  { id: 'u5', name: 'Nina Petrov', role: 'UX Researcher' },
  { id: 'u6', name: 'Tomás Rivera', role: 'Engineering Lead' },
  { id: 'u7', name: 'Aiko Tanaka', role: 'Motion Designer' },
];

const item = (id, text, done = false) => ({ id, text, done });

/** Demo data, anchored to the week that contains today so the app never opens empty. */
export function seedEvents(weekStart) {
  const day = (offset) => toISO(addDays(weekStart, offset));
  return [
    {
      id: 'e1',
      title: 'Design System Audit',
      category: 'Design',
      date: day(0),
      start: '09:00',
      end: '10:30',
      location: 'Foundations',
      locationNote: 'Design Studio',
      link: '',
      summary: 'Auditing tokens, components and documentation gaps before the v2 rollout.',
      checklist: [item('e1a', 'Inventory colour and spacing tokens', true), item('e1b', 'List components without docs')],
      collaborators: ['u1', 'u2', 'u4'],
      pinned: false,
      dnd: false,
    },
    {
      id: 'e2',
      title: 'Sprint Planning & Backlog',
      category: 'Management',
      date: day(1),
      start: '13:00',
      end: '14:30',
      location: 'Q4 Milestones',
      locationNote: 'Conference Room 1',
      link: '',
      summary: 'Sizing the Q4 backlog and agreeing the sprint goal with product and engineering.',
      checklist: [item('e2a', 'Groom top 15 backlog items'), item('e2b', 'Confirm sprint capacity'), item('e2c', 'Publish sprint goal')],
      collaborators: ['u1', 'u3', 'u6'],
      pinned: false,
      dnd: false,
    },
    {
      id: 'e3',
      title: 'Product Architecture & UX Review',
      category: 'Design',
      date: day(2),
      start: '10:00',
      end: '11:30',
      location: 'Meeting Room 03',
      locationNote: 'Virtual & In-Person Sync',
      link: 'https://meet.example.com/architecture-review',
      summary:
        'Reviewing v2 wireframes and prototype flow for cross-platform schedule sync with engineering leads. Finalizing edge states for real-time notification drops.',
      checklist: [
        item('e3a', 'Finalize component token mapping', true),
        item('e3b', 'Walkthrough user flow with frontend', true),
        item('e3c', 'Document responsive breakpoint rules'),
        item('e3d', 'Export vector icon sets for design team'),
      ],
      collaborators: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
      pinned: true,
      dnd: false,
    },
    {
      id: 'e4',
      title: 'Deep Focus: Core Component Library',
      category: 'Focus',
      date: day(2),
      start: '14:00',
      end: '16:00',
      location: 'Token system',
      locationNote: 'Do not disturb',
      link: '',
      summary: 'Heads-down time to finish the token system and the first batch of core components.',
      checklist: [item('e4a', 'Button and input primitives'), item('e4b', 'Theme provider wiring')],
      collaborators: ['u1'],
      pinned: false,
      dnd: true,
    },
    {
      id: 'e5',
      title: 'Client Sync',
      category: 'Client',
      date: day(3),
      start: '11:00',
      end: '12:00',
      location: 'Video call',
      locationNote: 'Weekly status',
      link: 'https://meet.example.com/client-sync',
      summary: 'Walk the client through this week’s progress and collect feedback on the prototype.',
      checklist: [item('e5a', 'Prepare demo build'), item('e5b', 'Send recap after the call')],
      collaborators: ['u1', 'u3'],
      pinned: false,
      dnd: false,
    },
    {
      id: 'e6',
      title: 'Weekly Team Retrospective & Demo',
      category: 'Team',
      date: day(4),
      start: '15:00',
      end: '16:30',
      location: 'All-hands',
      locationNote: 'Main hall',
      link: '',
      summary: 'Show what shipped, talk through what slowed us down and pick one thing to change next week.',
      checklist: [item('e6a', 'Collect wins and blockers'), item('e6b', 'Prepare demo script')],
      collaborators: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'],
      pinned: false,
      dnd: false,
    },
  ];
}
