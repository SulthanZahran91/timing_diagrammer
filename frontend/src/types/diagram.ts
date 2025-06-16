/**
 * Container types and interfaces for timing diagrams.
 * These types define the top-level structure that brings together
 * signals, timing information, and diagram metadata.
 */

import { Signal, SignalType } from './signal';
import { 
  TimeScale, 
  TimingCursor, 
  TimingMeasurement, 
  TimingConstraint, 
  TimingAnalysisResult,
  ClockDomain,
  TimeAnnotation 
} from './timing';

/**
 * Versioning information for diagram format compatibility.
 */
export interface DiagramVersion {
  /** Major version for breaking changes */
  major: number;
  /** Minor version for new features */
  minor: number;
  /** Patch version for bug fixes */
  patch: number;
  /** Optional pre-release identifier */
  prerelease?: string;
}

/**
 * Metadata about the timing diagram creation and modification.
 */
export interface DiagramMetadata {
  /** Human-readable title of the diagram */
  title: string;
  /** Optional description or documentation */
  description?: string;
  /** Creator information */
  author?: string;
  /** Organization or project name */
  organization?: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last modification timestamp */
  modifiedAt: Date;
  /** Version information for format compatibility */
  version: DiagramVersion;
  /** Tags for categorization and search */
  tags?: string[];
  /** Custom metadata fields */
  customFields?: Record<string, string>;
}

/**
 * View configuration for the timing diagram display.
 */
export interface DiagramViewport {
  /** Visible time range in nanoseconds */
  timeRange: {
    start: number;
    end: number;
  };
  /** Visible signal range (for vertical scrolling) */
  signalRange: {
    start: number;
    end: number;
  };
  /** Current zoom level */
  zoomLevel: number;
  /** Time scale configuration */
  timeScale: TimeScale;
  /** Whether grid lines are visible */
  showGrid: boolean;
  /** Whether signal names are visible */
  showSignalNames: boolean;
  /** Whether timing measurements are visible */
  showMeasurements: boolean;
  /** Background color */
  backgroundColor: string;
  /** Grid color */
  gridColor: string;
}

/**
 * Configuration for diagram export operations.
 */
export interface ExportConfiguration {
  /** Export format */
  format: 'svg' | 'png' | 'pdf' | 'vcd' | 'json' | 'csv';
  /** Resolution for raster formats (DPI) */
  resolution?: number;
  /** Include metadata in export */
  includeMetadata: boolean;
  /** Include measurements and annotations */
  includeAnalysis: boolean;
  /** Time range to export (null for full diagram) */
  timeRange?: {
    start: number;
    end: number;
  };
  /** Signals to include (null for all signals) */
  signalIds?: string[];
  /** Additional format-specific options */
  formatOptions?: Record<string, unknown>;
}

/**
 * Signal grouping for hierarchical organization.
 */
export interface SignalGroup {
  /** Unique identifier */
  id: string;
  /** Group name */
  name: string;
  /** Parent group ID (null for top-level groups) */
  parentId?: string;
  /** Child group IDs */
  childGroupIds: string[];
  /** Signal IDs in this group */
  signalIds: string[];
  /** Whether the group is expanded in the UI */
  expanded: boolean;
  /** Visual properties */
  style: {
    color: string;
    backgroundColor?: string;
  };
  /** Group description */
  description?: string;
}

/**
 * Complete timing diagram data structure.
 */
export interface TimingDiagram {
  /** Unique identifier for the diagram */
  id: string;
  /** Diagram metadata */
  metadata: DiagramMetadata;
  /** All signals in the diagram */
  signals: Signal[];
  /** Signal grouping hierarchy */
  signalGroups: SignalGroup[];
  /** Clock domain definitions */
  clockDomains: ClockDomain[];
  /** Timing cursors */
  cursors: TimingCursor[];
  /** Timing measurements */
  measurements: TimingMeasurement[];
  /** Timing constraints for analysis */
  constraints: TimingConstraint[];
  /** Analysis results */
  analysisResults: TimingAnalysisResult[];
  /** Time annotations */
  annotations: TimeAnnotation[];
  /** Current viewport configuration */
  viewport: DiagramViewport;
  /** User preferences and settings */
  settings: {
    /** Default signal colors by type */
    defaultSignalColors: Record<SignalType, string>;
    /** Default time scale */
    defaultTimeScale: TimeScale;
    /** Auto-save configuration */
    autoSave: boolean;
    /** Undo history limit */
    undoHistoryLimit: number;
    /** Snap to grid when editing */
    snapToGrid: boolean;
    /** Grid resolution in nanoseconds */
    gridResolution: number;
  };
}

/**
 * Lightweight diagram summary for listings and previews.
 */
export interface DiagramSummary {
  /** Diagram ID */
  id: string;
  /** Diagram title */
  title: string;
  /** Brief description */
  description?: string;
  /** Number of signals */
  signalCount: number;
  /** Time span of the diagram */
  timeSpan: {
    start: number;
    end: number;
    duration: number;
  };
  /** Creation and modification dates */
  dates: {
    created: Date;
    modified: Date;
  };
  /** Tags for filtering */
  tags: string[];
  /** Thumbnail image URL (if available) */
  thumbnailUrl?: string;
}

/**
 * Template for creating new diagrams with predefined structure.
 */
export interface DiagramTemplate {
  /** Template ID */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Category for organization */
  category: string;
  /** Predefined signals */
  signals: Omit<Signal, 'id'>[];
  /** Predefined signal groups */
  signalGroups: Omit<SignalGroup, 'id' | 'signalIds'>[];
  /** Predefined clock domains */
  clockDomains: Omit<ClockDomain, 'id' | 'signalIds'>[];
  /** Default viewport settings */
  defaultViewport: Partial<DiagramViewport>;
  /** Template tags */
  tags: string[];
  /** Whether this is a built-in template */
  builtIn: boolean;
}

/**
 * Diff information for diagram change tracking.
 */
export interface DiagramDiff {
  /** Change timestamp */
  timestamp: Date;
  /** Type of change */
  changeType: 'signal_added' | 'signal_removed' | 'signal_modified' | 'measurement_added' | 'metadata_changed';
  /** Description of the change */
  description: string;
  /** IDs of affected elements */
  affectedElementIds: string[];
  /** Previous values (for undo) */
  previousState?: Partial<TimingDiagram>;
  /** New values */
  newState?: Partial<TimingDiagram>;
} 