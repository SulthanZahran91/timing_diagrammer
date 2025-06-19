import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { MeasurementData } from '../types';

interface MeasurementDisplayProps {
  measurements: MeasurementData | null;
  position?: 'floating' | 'fixed';
  className?: string;
}

export function MeasurementDisplay({
  measurements,
  position = 'floating',
  className
}: MeasurementDisplayProps) {
  if (!measurements) {
    return (
      <div className={cn(
        'bg-gray-50 border border-gray-200 rounded-lg p-3',
        'text-sm text-gray-500 text-center',
        position === 'floating' && 'absolute top-4 right-4 z-10',
        className
      )}>
        Place 2+ cursors to measure
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[250px]',
      position === 'floating' && 'absolute top-4 right-4 z-10',
      className
    )}>
      <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
        Measurements
      </h3>
      
      <div className="space-y-3">
        {/* Time Difference */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Time Difference:</span>
          <span className="text-sm font-mono font-medium text-blue-600">
            {measurements.formattedTime}
          </span>
        </div>

        {/* Frequency */}
        {measurements.frequency && measurements.frequency > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Frequency:</span>
            <span className="text-sm font-mono font-medium text-green-600">
              {measurements.formattedFrequency}
            </span>
          </div>
        )}

        {/* Cursor Positions */}
        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="text-xs text-gray-500 mb-2">Cursor Positions:</div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-red-600">● Cursor A:</span>
              <span className="font-mono">{measurements.cursorA.toFixed(1)}px</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-blue-600">● Cursor B:</span>
              <span className="font-mono">{measurements.cursorB.toFixed(1)}px</span>
            </div>
          </div>
        </div>

        {/* Delta Information */}
        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="text-xs text-gray-500 mb-2">Delta:</div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Distance:</span>
            <span className="font-mono">
              {Math.abs(measurements.cursorB - measurements.cursorA).toFixed(1)}px
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 