import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import {
  addDays,
  addMonths,
  byStart,
  fromISO,
  getStatus,
  startOfDay,
  startOfWeek,
  toMinutes,
} from './dates';
import { CATEGORIES, DEFAULT_END_HOUR, DEFAULT_START_HOUR, FILTERS, seedEvents } from './constants';

const STORAGE_KEY = 'chronopulse.v1';
const ScheduleContext = createContext(null);

const freshEvents = () => seedEvents(startOfWeek(startOfDay(new Date())));

/** The block the side panel shows first: what is happening now, else what is next, else anything. */
function pickDefaultSelected(events, now = new Date()) {
  if (!events.length) return null;
  const active = events.find((e) => getStatus(e, now) === 'active');
  if (active) return active.id;
  const upcoming = events.filter((e) => getStatus(e, now) === 'upcoming').sort(byStart);
  return (upcoming[0] ?? events[0]).id;
}

/** Calendar navigation follows the visible view; Analytics is always weekly. */
const navViewOf = (state) => (state.activeMenu === 'Analytics' ? 'Week' : state.view);

function loadInitialState() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    saved = null;
  }
  const events = Array.isArray(saved?.events) ? saved.events : freshEvents();
  return {
    events,
    selectedId: pickDefaultSelected(events),
    panelTick: 0,
    activeMenu: 'Timetable/Schedule',
    view: 'Week',
    filterId: 'all',
    query: '',
    anchor: startOfDay(new Date()),
    focusMode: Boolean(saved?.focusMode),
    dialog: { open: false, mode: 'create', initial: null, key: 0 },
    snack: null,
  };
}

const note = (message, extra = {}) => ({ key: Date.now(), message, ...extra });

function reducer(state, action) {
  switch (action.type) {
    case 'select':
      return { ...state, selectedId: action.id, panelTick: state.panelTick + 1 };
    case 'menu':
      return { ...state, activeMenu: action.menu };
    case 'view':
      return { ...state, view: action.view };
    case 'filter':
      return { ...state, filterId: action.id };
    case 'query':
      return { ...state, query: action.query };
    case 'focus':
      return { ...state, focusMode: !state.focusMode };
    case 'shift': {
      const view = navViewOf(state);
      const next =
        view === 'Day'
          ? addDays(state.anchor, action.dir)
          : view === 'Week'
            ? addDays(state.anchor, 7 * action.dir)
            : addMonths(state.anchor, action.dir);
      return { ...state, anchor: next };
    }
    case 'today':
      return { ...state, anchor: startOfDay(new Date()) };
    case 'goTo':
      return {
        ...state,
        anchor: startOfDay(action.date),
        view: action.view ?? state.view,
        activeMenu: 'Timetable/Schedule',
      };
    case 'openDialog':
      return {
        ...state,
        dialog: { open: true, mode: action.mode, initial: action.initial, key: state.dialog.key + 1 },
      };
    case 'closeDialog':
      return { ...state, dialog: { ...state.dialog, open: false } };
    case 'save': {
      const { event } = action;
      const exists = state.events.some((e) => e.id === event.id);
      return {
        ...state,
        events: exists ? state.events.map((e) => (e.id === event.id ? event : e)) : [...state.events, event],
        selectedId: event.id,
        panelTick: state.panelTick + 1,
        // A brand-new block should be visible right away.
        anchor: exists ? state.anchor : fromISO(event.date),
        filterId: exists ? state.filterId : 'all',
        query: exists ? state.query : '',
        dialog: { ...state.dialog, open: false },
        snack: note(exists ? 'Block updated' : 'Block added'),
      };
    }
    case 'patch':
      return {
        ...state,
        events: state.events.map((e) => (e.id === action.id ? { ...e, ...action.changes } : e)),
        snack: action.message ? note(action.message) : state.snack,
      };
    case 'delete': {
      const target = state.events.find((e) => e.id === action.id);
      if (!target) return state;
      const events = state.events.filter((e) => e.id !== action.id);
      return {
        ...state,
        events,
        selectedId: state.selectedId === action.id ? pickDefaultSelected(events) : state.selectedId,
        dialog: { ...state.dialog, open: false },
        snack: note(`“${target.title}” deleted`, { undo: target }),
      };
    }
    case 'restore':
      return {
        ...state,
        events: [...state.events, action.event],
        selectedId: action.event.id,
        snack: note('Block restored'),
      };
    case 'snack':
      return { ...state, snack: note(action.message) };
    case 'reset': {
      const events = freshEvents();
      return {
        ...state,
        events,
        selectedId: pickDefaultSelected(events),
        filterId: 'all',
        query: '',
        anchor: startOfDay(new Date()),
        snack: note('Demo data restored'),
      };
    }
    default:
      return state;
  }
}

export function ScheduleProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ events: state.events, focusMode: state.focusMode }));
    } catch {
      /* storage unavailable: the app still works, it just will not persist */
    }
  }, [state.events, state.focusMode]);

  const actions = useMemo(
    () => ({
      select: (id) => dispatch({ type: 'select', id }),
      setMenu: (menu) => dispatch({ type: 'menu', menu }),
      setView: (view) => dispatch({ type: 'view', view }),
      setFilter: (id) => dispatch({ type: 'filter', id }),
      setQuery: (query) => dispatch({ type: 'query', query }),
      toggleFocus: () => dispatch({ type: 'focus' }),
      shift: (dir) => dispatch({ type: 'shift', dir }),
      goToday: () => dispatch({ type: 'today' }),
      goTo: (date, view) => dispatch({ type: 'goTo', date, view }),
      openCreate: (initial = {}) => dispatch({ type: 'openDialog', mode: 'create', initial }),
      openEdit: (event) => dispatch({ type: 'openDialog', mode: 'edit', initial: event }),
      closeDialog: () => dispatch({ type: 'closeDialog' }),
      save: (event) => dispatch({ type: 'save', event }),
      patch: (id, changes, message) => dispatch({ type: 'patch', id, changes, message }),
      remove: (id) => dispatch({ type: 'delete', id }),
      restore: (event) => dispatch({ type: 'restore', event }),
      notify: (message) => dispatch({ type: 'snack', message }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [],
  );

  const visibleEvents = useMemo(() => {
    const filter = FILTERS.find((f) => f.id === state.filterId) ?? FILTERS[0];
    const q = state.query.trim().toLowerCase();
    return state.events.filter((ev) => {
      if (filter.categories && !filter.categories.includes(ev.category)) return false;
      if (!q) return true;
      return [ev.title, ev.location, ev.locationNote, ev.summary, CATEGORIES[ev.category]?.label]
        .filter(Boolean)
        .some((t) => t.toLowerCase().includes(q));
    });
  }, [state.events, state.filterId, state.query]);

  // The time grid grows if any block starts before or ends after the default window.
  const hourRange = useMemo(() => {
    let start = DEFAULT_START_HOUR;
    let end = DEFAULT_END_HOUR;
    state.events.forEach((ev) => {
      start = Math.min(start, Math.floor(toMinutes(ev.start) / 60));
      end = Math.max(end, Math.ceil(toMinutes(ev.end) / 60));
    });
    return { start, end };
  }, [state.events]);

  const value = useMemo(
    () => ({
      ...state,
      actions,
      visibleEvents,
      hourRange,
      navView: navViewOf(state),
      selectedEvent: state.events.find((e) => e.id === state.selectedId) ?? null,
    }),
    [state, actions, visibleEvents, hourRange],
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used inside <ScheduleProvider>');
  return ctx;
}
