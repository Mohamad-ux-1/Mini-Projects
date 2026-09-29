import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Drawer, Snackbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CalendarView from './CalendarView';
import RightPanel from './RightPanel';
import EventDialog from './EventDialog';
import TasksView from './TasksView';
import AnalyticsView from './AnalyticsView';
import TeamView from './TeamView';
import SettingsView from './SettingsView';
import { useSchedule } from './ScheduleContext';

const VIEWS = {
  'Timetable/Schedule': CalendarView,
  'Tasks & Projects': TasksView,
  Analytics: AnalyticsView,
  Team: TeamView,
  Settings: SettingsView,
};

function AppSnackbar() {
  const { snack, actions } = useSchedule();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  // Keep the last message around so it does not vanish while the snackbar animates out.
  useEffect(() => {
    if (snack) {
      setCurrent(snack);
      setOpen(true);
    }
  }, [snack]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={(_, reason) => reason !== 'clickaway' && setOpen(false)}
      message={current?.message}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      action={
        current?.undo ? (
          <Button
            size="small"
            color="primary"
            onClick={() => {
              actions.restore(current.undo);
              setOpen(false);
            }}
          >
            Undo
          </Button>
        ) : null
      }
    />
  );
}

export default function DashboardLayout() {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const { activeMenu, panelTick } = useSchedule();
  const [navOpen, setNavOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const firstRun = useRef(true);

  // On screens without room for the side panel, selecting a block opens it as a drawer.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setPanelOpen(true);
  }, [panelTick]);

  const View = VIEWS[activeMenu] ?? CalendarView;

  return (
    <Box sx={{ index:1000,display: 'flex', height: '100vh', minWidth: {xs:'100%',md:'100%'}, alignSelf:'center',overflowX: 'auto', bgcolor: 'background.default',border:'0px solid red' }}>
      {isMd ? (
        <Box sx={{ width: 240, flexShrink: 0, borderRight: 1, borderColor: 'divider' }}>
          <Sidebar />
        </Box>
      ) : (
        <Drawer open={navOpen} onClose={() => setNavOpen(false)} sx={{ '& .MuiDrawer-paper': { width: 260 } }}>
          <Sidebar onNavigate={() => setNavOpen(false)} />
        </Drawer>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar onMenuClick={() => setNavOpen(true)} />

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', gap: 2, p: { xs: 1.5, md: 2.5 } }}>
          <Box component="main" sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex' }}>
            <View />
          </Box>

          {/*{isLg && (*/}
          {/*  <Box component="aside" aria-label="Selected block" sx={{ width: 340, flexShrink: 0, minHeight: 0 }}>*/}
          {/*    <RightPanel />*/}
          {/*  </Box>*/}
          {/*)}*/}
        </Box>
      </Box>

      {/*{!isLg && (*/}
      {/*  <Drawer*/}
      {/*    anchor="right"*/}
      {/*    open={panelOpen}*/}
      {/*    onClose={() => setPanelOpen(false)}*/}
      {/*    sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 380 }, p: 2, bgcolor: 'background.default' } }}*/}
      {/*  >*/}
      {/*    <RightPanel onClose={() => setPanelOpen(false)} />*/}
      {/*  </Drawer>*/}
      {/*)}*/}

      <EventDialog />
      <AppSnackbar />
    </Box>
  );
}
