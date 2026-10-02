import { useState, useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const MainLayout = ({ toggleTheme, mode }) => {
    const [mobileOpen, setMobileOpen] = useState(false) 


    const { pathname } = useLocation()
    const mainContentRef = useRef(null)

    const handleDrawerToggle = () => {
        setMobileOpen((prev) => !prev)
    }

    useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTo(0, 0);
        }
    }, [pathname]);

    return (
        <Box sx={{scrollBehavior: 'smooth', display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
            <Navbar handleDrawerToggle={handleDrawerToggle} toggleTheme={toggleTheme} mode={mode} />
            <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

            <Box
                component="main"
                ref={mainContentRef}
                sx={{
                    flexGrow: 1,
                    boxSizing: 'border-box',
                    width: '100%',
                    ml: 0,
                    mt: { xs: '82px', md: '100px' },
                    px: { xs: 2, sm: 3, md: 4 },
                    pb: { xs: 3, md: 4 },
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}
            >

                <Outlet />
            </Box>
        </Box>
    )
}

export default MainLayout
