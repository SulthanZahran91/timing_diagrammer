import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState } from '../../types/store';

const initialState: UIState = {
  csvUploadProgress: 0,
  selectedSignals: [],
  searchFilter: '',
  sidebarOpen: true,
  exportDialogOpen: false,
};

const uiStateSlice = createSlice({
  name: 'uiState',
  initialState,
  reducers: {
    setCsvUploadProgress: (state, action: PayloadAction<number>) => {
      state.csvUploadProgress = Math.max(0, Math.min(100, action.payload));
    },

    setSelectedSignals: (state, action: PayloadAction<string[]>) => {
      state.selectedSignals = action.payload;
    },

    addSelectedSignal: (state, action: PayloadAction<string>) => {
      if (!state.selectedSignals.includes(action.payload)) {
        state.selectedSignals.push(action.payload);
      }
    },

    removeSelectedSignal: (state, action: PayloadAction<string>) => {
      state.selectedSignals = state.selectedSignals.filter(
        signal => signal !== action.payload
      );
    },

    clearSelectedSignals: state => {
      state.selectedSignals = [];
    },

    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.searchFilter = action.payload;
    },

    toggleSidebar: state => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    openExportDialog: state => {
      state.exportDialogOpen = true;
    },

    closeExportDialog: state => {
      state.exportDialogOpen = false;
    },

    resetUploadProgress: state => {
      state.csvUploadProgress = 0;
    },

    resetUIState: state => {
      state.csvUploadProgress = 0;
      state.selectedSignals = [];
      state.searchFilter = '';
      state.sidebarOpen = true;
      state.exportDialogOpen = false;
    },
  },
});

export const {
  setCsvUploadProgress,
  setSelectedSignals,
  addSelectedSignal,
  removeSelectedSignal,
  clearSelectedSignals,
  setSearchFilter,
  toggleSidebar,
  setSidebarOpen,
  openExportDialog,
  closeExportDialog,
  resetUploadProgress,
  resetUIState,
} = uiStateSlice.actions;

export default uiStateSlice.reducer;
