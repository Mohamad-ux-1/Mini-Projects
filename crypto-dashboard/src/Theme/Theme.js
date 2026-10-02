import { createTheme } from '@mui/material/styles'

const getPalette = (mode) => {
    const isLight = mode === 'light'

    return {
        mode,
        primary: {
            main: isLight ? '#1558d6' : '#8fb4ff', // أزرق مطابق للقائمة الجانبية وأزرار Trade
            light: isLight ? '#5b8cff' : '#c5d8ff',
            dark: isLight ? '#0d47a1' : '#5e8de8',
            contrastText: '#ffffff',
        },
        success: {
            main: '#10b981', // أخضر للنسب الإيجابية
            light: '#d1fae5',
        },
        error: {
            main: '#ef4444', // أحمر للنسب السلبية
            light: '#fee2e2',
        },
        background: {
            default: isLight ? '#f4f6f8' : '#0a0a0a', // رمادي فاتح للخلفية العامة
            paper: isLight ? '#ffffff' : '#121212', // أبيض للكروت
        },
        text: {
            primary: isLight ? '#111827' : '#f8fafc',
            secondary: isLight ? '#6b7280' : '#94a3b8',
        },
        divider: isLight ? '#e5e7eb' : '#262626',
    }
}

export const getCustomTheme = (mode) => {
    const palette = getPalette(mode)

    return createTheme({
        palette,
        typography: {
            fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeightRegular: 400,
            fontWeightMedium: 500,
            fontWeightBold: 600,
            h4: { fontWeight: 700, letterSpacing: '-0.02em' },
            h5: { fontWeight: 700, letterSpacing: '-0.01em' },
            h6: { fontWeight: 600 },
            button: { fontWeight: 600, textTransform: 'none' },
        },
        shape: {
            borderRadius: 12, // حواف ناعمة للكروت
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: palette.background.default,
                        color: palette.text.primary,
                    },
                    '*::-webkit-scrollbar': {
                        width: 8,
                        height: 8,
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
                        backgroundColor: palette.background.paper,
                        borderBottom: `1px solid ${palette.divider}`,
                        boxShadow: 'none', // إزالة الظل ليطابق التصميم المسطح
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundImage: 'none',
                        backgroundColor: palette.background.paper,
                        borderRight: `1px solid ${palette.divider}`,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        border: `1px solid ${palette.divider}`,
                        boxShadow: 'none', // التصميم في الصورة لا يحتوي على ظلال قوية للكروت
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        boxShadow: 'none',
                        border: `1px solid ${palette.divider}`,
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        borderRadius: 8, // حواف أزرار Trade
                        fontWeight: 600,
                        boxShadow: 'none',
                    },
                    containedPrimary: {
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                        }
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
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
                        borderRadius: 8,
                        margin: '4px 16px',
                        padding: '8px 16px',
                        '&.Mui-selected': {
                            backgroundColor: palette.primary.main, // لون أزرق عند التحديد
                            color: palette.primary.contrastText, // نص أبيض عند التحديد
                            '& .MuiListItemIcon-root': {
                                color: palette.primary.contrastText,
                            },
                            '&:hover': {
                                backgroundColor: palette.primary.dark,
                            },
                        },
                    },
                },
            },
        },
    })
}