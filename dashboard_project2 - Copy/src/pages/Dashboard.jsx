import React from 'react';
import {
    Add,
    AssignmentReturnOutlined,
    Payments,
    ShoppingBag,
    TrendingUp,
    RemoveShoppingCart
} from '@mui/icons-material';
import IosShareIcon from '@mui/icons-material/IosShare';

import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
    useTheme,
    FormControl,
    Select,
    MenuItem,
    Skeleton
} from '@mui/material';
import StatCard from '../components/dashboardComponents/StatCard.jsx';
import PerformanceSummary from "../components/dashboardComponents/PerformanceSummary.jsx";
import useFetch from "../hooks/useFetch.js";
import IP from './IP.js';

// const statCards = [
//     { title: 'Orders', value: '1,842', percentage: '12.0', isUp: true, icon: <ShoppingBag />, colorType: 'primary' },
//     { title: 'Net Revenue', value: '$58,300', percentage: '9.4', isUp: true, icon: <Payments />, colorType: 'success' },
//     { title: 'Conversion', value: '3.7%', percentage: '0.6', isUp: true, icon: <TrendingUp />, colorType: 'warning' },
//     {
//         title: 'Cart Abandonment',
//         value: '68%',
//         percentage: '2.3',
//         isUp: false,
//         icon: <RemoveShoppingCart />,
//         colorType: 'error'
//     },
// ];

// const activityItems = [
//     {
//         title: 'New User in your app',
//         description: 'he is complete his sign up to programm',
//         time: '42 min ago',
//         color: 'success.main'
//     },
//     {
//         title: 'Customer Order completed',
//         description: 'Support resolved the priority onboarding request.',
//         time: '2 hr ago',
//         color: 'warning.main'
//     },
// ];

const DashboardSkeleton = () => {
    return (
        <Box sx={{ maxWidth: 1600, mx: 'auto', p: { xs: 1, md: 2 } }}>
            <Paper sx={{ mb: { xs: 2, md: 3 }, p: { xs: 2, md: 4 }, borderRadius: 4 }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ xs: 2, lg: 3 }}
                    sx={{ justifyContent: "space-between", alignItems: { xs: 'flex-start', lg: 'center' } }}>
                    <Box sx={{ width: '100%', maxWidth: 720 }}>
                        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                            <Skeleton variant="rounded" width={80} height={20} />
                            <Skeleton variant="rounded" width={100} height={20} />
                        </Stack>
                        <Skeleton variant="text" width="60%" height={{ xs: 30, md: 40 }} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="90%" height={20} />
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        <Skeleton variant="rounded" width={{ xs: '100%', sm: 140 }} height={36} />
                    </Stack>
                </Stack>
            </Paper>

            <Grid container spacing={{ xs: 1.5, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
                {[1, 2, 3, 4].map((item) => (
                    <Grid item key={item} xs={12} sm={6} lg={3} sx={{ flexGrow: 1, display: 'flex' }}>
                        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, width: '100%' }}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                                <Skeleton variant="text" width="50%" height={20} />
                                <Skeleton variant="circular" width={32} height={32} />
                            </Stack>
                            <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="40%" height={20} />
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={{ xs: 1.5, md: 3 }}>
                <Grid item xs={12} lg={8}
                    sx={{ width: { xs: '100%', lg: '63%' }, display: 'flex', flexDirection: 'column' }}>
                    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, height: { xs: 300, md: 400 } }}>
                        <Skeleton variant="text" width="30%" height={25} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" width="100%" height="80%" sx={{ borderRadius: 2 }} />
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}
                    sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: { xs: '100%', lg: '33%' } }}>
                    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, height: '100%', minHeight: { xs: 300, md: 400 } }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Box sx={{ width: '70%' }}>
                                <Skeleton variant="text" width="60%" height={25} />
                                <Skeleton variant="text" width="90%" height={15} />
                            </Box>
                            <Skeleton variant="circular" width={32} height={32} />
                        </Stack>
                        <Stack spacing={2}>
                            {[1, 2].map((i) => (
                                <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                                    <Skeleton variant="circular" width={10} height={10} sx={{ mt: 0.5 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Skeleton variant="text" width="50%" height={18} />
                                        <Skeleton variant="text" width="80%" height={14} />
                                    </Box>
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

const Dashboard = () => {
    const url = IP;
    const { data: dataC } = useFetch(`${IP}/api/products-for-sale`, 'GET')
    const { data: activityItemsData, loading: activityItemsLoad, error } = useFetch(`${url}/api/admin/notifications`, 'GET');

    const theme = useTheme();
    // const [timeFilter, setTimeFilter] = useState('Today');
    const { data: cards } = useFetch(`${IP}/api/admin/dashboard/card3`, 'GET')
    const { data: conversion } = useFetch(`${IP}/api/admin/dashboard/card1`, 'GET')
    if (activityItemsLoad) {
        return <DashboardSkeleton />;
    }
    if (error) {
        return <Typography color='error'>error</Typography>;
    }

    const activityItems = activityItemsData?.data || [];
    const handleExport = () => {
        if (!cards?.data || !conversion?.data) return;

        const extractData = (item, defaultTitle) => ({
            Metric: item?.title || defaultTitle,
            Value: item?.value || '0',
            Percentage: item?.percentage ? `${item.percentage}%` : '0%',
        });

        const exportData = [
            extractData(cards.data.orders, 'Orders'),
            extractData(cards.data.rentals, 'Rentals'),
            extractData(cards.data.earnings, 'Earnings'),
            extractData(conversion.data.conversion, 'Conversion'),
        ];

        const headers = ['Metric', 'Value', 'Percentage'];
        const csvRows = [
            headers.join(','),
            ...exportData.map(row => `"${row.Metric}","${row.Value}","${row.Percentage}"`)
        ];
        const csvString = csvRows.join('\n');

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Dashboard_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!cards?.data || !conversion?.data) {
        return <DashboardSkeleton />;
    }

    console.log('dataC', dataC)

    return (
        <Box sx={{ maxWidth: 1600, mx: 'auto', p: { xs: 1, sm: 1.5, md: 2 } }}>
            <Paper
                sx={{
                    display: 'flex',
                    mb: { xs: 2, md: 3 },
                    p: { xs: 2, sm: 3, md: 4 },
                    borderRadius: { xs: 3, md: 4 },
                    background: `linear-gradient(135deg, 'color.background.paper' 0%, ${theme.palette.mode === 'light' ? '#eef4ff' : '#172554'} 100%)`,
                }}
            >
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ xs: 2, md: 3 }}
                    sx={{ justifyContent: "space-between", alignItems: { xs: 'flex-start', lg: 'center' }, width: '100%' }}>

                    <Box sx={{ maxWidth: 720, width: '100%' }}>
                        <Stack direction="row" spacing={1} sx={{ mb: { xs: 1.5, md: 2 }, flexWrap: 'wrap', gap: 1 }}>
                            {/*<Chip label="5 Out of Stock" color="error" size="small" sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' }, height: { xs: 24, sm: 28 } }} />*/}
                            <Chip label={activityItems.length} color="success" variant="outlined" size="small" sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' }, height: { xs: 24, sm: 28 } }} />
                        </Stack>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.03em', fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' } }}>
                            Store Overview
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }} variant="body1" color="text.secondary">
                            Monitor sales performance and manage <br />customer requests in workspace.
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}
                        sx={{ justifyContent: { xs: 'flex-start', sm: 'center' }, width: { xs: '100%', sm: 'auto' }, mr: 'auto' }}>
                        <Button
                            variant="outlined"
                            startIcon={<IosShareIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                            onClick={handleExport}
                            size="small"
                            sx={{
                                color: 'text.primary',
                                borderColor: 'divider',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                py: { xs: 0.5, sm: 1 },
                                '&:hover': { bgcolor: 'primary.dark', color: '#fff' }
                            }}
                        >
                            Export Data
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <Grid container spacing={{ xs: 1.5, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
                <Grid item xs={12} sm={6} lg={3} sx={{ flexGrow: 1, display: 'flex' }}>
                    <Box sx={{ width: '100%' }}>
                        <StatCard {...cards.data.orders} />
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={3} sx={{ flexGrow: 1, display: 'flex' }}>
                    <Box sx={{ width: '100%' }}>
                        <StatCard {...cards.data.rentals} />
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={3} sx={{ flexGrow: 1, display: 'flex' }}>
                    <Box sx={{ width: '100%' }}>
                        <StatCard {...cards.data.earnings} />
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={3} sx={{ flexGrow: 1, display: 'flex' }}>
                    <Box sx={{ width: '100%' }}>
                        <StatCard {...conversion.data.conversion} />
                    </Box>
                </Grid>
            </Grid>

            <Grid container spacing={{ xs: 1.5, md: 3 }}>
                <Grid item xs={12} lg={8}
                    sx={{ width: { xs: '100%', lg: '63%' }, display: 'flex', flexDirection: 'column' }}>
                    <PerformanceSummary />
                </Grid>

                <Grid item xs={12} lg={4}
                    sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: { xs: '100%', lg: '33%' } }}>
                    <Paper sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: { xs: 3, md: 4 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: { xs: 2, md: 2.5 } }}
                        >
                            <Box>
                                {console.log('activityItems', activityItems)}
                                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                                    Activity Update
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                    Latest updates from your Application.
                                </Typography>
                            </Box>
                            <Avatar sx={{
                                bgcolor: 'primary.main',
                                width: { xs: 32, md: 40 },
                                height: { xs: 32, md: 40 },
                                fontWeight: 800,
                                fontSize: { xs: '0.875rem', md: '1rem' }
                            }}>
                                {activityItems.length}
                            </Avatar>
                        </Stack>

                        <Stack spacing={{ xs: 1.5, md: 2 }} divider={<Divider flexItem />}
                            sx={{ overflowY: 'auto', flexGrow: 1, maxHeight: { xs: 350, lg: 600 } }}>
                            {activityItems.map((item) => (
                                <Stack key={item.id } direction="row" spacing={1.5} alignItems="flex-start">
                                    <Box sx={{
                                        width: { xs: 10, md: 12 },
                                        height: { xs: 10, md: 12 },
                                        borderRadius: '50%',
                                        bgcolor: item.title?.toLowerCase().includes('admin') ? 'warning.main' : item.title?.toLowerCase().includes('instrument') ? 'secondary.main' : 'primary.main', mt: { xs: 0.5, md: 0.75 },
                                        flexShrink: 0
                                    }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                                            <Typography variant="subtitle2"
                                                sx={{ fontWeight: 700, fontSize: { xs: '0.8125rem', md: '0.875rem' }, lineHeight: 1.2 }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary"
                                                sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                                                {item.created_at}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary"
                                            sx={{ mt: 0.5, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                            {item.body}
                                        </Typography>
                                    </Box>
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
