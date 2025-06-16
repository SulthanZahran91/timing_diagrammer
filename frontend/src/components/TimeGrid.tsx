'use client';

import React, { memo, useMemo } from 'react';
import { TimeGridProps } from '../types/canvas';
import { generateGridConfig } from '../utils/timeGridUtils';
import styles from './TimeGrid.module.css';

/**
 * TimeGrid component renders vertical grid lines and time labels
 * Automatically adjusts tick density based on zoom level
 */
export const TimeGrid: React.FC<TimeGridProps> = memo(({
  width,
  height,
  timeUnit,
  startTime,
  endTime,
  canvasTransforms,
}) => {
  // Calculate grid configuration with memoization for performance
  const gridConfig = useMemo(() => {
    return generateGridConfig(
      startTime,
      endTime,
      canvasTransforms,
      timeUnit,
      width
    );
  }, [startTime, endTime, canvasTransforms, timeUnit, width]);

  // Calculate label positioning to prevent overlap
  const visibleLabels = useMemo(() => {
    const labelSpacing = 60; // Minimum pixels between labels
    const labels = [];
    let lastLabelPosition = -labelSpacing;

    for (const tick of gridConfig.majorTicks) {
      if (tick.label && tick.position - lastLabelPosition >= labelSpacing) {
        labels.push(tick);
        lastLabelPosition = tick.position;
      }
    }

    return labels;
  }, [gridConfig.majorTicks]);

  return (
    <g 
      className={styles.timeGrid} 
      role="grid" 
      aria-label={`Time grid in ${timeUnit}`}
    >
      {/* Minor grid lines */}
      {gridConfig.minorTicks.map((tick, index) => (
        <line
          key={`minor-${index}-${tick.time}`}
          className={styles.minorTick}
          x1={tick.position}
          y1={0}
          x2={tick.position}
          y2={height}
          role="gridcell"
          aria-label={`Minor grid line at ${tick.time}${timeUnit}`}
        />
      ))}

      {/* Major grid lines */}
      {gridConfig.majorTicks.map((tick, index) => (
        <line
          key={`major-${index}-${tick.time}`}
          className={styles.majorTick}
          x1={tick.position}
          y1={0}
          x2={tick.position}
          y2={height}
          role="gridcell"
          aria-label={`Major grid line at ${tick.time}${timeUnit}`}
        />
      ))}

      {/* Time labels */}
      {visibleLabels.map((tick, index) => (
        <text
          key={`label-${index}-${tick.time}`}
          className={styles.timeLabel}
          x={tick.position}
          y={height - 8}
          textAnchor="middle"
          dominantBaseline="baseline"
          role="gridcell"
          aria-label={`Time label: ${tick.label}`}
        >
          {tick.label}
        </text>
      ))}

      {/* Grid baseline */}
      <line
        className={styles.baseline}
        x1={0}
        y1={height - 20}
        x2={width}
        y2={height - 20}
      />
    </g>
  );
});

TimeGrid.displayName = 'TimeGrid'; 