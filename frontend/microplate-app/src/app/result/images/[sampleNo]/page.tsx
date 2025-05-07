// src/app/result/images/[sampleNo]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  Card,
  CardMedia,
  useTheme,
} from '@mui/material';
import { fetcher } from '../../../../utils/fetcher';

interface ImageRecord {
  id: number;
  run_id: number;
  sample_no: string;
  file_type: string;
  path: string;
  created_at: string;
}

export default function ImagesPage() {
  const { sampleNo } = useParams();
  const router = useRouter();
  const theme = useTheme();
  const [data, setData] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (!sampleNo) return;
    fetcher<{ items: ImageRecord[] }>(
      `/data/images?sampleNo=${encodeURIComponent(sampleNo)}`
    )
      .then((res) => setData(res.items))
      .catch((err) => setError(err.message || 'Failed to load images'))
      .finally(() => setLoading(false));
  }, [sampleNo]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Alert severity="error" sx={{ mt: 4 }}>
      {error}
    </Alert>
  );

  // Prepare table data
  const fileTypes = Array.from(new Set(data.map((img) => img.file_type)));
  const grouped: Record<number, Record<string, any>> = {};
  data.forEach((img) => {
    if (!grouped[img.run_id]) grouped[img.run_id] = { run_id: img.run_id };
    grouped[img.run_id][img.file_type] = img.path;
  });
  const rows = Object.values(grouped);

  // Pagination slice
  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Button onClick={() => router.back()} variant="text" sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h5" gutterBottom>
        Images for {sampleNo}
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.action.selected }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Run ID</TableCell>
              {fileTypes.map((ft) => (
                <TableCell
                  key={ft}
                  sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                >
                  {ft}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, idx) => (
              <TableRow
                key={row.run_id}
                hover
                sx={{
                  backgroundColor: idx % 2 === 0
                    ? theme.palette.background.default
                    : theme.palette.action.hover
                }}
              >
                <TableCell>{row.run_id}</TableCell>
                {fileTypes.map((ft) => {
                  const rawPath = row[ft] as string;
                  if (!rawPath) {
                    return (
                      <TableCell key={ft}>
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      </TableCell>
                    );
                  }
                  const apiUrl = `/api/images?path=${encodeURIComponent(rawPath)}`;
                  return (
                    <TableCell key={ft} sx={{ maxWidth: 150 }}>
                      <Card
                        elevation={3}
                        sx={{ maxWidth: 150, cursor: 'pointer', overflow: 'hidden', borderRadius: 1 }}
                        onClick={() => window.open(apiUrl, '_blank')}
                      >
                        <CardMedia
                          component="img"
                          src={apiUrl}
                          alt={`${ft} thumbnail`}
                          sx={{ height: 100, objectFit: 'cover' }}
                        />
                      </Card>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                colSpan={fileTypes.length + 1}
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true,
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
}
