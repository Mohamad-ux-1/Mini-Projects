import React from 'react';
import { Box, Chip, Grid, Paper, Stack, Typography, useTheme, Skeleton, alpha } from "@mui/material";
import useFetch from "../../hooks/useFetch.js";
import IP from '../../pages/IP.js';
import {
    TrendingDownOutlined,
    TrendingUpOutlined,
    ShoppingBagOutlined,
    Payments,
    AttachMoney,
    ShowChart
} from '@mui/icons-material'
const kpiHighlights = [
    { label: 'Total Revenue', value: '$58,300', delta: '+14.2% vs last month', tone: 'primary.main' },
    { label: 'Unique Visitors', value: '18.4k', delta: '+9.8% vs last week', tone: 'success.main' },
    { label: 'Conversion Rate', value: '3.7%', delta: '+0.6% vs last month', tone: 'warning.main' },
    { label: 'Average Order Value', value: '$79', delta: '+4.1% vs last month', tone: 'error.main' },
];

const PerformanceSummary = () => {
    const theme = useTheme();

    const url = IP;


    const { data: weeklyData, loading } = useFetch(`${url}/api/admin/dashboard/performance_summary`, 'GET');
    const { data: cards, loading: cardsLoading } = useFetch(`${url}/api/admin/dashboard/card3`, 'GET')
    const { data: cards1 } = useFetch(`${url}/api/admin/dashboard/card1`, 'GET')
    const { loading: conversionLoading } = useFetch(`${url}/api/admin/dashboard/card1`, 'GET')

    if (cardsLoading || conversionLoading) {
        return <Typography>Loading...</Typography>;
    }


    if (loading) {
        return (
            <Paper sx={{ width: '100%', p: { xs: 2, md: 3 }, borderRadius: 3, display: 'flex', flexDirection: 'column', flexGrow: 1, mx: 'auto' }}>

                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 3, gap: 2 }}>
                    <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                        <Skeleton variant="text" width="50%" height={32} />
                        <Skeleton variant="text" width="80%" height={20} />
                    </Box>
                    <Skeleton variant="rounded" width={130} height={32} sx={{ borderRadius: 4 }} />
                </Stack>

                <Box sx={{ flexGrow: 1, borderRadius: 4, border: '1px dashed', borderColor: 'divider', p: { xs: 1.5, md: 3 } }}>
                    <Stack spacing={3} sx={{ height: '100%' }}>

                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                            <Skeleton variant="text" width={140} height={24} />
                            <Skeleton variant="text" width={60} height={24} />
                        </Stack>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {Array.from({ length: 7 }).map((_, index) => (
                                <Stack key={index} direction="row" spacing={2} sx={{ alignItems: "center", p: 1.25, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                    <Skeleton variant="text" width={36} height={24} />

                                    <Stack direction="row" spacing={0.8} sx={{ flex: 1, flexWrap: 'nowrap', overflowX: 'hidden' }}>
                                        {Array.from({ length: 10 }).map((_, dotIndex) => (
                                            <Skeleton key={dotIndex} variant="circular" width={14} height={14} sx={{ width: { xs: 10, sm: 14 }, height: { xs: 10, sm: 14 }, flexShrink: 0 }} />
                                        ))}
                                    </Stack>

                                    <Skeleton variant="text" width={50} height={24} />
                                </Stack>
                            ))}
                        </Box>

                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Grid item xs={12} sm={6} md={3} key={index} sx={{ flexGrow: 1 }}>
                                    <Box sx={{ p: 2, height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                        <Skeleton variant="text" width="60%" height={20} />
                                        <Skeleton variant="text" width="80%" height={40} sx={{ my: 0.5 }} />
                                        <Skeleton variant="text" width="50%" height={20} />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Stack>
                </Box>
            </Paper>
        );
    }

    if (!cards || !cards.data || !cards.data.orders || !cards.data.rentals || !cards.data.earnings || !cards1 || !cards1.data || !weeklyData || !weeklyData.data) {
        return <Typography>Loading...</Typography>;
    }
    const iconColors = {
        'orders': theme.palette.primary.main,
        'rentals': theme.palette.success.main,
        'earnings': theme.palette.warning.main,
        'conversion': theme.palette.error.main,
    }
    const trendColor = cards.data.orders.weekly.percentage >= 0 ? theme.palette.success.main : theme.palette.error.main


    return (
        <Paper sx={{ width: '100%', p: { xs: 2, md: 3 }, borderRadius: 3, display: 'flex', flexDirection: 'column', flexGrow: 1, mx: 'auto' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 3, gap: 2 }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Weekly summary</Typography>
                    <Typography variant="body2" color="text.secondary">Daily sales, and rentals in store.</Typography>
                </Box>
                <Chip label=" KPIs" color="primary" variant="outlined" />
            </Stack>

            <Box sx={{ flexGrow: 1, borderRadius: 4, border: '1px dashed', borderColor: 'divider', p: { xs: 1.5, md: 3 } }}>
                <Stack spacing={3} sx={{ height: '100%' }}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary">Max Weekly sales </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color:   theme.palette.success.main ,mr:4 }}>
                            {weeklyData?.data.max_amount_in_week}
                        </Typography>
                    </Stack>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {console.log("weeklyData", weeklyData.data)}
                        {weeklyData?.data?.daily_performance?.map((item) => (
                            <Stack key={item.day} direction="row" spacing={2} sx={{ alignItems: "center", p: 1.25, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="body2" sx={{ width: 36, fontWeight: 700 }}>{item.day}</Typography>

                                <Stack direction="row" spacing={0.8} sx={{ flex: 1, flexWrap: 'nowrap', overflowX: 'auto' }}>
                                    {Array.from({ length: 10 }).map((_, index) => {
                                        const activeDotsCount = item.activeDotsCount;
                                        const isFilled = index < activeDotsCount;
                                        return (
                                            <Box
                                                key={index}
                                                sx={{
                                                    width: { xs: 10, sm: 14 }, height: { xs: 10, sm: 14 },

                                                    borderRadius: '50%',
                                                    bgcolor: isFilled ? 'primary.main' : 'action.disabledBackground',
                                                    opacity: isFilled ? 1 : 0.35,
                                                    transition: 'all 0.3s ease',
                                                    flexShrink: 0
                                                }}
                                            />
                                        );
                                    })}
                                </Stack>
                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                    {item.revenue}
                                </Typography>
                            </Stack>
                        ))}
                    </Box>

                    <Grid container spacing={2} sx={{ mt: 2 }}>

                        <Grid item xs={12} sm={6} md={3} sx={{ flexGrow: 1 }}>
                            <Box sx={{ p: 2, height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2.5,
                                            display: 'grid',
                                            placeItems: 'center',
                                            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.1 : 0.18),
                                            color: theme.palette.primary.main,
                                        }}
                                    >
                                        <ShoppingBagOutlined />
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            px: 1.25,
                                            py: 0.75,
                                            borderRadius: 999,
                                            bgcolor: alpha(trendColor, 0.1),
                                            color: trendColor,
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            lineHeight: 1,
                                        }}
                                    >
                                        {cards.data.orders.weekly.percentage >= 0 ? <TrendingUpOutlined sx={{ fontSize: 16 }} /> :
                                            <TrendingDownOutlined sx={{ fontSize: 16 }} />}
                                        {cards.data.orders.weekly.percentage >= 0 ? '+' : '-'}{cards.data.orders.weekly.percentage}%
                                    </Box>

                                </Stack>
                                <Typography variant="h6" sx={{ fontWeight: 400, color: "text.secondary" }}>orders</Typography>
                                <Typography variant="caption" color="text.secondary">{cards.data.orders.weekly.current_value}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} sx={{ flexGrow: 1 }}>
                            <Box sx={{ p: 2, height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2.5,
                                            display: 'grid',
                                            placeItems: 'center',
                                            bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'light' ? 0.1 : 0.18),
                                            color: theme.palette.success.main,
                                        }}
                                    >
                                        <Payments />
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            px: 1.25,
                                            py: 0.75,
                                            borderRadius: 999,
                                            bgcolor: alpha(trendColor, 0.1),
                                            color: trendColor,
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            lineHeight: 1,
                                        }}
                                    >
                                        {cards.data.rentals.weekly.percentage >= 0 ? <TrendingUpOutlined sx={{ fontSize: 16 }} /> :
                                            <TrendingDownOutlined sx={{ fontSize: 16 }} />}
                                        {cards.data.rentals.weekly.percentage >= 0 ? '+' : '-'}{cards.data.rentals.weekly.percentage}%
                                    </Box>

                                </Stack>
                                <Typography variant="h6" sx={{ fontWeight: 400, color: "text.secondary" }} >rentals</Typography>
                                <Typography variant="caption" color="text.secondary">{cards.data.rentals.weekly.current_value}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} sx={{ flexGrow: 1 }}>
                            <Box sx={{ p: 2, height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2.5,
                                            display: 'grid',
                                            placeItems: 'center',
                                            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.1 : 0.18),
                                            color: theme.palette.primary.main,
                                        }}
                                    >
                                        <AttachMoney />
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            px: 1.25,
                                            py: 0.75,
                                            borderRadius: 999,
                                            bgcolor: alpha(trendColor, 0.1),
                                            color: trendColor,
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            lineHeight: 1,
                                        }}
                                    >
                                        {cards.data.earnings.weekly.percentage >= 0 ? <TrendingUpOutlined sx={{ fontSize: 16 }} /> :
                                            <TrendingDownOutlined sx={{ fontSize: 16 }} />}
                                        {cards.data.earnings.weekly.percentage >= 0 ? '+' : '-'}{cards.data.earnings.weekly.percentage}%
                                    </Box>

                                </Stack>
                                <Typography variant="h6" sx={{ fontWeight: 400, color: "text.secondary" }}>Earnings</Typography>
                                <Typography variant="caption" color="text.secondary">{cards.data.earnings.weekly.current_value}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} sx={{ flexGrow: 1 }}>
                            <Box sx={{ p: 2, height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2.5,
                                            display: 'grid',
                                            placeItems: 'center',
                                            bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'light' ? 0.1 : 0.18),
                                            color: theme.palette.error.main,
                                        }}
                                    >
                                        <ShowChart />
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            px: 1.25,
                                            py: 0.75,
                                            borderRadius: 999,
                                            bgcolor: alpha(trendColor, 0.1),
                                            color: trendColor,
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            lineHeight: 1,
                                        }}
                                    >
                                        {cards1.data.conversion.weekly.percentage >= 0 ? <TrendingUpOutlined sx={{ fontSize: 16 }} /> :
                                            <TrendingDownOutlined sx={{ fontSize: 16 }} />}
                                        {cards1.data.conversion.weekly.percentage >= 0 ? '+' : '-'}{cards1.data.conversion.weekly.percentage}%
                                    </Box>

                                </Stack>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mt: 0.5 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
                                        {cards1.data.conversion.weekly.demand}
                                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.5, fontWeight: 600 }}>
                                            D
                                        </Typography>
                                    </Typography>

                                    <Box sx={{ height: '20px', backgroundColor: 'gray', width: '0.5px', mx: 1 }} />
                                    <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
                                        {cards1.data.conversion.weekly.supply}                                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.5, fontWeight: 600 }}>
                                            S
                                        </Typography>
                                    </Typography>
                                </Box>
                            </Box>

                        </Grid>

                    </Grid>
                </Stack>
            </Box>
        </Paper>
    );
};

export default PerformanceSummary;
