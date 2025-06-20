// Core domain types
export interface SignalEvent {
  timestamp: number; // Unix timestamp in milliseconds
  signalName: string; // e.g., "CLK", "DATA", "RESET"
  value: string; // e.g., "0", "1", "x", "z", "data_value"
}

export interface SignalTimeline {
  signalName: string;
  events: Array<{
    timestamp: number;
    value: string;
  }>;
}

export interface TimeRange {
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
}

// Redux State Interfaces
export interface SignalDataState {
  events: SignalEvent[];
  timelines: SignalTimeline[];
  timeRange: TimeRange | null; // Full data time range
  visibleSignals: Set<string>;
  signalOrder: string[];
  loading: boolean;
  error: string | null;
}

export interface ViewConfigState {
  resolution: number;
  zoomLevel: number;
  skin: 'default' | 'narrow' | 'lowkey';
  viewportTimeRange: TimeRange | null; // Current visible time range in main diagram
}

export interface UIState {
  csvUploadProgress: number;
  selectedSignals: string[];
  searchFilter: string;
  sidebarOpen: boolean;
  exportDialogOpen: boolean;
}

// Root State Interface
export interface RootState {
  signalData: SignalDataState;
  viewConfig: ViewConfigState;
  uiState: UIState;
}

// Error Types
export enum ErrorType {
  CSV_PARSE_ERROR = 'CSV_PARSE_ERROR',
  INVALID_TIMESTAMP = 'INVALID_TIMESTAMP',
  WAVEDROM_GENERATION_ERROR = 'WAVEDROM_GENERATION_ERROR',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: unknown;
  recoverable: boolean;
}
