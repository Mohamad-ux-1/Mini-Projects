import { useState, useEffect } from 'react';
import {
    AppBar, Avatar, Badge, Box, Divider, IconButton, ListItemText, Menu, MenuItem, Stack, Toolbar, Typography, Chip,
    CircularProgress, Skeleton
} from '@mui/material';
import { DarkModeOutlined, LightModeOutlined, Menu as MenuIcon, NotificationsNone, CalendarTodayOutlined } from '@mui/icons-material';
import IP from '../pages/IP.js';

const Navbar = ({ handleDrawerToggle, toggleTheme, mode }) => {
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoad, setNotificationsLoad] = useState(true);
    const [error, setError] = useState(false);

    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const isLight = mode === 'light';

    // دالة لجلب الإشعارات من السيرفر
    const fetchNotifications = async () => {
    try {
        const response = await fetch(`${IP}/api/admin/activity-log`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const result = await response.json();
        
        // أضف هذا السطر هنا لفحص البيانات
        console.log("عدد الإشعارات القادمة من السيرفر:", result.data?.length);
        console.log("تفاصيل البيانات القادمة:", result); 

        if (result && result.data) {
            // انتبه: إذا كان السيرفر يرسل pagination، قد تحتاج لتغييرها إلى result.data.data
            setNotifications(result.data);
        }
        setError(false);
    } catch (err) {
        console.error('خطأ في جلب الإشعارات:', err);
        setError(true);
    } finally {
        setNotificationsLoad(false);
    }
};
    // استخدام useEffect لتشغيل دالة الجلب عند التحميل، وتكرارها
    useEffect(() => {
        fetchNotifications(); // الجلب الأولي عند فتح الصفحة

        // إعداد مؤقت لجلب البيانات كل 10 ثوانٍ لتبدو أسرع
        // (ملاحظة: للحصول على إشعارات "فورية" حقيقية بدون إرهاق السيرفر، يفضل استخدام WebSockets لاحقاً)
        const intervalId = setInterval(() => {
            fetchNotifications();
        }, 10000); 

        // تنظيف المؤقت عند مغادرة الصفحة أو إغلاق المكون
        return () => clearInterval(intervalId);
    }, []);

    const getName = () => {
        try {
            const storedData = localStorage.getItem('userData');
            return storedData ? JSON.parse(storedData) : {};
        } catch (error) {
            return {};
        }
    };

    const userName = getName().name || 'Admin User';
    const firstName = userName.split(' ')[0];

    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    const isNotificationsMenuOpen = Boolean(notificationAnchorEl);

    const unreadCount = Array.isArray(notifications)
        ? notifications.filter((item) => item.is_read === false).length
        : 0;

    async function handleOpenNotifications(event) {
        setNotificationAnchorEl(event.currentTarget);

        // تحويل is_read إلى true لجميع الإشعارات حتى تختفي العلامة الحمراء فوراً
        setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));

        try {
            const response = await fetch(`${IP}/api/admin/notifications/mark-read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                console.error('فشل الطلب، حالة الخطأ:', response.status);
                return;
            }
            console.log('تم تحديث الإشعارات في السيرفر بنجاح!');
        } catch (e) {
            console.error('خطأ في الاتصال بالشبكة:', e);
        }
    }

    const handleCloseNotifications = () => {
        setNotificationAnchorEl(null);
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                top: { xs: 10, md: 16 },
                left: 0,
                right: 0,
                mx: 'auto',
                width: { xs: '92%', md: 'calc(100% - 8px)' },
                maxWidth: 1400,
                borderRadius: { xs: '20px', md: '24px' },
                backgroundColor: isLight ? 'rgba(255, 255, 255, 0.72)' : 'rgba(24, 24, 27, 0.72)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.08)',
                boxShadow: isLight
                    ? '0 12px 32px -4px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03)'
                    : '0 12px 32px -4px rgba(0, 0, 0, 0.4), 0 4px 12px -2px rgba(0, 0, 0, 0.2)',
                color: 'text.primary',
                zIndex: (theme) => theme.zIndex.drawer - 1,
            }}
        >
            <Box sx={{
                display: { xs: 'none', md: 'block' },
                backgroundColor: { xs: 'transparent' }, marginTop: -0.3,
                backgroundImage: {
                    xs: 'none', sm: !isLight ? 'url(/nav.jpg)' : 'url(/nav.jpg)'
                },
                height: { xs: 0, lg: '23px' }, width: '100%'
            }} />
            <Toolbar
                sx={{
                    minHeight: { xs: 58, md: 64 },
                    px: { xs: 2, sm: 2.5, md: 3 },
                    justifyContent: 'space-between',
                    gap: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 }, flex: 1, minWidth: 0 }}>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            display: { xs: 'none', md: 'inline-flex' },
                            p: 1,
                            bgcolor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
                            borderRadius: '12px',
                            '&:hover': { bgcolor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)' }
                        }}
                    >
                        <MenuIcon fontSize="small" />
                    </IconButton>

                    <Typography
                        variant="subtitle1"
                        sx={{
                            display: { xs: 'block', md: 'none' },
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            letterSpacing: '-0.3px'
                        }}
                    >
                        Overview
                    </Typography>

                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            gap: 2,
                            pl: 0.5
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '-0.3px' }}>
                            {greeting}, {firstName}
                        </Typography>

                        <Divider orientation="vertical" flexItem sx={{ height: 18, my: 'auto', borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)' }} />

                        <Chip
                            icon={<CalendarTodayOutlined sx={{ fontSize: '0.85rem !important' }} />}
                            label={currentDate}
                            size="small"
                            sx={{
                                border: 'none',
                                color: 'text.secondary',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                bgcolor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
                                px: 0.5,
                                height: 28,
                                borderRadius: '10px'
                            }}
                        />
                    </Box>
                </Box>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <IconButton
                        onClick={toggleTheme}
                        color="inherit"
                        size="small"
                        sx={{
                            p: 1,
                            borderRadius: '12px',
                            bgcolor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
                            '&:hover': { bgcolor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)' },
                        }}
                    >
                        {mode === 'dark' ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
                    </IconButton>

                    <IconButton
                        color="inherit"
                        size="small"
                        onClick={handleOpenNotifications}
                        disabled={notificationsLoad}
                        sx={{
                            p: 1,
                            borderRadius: '12px',
                            bgcolor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
                            '&:hover': { bgcolor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)' },
                        }}
                    >
                        {notificationsLoad ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            <Badge variant='dot' color="error" invisible={unreadCount === 0}>
                                <NotificationsNone fontSize="small" />
                            </Badge>
                        )}
                    </IconButton>

                    <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto', mx: 0.5, borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)' }} />

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        pl: 0.5
                    }}>
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="body2" sx={{ lineHeight: 1.1 }} fontWeight={700}>
                                {userName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.72rem' }}>
                                Admin
                            </Typography>
                        </Box>

                        <Avatar sx={{
                            width: { xs: 34, md: 36 },
                            height: { xs: 34, md: 36 },
                            fontSize: { xs: '0.85rem', md: '0.9rem' },
                            fontWeight: 700,
                            bgcolor: 'primary.main',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                        }}>
                            {userName.charAt(0).toUpperCase()}
                        </Avatar>
                    </Box>
                </Stack>
            </Toolbar>

            <Menu
                id="notifications-menu"
                anchorEl={notificationAnchorEl}
                open={isNotificationsMenuOpen}
                onClose={handleCloseNotifications}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        sx: {
                            width: 360,
                            maxWidth: 'calc(100vw - 32px)',
                            mt: 1.5,
                            borderRadius: '20px',
                            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(24, 24, 27, 0.3)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid',
                            borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
                            boxShadow: isLight ? '0 20px 40px rgba(0,0,0,0.1)' : '0 20px 40px rgba(0,0,0,0.5)',
                            p: 0.5,
                        },
                    },
                }}
            >
                {/* الهيدر الثابت للإشعارات */}
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Notifications
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {unreadCount > 0 ? `You have ${unreadCount} unread messages` : 'All caught up'}
                    </Typography>
                </Box>
                
                <Divider sx={{ my: 0.5, borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }} />

                {/* الحاوية القابلة للتمرير (Scroll) */}
                <Box 
                    sx={{ 
                        maxHeight: 350, // يمكنك تعديل الارتفاع حسب رغبتك
                        overflowY: 'auto', 
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-track': { background: 'transparent' },
                        '&::-webkit-scrollbar-thumb': { 
                            background: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)', 
                            borderRadius: '10px' 
                        },
                        '&::-webkit-scrollbar-thumb:hover': { 
                            background: isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' 
                        }
                    }}
                >
                    {notificationsLoad && notifications.length === 0 ? (
                        [...Array(3)].map((_, index) => (
                            <MenuItem key={index} disabled sx={{ py: 1.5, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                                <Skeleton variant="text" width="60%" height={20} />
                                <Skeleton variant="text" width="90%" height={16} />
                                <Skeleton variant="text" width="40%" height={16} />
                            </MenuItem>
                        ))
                    ) : error ? (
                        <MenuItem disabled sx={{ py: 3, justifyContent: 'center' }}>
                            <Typography variant="body2" color="error">Failed to load notifications</Typography>
                        </MenuItem>
                    ) : notifications.length === 0 ? (
                        <MenuItem disabled sx={{ py: 3, justifyContent: 'center' }}>
                            <ListItemText
                                primary="No notifications"
                                secondary="You are all caught up."
                                primaryTypographyProps={{ textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}
                                secondaryTypographyProps={{ textAlign: 'center', fontSize: '0.8rem' }}
                            />
                        </MenuItem>
                    ) : (
                        notifications.map((item, index) => (
                            <MenuItem
                                key={item.id || index}
                                onClick={handleCloseNotifications}
                                sx={{
                                    py: 1.2,
                                    px: 2,
                                    borderRadius: '12px',
                                    mb: 0.5,
                                    alignItems: 'flex-start',
                                    gap: 1.5,
                                    bgcolor: item.is_read === false ? (isLight ? 'rgba(37, 99, 235, 0.05)' : 'rgba(255,255,255,0.04)') : 'transparent',
                                    borderLeft: item.is_read === false ? '3px solid' : 'none',
                                    borderLeftColor: 'primary.main',
                                }}
                            >
                                <ListItemText
                                    primary={item.title}
                                    primaryTypographyProps={{ fontWeight: item.is_read === false ? 700 : 500, fontSize: '0.88rem' }}
                                    secondary={<>
                                        <Typography component="span" variant="body2" color="text.secondary" sx={{
                                            display: 'block',
                                            mt: 0.3,
                                            fontSize: '0.78rem',
                                            lineHeight: 1.4,
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word'
                                        }}>
                                            {item.body}
                                        </Typography>
                                        <Typography component="span" variant="caption" color="primary.main" sx={{ fontWeight: 600, fontSize: '0.72rem' }}>
                                            {item.created_at}
                                        </Typography>
                                    </>}
                                />
                            </MenuItem>
                        ))
                    )}
                </Box>
            </Menu>
        </AppBar>
    );
};

export default Navbar;