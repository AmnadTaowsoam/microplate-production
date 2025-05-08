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
  IDLE:     { label: 'Idle',    icon: <PauseCircleOutlineIcon />,   color: '#4caf50' },
  MOVING:   { label: 'Moving',  icon: <DirectionsRunIcon />,         color: '#2196f3' },
  PICKED:   { label: 'Picked',  icon: <PanToolIcon />,               color: '#ff9800' },
  SCANNING: { label: 'Scanning',icon: <CropFreeIcon />,             color: '#673ab7' },
  PLACED:   { label: 'Placed',  icon: <CheckCircleOutlineIcon />,    color: '#009688' },
  ERROR:    { label: 'Error',   icon: <ErrorOutlineIcon />,          color: '#f44336' },
};

// ค่า mock เริ่มต้น
const MOCK_STATUS: CobotStatus = {
  status: 'IDLE',
  updatedAt: new Date().toISOString(),
};

export default function CobotStatusCard() {
  const theme = useTheme();
  const [status, setStatus]   = useState<CobotStatus>(MOCK_STATUS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      try {
        const res = await cobotApi.getStatus();
        if (!mounted) return;
        setStatus(res);
      } catch (e) {
        // เมื่อ fetch ไม่สำเร็จ ให้ใช้ค่า mock แทน ไม่แสดง error
        if (!mounted) return;
        setStatus({ ...MOCK_STATUS, updatedAt: new Date().toISOString() });
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchStatus();
    // Poll ทุกๆ 3 นาที
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
        ) : (
          <>
            <Avatar sx={{ bgcolor: statusConfig[status.status].color }}>
              {statusConfig[status.status].icon}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6">
                Cobot: {statusConfig[status.status].label}
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
