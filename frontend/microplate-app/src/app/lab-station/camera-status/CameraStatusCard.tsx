// src/app/dashboard/camera-status/CameraStatusCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Avatar,
  useTheme,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { cameraApi } from '../../../utils/api/camera';

// Configuration for camera statuses
const statusConfig: Record<string, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  OK: { label: 'Camera Status "OK"', icon: <CheckCircleOutlineIcon />, color: '#4caf50' },
  ERROR: { label: 'Camera Status "Error"', icon: <ErrorOutlineIcon />, color: '#f44336' },
};

export default function CameraStatusCard({ pollInterval = 300_000 }: { pollInterval?: number }) {
  const theme = useTheme();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      if (!mounted) return;
      setLoading(true);
      try {
        const res = await cameraApi.getStatus();
        if (!mounted) return;
        setStatus(res.status);
        setError(null);
      } catch (e: any) {
        if (!mounted) return;
        // ถ้าโดน Rate Limit (429) ให้รอจนกว่าจะหมดยกเลิก retry ตอนนี้
        if (e.message.includes('429')) {
          setError('Too many requests – please wait and try again');
          // ไม่เช็ต loading=false ตรงนี้ รอให้ polling รอบถัดไปมาเคลียร์ให้เอง
          return;
        }
        setError(e.message || 'Failed to fetch status');
        setStatus(null);
      } finally {
        if (!mounted) setLoading(false);
        else if (!error) setLoading(false);
      }
    };

    fetchStatus();
    const id = setInterval(fetchStatus, pollInterval);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [pollInterval]);

  return (
    <Card sx={{ minWidth: 120, width: '100%', borderRadius: 2, boxShadow: 1 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>        
        {loading ? (
          <CircularProgress size={24} />
        ) : error || !status ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ErrorOutlineIcon sx={{ color: theme.palette.error.main }} />
            <Typography variant="body2" color="error">
              {error || 'No data'}
            </Typography>
          </Box>
        ) : (
          <>
            <Avatar sx={{ bgcolor: statusConfig[status]?.color || theme.palette.grey[500] }}>
              {statusConfig[status]?.icon || <CameraAltIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {statusConfig[status]?.label || status}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Updated: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
