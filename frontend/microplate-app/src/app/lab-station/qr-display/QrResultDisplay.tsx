// /src\app\lab-station\qr-display\QrResultDisplay.tsx
'use client';
import React, { useState } from 'react';
import {
  Card, CardContent, Box, Typography, Button,
  CircularProgress, Alert, useTheme,
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { cameraApi, ScanQrResponse } from '../../../utils/api/camera';

export default function QrResultDisplay() {
  const theme = useTheme();
  const [qrData, setQrData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    console.log('⚡️ handleScan()');
    setLoading(true);
    setError(null);
    setQrData(null);

    try {
      const res: ScanQrResponse = await cameraApi.scanQr();
      console.log('🔍 scanQr response:', res);
      if (res.codes.length > 0) {
        setQrData(res.codes[0]);
      } else {
        setError('ไม่พบ QR code ในภาพ');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'เกิดข้อผิดพลาดขณะสแกน QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 280, borderRadius: 2, boxShadow: 1 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<QrCode2Icon />}
          onClick={handleScan}
          disabled={loading}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {loading ? 'กำลังสแกน...' : 'Scan QR-Code'}
        </Button>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {qrData && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              QR-Code Description
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all', mt: 1 }}>
              {qrData}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}