// src/app/page.tsx
'use client';

import { Box, Typography } from '@mui/material';

export default function HomePage() {
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 'calc(100vh - 90px)', // ลบความสูงของ Navbar (90px)
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        px: 2,
      }}
    >
      <Typography variant="h4" fontWeight={600}>
        Welcome to Microplate AI System!
      </Typography>
    </Box>
  );
}