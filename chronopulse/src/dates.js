// Small date helpers (no dependencies). Weeks start on Monday.
// Events store `date` as 'YYYY-MM-DD' and `start`/`end` as 'HH:MM' in local time.

export const pad = (n) => String(n).padStart(2, '0');

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromISO = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
export const daysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

export const addMonths = (d, n) => {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), daysInMonth(target)));
};

export const startOfWeek = (d) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));

export const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const fromMinutes = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

export const eventStart = (ev) => {
  const d = fromISO(ev.date);
  d.setMinutes(toMinutes(ev.start));
  return d;
};

export const eventEnd = (ev) => {
  const d = fromISO(ev.date);
  d.setMinutes(toMinutes(ev.end));
  return d;
};

export const byStart = (a, b) => eventStart(a) - eventStart(b);

/** 'upcoming' | 'active' | 'done' relative to `now`. */
export const getStatus = (ev, now) => {
  if (now < eventStart(ev)) return 'upcoming';
  if (now >= eventEnd(ev)) return 'done';
  return 'active';
};

const fmt = (d, opts) => new Intl.DateTimeFormat('en-US', opts).format(d);

export const weekdayShort = (d) => fmt(d, { weekday: 'short' });

export const format12 = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const formatLongDate = (iso) =>
  fmt(fromISO(iso), { weekday: 'long', month: 'short', day: 'numeric' });

export const formatDayHeading = (iso) =>
  fmt(fromISO(iso), { weekday: 'long', month: 'long', day: 'numeric' });

/** Label for the top bar: 'Oct 23 – Oct 29, 2023', 'Mon, Oct 23, 2023' or 'October 2023'. */
export const formatRange = (view, anchor) => {
  if (view === 'Day') return fmt(anchor, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  if (view === 'Month') return fmt(anchor, { month: 'long', year: 'numeric' });
  const s = startOfWeek(anchor);
  const e = addDays(s, 6);
  if (s.getFullYear() !== e.getFullYear()) {
    const full = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${fmt(s, full)} – ${fmt(e, full)}`;
  }
  const short = { month: 'short', day: 'numeric' };
  return `${fmt(s, short)} – ${fmt(e, short)}, ${e.getFullYear()}`;
};

/** 45 -> '45m', 90 -> '1h 30m', 3000 -> '2d 2h'. */
export const formatSpan = (totalMinutes) => {
  const m = Math.max(0, Math.round(totalMinutes));
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const r = m % 60;
  if (d) return `${d}d ${h}h`;
  if (h) return r ? `${h}h ${r}m` : `${h}h`;
  return `${r}m`;
};

export const formatHours = (mins) => `${Math.round(mins / 6) / 10}h`;
