import React, { useMemo } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSchedule } from './ScheduleContext';
import useNow from './useNow';
import { CATEGORIES } from './constants';
import { addDays, byStart, daysInMonth, isSameDay, startOfMonth, toISO, weekdayShort } from './dates';
import { tokens } from './theme';

const MAX_CHIPS = 3;

export default function MonthGrid() {
  const { anchor, visibleEvents, selectedId, actions } = useSchedule();
  const now = useNow(60000);

  const first = startOfMonth(anchor);
  const leading = (first.getDay() + 6) % 7; // Monday-first
  const weeks = Math.ceil((leading + daysInMonth(anchor)) / 7);
  const gridStart = addDays(first, -leading);
  const cells = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i));
  const headers = cells.slice(0, 7);

  const byDate = useMemo(() => {
    const map = new Map();
    [...visibleEvents].sort(byStart).forEach((ev) => map.set(ev.date, [...(map.get(ev.date) ?? []), ev]));
    return map;
  }, [visibleEvents]);

  return (
    <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'auto' }}>
      <Box sx={{ minWidth: 720, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderBottom: 1, borderColor: 'divider' }}>
          {headers.map((d) => (
            <Typography key={d.getDay()} variant="caption" sx={{ p: 1, fontWeight: 700, color: 'text.secondary' }}>
              {weekdayShort(d)}
            </Typography>
          ))}
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gridTemplateRows: `repeat(${weeks}, minmax(112px, 1fr))`,
          }}
        >
          {cells.map((day) => {
            const iso = toISO(day);
            const items = byDate.get(iso) ?? [];
            const inMonth = day.getMonth() === anchor.getMonth();
            const isToday = isSameDay(day, now);
            return (
              <Box
                key={iso}
                sx={{
                  p: 0.75,
                  minWidth: 0,
                  borderRight: 1,
                  borderBottom: 1,
                  borderColor: 'divider',
                  opacity: inMonth ? 1 : 0.45,
                  bgcolor: isToday ? alpha(tokens.accent, 0.04) : 'transparent',
                }}
              >
                <ButtonBase
                  onClick={() => actions.goTo(day, 'Day')}
                  aria-label={`Open ${day.toDateString()}`}
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    mb: 0.5,
                    fontSize: 12,
                    fontWeight: 700,
                    bgcolor: isToday ? 'primary.main' : 'transparent',
                    color: isToday ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  {day.getDate()}
                </ButtonBase>

                <Box sx={{ display: 'grid', gap: 0.5 }}>
                  {items.slice(0, MAX_CHIPS).map((ev) => {
                    const cat = CATEGORIES[ev.category] ?? CATEGORIES.Team;
                    return (
                      <ButtonBase
                        key={ev.id}
                        onClick={() => actions.select(ev.id)}
                        aria-label={`${ev.title}, ${ev.start} to ${ev.end}`}
                        sx={{
                          justifyContent: 'flex-start',
                          gap: 0.75,
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 1,
                          minWidth: 0,
                          width: '100%',
                          bgcolor: selectedId === ev.id ? alpha(cat.color, 0.22) : alpha(cat.color, 0.1),
                          outline: selectedId === ev.id ? `1px solid ${cat.color}` : 'none',
                        }}
                      >
                        <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: cat.color, flexShrink: 0 }} />
                        <Typography component="span" noWrap sx={{ fontSize: 11, textAlign: 'left' }}>
                          <Box component="span" sx={{ opacity: 0.7, mr: 0.5 }}>
                            {ev.start}
                          </Box>
                          {ev.title}
                        </Typography>
                      </ButtonBase>
                    );
                  })}
                  {items.length > MAX_CHIPS && (
                    <ButtonBase
                      onClick={() => actions.goTo(day, 'Day')}
                      sx={{ justifyContent: 'flex-start', px: 0.75, fontSize: 11, color: 'text.secondary' }}
                    >
                      +{items.length - MAX_CHIPS} more
                    </ButtonBase>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
