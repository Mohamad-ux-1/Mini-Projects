import React from 'react';
import { Box, Button, Paper, Switch, Typography } from '@mui/material';
import { useSchedule } from './ScheduleContext';

function Row({ title, description, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 2 }}>
      <Box>
        <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

export default function SettingsView() {
  const { focusMode, actions } = useSchedule();

  return (
    <Paper sx={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto', p: 3, alignSelf: 'flex-start', maxWidth: 720 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Settings
      </Typography>
      <Row title="Focus mode" description="Dims every block that is not a focus session so the calendar shows only what needs your attention.">
        <Switch checked={focusMode} onChange={actions.toggleFocus} inputProps={{ 'aria-label': 'Focus mode' }} />
      </Row>
      <Box sx={{ borderTop: 1, borderColor: 'divider' }} />
      <Row title="Demo data" description="Your blocks are saved in this browser. Restore the sample week to start over.">
        <Button variant="outlined" color="inherit" onClick={actions.reset} sx={{ borderColor: 'divider', flexShrink: 0 }}>
          Restore demo data
        </Button>
      </Row>
    </Paper>
  );
}
