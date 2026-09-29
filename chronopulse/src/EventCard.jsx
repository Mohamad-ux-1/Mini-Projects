import React from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import RemoveCircleOutlineRounded from '@mui/icons-material/RemoveCircleOutlineRounded';
import { CATEGORIES } from './constants';
import { tokens } from './theme';

/**
 * One block in the time grid. Position and size come from the block's real start/end time
 * (computed by TimeGrid), so nothing here is hard-coded to a pixel value.
 */
export default function EventCard({ event, top, height, leftPct, widthPct, active, selected, dimmed, onSelect }) {
  const cat = CATEGORIES[event.category] ?? CATEGORIES.Team;
  const compact = height < 56;
  const roomy = height >= 96;

  return (
    <ButtonBase
      onClick={(e) => {
        e.stopPropagation(); // do not trigger "create block" on the column underneath
        onSelect(event.id);
      }}
      aria-label={`${event.title}, ${event.start} to ${event.end}`}
      aria-pressed={selected}
      sx={{
        position: 'absolute',
        top: `${top + 1}px`,
        height: `${height - 2}px`,
        left: `calc(${leftPct}% + 3px)`,
        width: `calc(${widthPct}% - 6px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        textAlign: 'left',
        overflow: 'hidden',
        px: 1,
        py: compact ? 0.25 : 1,
        borderRadius: 2,
        bgcolor: active ? 'primary.main' : tokens.raised,
        color: active ? 'primary.contrastText' : 'text.primary',
        borderLeft: active ? 'none' : `3px solid ${cat.color}`,
        outline: selected ? `2px solid ${tokens.accent}` : 'none',
        outlineOffset: 1,
        opacity: dimmed ? 0.35 : 1,
        boxShadow: active ? `0 0 24px ${alpha(tokens.accent, 0.3)}` : 'none',
        zIndex: selected ? 3 : 2,
        transition: 'opacity 0.2s',
        '&:hover': { bgcolor: active ? 'primary.main' : '#2d2e36' },
      }}
    >
      {compact ? (
        <Typography component="span" noWrap sx={{ fontSize: 12, fontWeight: 700, width: '100%' }}>
          <Box component="span" sx={{ opacity: 0.7, fontWeight: 500, mr: 0.75 }}>
            {event.start}
          </Box>
          {event.title}
        </Typography>
      ) : (
        <>
          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, width: '100%', minWidth: 0 }}>
            <Box
              component="span"
              sx={{
                px: 0.75,
                py: 0.125,
                borderRadius: 99,
                fontSize: 10,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                bgcolor: active ? alpha('#000', 0.15) : alpha(cat.color, 0.16),
                color: active ? 'inherit' : cat.color,
              }}
            >
              {active ? 'IN PROGRESS' : cat.label}
            </Box>
            <Box component="span" sx={{ fontSize: 10, opacity: 0.75, whiteSpace: 'nowrap' }}>
              {roomy ? `${event.start}–${event.end}` : event.start}
            </Box>
          </Box>

          <Typography
            component="span"
            sx={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              overflow: 'hidden',
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {event.title}
          </Typography>

          {event.location && (
            <Typography
              component="span"
              noWrap
              sx={{ fontSize: 11, mt: 0.5, width: '100%', color: active ? 'inherit' : tokens.warn, opacity: active ? 0.8 : 1 }}
            >
              {event.location}
            </Typography>
          )}

          {roomy && event.dnd && (
            <Box
              component="span"
              sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 11, color: active ? 'inherit' : 'primary.main' }}
            >
              <RemoveCircleOutlineRounded sx={{ fontSize: 14 }} />
              DND Active
            </Box>
          )}
        </>
      )}
    </ButtonBase>
  );
}
