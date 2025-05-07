// src/app/result/interface/[sampleNo]/page.tsx
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
  useTheme,
} from '@mui/material';
import { fetcher } from '../../../../utils/fetcher';

interface InterfaceResultRecord {
  id: number;
  sampleNo: string;
  results: { distribution: { [key: string]: number } };
  created_at: string;
}

export default function InterfacePage() {
  const { sampleNo } = useParams();
  const router = useRouter();
  const theme = useTheme();
  const [items, setItems] = useState<InterfaceResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (!sampleNo) return;
    fetcher<{ items: InterfaceResultRecord[] }>(
      `/data/interface-results/${encodeURIComponent(sampleNo)}`
    )
      .then(res => setItems(res.items))
      .catch(err => setError(err.message || 'Failed to load interface results'))
      .finally(() => setLoading(false));
  }, [sampleNo]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

  // derive columns
  const distributionKeys = items.length
    ? Object.keys(items[0].results.distribution)
        .filter(k => k !== 'total')
        .sort((a, b) => Number(a) - Number(b))
        .concat('total')
    : [];

  // prepare rows
  const rows = items.map(item => ({ ...item }));
  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Button onClick={() => router.back()} variant="text" sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h5" gutterBottom>
        Interface Results for {sampleNo}
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ minWidth: 650 }} stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.action.selected }}>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              {distributionKeys.map(key => (
                <TableCell key={key} align="center" sx={{ fontWeight: 'bold' }}>
                  {key}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((item, idx) => (
              <TableRow
                key={item.id}
                hover
                sx={{
                  backgroundColor: idx % 2 === 0
                    ? theme.palette.background.default
                    : theme.palette.action.hover
                }}
              >
                <TableCell>{item.id}</TableCell>
                {distributionKeys.map(key => (
                  <TableCell key={key} align="center">
                    {item.results.distribution[key]}
                  </TableCell>
                ))}
                <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                colSpan={distributionKeys.length + 2}
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true
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