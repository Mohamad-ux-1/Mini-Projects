import React, { useState } from 'react';
import IP from './IP.js';
import {
    Box, Typography, Paper, Button, IconButton, Checkbox, FormControlLabel, Link, TextField, Stack, Fade, useTheme, Slide, Snackbar, Alert
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useNavigate } from "react-router-dom";

const CreateAccount = ({ mode, toggleTheme }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [messageDisplay, setMessageDisplay] = useState(false);
    const [messageSuccess, setMessageSuccess] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [data, setData] = useState({});
    const [emailError, setEmailError] = useState(false);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const isDark = mode === 'dark';

    const colors = {
        bg: isDark ? '#0a0a0a' : '#f9fafb',
        cardBg: isDark ? '#121212' : '#ffffff',
        textPrimary: isDark ? '#f1f5f9' : '#111313',
        textSecondary: isDark ? '#94a3b8' : '#64748b',
        accent: '#2563eb',
        border: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'
    };

    const handleEmail = (e) => {
        const val = e.target.value;
        setEmail(val);
        setEmailError(!val.endsWith('@gmail.com') && val.length > 0);
    };

    const handleSubmit = async () => {
        try {
            let response = await fetch(`${IP}/api/admin/register`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    name: fullName,
                    email: email,
                    password: password,
                    password_confirmation: confirmPassword
                })
            });
            let d = await response.json();

            if (response.status === 201) {
                setFullName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setIsAdmin(false);

                setMessageSuccess(true);

                setTimeout(() => {
                    setMessageSuccess(false);
                    navigate('/login');
                }, 2000);

            } else {
                setData(d);
                setMessageDisplay(true);
            }
        } catch (err) {
            console.error(err);
            setData({ message: "Network error occurred." });
            setMessageDisplay(true);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.bg, overflow: 'hidden' }}>

            <Box sx={{
                flex: { xs: '100%', md: '0 0 50%' },
                display: 'flex',
                flexDirection: 'column',
                px: { xs: 2, sm: 4, md: 8 },
                py: { xs: 3, md: 4 },
                position: 'relative',
                zIndex: 2,
                bgcolor: colors.bg,

            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <AutoFixHighOutlinedIcon sx={{ color: colors.accent, fontSize: 32 }} />
                    </Box>
                    <IconButton onClick={toggleTheme} sx={{ color: colors.textSecondary, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                        {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
                    </IconButton>
                </Box>

                <Box sx={{
                    flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                }}>
                    <Slide direction="up" in={true} timeout={600}>
                        <Fade in={true} timeout={800}>
                            <Paper
                                elevation={isDark ? 0 : 3}
                                sx={{
                                    width: '100%',
                                    maxWidth: 440,
                                    p: { xs: 3, sm: 5 },
                                    bgcolor: colors.cardBg,
                                    borderRadius: 3,
                                    border: `1px solid ${colors.border}`,
                                    boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 10px 40px rgba(0,0,0,0.05)'
                                }}>
                                <Typography variant="h4" sx={{
                                    color: colors.textPrimary,
                                    fontWeight: 800,
                                    textAlign: 'center',
                                    mb: 1,
                                    fontSize: { xs: '1.75rem', sm: '2.125rem' }
                                }}>
                                    Create Account
                                </Typography>
                                <Typography sx={{ color: colors.textSecondary, textAlign: 'center', mb: 4, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                                    Set up your architectural data suite access.
                                </Typography>

                                <Stack spacing={2.5}>
                                    <TextField
                                        fullWidth
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Full Name"
                                        InputProps={{
                                            startAdornment: <PersonOutlineOutlinedIcon sx={{ color: 'text.secondary', mr: 1.5 }} />,
                                            sx: { borderRadius: 2 }
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        value={email}
                                        onChange={handleEmail}
                                        placeholder="Email address"
                                        helperText={emailError ? "Please enter a valid @gmail.com address" : ""}
                                        error={emailError}
                                        type="email"
                                        InputProps={{
                                            startAdornment: <EmailOutlinedIcon sx={{ color: 'text.secondary', mr: 1.5 }} />,
                                            sx: { borderRadius: 2 }
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        value={password}
                                        type='password'
                                        placeholder="Password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        InputProps={{
                                            startAdornment: <LockOutlinedIcon sx={{ color: 'text.secondary', mr: 1.5 }} />,
                                            sx: { borderRadius: 2 }
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        value={confirmPassword}
                                        type="password"
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm password"
                                        InputProps={{
                                            startAdornment: <LockResetIcon sx={{ color: 'text.secondary', mr: 1.5 }} />,
                                            sx: { borderRadius: 2 }
                                        }}
                                    />

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={isAdmin}
                                                onChange={(e) => setIsAdmin(e.target.checked)}
                                                sx={{ color: colors.textSecondary, '&.Mui-checked': { color: colors.accent } }}
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AdminPanelSettingsOutlinedIcon sx={{ color: isAdmin ? colors.accent : colors.textSecondary, fontSize: 20 }} />
                                                <Typography sx={{
                                                    color: isAdmin ? colors.textPrimary : colors.textSecondary,
                                                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                                    fontWeight: isAdmin ? 600 : 500
                                                }}>
                                                    Request Administrator Privileges
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{ ml: 0, mt: 1 }}
                                    />

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        disabled={!isAdmin || emailError || !fullName || !password}
                                        endIcon={<ArrowForwardIcon />}
                                        onClick={handleSubmit}
                                        sx={{
                                            bgcolor: colors.accent,
                                            color: '#fff',
                                            py: 1.5,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '1.05rem',
                                            boxShadow: 'none',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                bgcolor: '#1d4ed8',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)'
                                            },
                                            '&.Mui-disabled': {
                                                bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                color: colors.textSecondary
                                            }
                                        }}
                                    >
                                        Create Account
                                    </Button>
                                </Stack>

                                <Typography sx={{ textAlign: 'center', mt: 4, color: colors.textSecondary, fontSize: '0.9rem' }}>
                                    Already have an account?{' '}
                                    <Link onClick={() => navigate("/login")} underline='hover' sx={{ cursor: 'pointer', color: colors.accent, fontWeight: 700 }}>
                                        Log in
                                    </Link>
                                </Typography>
                            </Paper>
                        </Fade>
                    </Slide>
                </Box>
            </Box>

            <Box sx={{
                flex: { xs: 0, md: '0 0 50%' },
                display: { xs: 'none', md: 'block' },
                position: 'relative',
                zIndex: 1,
                mx:-0.1,
                backgroundImage: isDark
                    ? `linear-gradient(to right, ${colors.bg} 0%, rgba(10, 10, 10, 0.4) 70%, rgba(10, 10, 10, 0) 100%), url(/img2.jpg)`
                    : `linear-gradient(to right, ${colors.bg} 0%, rgba(255, 255, 255, 0.4) 70%, rgba(255, 255, 255, 0) 100%), url('/img1.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: isDark ? 'inset 20px 0 50px rgba(10,10,10,0.5)' : 'inset 20px 0 50px rgba(249,250,251,0.5)'
            }} />

            <Snackbar
                open={messageDisplay}
                autoHideDuration={4000}
                onClose={() => setMessageDisplay(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setMessageDisplay(false)} severity="error" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
                    {data.message || 'Invalid registration details!'}
                </Alert>
            </Snackbar>

            <Snackbar
                open={messageSuccess}
                autoHideDuration={4000}
                onClose={() => setMessageSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setMessageSuccess(false)} severity="success" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
                    Account created successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CreateAccount;
