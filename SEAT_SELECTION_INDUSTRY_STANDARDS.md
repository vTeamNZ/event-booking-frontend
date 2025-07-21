# 🎯 SEAT SELECTION INDUSTRY STANDARD BEHAVIORS
# Complete Implementation Guide

## 🎪 **SCENARIO MATRIX**

| Scenario | Industry Standard | User Experience | Technical Implementation |
|----------|------------------|-----------------|-------------------------|
| **Cancel Timer** | Immediate cleanup + redirect | Confirmation → Success message | API cleanup + navigation |
| **Clear Selection** | Keep reservation, clear UI | Warning → Allow new selection | UI reset, timer continues |
| **Return to Page** | Show reserved seats | Highlight + modification options | Load state from timer service |
| **Select While Reserved** | Replace confirmation | Warning dialog with options | Batch update reservation |
| **Timer Expires** | Auto-refresh state | Notification + reset | Clear UI + update availability |
| **Select Reserved Seat** | Prevent selection | Visual feedback | Disabled click + tooltip |
| **Browser Close/Open** | Persist reservation | Seamless recovery | Timer service recovery |
| **Network Issues** | Graceful degradation | Loading states + retry | Optimistic UI + sync |

## 🎯 **PRIORITY IMPLEMENTATIONS**

### **1. ENHANCED SEAT SELECTION COMPONENT**

```typescript
// src/components/seating-v2/SeatSelectionManager.ts

interface SeatSelectionState {
  selectedSeats: number[];
  reservedSeats: number[];
  unavailableSeats: number[];
  hasActiveReservation: boolean;
  isModifyingReservation: boolean;
}

class SeatSelectionManager {
  
  // Handle clear selection during active timer
  handleClearSelection(): void {
    const activeReservation = reservationTimer.getReservation();
    
    if (activeReservation) {
      const proceed = confirm(
        `You have ${activeReservation.seatsCount} seats reserved (${this.formatTimeLeft()}). ` +
        `Clearing will let you select different seats. Continue?`
      );
      
      if (proceed) {
        this.clearUISelection();
        this.showModificationMode();
        toast.info('Select new seats to replace your current reservation', {
          duration: 8000,
          icon: '🔄'
        });
      }
    } else {
      this.clearUISelection();
    }
  }
  
  // Handle seat click during active reservation
  handleSeatClick(seatId: number): void {
    const activeReservation = reservationTimer.getReservation();
    
    if (activeReservation && !this.state.isModifyingReservation) {
      // First seat click during active reservation
      const proceed = confirm(
        `You already have ${activeReservation.seatsCount} seats reserved. ` +
        `Selecting new seats will replace your current reservation. Continue?`
      );
      
      if (proceed) {
        this.enterModificationMode();
        this.selectSeat(seatId);
      }
    } else {
      // Normal seat selection
      this.selectSeat(seatId);
    }
  }
  
  // Handle reservation replacement
  async replaceReservation(newSeatIds: number[]): Promise<void> {
    const currentReservation = reservationTimer.getReservation();
    
    if (!currentReservation) {
      throw new Error('No active reservation to replace');
    }
    
    try {
      // Step 1: Reserve new seats
      const newReservation = await this.reserveSeats(newSeatIds);
      
      // Step 2: Release old seats (automatic via new reservation)
      reservationTimer.cleanup();
      
      // Step 3: Start new timer
      await reservationTimer.startTimer(newReservation);
      
      toast.success(
        `Reservation updated! ${newReservation.seatsCount} seats reserved for 10 minutes.`
      );
      
    } catch (error) {
      toast.error('Failed to update reservation. Your original seats are still reserved.');
      throw error;
    }
  }
  
  // Load state when returning to page
  initializeFromReservation(): void {
    const activeReservation = reservationTimer.getReservation();
    
    if (activeReservation) {
      // Highlight reserved seats
      this.state.reservedSeats = activeReservation.seatIds;
      this.state.hasActiveReservation = true;
      
      // Show reservation status
      this.showReservationStatus({
        seatsCount: activeReservation.seatsCount,
        totalPrice: activeReservation.totalPrice,
        timeLeft: reservationTimer.getTimeLeft(),
        actions: ['Modify Selection', 'Keep Current', 'Cancel Reservation']
      });
      
      console.log('🎯 Initialized seat selection with active reservation');
    }
  }
}
```

### **2. RESERVATION STATUS COMPONENT**

```typescript
// src/components/ReservationStatusPanel.tsx

interface ReservationStatusProps {
  reservation: EnhancedReservation;
  onModify: () => void;
  onKeep: () => void;
  onCancel: () => void;
}

export const ReservationStatusPanel: React.FC<ReservationStatusProps> = ({
  reservation, onModify, onKeep, onCancel
}) => {
  const timeLeft = reservationTimer.getTimeLeft();
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">
              You have {reservation.seatsCount} seats reserved
            </h3>
            <p className="text-sm text-blue-700">
              Time remaining: {minutes}:{seconds.toString().padStart(2, '0')} • 
              Total: ${reservation.totalPrice.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onModify}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Modify Selection
          </button>
          <button
            onClick={onKeep}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Continue to Food
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
```

### **3. SEAT VISUAL STATES**

```css
/* src/styles/seat-states.css */

.seat {
  transition: all 0.2s ease;
  cursor: pointer;
}

/* Available seat */
.seat-available {
  @apply bg-gray-200 border-2 border-gray-300 hover:bg-blue-100 hover:border-blue-400;
}

/* Selected by current user */
.seat-selected {
  @apply bg-blue-500 border-2 border-blue-600 text-white;
}

/* Reserved by current user (from timer) */
.seat-reserved-by-user {
  @apply bg-green-500 border-2 border-green-600 text-white;
  position: relative;
}

.seat-reserved-by-user::after {
  content: "YOURS";
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  background: green;
  color: white;
  padding: 1px 4px;
  border-radius: 2px;
}

/* Reserved by another user */
.seat-reserved-by-other {
  @apply bg-red-400 border-2 border-red-500 text-white cursor-not-allowed;
  position: relative;
}

.seat-reserved-by-other::after {
  content: "RESERVED";
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  background: red;
  color: white;
  padding: 1px 4px;
  border-radius: 2px;
}

/* Seat being modified */
.seat-modifying {
  @apply bg-orange-400 border-2 border-orange-500 text-white;
  animation: pulse 1s infinite;
}
```

## 🎮 **USER INTERACTION FLOWS**

### **Flow 1: Cancel Timer**
```
User clicks "Cancel" → Confirmation dialog → 
API cleanup → Storage clear → Navigate to events → 
Success toast → Seats immediately available
```

### **Flow 2: Clear Selection (with active timer)**
```
User clicks "Clear" → Warning dialog → 
Clear UI only → Timer continues → 
Show modification prompt → Allow new selection
```

### **Flow 3: Return to page (with active timer)**
```
Page load → Check timer service → 
Highlight reserved seats → Show status panel → 
User can: Modify | Continue | Cancel
```

### **Flow 4: Select seats (with active timer)**
```
Click seat → Warning dialog → 
Enter modification mode → Show replacement UI → 
New selection → Update reservation API → 
New timer started → Old seats released
```

## 🎯 **IMPLEMENTATION PRIORITY**

### **Phase 1: Critical (This Week)**
1. ✅ Enhanced clear selection handling
2. ✅ Active reservation state detection
3. ✅ Modification mode UI
4. ✅ Reservation replacement logic

### **Phase 2: Enhanced (Next Week)**
1. 🔄 Visual seat state indicators
2. 🔄 Reservation status panel
3. 🔄 Network error handling
4. 🔄 Advanced user feedback

### **Phase 3: Advanced (Future)**
1. 🚧 Real-time seat availability updates
2. 🚧 Alternative seat suggestions
3. 🚧 Multi-device synchronization
4. 🚧 Advanced analytics

---

**Next Steps**: Implement Phase 1 components for comprehensive seat selection management! 🚀
