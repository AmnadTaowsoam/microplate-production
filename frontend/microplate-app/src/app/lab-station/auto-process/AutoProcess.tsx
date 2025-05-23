// src/app/lab-station/AutoProcess.tsx
'use client';

import React, { useState } from 'react';
import { Stack, TextField, Button, CardContent, Card } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { pauseAutoProcess, resumeAutoProcess, stopAutoProcess } from '@/utils/autoProcess';

interface AutoProcessProps {
  cycles: number;
  setCycles: (cycles: number) => void;
  autoRunning: boolean;
  loading: boolean;
  qrCode: string | null;
  setQrCode: React.Dispatch<React.SetStateAction<string | null>>;
  onStartStop: () => void;
}

export default function AutoProcessControl({
  cycles,
  setCycles,
  autoRunning,
  loading,
  qrCode,
  setQrCode,
  onStartStop,
}: AutoProcessProps) {
  const [paused, setPaused] = useState(false);

  const handlePauseResume = () => {
    if (paused) {
      resumeAutoProcess();
      setPaused(false);
    } else {
      pauseAutoProcess();
      setPaused(true);
    }
  };

  const handleStop = () => {
    stopAutoProcess();
    setPaused(false);
    onStartStop();
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 320, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Stack spacing={2} sx={{ p: 1 }}>

          <TextField
            label="จำนวน Microplate ต่อแถว"
            type="number"
            size="small"
            value={cycles}
            onChange={e => setCycles(Math.max(1, Number(e.target.value)))}
            InputProps={{ inputProps: { min: 1 } }}
            fullWidth
          />

          <Button
            variant="contained"
            fullWidth
            startIcon={<RocketLaunchIcon />}
            onClick={onStartStop}
            color={autoRunning ? 'error' : 'primary'}
            disabled={loading}
          >
            {autoRunning ? 'หยุดอัตโนมัติ' : 'เริ่มอัตโนมัติ'}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={paused ? <PlayArrowIcon /> : <PauseCircleOutlineIcon />}
            onClick={handlePauseResume}
            disabled={!autoRunning || loading}
          >
            {paused ? 'Resume' : 'Pause'}
          </Button>

          <Button
            variant="text"
            fullWidth
            startIcon={<StopIcon />}
            onClick={handleStop}
            color="error"
            disabled={!autoRunning}
          >
            Stop & Reset
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
