import React, { useEffect, useMemo, useRef } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSchedule } from './ScheduleContext';
import EventCard from './EventCard';
import useNow from './useNow';
import { layoutDay } from './layout';
import { HOUR_HEIGHT } from './constants';
import { useTheme, useMediaQuery } from '@mui/material';
import {
  addDays,
  fromMinutes,
  getStatus,
  isSameDay,
  pad,
  startOfDay,
  startOfWeek,
  toISO,
  toMinutes,
  weekdayShort,
} from './dates';
import { tokens } from './theme';

const GUTTER = 56;
const COL_MIN = 128;
const PPM = HOUR_HEIGHT / 60; // pixels per minute

export default function TimeGrid() {
  const { view, anchor, visibleEvents, hourRange, selectedId, focusMode, actions } = useSchedule();
  const now = useNow(30000);
  const scrollRef = useRef(null);

  const days = useMemo(
    () => (view === 'Day' ? [startOfDay(anchor)] : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(anchor), i))),
    [view, anchor],
  );

  const byDate = useMemo(() => {
    const map = new Map();
    visibleEvents.forEach((ev) => map.set(ev.date, [...(map.get(ev.date) ?? []), ev]));
    return map;
  }, [visibleEvents]);

  const startMin = hourRange.start * 60;
  const totalHours = hourRange.end - hourRange.start;
  const bodyHeight = totalHours * HOUR_HEIGHT;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const columns = `${GUTTER}px repeat(${days.length}, minmax(0, 1fr))`;

  // Open the grid scrolled to the current time when today is visible.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const n = new Date();
    const showsToday = days.some((d) => isSameDay(d, n));
    const minutes = n.getHours() * 60 + n.getMinutes();
    el.scrollTop = showsToday ? Math.max(0, (minutes - startMin - 90) * PPM) : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, anchor]);

  // Clicking an empty slot starts a new block at that time (snapped to 30 minutes).
  const handleColumnClick = (e, day) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const minutes = Math.floor((startMin + (e.clientY - rect.top) / PPM) / 30) * 30;
    const start = Math.min(Math.max(minutes, 0), 22 * 60 + 30);
    actions.openCreate({ date: toISO(day), start: fromMinutes(start), end: fromMinutes(start + 60) });
  };

  const gridLines = `repeating-linear-gradient(to bottom, transparent 0, transparent ${HOUR_HEIGHT - 1}px, ${tokens.border} ${HOUR_HEIGHT - 1}px, ${tokens.border} ${HOUR_HEIGHT}px)`;

  return (
    <Box ref={scrollRef} sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'auto', position: 'relative' }}>
      <Box sx={{ minWidth: GUTTER + days.length * COL_MIN }}>
        {/* Day headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: columns,
            position: 'sticky',
            top: 0,
            zIndex: 6,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-end', px: 1, pb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Time
            </Typography>
          </Box>
          {days.map((day) => {
            const isToday = isSameDay(day, now);
            const weekend = day.getDay() === 0 || day.getDay() === 6;
            return (
              <ButtonBase
                key={toISO(day)}
                disabled={view === 'Day'}
                onClick={() => actions.goTo(day, 'Day')}
                aria-label={`Open ${day.toDateString()}`}
                sx={{
                  flexDirection: 'column',
                  gap: 0.5,
                  py: 1,
                  borderLeft: 1,
                  borderColor: 'divider',
                  color: weekend ? 'text.secondary' : 'text.primary',
                  '&.Mui-disabled': { color: weekend ? 'text.secondary' : 'text.primary' },
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {weekdayShort(day)}
                </Typography>
                {isToday ? (
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 99,
                      bgcolor: alpha(tokens.accent, 0.18),
                      color: 'primary.main',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Today • {day.getDate()}
                  </Box>
                ) : (
                  <Typography sx={{ fontWeight: 700, fontSize: 18, lineHeight: 1.4 }}>{day.getDate()}</Typography>
                )}
              </ButtonBase>
            );
          })}
        </Box>

        {/* Body */}
        <Box sx={{ display: 'grid', gridTemplateColumns: columns }}>
          <Box sx={{ position: 'relative', height: bodyHeight }}>
            {Array.from({ length: totalHours }, (_, i) => (
              <Typography
                key={i}
                variant="caption"
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: `${i * HOUR_HEIGHT}px`,
                  transform: i === 0 ? 'none' : 'translateY(-50%)',
                  color: 'text.secondary',
                  fontSize: 11,
                }}
              >
                {pad(hourRange.start + i)}:00
              </Typography>
            ))}
          </Box>

          {days.map((day) => {
            const iso = toISO(day);
            const isToday = isSameDay(day, now);
            const items = layoutDay(byDate.get(iso) ?? []);
            return (
              <Box
                key={iso}
                onClick={(e) => handleColumnClick(e, day)}
                sx={{
                  position: 'relative',
                  height: bodyHeight,
                  borderLeft: 1,
                  borderColor: 'divider',
                  cursor: 'cell',
                  bgcolor: isToday ? alpha(tokens.accent, 0.04) : 'transparent',
                  backgroundImage: gridLines,
                }}
              >
                {items.length === 0 && (
                  <Typography
                    variant="caption"
                    sx={{ position: 'absolute', top: 8, left: 0, right: 0, textAlign: 'center', color: 'text.secondary', opacity: 0.6, pointerEvents: 'none' }}
                  >
                    No blocks scheduled
                  </Typography>
                )}

                {items.map(({ event, col, cols }) => {
                  const s = toMinutes(event.start);
                  const e = toMinutes(event.end);
                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      top={(s - startMin) * PPM}
                      height={(e - s) * PPM}
                      leftPct={(col / cols) * 100}
                      widthPct={100 / cols}
                      active={getStatus(event, now) === 'active'}
                      selected={selectedId === event.id}
                      dimmed={focusMode && event.category !== 'Focus'}
                      onSelect={actions.select}
                    />
                  );
                })}

                {isToday && nowMin >= startMin && nowMin <= hourRange.end * 60 && (
                  <Box
                    aria-hidden
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: `${(nowMin - startMin) * PPM}px`,
                      height: 2,
                      bgcolor: 'primary.main',
                      zIndex: 4,
                      pointerEvents: 'none',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: -5,
                        top: -4,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        boxShadow: `0 0 0 3px ${tokens.surface}`,
                      },
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
