'use client';

import { useState } from 'react';
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
import { TimingDiagram } from '../components/TimingDiagram';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  loadCsvData,
  clearData,
  setError,
} from '../store/slices/signalDataSlice';
import { WaveDromConverterService } from '../services/waveDromConverter/waveDromConverter';
import { SignalEvent } from '../types/store';
import { WaveDromDiagram } from '../components/TimingDiagram/TimingDiagram.types';
import { DEFAULT_CONVERSION_CONFIG } from '../services/waveDromConverter/waveDromConverter.types';
import { ClientOnly } from '../components/ClientOnly';

const converter = new WaveDromConverterService();

export default function Home() {
  const dispatch = useAppDispatch();
  const { events, error } = useAppSelector(state => state.signalData);

  const [diagram, setDiagram] = useState<WaveDromDiagram | null>(null);

  const handleFileUpload = (uploadedEvents: SignalEvent[]) => {
    dispatch(loadCsvData(uploadedEvents));
    if (uploadedEvents.length > 0) {
      const initialTimeRange = {
        startTime: Math.min(...uploadedEvents.map(e => e.timestamp)),
        endTime: Math.max(...uploadedEvents.map(e => e.timestamp)),
      };
      const result = converter.convertToWaveDrom(
        uploadedEvents,
        initialTimeRange,
        DEFAULT_CONVERSION_CONFIG
      );
      setDiagram(result.diagram);
    }
  };

  const handleUploadError = (uploadError: Error) => {
    dispatch(setError(uploadError.message));
  };

  const handleClear = () => {
    dispatch(clearData());
    setDiagram(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          CSV to WaveDrom Timing Diagram Converter
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Upload a CSV file to visualize the timing diagram.
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
              Timing Diagram
            </Typography>
            <Button variant="outlined" color="secondary" onClick={handleClear}>
              Upload New File
            </Button>
          </Box>
          {diagram && (
            <ClientOnly
              fallback={
                <Skeleton variant="rectangular" width={1100} height={400} />
              }
            >
              <TimingDiagram
                diagram={diagram}
                width={1100}
                height={400}
                onError={err => dispatch(setError(err.message))}
              />
            </ClientOnly>
          )}
        </Paper>
      )}
    </Container>
  );
}
