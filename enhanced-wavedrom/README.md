# Enhanced WaveDrom

An interactive timing diagram analysis tool that extends WaveDrom functionality with advanced interactive features for precise timing measurements and analysis.

## Features

### 🎯 Interactive Cursor System
- **Multiple Cursors**: Place up to 4 color-coded measurement cursors
- **Drag & Drop**: Smooth cursor repositioning with visual feedback  
- **Snap-to-Edge**: Automatic snapping to signal transitions for precise measurements
- **Real-time Updates**: Live measurement calculations as cursors move

### 🔍 Zoom & Pan Controls
- **Mouse Wheel Zoom**: Zoom in/out centered on cursor position
- **Pan Support**: Click and drag to navigate large diagrams
- **Zoom Limits**: Configurable zoom range (10%-1000%)
- **Fit to View**: One-click to fit entire diagram in viewport

### 📏 Real-time Measurements
- **Time Differences**: Automatic calculation between cursors
- **Frequency Analysis**: Period-to-frequency conversion
- **Smart Formatting**: Auto-format units (ps, ns, μs, ms, s)
- **Multiple Cursors**: Measurements between first two cursors

### 🎨 Modern UI Components
- **Interactive Toolbar**: Mode switching and zoom controls
- **Floating Measurements**: Real-time measurement display panel
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support

## Installation

### Using Bun (Recommended)

```bash
bun install enhanced-wavedrom
```

### Using npm

```bash
npm install enhanced-wavedrom
```

### Peer Dependencies

Enhanced WaveDrom requires WaveDrom as a peer dependency:

```bash
bun add wavedrom@^3.5.0
# or
npm install wavedrom@^3.5.0
```

## Usage

### Basic Usage

```typescript
import { EnhancedWaveDrom } from 'enhanced-wavedrom';
import type { WaveJSON } from 'enhanced-wavedrom';

const waveJSON: WaveJSON = {
  signal: [
    { name: "clk", wave: "p.....|..." },
    { name: "Data", wave: "x.345x|=.x", data: ["head", "body", "tail"] },
    { name: "Request", wave: "0.1..0|1.0" }
  ]
};

const container = document.getElementById('diagram-container');
const enhanced = new EnhancedWaveDrom(container, waveJSON, {
  interactive: true,
  cursors: true,
  zoom: true,
  pan: true
});
```

### React Integration

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { EnhancedWaveDrom } from 'enhanced-wavedrom';
import type { MeasurementData, InteractionMode } from 'enhanced-wavedrom';

function TimingDiagram({ waveJSON }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [enhanced, setEnhanced] = useState<EnhancedWaveDrom | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementData | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const instance = new EnhancedWaveDrom(containerRef.current, waveJSON, {
      interactive: true,
      cursors: true,
      maxCursors: 4,
      cursorColors: ['#ff0000', '#0066cc', '#00cc66', '#ffcc00']
    });

    instance.on('measurement-changed', setMeasurements);
    setEnhanced(instance);

    return () => instance.destroy();
  }, [waveJSON]);

  return (
    <div>
      <div ref={containerRef} />
      {measurements && (
        <div className="measurements">
          <p>Time: {measurements.formattedTime}</p>
          <p>Frequency: {measurements.formattedFrequency}</p>
        </div>
      )}
    </div>
  );
}
```

### Standalone HTML

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/wavedrom@^3.5.0/wavedrom.min.js"></script>
  <script src="https://unpkg.com/enhanced-wavedrom/dist/index.js"></script>
</head>
<body>
  <div id="wavedrom-container"></div>
  
  <script>
    const waveJSON = {
      signal: [
        { name: "clk", wave: "p.....|..." },
        { name: "data", wave: "x.345x|=.x" }
      ]
    };
    
    const enhanced = new EnhancedWaveDrom.EnhancedWaveDrom(
      document.getElementById('wavedrom-container'),
      waveJSON
    );
  </script>
</body>
</html>
```

## API Reference

### EnhancedWaveDrom Class

#### Constructor

```typescript
new EnhancedWaveDrom(container: HTMLElement, waveJson: WaveJSON, options?: EnhancedOptions)
```

#### Methods

- `addCursor(x: number): void` - Add cursor at x position
- `removeCursor(index: number): void` - Remove cursor by index
- `zoom(factor: number, centerX?: number, centerY?: number): void` - Zoom diagram
- `pan(deltaX: number, deltaY: number): void` - Pan diagram
- `setMode(mode: InteractionMode): void` - Set interaction mode
- `getMeasurements(): MeasurementData | null` - Get current measurements
- `fitToView(): void` - Fit diagram to container
- `clearCursors(): void` - Remove all cursors
- `on<T>(event: T, callback: (data: EventData[T]) => void): void` - Subscribe to events
- `off<T>(event: T, callback: (data: EventData[T]) => void): void` - Unsubscribe from events
- `destroy(): void` - Clean up instance

#### Configuration Options

```typescript
interface EnhancedOptions {
  interactive?: boolean;        // Enable interactive features
  cursors?: boolean;           // Enable cursor system
  zoom?: boolean;              // Enable zoom functionality
  pan?: boolean;               // Enable pan functionality
  maxCursors?: number;         // Maximum number of cursors (default: 4)
  cursorColors?: string[];     // Cursor color array
  snapToEdge?: boolean;        // Enable snap-to-edge
  zoomLimits?: { min: number; max: number }; // Zoom range
}
```

### Events

Enhanced WaveDrom emits the following events:

- `cursor-added` - New cursor placed
- `cursor-moved` - Cursor position changed
- `cursor-removed` - Cursor deleted
- `measurement-changed` - Measurements updated
- `zoom-changed` - Zoom level changed
- `pan-changed` - View panned
- `mode-changed` - Interaction mode changed

```typescript
enhanced.on('measurement-changed', (data: MeasurementData) => {
  console.log(`Time: ${data.formattedTime}, Freq: ${data.formattedFrequency}`);
});
```

## Interaction Modes

### Cursor Mode
- **Left Click**: Place measurement cursor
- **Right Click**: Remove nearest cursor
- **Drag Cursor**: Reposition existing cursor

### Zoom Mode  
- **Mouse Wheel**: Zoom in/out
- **Left Click**: Zoom in at click point

### Pan Mode
- **Click & Drag**: Pan the view
- **Mouse Wheel**: Zoom in/out

## Development

### Prerequisites
- Node.js 18+ or Bun
- TypeScript 5+

### Setup

```bash
git clone https://github.com/your-repo/enhanced-wavedrom
cd enhanced-wavedrom
bun install
```

### Development Scripts

```bash
bun dev          # Start Next.js development server
bun build        # Build Next.js application  
bun build:lib    # Build library for distribution
bun test         # Run tests with Jest
bun lint         # Run ESLint
```

### Project Structure

```
enhanced-wavedrom/
├── src/
│   ├── lib/                    # Core library (distributable)
│   │   ├── index.ts           # Main exports
│   │   ├── EnhancedWaveDrom.ts # Main wrapper class
│   │   ├── types.ts           # TypeScript definitions
│   │   ├── interactive/       # Interactive components
│   │   │   ├── InteractiveLayer.ts
│   │   │   ├── MeasurementCursor.ts
│   │   │   └── ZoomPanController.ts
│   │   ├── ui/                # React UI components
│   │   │   ├── Toolbar.tsx
│   │   │   └── MeasurementDisplay.tsx
│   │   └── utils/             # Utility functions
│   │       ├── EventManager.ts
│   │       ├── SVGUtils.ts
│   │       ├── TimingUtils.ts
│   │       └── cn.ts
│   ├── components/ui/         # Shared UI components
│   │   └── Button.tsx
│   ├── app/                   # Next.js demo app
│   │   └── page.tsx
│   └── styles/
│       └── enhanced-wavedrom.css
├── examples/
│   └── basic-usage.html       # Standalone demo
└── dist/                      # Built library files
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+ 
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Add tests for new features
- Update documentation
- Ensure responsive design
- Test across browsers

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [WaveDrom](https://wavedrom.com/) - The original timing diagram library
- [Next.js](https://nextjs.org/) - React framework for the demo
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## Roadmap

- [ ] Signal analysis tools
- [ ] Export to PNG/PDF
- [ ] Waveform editor
- [ ] Protocol analysis
- [ ] Plugin system
- [ ] Custom themes

---

**Enhanced WaveDrom** - Making timing analysis interactive and precise.
