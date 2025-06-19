import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import signalDataReducer from './slices/signalDataSlice';
import viewConfigReducer from './slices/viewConfigSlice';
import uiStateReducer from './slices/uiStateSlice';
import type { RootState } from '../types/store';

// Enable Immer support for Map and Set
enableMapSet();

export const store = configureStore({
  reducer: {
    signalData: signalDataReducer,
    viewConfig: viewConfigReducer,
    uiState: uiStateReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the serializable check because Set is not serializable
        ignoredPaths: ['signalData.visibleSignals'],
        // Ignore these action types
        ignoredActions: ['signalData/loadCsvData', 'signalData/toggleSignal'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

// Selectors
export const selectSignalData = (state: RootState) => state.signalData;
export const selectViewConfig = (state: RootState) => state.viewConfig;
export const selectUIState = (state: RootState) => state.uiState;

// Convenience selectors
export const selectVisibleSignals = (state: RootState) =>
  Array.from(state.signalData.visibleSignals);

export const selectFilteredSignals = (state: RootState) => {
  const { signalOrder } = state.signalData;
  const { searchFilter } = state.uiState;

  if (!searchFilter) return signalOrder;

  return signalOrder.filter(signal =>
    signal.toLowerCase().includes(searchFilter.toLowerCase())
  );
};

export const selectVisibleTimelines = (state: RootState) => {
  const { timelines, visibleSignals, signalOrder } = state.signalData;

  return timelines
    .filter(timeline => visibleSignals.has(timeline.signalName))
    .sort(
      (a, b) =>
        signalOrder.indexOf(a.signalName) - signalOrder.indexOf(b.signalName)
    );
};

export const selectTimeRangeDuration = (state: RootState) => {
  const { timeRange } = state.signalData;
  if (!timeRange) return 0;
  return timeRange.endTime - timeRange.startTime;
};

export const selectIsLoading = (state: RootState) => state.signalData.loading;
export const selectError = (state: RootState) => state.signalData.error;
