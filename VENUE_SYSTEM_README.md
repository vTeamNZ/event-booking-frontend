# Advanced Venue Management System

## Overview

This is a comprehensive, industry-standard venue layout design and seat selection system that supports multiple types of event configurations. The system provides powerful tools for venue administrators to create sophisticated layouts and for customers to easily select seats or tables.

## Features

### 🏗️ Advanced Venue Designer
- **Drag & Drop Interface**: Intuitive visual design tools
- **Multi-Level Support**: Ground floor, balcony, mezzanine levels
- **Flexible Elements**: Seats, tables, stages, aisles, walls, pillars, bars, entrances, emergency exits
- **Quick Patterns**: Pre-built layouts for theater, banquet, conference, and classroom styles
- **Section Management**: VIP, Premium, General sections with different pricing
- **Real-time Statistics**: Live capacity, accessibility, and layout metrics
- **Template System**: Save and reuse venue layouts

### 💺 Intelligent Seat Selection
- **Real-time Availability**: Live seat status updates
- **Section-based Pricing**: Dynamic pricing based on seat location and section
- **Accessibility Support**: Clear indicators for wheelchair accessible seats
- **Group Selection**: Select entire rows or sections at once
- **VIP Highlighting**: Special indicators for premium seating
- **Multi-level Navigation**: Seamless switching between venue levels
- **Reservation System**: Temporary seat holds during selection process

### 🍽️ Table Booking System
- **Flexible Table Shapes**: Round, square, rectangle, oval tables
- **Guest Count Management**: Dynamic guest count controls per table
- **Capacity Management**: Minimum and maximum guest requirements
- **Group Booking**: Entire table reservations
- **VIP Table Highlighting**: Premium table identification
- **Dynamic Pricing**: Price calculation based on guest count and table section

### 🎯 Real-time Features
- **Live Updates**: WebSocket integration for real-time seat availability
- **Conflict Prevention**: Automatic handling of double-booking attempts
- **Reservation Timers**: Time-limited seat holds
- **Price Calculation**: Dynamic pricing based on selection

## System Architecture

### Component Structure
```
src/components/
├── AdvancedVenueDesigner.tsx    # Main venue layout designer
├── SeatSelectionView.tsx        # Customer seat selection interface
├── TableSelectionView.tsx       # Customer table selection interface
└── VenueLayoutDesigner.tsx      # Legacy compatibility wrapper

src/pages/
├── VenueSystemDemo.tsx          # Demo page showcasing all features
└── VenueManagement.tsx          # Admin venue management page
```

### Data Models

#### VenueLayoutData
```typescript
interface VenueLayoutData {
  id?: string;
  name: string;
  description?: string;
  venue: {
    width: number;
    height: number;
    shape: 'rectangle' | 'oval' | 'l-shape' | 'custom';
    background?: string;
    scale: number;
  };
  levels: VenueLevel[];
  sections: Section[];
  settings: VenueSettings;
  metadata: VenueMetadata;
}
```

#### LayoutElement
```typescript
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
  properties: ElementProperties;
}
```

## Configuration Types

### 1. Theater/Concert Venue
**Use Case**: Traditional seated venues with clear stage view
- Individual seat selection required
- Multiple sections (Orchestra, Mezzanine, Balcony)
- Row and seat number identification
- Accessibility compliance
- VIP and premium seating areas

### 2. Banquet/Event Hall
**Use Case**: Dining events, galas, weddings
- Table-based booking
- Guest count management per table
- Different table shapes and sizes
- VIP table designations
- Dance floor and bar areas

### 3. Conference/Mixed Venue
**Use Case**: Business events, workshops, networking
- Combination of seats and tables
- Presentation areas
- Networking zones
- Workshop spaces
- Flexible configurations

### 4. General Admission
**Use Case**: Standing events, festivals
- No specific seat selection
- Capacity-based ticketing
- Section-based access (GA, VIP, etc.)
- Simple quantity selection

## Getting Started

### Basic Implementation

1. **Import Components**
```typescript
import { AdvancedVenueDesigner } from './components/AdvancedVenueDesigner';
import SeatSelectionView from './components/SeatSelectionView';
import TableSelectionView from './components/TableSelectionView';
```

2. **Venue Designer** (Admin Interface)
```tsx
<AdvancedVenueDesigner
  initialLayout={existingLayout}
  onSave={handleLayoutSave}
  mode="create" // or "edit"
/>
```

3. **Seat Selection** (Customer Interface)
```tsx
<SeatSelectionView
  layout={venueLayout}
  eventId="event-123"
  selectedSeats={selectedSeats}
  onSeatSelection={handleSeatSelection}
  maxSelection={8}
  allowGroupSelection={true}
  realTimeUpdates={true}
  priceCalculation={calculatePrice}
/>
```

4. **Table Selection** (Customer Interface)
```tsx
<TableSelectionView
  layout={venueLayout}
  eventId="event-123"
  selectedTables={selectedTables}
  onTableSelection={handleTableSelection}
  maxTableSelection={3}
  requireGuestCount={true}
  priceCalculation={calculateTablePrice}
/>
```

### Demo Access

Visit `/venue-demo` to see all features in action:
- Switch between Designer, Seat Selection, and Table Selection modes
- Try different venue layouts (Theater, Banquet Hall)
- Test real-time selection features
- Explore pricing calculations

## Advanced Features

### Real-time Seat Status Management
```typescript
const { seatStatuses, reserveSeats, releaseSeats } = useSeatStatus(eventId, true);
```

### Custom Pricing Logic
```typescript
const calculateSeatPrice = (seatIds: string[]) => {
  return seatIds.reduce((total, seatId) => {
    const seat = findSeatById(seatId);
    const section = findSectionById(seat.sectionId);
    return total + (section.basePrice * section.priceMultiplier);
  }, 0);
};
```

### Template System
```typescript
const theaterTemplate: VenueTemplate = {
  id: 'theater-traditional',
  name: 'Traditional Theater',
  category: 'theater',
  elements: [...],
  sections: [...],
  settings: {...}
};
```

## API Integration

### Required Endpoints

1. **Seat Status** (GET `/api/events/{eventId}/seat-status`)
2. **Reserve Seats** (POST `/api/events/{eventId}/reserve-seats`)
3. **Release Seats** (POST `/api/events/{eventId}/release-seats`)
4. **Venue Layouts** (GET/POST `/api/venues/{venueId}/layout`)

### WebSocket Events
- `seat-reserved`: Real-time seat reservation updates
- `seat-released`: Seat availability updates
- `seat-booked`: Final booking confirmation

## Accessibility Features

- **WCAG 2.1 Compliance**: Full accessibility support
- **Keyboard Navigation**: Complete keyboard control
- **Screen Reader Support**: Comprehensive ARIA labels
- **High Contrast**: Support for visual accessibility
- **Wheelchair Accessibility**: Clear indication of accessible seats
- **Assisted Listening**: Integration with assistive technologies

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Responsive**: Full touch support on tablets and phones
- **Progressive Enhancement**: Graceful degradation for older browsers

## Performance Optimization

- **Lazy Loading**: Large venue layouts load progressively
- **Virtual Scrolling**: Efficient rendering of large seat maps
- **Memory Management**: Optimized for venues with 10,000+ seats
- **Caching**: Intelligent caching of venue layouts and templates

## Security Considerations

- **Seat Locking**: Prevents double-booking with time-based locks
- **Input Validation**: Comprehensive validation of all user inputs
- **Rate Limiting**: Protection against booking bot attacks
- **CSRF Protection**: Security against cross-site request forgery

## Customization

### Styling
The system uses Tailwind CSS for styling. Customize colors, fonts, and layouts:

```css
.seat-selected {
  @apply bg-green-500 border-green-600;
}

.seat-vip {
  @apply bg-purple-500 border-purple-600;
}
```

### Business Logic
Override default behaviors:

```typescript
const customPriceCalculation = (seatIds: string[]) => {
  // Custom pricing logic
  return seatIds.length * basePrice * demandMultiplier;
};
```

## Deployment

1. **Build the application**
```bash
npm run build
```

2. **Configure environment variables**
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_WEBSOCKET_URL=wss://ws.yourdomain.com
```

3. **Deploy to production**
- Supports all major hosting platforms
- CDN-ready for global distribution
- SSR compatible for SEO optimization

## Support and Maintenance

- **Regular Updates**: Monthly feature updates and security patches
- **Documentation**: Comprehensive API and component documentation
- **Community Support**: Active community forum and GitHub issues
- **Professional Support**: Enterprise support packages available

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For more information, visit the demo at `/venue-demo` or contact our support team.
