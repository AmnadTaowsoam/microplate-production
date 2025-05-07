// src/app/result/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  IconButton,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import { dataApi } from '../../utils/api/data';
import { fetcher } from '../../utils/fetcher';

interface Distribution {
  [key: string]: number;
}

interface SampleSummaryRecord {
  sample_no: string;
  summary: { distribution: Distribution };
}

export default function ResultPage() {
  const theme = useTheme();
  const [data, setData] = useState<SampleSummaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    dataApi.getSampleSummary()
      .then((res) => setData(res.items))
      .catch((err) => setError(err.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (sampleNo: string) => {
    if (!confirm(`Are you sure you want to delete summary for ${sampleNo}?`)) return;
    try {
      await fetcher<void>(`/data/sample-summary/${sampleNo}`, { method: 'DELETE' });
      setData((prev) => prev.filter((item) => item.sample_no !== sampleNo));
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

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

  const distributionKeys = data.length
    ? Object.keys(data[0].summary.distribution)
        .filter((k) => k !== 'total')
        .sort((a, b) => Number(a) - Number(b))
        .concat(['total'])
    : [];

  const rows = data;
  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Sample Summary Distribution
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ minWidth: 800 }} stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.action.selected }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Sample No</TableCell>
              {distributionKeys.map((key) => (
                <TableCell key={key} align="center" sx={{ fontWeight: 'bold' }}>
                  {key}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Images</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Interface</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((item, idx) => (
              <TableRow
                key={item.sample_no}
                hover
                sx={{
                  backgroundColor:
                    idx % 2 === 0
                      ? theme.palette.background.default
                      : theme.palette.action.hover,
                }}
              >
                <TableCell>{item.sample_no}</TableCell>
                {distributionKeys.map((key) => (
                  <TableCell key={key} align="center">
                    {item.summary.distribution[key]}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <IconButton
                    component={Link}
                    href={`/result/images/${encodeURIComponent(item.sample_no)}`}
                    color="primary"
                  >
                    <PhotoLibraryIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    component={Link}
                    href={`/result/interface/${encodeURIComponent(item.sample_no)}`}
                    color="secondary"
                  >
                    <InsertChartIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(item.sample_no)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                colSpan={distributionKeys.length + 4}
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true,
                }}
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    paddingLeft: theme => theme.spacing(2),
                    paddingRight: theme => theme.spacing(2),
                  },
                }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
}