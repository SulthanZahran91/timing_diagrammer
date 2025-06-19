// Store configuration
export { store } from './store';
export type { AppDispatch, AppStore } from './store';

// Typed hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Action creators from slices
export {
  loadCsvData,
  updateTimeRange,
  toggleSignal,
  setSignalOrder,
  setLoading,
  setError,
  clearData,
} from './slices/signalDataSlice';

export {
  setResolution,
  setZoomLevel,
  setSkin,
  zoomIn,
  zoomOut,
  resetZoom,
  resetViewConfig,
} from './slices/viewConfigSlice';

export {
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
} from './slices/uiStateSlice';

// Selectors
export {
  selectSignalData,
  selectViewConfig,
  selectUIState,
  selectVisibleSignals,
  selectFilteredSignals,
  selectVisibleTimelines,
  selectTimeRangeDuration,
  selectIsLoading,
  selectError,
} from './store';
