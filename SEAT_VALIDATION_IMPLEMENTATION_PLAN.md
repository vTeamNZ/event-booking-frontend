# Seat Validation Implementation Plan

## Current Validation Code Available for Reuse

### 1. ✅ Backend: PaymentController.ValidateSelectedSeats()
**Location:** `PaymentController.cs` line 199-216
**Current Usage:** Already used in Stripe checkout session creation
**Logic:** Validates seats are Available OR Reserved status
```csharp
private async Task<bool> ValidateSelectedSeats(int eventId, List<string> selectedSeats)
{
    if (selectedSeats == null || !selectedSeats.Any()) return false;
    
    foreach (var seatNumber in selectedSeats)
    {
        var seat = await _context.Seats
            .FirstOrDefaultAsync(s => s.EventId == eventId && s.SeatNumber == seatNumber);
        
        if (seat == null || (seat.Status != SeatStatus.Available && seat.Status != SeatStatus.Reserved))
        {
            return false;
        }
    }
    return true;
}
```

### 2. ❌ Backend: SeatsController.MarkSeatsAsBooked() - NO VALIDATION
**Location:** `SeatsController.cs` line 614-680
**Current State:** Only checks if seats exist, NOT if they're available
**Gap:** Missing availability validation for organizer QR generation

### 3. ✅ Frontend: SeatStatus utilities
**Location:** `seatingUtils.ts`
**Available:** Status conversion utilities and constants

## Implementation Plan

### Step 1: Create Reusable Seat Validation Endpoint
Create a new API endpoint that both Payment and QR generation can use:

```csharp
// Add to SeatsController.cs
[HttpPost("validate-availability")]
public async Task<ActionResult<SeatValidationResponse>> ValidateSeatsAvailability([FromBody] SeatValidationRequest request)
{
    // Reuse PaymentController logic but make it more specific
    // Only allow SeatStatus.Available (not Reserved)
}
```

### Step 2: Add Validation to Mark-Booked Endpoint
Modify `MarkSeatsAsBooked()` to check availability before booking:

```csharp
// In SeatsController.cs - add before marking seats as booked
var unavailableSeats = seats.Where(s => s.Status != SeatStatus.Available).ToList();
if (unavailableSeats.Any())
{
    return BadRequest($"The following seats are not available: {string.Join(", ", unavailableSeats.Select(s => s.SeatNumber))}");
}
```

### Step 3: Add Frontend Validation
Create validation service calls in Payment.tsx:

```typescript
// Before Stripe payment
const validateSeats = async (selectedSeats: string[]) => {
  const response = await api.post('/seats/validate-availability', {
    eventId: eventId,
    seatNumbers: selectedSeats
  });
  return response.data.allAvailable;
};

// Use in both payment flows
if (selectedSeats.length > 0) {
  const seatsValid = await validateSeats(selectedSeats);
  if (!seatsValid) {
    setError('Some selected seats are no longer available. Please reselect.');
    return;
  }
}
```

## Files That Need Modification

### Backend:
1. **SeatsController.cs** - Add validation to MarkSeatsAsBooked()
2. **Optional:** Create new validation endpoint for reusability

### Frontend:
1. **Payment.tsx** - Add validation before both payment and QR generation
2. **seatSelectionService.ts** - Add validation method

## Validation Logic

### For Payment (Stripe):
- Allow `SeatStatus.Available` OR `SeatStatus.Reserved` 
- (Current logic is correct)

### For QR Generation (Organizer):
- Allow ONLY `SeatStatus.Available`
- (Stricter validation needed)

## Benefits
1. **Prevents Double Booking** - Validates at the last moment
2. **Consistent Validation** - Same logic for both flows  
3. **Better Error Messages** - Clear feedback about unavailable seats
4. **Race Condition Protection** - Validates right before booking/payment
