'use client';

import React from 'react';
import Link from 'next/link';
import { TimingDiagramDemo } from '../../components/TimingDiagramDemo';

export default function SignalsPage() {
  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Signal Rendering Engine
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sprint 1 - Digital Signal Visualization with SVG Rendering
          </p>
        </div>

        {/* Demo Container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <TimingDiagramDemo />
        </div>

        {/* Implementation Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Technical Implementation
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <strong>SVG-based rendering:</strong> Crisp signals at all zoom levels with hardware acceleration
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <strong>Efficient path generation:</strong> Optimized coordinate calculations with viewport culling
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <strong>Signal type differentiation:</strong> Visual styling based on signal purpose and characteristics
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <strong>Performance optimization:</strong> Memoized calculations and efficient transition filtering
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Sprint 1 Deliverables Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  React + TypeScript + SVG rendering setup
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Time grid with configurable nanosecond scale
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Digital signals as high/low rectangles
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Y-axis signal labels system
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Multiple signal type support
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Usage Example
          </h3>
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-800 dark:text-gray-200">
              <code>{`import { SignalRenderer } from '../components/SignalRenderer';

const signal = {
  id: 'clk',
  name: 'System Clock',
  type: SignalType.CLOCK,
  transitions: [
    { time: 0, value: 'LOW' },
    { time: 5, value: 'HIGH' },
    { time: 10, value: 'LOW' },
    // ... more transitions
  ],
  style: { color: '#FF6B6B', thickness: 2 }
};

<SignalRenderer
  signal={signal}
  timeScale={10} // 10 pixels per nanosecond
  yPosition={50}
  viewportStartTime={0}
  viewportEndTime={100}
/>`}</code>
            </pre>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            ← Back to Time Grid Demo
          </Link>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Next: Sprint 2 - Signal Creation & Editing
          </div>
        </div>
      </div>
    </div>
  );
} 