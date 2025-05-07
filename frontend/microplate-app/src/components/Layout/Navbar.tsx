// src/components/layout/Navbar.tsx
'use client';

import React, { useState, MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Stack,
  ListItemIcon,
  ListItemText,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as AccountIcon,
  LogoutOutlined as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';

// Consistent drawerWidth with Sidebar
const drawerWidth = 240;

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const theme = useTheme();
  const router = useRouter();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  // --- Simulated Auth State ---
  const isAuthenticated = true; // <<-- Toggle true/false to test UI
  const user = isAuthenticated ? { name: "BSC-User", avatarUrl: null } : null;
  // --- End Simulated Auth State ---

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    router.push('/auth/login?logout=success');
  };

  // User menu now only has Logout
  const userMenuItems = [
    { label: 'Logout', icon: <LogoutIcon fontSize="small" />, onClick: handleLogout },
  ];

  const getAvatarInitials = (name: string) => {
    if (!name) return '';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return initials.length > 2 ? initials.substring(0, 2) : initials;
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
      }}
    >
      <Toolbar sx={{ minHeight: theme.mixins.toolbar.minHeight, px: { xs: 2, sm: 3 } }}>
        {!isMdUp && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 1, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          noWrap
          component={Link}
          href="/"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            textDecoration: 'none',
            display: { xs: 'none', sm: 'block' },
            transition: 'opacity 0.2s ease-in-out',
            '&:hover': { opacity: 0.8 },
          }}
        >
          Microplate AI System
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated && user ? (
            <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="center">
              <Tooltip title={user.name || "Account"}>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={user.name || "User Avatar"}
                    src={user.avatarUrl || undefined}
                    sx={{
                      width: { xs: 32, sm: 36 },
                      height: { xs: 32, sm: 36 },
                      bgcolor: user.avatarUrl ? 'transparent' : theme.palette.primary.main,
                      color: user.avatarUrl ? undefined : theme.palette.primary.contrastText,
                      fontSize: '0.875rem',
                      border: user.avatarUrl ? `2px solid ${theme.palette.background.paper}` : 'none',
                      boxShadow: user.avatarUrl ? `0 0 0 1px ${alpha(theme.palette.divider, 0.7)}` : 'none',
                    }}
                  >
                    {user.name && !user.avatarUrl
                      ? getAvatarInitials(user.name)
                      : !user.avatarUrl
                      ? <AccountIcon fontSize="small" />
                      : null}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="user-account-menu"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                slotProps={{
                  paper: {
                    elevation: 3,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                      mt: 1.5,
                      minWidth: 200,
                      borderRadius: 2,
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {user.name || 'User'}
                  </Typography>
                </Box>
                {userMenuItems.map((item) => (
                  <MenuItem
                    key={item.label}
                    onClick={item.onClick}
                    sx={{ py: 1.25, px: 2, '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) } }}
                  >
                    <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}>
                      {item.label}
                    </ListItemText>
                  </MenuItem>
                ))}
              </Menu>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                component={Link}
                href="/auth/login"
                variant="outlined"
                startIcon={<LoginIcon />}
                sx={{
                  color: 'text.primary',
                  borderColor: alpha(theme.palette.grey[500], 0.4),
                  '&:hover': { borderColor: theme.palette.text.primary, backgroundColor: alpha(theme.palette.text.primary, 0.04) },
                }}
              >
                Login
              </Button>
              <Button
                component={Link}
                href="/auth/signup"
                variant="contained"
                color="primary"
                disableElevation
                startIcon={<PersonAddIcon />}
                sx={{ '&:hover': { backgroundColor: theme.palette.primary.dark } }}
              >
                Sign Up
              </Button>
            </Stack>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
