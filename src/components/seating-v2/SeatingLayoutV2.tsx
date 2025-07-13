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
import SeatingReservationTimer from './SeatingReservationTimer';
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

  // Load reservations separately after layout is loaded
  useEffect(() => {
    // Skip if layout isn't loaded yet
    if (!layout) return;
    
    const loadReservations = async () => {
      try {
        // Check for existing reservations
        const reservedSeats = await seatingAPIService.getReservationsBySession(eventId, selectionState.sessionId);
        
        if (reservedSeats.length > 0) {
          console.log(`Found ${reservedSeats.length} existing reservations for session ${selectionState.sessionId}`);
          
          // Convert ReservedSeatDTO to SeatingSelectedSeat format
          const selectedSeats = reservedSeats
            .map(reservedSeat => {
              const now = new Date();
              
              // Find the corresponding layout seat for position data
              const layoutSeat = layout.seats.find(s => s.id === reservedSeat.seatId);
              if (!layoutSeat) return null;

              // Create selected seat with all required properties
              const selectedSeat: SeatingSelectedSeat = {
                // Base properties from layout seat
                id: layoutSeat.id,
                seatNumber: layoutSeat.seatNumber,
                row: layoutSeat.row,
                number: layoutSeat.number,
                x: layoutSeat.x,
                y: layoutSeat.y,
                width: layoutSeat.width,
                height: layoutSeat.height,
                status: reservedSeat.status,

                // Selection properties
                selectedAt: now,
                // Convert reservedUntil string to Date, or generate new expiry
                reservedUntil: reservedSeat.reservedUntil ? new Date(reservedSeat.reservedUntil) : new Date(now.getTime() + 10 * 60 * 1000),
                ticketType: reservedSeat.ticketType ?? {
                  id: 0,
                  type: 'General',
                  name: 'General',
                  price: reservedSeat.price || 0,
                  color: '#4B5563',
                  description: 'General Admission'
                },
                price: reservedSeat.price || 0
              };

              return selectedSeat;
            })
            .filter((seat): seat is SeatingSelectedSeat => seat !== null);
          
          // Calculate total price for selected seats
          const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
          
          // Update selection state with existing reservations
          setSelectionState(prev => ({
            ...prev,
            selectedSeats,
            totalPrice
          }));
          
          if (selectedSeats.length > 0) {
            toast.success(`Restored ${selectedSeats.length} previously selected seat${selectedSeats.length > 1 ? 's' : ''}`);
          }
        }
      } catch (err) {
        console.warn('Failed to load reservations, continuing without them:', err);
      }
    };
    
    loadReservations();
  }, [layout, eventId, selectionState.sessionId]);

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
      toast.success('Seating layout refreshed');
    } catch (error) {
      console.error('[SeatingLayoutV2] Error refreshing layout:', error);
      toast.error('Failed to refresh layout. Please try again.');
    }
  }, [eventId]);

  // Handle individual seat reservation when selected
  const handleSeatReserve = useCallback(async (seat: SeatingLayoutSeat, isSelecting: boolean) => {
    try {
      if (isSelecting) {
        // Reserve the seat
        const reservationRequest = {
          EventId: eventId,
          SessionId: selectionState.sessionId,
          SeatId: seat.id,
          Row: seat.row,
          Number: seat.number
        };

        await seatingAPIService.reserveSeat(reservationRequest);
        
        // Track reservation locally as well
        storeSeatReservation(eventId, seat.id, selectionState.sessionId);
        
        console.log(`[SeatingLayoutV2] Reserved seat ${seat.row}${seat.number} for session ${selectionState.sessionId}`);
      } else {
        // Release the seat
        const releaseRequest = {
          SeatId: seat.id,
          SessionId: selectionState.sessionId
        };

        const releaseResult = await seatingAPIService.releaseSeat(releaseRequest);
        
        // If we got an updated layout from the backend, use it to refresh UI
        if (releaseResult.updatedLayout) {
          console.log('[SeatingLayoutV2] Refreshing layout with updated data from server');
          setLayout(releaseResult.updatedLayout);
        }
        
        // Remove local reservation tracking
        removeSeatReservation(eventId, seat.id);
        
        console.log(`[SeatingLayoutV2] Released seat ${seat.row}${seat.number} for session ${selectionState.sessionId}`);
      }
    } catch (error: any) {
      console.error(`[SeatingLayoutV2] Error ${isSelecting ? 'reserving' : 'releasing'} seat:`, error);
      throw error; // Re-throw to handle in seat selection
    }
  }, [eventId, selectionState.sessionId]);

  // Handle seat selection
  const handleSeatSelect = useCallback(async (seat: SeatingLayoutSeat) => {
    const isCurrentlySelected = selectionState.selectedSeats.some(s => s.row === seat.row && s.number === seat.number);
    const isSelecting = !isCurrentlySelected;
    
    console.log(`[SeatingLayoutV2] handleSeatSelect called:`, {
      seatId: seat.id,
      seatNumber: seat.seatNumber,
      isCurrentlySelected,
      isSelecting,
      sessionId: selectionState.sessionId,
      currentSelectedSeats: selectionState.selectedSeats.map(s => `${s.seatNumber}(${s.id})`)
    });
    
    // Check if seat can be selected/deselected (pass eventId and sessionId)
    if (!canSelectSeat(seat, selectionState.selectedSeats, eventId, selectionState.sessionId)) {
      // Special case - check if it's reserved by this session
      const isReservedByCurrentSession = isSeatReservedBySession(eventId, seat.id, selectionState.sessionId);
      
      if (!isReservedByCurrentSession) {
        if (seat.status !== SeatStatus.Available) {
          toast.error('This seat is not available');
        } else if (selectionState.selectedSeats.length >= maxSeats && isSelecting) {
          toast.error(`Maximum ${maxSeats} seats allowed`);
        }
        return;
      }
    }

    // For deselection, we'll be more lenient with API failures
    if (!isSelecting) {
      // For deselection, try the API but don't let failures block UI updates
      try {
        const releaseResult = await handleSeatReserve(seat, isSelecting);
        console.log(`[SeatingLayoutV2] Successfully released seat ${seat.row}${seat.number} on server`);
      } catch (error: any) {
        console.warn(`[SeatingLayoutV2] Failed to release seat ${seat.row}${seat.number} on server, continuing with UI update:`, error);
        // Remove local reservation tracking even if API fails
        removeSeatReservation(eventId, seat.id);
      }
      
      // ALWAYS update UI for deselection, regardless of API result
      setSelectionState(prev => ({
        ...prev,
        selectedSeats: prev.selectedSeats.filter(s => s.id !== seat.id),
        totalPrice: prev.totalPrice - (prev.selectedSeats.find(s => s.id === seat.id)?.price || 0)
      }));
      
      toast.success(`Seat ${seat.row}${seat.number} released`);
      return;
    }

    // For selection, we require the API call to succeed
    try {
      await handleSeatReserve(seat, isSelecting);
    } catch (error: any) {
      console.error('Failed to update seat reservation:', error);
      toast.error(error.message || `Failed to reserve seat. Please try again.`);
      return;
    }
      
    // Update the UI state (always for deselection, only on success for selection)
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

    // Show success message
    if (isSelecting) {
      toast.success(`Seat ${seat.row}${seat.number} reserved`);
    } else {
      toast.success(`Seat ${seat.row}${seat.number} released`);
    }
  }, [maxSeats, selectionState.selectedSeats, layout?.ticketTypes, handleSeatReserve, eventId]);

  // Handle clear selection
  const handleClearSelection = useCallback(async () => {
    try {
      // If there are selected seats, release them on the server
      if (selectionState.selectedSeats.length > 0) {
        // Extract all seat IDs
        const seatIds = selectionState.selectedSeats.map(seat => seat.id);
        
        // Release all seats at once using the batch method
        await seatingAPIService.releaseSeats(
          seatIds, 
          selectionState.sessionId
        );
        
        // Clean up local storage for all released seats
        seatIds.forEach(seatId => {
          removeSeatReservation(eventId, seatId);
        });

        toast.success('All seats released');
      }

      // Reset selection state before page refresh
      setSelectionState(prev => ({
        ...initialSelectionState,
        sessionId: prev.sessionId // Preserve session ID
      }));
      
      // Perform hard page refresh
      console.log('[SeatingLayoutV2] Performing hard page refresh');
      window.location.reload();
      
    } catch (error) {
      console.error('[SeatingLayoutV2] Error clearing selection:', error);
      toast.error('Failed to release seats. Refreshing page anyway.');
      
      // Still do a hard page refresh even if the API calls fail
      window.location.reload();
    }
  }, [initialSelectionState, selectionState.selectedSeats, selectionState.sessionId, eventId]);

  // Handle removing individual seat
  const handleRemoveSeat = useCallback(async (seat: SeatingSelectedSeat) => {
    try {
      // Release the seat
      const releaseRequest = {
        SeatId: seat.id,
        SessionId: selectionState.sessionId
      };

      const releaseResult = await seatingAPIService.releaseSeat(releaseRequest);
      
      // If we got an updated layout, use it to refresh the UI
      if (releaseResult.updatedLayout) {
        console.log('[SeatingLayoutV2] Refreshing layout after removing seat');
        setLayout(releaseResult.updatedLayout);
      }
      
      console.log(`[SeatingLayoutV2] Released seat ${seat.row}${seat.number} for session ${selectionState.sessionId}`);
    } catch (error: any) {
      console.warn(`[SeatingLayoutV2] Failed to release seat ${seat.row}${seat.number} on server:`, error);
      // Continue with UI update even if API fails
    }
    
    // Always update UI state and remove local tracking
    removeSeatReservation(eventId, seat.id);
    
    setSelectionState(prev => ({
      ...prev,
      selectedSeats: prev.selectedSeats.filter(s => s.id !== seat.id),
      totalPrice: prev.totalPrice - (seat.price || 0)
    }));

    toast.success(`Seat ${seat.row}${seat.number} released`);
  }, [eventId, selectionState.sessionId]);

  // Handle reservation expiry
  const handleReservationExpiry = useCallback(() => {
    toast.error('Seat reservation expired');
    handleClearSelection();
  }, [handleClearSelection]);

  // Handle seat click
  const handleSeatClick = useCallback((seat: SeatingLayoutSeat) => {
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
    
    // ALLOW clicking if:
    // 1. Seat is already selected (for deselection)
    // 2. Seat is reserved by current session (for deselection) 
    // 3. Seat is available (for selection)
    if (isAlreadySelected || isReservedByCurrentSession) {
      console.log(`[SeatingLayoutV2] Allowing click on ${seat.row}${seat.number} - already selected or reserved by current session`);
      handleSeatSelect(seat);
      return;
    }
    
    // For new selections, check if seat is available
    if (!canSelectSeat(seat, selectionState.selectedSeats, eventId, selectionState.sessionId)) {
      console.log(`[SeatingLayoutV2] Seat ${seat.row}${seat.number} cannot be selected - not available`);
      return;
    }

    handleSeatSelect(seat);
  }, [layout, selectionState.selectedSeats, selectionState.sessionId, eventId, handleSeatSelect]);

  // Handle checkout - seats should already be reserved individually
  const handleReservation = useCallback(async () => {
    if (!selectionState.selectedSeats.length) {
      toast.error('Please select at least one seat');
      return;
    }

    try {
      // Seats should already be reserved individually when clicked
      // Just proceed with the booking flow
      console.log(`[SeatingLayoutV2] Proceeding to checkout with ${selectionState.selectedSeats.length} pre-reserved seats`);
      onSelectionComplete?.(selectionState);
    } catch (err: any) {
      console.error('Failed to proceed to checkout:', err);
      toast.error(err.message || 'Failed to proceed to checkout. Please try again.');
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

      {selectionState.selectedSeats.length > 0 && (
        <SeatingReservationTimer
          sessionId={selectionState.sessionId}
          onExpiry={handleReservationExpiry}
        />
      )}
      
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
