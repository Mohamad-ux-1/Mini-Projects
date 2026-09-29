import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSchedule } from './ScheduleContext';
import { CATEGORIES, CURRENT_USER_ID } from './constants';
import { format12, pad, toISO, toMinutes } from './dates';

const makeId = () => `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Give the block a title.';
  if (!form.date) errors.date = 'Pick a date.';
  if (!form.start) errors.start = 'Set a start time.';
  if (!form.end) errors.end = 'Set an end time.';
  else if (form.start && toMinutes(form.end) <= toMinutes(form.start)) errors.end = 'End must be after the start.';
  if (form.link.trim() && !/^https?:\/\//i.test(form.link.trim())) errors.link = 'Link must start with http:// or https://';
  return errors;
}

function Field({ id, label, optional, children }) {
  return (
    <Box>
      <Typography
        component="label"
        htmlFor={id}
        sx={{ display: 'block', mb: 0.5, fontSize: 12, fontWeight: 600, color: 'text.secondary' }}
      >
        {label}
        {optional && <Box component="span" sx={{ fontWeight: 400 }}> (optional)</Box>}
      </Typography>
      {children}
    </Box>
  );
}

const dark = { '& input': { colorScheme: 'dark' } };

function EventForm({ mode, initial, events, actions }) {
  const [form, setForm] = useState(() => {
    const nextHour = Math.min(Math.max(new Date().getHours() + 1, 8), 22);
    return {
      title: initial?.title ?? '',
      category: initial?.category ?? 'Design',
      date: initial?.date ?? toISO(new Date()),
      start: initial?.start ?? `${pad(nextHour)}:00`,
      end: initial?.end ?? `${pad(nextHour + 1)}:00`,
      location: initial?.location ?? '',
      link: initial?.link ?? '',
      summary: initial?.summary ?? '',
    };
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const errors = useMemo(() => validate(form), [form]);
  const show = (key) => submitted && errors[key];

  // Overlaps are allowed (blocks are drawn side by side) but worth a heads-up.
  const overlap = useMemo(() => {
    if (errors.start || errors.end || errors.date) return null;
    return (
      events.find(
        (e) =>
          e.id !== initial?.id &&
          e.date === form.date &&
          toMinutes(e.start) < toMinutes(form.end) &&
          toMinutes(e.end) > toMinutes(form.start),
      ) ?? null
    );
  }, [events, form.date, form.start, form.end, errors, initial?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) return;

    const base = initial?.id ? initial : {};
    actions.save({
      checklist: [],
      collaborators: [CURRENT_USER_ID],
      pinned: false,
      ...base,
      id: initial?.id ?? makeId(),
      title: form.title.trim(),
      category: form.category,
      date: form.date,
      start: form.start,
      end: form.end,
      location: form.location.trim(),
      link: form.link.trim(),
      summary: form.summary.trim(),
      dnd: form.category === 'Focus',
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <DialogTitle id="event-dialog-title" sx={{ fontWeight: 700 }}>
        {mode === 'edit' ? 'Edit schedule block' : 'New schedule block'}
      </DialogTitle>

      <DialogContent sx={{ display: 'grid', gap: 2, pt: 1 }}>
        <Field id="ev-title" label="Title">
          <TextField
            id="ev-title"
            autoFocus
            fullWidth
            size="small"
            placeholder="e.g. Design review"
            value={form.title}
            onChange={set('title')}
            error={Boolean(show('title'))}
            helperText={show('title') || undefined}
          />
        </Field>

        <Field id="ev-category" label="Category">
          <TextField
            id="ev-category"
            select
            fullWidth
            size="small"
            value={form.category}
            onChange={set('category')}
            inputProps={{ 'aria-label': 'Category' }}
          >
            {Object.entries(CATEGORIES).map(([key, c]) => (
              <MenuItem key={key} value={key}>
                {c.label}
              </MenuItem>
            ))}
          </TextField>
        </Field>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1.4fr 1fr 1fr' } }}>
          <Field id="ev-date" label="Date">
            <TextField id="ev-date" type="date" fullWidth size="small" value={form.date} onChange={set('date')} error={Boolean(show('date'))} helperText={show('date') || undefined} sx={dark} />
          </Field>
          <Field id="ev-start" label="Starts">
            <TextField id="ev-start" type="time" fullWidth size="small" value={form.start} onChange={set('start')} error={Boolean(show('start'))} helperText={show('start') || undefined} sx={dark} />
          </Field>
          <Field id="ev-end" label="Ends">
            <TextField id="ev-end" type="time" fullWidth size="small" value={form.end} onChange={set('end')} error={Boolean(errors.end && (submitted || form.end))} helperText={errors.end && (submitted || form.end) ? errors.end : undefined} sx={dark} />
          </Field>
        </Box>

        {overlap && (
          <Alert severity="warning" variant="outlined">
            Overlaps with “{overlap.title}” ({format12(overlap.start)} – {format12(overlap.end)}). You can still save; both blocks will show side by side.
          </Alert>
        )}

        <Field id="ev-location" label="Location" optional>
          <TextField id="ev-location" fullWidth size="small" placeholder="Room, address or “Video call”" value={form.location} onChange={set('location')} />
        </Field>

        <Field id="ev-link" label="Meeting link" optional>
          <TextField id="ev-link" fullWidth size="small" placeholder="https://" value={form.link} onChange={set('link')} error={Boolean(show('link'))} helperText={show('link') || undefined} />
        </Field>

        <Field id="ev-summary" label="Summary" optional>
          <TextField id="ev-summary" fullWidth multiline minRows={3} size="small" placeholder="What is this block for?" value={form.summary} onChange={set('summary')} />
        </Field>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        {mode === 'edit' && (
          <Button color="error" onClick={() => actions.remove(initial.id)} sx={{ mr: 'auto' }}>
            Delete
          </Button>
        )}
        <Button color="inherit" onClick={actions.closeDialog}>
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          {mode === 'edit' ? 'Save changes' : 'Add block'}
        </Button>
      </DialogActions>
    </Box>
  );
}

export default function EventDialog() {
  const { dialog, events, actions } = useSchedule();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={dialog.open}
      onClose={actions.closeDialog}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby="event-dialog-title"
    >
      {/* key remounts the form with fresh values every time the dialog is opened */}
      <EventForm key={dialog.key} mode={dialog.mode} initial={dialog.initial} events={events} actions={actions} />
    </Dialog>
  );
}
