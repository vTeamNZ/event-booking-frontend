# 🎯 Availability Status Display Update - Hybrid Events

## Summary
Updated ticket availability display across all hybrid event components to use percentage-based status indicators instead of raw ticket counts, consistent with the main TicketSelection page.

## Status Logic Implemented

### **Color-Coded Status Thresholds:**
- 🟢 **Green (>75% available)**: "Available" or "Tables Available"
- 🟠 **Orange (25-75% available)**: "Limited Tickets Available" or "Limited Tables Available"  
- 🔴 **Red (<25% available)**: "Few Tickets Remaining" or "Few Tables Remaining"
- 🔴 **Red (0% available)**: "No tickets available" or "No tables available"
- 🟢 **Green (Unlimited)**: "Unlimited availability"

## Files Updated

### **1. New Utility: `availabilityStatus.ts`**
- ✅ **`getAvailabilityStatus()`** - Main function for percentage-based status
- ✅ **`getSimpleAvailabilityStatus()`** - Fallback for when sold count is unknown
- ✅ **Returns**: `{ colorClass, statusText, percentage }`

### **2. GeneralAdmissionTickets.tsx**
- ✅ **Before**: `"5 tickets available"` (raw count)  
- ✅ **After**: `"Limited Tickets Available (30% available)"` (percentage-based)
- ✅ **Used in**: Hybrid events (standing tickets), General admission events

### **3. GeneralAdmissionLayout.tsx**  
- ✅ **Before**: `"Available: 25"` (raw count)
- ✅ **After**: `"Limited Tickets Available"` (percentage-based status)
- ✅ **Used in**: General admission events

## Usage Examples

### **Before (Raw Count Display):**
```tsx
<span className="text-gray-600">Available: 15</span>
<span className="text-orange-600">5 tickets available</span>
```

### **After (Percentage-Based Status):**
```tsx
<span className="text-orange-400">Limited Tickets Available</span>
<span className="text-orange-400">Limited Tickets Available (30% available)</span>
```

## Event Type Coverage

### **✅ General Admission Events**
- Component: `GeneralAdmissionLayout.tsx`
- Status: Updated with percentage-based logic

### **✅ Hybrid Events - Standing Tickets**  
- Component: `GeneralAdmissionTickets.tsx` (with `standingOnly={true}`)
- Status: Updated with percentage-based logic
- Used in: `HybridSeatSelectionPage.tsx`

### **✅ Hybrid Events - Seated Tickets**
- Uses seating layout (unchanged - shows seat availability visually)

### **✅ Regular Ticket Selection**
- Component: `TicketSelection.tsx` 
- Status: Already had percentage-based logic (reference implementation)

## Benefits

### **1. Consistent User Experience**
- All event types now show the same availability status format
- Users see intuitive status messages instead of raw numbers

### **2. Urgency Indicators**
- **Green**: Plenty available, no urgency
- **Orange**: Moderate urgency, limited availability  
- **Red**: High urgency, act quickly

### **3. Mobile-Friendly**
- Status text is more readable than raw numbers on mobile devices
- Color coding provides quick visual cues

## Testing

### **Test Scenarios:**
1. **High Availability (>75%)**: Shows "Available" in green
2. **Medium Availability (25-75%)**: Shows "Limited Available" in orange  
3. **Low Availability (<25%)**: Shows "Few Remaining" in red
4. **Sold Out (0%)**: Shows "No tickets available" in red
5. **Unlimited**: Shows "Unlimited availability" in green

### **Test Events:**
- General Admission events with MaxTickets set
- Hybrid events with both seated and standing tickets
- Hybrid events with standing tickets only

## Implementation Notes

### **Backward Compatibility:**
- ✅ No breaking changes to existing APIs
- ✅ Falls back gracefully when availability data is missing
- ✅ Maintains existing functionality for unlimited tickets

### **Performance:**
- ✅ Utility functions are lightweight  
- ✅ Calculations done client-side (no additional API calls)
- ✅ Cached availability data from existing API calls

This update ensures all hybrid event ticket displays are consistent with the main ticket selection page, providing users with clear, color-coded availability status instead of confusing raw numbers.
