// src/pages/Watchlist.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Box, Typography, Button, IconButton, Grid, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, LinearProgress, Switch, InputBase, Avatar, AvatarGroup, useTheme, ButtonBase, Snackbar, Alert, Tooltip, useMediaQuery
} from '@mui/material';
import { AreaChart, Area, YAxis, ResponsiveContainer } from 'recharts';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import AddIcon from '@mui/icons-material/Add';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import BoltIcon from '@mui/icons-material/Bolt';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import useWatchlistData, { formatCompact } from '../hooks/useWatchlistData';
import useWatchlistConfig from '../hooks/useWatchlistConfig';
import { AddAssetDialog, AlertsDialog, CompareDialog, ColumnsMenu } from '../components/WatchlistDialogs';

const MONO = '"JetBrains Mono", monospace';
const NAVY = '#0b3f9e';
const PAGE_SIZE = 8;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------
const pct = (n) => (n == null ? '—' : `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`);
const usd = (n, d) => {
    if (n == null) return '—';
    const dec = d ?? (n < 0.01 ? 6 : n < 1 ? 3 : 2);
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;
};

// ----------------------------------------------------------------------
// Sub-components (مكونات فرعية لتنظيف الكود)
// ----------------------------------------------------------------------

const FormatPrice = ({ val, mono = true }) => (
    <Typography sx={{ fontFamily: mono ? MONO : 'inherit', fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
        {usd(val)}
    </Typography>
);

const MiniSparkline = ({ data, positive, id }) => {
    const color = positive ? '#00a86b' : '#BA1A1A';
    return (
        <Box sx={{ width: '100%', height: 35 }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <YAxis hide domain={['dataMin', 'dataMax']} />
                    <defs>
                        <linearGradient id={`grad-${id}-${positive}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${id}-${positive})`} isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </Box>
    );
};

const PriorityCard = ({ item, onToggleAlert }) => {
    const isLight = useTheme().palette.mode === 'light';
    const cardBg = isLight ? '#ffffff' : '#111827';
    return (
        <Box sx={{ bgcolor: cardBg, borderRadius: '12px', p: { xs: 2, sm: 2.5 }, boxShadow: '0 1px 3px rgba(15,23,42,0.04)', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: isLight ? '#f0f4ff' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: NAVY, fontWeight: 700 }}>
                        {item.symbol[0]}
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '15px', fontWeight: 700 }}>{item.name} <Typography component="span" sx={{ fontSize: '11px', color: 'text.secondary' }}>{item.symbol}</Typography></Typography>
                        <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>{item.category}</Typography>
                    </Box>
                </Box>
                <Switch checked={!!item.alertOn} onChange={() => onToggleAlert(item.id)} size="small" inputProps={{ 'aria-label': 'price alert' }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>SPOT PRICE</Typography>
                    <Typography sx={{ fontSize: '18px', fontWeight: 700, fontFamily: MONO }}><FormatPrice val={item.price} /></Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>TARGET PRICE</Typography>
                    <Typography sx={{ fontSize: '18px', fontWeight: 700, fontFamily: MONO, color: NAVY }}><FormatPrice val={item.target} /></Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>Target Proximity</Typography>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, fontFamily: MONO, color: NAVY }}>{item.distPct.toFixed(1)}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={item.distPct} sx={{ height: 6, borderRadius: 3, bgcolor: isLight ? '#e2e8f0' : '#334155', '& .MuiLinearProgress-bar': { bgcolor: NAVY, borderRadius: 3 } }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: item.positive ? '#00a86b' : '#BA1A1A', display: 'flex', alignItems: 'center' }}>
                    {item.positive ? '↑' : '↓'} {pct(item.change)} <span style={{ color: '#94a3b8', marginLeft: '4px', fontSize: '10px' }}>24h</span>
                </Typography>
                <Box sx={{ width: 80 }}><MiniSparkline data={item.sparkline} positive={item.positive} id={item.id} /></Box>
            </Box>
        </Box>
    );
};

// ----------------------------------------------------------------------
// Main Watchlist Component
// ----------------------------------------------------------------------
export default function Watchlist() {
    const theme = useTheme();
    const isLight = theme.palette.mode === 'light';
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // table -> card list below 900px
    const { items, update, toggle, remove, add } = useWatchlistConfig();
    const { rows, summary, status } = useWatchlistData(items);
    const isLive = status === 'live';
    const top = summary.topGainer;
    const [activeTab, setActiveTab] = useState('All');
    const [query, setQuery] = useState('');
    const categories = useMemo(() => [...new Set(rows.map((r) => r.category))], [rows]);
    const tabs = ['All', '★ Favorites', 'Triggered', ...categories];
    const inTab = (r, tab) =>
        tab === 'All' || (tab === '★ Favorites' ? r.favorite : tab === 'Triggered' ? r.loaded && r.price >= r.target : r.category === tab);
    const visibleRows = rows.filter(
        (r) => inTab(r, activeTab) && `${r.name} ${r.symbol}`.toLowerCase().includes(query.toLowerCase())
    );

    const [page, setPage] = useState(1);
    const [addOpen, setAddOpen] = useState(false);
    const [alertsOpen, setAlertsOpen] = useState(false);
    const [compareOpen, setCompareOpen] = useState(false);
    const [compareIds, setCompareIds] = useState([]);
    const [colsAnchor, setColsAnchor] = useState(null);
    const [cols, setCols] = useState({ delta: true, target: true, dist: true, vol: true, spark: true });
    const [toast, setToast] = useState('');
    const shownCols = 4 + Object.values(cols).filter(Boolean).length;
    const pageCount = Math.max(1, Math.ceil(visibleRows.length / PAGE_SIZE));
    const safePage = Math.min(page, pageCount);
    const pageRows = visibleRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const toggleCompare = (id) => setCompareIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 4 ? p : [...p, id]));

    // fall back to "All" if the active tab disappears (e.g. last asset of a category removed)
    useEffect(() => { if (!tabs.includes(activeTab)) setActiveTab('All'); }, [tabs.join('|'), activeTab]); // eslint-disable-line

    // in-app alert when a watched asset reaches its target
    const hitRef = useRef(new Set());
    useEffect(() => {
        const fresh = [];
        rows.forEach((r) => {
            if (!r.loaded) return;
            const key = `${r.id}:${r.target}`;
            const hit = r.price >= r.target;
            if (hit && r.alertOn && !hitRef.current.has(key)) { hitRef.current.add(key); fresh.push(`${r.symbol} reached ${usd(r.target)}`); }
            if (!hit) hitRef.current.delete(key);
        });
        if (fresh.length) setToast(`🔔 ${fresh.join(' · ')}`);
    }, [rows]);

    const exportCsv = () => {
        const head = ['Symbol', 'Name', 'Category', 'Price (USDT)', '24h Change %', 'Target', 'Distance to Target', '24h Volume (USDT)', 'Holdings'];
        const body = visibleRows.map((r) => [r.symbol, r.name, r.category, r.price, r.change, r.target, r.price ? r.target - r.price : '', r.volume, r.qty]);
        const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const csv = [head, ...body].map((row) => row.map(esc).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `watchlist-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const renderActions = (row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                            <Tooltip title="Compare"><IconButton size="small" onClick={() => toggleCompare(row.id)}><CompareArrowsIcon fontSize="small" sx={{ color: compareIds.includes(row.id) ? NAVY : 'text.secondary' }} /></IconButton></Tooltip>
                                            <Tooltip title={row.alertOn ? 'Alert on' : 'Alert off'}><IconButton size="small" onClick={() => toggle(row.id, 'alertOn')}>{row.alertOn ? <NotificationsActiveIcon fontSize="small" sx={{ color: NAVY }} /> : <NotificationsNoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />}</IconButton></Tooltip>
                                            <Tooltip title="Remove"><IconButton size="small" onClick={() => remove(row.id)}><ClearIcon fontSize="small" sx={{ color: 'text.secondary' }} /></IconButton></Tooltip>
                                        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, minWidth: 0, width: '100%' }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase', mb: 0.5 }}>
                        <span style={{ color: NAVY }}>INSTITUTIONAL SURVEILLANCE</span> • SYNCED <span style={{ color: isLive ? '#00a86b' : '#BA1A1A' }}>{isLive ? 'LIVE · BINANCE' : status.toUpperCase()}</span>
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '22px', sm: '28px', md: '34px' }, lineHeight: 1.25 }}>Personal Watchlists & Price Targets</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>Track high-conviction digital assets, custom target thresholds, and breakout alerts in real time.</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
                    <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={exportCsv} sx={{ flex: { xs: '1 1 auto', md: '0 0 auto' }, whiteSpace: 'nowrap', borderRadius: '8px', color: 'text.primary', borderColor: 'divider', textTransform: 'none', fontWeight: 600, bgcolor: 'background.paper' }}>Export CSV</Button>
                    <Button variant="outlined" startIcon={<TuneIcon />} onClick={() => setAlertsOpen(true)} sx={{ flex: { xs: '1 1 auto', md: '0 0 auto' }, whiteSpace: 'nowrap', borderRadius: '8px', color: 'text.primary', borderColor: 'divider', textTransform: 'none', fontWeight: 600, bgcolor: 'background.paper' }}>Configure Alerts</Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)} sx={{ flex: { xs: '1 1 auto', md: '0 0 auto' }, whiteSpace: 'nowrap', borderRadius: '8px', bgcolor: NAVY, textTransform: 'none', fontWeight: 600 }}>Create Watchlist</Button>
                </Box>
            </Box>

            {/* Tabs & Live Indicator */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', pb: 1.5, gap: 2, minWidth: 0 }}>
                <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                    {tabs.map(tab => (
                        <ButtonBase key={tab} onClick={() => { setActiveTab(tab); setPage(1); }}
                                    sx={{
                                        flexShrink: 0, whiteSpace: 'nowrap', px: 2, py: 0.75, borderRadius: '99px', fontSize: '13px', fontWeight: 600,
                                        color: activeTab === tab ? NAVY : 'text.secondary',
                                        bgcolor: activeTab === tab ? (isLight ? '#eff6ff' : '#1e3a8a') : 'transparent',
                                    }}>
                            {tab} ({rows.filter((r) => inTab(r, tab)).length})
                        </ButtonBase>
                    ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                    <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '11px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>AUTO-REFRESH</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: '99px', bgcolor: isLight ? '#ecfdf5' : '#064e3b', color: '#00a86b' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00a86b' }} />
                        <Typography sx={{ fontSize: '11px', fontWeight: 700, fontFamily: MONO }}>{isLive ? '1s Ticker' : status}</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Top Stat Cards */}
            <Grid container spacing={2}>
                {/* Card 1 */}
                <Grid item xs={12} sm={6} md={4} sx={{flexGrow:1}}>
                    <Box sx={{ p: 2.5, bgcolor: 'background.paper', borderRadius: '12px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, minWidth: 0 }}>
                            <Box>
                                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>WATCHLIST VALUE MONITORED</Typography>
                                <Typography sx={{ fontSize: { xs: '22px', sm: '26px', md: '28px' }, fontWeight: 700, fontFamily: MONO }}>{usd(summary.value)} <Typography component="span" sx={{ fontSize: '12px', color: (summary.changePct ?? 0) >= 0 ? '#00a86b' : '#BA1A1A', fontWeight: 600 }}>{(summary.changePct ?? 0) >= 0 ? '↑' : '↓'} {pct(summary.changePct)}</Typography></Typography>
                                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', mt: 1, letterSpacing: '0.05em' }}>24H RANGE</Typography>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600, fontFamily: MONO }}>{usd(summary.low)} - {usd(summary.high)}</Typography>
                            </Box>
                            <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: isLight ? '#f0f4ff' : '#1e293b', color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AutoGraphIcon />
                            </Box>
                        </Box>
                    </Box>
                </Grid>
                {/* Card 2 */}
                <Grid item xs={12} sm={6} md={4} sx={{flexGrow:1}}>
                    <Box sx={{ p: 2.5, bgcolor: 'background.paper', borderRadius: '12px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, minWidth: 0 }}>
                            <Box>
                                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>24H ALPHA OUTPERFORMER</Typography>
                                <Typography sx={{ fontSize: { xs: '22px', sm: '26px', md: '28px' }, fontWeight: 700 }}>{top ? `${top.name} ${top.symbol}` : '—'} <Typography component="span" sx={{ fontSize: '14px', color: (top?.change ?? 0) >= 0 ? '#00a86b' : '#BA1A1A', fontWeight: 600, fontFamily: MONO }}>{pct(top?.change)}</Typography></Typography>
                            </Box>
                            <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: '#00a86b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BoltIcon />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 1 }}>
                            <Typography sx={{ fontSize: '15px', fontWeight: 700, fontFamily: MONO }}>{usd(top?.price)} <Typography component="span" sx={{ fontSize: '11px', color: 'text.secondary' }}>Vol {top ? `$${formatCompact(top.volume)}` : '—'}</Typography></Typography>
                            <Box sx={{ px: 1, py: 0.5, borderRadius: '4px', bgcolor: isLight ? '#f0f4ff' : '#1e293b', color: NAVY, fontSize: '11px', fontWeight: 600 }}>Target: {usd(top?.target)}</Box>
                        </Box>
                    </Box>
                </Grid>
                {/* Card 3 */}
                <Grid item xs={12} sm={12} md={4} sx={{flexGrow:1}}>
                    <Box sx={{ p: 2.5, bgcolor: 'background.paper', borderRadius: '12px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, minWidth: 0 }}>
                            <Box>
                                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>TARGET THRESHOLD MONITOR</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <Typography sx={{ fontSize: { xs: '22px', sm: '26px', md: '28px' }, fontWeight: 700 }}>{summary.triggered.length} Active Triggered</Typography>
                                    {summary.triggered.length > 0 && <Box sx={{ px: 1, py: 0.25, borderRadius: '4px', bgcolor: '#fee2e2', color: '#b91c1c', fontSize: '10px', fontWeight: 700 }}>Requires Action</Box>}
                                </Box>
                            </Box>
                            <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: isLight ? '#f0f4ff' : '#1e293b', color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <NotificationsNoneIcon />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Typography sx={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#BA1A1A' }}></span>
                                {summary.triggered[0] ? `${summary.triggered[0].symbol} hit ${usd(summary.triggered[0].target)} target` : 'No targets hit yet'}
                            </Typography>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: NAVY, cursor: 'pointer' }} onClick={() => { setActiveTab('Triggered'); setPage(1); }}>Review All</Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* AI Banner */}
            <Box sx={{ bgcolor: isLight ? '#f4f7fe' : '#1e293b', borderRadius: '12px', p: { xs: 2, md: 2.5 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: NAVY, display: 'flex', alignItems: 'center', gap: 1, mb: 1, letterSpacing: '0.05em' }}>
                        <AutoGraphIcon fontSize="small" /> AI BREAKOUT RADAR ACTIVE
                    </Typography>
                    <Typography sx={{ fontSize: '18px', fontWeight: 700, mb: 0.5, color: 'text.primary' }}>{summary.near.length} Assets Within 5% of Target</Typography>
                    <Typography sx={{ fontSize: '13px', color: 'text.secondary', maxWidth: 600 }}>{summary.near.length ? `${summary.near.map((r) => r.name).join(', ')} within 5% of your defined price targets.` : 'No tracked asset is within 5% of its target right now.'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 2 }}>
                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '12px', border: `2px solid ${isLight ? '#f4f7fe' : '#1e293b'}` } }}>
                        <Avatar src="https://i.pravatar.cc/150?img=11" />
                        <Avatar src="https://i.pravatar.cc/150?img=12" />
                        <Avatar>+8</Avatar>
                    </AvatarGroup>
                    <Box>
                        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'text.primary' }}>Shared Ledger View</Typography>
                        <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>Desk: Alpha Liquid Quant</Typography>
                    </Box>
                </Box>
                {/* Decorative background shape */}
                <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: '40%', height: '100%', bgcolor: isLight ? '#e0e7ff' : '#334155', clipPath: 'polygon(20% 100%, 40% 60%, 80% 40%, 100% 0, 100% 100%)', zIndex: 1, opacity: 0.5 }} />
            </Box>

            {/* Priority Targets Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ display: 'inline-flex', width: 16, height: 16, borderRadius: '50%', border: `4px solid ${NAVY}` }} />
                    Priority Target Trajectory
                </Typography>
                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>REAL-TIME ORDER BOOK PROXIMITY</Typography>
            </Box>

            {/* Priority Cards Row */}
            <Grid container spacing={2}>
                {rows.slice(0, 3).map(item => (
                    <Grid item xs={12} sm={6} md={4} key={item.id} sx={{flexGrow:1}}>
                        <PriorityCard item={item} onToggleAlert={(id) => toggle(id, 'alertOn')} />
                    </Grid>
                ))}
            </Grid>

            {compareIds.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 2, px: 2, py: 1, borderRadius: '12px', bgcolor: isLight ? '#eff6ff' : '#1e3a8a' }}>
                    <CompareArrowsIcon sx={{ color: NAVY }} />
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, flex: '1 1 160px' }}>
                        {compareIds.length} selected for comparison{compareIds.length < 2 ? ' (pick at least 2)' : ''}
                    </Typography>
                    <Button size="small" variant="contained" disabled={compareIds.length < 2} onClick={() => setCompareOpen(true)} sx={{ bgcolor: NAVY, textTransform: 'none' }}>Compare</Button>
                    <Button size="small" onClick={() => setCompareIds([])} sx={{ textTransform: 'none' }}>Clear</Button>
                </Box>
            )}

            {/* Main Table Section */}
            <Box sx={{ bgcolor: 'background.paper', borderRadius: '12px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', mt: 2 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: isLight ? '#f1f5f9' : '#1e293b', borderRadius: '8px', px: 1.5, py: 0.75, width: { xs: '100%', sm: 300 } }}>
                        <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <InputBase value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Filter watchlist assets or tags..." sx={{ fontSize: '13px', flex: 1 }} />
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
                        <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>Columns: <b>{shownCols} of 9</b></Typography>
                        <IconButton size="small" onClick={(e) => setColsAnchor(e.currentTarget)} sx={{ bgcolor: isLight ? '#f1f5f9' : '#1e293b', borderRadius: '8px' }}><TuneIcon fontSize="small" /></IconButton>
                    </Box>
                </Box>

                {!isMobile && (
                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 860 }}>
                        <TableHead>
                            <TableRow sx={{ '& th': { fontSize: '10px', fontWeight: 700, color: 'text.secondary', borderBottom: '1px solid divider', pb: 1, pt: 2 } }}>
                                <TableCell>FAV</TableCell>
                                <TableCell>ASSET</TableCell>
                                <TableCell align="right">SPOT PRICE</TableCell>
                                {cols.delta && <TableCell align="right">24H DELTA</TableCell>}
                                {cols.target && <TableCell align="right">TARGET PRICE</TableCell>}
                                {cols.dist && <TableCell align="center">DISTANCE TO TARGET</TableCell>}
                                {cols.vol && <TableCell align="right">24H VOLUME</TableCell>}
                                {cols.spark && <TableCell align="center">7D SPARKLINE</TableCell>}
                                <TableCell align="center">ACTION</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pageRows.map((row) => (
                                <TableRow key={row.id} sx={{ '& td': { borderBottom: '1px solid', borderColor: 'divider', py: 1.5 }, '&:hover': { bgcolor: 'action.hover' } }}>
                                    <TableCell>
                                        <IconButton size="small" aria-label="favorite" onClick={() => toggle(row.id, 'favorite')}>{row.favorite ? <StarIcon sx={{ color: '#f59e0b', fontSize: 18 }} /> : <StarBorderIcon sx={{ color: 'text.secondary', fontSize: 18 }} />}</IconButton>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: isLight ? '#f0f4ff' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: NAVY, fontWeight: 700, fontSize: '12px' }}>
                                                {row.symbol[0]}
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>{row.name}</Typography>
                                                <Typography sx={{ fontSize: '11px', color: 'text.secondary', lineHeight: 1.2 }}>{row.symbol}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography sx={{ fontSize: '14px', fontWeight: 700, fontFamily: MONO }}><FormatPrice val={row.price} /></Typography>
                                    </TableCell>
                                    {cols.delta && (
<TableCell align="right">
                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: row.positive ? '#00a86b' : '#BA1A1A' }}>{pct(row.change)}</Typography>
                                    </TableCell>
)}
                                    {cols.target && (
<TableCell align="right">
                                        <Typography sx={{ fontSize: '14px', fontWeight: 700, fontFamily: MONO, color: NAVY }}><FormatPrice val={row.target} /></Typography>
                                    </TableCell>
)}
                                    {cols.dist && (
<TableCell align="center" sx={{ width: 200 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, px: 1 }}>
                                            <Typography sx={{ fontSize: '11px', fontFamily: MONO, fontWeight: 600 }}>{row.distValue >= 0 ? '+' : '−'}{usd(Math.abs(row.distValue))}</Typography>
                                            <Typography sx={{ fontSize: '11px', fontFamily: MONO, fontWeight: 700, color: NAVY }}>{row.distPct.toFixed(1)}%</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={row.distPct} sx={{ height: 6, borderRadius: 3, mx: 1, bgcolor: isLight ? '#e2e8f0' : '#334155', '& .MuiLinearProgress-bar': { bgcolor: NAVY, borderRadius: 3 } }} />
                                    </TableCell>
)}
                                    {cols.vol && (
<TableCell align="right">
                                        <Typography sx={{ fontSize: '13px', fontFamily: MONO }}>{row.volume == null ? '—' : `$${formatCompact(row.volume)}`}</Typography>
                                    </TableCell>
)}
                                    {cols.spark && (
<TableCell align="center" sx={{ width: 100 }}>
                                        <Box sx={{ width: 80, margin: '0 auto' }}><MiniSparkline data={row.sparkline} positive={row.positive} id={`row-${row.id}`} /></Box>
                                    </TableCell>
)}
                                    <TableCell align="center">
                                        {renderActions(row)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                )}

                {isMobile && (
                    <Box>
                        {pageRows.map((row) => (
                            <Box key={row.id} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <IconButton size="small" aria-label="favorite" onClick={() => toggle(row.id, 'favorite')}>
                                        {row.favorite ? <StarIcon sx={{ color: '#f59e0b', fontSize: 20 }} /> : <StarBorderIcon sx={{ color: 'text.secondary', fontSize: 20 }} />}
                                    </IconButton>
                                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: isLight ? '#f0f4ff' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: NAVY, fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                                        {row.symbol[0]}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography noWrap sx={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.2 }}>{row.name}</Typography>
                                        <Typography sx={{ fontSize: '11px', color: 'text.secondary', lineHeight: 1.2 }}>{row.symbol} · {row.category}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{ fontSize: '15px', fontWeight: 700, fontFamily: MONO }}>{usd(row.price)}</Typography>
                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: row.positive ? '#00a86b' : '#BA1A1A' }}>{pct(row.change)}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>TARGET PRICE</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 700, fontFamily: MONO, color: NAVY }}>{usd(row.target)}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>24H VOLUME</Typography>
                                        <Typography sx={{ fontSize: '13px', fontFamily: MONO }}>{row.volume == null ? '—' : `$${formatCompact(row.volume)}`}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography sx={{ fontSize: '11px', fontFamily: MONO, fontWeight: 600 }}>{row.distValue >= 0 ? '+' : '−'}{usd(Math.abs(row.distValue))}</Typography>
                                    <Typography sx={{ fontSize: '11px', fontFamily: MONO, fontWeight: 700, color: NAVY }}>{row.distPct.toFixed(1)}%</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={row.distPct} sx={{ height: 6, borderRadius: 3, bgcolor: isLight ? '#e2e8f0' : '#334155', '& .MuiLinearProgress-bar': { bgcolor: NAVY, borderRadius: 3 } }} />

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                                    <Box sx={{ width: 90 }}><MiniSparkline data={row.sparkline} positive={row.positive} id={`m-${row.id}`} /></Box>
                                    {renderActions(row)}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}

                {pageRows.length === 0 && (
                    <Typography sx={{ p: 4, textAlign: 'center', fontSize: '13px', color: 'text.secondary' }}>No assets match your filters.</Typography>
                )}

                {/* Footer Pagination */}
                <Box sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ fontSize: '12px', color: 'text.secondary', textAlign: { xs: 'center', sm: 'left' } }}>Showing <b>{pageRows.length}</b> of <b>{rows.length}</b> tracked assets &nbsp;•&nbsp; Tick Interval: <b>Binance WebSocket (1s)</b></Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                        <Button size="small" variant="text" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} sx={{ color: 'text.secondary', textTransform: 'none' }}>← Prev</Button>
                        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                            <Button key={n} size="small" variant={n === safePage ? 'contained' : 'text'} onClick={() => setPage(n)}
                                    sx={n === safePage ? { minWidth: 32, bgcolor: NAVY, p: 0 } : { minWidth: 32, color: 'text.secondary' }}>{n}</Button>
                        ))}
                        <Button size="small" variant="text" disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)} sx={{ color: 'text.secondary', textTransform: 'none' }}>Next →</Button>
                    </Box>
                </Box>
            </Box>
            <AddAssetDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={add} existingIds={items.map((i) => i.id)} categories={categories} />
            <AlertsDialog open={alertsOpen} onClose={() => setAlertsOpen(false)} rows={rows} onUpdate={update} />
            <CompareDialog open={compareOpen} onClose={() => setCompareOpen(false)} rows={rows.filter((r) => compareIds.includes(r.id))} />
            <ColumnsMenu anchorEl={colsAnchor} onClose={() => setColsAnchor(null)} cols={cols} onChange={setCols} />
            <Snackbar open={!!toast} autoHideDuration={6000} onClose={() => setToast('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="info" variant="filled" onClose={() => setToast('')}>{toast}</Alert>
            </Snackbar>
        </Box>
    );
}
