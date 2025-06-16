'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { TimingCanvasWithGrid } from '../components/TimingCanvasWithGrid';
import { TimeRange } from '../types/canvas';

export default function Home() {
  const [timeRange, setTimeRange] = useState<TimeRange>({ start: 0, end: 1000 });

  const handleZoom = useCallback((factor: number) => {
    setTimeRange(currentTimeRange => {
      const { start, end } = currentTimeRange;
      const timeSpan = end - start;
      const centerTime = start + timeSpan / 2;

      // Prevent zooming in too far
      if (timeSpan < 1 && factor < 1) return currentTimeRange;
      // Prevent zooming out too far
      if (timeSpan > 1e9 && factor > 1) return currentTimeRange;

      const newTimeSpan = timeSpan * factor;
      const newStart = centerTime - newTimeSpan / 2;
      const newEnd = centerTime + newTimeSpan / 2;

      return { start: newStart, end: newEnd };
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    handleZoom(1 / 1.5);
  }, [handleZoom]);

  const handleZoomOut = useCallback(() => {
    handleZoom(1.5);
  }, [handleZoom]);

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Timing Diagram Canvas with Time Grid
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sprint 1 - Time Grid Rendering System Implementation
          </p>
        </div>

        {/* Canvas Container */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Interactive Canvas with Dynamic Time Grid
              </h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleZoomOut}
                  className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  aria-label="Zoom out"
                >
                  -
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">Zoom</span>
                <button 
                  onClick={handleZoomIn}
                  className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  aria-label="Zoom in"
                >
                  +
                </button>
              </div>
            </div>
            
            <div style={{ width: '100%', height: '400px' }}>
              <TimingCanvasWithGrid
                width={800}
                height={400}
                timeRange={timeRange}
                signalCount={4}
                timeUnit="ns"
              />
            </div>
          </div>
        </div>

        {/* Features Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Time Grid Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Dynamic tick calculation based on zoom level</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Major and minor grid lines with visual hierarchy</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Time labels with unit display (ns, μs, cycles)</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Adaptive density to prevent overcrowding</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Current Configuration
            </h3>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time Range:</span>
                <span className="text-gray-900 dark:text-white">
                  {timeRange.start.toFixed(2)} - {timeRange.end.toFixed(2)} ns
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time Unit:</span>
                <span className="text-gray-900 dark:text-white">nanoseconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Signal Count:</span>
                <span className="text-gray-900 dark:text-white">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Canvas Size:</span>
                <span className="text-gray-900 dark:text-white">800 × 400 px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Implemented Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Dynamic time grid with optimal tick calculation
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Major/minor grid lines visual hierarchy
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Time labels with configurable units
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Performance optimized rendering
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Accessibility support (ARIA labels)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Responsive design & print styles
              </span>
            </div>
          </div>
        </div>

        {/* Navigation to Signal Renderer */}
        <div className="mt-8 text-center">
          <Link 
            href="/signals" 
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            View Signal Rendering Demo →
          </Link>
        </div>
      </div>
    </div>
  );
}
