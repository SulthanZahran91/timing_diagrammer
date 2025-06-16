'use client';

import React from 'react';
import { TimingCanvas } from './TimingCanvas';
import { SignalRenderer } from './SignalRenderer';
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
const LABEL_OFFSET = 150; // Space reserved for signal labels

/**
 * Demo component showcasing the SignalRenderer with various signal types.
 * This demonstrates the core functionality from Sprint 1.
 */
export const TimingDiagramDemo: React.FC = () => {
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
  const timeScale = (CANVAS_WIDTH - LABEL_OFFSET) / (timeRange.end - timeRange.start); // Leave space for labels

  return (
    <div className="timing-diagram-demo">
      <h2>Timing Diagram Signal Renderer Demo</h2>
      <p>Showcasing different signal types: Power, Clock, Control, Data, and Bus signals</p>
      
      <div style={{ position: 'relative', margin: '20px 0' }}>
        <TimingCanvas
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          timeRange={timeRange}
          signalCount={demoSignals.length}
        >
          {/* Background area for signals */}
          <rect
            x={LABEL_OFFSET}
            y={Y_PADDING}
            width={CANVAS_WIDTH - LABEL_OFFSET - 20}
            height={demoSignals.length * SIGNAL_HEIGHT}
            fill="#fafafa"
            stroke="#e0e0e0"
            strokeWidth={1}
          />
          
          {/* Simple grid lines instead of TimeGrid component for now */}
          <g>
            {/* Vertical grid lines every 10ns */}
            {Array.from({ length: 6 }, (_, i) => i * 10).map(time => (
              <line
                key={`grid-${time}`}
                x1={LABEL_OFFSET + time * timeScale}
                y1={Y_PADDING}
                x2={LABEL_OFFSET + time * timeScale}
                y2={CANVAS_HEIGHT - 60}
                stroke="#e0e0e0"
                strokeWidth={1}
                strokeDasharray="2,2"
              />
            ))}
          </g>
          
          {/* Render each signal */}
          {demoSignals.map((signal, index) => (
            <g key={signal.id} transform={`translate(${LABEL_OFFSET}, 0)`}>
              <SignalRenderer
                signal={signal}
                timeScale={timeScale}
                yPosition={Y_PADDING + index * SIGNAL_HEIGHT + SIGNAL_HEIGHT / 2}
                viewportStartTime={timeRange.start}
                viewportEndTime={timeRange.end}
              />
            </g>
          ))}
          
          {/* Signal labels - positioned properly on Y-axis */}
          {demoSignals.map((signal, index) => (
            <text
              key={`label-${signal.id}`}
              x={LABEL_OFFSET - 10}
              y={Y_PADDING + index * SIGNAL_HEIGHT + SIGNAL_HEIGHT / 2 + 6}
              fontSize="13"
              fontFamily="Arial, sans-serif"
              fill="#333"
              fontWeight="600"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {signal.name}
            </text>
          ))}
          
          {/* Time axis labels */}
          <g transform={`translate(0, ${CANVAS_HEIGHT - 40})`}>
            {[0, 10, 20, 30, 40, 50].map(time => (
              <g key={time}>
                <text
                  x={LABEL_OFFSET + time * timeScale}
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
                  x1={LABEL_OFFSET + time * timeScale}
                  y1={10}
                  x2={LABEL_OFFSET + time * timeScale}
                  y2={20}
                  stroke="#ccc"
                  strokeWidth={1}
                />
              </g>
            ))}
          </g>
        </TimingCanvas>
      </div>

      {/* Signal type legend */}
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Signal Types Demonstrated:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '3px', backgroundColor: '#F38BA8' }}></div>
            <span><strong>Power:</strong> VDD supply signal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '2px', backgroundColor: '#FF6B6B' }}></div>
            <span><strong>Clock:</strong> 100MHz system clock</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '1.5px', backgroundColor: '#4ECDC4' }}></div>
            <span><strong>Control:</strong> Chip select signal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '1.5px', backgroundColor: '#45B7D1' }}></div>
            <span><strong>Data:</strong> Serial data output</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '2px', backgroundColor: '#96CEB4' }}></div>
            <span><strong>Bus:</strong> 8-bit address bus</span>
          </div>
        </div>
      </div>

      {/* Feature checklist */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>Sprint 1 Features Implemented:</h3>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>✅ React + TypeScript project with SVG rendering</li>
          <li>✅ Time grid with configurable scale (nanoseconds)</li>
          <li>✅ Digital signals displayed as high/low rectangles</li>
          <li>✅ Signal labels on Y-axis</li>
          <li>✅ Different signal types with appropriate styling</li>
          <li>✅ Clock signals with rising edge markers</li>
          <li>✅ Bus signals with value labels</li>
          <li>✅ Clean coordinate transformation system</li>
        </ul>
      </div>
    </div>
  );
};

export default TimingDiagramDemo; 