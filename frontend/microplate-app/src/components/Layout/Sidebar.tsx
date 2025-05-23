// src/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import TableChartIcon from '@mui/icons-material/TableChart';

const drawerWidth = 240;

// Define navigation items with updated icons
const navItems = [
  { label: 'Lab Station', href: '/lab-station', icon: <ScienceIcon /> },
  { label: 'Results', href: '/result', icon: <TableChartIcon /> },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const theme = useTheme();
  const pathname = usePathname();

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 64, px: 2 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { opacity: 0.85 } }}>
            <Box
              component="img"
              src="/image/Betagro_Logo.png"
              alt="BETAGRO Logo"
              sx={{ height: 40, width: 'auto', objectFit: 'contain' }}
            />
          </Box>
        </Link>
      </Box>
      <Divider sx={{ mx: 2, mb: 2, borderColor: 'grey.300' }} />
      <List sx={{ flexGrow: 1, px: 1.5 }}>
        {navItems.map((item) => {
          const selected =
            item.href === '/'
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
              <ListItemButton
                selected={selected}
                sx={{
                  mb: 1,
                  borderRadius: theme.shape.borderRadius,
                  py: 1.25,
                  px: 1.5,
                  color: selected ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                  backgroundColor: selected ? theme.palette.primary.main : 'transparent',
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': { backgroundColor: theme.palette.primary.dark },
                    '& .MuiListItemIcon-root': { color: theme.palette.primary.contrastText },
                  },
                  '&:not(.Mui-selected):hover': {
                    backgroundColor: alpha(theme.palette.action.hover, 0.08),
                    color: theme.palette.text.primary,
                    '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                  },
                  '& .MuiListItemIcon-root': {
                    minWidth: 'auto',
                    marginRight: theme.spacing(2),
                    color: selected ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                    transition: 'color 0.2s ease-in-out',
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: selected ? 600 : 500,
                    fontSize: '0.9rem',
                  },
                  transition: 'background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </Link>
          );
        })}
      </List>
      <Box sx={{ textAlign: 'center', p: 2, mt: 'auto', fontSize: '0.75rem', color: 'text.disabled' }}>
        &copy; {new Date().getFullYear()} Microplate AI System
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: 'background.paper', borderRight: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, borderRight: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
