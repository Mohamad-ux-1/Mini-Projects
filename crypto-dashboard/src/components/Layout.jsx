// src/components/Layout.jsx
import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* القائمة الجانبية ثابتة */}
      <Sidebar />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* الشريط العلوي ثابت */}
        <Header />

        {/* منطقة المحتوى القابلة للتمرير */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;