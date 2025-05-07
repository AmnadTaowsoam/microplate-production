// src/app/lab-station/predict-results/PredictResultsPanel.tsx
import React from 'react';
import { Typography, Box, CircularProgress, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

// Define a more specific type for your prediction results if possible
interface PredictionResultData {
  class?: string;
  confidence?: number;
  details?: any; // This could be an object or an array of items
  // If 'details' or another field is expected to be an array you slice:
  // itemsToDisplay?: Array<{id: string | number; label: string; value: any}>;
}

interface PredictResultsPanelProps {
  results: PredictionResultData | null;
  isLoading?: boolean;
}

export default function PredictResultsPanel({ results, isLoading }: PredictResultsPanelProps) {
  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{ p: 2, minHeight: 100 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">Loading predictions...</Typography>
      </Box>
    );
  }

  // Handle the case where results is null or undefined
  if (!results) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: 100 }}>
        <Typography variant="body2" color="text.secondary">
          No prediction results available.
        </Typography>
      </Box>
    );
  }

  // Now, render the results based on the object structure
  // The original error was "Cannot read properties of null (reading 'slice')"
  // This implies somewhere in your *original* PredictResultsPanel, 'slice' was used.
  // The following renders the object structure from LabStationPage's mockPrediction.
  // If you intended to slice an array, ensure that array exists and is correctly passed.

  const { class: predictedClass, confidence, details } = results;

  // Example: If 'details' was an array and you wanted to slice it:
  // const detailItems = Array.isArray(details) ? details.slice(0, 5) : [];

  return (
    <Box sx={{ wordBreak: 'break-word' }}>
      {predictedClass && (
        <>
          <Typography variant="subtitle1" component="div" gutterBottom>
            <strong>Predicted Class:</strong> {predictedClass}
          </Typography>
          <Divider sx={{ my: 1 }} />
        </>
      )}
      {confidence !== undefined && (
        <>
          <Typography variant="body1" component="div" gutterBottom>
            <strong>Confidence:</strong> {(confidence * 100).toFixed(1)}%
          </Typography>
          <Divider sx={{ my: 1 }} />
        </>
      )}
      {details && (
        <Box mt={1}>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }} gutterBottom>
            Further Details:
          </Typography>
          {typeof details === 'object' && !Array.isArray(details) ? (
            <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, background: (theme) => theme.palette.action.hover }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                {JSON.stringify(details, null, 2)}
              </pre>
            </Paper>
          ) : Array.isArray(details) ? (
            // If details is an array and you want to .slice() and list it:
            <List dense component={Paper} variant="outlined" sx={{background: (theme) => theme.palette.action.hover}}>
              {details.slice(0, 5).map((item: any, index: number) => ( // Display first 5 items
                <ListItem key={index} divider={index < details.slice(0, 5).length -1}>
                  <ListItemText
                    primary={typeof item === 'object' ? `Item ${index + 1}` : String(item)}
                    secondary={typeof item === 'object' ? JSON.stringify(item) : null}
                  />
                </ListItem>
              ))}
              {details.length > 5 && <ListItem><ListItemText secondary={`...and ${details.length - 5} more items.`} /></ListItem>}
            </List>
          ) : (
            <Typography variant="body2">{String(details)}</Typography>
          )}
        </Box>
      )}
      {!predictedClass && confidence === undefined && !details && (
         <Typography variant="body2" color="text.secondary">
            Prediction complete, but no standard data fields found to display.
          </Typography>
      )}
    </Box>
  );
}