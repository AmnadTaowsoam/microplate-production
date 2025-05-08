// src/components/providers/ThemeRegistryClient.tsx
'use client';

import * as React from 'react';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../../utils/createEmotionCache';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../../theme/theme';

const clientSideEmotionCache = createEmotionCache();

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
