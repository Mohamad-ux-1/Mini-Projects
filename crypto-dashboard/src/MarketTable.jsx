// src/MarketTable.jsx
import React, { useMemo, useState, useEffect } from 'react';
import {
    Box,
    ButtonBase,
    IconButton,
    InputBase,
    MenuItem,
    Pagination,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
    CircularProgress,
} from '@mui/material';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const MONO = '"JetBrains Mono", monospace';
const NAVY = '#0b3f9e';
const FILTERS = ['All Assets', 'Top Gainers', 'DeFi', 'Layer 1'];

/* ------------------------------------------------------------------ */
/* أيقونات العملات المخصصة                                            */
/* ------------------------------------------------------------------ */
const coinIcon = (bg, fg, inner) => (
    <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {inner}
    </Box>
);

const customIcons = {
    BTC: coinIcon('#fff3e0', '#f7931a', <Typography sx={{ fontSize: 15, fontWeight: 700 }}>₿</Typography>),
    ETH: coinIcon('#eef0ff', '#627eea', (
        <svg width="15" height="15" viewBox="0 0 24 24">
            <path d="M12 2 5 12.2 12 16l7-3.8L12 2Z" fill="#627eea" />
            <path d="M12 17.3 5 13.5 12 22l7-8.5-7 3.8Z" fill="#627eea" opacity="0.7" />
        </svg>
    )),
    SOL: coinIcon('#e6fbf3', '#0b1c30', (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.5 5h13.5l-2.5 3.5H4L6.5 5Z" />
            <path d="M4 10.25h13.5l2.5 3.5H6.5L4 10.25Z" />
            <path d="M6.5 15.5h13.5l-2.5 3.5H4l2.5-3.5Z" />
        </svg>
    )),
    BNB: coinIcon('#fff8e1', '#f0b90b', <Typography sx={{ fontSize: 14, fontWeight: 700 }}>◆</Typography>),
    XRP: coinIcon('#eef2f5', '#23292f', <Typography sx={{ fontSize: 13, fontWeight: 700 }}>✕</Typography>),
    ADA: coinIcon('#eaf3ff', '#0033ad', <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Ⓐ</Typography>),
    AVAX: coinIcon('#feeceb', '#e84142', (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3 3 20h6.2l2.8-5 2.8 5H21L12 3Z" />
        </svg>
    )),
};

// دالة لمعالجة الأيقونات (إما المخصصة أو جلب صورة الـ API)
const renderIcon = (symbol, imageUrl) => {
    if (customIcons[symbol]) return customIcons[symbol];
    return (
        <Box sx={{ width: 30, height: 30, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src={imageUrl} alt={symbol} style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
        </Box>
    );
};

/* ------------------------------------------------------------------ */
/* أدوات التنسيق                                                       */
/* ------------------------------------------------------------------ */
const fmtPrice = (n) => {
    if (n == null) return '—';
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: n < 1 ? 4 : 2, maximumFractionDigits: n < 1 ? 4 : 2 })}`;
};
const fmtCompact = (n) => {
    if (n == null) return '—';
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n);
};

/* ------------------------------------------------------------------ */
/* مكونات فرعية                                                        */
/* ------------------------------------------------------------------ */
const ChangeBadge = ({ value }) => {
    if (value == null) return <Typography sx={{ fontSize: '12px' }}>—</Typography>;
    const positive = value >= 0;
    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                bgcolor: positive ? '#6ffbbe' : '#ffdad6',
                color: positive ? '#003d28' : '#93000a',
                px: 0.75,
                py: 0.25,
                borderRadius: '999px',
                fontFamily: MONO,
                fontSize: '12px',
                fontWeight: 700,
            }}
        >
            {positive ? <ArrowDropUpIcon sx={{ fontSize: 16, mr: -0.25 }} /> : <ArrowDropDownIcon sx={{ fontSize: 16, mr: -0.25 }} />}
            {positive ? '+' : ''}{value.toFixed(2)}%
        </Box>
    );
};

const TrendSpark = ({ data, positive }) => {
    if (!data || data.length === 0) return <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>No Data</Typography>;
    const color = positive ? '#00a86b' : '#BA1A1A';
    const gradientId = useMemo(() => `trend-${Math.random().toString(36).slice(2)}`, []);
    return (
        <Box sx={{ width: 96, height: 34 }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.75} fill={`url(#${gradientId})`} isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </Box>
    );
};

const headCellSx = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', border: 'none', py: 1.5, whiteSpace: 'nowrap' };
const bodyCellSx = { border: 'none', py: 1.5 };

/* ------------------------------------------------------------------ */
/* المكوّن الرئيسي                                                     */
/* ------------------------------------------------------------------ */
const MarketTable = () => {
    const theme = useTheme();
    const isLight = theme.palette.mode === 'light';

    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(FILTERS[0]);
    const [query, setQuery] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [starred, setStarred] = useState(new Set(['BTC', 'ETH'])); // المفضلة الافتراضية

    const chipBg = isLight ? '#eaf1ff' : theme.palette.action.hover;

    // جلب البيانات من CoinGecko API
    useEffect(() => {
        const fetchCoins = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true');
                const data = await response.json();

                // تحويل البيانات لتناسب الجدول
                const formattedData = data.map(coin => ({
                    rank: coin.market_cap_rank,
                    name: coin.name,
                    symbol: coin.symbol.toUpperCase(),
                    price: coin.current_price,
                    change: coin.price_change_percentage_24h,
                    low: coin.low_24h,
                    high: coin.high_24h,
                    cap: coin.market_cap,
                    vol: coin.total_volume,
                    image: coin.image,
                    trend: coin.sparkline_in_7d && coin.sparkline_in_7d.price
                        ? coin.sparkline_in_7d.price.map(p => ({ value: p }))
                        : [],
                }));
                setAssets(formattedData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching coin data:", error);
                setLoading(false);
            }
        };

        fetchCoins();
    }, []);

    // فلترة وبحث البيانات
    const filteredRows = useMemo(() => {
        let result = assets;
        if (query) {
            result = result.filter((r) => `${r.name} ${r.symbol}`.toLowerCase().includes(query.toLowerCase()));
        }
        if (filter === 'Top Gainers') {
            result = [...result].sort((a, b) => (b.change || 0) - (a.change || 0));
        }
        return result;
    }, [query, assets, filter]);

    // تقسيم الصفحات (Pagination)
    const paginatedRows = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredRows.slice(start, start + rowsPerPage);
    }, [filteredRows, page, rowsPerPage]);

    const toggleStar = (symbol) => {
        setStarred((prev) => {
            const next = new Set(prev);
            next.has(symbol) ? next.delete(symbol) : next.add(symbol);
            return next;
        });
    };

    const pageCount = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));

    return (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Typography sx={{ fontSize: '18px', fontWeight: 700, color: 'text.primary' }}>Market Overview</Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, p: 0.5, borderRadius: '10px', bgcolor: chipBg, flexWrap: 'wrap' }}>
                            {FILTERS.map((f) => (
                                <ButtonBase
                                    key={f}
                                    onClick={() => { setFilter(f); setPage(1); }}
                                    sx={{
                                        px: 1.5, height: 30, borderRadius: '8px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
                                        color: f === filter ? 'text.primary' : 'text.secondary',
                                        bgcolor: f === filter ? 'background.paper' : 'transparent',
                                        boxShadow: f === filter ? '0 1px 3px rgba(15,23,42,0.12)' : 'none',
                                    }}
                                >
                                    {f}
                                </ButtonBase>
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: chipBg, borderRadius: '10px', height: 40, px: 1.5, width: 200 }}>
                            <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <InputBase
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                                placeholder="Filter asset table..."
                                sx={{ fontSize: '13px', flex: 1, color: 'text.primary' }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>

            <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 900 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...headCellSx, pl: { xs: 2, md: 3 } }}>#</TableCell>
                            <TableCell sx={headCellSx}>Asset</TableCell>
                            <TableCell sx={headCellSx} align="right">Price</TableCell>
                            <TableCell sx={headCellSx} align="right">24h Change</TableCell>
                            <TableCell sx={headCellSx}>24h High / Low</TableCell>
                            <TableCell sx={headCellSx} align="right">Market Cap</TableCell>
                            <TableCell sx={headCellSx} align="right">24h Volume</TableCell>
                            <TableCell sx={headCellSx}>7D Trend</TableCell>
                            <TableCell sx={{ ...headCellSx, pr: { xs: 2, md: 3 } }} align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={30} />
                                </TableCell>
                            </TableRow>
                        ) : paginatedRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                    <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>No assets found.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedRows.map((r) => {
                                const positive = (r.change || 0) >= 0;
                                const isStar = starred.has(r.symbol);
                                return (
                                    <TableRow key={r.symbol} sx={{ '&:hover': { bgcolor: isLight ? '#f7f9fd' : theme.palette.action.hover }, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <TableCell sx={{ ...bodyCellSx, pl: { xs: 2, md: 3 } }}>
                                            <Typography sx={{ fontFamily: MONO, fontSize: '13px', color: 'text.secondary' }}>{r.rank}</Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCellSx}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                                <IconButton size="small" onClick={() => toggleStar(r.symbol)} sx={{ p: 0.25, color: isStar ? '#f0b90b' : 'action.disabled' }}>
                                                    {isStar ? <StarIcon sx={{ fontSize: 16 }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
                                                </IconButton>

                                                {/* استدعاء دالة الأيقونة */}
                                                {renderIcon(r.symbol, r.image)}

                                                <Box>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}>{r.name}</Typography>
                                                    <Typography sx={{ fontSize: '11px', color: 'text.secondary', lineHeight: 1.3 }}>{r.symbol}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={bodyCellSx} align="right">
                                            <Typography sx={{ fontFamily: MONO, fontSize: '13px', fontWeight: 700, color: 'text.primary' }}>
                                                {fmtPrice(r.price)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCellSx} align="right">
                                            <ChangeBadge value={r.change} />
                                        </TableCell>

                                        <TableCell sx={bodyCellSx}>
                                            <Typography sx={{ fontFamily: MONO, fontSize: '12px', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                                {fmtPrice(r.high)} / {fmtPrice(r.low)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCellSx} align="right">
                                            <Typography sx={{ fontFamily: MONO, fontSize: '13px', color: 'text.primary' }}>${fmtCompact(r.cap)}</Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCellSx} align="right">
                                            <Typography sx={{ fontFamily: MONO, fontSize: '13px', color: 'text.primary' }}>${fmtCompact(r.vol)}</Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCellSx}>
                                            <TrendSpark data={r.trend} positive={positive} />
                                        </TableCell>

                                        <TableCell sx={{ ...bodyCellSx, pr: { xs: 2, md: 3 } }} align="right">
                                            <ButtonBase disabled sx={{ px: 2, height: 32, borderRadius: '8px', bgcolor: 'GRAY', color: '#ffffff', fontSize: '12px', fontWeight: 700 }}>
                                                Trade
                                            </ButtonBase>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* التذييل: الترقيم */}
            <Box sx={{ px: { xs: 2, md: 3 }, py: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                        Showing {filteredRows.length ? (page - 1) * rowsPerPage + 1 : 0} to {Math.min(page * rowsPerPage, filteredRows.length)} of {filteredRows.length} assets
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>Rows:</Typography>
                        <Select
                            value={rowsPerPage}
                            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                            variant="standard"
                            disableUnderline
                            sx={{ fontSize: '12px', fontFamily: MONO, fontWeight: 600, color: 'text.primary' }}
                        >
                            {[10, 25, 50].map((n) => (
                                <MenuItem key={n} value={n} sx={{ fontSize: '12px', fontFamily: MONO }}>{n}</MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Box>

                <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(_, p) => setPage(p)}
                    shape="rounded"
                    siblingCount={0}
                    boundaryCount={1}
                    sx={{ '& .MuiPaginationItem-root': { fontSize: '12px', fontFamily: MONO, color: 'text.secondary', minWidth: 28, height: 28 }, '& .Mui-selected': { bgcolor: `${NAVY} !important`, color: '#ffffff' } }}
                />
            </Box>
        </Box>
    );
};

export default MarketTable;