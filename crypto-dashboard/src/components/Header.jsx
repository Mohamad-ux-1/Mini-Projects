import React, { useContext } from 'react';
import { Box, IconButton, InputBase, Avatar, Badge, Typography, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LocalGasStationOutlinedIcon from '@mui/icons-material/LocalGasStationOutlined';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu';
import { ColorModeContext } from '../App';

import { useMarketData } from '../hooks/useMarketData';
import { useGlobalStats } from '../hooks/useGlobalStats.mock'; // تأكد من الاسم كما هو عندك

const MONO = '"JetBrains Mono", monospace';

const surfaceSx = {
    bgcolor: 'background.paper',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
};

const Header = ({ onMenuClick }) => {
    // جلب حالة الثيم الحالي (Light أو Dark) من Material UI
    const theme = useTheme();

    // جلب دالة التبديل من الـ Context الذي عرفته في App.jsx
    const colorMode = useContext(ColorModeContext);

    // جلب البيانات الحية للأسعار والغاز
    const marketData = useMarketData();
    const stats = useGlobalStats();

    const btcPrice = marketData?.bitcoin?.price || 0;
    const btcChange = marketData?.bitcoin?.change || 0;
    const gasGwei = stats?.gasGwei || 0;

    const isPositive = btcChange >= 0;
    const changeColor = isPositive ? '#00a86b' : '#BA1A1A';
    const isLight = theme.palette.mode === 'light';

    return (
        <Box
            sx={{
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: { xs: 1.5, md: 3 },
                px: { xs: 2, md: 3 },
                bgcolor: 'background.default',
            }}
        >
            <IconButton
                onClick={onMenuClick}
                color="inherit"
                aria-label="Open navigation"
                sx={{ ...surfaceSx, display: { xs: 'inline-flex', md: 'none' }, width: 40, height: 40, borderRadius: '12px', flexShrink: 0 }}
            >
                <MenuIcon fontSize="small" />
            </IconButton>

            <Box sx={{ ...surfaceSx, display: 'flex', alignItems: 'center', flex: 1, maxWidth: 530, height: 44, px: 2 }}>
                <SearchIcon sx={{ color: 'text.secondary', mr: 1.5 }} fontSize="small" />
                <InputBase placeholder="Search assets, pairs, contracts" sx={{ flex: 1, fontSize: '0.875rem', color: 'text.primary' }} />
                <Box sx={{ display: { xs: 'none', sm: 'block' }, px: 0.75, py: 0.25, borderRadius: '4px', bgcolor: isLight ? '#dce9ff' : 'action.selected', color: isLight ? '#434652' : 'text.secondary', fontFamily: MONO, fontSize: '10px', fontWeight: 600, lineHeight: 1.4 }}>
                    ⌘K
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {btcPrice > 0 && (
                    <Box sx={{ ...surfaceSx, display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1, height: 40, px: 1.75 }}>
                        <Typography sx={{ fontFamily: MONO, fontSize: '11px', fontWeight: 500, color: 'text.secondary' }}>BTC</Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '15px', fontWeight: 700, color: 'text.primary' }}>
                            ${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: changeColor, fontFamily: MONO, fontSize: '11px', fontWeight: 600 }}>
                            {isPositive ? <ArrowDropUpIcon sx={{ fontSize: 16, mr: -0.25 }} /> : <ArrowDropDownIcon sx={{ fontSize: 16, mr: -0.25 }} />}
                            {isPositive ? '+' : ''}{btcChange.toFixed(2)}%
                        </Box>
                    </Box>
                )}

                {gasGwei > 0 && (
                    <Box sx={{ ...surfaceSx, display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1, height: 40, px: 1.75 }}>
                        <LocalGasStationOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography sx={{ fontFamily: MONO, fontSize: '11px', fontWeight: 500, color: 'text.secondary' }}>GAS</Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '15px', fontWeight: 700, color: 'text.primary' }}>{gasGwei} Gwei</Typography>
                    </Box>
                )}

                <Box sx={{ width: '1px', height: 32, bgcolor: 'divider', mx: 1, display: { xs: 'none', lg: 'block' } }} />

                {/* زر تبديل الثيم */}
                <IconButton onClick={colorMode.toggleColorMode} color="inherit" sx={{ ...surfaceSx, width: 40, height: 40, borderRadius: '12px' }}>
                    {theme.palette.mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
                </IconButton>

                <IconButton color="inherit" sx={{ ...surfaceSx, width: 40, height: 40, borderRadius: '12px' }}>
                    <Badge variant="dot" color="error">
                        <NotificationsNoneIcon fontSize="small" />
                    </Badge>
                </IconButton>

                <Avatar variant="rounded" sx={{ width: 40, height: 40, ml: 0.5, borderRadius: '10px', cursor: 'pointer' }} src="https://i.pravatar.cc/150?img=11" alt="User Profile" />
            </Box>
        </Box>
    );
};

export default Header;