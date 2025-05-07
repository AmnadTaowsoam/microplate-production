// src/components/layout/Footer.tsx
'use client';

import React from 'react';
import { Box, Typography, Link, IconButton, useTheme, Stack, alpha } from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  GitHub as GitHubIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';

// Define social links array for easier management
const socialLinks = [
  { name: 'Facebook', icon: FacebookIcon, href: 'https://facebook.com' }, // ใส่ URL จริงของคุณ
  { name: 'Twitter', icon: TwitterIcon, href: 'https://twitter.com' },   // ใส่ URL จริงของคุณ
  { name: 'GitHub', icon: GitHubIcon, href: 'https://github.com/AmnadTaowsoam' }, // ใส่ URL จริงของคุณ
  { name: 'Instagram', icon: InstagramIcon, href: 'https://instagram.com' }, // ใส่ URL จริงของคุณ
];

export default function Footer() {
  const theme = useTheme();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        borderTop: `1px solid ${theme.palette.divider}`,
        py: theme.spacing(4),
        px: { xs: 2, sm: 3 },
        mt: 'auto',
        color: 'text.secondary',
      }}
    >
      <Box
        sx={{
          maxWidth: 'lg',
          mx: 'auto',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing(3), // << เพิ่ม Gap เล็กน้อยสำหรับ Mobile
        }}
      >
        {/* Copyright */}
        <Typography variant="caption" sx={{ order: { xs: 2, sm: 1 } }}>
          © {year} Microplate AI System. All rights reserved.
        </Typography>

        {/* Footer Links */}
        <Stack
          direction="row"
          spacing={2.5}
          sx={{ order: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 0 } }} // อาจจะเอา mb ออกถ้า gap พอแล้ว
        >
          <Link
            href="/terms"
            underline="hover"
            color="inherit"
            sx={{ '&:hover': { color: 'primary.main' } }}
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            underline="hover"
            color="inherit"
            sx={{ '&:hover': { color: 'primary.main' } }}
          >
            Privacy
          </Link>
        </Stack>

        {/* Social Icons */}
        {/* << เพิ่ม spacing เล็กน้อย */}
        <Stack direction="row" spacing={1.5} sx={{ order: { xs: 3, sm: 3 } }}>
          {socialLinks.map((social) => (
            <IconButton
              key={social.name}
              component="a"
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <social.icon fontSize="small" />
            </IconButton>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}