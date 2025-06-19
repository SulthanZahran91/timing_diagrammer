'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import { csvParserService } from '../../services/csvParser/csvParser';
import { DEFAULT_CSV_CONFIG } from '../../services/csvParser/csvParser.types';
import { CsvUploaderProps, CsvUploaderState } from './CsvUploader.types';

const CsvUploader: React.FC<CsvUploaderProps> = ({
  onFileUpload,
  onError,
  config = DEFAULT_CSV_CONFIG,
  disabled = false,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  acceptedFileTypes = ['.csv'],
}) => {
  const [state, setState] = useState<CsvUploaderState>({
    isDragOver: false,
    isUploading: false,
    uploadProgress: 0,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file) return;

      // Reset previous states
      setUploadError(null);
      setSelectedFile(file);

      // Basic file validation
      if (
        !acceptedFileTypes.some(type =>
          file.name.toLowerCase().endsWith(type.toLowerCase())
        )
      ) {
        const error = new Error(`Invalid file type. Please select a CSV file.`);
        setUploadError(error.message);
        onError(error);
        return;
      }

      if (file.size > maxFileSize) {
        const error = new Error(
          `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${(maxFileSize / 1024 / 1024).toFixed(2)}MB`
        );
        setUploadError(error.message);
        onError(error);
        return;
      }

      // Start upload process
      setState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));

      try {
        // Simulate progress for user feedback
        const progressInterval = setInterval(() => {
          setState(prev => ({
            ...prev,
            uploadProgress: Math.min(prev.uploadProgress + 10, 90),
          }));
        }, 100);

        const signalEvents = await csvParserService.parseFile(file, config);

        clearInterval(progressInterval);
        setState(prev => ({ ...prev, uploadProgress: 100 }));

        // Small delay to show 100% progress
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            isUploading: false,
            uploadProgress: 0,
          }));
          onFileUpload(signalEvents);
        }, 300);
      } catch (error) {
        setState(prev => ({ ...prev, isUploading: false, uploadProgress: 0 }));
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unknown error occurred while parsing the CSV file';
        setUploadError(errorMessage);
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    },
    [config, maxFileSize, acceptedFileTypes, onFileUpload, onError]
  );

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setState(prev => ({ ...prev, isDragOver: true }));
    },
    []
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setState(prev => ({ ...prev, isDragOver: false }));
    },
    []
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setState(prev => ({ ...prev, isDragOver: false }));

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      {/* File Upload Area */}
      <Paper
        elevation={state.isDragOver ? 8 : 2}
        sx={{
          p: 4,
          border: 2,
          borderStyle: 'dashed',
          borderColor: state.isDragOver
            ? 'primary.main'
            : disabled
              ? 'grey.300'
              : 'grey.400',
          backgroundColor: state.isDragOver
            ? 'action.hover'
            : disabled
              ? 'grey.50'
              : 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease-in-out',
          textAlign: 'center',
          '&:hover': {
            borderColor: disabled ? 'grey.300' : 'primary.main',
            backgroundColor: disabled ? 'grey.50' : 'action.hover',
          },
        }}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDrop={disabled ? undefined : handleDrop}
        onClick={disabled ? undefined : handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />

        <CloudUploadIcon
          sx={{
            fontSize: 48,
            color: disabled ? 'grey.400' : 'primary.main',
            mb: 2,
          }}
        />

        <Typography
          variant="h6"
          gutterBottom
          color={disabled ? 'textSecondary' : 'textPrimary'}
        >
          {state.isUploading ? 'Processing CSV...' : 'Upload CSV File'}
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Drag and drop your CSV file here, or click to browse
        </Typography>

        <Typography variant="caption" color="textSecondary">
          Supported format: CSV • Max size: {formatFileSize(maxFileSize)}
        </Typography>

        {!disabled && (
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 2 }}
            onClick={e => {
              e.stopPropagation();
              handleBrowseClick();
            }}
          >
            Browse Files
          </Button>
        )}
      </Paper>

      {/* Upload Progress */}
      {state.isUploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={state.uploadProgress}
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" color="textSecondary" align="center">
            {state.uploadProgress}% - Processing your CSV file...
          </Typography>
        </Box>
      )}

      {/* Selected File Info */}
      {selectedFile && !state.isUploading && !uploadError && (
        <Box sx={{ mt: 2 }}>
          <Alert
            severity="success"
            icon={<FileIcon />}
            action={
              <Tooltip title="CSV Format Requirements">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          >
            <Typography variant="body2">
              <strong>{selectedFile.name}</strong> (
              {formatFileSize(selectedFile.size)}) ready to process
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Error Display */}
      {uploadError && (
        <Box sx={{ mt: 2 }}>
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            onClose={() => setUploadError(null)}
          >
            <Typography variant="body2">{uploadError}</Typography>
          </Alert>
        </Box>
      )}

      {/* CSV Format Help */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Expected CSV Format:
        </Typography>
        <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
          <Typography
            variant="caption"
            component="pre"
            sx={{ fontFamily: 'monospace' }}
          >
            {`timestamp,signal_name,value
1000,CLK,0
1010,CLK,1
1015,DATA,0xFF
1020,CLK,0`}
          </Typography>
        </Paper>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ mt: 1, display: 'block' }}
        >
          Required columns: {config.timestampColumn}, {config.signalColumn},{' '}
          {config.valueColumn}
        </Typography>
      </Box>
    </Box>
  );
};

export default CsvUploader;
