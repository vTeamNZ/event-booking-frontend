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
  // Initialize selection state with memoized session ID
  const initialSelectionState = useMemo<SeatingSelectionState>(() => ({
    selectedSeats: [],
    selectedTables: [],
    generalTickets: [],
    totalPrice: 0,
    maxSeats,
    ticketTypes: [],
    mode: SeatSelectionMode.EventHall,
    sessionId: generateSessionId(),
    eventId
  }), [eventId, maxSeats]);

  const [selectionState, setSelectionState] = useState<SeatingSelectionState>(initialSelectionState);
  const [layout, setLayout] = useState<SeatingLayoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load seating layout and ticket types
  useEffect(() => {
    const loadLayout = async () => {
      try {
        setLoading(true);
        const response = await seatingAPIService.getEventSeatLayout(eventId);
        
        // DEBUG: Temporary logging to diagnose aisle issues
        if (response.hasHorizontalAisles) {
          console.log('DEBUG - Horizontal Aisle Data:', {
            raw: response.horizontalAisleRows,
            type: typeof response.horizontalAisleRows,
            hasAisles: response.hasHorizontalAisles
          });
        }
        
        setLayout(response);
        // Update selection state with ticket types
        setSelectionState(prev => ({
          ...prev,
          ticketTypes: response.ticketTypes || []
        }));
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

  // Handle seat selection
  const handleSeatSelect = useCallback((seat: SeatingLayoutSeat) => {
    setSelectionState(prev => {
      const isSelected = prev.selectedSeats.some(s => s.row === seat.row && s.number === seat.number);
      
      // Check if seat can be selected/deselected
      if (!canSelectSeat(seat, prev.selectedSeats)) {
        if (seat.status !== SeatStatus.Available) {
          toast.error('This seat is not available');
        } else if (prev.selectedSeats.length >= maxSeats && !isSelected) {
          toast.error(`Maximum ${maxSeats} seats allowed`);
        }
        return prev;
      }

      // Toggle selection using our utility
      const newState = toggleSeatSelection(seat, {
        ...prev,
        maxSeats,
        ticketTypes: layout?.ticketTypes || []
      });

      // Validate the new state
      const validationResult = validateSelectionState(newState);
      if (!validationResult.isValid) {
        toast.error(validationResult.errors[0] || 'Invalid selection');
        return prev;
      }

      return newState;
    });
  }, [maxSeats]);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectionState(prev => ({
      ...initialSelectionState,
      sessionId: prev.sessionId // Preserve session ID
    }));
  }, [initialSelectionState]);

  // Handle reservation expiry
  const handleReservationExpiry = useCallback(() => {
    toast.error('Seat reservation expired');
    handleClearSelection();
  }, [handleClearSelection]);

  // Handle seat click
  const handleSeatClick = useCallback((seat: SeatingLayoutSeat) => {
    if (!layout) return;
    
    if (!canSelectSeat(seat, selectionState.selectedSeats)) {
      // If seat is already selected, allow deselection
      const isAlreadySelected = selectionState.selectedSeats.some(s => s.id === seat.id);
      if (!isAlreadySelected) {
        return;
      }
    }

    handleSeatSelect(seat);
  }, [layout, selectionState.selectedSeats, handleSeatSelect]);

  // Handle seat reservation
  const handleReservation = useCallback(async () => {
    if (!selectionState.selectedSeats.length) {
      toast.error('Please select at least one seat');
      return;
    }

    try {
      // Reserve all seats in a single transaction
      const reservationRequest = {
        eventId,
        sessionId: selectionState.sessionId,
        seatIds: selectionState.selectedSeats.map(seat => seat.id)
      };

      const reservationResponse = await seatingAPIService.reserveMultipleSeats(reservationRequest);
      
      // Log the success and proceed with the booking
      console.log(`Successfully reserved ${selectionState.selectedSeats.length} seats:`, reservationResponse);
      onSelectionComplete?.(selectionState);
    } catch (err: any) {
      console.error('Failed to reserve seats:', err);
      toast.error(err.message || 'Failed to reserve seats. Please try again.');
    }
  }, [eventId, selectionState, onSelectionComplete]);

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
          ticketTypes={layout.ticketTypes}
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
        <>
          <SeatingReservationTimer
            sessionId={selectionState.sessionId}
            onExpiry={handleReservationExpiry}
          />
          
          <SeatingSummary
            selectedSeats={selectionState.selectedSeats}
            totalPrice={selectionState.totalPrice}
            onProceed={handleReservation}
            onClear={handleClearSelection}
          />
        </>
      )}
    </div>
  );
};

export default SeatingLayoutV2;
