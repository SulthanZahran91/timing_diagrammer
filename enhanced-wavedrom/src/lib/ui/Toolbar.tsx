import React from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { InteractionMode } from '../types';

interface ToolbarProps {
  currentMode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;
  onClearCursors: () => void;
  zoomLevel?: number;
  className?: string;
}

export function Toolbar({
  currentMode,
  onModeChange,
  onZoomIn,
  onZoomOut,
  onFitToView,
  onClearCursors,
  zoomLevel = 1,
  className
}: ToolbarProps) {
  const modes: Array<{ id: InteractionMode; label: string; icon: string }> = [
    { id: 'cursor', label: 'Cursor', icon: '⊕' },
    { id: 'measure', label: 'Measure', icon: '📏' },
    { id: 'zoom', label: 'Zoom', icon: '🔍' },
    { id: 'pan', label: 'Pan', icon: '✋' }
  ];

  return (
    <div className={cn(
      'flex items-center gap-2 p-3 bg-white border-b border-gray-200 shadow-sm',
      className
    )}>
      {/* Mode Selection */}
      <div className="flex items-center gap-1 mr-4">
        <span className="text-sm font-medium text-gray-700 mr-2">Mode:</span>
        {modes.map((mode) => (
          <Button
            key={mode.id}
            variant={currentMode === mode.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onModeChange(mode.id)}
            className="min-w-[80px]"
          >
            <span className="mr-1">{mode.icon}</span>
            {mode.label}
          </Button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 mx-2" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-gray-700 mr-2">Zoom:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          title="Zoom In"
        >
          🔍+
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          🔍-
        </Button>
        <div className="min-w-[60px] text-center text-sm text-gray-600">
          {Math.round(zoomLevel * 100)}%
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onFitToView}
          title="Fit to View"
        >
          ⌂
        </Button>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 mx-2" />

      {/* Cursor Controls */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-gray-700 mr-2">Cursors:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearCursors}
          title="Clear All Cursors"
        >
          🗑️ Clear
        </Button>
      </div>
    </div>
  );
} 