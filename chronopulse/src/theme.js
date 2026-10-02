import { createTheme } from '@mui/material/styles';

// Single source of truth for colours used outside the MUI palette.
export const tokens = {
  accent: '#00FFA3',
  accentDark: '#00CC83',
  bg: '#121215',
  surface: '#1D1E24',
  raised: '#25262D',
  border: '#2A2B32',
  muted: '#8B8D98',
  warn: '#E3A54B',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: tokens.accent, dark: tokens.accentDark, contrastText: '#000000' },
    warning: { main: tokens.warn },
    background: { default: tokens.bg, paper: tokens.surface },
    text: { primary: '#FFFFFF', secondary: tokens.muted },
    divider: tokens.border,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 13,
    button: { textTransform: 'none', fontWeight: 600 },
    h6: { fontWeight: 700 },
    subtitle2: { fontWeight: 600 },
    caption: { fontSize: 11.5 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': { boxSizing: 'border-box' },
        'html, body, #root': { height: '100%', margin: 0, overflow: 'hidden' },
        body: { colorScheme: 'dark' },
        '*:focus-visible': { outline: `2px solid ${tokens.accent}`, outlineOffset: 2 },
        '@media (prefers-reduced-motion: reduce)': {
          '*': { transitionDuration: '0.01ms !important', animationDuration: '0.01ms !important' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 24, padding: '8px 20px' },
        sizeSmall: { padding: '4px 14px' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', boxShadow: 'none', border: `1px solid ${tokens.border}` },
      },
    },
  },
});

export default theme;
