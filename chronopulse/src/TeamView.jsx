import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useSchedule } from './ScheduleContext';
import UserAvatar from './UserAvatar';
import { TEAM } from './constants';
import { addDays, formatHours, startOfWeek, toISO, toMinutes } from './dates';

export default function TeamView() {
  const { events, anchor } = useSchedule();

  const rows = useMemo(() => {
    const start = startOfWeek(anchor);
    const isos = Array.from({ length: 7 }, (_, i) => toISO(addDays(start, i)));
    const week = events.filter((e) => isos.includes(e.date));
    return TEAM.map((user) => {
      const mine = week.filter((e) => e.collaborators.includes(user.id));
      const mins = mine.reduce((s, e) => s + toMinutes(e.end) - toMinutes(e.start), 0);
      return { user, blocks: mine.length, mins };
    });
  }, [events, anchor]);

  return (
    <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto', display: 'grid', gap: 2, alignContent: 'start' }}>
      <Typography variant="h6">Team this week</Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
        {rows.map(({ user, blocks, mins }) => (
          <Paper key={user.id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <UserAvatar user={user} size={44} />
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 700 }}>
                {user.name}
              </Typography>
              <Typography noWrap variant="caption" color="text.secondary">
                {user.role}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: 'primary.main', fontWeight: 600 }}>
                {blocks} {blocks === 1 ? 'block' : 'blocks'} · {formatHours(mins)}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
