'use client';

import React, { useEffect, useRef, useState } from 'react';
import { EnhancedWaveDrom } from '@/lib';
import { Toolbar } from '@/lib/ui/Toolbar';
import { MeasurementDisplay } from '@/lib/ui/MeasurementDisplay';
import type { InteractionMode, MeasurementData, WaveJSON } from '@/lib/types';

// Sample WaveJSON data
const sampleWaveJSON: WaveJSON = {
  signal: [
    { name: "clk", wave: "p.....|..." },
    { name: "Data", wave: "x.345x|=.x", data: ["head", "body", "tail", "data"] },
    { name: "Request", wave: "0.1..0|1.0" },
    { name: "Acknowledge", wave: "1.....|01." }
  ]
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [enhancedWaveDrom, setEnhancedWaveDrom] = useState<EnhancedWaveDrom | null>(null);
  const [currentMode, setCurrentMode] = useState<InteractionMode>('cursor');
  const [measurements, setMeasurements] = useState<MeasurementData | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const instance = new EnhancedWaveDrom(
      containerRef.current,
      sampleWaveJSON,
      {
        interactive: true,
        cursors: true,
        zoom: true,
        pan: true
      }
    );

    // Set up event listeners
    instance.on('measurement-changed', (data) => {
      setMeasurements(data);
    });

    instance.on('mode-changed', ({ newMode }) => {
      setCurrentMode(newMode);
    });

    instance.on('zoom-changed', ({ level }) => {
      setZoomLevel(level);
    });

    setEnhancedWaveDrom(instance);

    return () => {
      instance.destroy();
    };
  }, []);

  const handleModeChange = (mode: InteractionMode) => {
    enhancedWaveDrom?.setMode(mode);
  };

  const handleZoomIn = () => {
    enhancedWaveDrom?.zoom(1.2);
  };

  const handleZoomOut = () => {
    enhancedWaveDrom?.zoom(0.8);
  };

  const handleFitToView = () => {
    enhancedWaveDrom?.fitToView();
  };

  const handleClearCursors = () => {
    enhancedWaveDrom?.clearCursors();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enhanced WaveDrom</h1>
              <p className="mt-1 text-sm text-gray-500">
                Interactive timing diagram analysis tool
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        {enhancedWaveDrom && (
          <Toolbar
            currentMode={currentMode}
            onModeChange={handleModeChange}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitToView={handleFitToView}
            onClearCursors={handleClearCursors}
            zoomLevel={zoomLevel}
            className="mb-4"
          />
        )}

        {/* Diagram Container */}
        <div className="relative bg-white rounded-lg shadow-lg border overflow-hidden">
          <div 
            ref={containerRef} 
            className="w-full min-h-[400px] relative"
          />
          
          {/* Measurement Display Overlay */}
          {enhancedWaveDrom && (
            <MeasurementDisplay
              measurements={measurements}
              position="floating"
            />
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Interaction Modes</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Cursor:</strong> Click to place measurement cursors</li>
                <li><strong>Measure:</strong> Enhanced measurement mode with snapping</li>
                <li><strong>Zoom:</strong> Mouse wheel to zoom, click to zoom in</li>
                <li><strong>Pan:</strong> Click and drag to pan the view</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Controls</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Left Click:</strong> Place cursor / Zoom in</li>
                <li><strong>Right Click:</strong> Remove nearest cursor</li>
                <li><strong>Drag:</strong> Move cursors or pan view</li>
                <li><strong>Mouse Wheel:</strong> Zoom in/out</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
