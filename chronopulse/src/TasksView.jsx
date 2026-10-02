import React, { useMemo, useState } from 'react';
import { Box, ButtonBase, Chip, LinearProgress, Paper, Tab, Tabs, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import BookmarkRounded from '@mui/icons-material/BookmarkRounded';
import { useSchedule } from './ScheduleContext';
import useNow from './useNow';
import { CATEGORIES } from './constants';
import { byStart, format12, formatDayHeading, getStatus } from './dates';
import { tokens } from './theme';

function TaskRow({ event, status, selected, onSelect }) {
  const cat = CATEGORIES[event.category] ?? CATEGORIES.Team;
  const done = event.checklist.filter((i) => i.done).length;
  const pct = event.checklist.length ? (done / event.checklist.length) * 100 : 0;

  return (
    <ButtonBase
      onClick={() => onSelect(event.id)}
      aria-pressed={selected}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        textAlign: 'left',
        borderRadius: 2,
        borderLeft: `3px solid ${cat.color}`,
        bgcolor: selected ? alpha(tokens.accent, 0.08) : tokens.raised,
        outline: selected ? `1px solid ${tokens.accent}` : 'none',
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 700, fontSize: 13.5 }}>
          {event.pinned && <BookmarkRounded sx={{ fontSize: 14, mr: 0.5, verticalAlign: '-2px', color: 'primary.main' }} />}
          {event.title}
        </Typography>
        <Typography noWrap variant="caption" color="text.secondary">
          {format12(event.start)} – {format12(event.end)}
          {event.location ? ` · ${event.location}` : ''}
        </Typography>
      </Box>
      <Box sx={{ width: 84, display: { xs: 'none', sm: 'block' } }}>
        <Typography variant="caption" color="text.secondary">
          {done}/{event.checklist.length} subtasks
        </Typography>
        <LinearProgress variant="determinate" value={pct} sx={{ height: 4, borderRadius: 2, bgcolor: tokens.border }} />
      </Box>
      <Chip
        size="small"
        label={status === 'active' ? 'Active' : status === 'done' ? 'Done' : 'Upcoming'}
        sx={{
          fontWeight: 700,
          bgcolor: status === 'active' ? 'primary.main' : tokens.border,
          color: status === 'active' ? 'primary.contrastText' : 'text.secondary',
        }}
      />
    </ButtonBase>
  );
}

export default function TasksView() {
  const { visibleEvents, selectedId, actions } = useSchedule();
  const now = useNow(60000);
  const [tab, setTab] = useState('upcoming');

  const { upcoming, past } = useMemo(() => {
    const sorted = [...visibleEvents].sort(byStart);
    return {
      upcoming: sorted.filter((e) => getStatus(e, now) !== 'done'),
      past: sorted.filter((e) => getStatus(e, now) === 'done').reverse(),
    };
  }, [visibleEvents, now]);

  const rows = tab === 'upcoming' ? upcoming : past;
  const pinned = tab === 'upcoming' ? rows.filter((e) => e.pinned) : [];
  const groups = useMemo(() => {
    const map = new Map();
    rows
      .filter((e) => !pinned.includes(e))
      .forEach((e) => map.set(e.date, [...(map.get(e.date) ?? []), e]));
    return [...map.entries()];
  }, [rows, pinned]);

  const renderRows = (list) => (
    <Box sx={{ display: 'grid', gap: 1 }}>
      {list.map((e) => (
        <TaskRow key={e.id} event={e} status={getStatus(e, now)} selected={selectedId === e.id} onSelect={actions.select} />
      ))}
    </Box>
  );

  return (
    <Paper sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary" aria-label="Task filter">
          <Tab value="upcoming" label={`Upcoming (${upcoming.length})`} />
          <Tab value="past" label={`Past (${past.length})`} />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto', p: 2, display: 'grid', gap: 2, alignContent: 'start' }}>
        {rows.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
            {tab === 'upcoming' ? 'Nothing coming up. Use “New Schedule Block” to plan something.' : 'No past blocks yet.'}
          </Typography>
        )}

        {pinned.length > 0 && (
          <Box>
            <Typography variant="overline" sx={{ display: 'block', mb: 1, fontWeight: 700, color: 'text.secondary' }}>
              PINNED
            </Typography>
            {renderRows(pinned)}
          </Box>
        )}

        {groups.map(([date, list]) => (
          <Box key={date}>
            <Typography variant="overline" sx={{ display: 'block', mb: 1, fontWeight: 700, color: 'text.secondary' }}>
              {formatDayHeading(date)}
            </Typography>
            {renderRows(list)}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
