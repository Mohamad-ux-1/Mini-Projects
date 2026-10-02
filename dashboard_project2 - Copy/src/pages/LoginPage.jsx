import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Checkbox,
    FormControlLabel,
    Link,
    Fade,
    useTheme,
    Paper,
    Snackbar,
    Alert,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import IP from './IP.js';

const LoginPage = ({ mode, toggleTheme }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const url = `${IP}`;

    const [emailInput, setEmailInput] = useState('');
    const [password, setPassword] = useState('');
    const [specialCode, setSpecialCode] = useState('');
    const [isRemember, setIsRemember] = useState(false);

    const [display, setDisplay] = useState(false);
    const [messageDisplay, setMessageDisplay] = useState(false);
    const [displayKey, setDisplayKey] = useState(false);
    const [data, setData] = useState({});

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handlePassword = (e) => setPassword(e.target.value);
    const handleSpecialCode = (e) => setSpecialCode(e.target.value);

    const handleEmailInput = (e) => {
        const value = e.target.value;
        if (value.length > 0 && !value.endsWith('@gmail.com')) {
            setDisplay(true);
        } else {
            setDisplay(false);
        }
        setEmailInput(value);
    };

    const sendData = async () => {
        setIsLoading(true);
        try {
            if (!displayKey) {
                const response = await fetch(`${IP}/api/admin/login1`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: emailInput, password: password })
                });
                const d = await response.json();

                if (response.status === 200) {
                    setDisplayKey(true);
                } else {
                    setData(d);
                    setMessageDisplay(true);
                }
            } else {
                const response = await fetch(`${url}/api/admin/login2`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: emailInput, key: specialCode })
                });
                const responseData = await response.json();

                if (response.status === 200) {
                    setData(responseData);
                    const storage = isRemember ? localStorage : sessionStorage;
                    storage.setItem('isAuthenticated', 'true');
                    storage.setItem('userData', JSON.stringify(responseData.user));
                    storage.setItem('token', responseData.token);

                    navigate('/dashboard', { replace: true });
                } else {
                    setData(responseData);
                    setMessageDisplay(true);
                    setDisplayKey(false);
                }
            }
        } catch (err) {
            console.error(err);
            setData({ message: "Network error occurred. Please try again." });
            setMessageDisplay(true);
        } finally {
            setIsLoading(false);
        }
    };

    const isDark = mode === 'dark';
    const colors = {
        bg: isDark ? '#09090b' : '#f8fafc',
        cardBg: isDark ? '#09090b' : '#ffffff',
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
                px: { xs: 2, sm: 4, md: '12%' },
                backgroundImage: isDark
                    ? `linear-gradient(to right, ${colors.bg} 20%, rgba(9, 9, 11, 0.7) 60%, rgba(9, 9, 11, 0.2) 100%), url(/img2.jpg)`
                    : `linear-gradient(to right, ${colors.bg} 20%, rgba(255, 255, 255, 0.8) 60%, rgba(255, 255, 255, 0.3) 100%), url('/img1.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
            }}
        >
            <IconButton
                onClick={toggleTheme}
                sx={{
                    position: 'absolute',
                    top: { xs: 20, md: 40 },
                    left: { xs: 20, md: 40 },
                    bgcolor: isDark ? alpha('#ffffff', 0.05) : alpha('#000000', 0.04),
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${isDark ? alpha('#ffffff', 0.1) : alpha('#000000', 0.05)}`,
                    p: 1.5,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        bgcolor: isDark ? alpha('#ffffff', 0.1) : alpha('#000000', 0.08),
                        transform: 'rotate(15deg)'
                    }
                }}
            >
                {isDark ? <LightModeOutlinedIcon color="primary" /> : <DarkModeOutlinedIcon color="primary" />}
            </IconButton>

            <Fade in={true} timeout={1000}>
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        maxWidth: 440,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3.5,
                        zIndex: 1,
                        bgcolor: isDark ? alpha(colors.cardBg, 0.5) : alpha(colors.cardBg, 0.5),
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        p: { xs: 3.5, sm: 5 },
                        borderRadius: '28px',
                        border: `1px solid ${isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
                        boxShadow: isDark
                            ? '0 24px 48px -12px rgba(0,0,0,0.5)'
                            : '0 24px 48px -12px rgba(15,23,42,0.1)',
                        animation: 'smoothEntry 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        '@keyframes smoothEntry': {
                            '0%': { transform: 'scale(0.95) translateY(20px)', opacity: 0 },
                            '100%': { transform: 'scale(1) translateY(0)', opacity: 1 }
                        }
                    }}
                >
                    <Box sx={{ position: 'relative', height: { xs: '85px', sm: '80px' } }}>
                        <Box sx={{
                            position: 'absolute', width: '100%',
                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: displayKey ? 'translateY(-20px)' : 'translateY(0)',
                            opacity: displayKey ? 0 : 1,
                            pointerEvents: displayKey ? 'none' : 'auto'
                        }}>
                            <Typography variant="h4" fontWeight="800" color="text.primary" mb={1} sx={{ letterSpacing: '-0.5px' }}>
                                Welcome Back
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                                Enter your credentials to access the dashboard.
                            </Typography>
                        </Box>

                        <Box sx={{
                            position: 'absolute', width: '100%',
                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: !displayKey ? 'translateY(20px)' : 'translateY(0)',
                            opacity: !displayKey ? 0 : 1,
                            pointerEvents: !displayKey ? 'none' : 'auto'
                        }}>
                            <Typography variant="h4" fontWeight="800" color="text.primary" mb={1} sx={{ letterSpacing: '-0.5px' }}>
                                Security Key
                            </Typography>
                            <Typography variant="body2" color="primary.main" fontWeight="600" sx={{ fontSize: '0.95rem' }}>
                                We've sent a 4-digit key to your email.
                            </Typography>
                        </Box>
                    </Box>

                    <Box component="form" sx={{ overflow: 'hidden', width: '100%', mx: '-4px', px: '4px' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                width: '200%',
                                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: displayKey ? 'translateX(-50%)' : 'translateX(0)',
                            }}
                        >
                            <Box sx={{ width: '50%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2.5, pr: { xs: 1, sm: 2 } }}>
                                <TextField
                                    fullWidth
                                    placeholder="admin@gmail.com"
                                    variant="outlined"
                                    helperText={display ? "Please enter a valid @gmail.com address" : ""}
                                    error={display}
                                    onChange={handleEmailInput}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: '16px', bgcolor: isDark ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02) }
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    placeholder="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    variant="outlined"
                                    onChange={handlePassword}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                                    {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: '16px', bgcolor: isDark ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02) }
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: -1 }}>
                                    <FormControlLabel
                                        control={<Checkbox checked={isRemember} onChange={(e) => setIsRemember(e.target.checked)} size="small" color="primary" sx={{ borderRadius: 2 }} />}
                                        label={<Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>Remember me</Typography>}
                                        sx={{ margin: 0 }}
                                    />
                                    <Link
                                        onClick={() => navigate('/forgetpassword')}
                                        sx={{ cursor: 'pointer', fontSize: '0.875rem' }}
                                        color="primary" underline="hover" fontWeight="600"
                                    >
                                        Forgot password?
                                    </Link>
                                </Box>
                            </Box>

                            <Box sx={{ width: '50%', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', pl: { xs: 1, sm: 2 } }}>
                                <TextField
                                    fullWidth
                                    type="text"
                                    onChange={handleSpecialCode}
                                    placeholder="• • • • • •"
                                    inputProps={{ maxLength: 6 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <VpnKeyOutlinedIcon sx={{ color: 'primary.main', fontSize: 24, ml: 1 }} />
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: '16px',
                                            bgcolor: isDark ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02)
                                        }
                                    }}
                                    sx={{
                                        '& input': {
                                            textAlign: 'center',
                                            letterSpacing: '1rem',
                                            fontSize: '1.75rem',
                                            fontWeight: '800',
                                            py: 2,
                                            color: 'text.primary'
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={display || isLoading || (!displayKey && (!emailInput || !password)) || (displayKey && specialCode.length < 4)}
                        sx={{
                            py: 1.6,
                            mt: 1,
                            textTransform: 'none',
                            fontSize: '1.05rem',
                            fontWeight: '700',
                            borderRadius: '14px',
                            boxShadow: isDark ? '0 8px 20px -6px rgba(0,0,0,0.8)' : '0 8px 20px -6px rgba(37, 99, 235, 0.4)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: isDark ? '0 12px 25px -6px rgba(0,0,0,0.9)' : '0 12px 25px -6px rgba(37, 99, 235, 0.6)',
                            },
                            '&:disabled': {
                                bgcolor: isDark ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1),
                                color: isDark ? alpha('#ffffff', 0.3) : alpha('#000000', 0.3),
                            }
                        }}
                        onClick={sendData}
                    >
                        {isLoading ? (
                            <CircularProgress size={26} color="inherit" thickness={4} />
                        ) : (
                            !displayKey ? 'Sign In' : 'Verify & Continue'
                        )}
                    </Button>

                    <Box sx={{
                        opacity: displayKey ? 0 : 1,
                        transition: 'opacity 0.4s ease',
                        pointerEvents: displayKey ? 'none' : 'auto',
                        textAlign: 'center',
                        mt: -1
                    }}>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                            Don't have an account?{' '}
                            <Link
                                onClick={() => navigate("/create-admin-account")}
                                sx={{ cursor: 'pointer' }}
                                color="primary" underline="hover" fontWeight="700">
                                Sign up for free
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Fade>

            <Snackbar
                open={messageDisplay}
                autoHideDuration={5000}
                onClose={() => setMessageDisplay(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setMessageDisplay(false)}
                    severity="error"
                    variant="filled"
                    sx={{
                        width: '100%',
                        borderRadius: '14px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        fontWeight: '600'
                    }}
                >
                    {data.message || 'Invalid credentials. Please try again.'}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LoginPage;
