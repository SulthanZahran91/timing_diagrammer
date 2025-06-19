import { store } from '../store';
import {
  loadCsvData,
  updateTimeRange,
  toggleSignal,
  setSignalOrder,
} from '../slices/signalDataSlice';
import {
  setResolution,
  setZoomLevel,
  setSkin,
  zoomIn,
  zoomOut,
} from '../slices/viewConfigSlice';
import {
  setCsvUploadProgress,
  setSearchFilter,
  toggleSidebar,
} from '../slices/uiStateSlice';
import { selectFilteredSignals, selectTimeRangeDuration } from '../store';
import type { SignalEvent } from '../../types/store';

describe('Redux Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    store.dispatch({ type: 'signalData/clearData' });
    store.dispatch({ type: 'viewConfig/resetViewConfig' });
    store.dispatch({ type: 'uiState/resetUIState' });
  });

  describe('SignalData Slice', () => {
    it('should load CSV data and generate timelines', () => {
      const mockEvents: SignalEvent[] = [
        { timestamp: 1000, signalName: 'CLK', value: '0' },
        { timestamp: 1010, signalName: 'CLK', value: '1' },
        { timestamp: 1020, signalName: 'DATA', value: '0xFF' },
      ];

      store.dispatch(loadCsvData(mockEvents));

      const state = store.getState().signalData;
      expect(state.events).toEqual(mockEvents);
      expect(state.timelines).toHaveLength(2); // CLK and DATA
      expect(state.timeRange).toEqual({
        startTime: 1000,
        endTime: 1020,
      });
      expect(Array.from(state.visibleSignals)).toEqual(['CLK', 'DATA']);
      expect(state.signalOrder).toEqual(['CLK', 'DATA']);
    });

    it('should update time range', () => {
      const timeRange = { startTime: 2000, endTime: 3000 };
      store.dispatch(updateTimeRange(timeRange));

      const state = store.getState().signalData;
      expect(state.timeRange).toEqual(timeRange);
    });

    it('should toggle signal visibility', () => {
      // First load some data
      const mockEvents: SignalEvent[] = [
        { timestamp: 1000, signalName: 'CLK', value: '0' },
      ];
      store.dispatch(loadCsvData(mockEvents));

      // Toggle signal off
      store.dispatch(toggleSignal('CLK'));
      expect(Array.from(store.getState().signalData.visibleSignals)).toEqual(
        []
      );

      // Toggle signal back on
      store.dispatch(toggleSignal('CLK'));
      expect(Array.from(store.getState().signalData.visibleSignals)).toEqual([
        'CLK',
      ]);
    });

    it('should set signal order', () => {
      const newOrder = ['DATA', 'CLK', 'RESET'];
      store.dispatch(setSignalOrder(newOrder));

      const state = store.getState().signalData;
      expect(state.signalOrder).toEqual(newOrder);
    });
  });

  describe('ViewConfig Slice', () => {
    it('should set resolution with minimum validation', () => {
      store.dispatch(setResolution(5));
      expect(store.getState().viewConfig.resolution).toBe(5);

      // Test minimum validation
      store.dispatch(setResolution(-1));
      expect(store.getState().viewConfig.resolution).toBe(1);
    });

    it('should set zoom level with bounds validation', () => {
      store.dispatch(setZoomLevel(2));
      expect(store.getState().viewConfig.zoomLevel).toBe(2);

      // Test bounds validation
      store.dispatch(setZoomLevel(20)); // Too high
      expect(store.getState().viewConfig.zoomLevel).toBe(10);

      store.dispatch(setZoomLevel(0.01)); // Too low
      expect(store.getState().viewConfig.zoomLevel).toBe(0.1);
    });

    it('should handle zoom in/out actions', () => {
      // Start at zoom level 1
      expect(store.getState().viewConfig.zoomLevel).toBe(1);

      store.dispatch(zoomIn());
      expect(store.getState().viewConfig.zoomLevel).toBe(1.2);

      store.dispatch(zoomOut());
      expect(store.getState().viewConfig.zoomLevel).toBe(1);
    });

    it('should set skin', () => {
      store.dispatch(setSkin('narrow'));
      expect(store.getState().viewConfig.skin).toBe('narrow');
    });
  });

  describe('UIState Slice', () => {
    it('should set CSV upload progress with bounds validation', () => {
      store.dispatch(setCsvUploadProgress(50));
      expect(store.getState().uiState.csvUploadProgress).toBe(50);

      // Test bounds validation
      store.dispatch(setCsvUploadProgress(150));
      expect(store.getState().uiState.csvUploadProgress).toBe(100);

      store.dispatch(setCsvUploadProgress(-10));
      expect(store.getState().uiState.csvUploadProgress).toBe(0);
    });

    it('should set search filter', () => {
      store.dispatch(setSearchFilter('CLK'));
      expect(store.getState().uiState.searchFilter).toBe('CLK');
    });

    it('should toggle sidebar', () => {
      // Start with sidebar open
      expect(store.getState().uiState.sidebarOpen).toBe(true);

      store.dispatch(toggleSidebar());
      expect(store.getState().uiState.sidebarOpen).toBe(false);

      store.dispatch(toggleSidebar());
      expect(store.getState().uiState.sidebarOpen).toBe(true);
    });
  });

  describe('Selectors', () => {
    it('should select filtered signals', () => {
      // Load some data
      const mockEvents: SignalEvent[] = [
        { timestamp: 1000, signalName: 'CLK', value: '0' },
        { timestamp: 1000, signalName: 'DATA', value: '0' },
        { timestamp: 1000, signalName: 'RESET', value: '1' },
      ];
      store.dispatch(loadCsvData(mockEvents));

      // Test filtering
      store.dispatch(setSearchFilter('CLK'));
      const filteredSignals = selectFilteredSignals(store.getState());
      expect(filteredSignals).toEqual(['CLK']);
    });

    it('should calculate time range duration', () => {
      const timeRange = { startTime: 1000, endTime: 2000 };
      store.dispatch(updateTimeRange(timeRange));

      const duration = selectTimeRangeDuration(store.getState());
      expect(duration).toBe(1000);
    });
  });
});
