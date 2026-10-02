import React, { useState, useMemo, createContext, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // 1. استيراد مكونات التوجيه

import { getCustomTheme } from './Theme/Theme.js';
import Dashboard from './Pages/Dashboard';
import Watchlist from './Pages/Watchlist'; // 2. استيراد صفحة الواتش ليست
import Header from './components/Header';
import Sidebar from './Sidebar';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App() {
    const [mode, setMode] = useState(localStorage.getItem('mode') ?? 'dark');
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('mode', mode);
    }, [mode]);

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        []
    );

    const theme = useMemo(() => getCustomTheme(mode), [mode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {/* 3. تغليف الواجهة بـ BrowserRouter لتفعيل التوجيه */}
                <BrowserRouter>
                    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
                        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

                        <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <Header onMenuClick={() => setMobileOpen(true)} />

                            <Box sx={{ p: { xs: 2, md: 3 }, flexGrow: 1, overflowY: 'auto' }}>
                                {/* 4. إعداد مسارات الصفحات (Routes) */}
                                <Routes>
                                    {/* إعادة توجيه المسار الرئيسي إلى لوحة التحكم */}
                                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/watchlist" element={<Watchlist />} />
                                </Routes>
                            </Box>
                        </Box>
                    </Box>
                </BrowserRouter>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default App;