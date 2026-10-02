import {
    Box,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
    Chip,
    Avatar,
    InputAdornment,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio
} from "@mui/material";
import React, { useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import useFetch from "../hooks/useFetch";
import IP from './IP.js';

const Orders = () => {
    const theme = useTheme();
    const url = IP;

    const rowsPerPage = 5;
    const [page, setPage] = useState(1);

    const [searchQuery, setSearchQuery] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);
    const [updateStatus, setUpdateStatus] = useState('onWay');
    const [estimatedMinutes, setEstimatedMinutes] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    // ------------------------------------

    const { data: orderData, loading: loadingData, error: errorData } = useFetch(`${url}/api/admin/transfers`, 'GET');

    if (loadingData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography variant="h6" color="text.secondary">Loading...</Typography>
            </Box>
        );
    }
    if (errorData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography variant="h6" color="text.secondary">Error occurred while fetching order data.</Typography>
            </Box>
        );
    }

    const rows = orderData.data || [];

    //  Search Filtering
    const filteredRows = rows.filter((row) => {
        const query = searchQuery.toLowerCase();
        const transactionIdMatch = row.transaction_id?.toString().toLowerCase().includes(query);
        const customerNameMatch = row.invoice_owner?.name?.toLowerCase().includes(query);

        return transactionIdMatch || customerNameMatch;
    });

    //  Based on Filtered Rows
    const pageNumber = Math.ceil(filteredRows.length / rowsPerPage);
    const startIndex = (page - 1) * rowsPerPage;
    const currentPage = filteredRows.slice(startIndex, startIndex + rowsPerPage);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(1); 
    };

    const handleNextPage = () => {
        if (page < pageNumber) setPage(page + 1);
    }
    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    }
    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
    };

    const getStatusStyles = (status) => {
        const isDark = theme.palette.mode === 'dark';
        switch (status) {
            case 'pending':
                return { border: `1px solid ${isDark ? '#e5a93c' : '#b87c14'}`, color: isDark ? '#e5a93c' : '#b87c14', bg: isDark ? 'rgba(229,169,60,0.1)' : 'rgba(229,169,60,0.15)', hasIcon: true };
            case 'onWay':
                return { border: `1px solid ${theme.palette.primary.dark}`, color: theme.palette.primary.dark, bg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', hasIcon: false };
            case 'finished':
                return { border: `1px solid ${isDark ? '#4caf50' : '#2e7d32'}`, color: isDark ? '#4caf50' : '#2e7d32', bg: isDark ? 'rgba(76,175,80,0.1)' : 'rgba(76,175,80,0.15)', hasIcon: true };
            case 'reached':
                return { border: `1px solid ${theme.palette.secondary.main}`, color: theme.palette.secondary.main, bg: 'transparent', hasIcon: false };
            default:
                return { border: `1px solid #ccc`, color: '#ccc', bg: 'transparent', hasIcon: false };
        }
    };

    //  Export 
    const handleExport = () => {
        if (filteredRows.length === 0) {
            alert("No data available to export.");
            return;
        }

        const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Grand Total', 'Order Date', 'Status'];

        const csvRows = filteredRows.map(row => {
            const id = row.transaction_id || '';
            const name = row.invoice_owner?.name || 'N/A';
            const email = row.invoice_owner?.email || 'N/A';
            const grandTotal = row.grand_total || 'N/A';
            const date = row.date || '';
            const status = row.transfer_status || '';

            return `"${id}","${name}","${email}","${grandTotal}","${date}","${status}"`;
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const downloadUrl = URL.createObjectURL(blob);

        link.href = downloadUrl;
        link.setAttribute('download', 'Orders_Export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Update Handlers ---
    const handleOpenUpdateClick = (row) => {
        setSelectedTx(row);
        if (row.transfer_status === 'onWay') {
            setUpdateStatus('reached');
        } else {
            setUpdateStatus('onWay');
        }
        setEstimatedMinutes('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedTx(null);
    };

    const handleConfirmUpdate = async () => {
        if (updateStatus === 'onWay' && !estimatedMinutes) {
            alert("الرجاء إدخال عدد الدقائق المتوقعة.");
            return;
        }

        setIsUpdating(true);

        const endpoint = updateStatus === 'onWay'
            ? `${url}/api/admin/transfer/${selectedTx.transaction_id}/on-way`
            : `${url}/api/admin/transfer/${selectedTx.transaction_id}/reached`;

        const payload = updateStatus === 'onWay' ? { minutes: parseInt(estimatedMinutes) } : {};

        try {
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ duration_minutes: payload.minutes })
            });

            if (response.ok) {
                handleCloseDialog();
                window.location.reload();
            } else {
                alert("فشل في تحديث حالة الطلب.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("حدث خطأ أثناء الاتصال بالخادم.");
        } finally {
            setIsUpdating(false);
        }
    };
    // -----------------------------

    return (
        <Box sx={{ mx: { xs: 2, md: 5 }, my: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 10 }} sx={{ justifyContent: "space-between", my: 3 }}  >
                <Box sx={{ textAlign: { xs: 'center', md: 'left', alignSelf: 'center' } }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Order Management</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Overview of all current and past instrument orders
                    </Typography>
                </Box>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
                    <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 1, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, width: { xs: '100%', md: 180 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(99,102,241,0.2)', color: '#6366f1' }}>
                                <Inventory2OutlinedIcon />
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>{rows.length}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Total Orders</Typography>
                        </Box>
                    </Paper>

                    <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 1, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, width: { xs: '100%', md: 180 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                                <LocalShippingOutlinedIcon />
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>{rows.filter((row) => row.transfer_status === 'onWay').length}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>In Shipping</Typography>
                        </Box>
                    </Paper>
                </Stack>
            </Stack>

            <Paper elevation={0} sx={{ mb: 4, p: 2, display: 'flex', borderRadius: 1, border: `1px solid ${theme.palette.divider}`, flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, gap: 2, justifyContent: 'space-between', bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flex: 1 }}>
                    <TextField
                        placeholder="Search by order ID or customer..."
                        variant="outlined"
                        size="small"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                            sx: { borderRadius: 3, bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : 'background.default' }
                        }}
                        sx={{ minWidth: { xs: '100%', md: '300px' } }}
                    />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    disableElevation
                    onClick={handleExport}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                    Export
                </Button>
            </Paper>

            <TableContainer component={Paper} elevation={0} sx={{ width: '100%', borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                <Table sx={{ minWidth: 800 }}>
                    <TableHead sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                        <TableRow>
                            {['Order ID', 'Customer Name', 'Grand Total','Government','Official' ,'Order Date', 'Status', 'Actions'].map((head) => (
                                <TableCell key={head} align='left' sx={{ color: 'text.secondary', borderBottom: `1px solid ${theme.palette.divider}`, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                    {head}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentPage.length > 0 ? (
                            currentPage.map((row) => {
                                const canUpdate = row.transfer_status !== 'reached' && row.transfer_status !== 'finished';

                                return (
                                    <TableRow key={row.transaction_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell align='left' sx={{ color: 'text.primary', borderBottom: `1px solid ${theme.palette.divider}`, fontWeight: 700 }}>
                                            {row.transaction_id}
                                        </TableCell>

                                        <TableCell align='left' sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '1rem', fontWeight: 'bold' }}>
                                                    {row.invoice_owner?.name?.charAt(0)}
                                                </Avatar>
                                                <Typography sx={{ fontWeight: 600 }}>{row.invoice_owner?.name}</Typography>
                                                <br />
                                            </Box>
                                                <Typography sx={{ ml:5,fontWeight: 300, fontSize: '0.75rem', color: 'text.secondary' }}>{row.invoice_owner?.email}</Typography>
                                        </TableCell>

                                        <TableCell align='left' sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {row.products && row.products.length > 0 ? (
                                                    row.products.map((product, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={product.name}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    ))
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">{row.grand_total}</Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell align='left' sx={{ color: 'text.secondary', fontWeight: 500, borderBottom: `1px solid ${theme.palette.divider}` }}>
                                            {row.g}
                                        </TableCell>
                                        <TableCell align='left' sx={{ color: 'text.secondary', fontWeight: 500, borderBottom: `1px solid ${theme.palette.divider}` }}>
                                            {row.o}
                                        </TableCell>

                                        <TableCell align='left' sx={{ color: 'text.secondary', fontWeight: 500, borderBottom: `1px solid ${theme.palette.divider}` }}>
                                            {row.date}
                                        </TableCell>

                                        <TableCell align='left' sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                                            <Chip
                                                label={row.transfer_status}
                                                size="small"
                                                sx={{
                                                    border: getStatusStyles(row.transfer_status).border,
                                                    backgroundColor: getStatusStyles(row.transfer_status).bg,
                                                    color: getStatusStyles(row.transfer_status).color,
                                                    fontWeight: 700,
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell align='left' sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                                            {canUpdate && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<PlayArrowOutlinedIcon />}
                                                    onClick={() => handleOpenUpdateClick(row)}
                                                    sx={{ borderColor: theme.palette.divider, color: 'text.primary', textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                                                >
                                                    Update
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                    No orders found matching your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <Box sx={{ width: '100%', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2, p: 3, backgroundColor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                        Showing {filteredRows.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + rowsPerPage, filteredRows.length)} of {filteredRows.length} orders
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={handlePrevPage} disabled={page === 1} variant="outlined" sx={{ minWidth: 40, height: 40, p: 0 }}>
                            <KeyboardArrowLeftIcon />
                        </Button>
                        {[...Array(pageNumber)].map((_, index) => {
                            const pageNum = index + 1;
                            let shouldShow = false;
                            if (page === 1 && pageNum <= 3) shouldShow = true;
                            else if (page === pageNumber && pageNum >= pageNumber - 2) shouldShow = true;
                            else if (pageNum >= page - 1 && pageNum <= page + 1) shouldShow = true;

                            return shouldShow && (
                                <Button
                                    key={pageNum}
                                    onClick={() => handlePageClick(pageNum)}
                                    variant={page === pageNum ? "contained" : "outlined"}
                                    sx={{
                                        minWidth: 40, height: 40, p: 0,
                                        backgroundColor: page === pageNum ? 'primary.light' : 'transparent',
                                        color: page === pageNum ? (theme.palette.mode === 'dark' ? 'black' : 'white') : 'text.primary',
                                        borderColor: page === pageNum ? 'transparent' : theme.palette.divider,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                        <Button onClick={handleNextPage} disabled={page === pageNumber || pageNumber === 0} variant="outlined" sx={{ minWidth: 40, height: 40, p: 0 }}>
                            <KeyboardArrowRightIcon />
                        </Button>
                    </Box>
                </Box>
            </TableContainer>

            {/* --- Update Status Dialog --- */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Update Transfer Status</DialogTitle>
                <DialogContent dividers>

                    {selectedTx?.transfer_status === 'onWay' ? (
                        <Typography sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>
                            This order is currently on the way. Confirm reaching destination?
                        </Typography>
                    ) : (
                        <FormControl component="fieldset" sx={{ width: '100%', mb: 2 }}>
                            <RadioGroup
                                value={updateStatus}
                                onChange={(e) => setUpdateStatus(e.target.value)}
                            >
                                <FormControlLabel
                                    value="onWay"
                                    control={<Radio />}
                                    label="On Way (في الطريق)"
                                />
                                <FormControlLabel
                                    value="reached"
                                    control={<Radio />}
                                    label="Reached (وصلت)"
                                />
                            </RadioGroup>
                        </FormControl>
                    )}

                    {updateStatus === 'onWay' && (
                        <TextField
                            fullWidth
                            type="number"
                            label="Estimated Minutes"
                            placeholder="e.g. 30"
                            InputLabelProps={{ shrink: true }}
                            value={estimatedMinutes}
                            onChange={(e) => setEstimatedMinutes(e.target.value)}
                            required
                            inputProps={{ min: 1 }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit" disabled={isUpdating}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmUpdate}
                        variant="contained"
                        disabled={isUpdating}
                        disableElevation
                    >
                        {isUpdating ? 'Updating...' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Orders;