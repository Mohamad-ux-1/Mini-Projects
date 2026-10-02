import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useTheme,
    Snackbar,
    Alert,
    CircularProgress
} from "@mui/material";
import CameraAlt from '@mui/icons-material/CameraAlt';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import React, { useState, useEffect } from "react";
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import IP from './IP.js';

const Settings = () => {
    const theme = useTheme();

    const getStoredUserData = () => {
        try {
            const storedData = localStorage.getItem('userData');
            return storedData ? JSON.parse(storedData) : {};
        } catch (error) {
            console.error("Error parsing userData from localStorage", error);
            return {};
        }
    };

    const [userData, setUserData] = useState(getStoredUserData());

    const [displayDialog, setDisplayDialog] = useState(false);
    const [displayEmai, setDisplayEmai] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [firstName, setFirstName] = useState(() => {
        return userData.name ? userData.name.split(' ')[0] : '';
    });
    const [lastName, setLastName] = useState(() => {
        return userData.name ? userData.name.split(' ').slice(1).join(' ') : '';
    });
    const [email, setEmail] = useState(userData.email || '');
    const [selectedImage, setSelectedImage] = useState(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSaveAllChanges = async () => {
        const token = localStorage.getItem('token');
        let isProfileUpdated = false;
        let isPasswordUpdated = false;

        setLoading(true);

        try {
            const fullName = `${firstName} ${lastName}`.trim();
            
            if (fullName !== userData.name || email !== userData.email || selectedImage) {
                const formData = new FormData();
                
                if (fullName) formData.append('name', fullName);
                if (email) formData.append('email', email);
                if (selectedImage) formData.append('image', selectedImage);

                formData.append('_method', 'PUT');

                const profileRes = await fetch(`${IP}/api/profile/update`, {
                    method: 'POST', 
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                    body: formData
                });

                const profileData = await profileRes.json();
                if (!profileRes.ok) throw new Error(profileData.message || 'حدث خطأ في تحديث البيانات الشخصية');
                
                isProfileUpdated = true;

                const updatedUserData = { ...userData };
                if (fullName) updatedUserData.name = fullName;
                if (email) updatedUserData.email = email;
                
                localStorage.setItem('userData', JSON.stringify(updatedUserData));
                setUserData(updatedUserData);
            }

            if (currentPassword && newPassword) {
                const passRes = await fetch(`${IP}/api/password/change`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        old_password: currentPassword,
                        new_password: newPassword
                    })
                });

                const passData = await passRes.json();
                if (!passRes.ok) throw new Error(passData.message || 'كلمة المرور القديمة غير صحيحة');
                
                isPasswordUpdated = true;
                setCurrentPassword('');
                setNewPassword('');
            }

            if (isProfileUpdated && isPasswordUpdated) {
                showMessage('تم تحديث البيانات الشخصية وكلمة المرور بنجاح!', 'success');
            } else if (isProfileUpdated) {
                showMessage('تم تحديث البيانات الشخصية بنجاح!', 'success');
            } else if (isPasswordUpdated) {
                showMessage('تم تحديث كلمة المرور بنجاح!', 'success');
            } else {
                showMessage('لم تقم بإدخال أي تعديلات للحفظ.', 'info');
            }

        } catch (error) {
            console.error(error);
            showMessage(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f9fafb',
            borderRadius: '8px',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': { border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}` },
            '&:hover fieldset': { border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db'}` },
            '&.Mui-focused fieldset': { border: `2px solid ${!displayEmai ? theme.palette.primary.main : 'red'}` },
        },
        '& input': { padding: '12px 16px', fontSize: '14px', color: theme.palette.text.primary }
    };

    const labelStyles = { fontSize: '11px', fontWeight: 700, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };
    const paperStyle = { px: 3, py: 3, mb: 3, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : 'background.paper', backgroundImage: 'none' };

    return (
        <Box sx={{ width: '100%', maxWidth: '900px', mx: 'auto', pb: 6 }}>
            <Box sx={{ display: 'flex', gap: 3, mb: 3, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }} />

            <Box
                sx={{
                    borderRadius: 1, width: '100%', height: 220, position: 'relative',
                    backgroundImage: 'linear-gradient(to top, #0b1120 9%, rgba(11, 17, 32, 0.9) 25%, rgba(11, 17, 32, 0.4) 70%, transparent 100%), url(https://lh3.googleusercontent.com/aida-public/AB6AXuD8XzRMfCxCG5StHwUzTXyNlnigLMKf2HdRFhwGD5m_4yoTZgQTtKN_u0iycz9U8KqBnO-tYCVqdOzPZlkX-fU3_Xlje18wFlefGOSNVn8Dt502m-RrhN-VVwgkyCqsigt5czHwkI9e4jLOHEyiJ7m0GvNIBsqgdn8ErgqWzBRN5dTjO8RPvXdWoBfwQvX4BDdqeSlTmjaQ6eyq7uMZ89pS3utUfckyL_wmZq0LGkJwVjr7IOevSB9uYTlVcIiOVSMEMQxg8RnnAo0) ',
                    backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundAttachment: 'fixed',
                }}
            />

            <Box sx={{ pl: { xs: 4, md: 8 }, display: 'flex', gap: 2.5, mt: -6, alignItems: 'flex-end', mb: 5 }}>
                <Box sx={{ position: 'relative', p: 0.5, backgroundColor: theme.palette.mode === 'dark' ? '#121212' : 'white', borderRadius: 2 }}>
                    <Avatar 
                        sx={{ width: 100, height: 100, borderRadius: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                    />
                    {/*<Tooltip title="Upload new picture" placement="top">*/}
                    {/*    <IconButton*/}
                    {/*        onClick={() => { setDisplayDialog(true) }}*/}
                    {/*        size="small"*/}
                    {/*        sx={{*/}
                    {/*            position: 'absolute', bottom: -4, right: -4, bgcolor: theme.palette.background.paper,*/}
                    {/*            border: `1px solid ${theme.palette.divider}`, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',*/}
                    {/*            '&:hover': { bgcolor: theme.palette.action.hover }*/}
                    {/*        }}*/}
                    {/*    >*/}
                    {/*        /!*<PhotoCamera fontSize="small" sx={{ color: 'text.secondary' }} />*!/*/}
                    {/*    </IconButton>*/}
                    {/*</Tooltip>*/}
                </Box>
                <Box sx={{ pb: 1, zIndex: 10 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        {userData.name || 'User Name'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        System Administrator
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ width: '100%', px: { xs: 2, md: 8 } }}>
                <Stack spacing={2}>
                    <Paper sx={paperStyle}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                Personal Information
                            </Typography>
                            <PersonOutlineOutlinedIcon sx={{ color: '#3b82f6' }} />
                        </Box>

                        <Stack spacing={3} direction="column">
                            <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                                <Box sx={{ flex: 1, minWidth: '200px' }}>
                                    <Typography sx={labelStyles}>First Name</Typography>
                                    <TextField 
                                        fullWidth 
                                        sx={inputStyle} 
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: '200px' }}>
                                    <Typography sx={labelStyles}>Last Name</Typography>
                                    <TextField 
                                        fullWidth 
                                        sx={inputStyle} 
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </Box>
                            </Box>

                            <Box>
                                {/* تم إصلاح الخطأ هنا بفصل حقل الـ TextField عن الـ Typography */}
                                <Typography sx={labelStyles}>Email Address</Typography>
                                <TextField
                                    error={displayEmai}
                                    helperText={displayEmai ? "Please enter a valid email address" : ""}
                                    fullWidth 
                                    sx={inputStyle}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (!e.target.value.includes('@') && e.target.value !== '') {
                                            setDisplayEmai(true)
                                        } else {
                                            setDisplayEmai(false)
                                        }
                                    }}
                                />
                            </Box>
                        </Stack>
                    </Paper>

                    <Paper sx={paperStyle}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                Security
                            </Typography>
                            <SecurityOutlinedIcon sx={{ color: '#ef4444' }} />
                        </Box>

                        <Stack spacing={3} direction="column">
                            <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                                <Box sx={{ flex: 1, minWidth: '200px' }}>
                                    <Typography sx={labelStyles}>Current Password</Typography>
                                    <TextField 
                                        fullWidth 
                                        type="password" 
                                        sx={inputStyle} 
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: '200px' }}>
                                    <Typography sx={labelStyles}>New Password</Typography>
                                    <TextField 
                                        fullWidth 
                                        type="password" 
                                        sx={inputStyle} 
                                        placeholder="Min. 8 characters" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </Box>
                            </Box>
                        </Stack>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaveAllChanges}
                            disabled={loading || displayEmai}
                            sx={{
                                py: 1.5, px: 4, minWidth: '200px', borderRadius: 1,
                                textTransform: 'none', fontWeight: 600, fontSize: '16px',
                            }}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save All Changes'}
                        </Button>
                    </Box>
                </Stack>
            </Box>

            <Dialog open={displayDialog} onClose={() => { setDisplayDialog(false) }} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: 'text.primary', textAlign: 'center' }}>
                    Update Profile Picture
                </DialogTitle>
                <DialogContent>
                    <Box sx={{
                        border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3, mt: 1,
                        display: 'flex', gap: 2, flexDirection: 'column', textAlign: 'center', bgcolor: 'background.paper'
                    }}>
                        <Typography variant="subtitle2" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'text.secondary', mb: 2, fontWeight: 600 }}>
                            Upload New Photo <CameraAlt sx={{ ml: 2 }} />
                        </Typography>
                        <Button component="label" variant="outlined" sx={{ borderRadius: 2 }}>
                            Select A Photo
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => {
                                    if(e.target.files[0]) {
                                        setSelectedImage(e.target.files[0]);
                                    }
                                }}
                            />
                        </Button>
                        {selectedImage && (
                            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                تم اختيار: {selectedImage.name}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ pb: 3, px: 3 }}>
                    <Button fullWidth variant='contained' onClick={() => { setDisplayDialog(false) }} sx={{ borderRadius: 2 }}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%', boxShadow: theme.shadows[3], borderRadius: '12px' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </Box>
    );
}

export default Settings;