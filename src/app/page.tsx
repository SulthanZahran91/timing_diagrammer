'use client';

import React, { useState } from 'react';
import { TimingCanvas } from '../components/TimingCanvas';
import { LogicalCoordinates } from '../types/canvas';

export default function Home() {
  const [mousePosition, setMousePosition] = useState<LogicalCoordinates | null>(null);
  const [clickPosition, setClickPosition] = useState<LogicalCoordinates | null>(null);

  const handleMouseMove = (event: React.MouseEvent, logicalCoords: LogicalCoordinates) => {
    setMousePosition(logicalCoords);
  };

  const handleMouseClick = (event: React.MouseEvent, logicalCoords: LogicalCoordinates) => {
    setClickPosition(logicalCoords);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Timing Diagram Canvas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sprint 1 - Task F1.2: Core Canvas Component Implementation
          </p>
        </div>

        {/* Canvas Container */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Interactive Canvas
            </h2>
            
            <div style={{ width: '100%', height: '400px' }}>
              <TimingCanvas
                width={800}
                height={400}
                timeRange={{ start: 0, end: 1000 }} // 1000 nanoseconds
                signalCount={4}
                onMouseMove={handleMouseMove}
                onMouseClick={handleMouseClick}
              />
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Mouse Position
            </h3>
            {mousePosition ? (
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Time:</span>
                  <span className="text-gray-900 dark:text-white">
                    {mousePosition.time.toFixed(2)} ns
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Signal:</span>
                  <span className="text-gray-900 dark:text-white">
                    {mousePosition.signal}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Move mouse over canvas to see coordinates
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Last Click
            </h3>
            {clickPosition ? (
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Time:</span>
                  <span className="text-gray-900 dark:text-white">
                    {clickPosition.time.toFixed(2)} ns
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Signal:</span>
                  <span className="text-gray-900 dark:text-white">
                    {clickPosition.signal}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Click on canvas to see coordinates
              </p>
            )}
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
                SVG-based canvas rendering
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Coordinate transformation system
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Mouse event handling
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Responsive design
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                TypeScript type safety
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Ready for signal rendering
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
