// src/app/dashboard/capture-panel/CapturePanel.tsx
'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardMedia,
  IconButton,
  Typography,
  CircularProgress,
  useTheme,
  Tooltip,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { cameraApi } from '../../../utils/api/camera';

interface CapturePanelProps {
  onCapture?: (imageUrl: string) => void;
  onUpload?: (base64: string) => void;
}

export default function CapturePanel({ onCapture, onUpload }: CapturePanelProps) {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle API capture
  const handleCapture = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cameraApi.capture();
      setImageSrc(res.imageUrl);
      if (onCapture) onCapture(res.imageUrl);
    } catch (e: any) {
      setError(e.message || 'Capture failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageSrc(base64);
        if (onUpload) onUpload(base64);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      setError(e.message || 'Upload failed');
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: theme.palette.background.default,
        boxShadow: 1,
      }}
    >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255,255,255,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {imageSrc ? (
        <CardMedia
          component="img"
          src={imageSrc}
          alt="Captured or uploaded"
          sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
        />
      ) : (
        <Typography color="text.secondary">No image captured</Typography>
      )}

      {/* Controls */}
      <Box sx={{ position: 'absolute', bottom: 16, display: 'flex', gap: 2 }}>
        <Tooltip title="Capture from Camera">
          <IconButton
            color="primary"
            onClick={handleCapture}
            disabled={loading}
            size="large"
          >
            <PhotoCameraIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Upload from Device">
          <IconButton
            color="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            size="large"
          >
            <UploadFileIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </Box>

      {error && (
        <Typography color="error" variant="body2" sx={{ position: 'absolute', top: 8 }}>
          {error}
        </Typography>
      )}
    </Card>
  );
}