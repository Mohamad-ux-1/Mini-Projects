import React, { useEffect, useState } from 'react';
import {
  AvatarGroup,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  InputBase,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Switch,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import BookmarkBorderRounded from '@mui/icons-material/BookmarkBorderRounded';
import BookmarkRounded from '@mui/icons-material/BookmarkRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import VideocamOutlined from '@mui/icons-material/VideocamOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import AddCircleOutlineRounded from '@mui/icons-material/AddCircleOutlineRounded';
import PersonAddAltRounded from '@mui/icons-material/PersonAddAltRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import EventOutlined from '@mui/icons-material/EventOutlined';
import { useSchedule } from './ScheduleContext';
import UserAvatar, { avatarSx, initials } from './UserAvatar';
import useNow from './useNow';
import { CATEGORIES, TEAM } from './constants';
import { eventEnd, eventStart, format12, formatLongDate, formatSpan, getStatus, toISO } from './dates';
import { tokens } from './theme';

const STATUS_LABEL = { active: 'ACTIVE NOW', upcoming: 'UPCOMING', done: 'COMPLETED' };

const sectionLabel = { display: 'block', mb: 1, fontWeight: 700, letterSpacing: 0.6, color: 'text.secondary', fontSize: 11 };

function StatusChip({ status }) {
  const styles = {
    active: { bgcolor: 'primary.main', color: 'primary.contrastText' },
    upcoming: { bgcolor: alpha(tokens.accent, 0.12), color: 'primary.main' },
    done: { bgcolor: tokens.raised, color: 'text.secondary' },
  }[status];
  return <Chip size="small" label={STATUS_LABEL[status]} sx={{ fontWeight: 700, fontSize: 11, height: 24, ...styles }} />;
}

function ProfileCard({ onClose }) {
  const { focusMode, actions } = useSchedule();
  const me = TEAM[0];
  return (
    <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
      <UserAvatar user={me} size={40} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{me.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {me.role}
        </Typography>
      </Box>
      <Box
        component="label"
        sx={{ display: 'flex', alignItems: 'center', pl: 1.25, pr: 0.25, borderRadius: 99, border: 1, borderColor: 'divider', bgcolor: 'background.default', cursor: 'pointer' }}
      >
        <Typography component="span" sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1.1 }}>
          Focus
          <br />
          Mode
        </Typography>
        <Switch size="small" checked={focusMode} onChange={actions.toggleFocus} />
      </Box>
      {onClose && (
        <IconButton aria-label="Close panel" onClick={onClose} size="small">
          <CloseRounded fontSize="small" />
        </IconButton>
      )}
    </Paper>
  );
}

function EventDetails({ event }) {
  const { actions } = useSchedule();
  const now = useNow(30000);

  // Checklist and collaborators are edited as a draft; "Save changes" commits, "Cancel" reverts.
  const [checklist, setChecklist] = useState(event.checklist);
  const [collabIds, setCollabIds] = useState(event.collaborators);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [moreEl, setMoreEl] = useState(null);
  const [teamEl, setTeamEl] = useState(null);

  useEffect(() => {
    setChecklist(event.checklist);
    setCollabIds(event.collaborators);
  }, [event.checklist, event.collaborators]);

  const dirty =
    JSON.stringify(checklist) !== JSON.stringify(event.checklist) ||
    JSON.stringify(collabIds) !== JSON.stringify(event.collaborators);

  const status = getStatus(event, now);
  const start = eventStart(event);
  const end = eventEnd(event);
  const total = (end - start) / 60000;
  const elapsed = status === 'done' ? total : status === 'active' ? (now - start) / 60000 : 0;
  const pct = Math.round((elapsed / total) * 100);

  const progressLabel = { active: `Session Elapsed (${pct}%)`, upcoming: 'Not started yet', done: 'Session finished' }[status];
  const progressAside = {
    active: `${formatSpan(total - elapsed)} remaining`,
    upcoming: `Starts in ${formatSpan((start - now) / 60000)}`,
    done: 'Completed',
  }[status];

  const doneCount = checklist.filter((i) => i.done).length;
  const donePct = checklist.length ? Math.round((doneCount / checklist.length) * 100) : 0;
  const cat = CATEGORIES[event.category] ?? CATEGORIES.Team;
  const collaborators = collabIds.map((id) => TEAM.find((u) => u.id === id)).filter(Boolean);

  const toggle = (id) => setChecklist((list) => list.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const remove = (id) => setChecklist((list) => list.filter((i) => i.id !== id));
  const commitItem = () => {
    const text = newText.trim();
    if (!text) return;
    setChecklist((list) => [...list, { id: `c-${Date.now()}`, text, done: false }]);
    setNewText('');
  };
  const toggleCollab = (id) =>
    setCollabIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  const revert = () => {
    setChecklist(event.checklist);
    setCollabIds(event.collaborators);
    setAdding(false);
    setNewText('');
  };

  return (
    <Paper sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <StatusChip status={status} />
          <Box>
            <IconButton
              size="small"
              aria-label={event.pinned ? 'Unpin block' : 'Pin block'}
              aria-pressed={Boolean(event.pinned)}
              onClick={() => actions.patch(event.id, { pinned: !event.pinned })}
              sx={{ color: event.pinned ? 'primary.main' : 'text.secondary' }}
            >
              {event.pinned ? <BookmarkRounded fontSize="small" /> : <BookmarkBorderRounded fontSize="small" />}
            </IconButton>
            <IconButton size="small" aria-label="More actions" onClick={(e) => setMoreEl(e.currentTarget)} sx={{ color: 'text.secondary' }}>
              <MoreVertRounded fontSize="small" />
            </IconButton>
            <Menu anchorEl={moreEl} open={Boolean(moreEl)} onClose={() => setMoreEl(null)}>
              <MenuItem
                onClick={() => {
                  setMoreEl(null);
                  actions.openEdit(event);
                }}
              >
                Edit block
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMoreEl(null);
                  actions.remove(event.id);
                }}
                sx={{ color: 'error.main' }}
              >
                Delete block
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontSize: 20, lineHeight: 1.25, mb: 1 }}>
          {event.title}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 2.5 }}>
          {formatLongDate(event.date)} • {format12(event.start)} – {format12(event.end)}
          <br />({total} mins) • <Box component="span" sx={{ color: cat.color }}>{cat.label}</Box>
        </Typography>

        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {progressLabel}
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
              {progressAside}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pct}
            aria-label="Session progress"
            sx={{ height: 6, borderRadius: 3, bgcolor: tokens.border, '& .MuiLinearProgress-bar': { borderRadius: 3 } }}
          />
        </Box>

        {(event.location || event.link) && (
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, mb: 3, borderRadius: 2, border: 1, borderColor: 'divider', bgcolor: 'background.default' }}
          >
            {event.link ? <VideocamOutlined sx={{ color: 'primary.main' }} /> : <PlaceOutlined sx={{ color: 'primary.main' }} />}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 700, fontSize: 13 }}>
                {event.location || 'Online'}
              </Typography>
              <Typography noWrap variant="caption" color="text.secondary">
                {event.locationNote || cat.label}
              </Typography>
            </Box>
            {event.link && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                component="a"
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<VideocamOutlined />}
                disabled={status === 'done'}
                sx={{ borderColor: 'divider' }}
              >
                Join
              </Button>
            )}
          </Box>
        )}

        <Typography variant="overline" sx={sectionLabel}>
          SUMMARY
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
          {event.summary || 'No summary yet. Use “Edit block” to add one.'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="overline" sx={{ ...sectionLabel, mb: 0 }}>
            CHECKLIST ({doneCount}/{checklist.length})
          </Typography>
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {donePct}% Done
          </Typography>
        </Box>

        {checklist.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              '& .rm': { opacity: 0, '@media (hover: none)': { opacity: 1 } },
              '&:hover .rm, &:focus-within .rm': { opacity: 1 },
            }}
          >
            <Checkbox
              checked={item.done}
              onChange={() => toggle(item.id)}
              icon={<RadioButtonUncheckedRounded />}
              checkedIcon={<CheckCircleRounded />}
              inputProps={{ 'aria-label': item.text }}
              sx={{ p: 0.5, mr: 0.5, color: 'text.secondary', '&.Mui-checked': { color: 'primary.main' } }}
            />
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                mt: 0.5,
                textDecoration: item.done ? 'line-through' : 'none',
                color: item.done ? 'text.secondary' : 'text.primary',
              }}
            >
              {item.text}
            </Typography>
            <IconButton className="rm" size="small" aria-label={`Remove ${item.text}`} onClick={() => remove(item.id)} sx={{ color: 'text.secondary' }}>
              <CloseRounded sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        ))}

        {adding ? (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
            <InputBase
              autoFocus
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitItem();
                }
                if (e.key === 'Escape') {
                  setAdding(false);
                  setNewText('');
                }
              }}
              placeholder="Describe the subtask"
              inputProps={{ 'aria-label': 'New subtask' }}
              sx={{ flex: 1, px: 1.5, py: 0.5, borderRadius: 2, border: 1, borderColor: 'divider', bgcolor: 'background.default', fontSize: 13 }}
            />
            <Button size="small" onClick={commitItem} disabled={!newText.trim()}>
              Add
            </Button>
          </Box>
        ) : (
          <Button
            startIcon={<AddCircleOutlineRounded />}
            onClick={() => setAdding(true)}
            sx={{ mt: 0.5, px: 0, color: 'primary.main', justifyContent: 'flex-start', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
          >
            Add subtask item...
          </Button>
        )}

        <Typography variant="overline" sx={{ ...sectionLabel, mt: 3 }}>
          ASSIGNED COLLABORATORS
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {collaborators.length ? (
            <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { borderColor: tokens.surface, fontSize: 12, width: 32, height: 32 } }}>
              {collaborators.map((u) => (
                <Avatar key={u.id} title={u.name} sx={avatarSx(u, 32)}>
                  {initials(u.name)}
                </Avatar>
              ))}
            </AvatarGroup>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Nobody assigned yet
            </Typography>
          )}
          <IconButton aria-label="Manage collaborators" onClick={(e) => setTeamEl(e.currentTarget)} sx={{ color: 'text.secondary', border: '1px dashed', borderColor: 'divider' }}>
            <PersonAddAltRounded fontSize="small" />
          </IconButton>
          <Menu anchorEl={teamEl} open={Boolean(teamEl)} onClose={() => setTeamEl(null)}>
            {TEAM.map((u) => (
              <MenuItem key={u.id} onClick={() => toggleCollab(u.id)} sx={{ gap: 1 }}>
                <Checkbox size="small" edge="start" checked={collabIds.includes(u.id)} tabIndex={-1} disableRipple sx={{ p: 0.5 }} />
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{u.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {u.role}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button variant="outlined" color="inherit" disabled={!dirty} onClick={revert} sx={{ flex: 1, borderColor: 'divider' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!dirty}
          onClick={() => {
            actions.patch(event.id, { checklist, collaborators: collabIds }, 'Changes saved');
            setAdding(false);
            setNewText('');
          }}
          sx={{ flex: 1 }}
        >
          Save changes
        </Button>
      </Box>
    </Paper>
  );
}

export default function RightPanel({ onClose }) {
  const { selectedEvent, anchor, actions } = useSchedule();

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
      <ProfileCard onClose={onClose} />
      {selectedEvent ? (
        // key resets the draft state whenever a different block is selected
        <EventDetails key={selectedEvent.id} event={selectedEvent} />
      ) : (
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, p: 3, textAlign: 'center' }}>
          <EventOutlined sx={{ fontSize: 36, color: 'text.secondary' }} />
          <Typography sx={{ fontWeight: 700 }}>No block selected</Typography>
          <Typography variant="body2" color="text.secondary">
            Pick a block on the calendar to see its details, or add a new one.
          </Typography>
          <Button variant="contained" size="small" onClick={() => actions.openCreate({ date: toISO(anchor) })}>
            New Schedule Block
          </Button>
        </Paper>
      )}
    </Box>
  );
}
