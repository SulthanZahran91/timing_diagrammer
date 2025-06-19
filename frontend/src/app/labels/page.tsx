'use client';

import React, { useState, useCallback } from 'react';
import { TimingCanvas } from '../../components/TimingCanvas';
import { SignalRenderer } from '../../components/SignalRenderer';
import { SignalLabels } from '../../components/SignalLabels';
import { 
  exampleClockSignal,
  exampleChipSelectSignal,
  exampleDataSignal,
  exampleBusSignal,
  examplePowerSignal
} from '../../data/examples';

// Constants for layout
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 450;
const SIGNAL_HEIGHT = 60;
const Y_PADDING = 40;
const LABEL_WIDTH = 180;

/**
 * Demo page showcasing the SignalLabels component (F1.6).
 * Demonstrates fixed-position signal labels that don't scroll with the time axis.
 */
export default function SignalLabelsDemo() {
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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1>Y-Axis Signal Labels Demo (F1.6)</h1>
        <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.5' }}>
          This page demonstrates the implementation of fixed-position signal labels that stay in place 
          while the timing canvas can be scrolled horizontally. The labels provide signal type icons, 
          name truncation with tooltips, and interactive features.
        </p>
        
        <div style={{ 
          marginTop: '15px',
          padding: '10px 15px',
          backgroundColor: '#e8f4f8',
          border: '1px solid #b3d9ff',
          borderRadius: '5px'
        }}>
          <strong>Try it:</strong> Hover over signal names to see full details, click to select signals, 
          right-click for context menu options.
        </div>
      </div>
      
      <div style={{ 
        position: 'relative', 
        margin: '30px 0',
        display: 'flex',
        border: '2px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
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
          padding: '20px', 
          backgroundColor: '#e8f4f8',
          border: '1px solid #b3d9ff',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>
            Selected Signal: {demoSignals.find(s => s.id === selectedSignal)?.name}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div><strong>Type:</strong> {demoSignals.find(s => s.id === selectedSignal)?.type}</div>
            <div><strong>Color:</strong> {demoSignals.find(s => s.id === selectedSignal)?.style.color}</div>
            <div><strong>Transitions:</strong> {demoSignals.find(s => s.id === selectedSignal)?.transitions.length}</div>
            <div><strong>ID:</strong> {selectedSignal}</div>
          </div>
        </div>
      )}

      {/* Feature documentation */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>F1.6 Features Implemented</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginTop: '15px' }}>
          <div>
            <h4>🔗 Fixed Position</h4>
            <p>Signal labels remain fixed on the left side and don't scroll horizontally with the timing canvas.</p>
          </div>
          <div>
            <h4>📐 Perfect Alignment</h4>
            <p>Labels are precisely aligned with their corresponding signal tracks at all zoom levels.</p>
          </div>
          <div>
            <h4>✂️ Text Handling</h4>
            <p>Long signal names are truncated with ellipsis and show full names in hover tooltips.</p>
          </div>
          <div>
            <h4>🎯 Type Icons</h4>
            <p>Signal type icons provide visual distinction: ⏰ Clock, → Data, ⚡ Control, ⇶ Bus, ⚡ Power.</p>
          </div>
          <div>
            <h4>📏 Consistent Spacing</h4>
            <p>Maintains perfect spacing and alignment with the main signal rendering area.</p>
          </div>
          <div>
            <h4>🖱️ Interactive</h4>
            <p>Click to select signals, right-click for context menu, hover for detailed tooltips.</p>
          </div>
        </div>
      </div>

      {/* Technical implementation */}
      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Technical Implementation</h2>
        <div style={{ marginTop: '15px' }}>
          <h3>Component Usage:</h3>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '6px',
            fontSize: '13px',
            overflow: 'auto',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace'
          }}>
{`import { SignalLabels } from '../components/SignalLabels';

<div className="timing-diagram-container">
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

        <div style={{ marginTop: '20px' }}>
          <h3>Key Features:</h3>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>Type Safety:</strong> Full TypeScript support with proper interfaces</li>
            <li><strong>Performance:</strong> Optimized rendering with React.useCallback for event handlers</li>
            <li><strong>Accessibility:</strong> ARIA labels, keyboard navigation, screen reader support</li>
            <li><strong>Responsive:</strong> Adapts to different screen sizes and supports dark/light themes</li>
            <li><strong>Extensible:</strong> Clean API with optional props for customization</li>
          </ul>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="/" 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007acc', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '5px',
              fontWeight: '500'
            }}
          >
            ← Home
          </a>
          <a 
            href="/signals" 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '5px',
              fontWeight: '500'
            }}
          >
            Signal Renderer Demo →
          </a>
        </div>
      </div>
    </div>
  );
} 