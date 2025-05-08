// src/app/lab-station/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Button,
  Typography,
  useTheme,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Stack,
  IconButton,
  CardMedia,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';

import CobotStatusCard from './cobot-status/CobotStatusCard';
import CameraStatusCard from './camera-status/CameraStatusCard';
import QrResultDisplay from './qr-display/QrResultDisplay';
import PredictResultsPanel from './predict-results/PredictResultsPanel';
import { startAutoProcess, stopAutoProcess } from '@/utils/autoProcess';

import { cameraApi } from '../../utils/api/camera';
import { predictorApi } from '../../utils/api/predictor';
import { fetcher } from '../../utils/fetcher';

interface ImageRecord {
  id: number;
  run_id: number;
  sample_no: string;
  file_type: string;
  path: string;
  created_at: string;
}

interface PredictResponse {
  run_id: number;
  counts: Record<string, number[]>;
  last_positions: Record<string, number>;
  distribution: Record<string, number>;
  annotated_image: string;
}

export default function LabStationPage() {
  const theme = useTheme();

  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [predictionResults, setPredictionResults] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  // state for auto process
  const [autoRunning, setAutoRunning] = useState(false);

  // หยุด auto process ตอน unmount เท่านั้น
  useEffect(() => {
    return () => {
      stopAutoProcess();
    };
  }, []);

  // ล้าง blob URL เก่าเมื่อ capturedPreview เปลี่ยนหรือ unmount
  useEffect(() => {
    return () => {
      if (capturedPreview) {
        URL.revokeObjectURL(capturedPreview);
      }
    };
  }, [capturedPreview]);

  // Auto process handler
  const handleAutoClick = () => {
    if (autoRunning) {
      stopAutoProcess();
      setAutoRunning(false);
    } else {
      startAutoProcess(
        // 1. QR scanned → set state
        (code) => setQrCode(code),
        // 2. Image captured → set preview state
        (url) => {
          setCapturedPreview(url);
          // ถ้าต้องการรีเซ็ตผลเก่า:
          setCapturedFile(null);
          setPredictionResults(null);
        },
        // 3. Prediction result → set state
        (pred) => setPredictionResults(pred)
      );
      setAutoRunning(true);
    }
  };


  const handleCapture = async () => {
    setLoading(true);
    try {
      // cameraApi.capture() คืน full URL มาให้แล้ว
      const { imageUrl } = await cameraApi.capture();
      setCapturedImageUrl(imageUrl);
      setCapturedPreview(imageUrl);
      setCapturedFile(null);
      setPredictionResults(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCapturedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCapturedPreview(objectUrl);
    setPredictionResults(null);
  };

  function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8 = new Uint8Array(n);
    while (n--) u8[n] = bstr.charCodeAt(n);
    return new File([u8], filename, { type: mime });
  }

  const handlePredict = async () => {
    if (!qrCode) {
      alert('กรุณาสแกน QR Code ก่อนทำการ Predict');
      return;
    }
    if (!capturedFile && !capturedPreview) {
      alert('กรุณาถ่ายภาพหรืออัปโหลดภาพก่อนทำการ Predict');
      return;
    }

    setLoading(true);
    try {
      let fileToSend: File;
      if (capturedFile) {
        fileToSend = capturedFile;
      } else if (capturedPreview!.startsWith('data:')) {
        fileToSend = dataURLtoFile(capturedPreview!, `${qrCode}.jpg`);
      } else {
        const fetchRes = await fetch(capturedPreview!);
        const blob = await fetchRes.blob();
        const ext = blob.type.split('/')[1] || 'jpg';
        fileToSend = new File([blob], `${qrCode}.${ext}`, { type: blob.type });
      }
      const resp = await predictorApi.predict(fileToSend, qrCode!);
      setPredictionResults(resp);
    } catch (err) {
      console.error('❌ Predict error:', err);
      alert('เกิดข้อผิดพลาดขณะส่งภาพไป Predict');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ background: theme.palette.background.default, py: 1 }}>
      <Container maxWidth={false} disableGutters sx={{ px: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <ScienceIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography variant="h4" fontWeight={600}>
            Lab Automation Station
          </Typography>
        </Box>

        {/* Layout */}
        <Grid container spacing={3}>
          {/* Sidebar cards (2 cols) */}
          <Grid item xs={12} md={2}>
            <Stack spacing={2}>
              <CobotStatusCard />
              <CameraStatusCard />
              <QrResultDisplay
                onScanComplete={setQrCode}
                externalValue={qrCode}
              />
              <Button
                variant="contained"
                fullWidth
                startIcon={<RocketLaunchIcon />}
                onClick={handleAutoClick}
                color={autoRunning ? 'error' : 'primary'}
                disabled={loading}
              >
                {autoRunning ? 'Stop Auto Process' : 'Start Auto Process'}
              </Button>
            </Stack>
          </Grid>

          {/* Main area (10 cols) */}
          <Grid item xs={12} md={10}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card elevation={3} sx={{ borderRadius: 2 }}>
                  <CardHeader
                    title="Imaging & Control"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    sx={{ bgcolor: theme.palette.grey[50] }}
                  />
                  <Divider />
                  <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={predictionResults?.annotated_image
                          ? `/api/images?path=${encodeURIComponent(predictionResults.annotated_image)}`
                          : capturedPreview || '/placeholder.png'
                      }
                      alt="Preview"
                      sx={{ width: '100%', height: 580, objectFit: 'contain', borderRadius: 1 }}
                    />
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <IconButton onClick={handleCapture} color="primary" disabled={loading}>
                        <CameraAltIcon />
                      </IconButton>
                      <IconButton component="label" color="primary" disabled={loading}>
                        <AddPhotoAlternateIcon />
                        <input type="file" hidden accept="image/*" onChange={handleUpload} />
                      </IconButton>
                      <IconButton onClick={handlePredict} color="primary" disabled={loading}>
                        <OnlinePredictionIcon />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Result (4 cols) */}
              <Grid item xs={12} lg={4}>
                <Card elevation={3} sx={{ borderRadius: 2 }}>
                  <CardHeader
                    title="Result"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    sx={{ bgcolor: theme.palette.grey[50] }}
                  />
                  <Divider />
                  <CardContent sx={{ minHeight: 600 }}>
                    {predictionResults ? (
                      <PredictResultsPanel results={predictionResults} isLoading={loading} />
                    ) : (
                      <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography color="text.secondary">No results yet</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
