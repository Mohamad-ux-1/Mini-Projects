import { createTheme } from '@mui/material/styles'

const getPalette = (mode) => {
    const isLight = mode === 'light'

    return {
        mode,
        primary: {
            main: isLight ? '#2563eb' : '#8fb4ff',
            light: isLight ? '#5b8cff' : '#c5d8ff',
            dark: isLight ? '#1d4ed8' : '#5e8de8',
            contrastText: '#ffffff',
        },
        secondary: {
            main: isLight ? '#7c3aed' : '#c4b5fd',
        },
        background: {
            default: isLight ? '#f4f7fb' : '#0a0a0a',
            paper: isLight ? '#ffffff' : '#121212',
        },
        text: {
            primary: isLight ? '#0f172a' : '#f8fafc',
            secondary: isLight ? '#64748b' : '#94a3b8',
        },
        divider: isLight ? '#dbe2ea' : '#262626',
    }
}

export const getCustomTheme = (mode) => {
    const palette = getPalette(mode)

    return createTheme({
        palette,
        typography: {
            fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeightRegular: 400,
            fontWeightMedium: 600,
            fontWeightBold: 700,
            h4: { fontWeight: 800, letterSpacing: '-0.03em' },
            h5: { fontWeight: 800, letterSpacing: '-0.02em' },
            h6: { fontWeight: 700, letterSpacing: '-0.01em' },
            button: { fontWeight: 700, textTransform: 'none' },
        },
        shape: {
            borderRadius: 16,
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: palette.background.default,
                        color: palette.text.primary,
                    },
                    '*::-webkit-scrollbar': {
                        width: 10,
                        height: 10,
                    },
                    '*::-webkit-scrollbar-thumb': {
                        borderRadius: 999,
                        backgroundColor: mode === 'light' ? '#c5d2e3' : '#334155',
                        border: `2px solid ${palette.background.default}`,
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backdropFilter: 'blur(18px)',
                        backgroundColor: mode === 'light' ? 'rgba(244, 247, 251, 0.82)' : 'rgba(10, 10, 10, 0.82)',
                        borderBottom: `1px solid ${palette.divider}`,
                        boxShadow: 'none',
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundImage: 'none',
                        backgroundColor: palette.background.paper,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        border: `1px solid ${palette.divider}`,
                        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',

                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        borderRadius: 12,
                        fontWeight: 700,
                        boxShadow: 'none',
                    },
                    containedPrimary: {
                        boxShadow: '0 12px 24px rgba(37, 99, 235, 0.18)',
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 14,
                        backgroundColor: mode === 'light' ? '#ffffff' : '#1a1a1a',
                    },
                    notchedOutline: {
                        borderColor: palette.divider,
                    },
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 14,
                    },
                },
            },
        },
    })
}
