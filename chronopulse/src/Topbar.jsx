import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  IconButton,
  InputBase,
  ListSubheader,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import MenuRounded from '@mui/icons-material/MenuRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import NotificationsNoneRounded from '@mui/icons-material/NotificationsNoneRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import { useSchedule } from './ScheduleContext';
import UserAvatar from './UserAvatar';
import useNow from './useNow';
import { TEAM } from './constants';
import { byStart, eventStart, format12, formatRange, fromISO, getStatus, isSameDay, toISO } from './dates';
import { tokens } from './theme';

const hidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

export default function Topbar({ onMenuClick }) {
  const { activeMenu, navView, anchor, query, events, actions } = useSchedule();
  const now = useNow(30000);
  const searchRef = useRef(null);
  const [bellEl, setBellEl] = useState(null);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent);
  const showNav = activeMenu === 'Timetable/Schedule' || activeMenu === 'Analytics';

  // Cmd/Ctrl + K focuses the search field.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const upNext = useMemo(
    () =>
      events
        .filter((e) => getStatus(e, now) !== 'done' && isSameDay(eventStart(e), now))
        .sort(byStart)
        .slice(0, 5),
    [events, now],
  );

  return (
    <Box
      component="header"
      sx={{
        width: '100%',
          display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
        px: { xs: 1.5, md: 2.5 },
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <IconButton aria-label="Open navigation" onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
        <MenuRounded />
      </IconButton>

      <Paper
        component="label"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          height: 40,
          flex: '1 1 220px',
          maxWidth: 360,
          borderRadius: 99,
          cursor: 'text',
        }}
      >
        <Box component="span" sx={hidden}>
          Search schedules and tasks
        </Box>
        <SearchRounded fontSize="small" sx={{ color: 'text.secondary' }} />
        <InputBase
          inputRef={searchRef}
          value={query}
          onChange={(e) => actions.setQuery(e.target.value)}
          placeholder="Search schedules, tasks..."
          sx={{ flex: 1, fontSize: 13 }}
        />
        {query ? (
          <IconButton size="small" aria-label="Clear search" onClick={() => actions.setQuery('')}>
            <CloseRounded fontSize="inherit" />
          </IconButton>
        ) : (
          <Box
            component="kbd"
            sx={{
              display: { xs: 'none', sm: 'block' },
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              bgcolor: tokens.raised,
              color: 'text.secondary',
              fontFamily: 'inherit',
              fontSize: 11,
            }}
          >
            {isMac ? '⌘ K' : 'Ctrl K'}
          </Box>
        )}
      </Paper>

      {showNav && (
        <>
          <Paper sx={{ display: 'flex', alignItems: 'center', px: 0.5, height: 40, borderRadius: 99 }}>
            <IconButton size="small" aria-label={`Previous ${navView.toLowerCase()}`} onClick={() => actions.shift(-1)}>
              <ChevronLeftRounded />
            </IconButton>
            <Typography
              aria-live="polite"
              sx={{ fontWeight: 700, fontSize: 13, px: 1, minWidth: { xs: 0, sm: 150 }, textAlign: 'center' }}
            >
              {formatRange(navView, anchor)}
            </Typography>
            <IconButton size="small" aria-label={`Next ${navView.toLowerCase()}`} onClick={() => actions.shift(1)}>
              <ChevronRightRounded />
            </IconButton>
          </Paper>
          <Button size="small" variant="outlined" color="inherit" onClick={actions.goToday} sx={{ borderColor: 'divider' }}>
            Today
          </Button>
        </>
      )}

      <Box sx={{ flex: 1 }} />

      <IconButton aria-label="Up next today" onClick={(e) => setBellEl(e.currentTarget)}>
        <Badge color="primary" variant="dot" invisible={upNext.length === 0}>
          <NotificationsNoneRounded />
        </Badge>
      </IconButton>
      <Menu anchorEl={bellEl} open={Boolean(bellEl)} onClose={() => setBellEl(null)}>
        <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '28px' }}>Up next today</ListSubheader>
        {upNext.length === 0 && <MenuItem disabled>Nothing left today</MenuItem>}
        {upNext.map((ev) => (
          <MenuItem
            key={ev.id}
            onClick={() => {
              actions.goTo(fromISO(ev.date));
              actions.select(ev.id);
              setBellEl(null);
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{ev.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {format12(ev.start)} – {format12(ev.end)}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      <Button
        variant="contained"
        startIcon={<AddRounded />}
        onClick={() => actions.openCreate({ date: toISO(anchor) })}
        sx={{ '&:hover': { bgcolor: alpha(tokens.accent, 0.85) } }}
      >
        New Schedule Block
      </Button>

      <UserAvatar user={TEAM[0]} size={34} />
    </Box>
  );
}
