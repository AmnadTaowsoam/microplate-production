// src/app/lab-station/qr-display/QrResultDisplay.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { cameraApi, ScanQrResponse } from '../../../utils/api/camera';

interface Props {
  /** ฟังก์ชัน callback เมื่อสแกนหรือรับรหัสเสร็จ */
  onScanComplete: (data: string) => void;
  /** ค่ารหัส QR จากภายนอก (เช่น AutoProcess) */
  externalValue?: string | null;
}

export default function QrResultDisplay({ onScanComplete, externalValue }: Props) {
  const theme = useTheme();
  const [qrData, setQrData] = useState<string | null>(null);
  const [readerInput, setReaderInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ถ้ามี externalValue เข้ามา ให้ซิงค์ไปที่ local state
  useEffect(() => {
    if (externalValue) {
      setQrData(externalValue);
    }
  }, [externalValue]);

  // สแกนผ่าน Backend
  const handleApiScan = async () => {
    setLoading(true);
    setError(null);
    setQrData(null);
    try {
      const res: ScanQrResponse = await cameraApi.scanQr();
      if (res.codes.length > 0) {
        const codeStr = res.codes[0].data;
        setQrData(codeStr);
        onScanComplete(codeStr);
      } else {
        setError('ไม่พบ QR code ในภาพ');
      }
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาดขณะสแกน QR code');
    } finally {
      setLoading(false);
    }
  };

  // รับค่าจาก QR-reader field
  const handleReaderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const code = readerInput.trim();
      if (code) {
        setQrData(code);
        onScanComplete(code);
        setReaderInput('');
      }
    }
  };

  const displayed = qrData;

  return (
    <Card sx={{ width: '100%', maxWidth: 320, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          <Button
            variant="contained"
            startIcon={<QrCode2Icon />}
            onClick={handleApiScan}
            disabled={loading}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {loading ? 'กำลังสแกน...' : 'Scan QR from Backend'}
          </Button>

          <TextField
            fullWidth
            variant="outlined"
            label="Scan via QR Reader"
            placeholder="สแกน QR ด้วยเครื่องอ่าน"
            value={readerInput}
            onChange={(e) => setReaderInput(e.target.value)}
            onKeyDown={handleReaderKeyDown}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <QrCode2Icon color="action" />
                </InputAdornment>
              ),
            }}
          />

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

          {/* แสดงผลลัพธ์ QR code ภายใน Card */}
          {displayed && (
            <Box sx={{ p: 1, bgcolor: theme.palette.grey[50], borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Scanned QR Code
              </Typography>
              <Typography variant="body1" color="primary">
                {displayed}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}