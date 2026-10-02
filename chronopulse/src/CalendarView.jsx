import React from 'react';
import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSchedule } from './ScheduleContext';
import TimeGrid from './TimeGrid';
import MonthGrid from './MonthGrid';
import { FILTERS, VIEWS } from './constants';
import { tokens } from './theme';

export default function CalendarView() {
  const { view, filterId, query, visibleEvents, actions } = useSchedule();

  return (
    <Paper sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box role="group" aria-label="Schedule filters" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => {
            const active = filterId === f.id;
            return (
              <Chip
                key={f.id}
                label={f.label}
                clickable
                aria-pressed={active}
                onClick={() => actions.setFilter(f.id)}
                sx={{
                  bgcolor: active ? alpha(tokens.accent, 0.14) : 'transparent',
                  color: active ? 'primary.main' : 'text.primary',
                  border: 1,
                  borderColor: active ? 'primary.main' : 'divider',
                  fontWeight: active ? 700 : 500,
                  '&:hover': { bgcolor: active ? alpha(tokens.accent, 0.2) : alpha('#ffffff', 0.05) },
                }}
              />
            );
          })}
        </Box>

        <Box
          role="group"
          aria-label="Calendar view"
          sx={{ display: 'flex', p: 0.5, borderRadius: 99, border: 1, borderColor: 'divider' }}
        >
          {VIEWS.map((v) => {
            const active = view === v;
            return (
              <Button
                key={v}
                size="small"
                aria-pressed={active}
                onClick={() => actions.setView(v)}
                sx={{
                  minWidth: 0,
                  px: 2,
                  bgcolor: active ? 'primary.main' : 'transparent',
                  color: active ? 'primary.contrastText' : 'text.secondary',
                  '&:hover': { bgcolor: active ? 'primary.dark' : alpha('#ffffff', 0.05) },
                }}
              >
                {v}
              </Button>
            );
          })}
        </Box>
      </Box>

      {query.trim() && (
        <Typography role="status" variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>
          {visibleEvents.length} {visibleEvents.length === 1 ? 'block matches' : 'blocks match'} “{query.trim()}”
        </Typography>
      )}

      {view === 'Month' ? <MonthGrid /> : <TimeGrid />}
    </Paper>
  );
}
