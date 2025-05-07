// src/app/auth/login/page.tsx
'use client';

import React, { useState, FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  Link as MuiLink,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff,
  EmailOutlined as EmailIcon,
  LockOutlined as PasswordIcon,
} from '@mui/icons-material';
import { authApi } from '../../../utils/api/auth';

function LoginFormComponent() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- State Variables ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- Error States for Validation ---
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // --- Check for success message from signup ---
  useEffect(() => {
    const signupStatus = searchParams.get('signup');
    if (signupStatus === 'success') {
      setSuccessMessage('Signup successful! Please sign in.');
    }
  }, [searchParams]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault();

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setError(null);
    setSuccessMessage(null);

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email address is invalid');
      isValid = false;
    }
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await authApi.login({ email, password });
      console.log('Login success:', res);
      // Optionally handle rememberMe: store token in cookie/localStorage accordingly
      router.push('/lab-station');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message.includes('429')) {
        setError('คุณลองเข้าสู่ระบบบ่อยเกินไป โปรดรอสักครู่ แล้วลองใหม่อีกครั้ง');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Sign In
        </Typography>
        {successMessage && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{successMessage}</Alert>}
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError}
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color={emailError ? 'error' : 'action'} /></InputAdornment> }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            InputProps={{
              startAdornment: <InputAdornment position="start"><PasswordIcon color={passwordError ? 'error' : 'action'} /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" color={passwordError ? 'error' : 'inherit'}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
            }}
          />
          <Grid container alignItems="center" justifyContent="space-between" sx={{ mt: 1, mb: 1 }}>
            <FormControlLabel
              control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />}
              label={<Typography variant="body2">Remember me</Typography>}
            />
            <MuiLink component={Link} href="/auth/forgot-password" variant="body2">Forgot password?</MuiLink>
          </Grid>
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, mb: 2 }} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
          <Grid container justifyContent="flex-end">
            <MuiLink component={Link} href="/auth/signup" variant="body2">Don't have an account? Sign Up</MuiLink>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginFormComponent />
    </Suspense>
  );
}

function LoadingSpinner() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}