import React, { useState } from 'react'
import {
    Avatar,
    Box,
    Button,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Typography,
    useTheme,
    useMediaQuery,
    Paper,
    BottomNavigation,
    BottomNavigationAction,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Slide,
    Backdrop
} from '@mui/material'
import {
    ShoppingCart,
    Logout,
    BarChart,
    Dashboard as DashboardIcon,
    Description,
    Group,
    Settings,
    QuestionAnswer,
    WarningAmberRounded
} from '@mui/icons-material'
import IP from '../pages/IP'
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

export const drawerWidth = 280

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
    { text: 'Analytics', icon: <BarChart fontSize="small" />, path: '/analytics' },
    { text: 'Users And Products ', icon: <Group fontSize="small" />, path: '/team' },
    { text: 'Orders', icon: <ShoppingCart fontSize="small" />, path: '/orders' },
    { text: 'Our Products', icon: <PrecisionManufacturingIcon fontSize="small" />, path: '/ourproducts' },
    { text: 'Notes', icon: <Description fontSize="small" />, path: '/notes' },
    { text: 'FAQ', icon: <QuestionAnswer fontSize="small" />, path: '/faq' },
    { text: 'Settings', icon: <Settings fontSize="small" />, path: '/settings' },
]

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
    const navigation = useNavigate()
    const { pathname } = useLocation()
    const theme = useTheme()

    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const isLight = theme.palette.mode === 'light'

    const isItemActive = (path) => pathname === path

    function confirmLogout() {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        fetch(`${IP}/api/admin/logout`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => console.error(err));

        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        sessionStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('token');

        setLogoutDialogOpen(false);
        navigation('/login', { replace: true })
    }

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: { xs: 2.5, md: 3.5 } }}>
            <Toolbar sx={{ px: 3, mb: 1.5 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Avatar src='/pro.jpg' />
                    <Box>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                            DASHBOARD
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            E-Commerce
                        </Typography>
                    </Box>
                </Stack>
            </Toolbar>

            <Box sx={{ px: 2.5, pb: 2, flexGrow: 1 }}>
                <List sx={{ mt: { xs: 2.5, md: 3.5 } }}>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.75 }}>
                            <ListItemButton
                                component={NavLink}
                                to={item.path}
                                onClick={handleDrawerToggle}
                                selected={isItemActive(item.path)}
                                sx={{
                                    py: 1.1,
                                    px: 1.5,
                                    borderRadius: '12px',
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        boxShadow: '0 10px 24px rgba(37, 99, 235, 0.15)',
                                        '&:hover': {
                                            bgcolor: 'primary.dark',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{ minWidth: 38, color: isItemActive(item.path) ? 'inherit' : 'text.secondary' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isItemActive(item.path) ? 700 : 500 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ my: 2 }} />
            </Box>
        </Box>
    )

    return (
        <>
            {isMobile ? (
                <Paper sx={{ width:'92%', mx:'auto', bgcolor: 'transparent', position: 'fixed', bottom: 10, left: 0, right: 0, zIndex: 1200 ,borderRadius: '20px'}} elevation={4}>
                    <BottomNavigation
                        value={pathname}
                        showLabels
                        sx={{
                            bgcolor: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(18,18,18,0.85)',
                            backdropFilter: 'blur(32px)',
                            WebkitBackdropFilter: 'blur(32px)',
                            borderRadius: '20px',
                            width: '100%',
                            overflowX: 'auto',
                            justifyContent: 'flex-start',
                            '&::-webkit-scrollbar': { display: 'none' },
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                        }}
                    >
                        {menuItems.map((item) => (
                            <BottomNavigationAction
                                key={item.text}
                                value={item.path}
                                label={item.text.length > 6 ? item.text.substring(0, 6)+'...' : item.text}
                                icon={item.icon}
                                onClick={() => navigation(item.path)}
                                sx={{
                                    minWidth: '72px',
                                    padding: '6px 0px',
                                    color: isItemActive(item.path) ? 'primary.main' : 'text.secondary'
                                }}
                            />
                        ))}
                        <BottomNavigationAction
                            label="Logout"
                            value="logout"
                            icon={<Logout fontSize="small" />}
                            onClick={() => setLogoutDialogOpen(true)}
                            sx={{ minWidth: '72px', padding: '6px 0px', color: 'error.main' }}
                        />
                    </BottomNavigation>
                </Paper>
            ) : (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: 'block',
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            borderRight: 'none',
                            boxShadow: isLight ? '1px 0 20px rgba(0,0,0,0.05)' : '1px 0 20px rgba(0,0,0,0.4)',
                        },
                    }}
                >
                    {drawerContent}
                    <Button
                        endIcon={<Logout />}
                        onClick={() => setLogoutDialogOpen(true)}
                        sx={{
                            width: 'calc(100% - 40px)',
                            borderRadius: '12px',
                            p: 1.2,
                            mx: 'auto',
                            mb: 3,
                            color: 'error.main',
                            bgcolor: isLight ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.1)',
                            fontWeight: 700,
                            '&:hover': {
                                bgcolor: 'error.main',
                                color: '#fff',
                                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.25)',
                            }
                        }}
                    >
                        Log Out
                    </Button>
                </Drawer>
            )}

            <Dialog
                open={logoutDialogOpen}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => setLogoutDialogOpen(false)}
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        sx: {
                            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                        },
                    },
                }}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: '24px',
                        p: 1,
                        minWidth: 320,
                        backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 30, 30, 0.95)',
                        border: '1px solid',
                        borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                        boxShadow: isLight ? '0 24px 48px rgba(0,0,0,0.1)' : '0 24px 48px rgba(0,0,0,0.5)',
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 3 }}>
                    <Box sx={{
                        p: 1.5,
                        bgcolor: isLight ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.2)',
                        borderRadius: '50%',
                        display: 'flex'
                    }}>
                        <WarningAmberRounded color="error" fontSize="large" />
                    </Box>
                    <Typography variant="h6" fontWeight={800} textAlign="center">
                        Confirm Logout
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ px: 2, lineHeight: 1.6 }}>
                        Are you sure you want to log out of your account? You will need to enter your credentials again to access the dashboard.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3, gap: 1 }}>
                    <Button
                        onClick={() => setLogoutDialogOpen(false)}
                        variant="outlined"
                        color="inherit"
                        sx={{
                            flex: 1,
                            borderRadius: '12px',
                            py: 1,
                            borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                            fontWeight: 600
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmLogout}
                        variant="contained"
                        color="error"
                        disableElevation
                        sx={{
                            flex: 1,
                            borderRadius: '12px',
                            py: 1,
                            fontWeight: 600,
                            boxShadow: '0 8px 16px rgba(239, 68, 68, 0.25)',
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
                            }
                        }}
                    >
                        Log Out
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default Sidebar
