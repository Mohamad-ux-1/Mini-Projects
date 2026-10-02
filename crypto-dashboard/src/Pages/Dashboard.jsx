// src/pages/Dashboard.jsx
import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import CryptoCard from '../components/CryptoCard';
import { useMarketData } from '../Hooks/useMarketData';
// تم تعديل الرابط هنا لإزالة .mock واستخدام الملف الحقيقي
import { useGlobalStats, formatUsdCompact, formatGwei } from '../Hooks/useGlobalStats.mock.js';
import MainChart from '../components/MainChart';
import MarketTable from '../MarketTable';

const MONO = '"JetBrains Mono", monospace';

const BitcoinIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="12" fill="#f7931a" />
        <text x="12" y="17" textAnchor="middle" fontSize="15" fontWeight="700" fill="#ffffff">₿</text>
    </svg>
);

const EthereumIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24">
        <path d="M12 2 5 12.2 12 16l7-3.8L12 2Z" fill="#627eea" />
        <path d="M12 17.3 5 13.5 12 22l7-8.5-7 3.8Z" fill="#627eea" opacity="0.7" />
    </svg>
);

const SolanaIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.5 5h13.5l-2.5 3.5H4L6.5 5Z" />
        <path d="M4 10.25h13.5l2.5 3.5H6.5L4 10.25Z" />
        <path d="M6.5 15.5h13.5l-2.5 3.5H4l2.5-3.5Z" />
    </svg>
);

const coins = [
    { id: 'bitcoin',  name: 'Bitcoin',  symbol: 'BTC', rank: '1', type: 'Tier 1 Asset',     iconSvg: BitcoinIcon,  iconBg: '#fff3e0', iconColor: '#f7931a' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', rank: '2', type: 'Smart Contracts',  iconSvg: EthereumIcon, iconBg: '#eef0ff', iconColor: '#627eea' },
    { id: 'solana',   name: 'Solana',   symbol: 'SOL', rank: '5', type: 'High Throughput',  iconSvg: SolanaIcon,   iconBg: '#e6fbf3', iconColor: '#0b1c30' },
];

const statCardSx = {
    bgcolor: 'background.paper',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
    px: 2,
    py: 1.5,
};

const statLabelSx = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'text.secondary',
    mb: 0.5,
};

const statValueSx = {
    fontFamily: MONO,
    fontSize: '20px',
    fontWeight: 700,
    color: 'text.primary',
    lineHeight: 1.2,
};

const Dashboard = () => {
    const marketData = useMarketData();
    const stats = useGlobalStats();
    const volPositive = (stats.volumeChange ?? 0) >= 0;

    return (
        <Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start', gap: 3, mb: 4 }}>
                <Box sx={{ maxWidth: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                        <Typography sx={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0058be' }}>
                            Institutional Telemetry
                        </Typography>
                    </Box>
                    <Typography component="h1" sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'text.primary', mb: 1 }}>
                        Market Pulse & Live Analytics
                    </Typography>
                    <Typography sx={{ fontSize: '15px', lineHeight: 1.5, color: 'text.secondary' }}>
                        Real-time aggregate order flows, multi-chain depth metrics, and global liquidity distribution.
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, width: { xs: '100%', md: 390 }, flexShrink: 0 }}>
                    <Box sx={{ ...statCardSx, minWidth: 184 }}>
                        <Typography sx={statLabelSx}>24H Global Volume</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={statValueSx}>{stats.volume != null ? formatUsdCompact(stats.volume) : '—'}</Typography>
                            {stats.volumeChange != null && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, bgcolor: volPositive ? '#6ffbbe' : '#ffdad6', color: volPositive ? '#003d28' : '#93000a', px: 0.75, py: 0.25, borderRadius: '4px', fontFamily: MONO, fontSize: '10px', fontWeight: 600 }}>
                                    {volPositive ? <TrendingUpIcon sx={{ fontSize: 12 }} /> : <TrendingDownIcon sx={{ fontSize: 12 }} />}
                                    {volPositive ? '+' : ''}{stats.volumeChange.toFixed(1)}%
                                </Box>
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ ...statCardSx, minWidth: 172 }}>
                        <Typography sx={statLabelSx}>BTC Dominance</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Typography sx={statValueSx}>{stats.btcDominance != null ? stats.btcDominance.toFixed(1) : '—'}%</Typography>
                            <Box sx={{ width: 72, height: 5, borderRadius: '999px', bgcolor: '#dce9ff', overflow: 'hidden' }}>
                                <Box sx={{ width: `${stats.btcDominance ?? 0}%`, height: '100%', bgcolor: '#0b2a6b', borderRadius: '999px' }} />
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ ...statCardSx, minWidth: 150 }}>
                        <Typography sx={statLabelSx}>ETH Gas Priority</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={statValueSx}>{stats.gasGwei != null ? formatGwei(stats.gasGwei) : '—'} Gwei</Typography>
                            <SpeedOutlinedIcon sx={{ fontSize: 18, color: '#00875a' }} />
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Grid container spacing={4} sx={{ justifyContent: '' }}>
                {coins.map(({ id, ...coin }) => {
                    const d = marketData?.[id] || {};
                    return (
                        <Grid item xs={12} md={4} key={id} sx={{ width: 'auto', flexGrow: 1 }}>
                            <CryptoCard
                                {...coin}
                                price={d.price ?? 0}
                                change={d.change ?? 0}
                                rangeLow={d.low ?? 0}
                                rangeHigh={d.high ?? 0}
                                sparklineData={(d.sparkline || []).map((v) => ({ value: v }))}
                            />
                        </Grid>
                    );
                })}
            </Grid>

            <Box sx={{ height: '20px' }} />

            <Box mt={4}>
                <MainChart />
            </Box>

            <Box mt={4}>
                <MarketTable />
            </Box>
        </Box>
    );
};

export default Dashboard;