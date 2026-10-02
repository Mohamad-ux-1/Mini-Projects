import React from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SmartToyOutlined from '@mui/icons-material/SmartToyOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import { useSchedule } from './ScheduleContext';
import { tokens } from './theme';

// `label` doubles as the key used by DashboardLayout to pick the view.
export const NAV = [
  { label: 'Timetable/Schedule', icon: <CalendarMonthOutlined fontSize="small" /> },
  { label: 'Tasks & Projects', icon: <TaskAltOutlined fontSize="small" /> },
  { label: 'Analytics', icon: <BarChartOutlined fontSize="small" /> },
  { label: 'Team', icon: <GroupsOutlined fontSize="small" /> },
  { label: 'Settings', icon: <SettingsOutlined fontSize="small" /> },
];

export default function Sidebar({ onNavigate }) {
  const { activeMenu, actions } = useSchedule();

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1, py: 1.5, mb: 2 }}>
        <SmartToyOutlined sx={{ color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h6" component="span">
          ChronoPulse | <Typography sx={{ color: '#E3A54B' }}>  Beta version !</Typography>
        </Typography>
      </Box>

      <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
        {NAV.map((item) => {
          const active = activeMenu === item.label;
          return (
            <ListItemButton
              key={item.label}
              selected={active}
              aria-current={active ? 'page' : undefined}
              onClick={() => {
                actions.setMenu(item.label);
                onNavigate?.();
              }}
              sx={{
                borderRadius: 2,
                color: active ? 'primary.main' : 'text.secondary',
                '&.Mui-selected': { bgcolor: alpha(tokens.accent, 0.1) },
                '&.Mui-selected:hover': { bgcolor: alpha(tokens.accent, 0.14) },
                '&:hover': { bgcolor: alpha('#ffffff', 0.04) },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{ '& .MuiListItemText-primary': { fontSize: 13, fontWeight: active ? 700 : 500 } }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
