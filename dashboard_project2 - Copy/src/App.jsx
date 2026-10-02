import { useEffect, useMemo, useState } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import AppRoutes from './routes/AppRoutes'
import { getCustomTheme } from './theme/AppTheme'

function App() {
    const [mode, setMode] = useState(() => localStorage.getItem('precision-dashboard-theme') ?? 'light')

    useEffect(() => {
        localStorage.setItem('precision-dashboard-theme', mode)
    }, [mode])

    const theme = useMemo(() => getCustomTheme(mode), [mode])

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme />

            <AppRoutes mode={mode} toggleTheme={toggleTheme} />
        </ThemeProvider>
    )
}

export default App
