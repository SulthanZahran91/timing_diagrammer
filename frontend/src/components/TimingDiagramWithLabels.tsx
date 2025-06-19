'use client';

import React, { useState, useCallback } from 'react';
import { TimingCanvas } from './TimingCanvas';
import { SignalRenderer } from './SignalRenderer';
import { SignalLabels } from './SignalLabels';
import { 
  exampleClockSignal,
  exampleChipSelectSignal,
  exampleDataSignal,
  exampleBusSignal,
  examplePowerSignal
} from '../data/examples';

// Constants for layout
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 450;
const SIGNAL_HEIGHT = 60;
const Y_PADDING = 40;
const LABEL_WIDTH = 180;

/**
 * Demo component showcasing the SignalLabels component integrated with TimingCanvas.
 * This demonstrates the F1.6 implementation: Y-Axis Signal Labels.
 */
export const TimingDiagramWithLabels: React.FC = () => {
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);

  // Demo signals array with different signal types
  const demoSignals = [
    examplePowerSignal,
    exampleClockSignal,
    exampleChipSelectSignal,
    exampleDataSignal,
    exampleBusSignal,
  ];

  // Calculate time range based on signal data
  const timeRange = {
    start: 0,
    end: 50, // 50 nanoseconds for demo
  };

  // Time scale: pixels per nanosecond
  const timeScale = (CANVAS_WIDTH - LABEL_WIDTH) / (timeRange.end - timeRange.start);

  const handleSignalSelect = useCallback((signalId: string) => {
    setSelectedSignal(prev => prev === signalId ? null : signalId);
    console.log('Signal selected:', signalId);
  }, []);

  const handleSignalContextMenu = useCallback((signalId: string, event: React.MouseEvent) => {
    console.log('Signal context menu:', signalId, event);
    // Here you would typically show a context menu
  }, []);

  return (
    <div className="timing-diagram-with-labels">
      <h2>Timing Diagram with Y-Axis Signal Labels (F1.6)</h2>
      <p>Demonstrates fixed-position signal labels that don't scroll with the time axis</p>
      
      <div style={{ 
        position: 'relative', 
        margin: '20px 0',
        display: 'flex',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff'
      }}>
        {/* Fixed Signal Labels on the left */}
        <SignalLabels
          signals={demoSignals}
          trackHeight={SIGNAL_HEIGHT}
          width={LABEL_WIDTH}
          yOffset={Y_PADDING}
          onSignalSelect={handleSignalSelect}
          onSignalContextMenu={handleSignalContextMenu}
        />
        
        {/* Main Timing Canvas */}
        <div style={{ flex: 1 }}>
          <TimingCanvas
            width={CANVAS_WIDTH - LABEL_WIDTH}
            height={CANVAS_HEIGHT}
            timeRange={timeRange}
            signalCount={demoSignals.length}
          >
            {/* Background area for signals */}
            <rect
              x={0}
              y={Y_PADDING}
              width={CANVAS_WIDTH - LABEL_WIDTH - 20}
              height={demoSignals.length * SIGNAL_HEIGHT}
              fill="#fafafa"
              stroke="#e0e0e0"
              strokeWidth={1}
            />
            
            {/* Simple grid lines */}
            <g>
              {/* Vertical grid lines every 10ns */}
              {Array.from({ length: 6 }, (_, i) => i * 10).map(time => (
                <line
                  key={`grid-${time}`}
                  x1={time * timeScale}
                  y1={Y_PADDING}
                  x2={time * timeScale}
                  y2={CANVAS_HEIGHT - 60}
                  stroke="#e0e0e0"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
              ))}
            </g>
            
            {/* Render each signal */}
            {demoSignals.map((signal, index) => (
              <SignalRenderer
                key={signal.id}
                signal={signal}
                timeScale={timeScale}
                yPosition={Y_PADDING + index * SIGNAL_HEIGHT + SIGNAL_HEIGHT / 2}
                viewportStartTime={timeRange.start}
                viewportEndTime={timeRange.end}
                highlighted={selectedSignal === signal.id}
              />
            ))}
            
            {/* Time axis labels */}
            <g transform={`translate(0, ${CANVAS_HEIGHT - 40})`}>
              {[0, 10, 20, 30, 40, 50].map(time => (
                <g key={time}>
                  <text
                    x={time * timeScale}
                    y={25}
                    fontSize="11"
                    fontFamily="monospace"
                    fill="#666"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {time}ns
                  </text>
                  <line
                    x1={time * timeScale}
                    y1={10}
                    x2={time * timeScale}
                    y2={20}
                    stroke="#ccc"
                    strokeWidth={1}
                  />
                </g>
              ))}
            </g>
          </TimingCanvas>
        </div>
      </div>

      {/* Selected signal info */}
      {selectedSignal && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#e8f4f8',
          border: '1px solid #b3d9ff',
          borderRadius: '5px'
        }}>
          <h4>Selected Signal: {demoSignals.find(s => s.id === selectedSignal)?.name}</h4>
          <p>
            Type: {demoSignals.find(s => s.id === selectedSignal)?.type} | 
            Color: {demoSignals.find(s => s.id === selectedSignal)?.style.color} |
            Transitions: {demoSignals.find(s => s.id === selectedSignal)?.transitions.length}
          </p>
        </div>
      )}

      {/* Feature documentation */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>F1.6 Features Implemented:</h3>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>✅ <strong>Fixed-position signal labels</strong> - Labels don't scroll horizontally with time axis</li>
          <li>✅ <strong>Precise alignment</strong> - Labels align perfectly with signal tracks</li>
          <li>✅ <strong>Long name handling</strong> - Text truncation with hover tooltips for full names</li>
          <li>✅ <strong>Signal type icons</strong> - Visual indicators for different signal types (⏰ Clock, → Data, ⚡ Control, ⇶ Bus)</li>
          <li>✅ <strong>Consistent spacing</strong> - Maintains alignment with main signal rendering area</li>
          <li>✅ <strong>Interactive features</strong> - Click to select signals, right-click for context menu</li>
          <li>✅ <strong>Visual feedback</strong> - Hover effects, color-coded indicators, tooltips</li>
          <li>✅ <strong>Responsive design</strong> - Supports different screen sizes and themes</li>
        </ul>
      </div>

      {/* Usage example */}
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Usage Example:</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto'
        }}>
{`<div className="timing-diagram-container">
  <SignalLabels 
    signals={signalData} 
    trackHeight={60}
    width={180}
    yOffset={40}
    onSignalSelect={handleSignalSelect}
    onSignalContextMenu={handleContextMenu}
  />
  <TimingCanvas signals={signalData} />
</div>`}
        </pre>
      </div>
    </div>
  );
};

export default TimingDiagramWithLabels; 