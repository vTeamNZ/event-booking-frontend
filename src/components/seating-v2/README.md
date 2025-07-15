# Seating System V2

A completely rewritten, robust seating layout system for the event booking frontend. This system provides a clean, modern interface for seat selection with real-time updates, reservation management, and comprehensive error handling.

## Features

### 🎯 Core Functionality
- **Real-time seat selection** with visual feedback
- **Reservation management** with 10-minute timeout
- **Multiple seat types** (VIP, Premium, Standard)
- **Dynamic pricing** based on seat type and section
- **Responsive design** for all device sizes
- **Accessibility support** with keyboard navigation and screen reader compatibility

### 🛡️ Robust Error Handling
- **Connection failure recovery** with retry mechanisms
- **Graceful degradation** when APIs are unavailable
- **Clear error messages** with actionable solutions
- **Loading states** with progress indicators

### 🎨 Modern UI/UX
- **Intuitive seat selection** with click-to-select interface
- **Visual seat status indicators** (Available, Selected, Reserved, Booked)
- **Interactive legend** showing seat types and pricing
- **Real-time reservation timer** with countdown
- **Selection summary** with total pricing

### 📱 Responsive & Accessible
- **Mobile-first design** that works on all devices
- **Keyboard navigation** support
- **Screen reader friendly** with proper ARIA labels
- **High contrast** colors for better visibility
- **Touch-friendly** interface for mobile devices

## Architecture

### File Structure
```
src/
├── components/seating-v2/
│   ├── SeatingLayoutV2.tsx        # Main seating layout component
│   ├── SeatingGrid.tsx            # Seat grid display
│   ├── SeatVisual.tsx             # Individual seat component
│   ├── SeatingLegend.tsx          # Legend showing seat types
│   ├── SeatingSummary.tsx         # Selection summary and checkout
│   ├── SeatingReservationTimer.tsx # Reservation countdown timer
│   ├── SeatingLoadingSpinner.tsx  # Loading state component
│   ├── SeatingErrorMessage.tsx    # Error state component
│   └── index.ts                   # Export all components
├── services/seating-v2/
│   ├── seatingAPIService.ts       # API service for seating operations
│   └── index.ts                   # Export services
├── types/seating-v2/
│   └── index.ts                   # TypeScript type definitions
└── utils/seating-v2/
    └── seatingUtils.ts            # Utility functions
```

### Components Overview

#### `SeatingLayoutV2` - Main Component
The primary component that orchestrates the entire seating experience:
- Manages loading states and error handling
- Handles seat selection logic
- Coordinates with the API service
- Provides state management for selections

#### `SeatingGrid` - Seat Display
Renders the actual seat layout:
- Groups seats by row
- Handles seat spacing and aisles
- Manages hover states and interactions
- Displays stage/screen indicators

#### `SeatVisual` - Individual Seat
Represents a single seat with:
- Visual status indicators
- Hover effects and selection feedback
- Accessibility features
- Tooltip information

#### `SeatingSummary` - Selection Summary
Shows the current selection and allows checkout:
- Lists selected seats with pricing
- Calculates total cost
- Provides clear/proceed actions
- Shows selection limits

#### `SeatingReservationTimer` - Reservation Management
Manages seat reservations:
- Displays countdown timer
- Handles expiration notifications
- Shows reservation status
- Provides expiration warnings

### API Integration

The system integrates with the following backend APIs:

#### Seat Layout API
```typescript
GET /api/seats/event/{eventId}/layout
```
Returns complete seat layout information including:
- Seat positions and status
- Pricing information
- Section and ticket type data
- Venue configuration

#### Reservation API
```typescript
POST /api/seats/reserve
{
  "seatId": number,
  "sessionId": string
}
```
Reserves a seat for 10 minutes.

#### Release API
```typescript
POST /api/seats/release
{
  "seatId": number,
  "sessionId": string
}
```
Releases a reserved seat.

### Data Flow

1. **Component Mount**: `SeatingLayoutV2` loads seat data from API
2. **Seat Selection**: User clicks on available seat
3. **Reservation**: System reserves seat via API call
4. **Visual Update**: Seat status updates in real-time
5. **Timer Management**: Reservation timer starts countdown
6. **Checkout**: User proceeds with selected seats

### State Management

The system uses React hooks for state management:

```typescript
interface SeatingSelectionState {
  mode: SeatSelectionMode;
  eventId: number;
  selectedSeats: SeatingSelectedSeat[];
  selectedTables: SeatingSelectedTable[];
  generalTickets: SeatingGeneralTicket[];
  totalPrice: number;
  sessionId: string;
  maxSeats?: number;
}
```

## Usage

### Basic Implementation

```tsx
import { SeatingLayoutV2 } from '../components/seating-v2';

function SeatSelectionPage() {
  const handleSelectionComplete = (selectionState) => {
    // Handle completed selection
    console.log('Selected seats:', selectionState.selectedSeats);
    console.log('Total price:', selectionState.totalPrice);
    // Navigate to next step
  };

  return (
    <SeatingLayoutV2
      eventId={123}
      onSelectionComplete={handleSelectionComplete}
      maxSeats={8}
      showLegend={true}
      className="my-seating-layout"
    />
  );
}
```

### Advanced Configuration

```tsx
<SeatingLayoutV2
  eventId={eventId}
  onSelectionComplete={handleSelectionComplete}
  maxSeats={10}
  showLegend={true}
  className="custom-seating-styles"
/>
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `eventId` | `number` | Required | Event ID to load seating for |
| `onSelectionComplete` | `function` | Required | Callback when selection is complete |
| `maxSeats` | `number` | `8` | Maximum seats that can be selected |
| `showLegend` | `boolean` | `true` | Show/hide the seat legend |
| `className` | `string` | `''` | Additional CSS classes |

## Styling

The system uses Tailwind CSS for styling with semantic class names:

```css
/* Main container */
.seating-layout-v2 { }

/* Seat grid */
.seating-grid { }

/* Individual seat */
.seat-visual { }

/* Legend */
.seating-legend { }

/* Summary */
.seating-summary { }
```

### Customization

You can customize the appearance by:

1. **CSS Classes**: Add custom classes via the `className` prop
2. **Tailwind Utilities**: Use Tailwind utility classes
3. **Custom Styles**: Override default styles in your CSS

## Error Handling

The system provides comprehensive error handling:

### Connection Errors
- Automatic retry mechanisms
- Clear error messages
- Fallback to cached data when possible

### Reservation Conflicts
- Real-time conflict detection
- Automatic seat release on timeout
- Clear conflict resolution UI

### API Failures
- Graceful degradation
- Retry with exponential backoff
- User-friendly error messages

## Performance Optimizations

### React Optimizations
- `useMemo` for expensive calculations
- `useCallback` for event handlers
- Optimized re-renders with proper dependencies

### Network Optimizations
- Debounced API calls
- Request deduplication
- Efficient data caching

### Visual Optimizations
- Smooth animations with CSS transitions
- Optimized seat rendering
- Responsive image loading

## Testing

The system includes comprehensive testing:

### Unit Tests
- Component rendering tests
- Utility function tests
- API service tests

### Integration Tests
- Full user flow testing
- API integration testing
- Error scenario testing

### E2E Tests
- Complete seat selection flow
- Reservation timeout scenarios
- Mobile device testing

## Accessibility

The system is fully accessible:

### Keyboard Navigation
- Tab order follows logical flow
- Enter/Space for seat selection
- Arrow keys for navigation

### Screen Reader Support
- Proper ARIA labels
- Descriptive text for all elements
- Status announcements

### Visual Accessibility
- High contrast colors
- Scalable text
- Focus indicators

## Browser Support

- **Chrome**: 88+
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+
- **Mobile**: iOS 14+, Android 10+

## Migration Guide

### From Old Seating System

1. **Replace Component Import**:
   ```tsx
   // Old
   import CinemaSeatLayout from '../components/CinemaSeatLayout';
   
   // New
   import { SeatingLayoutV2 } from '../components/seating-v2';
   ```

2. **Update Component Usage**:
   ```tsx
   // Old
   <CinemaSeatLayout 
     eventId={eventId}
     onSelectionComplete={handleSelectionComplete}
   />
   
   // New
   <SeatingLayoutV2 
     eventId={eventId}
     onSelectionComplete={handleSelectionComplete}
     maxSeats={8}
     showLegend={true}
   />
   ```

3. **Update Type Handling**:
   The new system uses different type definitions. Update your selection handlers accordingly.

## Troubleshooting

### Common Issues

#### Seats Not Loading
- Check API connectivity
- Verify eventId is valid
- Check browser console for errors

#### Reservation Failures
- Verify session ID is valid
- Check seat availability
- Ensure proper API permissions

#### Visual Issues
- Check CSS conflicts
- Verify Tailwind CSS is loaded
- Test on different screen sizes

### Debug Mode

Enable debug logging:

```tsx
// Add to component
console.log('[SeatingLayoutV2] Debug mode enabled');
```

## Contributing

When contributing to the seating system:

1. **Follow TypeScript**: Use proper type definitions
2. **Write Tests**: Include unit tests for new features
3. **Document Changes**: Update this README
4. **Follow Patterns**: Use existing code patterns
5. **Test Accessibility**: Ensure new features are accessible

## Future Enhancements

### Planned Features
- **3D Seat Visualization**: Interactive 3D venue view
- **Seat Recommendations**: AI-powered seat suggestions
- **Group Booking**: Enhanced support for group selections
- **Real-time Updates**: WebSocket-based real-time updates
- **Venue Editor**: Admin interface for venue configuration

### Performance Improvements
- **Virtual Scrolling**: For large venues
- **WebWorker**: Background processing
- **Service Worker**: Offline support
- **CDN Integration**: Faster asset loading

## License

This seating system is part of the event booking application and follows the same licensing terms.

### Session Management

The seating system includes comprehensive session storage management to handle booking completion and prevent conflicts:

```tsx
import { 
  completeBookingCleanup, 
  safeBookingCompletionCleanup,
  clearAllSeatingData 
} from '../utils/seating-v2/sessionStorage';

// When booking is completed (payment success, reservation, etc.)
function onPaymentSuccess(eventId: number) {
  // Clear all session data for the event
  completeBookingCleanup(eventId, 'payment_success');
}

// Safe cleanup when you have various data sources
function onBookingComplete() {
  // Automatically extracts eventId from various sources
  const cleanupSuccessful = safeBookingCompletionCleanup(
    searchParams,     // URLSearchParams
    navigationState,  // Router state
    sessionData,      // Session data
    'booking_complete'
  );
  
  if (!cleanupSuccessful) {
    console.warn('Could not complete session cleanup');
  }
}

// Manual cleanup for specific event
function clearEventData(eventId: number) {
  clearAllSeatingData(eventId);
}
```

#### Available Session Functions

| Function | Purpose |
|----------|---------|
| `completeBookingCleanup(eventId, context)` | Comprehensive cleanup when booking is completed |
| `safeBookingCompletionCleanup(searchParams, state, data, context)` | Smart cleanup that extracts eventId from various sources |
| `clearAllSeatingData(eventId)` | Clear all seating-related data for an event |
| `clearSessionId(eventId)` | Clear only the session ID |
| `storeSessionId(eventId, sessionId)` | Store session ID |
| `getSessionId(eventId)` | Retrieve session ID |

#### Development Debugging

In development mode, debugging functions are available in the browser console:

```javascript
// Check all seating storage keys
window.showSeatingStorage();

// Manual cleanup for testing
window.clearSeatingSession(eventId);

// Clear all data for specific event
window.clearAllSeatingData(eventId);
```

#### Session Storage Keys

The system uses the following localStorage keys:
- `seating_session_{eventId}` - Session ID for seat reservations
- `selected_seats_{eventId}` - Currently selected seat IDs
- `seating_session_timestamp_{eventId}` - Session timestamp for expiration
- `seating_step_{eventId}` - Current booking step
- `seating_form_data_{eventId}` - Form data
- `seating_temporary_selection_{eventId}` - Temporary selections
- `seating_reservation_expiry_{eventId}` - Reservation expiry time
