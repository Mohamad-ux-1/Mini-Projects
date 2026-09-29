import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { ScheduleProvider } from './ScheduleContext';
import DashboardLayout from './DashboardLayout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ScheduleProvider>
        <DashboardLayout />
      </ScheduleProvider>
    </ThemeProvider>
  );
}

export default App;
