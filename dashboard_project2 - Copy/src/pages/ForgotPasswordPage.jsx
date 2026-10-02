import React, { useState } from 'react';
import IP from './IP.js';

import {
    Box,
    Typography,
    TextField,
    Button,
    InputAdornment,
    Link,
    Alert,
    CircularProgress
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from "react-router-dom";
const API_BASE_URL = `${IP}/api`; 

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const textFieldStyles = {
        '& .MuiOutlinedInput-root': {
            color: '#fff',
            borderRadius: '8px',
            '& fieldset': { borderColor: '#334155' },
            '&:hover fieldset': { borderColor: '#475569' },
            '&.Mui-focused fieldset': { borderColor: '#818cf8' },
        },
        '& .MuiInputLabel-root': { color: '#94a3b8' },
        '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${IP}/password/forget`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                setStep(2);
            } else {
                setError(data.message || 'حدث خطأ أثناء إرسال البريد');
            }
        } catch (err) {
            setError('خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (code.length !== 4) {
            setError('الكود يجب أن يتكون من 4 أرقام');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${IP}/password/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email, key: code })
            });
            const data = await response.json();
            if (response.ok) {
                setStep(3);
            } else {
                setError(data.message || 'الكود غير صحيح');
            }
        } catch (err) {
            setError('خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password.length < 8) {
            setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${IP}/password/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    password, 
                })
            });
            const data = await response.json();
            if (response.ok) {
                setStep(4);
            } else {
                setError(data.message || 'حدث خطأ أثناء تغيير كلمة المرور');
            }
        } catch (err) {
            setError('خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Box sx={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 3 }}>
                
                {error && <Alert severity="error">{error}</Alert>}

                {step === 1 && (
                    <Box component="form" onSubmit={handleSendEmail} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" color="#fff" mb={1}>
                                Forgot Password?
                            </Typography>
                            <Typography variant="body1" color="#94a3b8">
                                No worries, we'll send you a 4-digit reset code. Please enter your email.
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            label="Enter your email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={textFieldStyles}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlinedIcon sx={{ color: '#94a3b8' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ py: 1.5, bgcolor: '#818cf8', '&:hover': { bgcolor: '#6366f1' } }}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Code'}
                        </Button>
                    </Box>
                )}

                {step === 2 && (
                    <Box component="form" onSubmit={handleVerifyCode} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" color="#fff" mb={1}>
                                Enter Code
                            </Typography>
                            <Typography variant="body1" color="#94a3b8">
                                We sent a 4-digit code to <b>{email}</b>
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            label="4-Digit Code"
                            type="text"
                            required
                            inputProps={{ maxLength: 4, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' } }}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                            sx={textFieldStyles}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <VpnKeyOutlinedIcon sx={{ color: '#94a3b8' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button type="submit"  fullWidth variant="contained" disabled={loading || code.length !== 4} sx={{ py: 1.5, bgcolor: '#818cf8', '&:hover': { bgcolor: '#6366f1' } }}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
                        </Button>
                    </Box>
                )}

                {step === 3 && (
                    <Box component="form" onSubmit={handleResetPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" color="#fff" mb={1}>
                                New Password
                            </Typography>
                            <Typography variant="body1" color="#94a3b8">
                                Create a new strong password.
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            label="New Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={textFieldStyles}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment>
                                ),
                            }}
                        />
                       
                        <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ py: 1.5, bgcolor: '#818cf8', '&:hover': { bgcolor: '#6366f1' } }}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                        </Button>
                    </Box>
                )}

                {step === 4 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#4ade80', mb: 2 }} />
                        <Typography variant="h5" fontWeight="bold" color="#fff" mb={1}>
                            Password Reset!
                        </Typography>
                        <Typography variant="body1" color="#94a3b8" mb={4}>
                            Your password has been successfully changed.
                        </Typography>
                        <Button onClick={() => navigate('/dashboard')} fullWidth variant="contained" sx={{ py: 1.5, bgcolor: '#818cf8', '&:hover': { bgcolor: '#6366f1' } }}>
                            Go to Dashboard
                        </Button>
                    </Box>
                )}

                {step !== 4 && (
                    <Box sx={{ cursor: 'pointer', textAlign: 'center', mt: 2 }}>
                        <Link
                            onClick={() => {
                                if (step > 1) setStep(step - 1);
                                else navigate('/login');
                            }}
                            sx={{
                                display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#94a3b8',
                                textDecoration: 'none', transition: 'color 0.2s', '&:hover': { color: '#fff' }
                            }}
                        >
                            <ArrowBackIcon fontSize="small" />
                            {step > 1 ? 'Back' : 'Back to log in'}
                        </Link>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ForgotPasswordPage;
