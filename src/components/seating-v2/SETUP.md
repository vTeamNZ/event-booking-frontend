# Quick Setup Guide - Seating System V2

## 🚀 Getting Started

### 1. Replace the old seating component in your page

**Before (Old System):**
```tsx
import CinemaSeatLayout from '../components/CinemaSeatLayout';

// In your component
<CinemaSeatLayout 
  eventId={state.eventId}
  onSelectionComplete={handleSelectionComplete}
/>
```

**After (New System):**
```tsx
import { SeatingLayoutV2 } from '../components/seating-v2';

// In your component
<SeatingLayoutV2 
  eventId={state.eventId}
  onSelectionComplete={handleSelectionComplete}
  maxSeats={8}
  showLegend={true}
  className="seating-layout-container"
/>
```

### 2. Update your imports

Add this import to your SeatSelectionPage.tsx:
```tsx
import { SeatingLayoutV2, SeatingSelectionState } from '../components/seating-v2';
```

### 3. Handle the new selection state format

The new system returns a different state format. Update your `handleSelectionComplete` function:

```tsx
const handleSelectionComplete = (selectionState: SeatingSelectionState) => {
  // Convert to old format if needed for compatibility
  const navigationState = {
    ...state,
    seatSelection: convertToOldFormat(selectionState), // See conversion function
    fromSeatSelection: true
  };
  
  navigate(`/event/${eventTitle}/food`, { state: navigationState });
};
```

### 4. Test the new system

1. Start your development server:
   ```bash
   npm start
   ```

2. Navigate to any event's seat selection page

3. Try selecting seats and verify:
   - ✅ Seats can be selected/deselected
   - ✅ Reservation timer appears
   - ✅ Total price updates
   - ✅ Proceed to checkout works

## 🔧 Configuration Options

### Basic Configuration
```tsx
<SeatingLayoutV2
  eventId={123}                    // Required: Event ID
  onSelectionComplete={callback}   // Required: Selection callback
  maxSeats={8}                     // Optional: Max seats (default: 8)
  showLegend={true}               // Optional: Show legend (default: true)
  className="custom-styles"        // Optional: Custom CSS classes
/>
```

### Advanced Configuration
```tsx
<SeatingLayoutV2
  eventId={eventId}
  onSelectionComplete={handleSelectionComplete}
  maxSeats={10}
  showLegend={true}
  className="my-custom-seating-layout"
/>
```

## 🎨 Styling

The new system uses Tailwind CSS. You can customize it by:

1. **Adding custom classes:**
   ```tsx
   <SeatingLayoutV2 className="my-custom-styles" />
   ```

2. **Overriding specific components:**
   ```css
   .seating-layout-v2 .seat-visual {
     /* Custom seat styles */
   }
   ```

## 🔍 Debugging

### Enable Debug Mode
Add this to see detailed console logs:
```tsx
// In SeatingLayoutV2.tsx, uncomment debug logs
console.log('[SeatingLayoutV2] Debug info:', ...);
```

### Common Issues

1. **"Cannot find module" errors:**
   - Restart your development server
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

2. **Seats not loading:**
   - Check API connectivity
   - Verify eventId is valid
   - Check browser console for errors

3. **Type errors:**
   - Make sure you're using the new `SeatingSelectionState` type
   - Update your selection handler accordingly

## 📱 Mobile Testing

Test on different screen sizes:
- **Desktop:** 1920x1080, 1366x768
- **Tablet:** 768x1024, 1024x768  
- **Mobile:** 375x667, 414x896

## ✅ Verification Checklist

Before deploying, verify:

- [ ] Seats load correctly
- [ ] Seat selection works (click to select/deselect)
- [ ] Reservation timer appears and counts down
- [ ] Total price calculates correctly
- [ ] Legend shows all seat types
- [ ] Mobile interface is usable
- [ ] Error states display properly
- [ ] Loading states work
- [ ] Checkout flow completes

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console for errors
2. Verify API endpoints are working
3. Test with a different event ID
4. Check the README.md for detailed documentation
5. Look at the demo component for reference

## 🚀 What's Next?

After successfully implementing the new seating system:

1. **Remove old components** (CinemaSeatLayout, etc.) when fully migrated
2. **Add custom styling** to match your brand
3. **Test edge cases** like slow networks, API failures
4. **Consider adding features** like seat recommendations
5. **Monitor performance** and optimize as needed

---

**Happy coding! 🎉**
