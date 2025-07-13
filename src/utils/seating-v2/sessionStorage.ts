// Utility functions for managing session storage in the seating system

/**
 * Store the session ID in local storage with event ID as part of the key
 */
export const storeSessionId = (eventId: number, sessionId: string): void => {
  try {
    localStorage.setItem(`seating_session_${eventId}`, sessionId);
    console.log(`[SessionStorage] Stored session ID for event ${eventId}: ${sessionId}`);
  } catch (error) {
    console.error('[SessionStorage] Error storing session ID:', error);
  }
};

/**
 * Get the stored session ID for a specific event
 */
export const getSessionId = (eventId: number): string | null => {
  try {
    const sessionId = localStorage.getItem(`seating_session_${eventId}`);
    console.log(`[SessionStorage] Retrieved session ID for event ${eventId}: ${sessionId}`);
    return sessionId;
  } catch (error) {
    console.error('[SessionStorage] Error retrieving session ID:', error);
    return null;
  }
};

/**
 * Clear the session ID from storage
 */
export const clearSessionId = (eventId: number): void => {
  try {
    localStorage.removeItem(`seating_session_${eventId}`);
    console.log(`[SessionStorage] Cleared session ID for event ${eventId}`);
  } catch (error) {
    console.error('[SessionStorage] Error clearing session ID:', error);
  }
};

/**
 * Clear session ID when booking is completed
 */
export const clearSessionOnBookingComplete = (eventId: number): void => {
  try {
    clearAllSeatingData(eventId);
    console.log(`[SessionStorage] Booking completed - cleared all session data for event ${eventId}`);
  } catch (error) {
    console.error('[SessionStorage] Error clearing session on booking completion:', error);
  }
};

/**
 * Enhanced booking completion cleanup with detailed logging
 * This function should be called when a booking is successfully completed
 * to clean up all session-related data and prevent seat reservation conflicts
 */
export const completeBookingCleanup = (eventId: number, context: string = 'payment_success'): void => {
  try {
    const sessionId = getSessionId(eventId);
    const selectedSeats = getSelectedSeats(eventId);
    
    // Log the cleanup operation
    console.log(`[SessionStorage] Starting booking completion cleanup for event ${eventId}`, {
      context,
      sessionId,
      selectedSeatsCount: selectedSeats.length,
      timestamp: new Date().toISOString()
    });
    
    // Clear all seating-related data
    clearAllSeatingData(eventId);
    
    // Additional cleanup for any other seating-related storage keys
    const keysToRemove = [
      `seating_step_${eventId}`,
      `seating_form_data_${eventId}`,
      `seating_temporary_selection_${eventId}`,
      `seating_reservation_expiry_${eventId}`
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        console.warn(`[SessionStorage] Could not remove key ${key}:`, err);
      }
    });
    
    console.log(`[SessionStorage] Booking completion cleanup finished successfully for event ${eventId}`);
  } catch (error) {
    console.error('[SessionStorage] Error during booking completion cleanup:', error);
  }
};

/**
 * Check if the session is still valid by comparing with expiration time
 * @returns true if session is valid, false if expired
 */
export const isSessionValid = (eventId: number, expirationMinutes: number = 15): boolean => {
  try {
    const sessionKey = `seating_session_timestamp_${eventId}`;
    const timestamp = localStorage.getItem(sessionKey);
    
    if (!timestamp) {
      return false;
    }
    
    const sessionTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    const isValid = currentTime - sessionTime < expirationMinutes * 60 * 1000;
    
    console.log(`[SessionStorage] Session for event ${eventId} valid: ${isValid}`);
    return isValid;
  } catch (error) {
    console.error('[SessionStorage] Error checking session validity:', error);
    return false;
  }
};

/**
 * Update the timestamp of the current session
 */
export const updateSessionTimestamp = (eventId: number): void => {
  try {
    const sessionKey = `seating_session_timestamp_${eventId}`;
    localStorage.setItem(sessionKey, Date.now().toString());
    console.log(`[SessionStorage] Updated timestamp for event ${eventId}`);
  } catch (error) {
    console.error('[SessionStorage] Error updating session timestamp:', error);
  }
};

/**
 * Store selected seat IDs in session storage
 */
export const storeSelectedSeats = (eventId: number, seatIds: number[]): void => {
  try {
    localStorage.setItem(`selected_seats_${eventId}`, JSON.stringify(seatIds));
    console.log(`[SessionStorage] Stored ${seatIds.length} selected seats for event ${eventId}`);
  } catch (error) {
    console.error('[SessionStorage] Error storing selected seats:', error);
  }
};

/**
 * Get selected seat IDs from session storage
 */
export const getSelectedSeats = (eventId: number): number[] => {
  try {
    const seats = localStorage.getItem(`selected_seats_${eventId}`);
    return seats ? JSON.parse(seats) : [];
  } catch (error) {
    console.error('[SessionStorage] Error retrieving selected seats:', error);
    return [];
  }
};

/**
 * Clear all seating-related data for an event
 */
export const clearAllSeatingData = (eventId: number): void => {
  try {
    clearSessionId(eventId);
    localStorage.removeItem(`selected_seats_${eventId}`);
    localStorage.removeItem(`seating_session_timestamp_${eventId}`);
    
    // Clear individual seat reservations
    const keysToRemove: string[] = [];
    const seatReservationPrefix = `seat_reservation_${eventId}_`;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(seatReservationPrefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`[SessionStorage] Cleared all seating data for event ${eventId}, including ${keysToRemove.length} seat reservations`);
  } catch (error) {
    console.error('[SessionStorage] Error clearing all seating data:', error);
  }
};

/**
 * Extract event ID from various sources (URL params, navigation state, etc.)
 */
export const extractEventIdFromContext = (
  searchParams?: URLSearchParams, 
  navigationState?: any,
  sessionData?: any
): number | null => {
  try {
    // Try to get from URL parameters first
    if (searchParams) {
      const eventIdParam = searchParams.get('eventId') || searchParams.get('event_id');
      if (eventIdParam) {
        const eventId = parseInt(eventIdParam, 10);
        if (!isNaN(eventId)) return eventId;
      }
    }

    // Try to get from navigation state
    if (navigationState?.eventId) {
      const eventId = parseInt(navigationState.eventId.toString(), 10);
      if (!isNaN(eventId)) return eventId;
    }

    // Try to get from session data
    if (sessionData?.eventId) {
      const eventId = parseInt(sessionData.eventId.toString(), 10);
      if (!isNaN(eventId)) return eventId;
    }

    return null;
  } catch (error) {
    console.error('[SessionStorage] Error extracting event ID from context:', error);
    return null;
  }
};

/**
 * Safe booking completion cleanup that attempts to extract event ID from various sources
 */
export const safeBookingCompletionCleanup = (
  searchParams?: URLSearchParams,
  navigationState?: any,
  sessionData?: any,
  context: string = 'payment_success'
): boolean => {
  try {
    const eventId = extractEventIdFromContext(searchParams, navigationState, sessionData);
    
    if (eventId) {
      completeBookingCleanup(eventId, context);
      return true;
    } else {
      console.warn('[SessionStorage] Could not extract event ID for booking completion cleanup');
      return false;
    }
  } catch (error) {
    console.error('[SessionStorage] Error during safe booking completion cleanup:', error);
    return false;
  }
};

/**
 * Check if any seating data exists for any events (debugging utility)
 */
export const getAllSeatingDataKeys = (): string[] => {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('seating_session_') || 
        key.startsWith('selected_seats_') ||
        key.startsWith('seating_')
      )) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    console.error('[SessionStorage] Error getting seating data keys:', error);
    return [];
  }
};

/**
 * Manual cleanup function for testing/debugging purposes
 * Can be called from browser console: window.clearSeatingSession(eventId)
 */
export const manualSessionCleanup = (eventId: number): void => {
  completeBookingCleanup(eventId, 'manual_cleanup');
  console.log(`[SessionStorage] Manual cleanup completed for event ${eventId}`);
};

/**
 * Debug function to show all seating-related storage keys
 * Can be called from browser console: window.showSeatingStorage()
 */
export const debugSeatingStorage = (): void => {
  const keys = getAllSeatingDataKeys();
  console.log('[SessionStorage] Current seating storage keys:', keys);
  
  keys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      console.log(`[SessionStorage] ${key}:`, value);
    } catch (error) {
      console.error(`[SessionStorage] Error reading ${key}:`, error);
    }
  });
};

/**
 * Store individual seat reservation for session tracking
 */
export const storeSeatReservation = (eventId: number, seatId: number, sessionId: string): void => {
  try {
    const key = `seat_reservation_${eventId}_${seatId}`;
    const reservationData = {
      sessionId,
      seatId,
      eventId,
      reservedAt: Date.now(),
      expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes from now
    };
    localStorage.setItem(key, JSON.stringify(reservationData));
    console.log(`[SessionStorage] Stored seat reservation for seat ${seatId} in event ${eventId}`);
  } catch (error) {
    console.error('[SessionStorage] Error storing seat reservation:', error);
  }
};

/**
 * Remove individual seat reservation
 */
export const removeSeatReservation = (eventId: number, seatId: number): void => {
  try {
    const key = `seat_reservation_${eventId}_${seatId}`;
    localStorage.removeItem(key);
    console.log(`[SessionStorage] Removed seat reservation for seat ${seatId} in event ${eventId}`);
  } catch (error) {
    console.error('[SessionStorage] Error removing seat reservation:', error);
  }
};

/**
 * Check if a seat is reserved by the current session
 */
export const isSeatReservedBySession = (eventId: number, seatId: number, sessionId: string): boolean => {
  try {
    const key = `seat_reservation_${eventId}_${seatId}`;
    const reservationData = localStorage.getItem(key);
    
    if (!reservationData) return false;
    
    const reservation = JSON.parse(reservationData);
    const now = Date.now();
    
    // Check if reservation is valid and belongs to current session
    return reservation.sessionId === sessionId && 
           reservation.expiresAt > now;
  } catch (error) {
    console.error('[SessionStorage] Error checking seat reservation:', error);
    return false;
  }
};

/**
 * Get all seat reservations for current session
 */
export const getSessionSeatReservations = (eventId: number, sessionId: string): number[] => {
  try {
    const seatIds: number[] = [];
    const prefix = `seat_reservation_${eventId}_`;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const reservationData = localStorage.getItem(key);
          if (reservationData) {
            const reservation = JSON.parse(reservationData);
            const now = Date.now();
            
            if (reservation.sessionId === sessionId && reservation.expiresAt > now) {
              seatIds.push(reservation.seatId);
            }
          }
        } catch (err) {
          console.warn(`[SessionStorage] Could not parse reservation data for key ${key}:`, err);
        }
      }
    }
    
    return seatIds;
  } catch (error) {
    console.error('[SessionStorage] Error getting session seat reservations:', error);
    return [];
  }
};

// Expose functions to window for debugging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).clearSeatingSession = manualSessionCleanup;
  (window as any).showSeatingStorage = debugSeatingStorage;
  (window as any).clearAllSeatingData = clearAllSeatingData;
}
