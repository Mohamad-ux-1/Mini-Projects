import {Box, Paper, Stack, Typography, useTheme} from '@mui/material'
import {alpha} from '@mui/material/styles'
import {
    TrendingDownOutlined,
    TrendingUpOutlined,
    ShoppingBagOutlined,
    Payments,
    AttachMoney,
    ShowChart
} from '@mui/icons-material'
import IP from '../../pages/IP.js';

const StatCard = ({title, monthly}) => {
    const theme = useTheme()

    const iconColors = {
        'orders': theme.palette.primary.main,
        'rentals': theme.palette.success.main,
        'earnings': theme.palette.warning.main,
        'conversion': theme.palette.error.main,
        
    }
    const icon = {
        'orders': <ShoppingBagOutlined/>,
        'rentals': <Payments/>,
        'earnings': <AttachMoney/>,
        'conversion': <ShowChart/>
    }
    const accent = iconColors[title] ?? theme.palette.primary.main
    const trendColor = monthly.percentage >= 0 ? theme.palette.success.main : theme.palette.error.main

    return (
        <Paper
            sx={{
                height: '100%',
                p: 3,
                width: '100%',
                borderRadius: 2,
                transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
                cursor: 'default',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: accent,
                    boxShadow: `0 18px 36px ${alpha(accent, 0.12)}`,
                },
                display: 'flex',
                gap: 2,
            }}
        >
            <Stack spacing={2.25}
                   sx={{}}
            >
                <Stack direction="row"
                       sx={{
                           justifyContent: "space-between",
                           alignItems: "flex-start"
                       }}
                >
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: alpha(accent, theme.palette.mode === 'light' ? 0.1 : 0.18),
                            color: accent,
                        }}
                    >
                        {icon[title]}
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
                        {monthly.percentage >= 0 ? <TrendingUpOutlined sx={{fontSize: 16}}/> :
                            <TrendingDownOutlined sx={{fontSize: 16}}/>}
                        {monthly.percentage >= 0 ? '+' : '-'}{monthly.percentage}%
                    </Box>
                </Stack>

                <Box>
                    <Typography
                        variant="overline"
                        sx={{
                            color: 'text.secondary',
                            letterSpacing: 1.2,
                            fontWeight: 700,
                        }}
                    >
                        {title}
                    </Typography>
                    {title === 'conversion' ? (
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mt: 0.5 }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
                                {monthly.demand}
                                <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.5, fontWeight: 600 }}>
                                    D
                                </Typography>
                            </Typography>

                            <Box sx={{height:'20px',backgroundColor:'gray',width:'0.5px',mx:1}}/>
                            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
                                {monthly.supply}
                                <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.5, fontWeight: 600 }}>
                                    S
                                </Typography>
                            </Typography>
                        </Box>
                    ) : (
                        <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 800, letterSpacing: '-0.03em' }}>
                            {monthly.current_value}
                        </Typography>
                    )}
                        </Box>
                        </Stack>
                        </Paper>
                        )
                    }

export default StatCard
