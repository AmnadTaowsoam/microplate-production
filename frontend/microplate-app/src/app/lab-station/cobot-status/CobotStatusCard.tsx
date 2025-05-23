// src/app/lab-station/cobot-status/CobotStatusCard.tsx
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
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import PanToolIcon from '@mui/icons-material/PanTool';
import CropFreeIcon from '@mui/icons-material/CropFree';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { cobotApi, RobotStatus } from '../../../utils/api/cobot';

// mapping ระหว่าง mode code กับชื่อสถานะ
const modeLabels: Record<number, string> = {
  1: 'Idle',
  2: 'Auto Running',
  3: 'Paused',
  4: 'Emergency Stop',
  5: 'Manual',
  6: 'Alarm',
  7: 'Backdrive',
  8: 'Error',
};

// mapping สำหรับไอคอนและสีของแต่ละ mode
const modeConfig: Record<number, { Icon: React.ElementType; color: string }> = {
  1: { Icon: PauseCircleOutlineIcon, color: '#757575' },    // Idle → เขียว
  2: { Icon: DirectionsRunIcon,       color: '#2196f3' },    // Auto Running → น้ำเงิน
  3: { Icon: PauseCircleOutlineIcon,  color: '#ff9800' },    // Paused → ส้ม
  4: { Icon: ErrorOutlineIcon,        color: '#d32f2f' },    // Emergency Stop → แดงเข้ม
  5: { Icon: PanToolIcon,             color: '#4caf50' },    // Manual → เทา'#757575'
  6: { Icon: ErrorOutlineIcon,        color: '#f44336' },    // Alarm → แดง
  7: { Icon: CropFreeIcon,            color: '#9c27b0' },    // Backdrive → ม่วง
  8: { Icon: ErrorOutlineIcon,        color: '#f44336' },    // Error → แดง
};

const MOCK_STATUS: RobotStatus = {
  mode: -1,
  last_response: 'No data',
};

export default function CobotStatusCard() {
  const theme = useTheme();
  const [status, setStatus]   = useState<RobotStatus>(MOCK_STATUS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      try {
        const res = await cobotApi.getStatus();
        if (!mounted) return;
        setStatus(res);
      } catch {
        if (!mounted) return;
        setStatus({ mode: -1, last_response: 'Error fetching status' });
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5 * 60 * 1000); // every 5 minutes
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // ถ้าเจอ mode ที่ไม่แม็ปเอาไว้ ให้ใช้ default
  const { Icon: IconComponent, color } = modeConfig[status.mode] ?? {
    Icon: ErrorOutlineIcon,
    color: theme.palette.text.secondary,
  };
  const label = modeLabels[status.mode] ?? `Mode ${status.mode}`;

  return (
    <Card sx={{ width: '100%', maxWidth: 320, borderRadius: 2, boxShadow: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <Avatar
              sx={{
                bgcolor: theme.palette.action.hover,
                width: 40,
                height: 40,
              }}
            >
              <IconComponent fontSize="small" htmlColor={color} />
            </Avatar>
            <Box>
              <Typography variant="h6">{label}</Typography>
              <Typography variant="body2" color="text.secondary">
                {status.last_response}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

