import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
    IconButton, Button, Avatar, InputBase, Stack, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Fade, useMediaQuery, Divider
} from '@mui/material';
import ApprovalIcon from '@mui/icons-material/Approval';
import { alpha, useTheme } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import IosShareIcon from '@mui/icons-material/IosShare';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import CameraAlt from '@mui/icons-material/CameraAlt';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import useFetch from "../hooks/useFetch.js";
import IP from './IP.js';
import { useNavigate } from 'react-router-dom';


const BASE_URL = `${IP}/api`;
const STORAGE_URL = `${IP}/storage/`;

const AdminDashboardPro = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [playingId, setPlayingId] = useState(null);
    const [currentAudio, setCurrentAudio] = useState(null);

    const [display, setDisplay] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [rejectUserId, setRejectUserId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [openUserDialog, setOpenUserDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [isRentEmpty, setIsRentEmpty] = useState(true);
    const [isTitleEmpty, setTitleEmpty] = useState(true);
    const [isSaleEmpty, setIsSaleEmpty] = useState(true);

    const [openVideoDialog, setOpenVideoDialog] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState(null);

    const [openImagesDialog, setOpenImagesDialog] = useState(false);
    const [currentImages, setCurrentImages] = useState([]);

    const themeColor = {
        Admin: 'primary.main',
        User: 'secondary.main',
    };

    const [fullScreenImage, setFullScreenImage] = useState(null);

    const [reloadKey, setReloadKey] = useState(Date.now());

    const {
        data: approvedUsersData,
        loading: loadingApproved
    } = useFetch(`${BASE_URL}/admin/users/all?reload=${reloadKey}`, 'GET');
    const [approvedUsers, setApprovedUsers] = useState([]);
    const [approvedUsersSearch, setApprovedUsersSearch] = useState([]);

    const {
        data: pendingUsersData,
        loading: loadingPending
    } = useFetch(`${BASE_URL}/admin/users/pending?reload=${reloadKey}`, 'GET');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingUsersSearch, setPendingUsersSearch] = useState([]);

    const {
        data: verificationUsersData,
        loading: loadingVerification
    } = useFetch(`${BASE_URL}/admin/users/verification?reload=${reloadKey}`, 'GET');
    const [verificationUsers, setVerificationUsers] = useState([]);
    const [verificationUsersSearch, setVerificationUsersSearch] = useState([]);

    const {
        data: productsData,
        loading: loadingProducts
    } = useFetch(`${BASE_URL}/admin/product/index`, 'GET');
    const [products, setProducts] = useState([]);
    const [productsSearch, setProductsSearch] = useState([]);

    useEffect(() => {
        if (approvedUsersData) {
            let arr = Array.isArray(approvedUsersData) ? approvedUsersData : (approvedUsersData.data || []);
            const sortedArr = [...arr].sort((a, b) => {
                const isAAdmin = a.role && a.role.toLowerCase() === 'admin';
                const isBAdmin = b.role && b.role.toLowerCase() === 'admin';
                if (isAAdmin && !isBAdmin) return -1;
                if (!isAAdmin && isBAdmin) return 1;
                return 0;
            });
            setApprovedUsers(sortedArr);
            setApprovedUsersSearch(sortedArr);
        }
    }, [approvedUsersData, loadingApproved]);

    useEffect(() => {
        if (pendingUsersData) {
            const arr = Array.isArray(pendingUsersData) ? pendingUsersData : (pendingUsersData.data || []);
            setPendingUsers(arr);
            setPendingUsersSearch(arr);
        }
    }, [pendingUsersData, loadingPending]);

    useEffect(() => {
        if (verificationUsersData) {
            const arr = Array.isArray(verificationUsersData) ? verificationUsersData : (verificationUsersData.data || []);
            setVerificationUsers(arr);
            setVerificationUsersSearch(arr);
        }
    }, [verificationUsersData, loadingVerification]);

    useEffect(() => {
        if (productsData) {
            const arr = Array.isArray(productsData) ? productsData : (productsData.data || []);
            setProducts(arr);
            setProductsSearch(arr);
        }
    }, [productsData, loadingProducts]);

    const handleSuccessAlert = () => {
        setDisplay(true);
        setTimeout(() => setDisplay(false), 2000);
    };

    const handlePlay = (id, url) => {
        if (!url) {
            alert('The Sound Not Found');
            return;
        }
        if (id === playingId && currentAudio) {
            currentAudio.pause();
            setCurrentAudio(null);
            setPlayingId(null);
            return;
        }
        if (currentAudio) {
            currentAudio.pause();
        }
        const newAudio = new Audio(url);
        newAudio.play().then(() => {
            setCurrentAudio(newAudio);
            setPlayingId(id);
        }).catch(error => {
            console.error("Audio playback error:", error);
            setPlayingId(null);
            setCurrentAudio(null);
        });
    };

    const deleteApprovedUser = (id) => {
        setApprovedUsers(prev => prev.filter(user => user.id !== id));
        setApprovedUsersSearch(prev => prev.filter(user => user.id !== id));
        handleSuccessAlert();
    };

    const approveUser = async (id) => {
        try {
            await fetch(`${BASE_URL}/admin/admins/approve/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            handleSuccessAlert();
            setReloadKey(Date.now());
        } catch (error) {
            console.log(error);
        }
    };

    const rejectUserSubmit = async (id, reason) => {
        try {
            await fetch(`${BASE_URL}/admin/admins/reject/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ reason })
            });
            handleSuccessAlert();
            setReloadKey(Date.now());
            setRejectUserId(null);
            setRejectReason('');
        } catch (error) {
            console.log(error);
        }
    };

    const approveVerificationUser = async (id) => {
        try {
            await fetch(`${BASE_URL}/admin/users/approve/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            handleSuccessAlert();
            setReloadKey(Date.now());
        } catch (error) {
            console.log(error);
        }
    };

    const rejectVerificationUser = async (id) => {
        try {
            await fetch(`${BASE_URL}/admin/users/reject/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            handleSuccessAlert();
            setReloadKey(Date.now());
        } catch (error) {
            console.log(error);
        }
    };

    const acceptProduct = async (id) => {
        try {
            await fetch(`${BASE_URL}/admin/product/accept/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            handleSuccessAlert();
            setReloadKey(Date.now());
        } catch (error) {
            console.log("Error accepting product:", error);
        }
        navigate('/team');
    };

    const rejectProduct = async (id) => {
        try {
            await fetch(`${BASE_URL}/admin/product/reject/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            handleSuccessAlert();
            setReloadKey(Date.now());
        } catch (error) {
            console.log("Error rejecting product:", error);
        }
        navigate('/team');
    };

    const handleAddProduct = () => {
        setOpenAddDialog(false);
        setTitleEmpty(true);
        setIsRentEmpty(true);
        setIsSaleEmpty(true);
        handleSuccessAlert();
    };

    const handleApprovedUsersSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setApprovedUsersSearch(approvedUsers.filter(item => item.name?.toLowerCase().includes(query)));
    };

    const handlePendingUsersSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setPendingUsersSearch(pendingUsers.filter(item => item.name?.toLowerCase().includes(query)));
    };

    const handleVerificationUsersSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setVerificationUsersSearch(verificationUsers.filter(item => item.name?.toLowerCase().includes(query)));
    };

    const handleProductsSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setProductsSearch(products.filter(item => item.category?.toLowerCase().includes(query)));
    };

    const handleExport = () => {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += "--- Users ---\nID,Name,Email,Role\n";
        approvedUsers.forEach(user => {
            csvContent += `"${user.id}","${user.name}","${user.email}","${user.role}"\n`;
        });
        csvContent += "\n--- Instruments ---\nID,Instrument Name,Price\n";
        products.forEach(item => {
            csvContent += `"${item.id}","${item.category}","${item.price}"\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", encodedUri);
        downloadAnchorNode.setAttribute("download", "workspace_report.csv");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        handleSuccessAlert();
    };

    const searchHeaderStyles = {
        p: { xs: 2, sm: 2.5 },
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2
    };

    const searchInputStyles = {
        p: '2px 8px',
        display: 'flex',
        alignItems: 'center',
        width: { xs: '100%', sm: 350 },
        bgcolor: 'background.default',
        boxShadow: 'none'
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto', width: '100%' }}>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 5,
                    gap: 3,
                    flexDirection: { xs: 'column', md: 'row' },
                    textAlign: { xs: 'center', md: 'left' }
                }}>
                    <Box>
                        <Typography variant="h4" sx={{ color: 'text.primary', mb: 0.5, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>Workspace Overview</Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>Manage Users and review new instrument submissions.</Typography>
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        <Button fullWidth variant="outlined" startIcon={<IosShareIcon />} onClick={handleExport} sx={{
                            color: 'text.primary',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'background.default' }
                        }}>Export Data</Button>
                    </Stack>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 5 }}>
                    <Paper sx={{ p: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Instruments</Typography>
                        <Typography variant="h4" sx={{ color: 'text.primary', mt: 1 }}>{products.length}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2, color: 'success.main' }}>
                            <TrendingUpIcon fontSize="small" />
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Active items</Typography>
                        </Box>
                    </Paper>
                    <Paper sx={{ p: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Admin</Typography>
                        <Typography variant="h4" sx={{ color: 'primary.main', mt: 1 }}>{pendingUsers.length}</Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 2, fontWeight: 500 }}>Requires approval</Typography>
                    </Paper>
                    <Paper sx={{ p: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Verification Requests</Typography>
                        <Typography variant="h4" sx={{ color: 'warning.main', mt: 1 }}>{verificationUsers.length}</Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 2, fontWeight: 500 }}>Awaiting verification</Typography>
                    </Paper>
                    <Paper sx={{ p: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>All Users</Typography>
                        <Typography variant="h4" sx={{ color: 'text.primary', mt: 1 }}>{approvedUsers.length}</Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 2, fontWeight: 500 }}>Approved users</Typography>
                    </Paper>
                </Box>

                <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, display: verificationUsersSearch.length === 0 ? 'none' : '' }}>USERS REQUESTING VERIFICATION</Typography>
                <Paper sx={{ mb: 6, display: verificationUsersSearch.length === 0 ? 'none' : '' }}>
                    <Box sx={searchHeaderStyles}>
                        <Paper component="form" sx={searchInputStyles}>
                            <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                            <InputBase sx={{ flex: 1, color: 'text.primary', fontSize: '0.9rem' }} placeholder="Search Verification Users..." onChange={handleVerificationUsersSearchChange} />
                        </Paper>
                        <Button startIcon={<FilterListIcon />} sx={{ color: 'text.secondary' }}>Filter</Button>
                    </Box>

                    {isMobile ? (
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '500px', overflowY: 'auto' }}>
                            {verificationUsersSearch.map((user) => (
                                <Paper key={user.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Box onClick={() => { setSelectedUser(user); setOpenUserDialog(true); }} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, cursor: 'pointer' }}>
                                        <Avatar src={user.image ? user.image : undefined} sx={{ bgcolor: alpha(theme.palette[(themeColor[user.role] || 'primary.main').split('.')[0]].main, 0.15), color: themeColor[user.role] || 'primary.main', fontWeight: 700, width: 48, height: 48 }}>
                                            {!user.image && user.name ? user.name.charAt(0).toUpperCase() : ''}
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</Typography>
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{user.email}</Typography>
                                        </Box>
                                    </Box>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: alpha(theme.palette.warning.main, 0.1), border: '1px solid', borderColor: 'warning.main', color: 'warning.dark', fontSize: '0.8rem', fontWeight: 600 }}>
                                            VERIFICATION
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <IconButton onClick={(e) => { e.stopPropagation(); approveVerificationUser(user.id); }} sx={{ color: 'success.main', bgcolor: alpha(theme.palette.success.main || '#10b981', 0.1) }}>
                                                <CheckRoundedIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton onClick={(e) => { e.stopPropagation(); rejectVerificationUser(user.id); }} sx={{ color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                                                <CloseRoundedIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ maxHeight: '450px', overflow: 'auto' }}>
                            <Table sx={{ minWidth: 600 }}>
                                <TableHead sx={{ bgcolor: alpha(theme.palette.divider, 0.1) }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>USER</TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>ROLE</TableCell>
                                        <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>ACTIONS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {verificationUsersSearch.map((user) => (
                                        <TableRow key={user.id} sx={{ cursor: 'pointer', '&:last-child td': { border: 0 }, '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.02) }, transition: 'background-color 0.2s' }}>
                                            <TableCell onClick={() => { setSelectedUser(user); setOpenUserDialog(true); }} sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar src={user.image ? user.image : undefined} sx={{ bgcolor: alpha(theme.palette[(themeColor[user.role] || 'primary.main').split('.')[0]].main, 0.15), color: themeColor[user.role] || 'primary.main', fontWeight: 700, width: 42, height: 42 }}>
                                                        {!user.image && user.name ? user.name.charAt(0).toUpperCase() : ''}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</Typography>
                                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{user.email}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                                                <Typography sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: alpha(theme.palette.warning.main, 0.1), border: '1px solid', borderColor: 'warning.main', color: 'warning.dark', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    VERIFICATION
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Tooltip title="Approve Verification" arrow>
                                                        <IconButton onClick={(e) => { e.stopPropagation(); approveVerificationUser(user.id); }} sx={{ color: 'success.main', bgcolor: alpha(theme.palette.success.main || '#10b981', 0.1), '&:hover': { bgcolor: 'success.main', color: '#fff', transform: 'scale(1.05)' }, transition: 'all 0.2s' }}>
                                                            <CheckRoundedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject Verification" arrow>
                                                        <IconButton onClick={(e) => { e.stopPropagation(); rejectVerificationUser(user.id); }} sx={{ color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1), '&:hover': { color: 'white', bgcolor: alpha(theme.palette.error.main, 1) } }}>
                                                            <CloseRoundedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </Paper>

                <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, display: pendingUsersSearch.length === 0 ? 'none' : '' }}>PENDING ADMINS</Typography>
                <Paper sx={{ mb: 6, display: pendingUsersSearch.length === 0 ? 'none' : '' }}>
                    <Box sx={searchHeaderStyles}>
                        <Paper component="form" sx={searchInputStyles}>
                            <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                            <InputBase sx={{ flex: 1, color: 'text.primary', fontSize: '0.9rem' }} placeholder="Search Pending Users..." onChange={handlePendingUsersSearchChange} />
                        </Paper>
                        <Button startIcon={<FilterListIcon />} sx={{ color: 'text.secondary' }}>Filter</Button>
                    </Box>

                    {isMobile ? (
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '500px', overflowY: 'auto' }}>
                            {pendingUsersSearch.map((user) => (
                                <Paper key={user.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Box onClick={() => { setSelectedUser(user); setOpenUserDialog(true); }} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, cursor: 'pointer' }}>
                                        <Avatar src={user.image ? user.image : undefined} sx={{ bgcolor: alpha(theme.palette[(themeColor[user.role] || 'primary.main').split('.')[0]].main, 0.15), color: themeColor[user.role] || 'primary.main', fontWeight: 700, width: 48, height: 48 }}>
                                            {!user.image && user.name ? user.name.charAt(0).toUpperCase() : ''}
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</Typography>
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{user.email}</Typography>
                                        </Box>
                                    </Box>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: alpha(theme.palette.text.secondary, 0.1), border: '1px solid', borderColor: user.role !== 'admin' ? 'secondary.main' : 'primary.dark', color: user.role !== 'admin' ? 'secondary.main' : 'primary.dark', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {user.role ? user.role.toUpperCase() : 'USER'}
                                        </Typography>

                                        {user.role !== 'Admin' && (
                                            <Stack direction="row" spacing={1}>
                                                <IconButton onClick={(e) => { e.stopPropagation(); approveUser(user.id); }} sx={{ color: 'success.main', bgcolor: alpha(theme.palette.success.main || '#10b981', 0.1) }}>
                                                    <ApprovalIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton onClick={(e) => { e.stopPropagation(); setRejectUserId(user.id); }} sx={{ color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                                                    <DeleteOutlinedIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        )}
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ maxHeight: '450px', overflow: 'auto' }}>
                            <Table sx={{ minWidth: 600 }}>
                                <TableHead sx={{ bgcolor: alpha(theme.palette.divider, 0.1) }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>USER</TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>ROLE</TableCell>
                                        <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>ACTIONS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingUsersSearch.map((user) => (
                                        <TableRow key={user.id} sx={{ cursor: 'pointer', '&:last-child td': { border: 0 }, '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.02) }, transition: 'background-color 0.2s' }}>
                                            <TableCell onClick={() => { setSelectedUser(user); setOpenUserDialog(true); }} sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar src={user.image ? user.image : undefined} sx={{ bgcolor: alpha(theme.palette[(themeColor[user.role] || 'primary.main').split('.')[0]].main, 0.15), color: themeColor[user.role] || 'primary.main', fontWeight: 700, width: 42, height: 42 }}>
                                                        {!user.image && user.name ? user.name.charAt(0).toUpperCase() : ''}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</Typography>
                                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{user.email}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                                                <Typography sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: alpha(theme.palette.text.secondary, 0.1), border: '1px solid', borderColor: user.role !== 'admin' ? 'secondary.main' : 'primary.dark', color: user.role !== 'admin' ? 'secondary.main' : 'primary.dark', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    {user.role ? user.role.toUpperCase() : 'USER'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                                                {user.role !== 'Admin' && <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Tooltip title="Approve" arrow>
                                                        <IconButton onClick={(e) => { e.stopPropagation(); approveUser(user.id); }} sx={{ color: 'success.main', bgcolor: alpha(theme.palette.success.main || '#10b981', 0.1), '&:hover': { bgcolor: 'success.main', color: '#fff', transform: 'scale(1.05)' }, transition: 'all 0.2s' }}>
                                                            <ApprovalIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Remove User" arrow>
                                                        <IconButton onClick={(e) => { e.stopPropagation(); setRejectUserId(user.id); }} sx={{ color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1), '&:hover': { color: 'white', bgcolor: alpha(theme.palette.error.main, 1) } }}>
                                                            <DeleteOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </Paper>

                <Typography variant="h6" sx={{ display: approvedUsersSearch.length === 0 ? 'none' : '', color: 'text.primary', mb: 2 }}>All Users</Typography>
                <Paper sx={{ display: approvedUsersSearch.length === 0 ? 'none' : '', mb: 6 }}>
                    <Box sx={searchHeaderStyles}>
                        <Paper component="form" sx={searchInputStyles}>
                            <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                            <InputBase sx={{ flex: 1, color: 'text.primary', fontSize: '0.9rem' }} placeholder="Search Approved Users..." onChange={handleApprovedUsersSearchChange} />
                        </Paper>
                        <Button startIcon={<FilterListIcon />} sx={{ color: 'text.secondary' }}>Filter</Button>
                    </Box>

                    {isMobile ? (
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '500px', overflowY: 'auto' }}>
                            {approvedUsersSearch.map((user) => (
                                <Paper key={user.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Box onClick={() => { setSelectedUser(user); setOpenUserDialog(true); }} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, cursor: 'pointer' }}>
                                        <Avatar src={user.image ? user.image : undefined} sx={{ bgcolor: alpha(theme.palette[(themeColor[user.role] || 'primary.main').split('.')[0]].main, 0.15), color: themeColor[user.role] || 'primary.main', fontWeight: 700, width: 48, height: 48 }}>
                                            {!user.image && user.name ? user.name.charAt(0).toUpperCase() : ''}
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</Typography>
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{user.email}</Typography>
                                        </Box>
                                    </Box>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                        <Typography sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: alpha(theme.palette.primary.main, 0.1), border: '1px solid', borderColor: user.role !== 'admin' ? 'secondary.main' : 'primary.dark', color: user.role !== 'admin' ? 'secondary.main' : 'primary.dark', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {user.role ? user.role.toUpperCase() : 'USER'}
                                        </Typography>

                                        {user.role === 'admin' || user.role === 'Admin' ? (
                                            <Typography sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: alpha(theme.palette.info.main, 0.1), border: '1px solid', borderColor: 'info.main', color: 'info.main', fontSize: '0.75rem', fontWeight: 600 }}>
                                                Not Required
                                            </Typography>
                                        ) : user.active == 1 ? (
                                            <Typography sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: alpha(theme.palette.success.main, 0.1), border: '1px solid', borderColor: 'success.main', color: 'success.main', fontSize: '0.75rem', fontWeight: 600 }}>
                                                <CheckRoundedIcon sx={{ fontSize: '1rem' }} /> Verified
                                            </Typography>
                                        ) : (
                                            <Typography sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: alpha(theme.palette.text.secondary, 0.1), border: '1px solid', borderColor: 'text.secondary', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>
                                                <CloseRoundedIcon sx={{ fontSize: '1rem' }} /> Unverified
                                            </Typography>
                                        )}
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ maxHeight: '450px', overflow: 'auto' }}>
                            <Table sx={{ minWidth: 600 }}>
                                <TableHead sx={{ bgcolor: alpha(theme.palette.divider, 0.1) }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>USER</TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>ROLE</TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>VERIFICATION</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {approvedUsersSearch.map((user) => (
                                        <TableRow key={user.id} sx={{ cursor: 'pointer', '&:last-child td': { border: 0 }, '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.02) }, transition: 'background-color 0.2s' }}>
                                            <TableCell onClick={() => { setSelectedUser(user); setOpenUserDialog(true); }} sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar src={user.image ? user.image : undefined} sx={{ bgcolor: alpha(theme.palette[(themeColor[user.role] || 'primary.main').split('.')[0]].main, 0.15), color: themeColor[user.role] || 'primary.main', fontWeight: 700, width: 42, height: 42 }}>
                                                        {!user.image && user.name ? user.name.charAt(0).toUpperCase() : ''}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</Typography>
                                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{user.email}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                                                <Typography sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: alpha(theme.palette.primary.main, 0.1), border: '1px solid', borderColor: user.role !== 'admin' ? 'secondary.main' : 'primary.dark', color: user.role !== 'admin' ? 'secondary.main' : 'primary.dark', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    {user.role ? user.role.toUpperCase() : 'USER'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                                                {user.role === 'admin' || user.role === 'Admin' ? (
                                                    <Typography sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: alpha(theme.palette.info.main, 0.1), border: '1px solid', borderColor: 'info.main', color: 'info.main', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        Not Required
                                                    </Typography>
                                                ) : user.active == 1 ? (
                                                    <Typography sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: alpha(theme.palette.success.main, 0.1), border: '1px solid', borderColor: 'success.main', color: 'success.main', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        <CheckRoundedIcon sx={{ fontSize: '1rem' }} /> Verified
                                                    </Typography>
                                                ) : (
                                                    <Typography sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: alpha(theme.palette.text.secondary, 0.1), border: '1px solid', borderColor: 'text.secondary', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        <CloseRoundedIcon sx={{ fontSize: '1rem' }} /> Unverified
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </Paper>

                {/* -------------------- 4. Instruments/Products Section -------------------- */}
                <Typography variant="h6" sx={{ color: 'text.primary', mb: 2 }}>Instruments Submissions</Typography>
                <Paper sx={{ mb: 4 }}>
                    <Box sx={searchHeaderStyles}>
                        <Paper component="form" sx={searchInputStyles}>
                            <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                            <InputBase sx={{ flex: 1, color: 'text.primary', fontSize: '0.9rem' }} placeholder="Search instruments..." onChange={handleProductsSearchChange} />
                        </Paper>
                        <Button startIcon={<FilterListIcon />} sx={{ color: 'text.secondary' }}>Filter</Button>
                    </Box>

                    {isMobile ? (
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '500px', overflowY: 'auto' }}>
                            {productsSearch.map((item) => {
                                let avatarArray = [];
                                try { avatarArray = typeof item.avatar === 'string' ? JSON.parse(item.avatar) : item.avatar; } catch (e) { avatarArray = []; }
                                const firstImage = Array.isArray(avatarArray) && avatarArray.length > 0 ? avatarArray[0] : undefined;

                                return (
                                    <Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, cursor: 'pointer', mb: 2 }}
                                            onClick={() => { setCurrentImages(avatarArray); setOpenImagesDialog(true); }}>
                                            <Avatar src={firstImage} variant="rounded" sx={{ width: 56, height: 56, borderRadius: '10px' }} />
                                            <Box>
                                                <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.95rem' }}>{item.category}</Typography>
                                                <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 0.5 }}>{item.price}</Typography>
                                                <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5 }}>{item.email}</Typography>
                                            </Box>
                                        </Box>
                                        <Divider sx={{ my: 1.5 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                            <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                                                <Button
                                                    variant={playingId === item.id ? "contained" : "outlined"}
                                                    onClick={() => handlePlay(item.id, item.audioUrl)}
                                                    startIcon={playingId === item.id ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                                                    sx={{ borderRadius: '20px', py: 0.5, px: 2, fontSize: '0.8rem', borderColor: playingId === item.id ? 'transparent' : 'divider', color: playingId === item.id ? 'primary.contrastText' : 'text.primary' }}>
                                                    {playingId === item.id ? 'Playing...' : 'Audio'}
                                                </Button>

                                                {item.videoUrl && (
                                                    <IconButton size="small" sx={{ color: 'secondary.main', bgcolor: alpha(theme.palette.secondary.main, 0.1) }} onClick={() => { setCurrentVideoUrl(item.videoUrl); setOpenVideoDialog(true); }}>
                                                        <OndemandVideoIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </Stack>

                                            <Stack direction="row" spacing={1}>
                                                <IconButton onClick={() => acceptProduct(item.id)} sx={{ color: 'success.main', bgcolor: alpha(theme.palette.success.main || '#10b981', 0.1) }}>
                                                    <CheckRoundedIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton onClick={() => rejectProduct(item.id)} sx={{ color: 'error.main', bgcolor: alpha(theme.palette.error.main || '#f43f5e', 0.1) }}>
                                                    <CloseRoundedIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </Box>
                                    </Paper>
                                );
                            })}
                        </Box>
                    ) : (
                        <Box sx={{ maxHeight: '450px', overflow: 'auto' }}>
                            <Table sx={{ minWidth: 600 }}>
                                <TableHead sx={{ bgcolor: alpha(theme.palette.divider, 0.1) }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>INSTRUMENT DETAILS</TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>PREVIEW</TableCell>
                                        <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>DECISION</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {productsSearch.map((item) => {
                                        let avatarArray = [];
                                        try { avatarArray = typeof item.avatar === 'string' ? JSON.parse(item.avatar) : item.avatar; } catch (e) { avatarArray = []; }
                                        const firstImage = Array.isArray(avatarArray) && avatarArray.length > 0 ? avatarArray[0] : undefined;

                                        return (
                                            <TableRow key={item.id} sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.02) }, transition: 'background-color 0.2s' }}>
                                                <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                                                        onClick={() => { setCurrentImages(avatarArray); setOpenImagesDialog(true); }}>
                                                        <Avatar src={firstImage} variant="rounded" sx={{ width: 48, height: 48, borderRadius: '10px' }} />
                                                        <Box>
                                                            <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.95rem' }}>{item.category}</Typography>
                                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', mt: 0.5 }}>{item.price}</Typography>
                                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5 }}>{item.email}</Typography>

                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                                                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                                        <Button
                                                            variant={playingId === item.id ? "contained" : "outlined"}
                                                            onClick={() => handlePlay(item.id, item.audioUrl)}
                                                            startIcon={playingId === item.id ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                                                            sx={{ borderRadius: '20px', py: 0.5, px: 2, fontSize: '0.8rem', borderColor: playingId === item.id ? 'transparent' : 'divider', color: playingId === item.id ? 'primary.contrastText' : 'text.primary' }}>
                                                            {playingId === item.id ? 'Playing...' : 'Play Audio'}
                                                        </Button>

                                                        {item.videoUrl && (
                                                            <Tooltip title="Play Video" placement="top">
                                                                <IconButton size="small" sx={{ color: 'secondary.main' }} onClick={() => { setCurrentVideoUrl(item.videoUrl); setOpenVideoDialog(true); }}>
                                                                    <OndemandVideoIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Stack>
                                                </TableCell>

                                                <TableCell align="right" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Tooltip title="Approve" arrow>
                                                            <IconButton onClick={() => acceptProduct(item.id)} sx={{ color: 'success.main', bgcolor: alpha(theme.palette.success.main || '#10b981', 0.1), '&:hover': { bgcolor: 'success.main', color: '#fff', transform: 'scale(1.05)' }, transition: 'all 0.2s' }}>
                                                                <CheckRoundedIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Reject" arrow>
                                                            <IconButton onClick={() => rejectProduct(item.id)} sx={{ color: 'error.main', bgcolor: alpha(theme.palette.error.main || '#f43f5e', 0.1), '&:hover': { bgcolor: 'error.main', color: '#fff', transform: 'scale(1.05)' }, transition: 'all 0.2s' }}>
                                                                <CloseRoundedIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </Paper>
            </Box>

            <Dialog fullWidth open={openAddDialog} onClose={() => { setOpenAddDialog(false); setTitleEmpty(true); setIsRentEmpty(true); setIsSaleEmpty(true); }} TransitionComponent={Fade} PaperProps={{ sx: { minWidth: { xs: '90%', sm: '400px' }, maxWidth: '500px', borderRadius: 3, m: 2 } }}>
                <DialogTitle sx={{ color: 'text.primary', fontWeight: 700, pb: 1 }}>Add Your Product</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
                    <TextField label="Instrument Name (Category)" fullWidth variant="outlined" onChange={(e) => setTitleEmpty(e.target.value.length === 0)} />
                    <TextField multiline rows={5} placeholder="Description, history, condition..." fullWidth variant="outlined" />
                    <TextField type="number" label="Sale Price ($)" placeholder="0.0" fullWidth onChange={(e) => setIsSaleEmpty(e.target.value.length === 0)} />
                    <TextField type="number" label='Rent / Day ($)' fullWidth onChange={(e) => setIsRentEmpty(e.target.value.length === 0)} />
                    <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3, display: 'flex', gap: 2, flexDirection: 'column', textAlign: 'center', bgcolor: 'background.paper' }}>
                        <Typography variant="subtitle2" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'text.secondary', mb: 2, fontWeight: 600 }}>
                            Add Photo <CameraAlt sx={{ ml: 2 }} />
                        </Typography>
                        <Button component="label" variant="outlined" sx={{ borderRadius: 2 }}>
                            Select A Photo <input type="file" hidden accept="image/*" />
                        </Button>
                    </Box>
                    <Button component="label" variant="outlined" sx={{ borderRadius: 2 }}>
                        Select An Audio <input type="file" hidden accept="audio/*" />
                    </Button>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'space-around', p: 3, pt: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Button onClick={() => { setOpenAddDialog(false); setTitleEmpty(true); setIsRentEmpty(true); setIsSaleEmpty(true); }} sx={{ flexGrow: 1, color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
                    <Button onClick={handleAddProduct} variant="contained" color="primary" disabled={isTitleEmpty || isSaleEmpty || isRentEmpty} sx={{ fontWeight: 600, flexGrow: 1 }}>Add Product</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { m: 2, borderRadius: 3 } }}>
                {selectedUser && (() => {
                    const finalPersonalUrl = selectedUser.image ? selectedUser.image : 'https://placehold.co/400?text=No+Photo';
                    const finalIdUrl = selectedUser.imageId ? (selectedUser.imageId.startsWith('http') ? selectedUser.imageId : `${STORAGE_URL}${selectedUser.imageId}`) : 'https://placehold.co/400?text=No+ID';

                    return (
                        <>
                            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1, flexWrap: 'wrap' }}>
                                <Avatar src={selectedUser.imagePersonal ? finalPersonalUrl : undefined} sx={{ bgcolor: alpha(theme.palette[(themeColor[selectedUser?.role] || 'primary.main').split('.')[0]].main, 0.15), color: themeColor[selectedUser?.role] || 'primary.main', fontWeight: 700, width: 56, height: 56, fontSize: '1.5rem' }}>
                                    {!selectedUser.imagePersonal && selectedUser?.name ? selectedUser.name.charAt(0).toUpperCase() : ''}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>{selectedUser.name}</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-all' }}>{selectedUser.email}</Typography>
                                </Box>
                            </DialogTitle>
                            <DialogContent dividers sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Personal Photo</Typography>
                                    <Box component="img" src={finalPersonalUrl} alt="User Photo" onClick={() => selectedUser.imagePersonal && setFullScreenImage(finalPersonalUrl)} sx={{ width: '100%', height: { xs: '180px', sm: '250px' }, objectFit: 'contain', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, cursor: selectedUser.imagePersonal ? 'pointer' : 'default' }} />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>ID Card / Document</Typography>
                                    <Box component="img" src={finalIdUrl} alt="User ID" onClick={() => selectedUser.imageId && setFullScreenImage(finalIdUrl)} sx={{ width: '100%', height: { xs: '180px', sm: '250px' }, objectFit: 'contain', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, cursor: selectedUser.imageId ? 'pointer' : 'default' }} />
                                </Box>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenUserDialog(false)} sx={{ fontWeight: 600 }}>Close</Button>
                            </DialogActions>
                        </>
                    );
                })()}
            </Dialog>

            <Dialog open={!!rejectUserId} onClose={() => setRejectUserId(null)} fullWidth PaperProps={{ sx: { m: 2, borderRadius: 3 } }}>
                <DialogTitle>Reject User</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 3 }}>Please provide a reason for rejecting this user:</Typography>
                    <TextField autoFocus fullWidth multiline rows={4} variant="outlined" label="Rejection Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0, flexWrap: 'wrap' }}>
                    <Button onClick={() => { setRejectUserId(null); setRejectReason(''); }} color="inherit" sx={{ flexGrow: 1 }}>Cancel</Button>
                    <Button onClick={() => rejectUserSubmit(rejectUserId, rejectReason)} color="error" variant="contained" disabled={!rejectReason.trim()} sx={{ flexGrow: 1 }}>Confirm Reject</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openVideoDialog} onClose={() => setOpenVideoDialog(false)} maxWidth="md" fullWidth TransitionComponent={Fade} PaperProps={{ sx: { m: 1, width: '100%' } }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Preview Video
                    <IconButton onClick={() => setOpenVideoDialog(false)} size="small"><CloseRoundedIcon /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: '#000', display: 'flex', justifyContent: 'center' }}>
                    {currentVideoUrl && <video src={currentVideoUrl} controls autoPlay style={{ width: '100%', maxHeight: '600px' }} />}
                </DialogContent>
            </Dialog>

            <Dialog open={openImagesDialog} onClose={() => setOpenImagesDialog(false)} maxWidth="md" fullWidth TransitionComponent={Fade} PaperProps={{ sx: { m: 2, borderRadius: 3 } }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    صور الآلة الموسيقية
                    <IconButton onClick={() => setOpenImagesDialog(false)} size="small"><CloseRoundedIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ display: 'flex', gap: 2, overflowX: 'auto', p: { xs: 2, sm: 3 }, bgcolor: 'background.default' }}>
                    {currentImages && currentImages.length > 0 ? (
                        currentImages.map((img, index) => (
                            <Box key={index} component="img" src={img} alt={`Instrument Image ${index + 1}`} sx={{ height: { xs: '200px', sm: '300px' }, objectFit: 'contain', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', flexShrink: 0, boxShadow: theme.shadows[1] }} />
                        ))
                    ) : (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', width: '100%', py: 4 }}>
                            There are not photo to this machine
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>

            <Fade in={display} timeout={400}>
                <Box sx={{
                    position: 'fixed',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    width: { xs: '90%', sm: 'auto' },
                    minWidth: { sm: '340px' },
                    px: 2.5,
                    py: 1.5,
                    bgcolor: theme.palette.mode === 'dark' ? alpha('#18181b', 0.9) : alpha('#ffffff', 0.9),
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    borderRadius: '16px',
                    boxShadow: `0 10px 40px ${alpha(theme.palette.success.main, 0.15)}, 0 1px 3px ${alpha('#000', 0.1)}`
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.success.main, 0.15), borderRadius: '50%', p: 0.75 }}>
                        <TaskAltRoundedIcon sx={{ color: 'success.main', fontSize: 26 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.9rem', mb: 0.2 }}>Success!</Typography>
                        <Typography sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.8rem' }}>Your changes have been saved perfectly.</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setDisplay(false)} sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
                        <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Fade>

        </Box>
    );
};

export default AdminDashboardPro;
