// Main Seating Layout Component V2
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { seatingAPIService } from '../../services/seating-v2/seatingAPIService';
import { 
  SeatingLayoutProps, 
  SeatingLayoutResponse, 
  SeatingSelectionState, 
  SeatingSelectedSeat,
  SeatSelectionMode,
  SeatingLayoutSeat
} from '../../types/seating-v2';
import { 
  generateSessionId, 
  calculateTotalPrice, 
  canSelectSeat,
  validateSelectionState,
  toggleSeatSelection
} from '../../utils/seating-v2/seatingUtils';
import { 
  getSessionId, 
  storeSessionId, 
  storeSelectedSeats, 
  storeSeatReservation, 
  removeSeatReservation,
  isSeatReservedBySession,
  getSessionSeatReservations
} from '../../utils/seating-v2/sessionStorage';
import { SeatStatus } from '../../types/seatStatus';
import SeatingGrid from './SeatingGrid';
import SeatingLegend from './SeatingLegend';
import SeatingSummary from './SeatingSummary';
import SeatingLoadingSpinner from './SeatingLoadingSpinner';
import SeatingErrorMessage from './SeatingErrorMessage';

const SeatingLayoutV2: React.FC<SeatingLayoutProps> = ({
  eventId,
  onSelectionComplete,
  maxSeats = 8,
  showLegend = true,
  className = '',
  isAdmin = false,
  onAdminToggle
}) => {
  // Initialize selection state with memoized session ID (restore from storage if available)
  const initialSelectionState = useMemo<SeatingSelectionState>(() => {
    const existingSessionId = getSessionId(eventId);
    const sessionId = existingSessionId || generateSessionId();
    
    // Store the session ID if it's new
    if (!existingSessionId) {
      storeSessionId(eventId, sessionId);
    }

    return {
      selectedSeats: [],
      selectedTables: [],
      generalTickets: [],
      totalPrice: 0,
      maxSeats,
      ticketTypes: [],
      mode: SeatSelectionMode.EventHall,
      sessionId,
      eventId
    };
  }, [eventId, maxSeats]);

  const [selectionState, setSelectionState] = useState<SeatingSelectionState>(initialSelectionState);
  const [layout, setLayout] = useState<SeatingLayoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restorationNotificationShown, setRestorationNotificationShown] = useState(false);

  // Load seating layout
  useEffect(() => {
    const loadLayout = async () => {
      try {
        setLoading(true);
        const response = await seatingAPIService.getEventSeatLayout(eventId);
        
        setLayout(response);
        
        // Only update ticket types here, not loading reservations
        if (response) {
          setSelectionState(prev => ({
            ...prev,
            ticketTypes: response.ticketTypes || []
          }));
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Failed to load seating layout:', err);
        setError(err.message || 'Failed to load seating layout');
        toast.error('Failed to load seating layout');
      } finally {
        setLoading(false);
      }
    };

    loadLayout();
  }, [eventId]);

  // 🎯 INDUSTRY STANDARD: Load reservations and initialize active reservation state
  useEffect(() => {
    // Skip if layout isn't loaded yet
    if (!layout) return;
    
    const loadReservations = async () => {
      try {
        // Check for active reservation from timer service
        const reservationTimer = (await import('../../services/reservationTimerService')).default;
        const activeReservation = reservationTimer.getReservation();
        
        if (activeReservation && activeReservation.eventId === eventId) {
          const timeLeft = reservationTimer.getTimeLeft();
          
          if (timeLeft > 0) {
            console.log(`🎯 Active reservation found on page load:`, {
              reservationId: activeReservation.reservationId,
              seatsCount: activeReservation.seatsCount,
              timeLeft: `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
            });
            
            // ✅ INDUSTRY STANDARD: Restore full selection state for session recovery
            await restoreReservationState(activeReservation);
            
            // Note: Welcome back message removed as it was redundant
            // Reserved seats will be highlighted by the UI automatically
          } else {
            console.log('⏰ Found expired reservation, cleaning up...');
            reservationTimer.cleanup();
          }
        }
        
        // Legacy fallback: Check localStorage for backward compatibility
        const legacyReservation = localStorage.getItem('activeReservation');
        if (legacyReservation && !activeReservation) {
          const reservation = JSON.parse(legacyReservation);
          if (reservation.eventId === eventId && reservation.sessionId === selectionState.sessionId) {
            const expiresAt = new Date(reservation.expiresAt);
            if (expiresAt > new Date()) {
              console.log('🔄 Migrating legacy reservation to timer service...');
              // Migrate to new timer service
              await reservationTimer.startTimer(reservation);
            } else {
              console.log('⏰ Legacy reservation expired, clearing...');
              localStorage.removeItem('activeReservation');
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load active reservation:', err);
      }
    };
    
    loadReservations();
  }, [layout, eventId, selectionState.sessionId]);

  // ✅ INDUSTRY STANDARD: Restore full selection state from existing reservation
  const restoreReservationState = useCallback(async (reservation: any) => {
    try {
      console.log('[SeatingLayoutV2] 🔄 Restoring selection state from reservation...');
      
      // First check if we actually have seat reservations in localStorage for this session
      const expectedSeats = reservation.seatsCount || 0;
      if (expectedSeats === 0) {
        console.log('[SeatingLayoutV2] ℹ️ No seats expected to restore (seatsCount: 0)');
        return;
      }
      
      // Get reserved seats for this session from the layout
      const reservedSeats = layout?.seats?.filter(seat => 
        isSeatReservedBySession(eventId, seat.id, selectionState.sessionId)
      ) || [];

      if (reservedSeats.length > 0) {
        console.log(`[SeatingLayoutV2] 🎯 Found ${reservedSeats.length} reserved seats to restore`);
        
        // Convert layout seats to selection format
        const selectedSeats: SeatingSelectedSeat[] = reservedSeats.map(seat => {
          const selectedSeat: SeatingSelectedSeat = {
            id: seat.id,
            row: seat.row,
            number: seat.number,
            seatNumber: seat.seatNumber,
            x: seat.x,
            y: seat.y,
            width: seat.width,
            height: seat.height,
            price: seat.price || seat.ticketType?.price || 0,
            status: seat.status,
            ticketType: seat.ticketType,
            reservedUntil: new Date(Date.now() + 10 * 60 * 1000)
          };
          return selectedSeat;
        });

        // Calculate total price
        const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

        // Restore the selection state
        setSelectionState(prev => ({
          ...prev,
          selectedSeats,
          totalPrice,
          isValid: true
        }));

        // Store in session storage for persistence
        const seatIds = selectedSeats.map(s => s.id);
        storeSelectedSeats(eventId, seatIds);

        console.log('[SeatingLayoutV2] ✅ Selection state restored successfully:', {
          seatsCount: selectedSeats.length,
          totalPrice,
          seatNumbers: selectedSeats.map(s => s.seatNumber)
        });

        // Selection restored silently - no toast needed since feature is unreliable
      } else {
        console.log('[SeatingLayoutV2] ℹ️ No reserved seats found for session recovery - this is normal for new visits');
        // Only show error if we expected seats but couldn't find them AND we haven't already shown a notification
        if (expectedSeats > 0 && !restorationNotificationShown) {
          console.warn(`[SeatingLayoutV2] ⚠️ Expected ${expectedSeats} seats but found none - showing restoration error`);
          setRestorationNotificationShown(true);
          toast(
            'Session expired. Please select your new seats, or try again later',
            { 
              duration: 5000, 
              icon: '🔄',
              style: {
                background: '#f59e0b',
                color: '#ffffff',
                fontWeight: '500'
              }
            }
          );
        }
      }
    } catch (error) {
      console.error('[SeatingLayoutV2] ❌ Error restoring reservation state:', error);
      // Only show error notification if we haven't already shown one
      if (!restorationNotificationShown) {
        setRestorationNotificationShown(true);
        toast(
          'Please select your seats again to continue.',
          { 
            duration: 4000, 
            icon: '🔄',
            style: {
              background: '#ef4444',
              color: '#ffffff',
              fontWeight: '500'
            }
          }
        );
      }
    }
  }, [layout, eventId, selectionState.sessionId, setSelectionState]);

  // Function to refresh seat layout from backend
  const refreshSeatLayout = useCallback(async () => {
    try {
      console.log('[SeatingLayoutV2] Refreshing seat layout...');
      const response = await seatingAPIService.getEventSeatLayout(eventId);
      setLayout(response);
      console.log('[SeatingLayoutV2] Seat layout refreshed successfully');
    } catch (error) {
      console.warn('[SeatingLayoutV2] Failed to refresh seat layout:', error);
      // Don't show error to user as this is a background refresh
    }
  }, [eventId]);

  // Manual layout refresh function for debugging/emergency use
  const refreshLayout = useCallback(async () => {
    try {
      if (!eventId) return;
      
      console.log('[SeatingLayoutV2] Manually refreshing layout...');
      const freshLayout = await seatingAPIService.getEventSeatLayout(eventId);
      setLayout(freshLayout);
      // Layout refreshed silently
    } catch (error) {
      console.error('[SeatingLayoutV2] Error refreshing layout:', error);
      toast.error('Failed to refresh layout. Please try again.');
    }
  }, [eventId]);

  // ✅ INDUSTRY STANDARD: Client-side seat selection (no database hits)
  const handleSeatSelect = useCallback((seat: SeatingLayoutSeat) => {
    const isCurrentlySelected = selectionState.selectedSeats.some(s => s.row === seat.row && s.number === seat.number);
    const isSelecting = !isCurrentlySelected;
    
    console.log(`[SeatingLayoutV2] 🎯 CLIENT-SIDE handleSeatSelect:`, {
      seatId: seat.id,
      seatNumber: seat.seatNumber,
      isCurrentlySelected,
      isSelecting,
      currentSelectedSeats: selectionState.selectedSeats.map(s => `${s.seatNumber}(${s.id})`)
    });
    
    // Check if seat can be selected/deselected
    if (!canSelectSeat(seat, selectionState.selectedSeats, eventId, selectionState.sessionId)) {
      if (seat.status !== SeatStatus.Available) {
        toast.error('This seat is not available');
      } else if (selectionState.selectedSeats.length >= maxSeats && isSelecting) {
        toast.error(`Maximum ${maxSeats} seats allowed`);
      }
      return;
    }

    // ✅ INDUSTRY STANDARD: Pure client-side selection/deselection
    let validationError: string | null = null;
    
    setSelectionState(prev => {
      // Toggle selection using our utility
      const newState = toggleSeatSelection(seat, {
        ...prev,
        maxSeats,
        ticketTypes: layout?.ticketTypes || []
      });

      // Validate the new state
      const validationResult = validateSelectionState(newState);
      if (!validationResult.isValid) {
        validationError = validationResult.errors[0] || 'Invalid selection';
        return prev;
      }

      return newState;
    });

    // Show validation error if any (after state update)
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Show success message with different text to indicate it's client-side
    if (isSelecting) {
      console.log(`[SeatingLayoutV2] ✅ CLIENT-SIDE: Added seat ${seat.row}${seat.number} to selection`);
    } else {
      console.log(`[SeatingLayoutV2] ✅ CLIENT-SIDE: Removed seat ${seat.row}${seat.number} from selection`);
    }
  }, [maxSeats, selectionState.selectedSeats, layout?.ticketTypes, eventId]);

  // 🎯 INDUSTRY STANDARD: Clear selection with active reservation handling
  const handleClearSelection = useCallback(async () => {
    // Check for active reservation first
    const reservationTimer = (await import('../../services/reservationTimerService')).default;
    const activeReservation = reservationTimer.getReservation();
    
    if (activeReservation) {
      // User has active reservation - proceed directly without dialog
      const timeLeft = reservationTimer.getTimeLeft();
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      
      // Clear UI selection only - timer continues
      setSelectionState(prev => ({
        ...initialSelectionState,
        sessionId: prev.sessionId // Preserve session ID
      }));
      
      toast('Select new seats to continue', {
        duration: 3000,
        icon: '🔄'
      });
      
      console.log('🎯 Clear during active reservation: UI cleared, timer continues');
      return;
    }
    
    // No active reservation - normal clear behavior
    if (selectionState.selectedSeats.length === 0) {
      console.log('No seats selected to clear');
      return;
    }

    console.log(`[SeatingLayoutV2] 🎯 CLIENT-SIDE: Clearing ${selectionState.selectedSeats.length} selected seats`);

    // Since we're using client-side selection, just clear the UI state
    setSelectionState(prev => ({
      ...initialSelectionState,
      sessionId: prev.sessionId // Preserve session ID
    }));

    // Clear completed silently
  }, [initialSelectionState, selectionState.selectedSeats]);

  // ✅ INDUSTRY STANDARD: Remove individual seat (client-side only until batch reservation)
  const handleRemoveSeat = useCallback((seat: SeatingSelectedSeat) => {
    console.log(`[SeatingLayoutV2] 🎯 CLIENT-SIDE: Removing seat ${seat.row}${seat.number} from selection`);
    
    // Since we're using client-side selection, just update the UI state
    setSelectionState(prev => ({
      ...prev,
      selectedSeats: prev.selectedSeats.filter(s => s.id !== seat.id),
      totalPrice: prev.totalPrice - (seat.price || 0)
    }));

    console.log(`[SeatingLayoutV2] ✅ CLIENT-SIDE: Removed seat ${seat.row}${seat.number} from selection`);
  }, []);

  // Handle reservation expiry
  const handleReservationExpiry = useCallback(() => {
    toast.error('Seat reservation expired');
    handleClearSelection();
  }, [handleClearSelection]);

  // 🎯 INDUSTRY STANDARD: Handle seat click with active reservation logic
  const handleSeatClick = useCallback(async (seat: SeatingLayoutSeat) => {
    if (!layout) return;
    
    const isAlreadySelected = selectionState.selectedSeats.some(s => s.row === seat.row && s.number === seat.number);
    const isReservedByCurrentSession = isSeatReservedBySession(eventId, seat.id, selectionState.sessionId);
    
    console.log(`[SeatingLayoutV2] Seat click: ${seat.row}${seat.number}`, {
      status: seat.status,
      isAlreadySelected,
      isReservedByCurrentSession,
      eventId,
      seatId: seat.id,
      sessionId: selectionState.sessionId
    });
    
    // Check for active reservation timer
    const reservationTimer = (await import('../../services/reservationTimerService')).default;
    const activeReservation = reservationTimer.getReservation();
    
    // ALLOW clicking if:
    // 1. Seat is already selected (for deselection)
    // 2. Seat is reserved by current session (for deselection) 
    if (isAlreadySelected || isReservedByCurrentSession) {
      console.log(`[SeatingLayoutV2] Allowing click on ${seat.row}${seat.number} - already selected or reserved by current session`);
      handleSeatSelect(seat);
      return;
    }
    
    // For new selections during active reservation - show warning
    if (activeReservation && selectionState.selectedSeats.length === 0) {
      const timeLeft = reservationTimer.getTimeLeft();
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      
      // Proceed directly without dialog - user can select new seats
      console.log(`User has ${activeReservation.seatsCount} seats reserved (${minutes}:${seconds.toString().padStart(2, '0')} remaining) - allowing new selection`);
      
      // User proceeds with seat selection silently
      console.log('User confirmed seat replacement - proceeding with selection');
    }
    
    // For new selections, check if seat is available
    if (!canSelectSeat(seat, selectionState.selectedSeats, eventId, selectionState.sessionId)) {
      console.log(`[SeatingLayoutV2] Seat ${seat.row}${seat.number} cannot be selected - not available`);
      return;
    }

    handleSeatSelect(seat);
  }, [layout, selectionState.selectedSeats, selectionState.sessionId, eventId, handleSeatSelect]);

  // ? SIMPLIFIED: Direct proceed to food selection without reservation API calls
  const handleReservation = useCallback(async () => {
    if (!selectionState.selectedSeats.length) {
      toast.error('Please select at least one seat');
      return;
    }

    try {
      console.log(`[SeatingLayoutV2] ? SIMPLIFIED: Proceeding with ${selectionState.selectedSeats.length} seats directly to food selection`);
      
      // Call the completion handler directly - no API reservation calls needed
      onSelectionComplete(selectionState);
      
      toast.success('Seats selected! Proceeding to food selection...');
      
    } catch (error) {
      console.error('Error during selection completion:', error);
      toast.error('Failed to proceed with seat selection');
    }
  }, [selectionState, onSelectionComplete]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    seatingAPIService.getEventSeatLayout(eventId)
      .then(response => {
        setLayout(response);
        setError(null);
      })
      .catch(err => {
        console.error('Failed to reload seating layout:', err);
        setError(err.message || 'Failed to reload seating layout');
        toast.error('Failed to reload seating layout');
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  // Periodic sync to ensure seat layout consistency (especially important after deselection)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Only start the interval if we have selected seats
    if (selectionState.selectedSeats.length > 0) {
      intervalId = setInterval(async () => {
        try {
          console.log('[SeatingLayoutV2] Periodic sync - checking seat layout consistency');
          const freshLayout = await seatingAPIService.getEventSeatLayout(eventId);
          
          // Check if any of our selected seats are no longer reserved on the server
          const currentSeatIds = selectionState.selectedSeats.map(s => s.id);
          const serverSeatStates = freshLayout.seats.filter(s => currentSeatIds.includes(s.id));
          
          const inconsistencies = serverSeatStates.filter(serverSeat => {
            const isReservedByUs = isSeatReservedBySession(eventId, serverSeat.id, selectionState.sessionId);
            return !isReservedByUs && serverSeat.status === SeatStatus.Available;
          });

          if (inconsistencies.length > 0) {
            console.log('[SeatingLayoutV2] Found inconsistencies, refreshing layout:', inconsistencies.map(s => s.seatNumber));
            setLayout(freshLayout);
          }
        } catch (error) {
          console.warn('[SeatingLayoutV2] Error during periodic sync:', error);
        }
      }, 15000); // Check every 15 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [eventId, selectionState.selectedSeats, selectionState.sessionId]);

  // Auto-refresh layout when page comes back into focus (user returns from checkout)
  useEffect(() => {
    const handleFocus = async () => {
      if (!document.hidden && layout) {
        console.log('[SeatingLayoutV2] Page focus detected, refreshing layout to ensure consistency');
        try {
          const freshLayout = await seatingAPIService.getEventSeatLayout(eventId);
          setLayout(freshLayout);
        } catch (error) {
          console.warn('[SeatingLayoutV2] Failed to refresh layout on focus:', error);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Small delay to allow any pending operations to complete
        setTimeout(handleFocus, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [eventId, layout]);

  if (loading) {
    return <SeatingLoadingSpinner />;
  }

  if (error) {
    return <SeatingErrorMessage error={error} onRetry={handleRetry} />;
  }

  if (!layout) {
    return <SeatingErrorMessage error="No seating layout available" onRetry={handleRetry} />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {showLegend && (
        <SeatingLegend
          ticketTypes={layout.ticketTypes.filter(type => 
            type.name?.toLowerCase() !== 'general' && 
            type.type?.toLowerCase() !== 'general'
          )}
        />
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <SeatingGrid
          layout={layout}
          seats={layout.seats}
          selectedSeats={selectionState.selectedSeats}
          onSeatClick={handleSeatClick}
          isAdmin={isAdmin}
          onAdminToggle={onAdminToggle}
        />
      </div>
      
      <SeatingSummary
        selectedSeats={selectionState.selectedSeats}
        totalPrice={selectionState.totalPrice}
        onProceed={handleReservation}
        onClear={handleClearSelection}
        onRemoveSeat={handleRemoveSeat}
      />
    </div>
  );
};

export default SeatingLayoutV2;
