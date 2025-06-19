### **CSV to WaveDrom Timing Diagram Converter - Project Specification (Final Version)**

**1. Project Overview**

* **1.1 Vision Statement**
    Create a web application that converts CSV timing data into interactive WaveDrom timing diagrams, enabling engineers to visualize and analyze signal transitions over time with powerful filtering, navigation, and customization capabilities.

* **1.2 Core Features**
    * **Primary:** CSV to WaveDrom JSON conversion with an interactive and accurate UI.
    * **Secondary:** Interactive time range selection, signal filtering, robust error handling, zoom, and export capabilities.

* **1.3 Technology Stack**
    * **Frontend:** React/TypeScript
    * **WaveDrom:** v3.5.0 (or latest stable)
    * **CSV Parser:** PapaParse
    * **State Management:** Redux Toolkit
    * **UI Components:** Material-UI v5
    * **Build Tool:** Vite

**2. Domain Definitions**

* **2.1 Data Models**
    ```typescript
    // Core domain types
    interface SignalEvent {
      timestamp: number;      // Unix timestamp in milliseconds
      signalName: string;     // e.g., "CLK", "DATA", "RESET"
      value: string;          // e.g., "0", "1", "x", "z", "data_value"
    }

    interface SignalTimeline {
      signalName: string;
      events: Array<{
        timestamp: number;
        value: string;
      }>;
    }

    interface WaveDromSignal {
      name: string;
      wave: string;           // e.g., "01.x.z"
      data?: string[];        // Data values for '=' symbols
      period?: number;
      phase?: number;
    }

    interface TimeRange {
      startTime: number;      // Unix timestamp
      endTime: number;        // Unix timestamp
    }
    ```

* **2.2 Conventions**
    * **CSV Format**
        ```csv
        timestamp,signal_name,value
        1000,CLK,0
        1010,CLK,1
        1015,DATA,0xFF
        1020,CLK,0
        ```
    * **WaveDrom Wave Characters**
        * `0`: Low signal
        * `1`: High signal
        * `x`: Unknown/undefined **or Conflict Marker** (indicates multiple state changes in one time slot)
        * `z`: High impedance
        * `.`: Continue previous state
        * `=`: Data value (requires `data` array)
        * `|`: Gap marker

**3. Technical Architecture**

* **3.1 Component Structure**
    ```
    src/
    ├── components/
    │   ├── CsvUploader/
    │   │   ├── CsvUploader.tsx
    │   │   ├── CsvUploader.types.ts
    │   │   └── CsvUploader.test.tsx
    │   ├── TimingDiagram/
    │   │   ├── TimingDiagram.tsx
    │   │   ├── TimingDiagram.types.ts
    │   │   └── TimingDiagram.test.tsx
    │   ├── TimeRangeSelector/
    │   │   ├── TimeRangeSelector.tsx // Will implement the Timeline Minimap
    │   │   ├── TimeRangeSelector.types.ts
    │   │   └── TimeRangeSelector.test.tsx
    │   ├── SignalFilter/
    │   │   ├── SignalFilter.tsx
    │   │   ├── SignalFilter.types.ts
    │   │   └── SignalFilter.test.tsx
    │   └── ErrorReviewer/
    │       ├── ErrorReviewer.tsx
    │       ├── ErrorReviewer.types.ts
    │       └── ErrorReviewer.test.tsx
    ├── services/
    │   ├── csvParser/
    │   │   ├── csvParser.ts
    │   │   ├── csvParser.types.ts
    │   │   └── csvParser.test.ts
    │   └── waveDromConverter/
    │       ├── waveDromConverter.ts
    │       ├── waveDromConverter.types.ts
    │       └── waveDromConverter.test.ts
    ├── store/
    │   ├── slices/
    │   │   ├── signalDataSlice.ts
    │   │   ├── viewConfigSlice.ts
    │   │   └── uiStateSlice.ts
    │   └── store.ts
    └── utils/
        ├── timeUtils.ts
        └── signalUtils.ts
    ```

* **3.2 Core Algorithms**
    * **CSV to Timeline Conversion**
        ```typescript
        interface CsvParserConfig {
          timestampColumn: string;  // Default: "timestamp"
          signalColumn: string;     // Default: "signal_name"
          valueColumn: string;      // Default: "value"
          timestampFormat: 'unix' | 'iso8601' | 'custom';
        }
        ```
        // Parsing flow:
        // 1. Parse CSV rows
        // 2. Group by signal name
        // 3. Sort events by timestamp within each signal
        // 4. Validate data integrity

    * **Timeline to WaveDrom Conversion (Revised)**
        ```typescript
        interface ConversionConfig {
          resolution: number;       // Time units per wave character
          defaultValue: string;     // Value for gaps (default: '.')
          dataThreshold: number;    // Max unique values before using '=' notation
        }
        ```
        **Conversion Algorithm:**
        1.  **Build Intermediate Slot Map:** For each signal, create a map of `slotIndex` to an array of `SignalEvent`s.
            * Iterate through every event for the signal.
            * Calculate its `slotIndex` using the formula: $slotIndex = \lfloor (event_{timestamp} - range_{startTime}) / resolution \rfloor$.
            * Push the event into the array at that `slotIndex` in the map.
        2.  **Generate Wave String & Conflict Data:** For each signal, initialize an empty `wave` string and an empty `conflictData` map. Iterate from `slot = 0` to the final slot.
            * Retrieve the array of events for the current `slot` from the intermediate map.
            * **If no events:** Append the "continue" character (`.`) to the `wave` string.
            * **If one event:** Append its corresponding character (`0`, `1`, `z`, `=`, etc.) to the `wave` string.
            * **If multiple events:**
                * If all events in the array have the same value, treat it as a single event.
                * If the event values differ, append the "conflict" character (`x`) to the `wave` string and store the array of events in the `conflictData` map for that signal and slot. The UI will use this data for an interactive drill-down.
        3.  **Optimize Wave String:** Perform a final pass on the generated `wave` string to collapse consecutive identical characters into the `.` notation (e.g., `1111` becomes `1...`).
        4.  **Handle Data Values:** For signals using the `=` notation, populate the `data` array from the events.

**4. Sprint Planning**

* **Sprint 1: Foundation (2 weeks)**
    * **Product Backlog Items (PBIs)**
        * **PBI-001: Project Setup and Infrastructure**
            * Set up React/TypeScript project with Vite
            * Configure ESLint, Prettier, and testing framework
            * Install and configure dependencies
            * **Acceptance Criteria:** Project builds successfully. All linting rules pass. Basic test runs.
        * **PBI-002: CSV Parser Service**
            * Implement CSV file upload component
            * Create CSV parsing service using PapaParse
            * Convert CSV to SignalEvent array
            * **Acceptance Criteria:** Can upload CSV file. Parses standard format correctly. Handles errors gracefully.
        * **PBI-003: Basic WaveDrom Integration**
            * Integrate WaveDrom library
            * Create TimingDiagram component wrapper
            * Display static WaveDrom JSON
            * **Acceptance Criteria:** WaveDrom renders in React component. Can display test timing diagram.
    * **Sprint 1 Backlog**
| Task ID | PBI | Description | Estimate | Assignee |
| :--- | :--- | :--- | :--- | :--- |
| T-001 | PBI-001 | Create React project structure | 2h | Dev A |
| T-002 | PBI-001 | Configure build tools | 2h | Dev A |
| T-003 | PBI-001 | Set up testing framework | 3h | Dev B |
| T-004 | PBI-002 | Create CsvUploader component | 4h | Dev B |
| T-005 | PBI-002 | Implement csvParser service | 6h | Dev C |
| T-006 | PBI-002 | Add CSV validation logic | 4h | Dev C |
| T-007 | PBI-003 | Integrate WaveDrom library | 3h | Dev A |
| T-008 | PBI-003 | Create TimingDiagram component | 4h | Dev A |

* **Sprint 2: Core Conversion (2 weeks)**
    * **PBIs**
        * **PBI-004: Signal Timeline Generation**
            * Group CSV events by signal
            * Create timeline data structure
            * Handle time sorting and validation
            * **Acceptance Criteria:** Correctly groups signals. Maintains chronological order. Detects data inconsistencies.
        * **PBI-005: WaveDrom JSON Generator**
            * Convert timelines to wave strings
            * Implement time quantization
            * Generate complete WaveDrom JSON
            * **Acceptance Criteria:** Produces valid WaveDrom JSON. Handles all signal types. Optimizes wave strings.
        * **PBI-006: Redux State Management**
            * Set up Redux store
            * Create slices for signal data
            * Implement data flow
            * **Acceptance Criteria:** State updates trigger re-renders. Data persists across components.

* **Sprint 3: Interactive Features (2 weeks)**
    * **PBIs**
        * **PBI-007: Advanced Time Range and Navigation**
            * **Description:** Implement a comprehensive navigation system allowing users to pan and zoom through the timing diagram intuitively.
            * **Acceptance Criteria:**
                * A timeline minimap component is displayed at the bottom, showing a low-detail overview of the full time range.
                * A draggable window on the minimap controls the `startTime` of the main diagram (panning).
                * The window on the minimap is resizable from its edges to control the zoom level (`resolution`).
                * The main diagram supports panning via click-and-drag.
                * The main diagram supports zooming via the mouse scroll wheel, centered on the cursor's position.
                * The UI includes discrete `[+]` and `[-]` buttons for zoom control.
        * **PBI-008: Interactive Signal Filtering and Reordering**
            * **Description:** Create a signal list that allows users to filter signals and customize their display order.
            * **Acceptance Criteria:**
                * Users can toggle individual signal visibility using checkboxes.
                * A search input filters the signal list in real-time by name.
                * Users can reorder signals using drag-and-drop.
                * The order of signals in the main diagram immediately updates to match the user-defined order stored in Redux state.
        * **PBI-009: Export Functionality**
            * Export as WaveDrom JSON
            * Export as image (PNG/SVG)
            * Save/load configurations
            * **Acceptance Criteria:** Downloads valid files. Preserves all settings.

* **Sprint 4: Polish and Advanced Features (2 weeks)**
    * **PBIs**
        * **PBI-010: Advanced CSV Handling**
            * Support multiple CSV formats
            * Custom column mapping
            * Batch file processing
            * **Acceptance Criteria:** Configurable column names. Handles various delimiters. Progress indication.
        * **PBI-011: Performance Optimization**
            * Implement virtual scrolling
            * Optimize large datasets
            * Add loading states
            * **Acceptance Criteria:** Handles 10k+ events smoothly. Responsive UI during processing.
        * **PBI-012: UI/UX Improvements**
            * Add tooltips and help
            * Implement keyboard shortcuts
            * Create example datasets
            * **Acceptance Criteria:** Intuitive user flow. Comprehensive documentation.
        * **PBI-013: Interactive Error Reviewer UI**
            * **Description:** Create a modal component that displays a detailed, scrollable list of CSV parsing errors to guide the user in fixing their data.
            * **Acceptance Criteria:**
                * Modal is triggered from a "View Details" button on a failure notification toast.
                * Displays a summary of the total error count.
                * Each error in the list clearly shows the line number, the raw line content, the error type, and a helpful plain-language suggestion.
                * The list of errors is virtualized to ensure performance when handling files with many errors.

**5. API Contracts**

* **5.1 Service Interfaces**
    ```typescript
    // CSV Parser Service
    interface ICsvParserService {
      parseFile(file: File, config?: CsvParserConfig): Promise<SignalEvent[]>;
      validateFormat(headers: string[]): ValidationResult;
    }

    // WaveDrom Converter Service
    interface IWaveDromConverterService {
      convertToWaveDrom(
        events: SignalEvent[],
        timeRange: TimeRange,
        config?: ConversionConfig
      ): WaveDromDiagram;

      optimizeWaveString(wave: string): string;
    }

    // Validation Result
    interface ValidationResult {
      isValid: boolean;
      errors: string[];
      warnings: string[];
    }

    // WaveDrom Diagram
    interface WaveDromDiagram {
      signal: WaveDromSignal[];
      config?: {
        hscale?: number;
        skin?: string;
      };
      head?: {
        text: string;
      };
    }
    ```

* **5.2 Redux Actions**
    ```typescript
    // Signal Data Actions
    interface SignalDataActions {
      loadCsvData: (events: SignalEvent[]) => void;
      updateTimeRange: (range: TimeRange) => void;
      toggleSignal: (signalName: string) => void;
      setSignalOrder: (order: string[]) => void;
    }

    // View Config Actions
    interface ViewConfigActions {
      setResolution: (resolution: number) => void;
      setZoomLevel: (zoom: number) => void;
      setSkin: (skin: 'default' | 'narrow' | 'lowkey') => void;
    }
    ```

**6. Testing Strategy**

* **6.1 Unit Tests**
    * Each service function must have >80% coverage
    * Test edge cases: empty CSV, malformed data, huge datasets
    * Mock external dependencies (WaveDrom, file system)
* **6.2 Integration Tests**
    * CSV upload to diagram rendering flow
    * Time range changes update diagram
    * Export produces valid outputs
* **6.3 E2E Tests**
    * Complete user journey from CSV to export
    * Performance benchmarks for large files

**7. Error Handling**

* **7.1 Error Types**
    ```typescript
    enum ErrorType {
      CSV_PARSE_ERROR = 'CSV_PARSE_ERROR',
      INVALID_TIMESTAMP = 'INVALID_TIMESTAMP',
      WAVEDROM_GENERATION_ERROR = 'WAVEDROM_GENERATION_ERROR',
      FILE_TOO_LARGE = 'FILE_TOO_LARGE',
      UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT'
    }

    interface AppError {
      type: ErrorType;
      message: string;
      details?: any;
      recoverable: boolean;
    }
    ```

* **7.2 Error Recovery (Revised)**
    The application will use a two-tiered error feedback system:
    1.  **Toast Notifications:** A non-blocking notification system (e.g., `react-toastify`) will provide high-level status.
        * **Success (Green):** Confirms successful file parsing.
        * **Warning (Yellow):** Informs about non-critical issues (e.g., large file size).
        * **Failure (Red):** Alerts the user to a critical failure (e.g., wrong file type, parsing failed). For parsing failures, the toast will include a "View Details" button.
    2.  **Modal Error Reviewer:** Triggered by the "View Details" button, this modal provides a detailed, actionable breakdown of all parsing errors. Each error report will contain the line number, the problematic line content, a specific error message, and a clear suggestion for how to fix the issue, empowering the user to correct their input file.

**8. Performance Considerations**

* **8.1 Optimization Strategies**
    * Virtualize signal list for >100 signals
    * Debounce time range changes (300ms)
    * Memoize WaveDrom conversion
    * Lazy load diagram sections
* **8.2 Limits**
    * Max file size: 50MB
    * Max signals: 1000
    * Max events: 100,000
    * Max time range: 1 year

**9. Deployment & Configuration**

* **9.1 Environment Variables**
    ```
    VITE_MAX_FILE_SIZE=52428800
    VITE_DEFAULT_RESOLUTION=10
    VITE_WAVEDROM_CDN_URL=https://unpkg.com/wavedrom@3.5.0
    ```
* **9.2 Build Configuration**
    ```json
    {
      "build": {
        "target": "es2015",
        "outDir": "dist",
        "sourcemap": true,
        "minify": "terser"
      }
    }
    ```

**10. User Interaction and Experience (UI/UX)**

This section defines the core interaction principles for the application's user interface.

* **10.1 Navigation and Zoom**
    * The primary method for navigating the timeline will be a **Timeline Minimap** component located at the bottom of the view. This minimap displays the entire duration of the signal data.
    * A highlighted "viewport" window on the minimap represents the section of the timeline shown in the main diagram.
    * **Panning:** Users pan by clicking and dragging the viewport window left or right. They can also click and drag directly on the main diagram.
    * **Zooming:** Users zoom by resizing the viewport window from its edges. They can also use the mouse scroll wheel over the main diagram or click dedicated `[+]` / `[-]` UI buttons.

* **10.2 Signal Management**
    * The signal list will be fully interactive.
    * **Filtering:** A search bar provides real-time filtering of the signal list by name.
    * **Reordering:** Signals can be reordered via drag-and-drop, with the main diagram updating instantly to reflect the new order. The custom order will be persisted in the application state.

* **10.3 Interactive Data**
    * On the main diagram, areas marked with an `x` (conflict) character will be interactive. Hovering over a conflict marker will trigger a tooltip displaying the sequence of signal changes that occurred within that quantized time slot.

***

This specification provides a complete blueprint for building the CSV to WaveDrom converter application. Each developer can work on their assigned PBIs independently, following the defined interfaces and conventions. The modular architecture ensures minimal coupling between components, enabling parallel development.