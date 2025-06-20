'use client';

import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  Collapse,
  Button,
  Skeleton,
} from '@mui/material';
import CsvUploader from '../components/CsvUploader/CsvUploader';
import { TimingDiagramWithNavigation } from '../components/TimingDiagramWithNavigation/TimingDiagramWithNavigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  loadCsvData,
  clearData,
  setError,
} from '../store/slices/signalDataSlice';
import { resetViewConfig, setViewportTimeRange } from '../store/slices/viewConfigSlice';
import { SignalEvent } from '../types/store';
import { ClientOnly } from '../components/ClientOnly';

export default function Home() {
  const dispatch = useAppDispatch();
  const { events, error, timeRange } = useAppSelector(state => state.signalData);
  const { viewportTimeRange } = useAppSelector(state => state.viewConfig);

  console.log('🏠 Home render - events count:', events.length);
  console.log('🏠 Home render - timeRange:', timeRange);
  console.log('🏠 Home render - viewportTimeRange:', viewportTimeRange);
  console.log('🏠 Home render - error:', error);

  // Initialize viewport when timeRange is available but viewport is not set
  useEffect(() => {
    console.log('🚀 Home effect - checking viewport initialization');
    console.log('  - timeRange:', timeRange);
    console.log('  - viewportTimeRange:', viewportTimeRange);
    
    if (timeRange && !viewportTimeRange) {
      console.log('✅ Initializing viewport time range from main page:', timeRange);
      dispatch(setViewportTimeRange(timeRange));
    }
  }, [timeRange, viewportTimeRange, dispatch]);

  const handleFileUpload = (uploadedEvents: SignalEvent[]) => {
    console.log('📁 File uploaded - events count:', uploadedEvents.length);
    console.log('📁 File uploaded - first few events:', uploadedEvents.slice(0, 3));
    dispatch(loadCsvData(uploadedEvents));
  };

  const handleUploadError = (uploadError: Error) => {
    console.log('❌ Upload error:', uploadError.message);
    dispatch(setError(uploadError.message));
  };

  const handleClear = () => {
    console.log('🧹 Clearing data');
    dispatch(clearData());
    dispatch(resetViewConfig());
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          CSV to WaveDrom Timing Diagram Converter
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Upload a CSV file to visualize the timing diagram with interactive navigation.
        </Typography>
      </Box>

      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Collapse>

      {events.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5" gutterBottom>
            Upload your CSV File
          </Typography>
          <CsvUploader
            onFileUpload={handleFileUpload}
            onError={handleUploadError}
          />
        </Paper>
      ) : (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h5" gutterBottom>
              Interactive Timing Diagram
            </Typography>
            <Button variant="outlined" color="secondary" onClick={handleClear}>
              Upload New File
            </Button>
          </Box>
          
          <ClientOnly
            fallback={
              <Box>
                <Skeleton variant="rectangular" width={1100} height={400} />
                <Skeleton variant="rectangular" width={1100} height={60} sx={{ mt: 2 }} />
              </Box>
            }
          >
            <TimingDiagramWithNavigation
              diagramWidth={1100}
              diagramHeight={400}
            />
          </ClientOnly>
        </Paper>
      )}
    </Container>
  );
}
