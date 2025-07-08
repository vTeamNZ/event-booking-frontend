# Advanced Venue Designer

A comprehensive React component for designing venue layouts with drag-and-drop functionality, built with Konva.js and React Konva.

## Features

### Core Functionality
- **Interactive Canvas**: Pan, zoom, and interact with venue elements
- **Drag & Drop**: Move elements around the canvas with snap-to-grid support
- **Multiple Element Types**: Seats, tables, stage, walls, pillars, bars, entrances, exits
- **Grid System**: Toggleable grid with snap-to-grid functionality
- **Section Management**: Organize elements into sections with different pricing

### Element Types
- **Seats**: Individual seating with numbering and row letters
- **Tables**: Round/square/rectangle tables with capacity settings
- **Stage**: Performance area with customizable dimensions
- **Walls**: Structural elements for venue boundaries
- **Pillars**: Circular structural elements
- **Bars**: Service areas
- **Entrances/Exits**: Access points and emergency exits

### Tools & Controls
- **Selection Tool**: Select single or multiple elements
- **Element Tools**: Click-to-add tools for each element type
- **Properties Panel**: Edit element properties (color, price, capacity, etc.)
- **Section Panel**: Create and manage venue sections

### Keyboard Shortcuts
- `Delete/Backspace`: Delete selected elements
- `Ctrl+A`: Select all elements
- `Ctrl+C`: Copy selected elements
- `Ctrl+V`: Paste copied elements
- `G`: Toggle grid visibility
- `Esc`: Clear selection and reset tool
- `Ctrl+S`: Save layout (hook for custom save functionality)

### Templates & Quick Actions
- **Theater Template**: Generate rows of seats automatically
- **Banquet Template**: Generate table layouts
- **Auto-arrange**: Organize selected seats in rows
- **Copy/Paste**: Duplicate elements easily

## Usage

```tsx
import AdvancedVenueDesigner, { VenueLayoutData } from './components/venue/AdvancedVenueDesigner';

function VenueEditor() {
  const [layout, setLayout] = useState<VenueLayoutData | null>(null);

  const handleLayoutChange = (newLayout: VenueLayoutData) => {
    setLayout(newLayout);
    // Save to backend or local storage
  };

  const handleStagePositionChange = (position: 'top' | 'bottom' | 'left' | 'right') => {
    // Handle stage position change
  };

  return (
    <div className="h-screen">
      <AdvancedVenueDesigner
        selectionMode="1" // 1=theater, 2=banquet, 3=mixed
        onLayoutChange={handleLayoutChange}
        onStagePositionChange={handleStagePositionChange}
        initialLayout={layout}
        maxCapacity={1000}
        venue={{ name: 'My Venue' }}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectionMode` | `string` | `'1'` | Venue type: '1'=theater, '2'=banquet, '3'=mixed |
| `onLayoutChange` | `(layout: VenueLayoutData) => void` | `() => {}` | Callback when layout changes |
| `onStagePositionChange` | `(position: string) => void` | `() => {}` | Callback when stage position changes |
| `initialLayout` | `VenueLayoutData \| null` | `null` | Initial layout data |
| `maxCapacity` | `number` | `1000` | Maximum venue capacity |
| `venue` | `any` | `null` | Venue object with name and other properties |

## Types

### LayoutElement
```tsx
interface LayoutElement {
  id: string;
  type: 'seat' | 'table' | 'stage' | 'aisle' | 'wall' | 'pillar' | 'balcony' | 'bar' | 'entrance' | 'emergency_exit';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  sectionId: string;
  level: number;
  properties: {
    seatNumber?: string;
    rowLetter?: string;
    tableNumber?: number;
    capacity?: number;
    shape?: 'round' | 'square' | 'rectangle' | 'oval';
    color?: string;
    label?: string;
    basePrice?: number;
    isBookable?: boolean;
    // ... more properties
  };
}
```

### VenueLayoutData
```tsx
interface VenueLayoutData {
  sections: Section[];
  elements: LayoutElement[];
  settings: VenueSettings;
}
```

## Dependencies

- `react` - Core React library
- `react-konva` - React bindings for Konva 2D canvas library
- `konva` - 2D HTML5 Canvas library
- `react-zoom-pan-pinch` - Zoom and pan functionality
- `lucide-react` - Icon library
- `tailwindcss` - Styling (utility classes used)

## Styling

The component uses Tailwind CSS classes for styling. Ensure you have Tailwind CSS configured in your project.

## Performance Considerations

- The component uses React.memo and useCallback for performance optimization
- Grid rendering is memoized to prevent unnecessary re-renders
- Large venues (1000+ elements) should work smoothly with modern browsers

## Browser Support

- Modern browsers with Canvas support
- Chrome/Firefox/Safari/Edge (latest versions)
- Mobile browsers (touch events supported)

## Contributing

When adding new element types:
1. Add the type to the `LayoutElement['type']` union
2. Add default size in `defaultSizes` object
3. Add color mapping in `getElementColor`
4. Add label mapping in `getElementLabel`
5. Add rendering logic in `renderElement` function

## License

This component is part of the event booking system and follows the project's license terms.
