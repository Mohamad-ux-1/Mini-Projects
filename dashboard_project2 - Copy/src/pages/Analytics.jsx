import React, { useState } from 'react';
import IP from './IP.js';

import {
    Box,
    Typography,
    Button,
    Grid,
    useTheme,
    Drawer,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    CircularProgress,
    ToggleButtonGroup,
    ToggleButton,
    Stack
} from '@mui/material';
import FilterList from '@mui/icons-material/FilterList';
import Download from '@mui/icons-material/Download';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Close from '@mui/icons-material/Close';
import {
    AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import useFetch from "../hooks/useFetch.js";

export default function Analytics() {
    const theme = useTheme();

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        machineType: 'sale', Day: 'All'
    });

    const baseURL = `${IP}/api/dashboard`;

    const { data: revenueRes } = useFetch(`${IP}/api/dashboard/revenue-chart`, 'GET');
    const { data: transactionRes } = useFetch(`${IP}/api/dashboard/transaction-types`, 'GET');
    const { data: statsRes } = useFetch(`${IP}/api/dashboard/quick-stats`, 'GET');
    const { data: machinesRes } = useFetch(`${IP}/api/dashboard/top-machines?type=${filters.machineType}`, 'GET');

    if (!revenueRes?.data || !transactionRes?.data || !statsRes?.data || !machinesRes?.data) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const revenueData = revenueRes.data;

    const dist = transactionRes.data.distribution || {};
    const salesCount = typeof dist.sales === 'object' ? (dist.sales?.count || 0) : (dist.sales || 0);
    const rentalsCount = typeof dist.rentals === 'object' ? (dist.rentals?.count || 0) : (dist.rentals || 0);
    const transactionData = [
        { name: 'Sales', value: salesCount, color: theme.palette.primary.main },
        { name: 'Rentals', value: rentalsCount, color: theme.palette.secondary.main }
    ];

    const quickStats = statsRes.data || { average_rent_days: 0, currently_rented_items: 0 };

    const machines = machinesRes.data || [];
    const maxVal = Math.max(...machines.map(m => m.value || m.total || m.count || 0), 1);
    const topMachines = machines.map(item => ({
        label: item.machine_name || item.machine_name || 'Machine',
        value: item.total_earnings || item.total || item.count || 0,
        percent: ((item.total_earnings || item.total || item.count || 0) / maxVal) * 100,
        color: filters.machineType === 'sale' ? theme.palette.primary.main : theme.palette.secondary.main
    }));
    console.log('Top Machines:', machines);

    const handleFilterChange = (field) => (event) => {
        setFilters({ ...filters, [field]: event.target.value });
    };

    const handleMachineTypeToggle = (event, newType) => {
        if (newType !== null) {
            setFilters({ ...filters, machineType: newType });
        }
    };

    const applyFilters = () => {
        setIsFilterOpen(false);
    };

    const resetFilters = () => {
        setFilters({ machineType: 'sale', Day: 'All' });
    };

    const handleExport = () => {
        const kpiHeader = "--- OVERVIEW ---\n";
        const kpiData = `Average Rent Days,${quickStats.average_rent_days} Days\nCurrently Rented Items,${quickStats.currently_rented_items}\n\n`;

        const revenueHeader = "--- DAILY REVENUE TRENDS ---\nDay,Sales Revenue ($),Rentals Revenue ($)\n";
        const revenueRows = revenueData.map(item => `${item.day_name},${item.sales_revenue},${item.rentals_revenue}`).join('\n');

        const transactionHeader = "\n\n--- TRANSACTION TYPES DISTRIBUTION ---\nType,Count\n";
        const transactionRows = transactionData.map(item => `${item.name},${item.value}`).join('\n');

        const machinesHeader = `\n\n--- TOP MACHINES (${filters.machineType.toUpperCase()}) ---\nMachine Name,Count/Value\n`;
        const machinesRows = topMachines.map(item => `"${item.label}",${item.value}`).join('\n');

        const fullContent = "\uFEFF" + kpiHeader + kpiData + revenueHeader + revenueRows + transactionHeader + transactionRows + machinesHeader + machinesRows;

        const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        link.setAttribute('download', `Dashboard_Analytics_Report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box sx={{ width: '100%', color: theme.palette.text.primary }}>

            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                mb: 4,
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box sx={{ alignSelf: 'center', mt: 2 }}>
                    <Typography sx={{
                        color: theme.palette.primary.main, fontSize: 10, fontWeight: 'bold', letterSpacing: 2, mb: 0.5
                    }}>
                        STORE
                    </Typography>
                    <Typography variant="h4" fontWeight="800" fontFamily="Manrope">
                        Analytics
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignSelf: 'center' }}>
                    <Button
                        startIcon={<FilterList />}
                        onClick={() => setIsFilterOpen(true)}
                        sx={{
                            color: theme.palette.text.primary,
                            border: `1px solid ${theme.palette.divider}`,
                            textTransform: 'none',
                            bgcolor: theme.palette.background.paper
                        }}
                    >
                        Filters
                    </Button>
                    <Button startIcon={<Download />} variant="contained" sx={{
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        textTransform: 'none',
                        fontWeight: 'bold'
                    }} onClick={handleExport}>
                        Export Report
                    </Button>
                </Box>
            </Box>

            <Drawer
                anchor="right"
                open={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 400 },
                        bgcolor: theme.palette.background.paper,
                        backgroundImage: 'none',
                        p: 0
                    }
                }}
            >
                <Box sx={{
                    p: 3, bgcolor: theme.palette.background.paper, borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" fontFamily="Manrope" fontWeight="800"
                                color={theme.palette.text.primary}>
                                Data Filters
                            </Typography>
                        </Box>
                        <IconButton onClick={() => setIsFilterOpen(false)} sx={{ color: theme.palette.text.secondary }}>
                            <Close />
                        </IconButton>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1, p: 3, overflowY: 'auto' }}>
                    <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: theme.palette.text.secondary }}>Machine Type</InputLabel>
                        <Select
                            variant='outlined'
                            value={filters.machineType}
                            label="Machine Type"
                            onChange={handleFilterChange('machineType')}
                            sx={{
                                color: theme.palette.text.primary,
                                '.MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider }
                            }}
                        >
                            <MenuItem value="sale">Sales </MenuItem>
                            <MenuItem value="rent">Rentals </MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{
                    mt: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    p: 3,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.background.paper
                }}>
                    <Button fullWidth variant="contained" onClick={applyFilters}
                        sx={{ bgcolor: theme.palette.primary.main, py: 1.5, fontWeight: 'bold' }}>
                        Apply Filters
                    </Button>
                    <Button fullWidth variant="outlined" onClick={resetFilters}
                        sx={{ color: theme.palette.text.primary, py: 1.5, fontWeight: 'bold' }}>
                        Reset
                    </Button>
                </Box>
            </Drawer>

            <Grid container spacing={5}>
                <Grid item xs={12} lg={8} sx={{ flexGrow: 1 }}>
                    <Box sx={{
                        bgcolor: theme.palette.background.paper,
                        p: 3,
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        height: 400,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexDirection: { xs: 'column', md: 'row' },
                            mb: 2
                        }}>
                            <Box>
                                <Typography variant="h6" fontFamily="Manrope" fontWeight="bold"> Revenue
                                    Trends </Typography>
                                <Typography variant="body2" color={theme.palette.text.secondary}> Daily trends across
                                    Sales and Rentals revenue. </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', mt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: theme.palette.primary.main,
                                        mr: 1
                                    }} />
                                    <Typography fontSize={10} color={theme.palette.text.secondary}>SALES
                                        REVENUE</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: theme.palette.secondary.main
                                    }} />
                                    <Typography fontSize={10} color={theme.palette.text.secondary}>RENTALS
                                        REVENUE</Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ flexGrow: 1, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRentals" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="5%" stopColor={theme.palette.secondary.main}
                                                stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={theme.palette.secondary.main}
                                                stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false}
                                        stroke={theme.palette.divider} />
                                    <XAxis dataKey="day_name" axisLine={false} tickLine={false}
                                        tick={{ fontSize: 10, fill: theme.palette.text.secondary }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false}
                                        tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                                        tickFormatter={(val) => val === 0 ? '0' : `${val / 1000}k`} />

                                    <Area type='bump' dataKey="sales_revenue" stroke={theme.palette.primary.main}
                                        strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                    <Area type="bump" dataKey="rentals_revenue" stroke={theme.palette.secondary.main}
                                        strokeWidth={2} fill="url(#colorRentals)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} lg={4} sx={{ flexGrow: 1 }}>
                    <Box sx={{
                        bgcolor: theme.palette.background.paper,
                        p: 3,
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        height: 400,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Typography variant="h6" fontFamily="Manrope" fontWeight="bold">Comparing</Typography>
                        <Typography variant="body2" color={theme.palette.text.secondary}>Distribution of sales vs
                            rentals.</Typography>

                        <Box sx={{
                            flexGrow: 1,
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={transactionData} innerRadius={60} outerRadius={80} paddingAngle={0}
                                        dataKey="value" stroke="none">
                                        {transactionData.map((entry, index) => <Cell key={`cell-${index}`}
                                            fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                                <Typography variant="h4" fontWeight="900" fontFamily="Manrope">
                                    {transactionData.reduce((acc, curr) => acc + curr.value, 0)}
                                </Typography>
                                <Typography fontSize={10} color={theme.palette.text.secondary}
                                    letterSpacing={1}>TOTAL</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {transactionData.map((item, idx) => (<Box key={idx}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 10, height: 10, bgcolor: item.color, borderRadius: 0.5 }} />
                                    <Typography variant="body2">{item.name}</Typography>
                                </Box>
                                <Typography variant="body2" fontWeight="bold">{item.value}</Typography>
                            </Box>))}
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} lg={12} sx={{ flexGrow: 1 }}>
                    <Stack spacing={4} sx={{ height: '100%' }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{
                                bgcolor: theme.palette.background.paper,
                                p: 3,
                                borderRadius: 3,
                                border: `1px solid ${theme.palette.divider}`,
                                height: '100%',
                                transition: 'all .2s ease-in-out',
                                '&:hover': { 'borderColor': 'primary.main', 'transform': 'translateX(1%)' }
                            }}>
                                <ShoppingCart sx={{
                                    color: theme.palette.primary.main,
                                    bgcolor: `${theme.palette.primary.main}1A`,
                                    p: 0.5,
                                    borderRadius: 1,
                                    mb: 2
                                }} />
                                <Typography fontSize={10} color={theme.palette.text.secondary} letterSpacing={1} mb={1}>AVERAGE
                                    RENT DAYS</Typography>
                                <Typography variant="h5" fontWeight="900" fontFamily="Manrope">
                                    {quickStats.average_rent_days} Days
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{
                                bgcolor: theme.palette.background.paper,
                                p: 3,
                                borderRadius: 3,
                                border: `1px solid ${theme.palette.divider}`,
                                height: '100%',
                                transition: 'all .2s ease-in-out',
                                '&:hover': { 'borderColor': 'secondary.main', 'transform': 'translateX(1%)' }
                            }}>
                                <TrendingUp sx={{
                                    color: theme.palette.secondary.main,
                                    bgcolor: `${theme.palette.secondary.main}1A`,
                                    p: 0.5,
                                    borderRadius: 1,
                                    mb: 2
                                }} />
                                <Typography fontSize={10} color={theme.palette.text.secondary} letterSpacing={1} mb={1}>CURRENTLY
                                    RENTED ITEMS</Typography>
                                <Typography variant="h5" fontWeight="900" fontFamily="Manrope">
                                    {quickStats.currently_rented_items}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Grid>

                <Grid item xs={12} lg={12} sx={{ flexGrow: 1 }}>
                    <Box sx={{
                        bgcolor: theme.palette.background.paper,
                        p: 3,
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        height: '100%'
                    }}>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3,
                            flexWrap: 'wrap',
                            gap: 2
                        }}>
                            <Box>
                                <Typography variant="h6" fontFamily="Manrope" fontWeight="bold">
                                    Top Machines
                                </Typography>
                                <Typography variant="body2" color={theme.palette.text.secondary}>Highest performing
                                    machines based on your selection.</Typography>
                            </Box>

                            <ToggleButtonGroup
                                value={filters.machineType}
                                exclusive
                                onChange={handleMachineTypeToggle}
                                size="small"
                                sx={{
                                    bgcolor: theme.palette.background.default,
                                    border: `1px solid ${theme.palette.divider}`,
                                    '& .MuiToggleButton-root.Mui-selected': {
                                        bgcolor: filters.machineType === 'sale' ? `${theme.palette.primary.main}20` : `${theme.palette.secondary.main}20`,
                                        color: filters.machineType === 'sale' ? theme.palette.primary.main : theme.palette.secondary.main,
                                        fontWeight: 'bold'
                                    }
                                }}
                            >
                                <ToggleButton value="sale" sx={{ textTransform: 'none', px: 2 }}>Sales
                                </ToggleButton>
                                <ToggleButton value="rent" sx={{ textTransform: 'none', px: 2 }}>Rentals</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2.5,
                            maxHeight: '300px',
                            overflowY: 'auto',
                            scrollBehavior: 'smooth'
                        }}>
                            {console.log('Top Machines:', topMachines)}
                            {topMachines.length > 0 ? topMachines.map((item, idx) => (
                                <Tooltip key={idx} title={`${item.label} - ${item.value}`} placement="top" arrow>
                                    <Box sx={{ mb: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography fontSize={10} color={theme.palette.text.secondary}
                                                letterSpacing={1}>
                                                {item.label}
                                            </Typography>
                                            <Typography fontSize={12} fontWeight="bold">
                                                {item.value}
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            width: '100%',
                                            height: 24,
                                            bgcolor: theme.palette.background.default,
                                            borderRadius: 1,
                                            overflow: 'hidden',
                                            cursor: 'pointer'
                                        }}>
                                            <Box sx={{ width: `${item.percent/500}%`, height: '100%', bgcolor: item.color }} />
                                        </Box>
                                    </Box>
                                </Tooltip>)) : (
                                <Typography variant="body2" color={theme.palette.text.secondary} textAlign="center"
                                    mt={4}>
                                    No machines found.
                                </Typography>)}
                        </Box>
                    </Box>
                </Grid>

            </Grid>
        </Box>
    );
}
