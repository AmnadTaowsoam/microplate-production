// src/app/dashboard/cobot-status/CobotStatusCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  useTheme,
  Avatar,
} from '@mui/material';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import PanToolIcon from '@mui/icons-material/PanTool';
import CropFreeIcon from '@mui/icons-material/CropFree';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { cobotApi, CobotStatus } from '../../../utils/api/cobot';

const statusConfig: Record<CobotStatus['status'], {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  IDLE: { label: 'Cobot Status "Idle"', icon: <PauseCircleOutlineIcon />, color: '#4caf50' },
  MOVING: { label: 'Cobot Status "Moving"', icon: <DirectionsRunIcon />, color: '#2196f3' },
  PICKED: { label: 'Cobot Status "Picked"', icon: <PanToolIcon />, color: '#ff9800' },
  SCANNING: { label: 'Cobot Status "Scanning"', icon: <CropFreeIcon />, color: '#673ab7' },
  PLACED: { label: 'Cobot Status "Placed"', icon: <CheckCircleOutlineIcon />, color: '#009688' },
  ERROR: { label: 'Cobot Status "Error"', icon: <ErrorOutlineIcon />, color: '#f44336' },
};

export default function CobotStatusCard() {
  const theme = useTheme();
  const [status, setStatus] = useState<CobotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const res = await cobotApi.getStatus();
        if (!mounted) return;
        setStatus(res);
        setError(null);
      } catch (e: any) {
        if (!mounted) return;
        setError(e.message || 'Failed to fetch status');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchStatus();
    // Poll every 3 minutes (180,000 ms)
    const interval = setInterval(fetchStatus, 180_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Card sx={{ minWidth: 100, width: '100%', maxWidth: 280, borderRadius: 2, boxShadow: 1 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {loading ? (
          <CircularProgress size={24} />
        ) : error || !status ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ErrorOutlineIcon sx={{ color: theme.palette.error.main, fontSize: 32 }} />
            <Typography variant="body2" color="error">
              {error || 'No data'}
            </Typography>
          </Box>
        ) : (
          <>
            <Avatar sx={{ bgcolor: statusConfig[status.status].color }}>
              {statusConfig[status.status].icon}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6">
                {statusConfig[status.status].label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Updated: {new Date(status.updatedAt).toLocaleTimeString()}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}