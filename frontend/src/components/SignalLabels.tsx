'use client';

import React, { useState, useCallback } from 'react';
import { Signal, SignalType } from '../types/signal';
import styles from './SignalLabels.module.css';

export interface SignalLabelProps {
  /** Array of signals to display labels for */
  signals: Signal[];
  /** Height of each signal track in pixels */
  trackHeight: number;
  /** Optional width of the label area (default: 180px) */
  width?: number;
  /** Optional Y offset for alignment with main canvas */
  yOffset?: number;
  /** Callback when a signal is selected/clicked */
  onSignalSelect?: (signalId: string) => void;
  /** Callback when a signal is right-clicked for context menu */
  onSignalContextMenu?: (signalId: string, event: React.MouseEvent) => void;
  /** Optional CSS class for styling */
  className?: string;
}

/**
 * Get icon character for different signal types
 */
function getSignalTypeIcon(signalType: SignalType): string {
  switch (signalType) {
    case SignalType.CLOCK:
      return '⏰';
    case SignalType.DATA:
      return '→';
    case SignalType.CONTROL:
      return '⚡';
    case SignalType.BUS:
      return '⇶';
    case SignalType.POWER:
      return '⚡';
    default:
      return '•';
  }
}

/**
 * Get color for signal type icon
 */
function getSignalTypeColor(signal: Signal): string {
  // Use signal's custom color if available, otherwise use type defaults
  if (signal.style.color) {
    return signal.style.color;
  }
  
  switch (signal.type) {
    case SignalType.CLOCK:
      return '#FF6B6B';
    case SignalType.DATA:
      return '#45B7D1';
    case SignalType.CONTROL:
      return '#4ECDC4';
    case SignalType.BUS:
      return '#96CEB4';
    case SignalType.POWER:
      return '#F38BA8';
    default:
      return '#2563eb';
  }
}

/**
 * Truncate text with ellipsis if it exceeds maxWidth
 */
function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }
  return text.substring(0, maxChars - 3) + '...';
}

/**
 * Format signal type display text for bus signals
 */
function formatSignalTypeDisplay(signal: Signal): string {
  if (signal.type === SignalType.BUS) {
    // Check if it's a BusSignal with width property
    const busSignal = signal as Signal & { width?: number };
    if (busSignal.width) {
      return `[${busSignal.width - 1}:0]`;
    }
    return '[7:0]'; // Default bus notation
  }
  return '';
}

export const SignalLabels: React.FC<SignalLabelProps> = ({
  signals,
  trackHeight,
  width = 180,
  yOffset = 0,
  onSignalSelect,
  onSignalContextMenu,
  className,
}) => {
  const [hoveredSignal, setHoveredSignal] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Calculate maximum characters that fit in the available width
  const maxChars = Math.floor((width - 60) / 8); // Rough estimation: 8px per char

  const handleSignalClick = useCallback((signalId: string) => {
    if (onSignalSelect) {
      onSignalSelect(signalId);
    }
  }, [onSignalSelect]);

  const handleSignalContextMenu = useCallback((signalId: string, event: React.MouseEvent) => {
    event.preventDefault();
    if (onSignalContextMenu) {
      onSignalContextMenu(signalId, event);
    }
  }, [onSignalContextMenu]);

  const handleMouseEnter = useCallback((signalId: string, event: React.MouseEvent) => {
    setHoveredSignal(signalId);
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPosition({
      x: rect.right + 5,
      y: rect.top + rect.height / 2,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredSignal(null);
  }, []);

  // Find the hovered signal for tooltip
  const hoveredSignalData = hoveredSignal ? signals.find(s => s.id === hoveredSignal) : null;

  return (
    <div 
      className={`${styles.signalLabelsContainer} ${className || ''}`}
      style={{ width, minHeight: signals.length * trackHeight + yOffset }}
    >
      {/* Signal label items */}
      <div className={styles.signalsList} style={{ paddingTop: yOffset }}>
        {signals.map((signal, index) => {
          const yPosition = index * trackHeight;
          const displayName = truncateText(signal.name, maxChars);
          const isNameTruncated = signal.name.length > maxChars;
          const signalColor = getSignalTypeColor(signal);
          const typeIcon = getSignalTypeIcon(signal.type);
          const busNotation = formatSignalTypeDisplay(signal);

          return (
            <div
              key={signal.id}
              className={styles.signalLabel}
              style={{
                height: trackHeight,
                top: yPosition,
              }}
              onClick={() => handleSignalClick(signal.id)}
              onContextMenu={(e) => handleSignalContextMenu(signal.id, e)}
              onMouseEnter={(e) => handleMouseEnter(signal.id, e)}
              onMouseLeave={handleMouseLeave}
              role="button"
              tabIndex={0}
              aria-label={`Signal: ${signal.name}, Type: ${signal.type}`}
            >
              {/* Signal type icon */}
              <div 
                className={styles.signalIcon}
                style={{ color: signalColor }}
                title={signal.type}
              >
                {typeIcon}
              </div>

              {/* Signal name */}
              <div className={styles.signalName}>
                <span className={styles.signalNameText} title={isNameTruncated ? signal.name : undefined}>
                  {displayName}
                </span>
                {busNotation && (
                  <span className={styles.busNotation}>
                    {busNotation}
                  </span>
                )}
              </div>

              {/* Visual indicator line */}
              <div 
                className={styles.signalIndicator}
                style={{ backgroundColor: signalColor }}
              />
            </div>
          );
        })}
      </div>

      {/* Tooltip for truncated names and additional info */}
      {hoveredSignalData && (
        <div 
          className={styles.tooltip}
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateY(-50%)',
            zIndex: 1000,
          }}
        >
          <div className={styles.tooltipContent}>
            <div className={styles.tooltipTitle}>{hoveredSignalData.name}</div>
            <div className={styles.tooltipInfo}>
              <span>Type: {hoveredSignalData.type}</span>
              {hoveredSignalData.metadata?.description && (
                <span>Description: {hoveredSignalData.metadata.description}</span>
              )}
              {hoveredSignalData.metadata?.clockDomain && (
                <span>Clock Domain: {hoveredSignalData.metadata.clockDomain}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalLabels; 