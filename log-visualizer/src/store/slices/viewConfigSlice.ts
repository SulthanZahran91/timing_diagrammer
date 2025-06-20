import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ViewConfigState, TimeRange } from '../../types/store';

const initialState: ViewConfigState = {
  resolution: 10, // Default resolution from tech spec
  zoomLevel: 1,
  skin: 'default',
  viewportTimeRange: null, // Current visible time range
};

const viewConfigSlice = createSlice({
  name: 'viewConfig',
  initialState,
  reducers: {
    setResolution: (state, action: PayloadAction<number>) => {
      state.resolution = Math.max(1, action.payload); // Ensure positive resolution
    },

    setZoomLevel: (state, action: PayloadAction<number>) => {
      state.zoomLevel = Math.max(0.1, Math.min(10, action.payload)); // Clamp between 0.1x and 10x
    },

    setSkin: (
      state,
      action: PayloadAction<'default' | 'narrow' | 'lowkey'>
    ) => {
      state.skin = action.payload;
    },

    setViewportTimeRange: (state, action: PayloadAction<TimeRange | null>) => {
      console.log('🔄 setViewportTimeRange called:', action.payload);
      console.log('  - Previous viewport:', state.viewportTimeRange);
      state.viewportTimeRange = action.payload;
      console.log('  - New viewport:', state.viewportTimeRange);
    },

    panViewport: (state, action: PayloadAction<number>) => {
      console.log('👆 panViewport called with delta:', action.payload);
      if (state.viewportTimeRange) {
        const duration = state.viewportTimeRange.endTime - state.viewportTimeRange.startTime;
        state.viewportTimeRange.startTime += action.payload;
        state.viewportTimeRange.endTime = state.viewportTimeRange.startTime + duration;
        console.log('  - New viewport after pan:', state.viewportTimeRange);
      }
    },

    zoomViewport: (state, action: PayloadAction<{ factor: number; centerTime?: number }>) => {
      console.log('🔍 zoomViewport called:', action.payload);
      if (state.viewportTimeRange) {
        const { factor, centerTime } = action.payload;
        const currentDuration = state.viewportTimeRange.endTime - state.viewportTimeRange.startTime;
        const newDuration = currentDuration / factor;
        
        if (centerTime !== undefined) {
          // Zoom centered on a specific time point
          const centerRatio = (centerTime - state.viewportTimeRange.startTime) / currentDuration;
          state.viewportTimeRange.startTime = centerTime - newDuration * centerRatio;
          state.viewportTimeRange.endTime = centerTime + newDuration * (1 - centerRatio);
        } else {
          // Zoom centered on viewport
          const center = (state.viewportTimeRange.startTime + state.viewportTimeRange.endTime) / 2;
          state.viewportTimeRange.startTime = center - newDuration / 2;
          state.viewportTimeRange.endTime = center + newDuration / 2;
        }
        console.log('  - New viewport after zoom:', state.viewportTimeRange);
      }
    },

    zoomIn: state => {
      state.zoomLevel = Math.min(10, state.zoomLevel * 1.2);
    },

    zoomOut: state => {
      state.zoomLevel = Math.max(0.1, state.zoomLevel / 1.2);
    },

    resetZoom: state => {
      state.zoomLevel = 1;
    },

    resetViewConfig: state => {
      console.log('🔄 resetViewConfig called');
      state.resolution = 10;
      state.zoomLevel = 1;
      state.skin = 'default';
      state.viewportTimeRange = null;
      console.log('✅ ViewConfig reset');
    },
  },
});

export const {
  setResolution,
  setZoomLevel,
  setSkin,
  setViewportTimeRange,
  panViewport,
  zoomViewport,
  zoomIn,
  zoomOut,
  resetZoom,
  resetViewConfig,
} = viewConfigSlice.actions;

export default viewConfigSlice.reducer;
