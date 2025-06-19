import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ViewConfigState } from '../../types/store';

const initialState: ViewConfigState = {
  resolution: 10, // Default resolution from tech spec
  zoomLevel: 1,
  skin: 'default',
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
      state.resolution = 10;
      state.zoomLevel = 1;
      state.skin = 'default';
    },
  },
});

export const {
  setResolution,
  setZoomLevel,
  setSkin,
  zoomIn,
  zoomOut,
  resetZoom,
  resetViewConfig,
} = viewConfigSlice.actions;

export default viewConfigSlice.reducer;
