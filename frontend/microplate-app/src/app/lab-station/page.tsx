// src/app/lab-station/page.tsx
'use client';

import React from 'react';
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
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

import CobotStatusCard from './cobot-status/CobotStatusCard';
import CameraStatusCard from './camera-status/CameraStatusCard';
import QrResultDisplay from './qr-display/QrResultDisplay';
import PredictResultsPanel from './predict-results/PredictResultsPanel';

import { cobotApi } from '../../utils/api/cobot';
import { cameraApi } from '../../utils/api/camera';
import { predictorApi } from '../../utils/api/predictor';

export default function LabStationPage() {
  const theme = useTheme();

  const [capturedImageUrl, setCapturedImageUrl] = React.useState<string | null>(null);
  const [qrCode, setQrCode] = React.useState<string>('No QR data yet');
  const [predictionResults, setPredictionResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleCapture = async () => {
    setLoading(true);
    try {
      const { imageUrl } = await cameraApi.capture();
      setCapturedImageUrl(imageUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCapturedImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePredict = async () => {
    if (!capturedImageUrl) return;
    setLoading(true);
    try {
      const base64 = capturedImageUrl.split(',')[1];
      const { qrData } = await cameraApi.scanQr(base64);
      setQrCode(qrData);
      const { results } = await predictorApi.predict({ imageUrl: capturedImageUrl, plateId: qrData });
      setPredictionResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunExperiment = async () => {
    await handleCapture();
    await handlePredict();
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
              <CobotStatusCard sx={{ height: 120 }} />
              <CameraStatusCard sx={{ height: 120 }} />
              <QrResultDisplay value={qrCode}  />
              <Box sx={{ minWidth: 100, width: '100%', maxWidth: 280, }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<RocketLaunchIcon />}
                      onClick={handleRunExperiment}
                      disabled={loading}
                    >
                      Start Full Experiment
                    </Button>
                  </Box>
            </Stack>
          </Grid>

          {/* Main area (10 cols) */}
          <Grid item xs={12} md={10}>
            <Grid container spacing={3}>
              {/* Imaging & Control (8 cols) */}
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
                      src={capturedImageUrl || '/placeholder.png'}
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
                      <IconButton onClick={handlePredict} color="primary" disabled={loading || !capturedImageUrl}>
                        <QrCode2Icon />
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
                    {predictionResults.length ? (
                      <PredictResultsPanel results={predictionResults} />
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