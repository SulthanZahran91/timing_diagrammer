import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SignalEvent,
  SignalTimeline,
  TimeRange,
  SignalDataState,
} from '../../types/store';

const initialState: SignalDataState = {
  events: [],
  timelines: [],
  timeRange: null,
  visibleSignals: new Set<string>(),
  signalOrder: [],
  loading: false,
  error: null,
};

// Utility function to generate timelines from events
const generateTimelines = (events: SignalEvent[]): SignalTimeline[] => {
  const timelineMap = new Map<string, SignalTimeline>();

  events.forEach(event => {
    if (!timelineMap.has(event.signalName)) {
      timelineMap.set(event.signalName, {
        signalName: event.signalName,
        events: [],
      });
    }
    timelineMap.get(event.signalName)!.events.push({
      timestamp: event.timestamp,
      value: event.value,
    });
  });

  // Sort events within each timeline by timestamp
  timelineMap.forEach(timeline => {
    timeline.events.sort((a, b) => a.timestamp - b.timestamp);
  });

  return Array.from(timelineMap.values());
};

// Utility function to calculate default time range
const calculateTimeRange = (events: SignalEvent[]): TimeRange | null => {
  if (events.length === 0) return null;

  const timestamps = events.map(e => e.timestamp);
  return {
    startTime: Math.min(...timestamps),
    endTime: Math.max(...timestamps),
  };
};

const signalDataSlice = createSlice({
  name: 'signalData',
  initialState,
  reducers: {
    loadCsvData: (state, action: PayloadAction<SignalEvent[]>) => {
      state.events = action.payload;
      state.timelines = generateTimelines(action.payload);
      state.timeRange = calculateTimeRange(action.payload);

      // Initialize visible signals and order
      const uniqueSignals = Array.from(
        new Set(action.payload.map(e => e.signalName))
      ).sort();
      state.visibleSignals = new Set(uniqueSignals);
      state.signalOrder = uniqueSignals;

      state.loading = false;
      state.error = null;
    },

    updateTimeRange: (state, action: PayloadAction<TimeRange>) => {
      state.timeRange = action.payload;
    },

    toggleSignal: (state, action: PayloadAction<string>) => {
      const signalName = action.payload;
      if (state.visibleSignals.has(signalName)) {
        state.visibleSignals.delete(signalName);
      } else {
        state.visibleSignals.add(signalName);
      }
    },

    setSignalOrder: (state, action: PayloadAction<string[]>) => {
      state.signalOrder = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearData: state => {
      state.events = [];
      state.timelines = [];
      state.timeRange = null;
      state.visibleSignals = new Set();
      state.signalOrder = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  loadCsvData,
  updateTimeRange,
  toggleSignal,
  setSignalOrder,
  setLoading,
  setError,
  clearData,
} = signalDataSlice.actions;

export default signalDataSlice.reducer;
