import React, { useId, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from './theme';

const SIZE = 180;
const R = 72; // outer radius
const THICKNESS = 26; // donut ring thickness
const CX = SIZE / 2;
const CY = SIZE / 2;

const polar = (angleDeg, radius) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
};

/** SVG donut-slice path for one ring segment between two angles (in degrees). */
function ringSlice(startAngle, endAngle, outerR, innerR) {
  const large = endAngle - startAngle > 180 ? 1 : 0;
  const [x1, y1] = polar(startAngle, outerR);
  const [x2, y2] = polar(endAngle, outerR);
  const [x3, y3] = polar(endAngle, innerR);
  const [x4, y4] = polar(startAngle, innerR);
  return [
    `M ${x1} ${y1}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ');
}

/**
 * Donut chart for a small category breakdown.
 * `data`: [{ key, label, color, value }]. `centerLabel` / `centerSub` sit in the middle of the ring.
 */
export default function PieChart({ data, centerLabel, centerSub, formatValue = (v) => String(v) }) {
  const uid = useId();
  const [hoverKey, setHoverKey] = useState(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const withShare = data.filter((d) => d.value > 0);

  if (!total || withShare.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: SIZE, color: 'text.secondary' }}>
        <Typography variant="body2">Nothing scheduled yet</Typography>
      </Box>
    );
  }

  let cursor = 0;
  const slices = withShare.map((d) => {
    const pct = d.value / total;
    const start = cursor * 360;
    cursor += pct;
    const end = cursor * 360;
    return { ...d, pct, start, end: Math.min(end, start + 359.99) };
  });

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
      <Box sx={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Time by category">
          <title>Time by category</title>
          {slices.length === 1 ? (
            <circle cx={CX} cy={CY} r={R - THICKNESS / 2} fill="none" stroke={slices[0].color} strokeWidth={THICKNESS} />
          ) : (
            slices.map((s) => (
              <path
                key={s.key}
                d={ringSlice(s.start, s.end, R, R - THICKNESS)}
                fill={s.color}
                opacity={hoverKey && hoverKey !== s.key ? 0.35 : 1}
                stroke={tokens.surface}
                strokeWidth={1}
                style={{ transition: 'opacity 0.15s', cursor: 'pointer' }}
                onMouseEnter={() => setHoverKey(s.key)}
                onMouseLeave={() => setHoverKey(null)}
              >
                <title>
                  {s.label}: {formatValue(s.value)} ({Math.round(s.pct * 100)}%)
                </title>
              </path>
            ))
          )}
        </svg>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>
            {hoverKey ? formatValue(slices.find((s) => s.key === hoverKey).value) : centerLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {hoverKey ? slices.find((s) => s.key === hoverKey).label : centerSub}
          </Typography>
        </Box>
      </Box>

      <Box component="ul" aria-hidden sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1, minWidth: 140 }}>
        {slices.map((s) => (
          <Box
            component="li"
            key={s.key}
            onMouseEnter={() => setHoverKey(s.key)}
            onMouseLeave={() => setHoverKey(null)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: hoverKey && hoverKey !== s.key ? 0.5 : 1, cursor: 'pointer' }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
            <Typography variant="body2" noWrap sx={{ flex: 1 }}>
              {s.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(s.pct * 100)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
