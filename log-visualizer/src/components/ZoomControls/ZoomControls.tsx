import React from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { ZoomIn, ZoomOut, Restore } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { zoomViewport, resetZoom } from '../../store/slices/viewConfigSlice';

interface ZoomControlsProps {
  className?: string;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const { zoomLevel, viewportTimeRange } = useAppSelector(state => state.viewConfig);

  const handleZoomIn = () => {
    if (viewportTimeRange) {
      dispatch(zoomViewport({ factor: 1.2 }));
    }
  };

  const handleZoomOut = () => {
    if (viewportTimeRange) {
      dispatch(zoomViewport({ factor: 1/1.2 }));
    }
  };

  const handleResetZoom = () => {
    dispatch(resetZoom());
  };

  const isDisabled = !viewportTimeRange;

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        backgroundColor: 'background.paper',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Zoom:
      </Typography>
      
      <Tooltip title="Zoom In">
        <span>
          <IconButton
            onClick={handleZoomIn}
            size="small"
            disabled={isDisabled}
            aria-label="Zoom in"
          >
            <ZoomIn />
          </IconButton>
        </span>
      </Tooltip>

      <Typography variant="body2" sx={{ minWidth: '40px', textAlign: 'center' }}>
        {Math.round(zoomLevel * 100)}%
      </Typography>

      <Tooltip title="Zoom Out">
        <span>
          <IconButton
            onClick={handleZoomOut}
            size="small"
            disabled={isDisabled}
            aria-label="Zoom out"
          >
            <ZoomOut />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Reset Zoom">
        <span>
          <IconButton
            onClick={handleResetZoom}
            size="small"
            disabled={isDisabled}
            aria-label="Reset zoom"
          >
            <Restore />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default ZoomControls; 