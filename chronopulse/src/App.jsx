import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { ScheduleProvider } from './ScheduleContext';
import DashboardLayout from './DashboardLayout';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button,
  Alert
} from '@mui/material';

function App() {
  const [openInfoDialog, setOpenInfoDialog] = useState(false);

  useEffect(() => {
    // إظهار الرسالة بمجرد تحميل الصفحة
    setOpenInfoDialog(true);
  }, []);

  const handleClose = () => {
    setOpenInfoDialog(false);
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ScheduleProvider>
        <DashboardLayout />
        <h1>Welcome to My App</h1>

      {/* النافذة المنبثقة التي ستظهر للمستخدم */}
      <Dialog 
        open={openInfoDialog} 
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Important Notice"}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Beta Version / Experimental Site
          </Alert>
          <DialogContentText id="alert-dialog-description">
            Please note that this website is currently in an experimental phase. 
            For the best experience, it is designed to work exclusively on large screens (desktops and laptops). 
            You may experience layout or functionality issues on mobile devices or smaller screens.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="primary" autoFocus>
            I Understand
          </Button>
        </DialogActions>
      </Dialog>
      </ScheduleProvider>
    </ThemeProvider>
  );
}

export default App;
