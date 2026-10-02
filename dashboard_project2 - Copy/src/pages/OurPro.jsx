import React, { useState } from 'react';
import IP from './IP.js';

import {
    Box,
    Button,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    Typography,
    useTheme,
    alpha,
    CircularProgress,
    Snackbar,
    Alert,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery
} from '@mui/material';
import {
    Add,
    AddPhotoAlternate,
    AudioFileOutlined,
    OndemandVideoOutlined,
    Remove,
    Delete as DeleteIcon,
    Inventory2Outlined,
    SellOutlined,
    EventAvailableOutlined,
    Close as CloseIcon
} from '@mui/icons-material';
import useFetch from '../hooks/useFetch';

const OurPro = () => {
    const theme = useTheme();
    const url = IP;
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [currentView, setCurrentView] = useState(0);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [condition, setCondition] = useState('new');
    const [stock, setStock] = useState(1);

    const [governorate, setGovernorate] = useState('');
    const [office, setOffice] = useState('');
    // ----------------------

    const [isSale, setIsSale] = useState(true);
    const [salePrice, setSalePrice] = useState('');

    const [isRent, setIsRent] = useState(false);
    const [rentPrice, setRentPrice] = useState('');

    const [isAnnouncement, setIsAnnouncement] = useState(false);
    const [isRepricing, setIsRepricing] = useState(true);

    const [loading, setLoading] = useState(false);

    const [images, setImages] = useState([]);
    const [audioFile, setAudioFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const handleRowClick = (product) => {
        setSelectedProduct(product);
        setOpenImageDialog(true);
    };

    const handleCloseImageDialog = () => {
        setOpenImageDialog(false);
        setTimeout(() => setSelectedProduct(null), 200);
    };

    const handleImageUpload = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (images.length + selectedFiles.length > 3) {
            showMessage('عذراً، الحد الأقصى هو 3 صور فقط.', 'warning');
            return;
        }
        setImages((prev) => [...prev, ...selectedFiles].slice(0, 3));
    };

    const removeImage = (indexToRemove) => {
        setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleStockChange = (type) => {
        if (type === 'inc') setStock((prev) => prev + 1);
        if (type === 'dec' && stock > 0) setStock((prev) => prev - 1);
    };

    const getMediaUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;

        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${url}/storage/${cleanPath}`;
    };

    const handleSubmit = async () => {
        if (!title || (!isSale && !isRent)) {
            showMessage('الرجاء إدخال العنوان وتحديد خيار بيع أو إيجار على الأقل.', 'error');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            formData.append('title', title);
            formData.append('description', description);
            formData.append('stock', stock);
            formData.append('count', stock);
            formData.append('condition', condition);

            formData.append('governorate', governorate);
            formData.append('office', office);
            // ------------------------------

            formData.append('is_for_sale', isSale ? 1 : 0);
            formData.append('sale_price', salePrice ? parseFloat(salePrice) : 0);
            formData.append('is_for_rent', isRent ? 1 : 0);
            formData.append('rent_price_daily', rentPrice ? parseFloat(rentPrice) : 0);
            formData.append('announcement', isAnnouncement ? 1 : 0);
            formData.append('repricing', isRepricing ? 1 : 0);

            if (images[0]) formData.append('image1', images[0]);
            if (images[1]) formData.append('image2', images[1]);
            if (images[2]) formData.append('image3', images[2]);
            if (audioFile) formData.append('audio', audioFile);
            if (videoFile) formData.append('video', videoFile);

            const response = await fetch(`${url}/api/create-product`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw { status: response.status, responseData: data };
            }

            showMessage('تمت إضافة المنتج بنجاح!', 'success');

            setImages([]); setAudioFile(null); setVideoFile(null);
            setTitle(''); setSalePrice(''); setRentPrice('');
            setGovernorate(''); setOffice('');
            setCurrentView(1);

        } catch (error) {
            console.error("Error creating product:", error);
            if (error.responseData) {
                showMessage(error.responseData.message || 'حدث خطأ أثناء إضافة المنتج', 'error');
            } else {
                showMessage('تعذر الاتصال بالخادم.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const {data:dummyProducts, loading:loadinggg} = useFetch(`${url}/api/admin/product/view`, 'GET');

    const getConditionChip = (cond) => {
        const styles = {
            new: { label: 'New', color: 'success' },
            used: { label: 'Used', color: 'info' },
        };
        const active = styles[cond] || { label: cond, color: 'default' };
        return <Chip label={active.label} color={active.color} size="small" sx={{ fontWeight: 600, borderRadius: '8px' }} />;
    };

    if(!loadinggg){
        console.log(dummyProducts);
    }

    const inputContainerStyle = {
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px',
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
    };

    return (
        <Box sx={{ pb: 6, maxWidth: 1400, margin: '0 auto', px: { xs: 2, md: 4 }, pt: 4, width: '100%', overflowX: 'hidden' }}>

            <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 3, mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                        Product Management
                    </Typography>
                    {currentView === 0 && (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                            <Button variant="outlined" color="inherit" fullWidth sx={{ px: 3, py: 1, borderRadius: '10px' }} onClick={() => setCurrentView(1)}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ px: 3, py: 1, borderRadius: '10px', boxShadow: theme.shadows[4] }}
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Product'}
                            </Button>
                        </Stack>
                    )}
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={currentView}
                        onChange={(e, val) => setCurrentView(val)}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ '& .MuiTab-root': { fontWeight: 600, fontSize: '1rem', textTransform: 'none', py: 2 } }}
                    >
                        <Tab label="Add New Product" />
                        <Tab label="Products List" />
                    </Tabs>
                </Box>
            </Box>

            {currentView === 0 && (
                <Grid container spacing={4} sx={{alignItems:'center',justifyContent:'center'}}>
                    <Grid item xs={12} lg={8} sx={{width:'100%'}}>
                        <Stack spacing={4}>
                            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Basic Information</Typography>
                                <Divider sx={{ mb: 4, mx: { xs: -2.5, md: -4 } }} />
                                <Stack spacing={4}>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Product Title</Typography>
                                        <Box sx={{ ...inputContainerStyle, px: 2, py: 0.5 }}>
                                            <InputBase placeholder="e.g. Fender Stratocaster" fullWidth sx={{ fontSize: '1rem', py: 1 }} value={title} onChange={(e) => setTitle(e.target.value)} />
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Description</Typography>
                                        <Box sx={{ ...inputContainerStyle, overflow: 'hidden', p: 0 }}>
                                            <InputBase multiline rows={5} placeholder="Detailed description..." fullWidth sx={{ p: 2, fontSize: '0.95rem', alignItems: 'flex-start' }} value={description} onChange={(e) => setDescription(e.target.value)} />
                                        </Box>
                                    </Box>

                                    {/* --- إضافة واجهة المحافظة والمكتب --- */}
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Governorate</Typography>
                                            <Box sx={{ ...inputContainerStyle, px: 2, py: 0.5 }}>
                                                <InputBase
                                                    placeholder="e.g. Cairo"
                                                    fullWidth
                                                    sx={{ fontSize: '1rem', py: 1 }}
                                                    value={governorate}
                                                    onChange={(e) => setGovernorate(e.target.value)}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Office</Typography>
                                            <Box sx={{ ...inputContainerStyle, px: 2, py: 0.5 }}>
                                                <InputBase
                                                    placeholder="e.g. Main Branch"
                                                    fullWidth
                                                    sx={{ fontSize: '1rem', py: 1 }}
                                                    value={office}
                                                    onChange={(e) => setOffice(e.target.value)}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    {/* ------------------------------------- */}

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Condition</Typography>
                                            <Box sx={{ ...inputContainerStyle, px: 2, py: 0.5 }}>
                                                <Select value={condition} onChange={(e) => setCondition(e.target.value)} fullWidth disableUnderline variant="standard">
                                                    <MenuItem value="new">New</MenuItem>
                                                    <MenuItem value="used">Used</MenuItem>
                                                </Select>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Stock Count</Typography>
                                            <Box sx={{ ...inputContainerStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.5 }}>
                                                <IconButton onClick={() => handleStockChange('dec')} sx={{ color: 'text.secondary', borderRadius: 2 }}><Remove fontSize="small" /></IconButton>
                                                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{stock}</Typography>
                                                <IconButton onClick={() => handleStockChange('inc')} sx={{ color: 'text.secondary', borderRadius: 2 }}><Add fontSize="small" /></IconButton>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Paper>

                            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1, mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Media Gallery</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>Max 3 images, 1 audio, 1 video</Typography>
                                </Box>
                                <Divider sx={{ mb: 4, mx: { xs: -2.5, md: -4 } }} />
                                <Stack spacing={5} direction="column">
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Product Images</Typography>
                                        <Grid container spacing={2}>
                                            {images.map((img, index) => (
                                                <Grid item xs={6} sm={4} key={index}>
                                                    <Box sx={{ aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid', borderColor: 'divider', '&:hover .delete-overlay': { opacity: 1 } }}>
                                                        <Box component="img" src={URL.createObjectURL(img)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        <Box className="delete-overlay" sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s ease', cursor: 'pointer' }} onClick={() => removeImage(index)}>
                                                            <DeleteIcon sx={{ color: '#fff', fontSize: 32 }} />
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            ))}
                                            {images.length < 3 && (
                                                <Grid item xs={6} sm={4}>
                                                    <Box component="label" sx={{ width:'100%', aspectRatio: '1/1', borderRadius: '16px', border: '2px dashed', borderColor: alpha(theme.palette.primary.main, 0.4), bgcolor: alpha(theme.palette.primary.main, 0.04), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) } }}>
                                                        <input type="file" hidden accept="image/*" multiple onChange={handleImageUpload} />
                                                        <AddPhotoAlternate sx={{ color: 'primary.main', fontSize: { xs: 28, sm: 40 }, mb: 1 }} />
                                                        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Add Image</Typography>
                                                    </Box>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Audio & Video</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Box component="label" sx={{ p: { xs: 2, sm: 3 }, borderRadius: '16px', border: '1px solid', borderColor: audioFile ? 'primary.main' : 'divider', bgcolor: audioFile ? alpha(theme.palette.primary.main, 0.05) : 'background.default', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                                                    <input type="file" hidden accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} />
                                                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                                        <AudioFileOutlined sx={{ color: audioFile ? 'primary.main' : 'text.secondary', fontSize: 24 }} />
                                                    </Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center', wordBreak: 'break-all' }}>
                                                        {audioFile ? audioFile.name : 'Audio Sample'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">mp3, wav, ogg</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Box component="label" sx={{ p: { xs: 2, sm: 3 }, borderRadius: '16px', border: '1px solid', borderColor: videoFile ? 'primary.main' : 'divider', bgcolor: videoFile ? alpha(theme.palette.primary.main, 0.05) : 'background.default', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                                                    <input type="file" hidden accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
                                                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                                        <OndemandVideoOutlined sx={{ color: videoFile ? 'primary.main' : 'text.secondary', fontSize: 24 }} />
                                                    </Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center', wordBreak: 'break-all' }}>
                                                        {videoFile ? videoFile.name : 'Video Demo'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">mp4, mov</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} sx={{width:'100%'}} lg={4}>
                        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Pricing & Options</Typography>
                            <Divider sx={{ mb: 4, mx: { xs: -2.5, md: -4 } }} />
                            <Stack spacing={3}>
                                <Box sx={{ p: 2.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>Is for Sale</Typography>
                                        <Switch checked={isSale} onChange={(e) => setIsSale(e.target.checked)} color="primary" />
                                    </Box>
                                    <Box sx={{ opacity: isSale ? 1 : 0.5, pointerEvents: isSale ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>Sale Price (USD)</Typography>
                                        <Box sx={{ ...inputContainerStyle, px: 2, py: 0.5 }}>
                                            <InputBase type="number" startAdornment={<InputAdornment position="start">$</InputAdornment>} placeholder="0.00" fullWidth value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{ p: 2.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>Is for Rent</Typography>
                                        <Switch checked={isRent} onChange={(e) => setIsRent(e.target.checked)} color="primary" />
                                    </Box>
                                    <Box sx={{ opacity: isRent ? 1 : 0.4, pointerEvents: isRent ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>Daily Rent Price (USD)</Typography>
                                        <Box sx={{ ...inputContainerStyle, px: 2, py: 0.5 }}>
                                            <InputBase type="number" startAdornment={<InputAdornment position="start">$</InputAdornment>} placeholder="0.00" fullWidth value={rentPrice} onChange={(e) => setRentPrice(e.target.value)} />
                                        </Box>
                                    </Box>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {currentView === 1 && dummyProducts && dummyProducts.data && (
                isMobile ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {dummyProducts.data.map((product) => (
                            <Paper
                                key={product.id}
                                variant="outlined"
                                sx={{ p: 2.5, borderRadius: 3, cursor: 'pointer', transition: '0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: theme.shadows[2] } }}
                                onClick={() => handleRowClick(product)}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar src={getMediaUrl(product.avatar[0] || product.image)} variant="rounded" sx={{ width: 64, height: 64, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                                        <Inventory2Outlined sx={{ color: 'text.secondary' }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>{product.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{product.category}</Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    {getConditionChip(product.condition)}
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                        <Box component="span" sx={{ color: 'text.primary', fontSize: '1rem' }}>{product.stock}</Box> in stock
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }} onClick={(e) => e.stopPropagation()}>
                                    <Stack spacing={1.5}>
                                        {product.audioUrl && product.audio !== 'null' && (
                                            <audio src={getMediaUrl(product.audioUrl || product.audio)} controls style={{ width: '100%', height: '35px', borderRadius: '8px' }} />
                                        )}
                                        {product.videoUrl && product.videoUrl !== 'null' && (
                                            <video src={getMediaUrl(product.videoUrl || product.video)} controls style={{ width: '100%', maxHeight: '150px', borderRadius: '8px', backgroundColor: '#000' }} />
                                        )}
                                        {(!product.audioUrl || product.audioUrl === 'null') && (!product.videoUrl || product.videoUrl === 'null') && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 1, bgcolor: 'background.default', borderRadius: 1 }}>No Media Included</Typography>
                                        )}
                                    </Stack>
                                </Box>

                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                    {product.isSale && (
                                        <Chip icon={<SellOutlined fontSize="small" />} label={`Sale: $${product.salePrice}`} size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 600, borderRadius: '6px' }} />
                                    )}
                                    {product.isRent && (
                                        <Chip icon={<EventAvailableOutlined fontSize="small" />} label={`Rent: $${product.rentPrice} / day`} size="small" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main', fontWeight: 600, borderRadius: '6px' }} />
                                    )}
                                </Stack>
                            </Paper>
                        ))}
                    </Box>
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '20px', overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 900 }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 2 }}>Product Details</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Media (Audio/Video)</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Condition</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Stock</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Availability & Pricing</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dummyProducts.data.map((product) => (
                                    <TableRow
                                        key={product.id}
                                        onClick={() => handleRowClick(product)}
                                        sx={{
                                            cursor: 'pointer',
                                            '&:last-child td, &:last-child th': { border: 0 },
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar src={getMediaUrl(product.avatar[0] || product.image)} variant="rounded" sx={{ width: 56, height: 56, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                                                    <Inventory2Outlined sx={{ color: 'text.secondary' }} />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{product.title}</Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {product.category}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>

                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Stack spacing={1}>
                                                {product.audioUrl && product.audio !== 'null' && (
                                                    <audio src={getMediaUrl(product.audioUrl || product.audio)} controls style={{ height: '30px', width: '180px', maxWidth: '100%' }} />
                                                )}
                                                {product.videoUrl && product.videoUrl !== 'null' && (
                                                    <video src={getMediaUrl(product.videoUrl || product.video)} controls style={{ height: '60px', width: '180px', maxWidth: '100%', borderRadius: '8px', backgroundColor: '#000' }} />
                                                )}
                                                {(!product.audioUrl || product.audioUrl === 'null') && (!product.videoUrl || product.videoUrl === 'null') && (
                                                    <Typography variant="body2" color="text.secondary">No Media</Typography>
                                                )}
                                            </Stack>
                                        </TableCell>

                                        <TableCell>{getConditionChip(product.condition)}</TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{product.stock} in stock</Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Stack spacing={1} alignItems="flex-start">
                                                {product.isSale && (
                                                    <Chip icon={<SellOutlined fontSize="small" />} label={`Sale: $${product.salePrice}`} size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 600, borderRadius: '6px' }} />
                                                )}
                                                {product.isRent && (
                                                    <Chip icon={<EventAvailableOutlined fontSize="small" />} label={`Rent: $${product.rentPrice} / day`} size="small" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main', fontWeight: 600, borderRadius: '6px' }} />
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )
            )}

            <Dialog
                open={openImageDialog}
                onClose={handleCloseImageDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', m: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                        Product Images
                    </Typography>
                    <IconButton onClick={handleCloseImageDialog} sx={{ color: 'text.secondary' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Grid container spacing={2} justifyContent="center">
                        {selectedProduct &&
                            [selectedProduct.avatar[0] || selectedProduct.image, selectedProduct.avatar[1] || selectedProduct.image2, selectedProduct.avatar[2] || selectedProduct.image3]
                                .filter(img => img && img !== 'null')
                                .map((imgUrl, index) => (
                                    <Grid item xs={12} sm={4} key={index}>
                                        <Box
                                            component="img"
                                            src={getMediaUrl(imgUrl)}
                                            alt={`Product Image ${index + 1}`}
                                            sx={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px', border: '1px solid', borderColor: 'divider', boxShadow: theme.shadows[2] }}
                                        />
                                    </Grid>
                                ))
                        }

                        {selectedProduct &&
                            ![selectedProduct.image1 || selectedProduct.image, selectedProduct.image2, selectedProduct.image3]
                                .some(img => img && img !== 'null') && (
                                <Box sx={{ p: 4, textAlign: 'center', width: '100%' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No images available for this product.
                                    </Typography>
                                </Box>
                            )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, md: 3 }, pt: 0 }}>
                    <Button onClick={handleCloseImageDialog} variant="contained" fullWidth={isMobile} sx={{ borderRadius: '8px', boxShadow: 'none' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', boxShadow: theme.shadows[3], borderRadius: '12px' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </Box>
    );
};

export default OurPro;