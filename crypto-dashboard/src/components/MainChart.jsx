// src/components/MainChart.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, ButtonBase, Typography, useTheme, CircularProgress } from '@mui/material';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import TuneIcon from '@mui/icons-material/Tune';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const MONO = '"JetBrains Mono", monospace';
const NAVY = '#0b3f9e';
const VIEWS = ['Price', 'Depth', 'Candles'];
const RANGES = ['1H', '1D', '1W', '1M', '1Y', 'ALL'];

/* ------------------------------------------------------------------ */
/* أدوات التنسيق                                                       */
/* ------------------------------------------------------------------ */
const formatUsd = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatCompact = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
const formatAxis = (v) => (Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(2)}`);
const utc = (ts, opts) => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...opts }).format(ts);
const utcTime = (ts) => utc(ts, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/* ------------------------------------------------------------------ */
/* إعدادات الفترات الزمنية لـ Binance API                              */
/* ------------------------------------------------------------------ */
const RANGE_CONFIG = {
  '1H': { interval: '1m', limit: 60, volLabel: '1m' },
  '1D': { interval: '15m', limit: 96, volLabel: '15m' },
  '1W': { interval: '2h', limit: 84, volLabel: '2h' },
  '1M': { interval: '1d', limit: 30, volLabel: '1d' },
  '1Y': { interval: '1w', limit: 52, volLabel: '1w' },
  'ALL': { interval: '1M', limit: 120, volLabel: '1M' }, // 10 سنوات
};

const LABELS = {
  '1H': utcTime,
  '1D': utcTime,
  '1W': (ts) => utc(ts, { weekday: 'short', day: 'numeric' }),
  '1M': (ts) => utc(ts, { month: 'short', day: 'numeric' }),
  '1Y': (ts) => utc(ts, { month: 'short', day: 'numeric' }),
  ALL: (ts) => utc(ts, { month: 'short', year: 'numeric' }),
};

// محور Y: 5 قيم مرتبة حسب مدى الأسعار
const niceStep = (x) => {
  const e = 10 ** Math.floor(Math.log10(x));
  const f = x / e;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e;
};

const buildYAxis = (prices) => {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const step = niceStep((range * 1.15) / 4);
  const lo = Math.floor((min - step * 0.4) / (step / 2)) * (step / 2);
  let ticks = [0, 1, 2, 3, 4].map((k) => lo + k * step);
  if (ticks[ticks.length - 1] < max + step * 0.15) ticks = [...ticks, lo + 5 * step];
  return { ticks, domain: [ticks[0], ticks[ticks.length - 1]] };
};

// مؤشرات تجريبية (تحديثها مستقبلاً إذا احتجت)
const INDICATORS = [
  { label: 'RSI (14)', value: '58.42', badge: 'NEUTRAL' },
  { label: '24h MACD', value: 'Bullish Cross', type: 'macd' },
  { label: '50-Day MA', value: '$66,210.00' },
  { label: 'Funding Rate (8h)', value: '+0.0102%', type: 'funding' },
];

/* ------------------------------------------------------------------ */
/* مكونات فرعية                                                        */
/* ------------------------------------------------------------------ */
const XTick = ({ x, y, payload, series, tickValues, palette }) => {
  const label = series[payload.value]?.label ?? '';
  const isFirst = payload.value === tickValues[0];
  const isLast = payload.value === tickValues[tickValues.length - 1];
  const isLive = label.startsWith('Live');
  return (
      <text
          x={x}
          y={y + 16}
          textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
          fontFamily={MONO}
          fontSize={10}
          fontWeight={isLive ? 700 : 500}
          fill={isLive ? palette.live : palette.muted}
      >
        {label}
      </text>
  );
};

const TOOLTIP_W = 190;
const ChartTooltip = ({ active, payload, coordinate, series, volLabel, intraday, boxWidth }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const pct = ((point.price - series[0].price) / series[0].price) * 100;
  const isLive = point.i === series.length - 1;
  const x = coordinate?.x ?? 0;
  const left = Math.min(Math.max(x - TOOLTIP_W / 2, 0), Math.max((boxWidth || TOOLTIP_W) - TOOLTIP_W, 0));
  const dateText = intraday
      ? `${utc(point.ts, { month: 'short', day: 'numeric' })}, ${utcTime(point.ts)} UTC`
      : utc(point.ts, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
      <Box
          sx={{
            width: TOOLTIP_W,
            transform: `translateX(${left - x}px)`,
            bgcolor: '#131b2e',
            color: '#ffffff',
            borderRadius: '8px',
            px: 1.5,
            py: 1.25,
            boxShadow: '0 8px 24px rgba(15,23,42,0.25)',
          }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '10px', color: '#c3c6d6' }}>{dateText}</Typography>
          {isLive && <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#6ffbbe' }}>Live Point</Typography>}
        </Box>
        <Typography sx={{ fontFamily: MONO, fontSize: '20px', fontWeight: 700, lineHeight: 1.4 }}>{formatUsd(point.price)}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '10px', color: '#c3c6d6' }}>Vol ({volLabel}): {formatCompact(point.vol)}</Typography>
          <Typography sx={{ fontFamily: MONO, fontSize: '10px', fontWeight: 600, color: pct >= 0 ? '#6ffbbe' : '#ffb4ab' }}>
            {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
          </Typography>
        </Box>
      </Box>
  );
};

const Segmented = ({ options, value, onChange, chip, activeSx, itemMinWidth = 0 }) => (
    <Box sx={{ display: 'flex', gap: 0.25, p: 0.5, borderRadius: '10px', bgcolor: chip }}>
      {options.map((opt) => {
        const active = opt === value;
        return (
            <ButtonBase
                key={opt}
                onClick={() => onChange(opt)}
                sx={{
                  minWidth: itemMinWidth,
                  px: 1.5, height: 30, borderRadius: '8px', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
                  color: active ? activeSx.color : 'text.secondary',
                  bgcolor: active ? activeSx.bgcolor : 'transparent',
                  boxShadow: active ? activeSx.boxShadow : 'none',
                }}
            >
              {opt}
            </ButtonBase>
        );
      })}
    </Box>
);

/* ------------------------------------------------------------------ */
/* المكوّن الرئيسي                                                     */
/* ------------------------------------------------------------------ */
const MainChart = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const [view, setView] = useState('Price');
  const [range, setRange] = useState('1D');
  const [hoverPrice, setHoverPrice] = useState(null);
  const [isFs, setIsFs] = useState(false);
  const [chartWidth, setChartWidth] = useState(0);

  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticker24h, setTicker24h] = useState({ volumeUsd: 0 });

  const cardRef = useRef(null);
  const chartBoxRef = useRef(null);

  const palette = {
    line: isLight ? NAVY : '#7aa7ff',
    accent: isLight ? NAVY : '#8ab4ff',
    live: isLight ? '#00573a' : '#6ffbbe',
    muted: theme.palette.text.secondary,
    grid: theme.palette.divider,
    chip: isLight ? '#eaf1ff' : theme.palette.action.hover,
    chipStrong: isLight ? '#dce9ff' : theme.palette.action.selected,
  };

  // جلب البيانات التاريخية للرسم البياني عند تغيير الفترة الزمنية
  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const { interval, limit } = RANGE_CONFIG[range];
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=${limit}`);
        const data = await res.json();

        const formatted = data.map((d, i) => ({
          i,
          ts: d[0], // Open time
          price: parseFloat(d[4]), // Close price
          vol: parseFloat(d[5]), // Volume
          label: i === data.length - 1 ? (range === '1D' ? `Live (${utcTime(d[0])})` : 'Live') : LABELS[range](d[0]),
        }));
        setSeries(formatted);
      } catch (err) {
        console.error("Error fetching chart data:", err);
      }
      setLoading(false);
    };
    fetchChartData();
  }, [range]);

  // جلب بيانات الحجم والتغير العام خلال 24 ساعة مرة واحدة
  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
        const data = await res.json();
        setTicker24h({ volumeUsd: parseFloat(data.quoteVolume) });
      } catch (err) {
        console.error("Error fetching 24h ticker:", err);
      }
    };
    fetchTicker();
  }, []);

  // الحسابات الديناميكية بناءً على البيانات المستلمة
  const yAxis = useMemo(() => series.length > 0 ? buildYAxis(series.map((p) => p.price)) : { ticks: [], domain: [0, 0] }, [series]);
  const ticks = useMemo(() => series.length > 0 ? Array.from({ length: 7 }, (_, k) => Math.floor((k * (series.length - 1)) / 6)) : [], [series]);

  const first = series.length > 0 ? series[0].price : 0;
  const last = series.length > 0 ? series[series.length - 1].price : 0;
  const delta = last - first;
  const pct = first > 0 ? (delta / first) * 100 : 0;
  const isUp = delta >= 0;
  const changeColor = isUp ? '#00a86b' : '#BA1A1A';
  const lastIndex = Math.max(0, series.length - 1);
  const { volLabel } = RANGE_CONFIG[range];
  const intraday = range === '1H' || range === '1D';

  // قياس العرض لتموضع Tooltip
  useEffect(() => {
    const el = chartBoxRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setChartWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // وضع ملء الشاشة
  useEffect(() => {
    const onChange = () => setIsFs(document.fullscreenElement === cardRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else cardRef.current?.requestFullscreen?.();
  };

  const handleMove = (state) => {
    const idx = Number(state?.activeTooltipIndex);
    if (Number.isFinite(idx) && series[idx]) setHoverPrice(series[idx].price);
  };

  const renderLastDot = ({ cx, cy, payload }) =>
      payload?.i === lastIndex ? <circle key={`dot-${payload.i}`} cx={cx} cy={cy} r={4} fill={palette.live} /> : <g key={`dot-${payload?.i}`} />;

  const iconBtnSx = { width: 34, height: 34, borderRadius: '8px', bgcolor: palette.chip, color: 'text.secondary' };

  return (
      <Box ref={cardRef} sx={{ bgcolor: 'background.paper', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)', p: { xs: 2, md: 4 } }}>
        {/* الرأس */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: NAVY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700 }}>₿</Box>
              <Typography sx={{ fontSize: '20px', fontWeight: 600, color: 'text.primary', lineHeight: 1 }}>Bitcoin / USD</Typography>
              <Box sx={{ px: 1, py: 0.25, borderRadius: '4px', bgcolor: palette.chipStrong, color: 'text.secondary', fontFamily: MONO, fontSize: '10px', fontWeight: 600 }}>BTC/USD</Box>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: palette.live }} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 2.5, rowGap: 1 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: { xs: 28, md: 36 }, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, color: 'text.primary' }}>
                {formatUsd(last)}
              </Typography>

              <Box sx={{ fontFamily: MONO, fontSize: '13px', fontWeight: 600, color: changeColor, lineHeight: 1.3 }}>
                <div>{isUp ? '+' : '-'}{formatUsd(Math.abs(delta))}</div>
                <div>({isUp ? '+' : ''}{pct.toFixed(2)}%)</div>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                <Box sx={{ lineHeight: 1.3 }}>
                  <Typography sx={{ fontSize: '12px', color: 'text.secondary', lineHeight: 1.3 }}>24h Vol:</Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '12px', fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                    {ticker24h.volumeUsd ? formatCompact(ticker24h.volumeUsd) : '...'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
              <Segmented options={VIEWS} value={view} onChange={setView} chip={palette.chip} itemMinWidth={64} activeSx={{ color: 'text.primary', bgcolor: 'background.paper', boxShadow: '0 1px 3px rgba(15,23,42,0.12)' }} />
              <Box sx={{ width: '1px', height: 28, bgcolor: 'divider', display: { xs: 'none', sm: 'block' } }} />
              <Segmented options={RANGES} value={range} onChange={(r) => { setRange(r); setHoverPrice(null); }} chip={palette.chip} itemMinWidth={36} activeSx={{ color: '#ffffff', bgcolor: NAVY, boxShadow: 'none' }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <ButtonBase sx={iconBtnSx} aria-label="Chart settings"><TuneIcon sx={{ fontSize: 18 }} /></ButtonBase>
              <ButtonBase sx={iconBtnSx} onClick={toggleFullscreen} aria-label="Toggle fullscreen">{isFs ? <FullscreenExitIcon sx={{ fontSize: 18 }} /> : <FullscreenIcon sx={{ fontSize: 18 }} />}</ButtonBase>
            </Box>
          </Box>
        </Box>

        {/* الرسم البياني */}
        <Box ref={chartBoxRef} sx={{ height: isFs ? 'calc(100vh - 380px)' : 340, minHeight: 340, mt: 1, position: 'relative' }}>
          {loading && (
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                <CircularProgress size={30} />
              </Box>
          )}

          {series.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 44, right: 0, left: 0, bottom: 0 }} onMouseMove={handleMove} onMouseLeave={() => setHoverPrice(null)}>
                  <defs>
                    <linearGradient id="mainChartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={palette.line} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={palette.line} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid vertical={false} stroke={palette.grid} />

                  <XAxis
                      type="number" dataKey="i" domain={[0, series.length - 1]} ticks={ticks} allowDecimals={false} axisLine={{ stroke: palette.grid }} tickLine={false} height={30}
                      tick={<XTick series={series} tickValues={ticks} palette={palette} />}
                  />

                  <YAxis
                      orientation="right" width={54} domain={yAxis.domain} ticks={yAxis.ticks} tickFormatter={formatAxis} tickMargin={8} axisLine={false} tickLine={false}
                      tick={{ fontSize: 10, fontFamily: MONO, fill: palette.muted }}
                  />

                  {hoverPrice != null && <ReferenceLine y={hoverPrice} stroke="#9aa3b5" strokeDasharray="3 3" />}

                  <Tooltip
                      cursor={{ stroke: '#9aa3b5', strokeDasharray: '3 3' }} position={{ y: 4 }} offset={0} allowEscapeViewBox={{ x: true, y: true }} isAnimationActive={false} wrapperStyle={{ zIndex: 10, outline: 'none' }}
                      content={<ChartTooltip series={series} volLabel={volLabel} intraday={intraday} boxWidth={chartWidth} />}
                  />

                  <Area
                      type="monotone" dataKey="price" stroke={palette.line} strokeWidth={2} fill="url(#mainChartGradient)" fillOpacity={1} isAnimationActive={false} dot={renderLastDot}
                      activeDot={{ r: 5, fill: palette.line, stroke: isLight ? '#c9d8ff' : '#2a3f6b', strokeWidth: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
          )}
        </Box>

        {/* المؤشرات الفنية */}
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
          {INDICATORS.map((ind) => (
              <Box key={ind.label} sx={{ bgcolor: palette.chip, borderRadius: '8px', px: 2, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{ind.label}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {ind.type === 'macd' && <TrendingUpIcon sx={{ fontSize: 16, color: palette.live }} />}
                  <Typography sx={{ fontFamily: MONO, fontSize: '14px', fontWeight: 700, color: ind.type === 'macd' ? palette.live : ind.type === 'funding' ? (isLight ? '#0058be' : '#8ab4ff') : 'text.primary' }}>
                    {ind.value}
                  </Typography>
                  {ind.badge && <Box sx={{ px: 0.75, py: 0.25, borderRadius: '4px', bgcolor: palette.chipStrong, color: 'text.secondary', fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em' }}>{ind.badge}</Box>}
                </Box>
              </Box>
          ))}
        </Box>
      </Box>
  );
};

export default MainChart;