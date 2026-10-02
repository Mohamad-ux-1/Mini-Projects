import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useSchedule } from './ScheduleContext';
import { CATEGORIES } from './constants';
import { addDays, formatHours, formatRange, startOfWeek, toISO, toMinutes, weekdayShort } from './dates';
import { tokens } from './theme';
import PieChart from './PieChart';

const minutesOf = (e) => toMinutes(e.end) - toMinutes(e.start);

function Stat({ label, value }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.3 }}>{value}</Typography>
    </Paper>
  );
}

export default function AnalyticsView() {
  const { events, anchor } = useSchedule();

  const stats = useMemo(() => {
    const weekStart = startOfWeek(anchor);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const isos = days.map(toISO);
    const week = events.filter((e) => isos.includes(e.date));

    const totalMins = week.reduce((s, e) => s + minutesOf(e), 0);
    const focusMins = week.filter((e) => e.category === 'Focus').reduce((s, e) => s + minutesOf(e), 0);
    const items = week.flatMap((e) => e.checklist);
    const donePct = items.length ? Math.round((items.filter((i) => i.done).length / items.length) * 100) : 0;

    const byCategory = Object.entries(CATEGORIES).map(([key, c]) => ({
      key,
      label: c.label,
      color: c.color,
      mins: week.filter((e) => e.category === key).reduce((s, e) => s + minutesOf(e), 0),
    }));
    const byDay = days.map((d, i) => ({
      label: weekdayShort(d),
      mins: week.filter((e) => e.date === isos[i]).reduce((s, e) => s + minutesOf(e), 0),
    }));

    return { count: week.length, totalMins, focusMins, donePct, byCategory, byDay };
  }, [events, anchor]);

  const maxDay = Math.max(...stats.byDay.map((d) => d.mins), 60);

  return (
    <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto', display: 'grid', gap: 2, alignContent: 'start' }}>
      <Typography variant="h6">Week of {formatRange('Week', anchor)}</Typography>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' } }}>
        <Stat label="Scheduled time" value={formatHours(stats.totalMins)} />
        <Stat label="Deep focus" value={formatHours(stats.focusMins)} />
        <Stat label="Blocks" value={stats.count} />
        <Stat label="Subtasks done" value={`${stats.donePct}%`} />
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' } }}>
        <Paper sx={{ p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Time by category</Typography>
          <PieChart
            data={stats.byCategory.map((c) => ({ key: c.key, label: c.label, color: c.color, value: c.mins }))}
            centerLabel={formatHours(stats.totalMins)}
            centerSub="Total"
            formatValue={formatHours}
          />
        </Paper>

        <Paper sx={{ p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Daily load</Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 160 }}>
            {stats.byDay.map((d) => (
              <Box key={d.label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 0.75 }}>
                <Typography variant="caption" color="text.secondary">
                  {d.mins ? formatHours(d.mins) : ''}
                </Typography>
                <Box
                  role="img"
                  aria-label={`${d.label}: ${formatHours(d.mins)}`}
                  sx={{ width: '100%', maxWidth: 36, height: `${Math.max((d.mins / maxDay) * 100, 3)}%`, minHeight: 4, borderRadius: 1, bgcolor: d.mins ? 'primary.main' : tokens.border }}
                />
                <Typography variant="caption" color="text.secondary">
                  {d.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
