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
  validateSelectionState
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
  className = ''
}) => {
  // Initialize selection state with memoized session ID
  const initialSelectionState = useMemo<SeatingSelectionState>(() => ({
    selectedSeats: [],
    selectedTables: [],
    generalTickets: [],
    totalPrice: 0,
    mode: SeatSelectionMode.EventHall,
    sessionId: generateSessionId(),
    eventId
  }), [eventId]);

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
  const handleSeatSelect = useCallback((seat: SeatingSelectedSeat) => {
    setSelectionState(prev => {
      const isSelected = prev.selectedSeats.some(s => s.seat.id === seat.seat.id);
      
      if (isSelected) {
        const newSelectedSeats = prev.selectedSeats.filter(s => s.seat.id !== seat.seat.id);
        return {
          ...prev,
          selectedSeats: newSelectedSeats,
          totalPrice: calculateTotalPrice({ ...prev, selectedSeats: newSelectedSeats })
        };
      }

      if (prev.selectedSeats.length >= maxSeats) {
        toast.error(`Maximum ${maxSeats} seats allowed`);
        return prev;
      }

      const newSelectedSeats = [...prev.selectedSeats, seat];
      return {
        ...prev,
        selectedSeats: newSelectedSeats,
        totalPrice: calculateTotalPrice({ ...prev, selectedSeats: newSelectedSeats })
      };
    });
  }, [maxSeats]);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectionState(prev => ({
      ...prev,
      selectedSeats: [],
      totalPrice: 0
    }));
  }, []);

  // Handle reservation expiry
  const handleReservationExpiry = useCallback(() => {
    toast.error('Seat reservation expired');
    handleClearSelection();
  }, [handleClearSelection]);

  // Handle seat click
  const handleSeatClick = useCallback((seat: SeatingLayoutSeat) => {
    if (!canSelectSeat(seat, selectionState.selectedSeats)) {
      return;
    }

    handleSeatSelect({
      seat,
    });
  }, [selectionState.selectedSeats, handleSeatSelect]);

  // Handle proceed to checkout
  const handleProceedToCheckout = useCallback(async () => {
    if (!selectionState.sessionId) {
      toast.error('Invalid session');
      return;
    }

    const validation = validateSelectionState(selectionState);
    if (!validation.isValid) {
      toast.error(validation.errors.join(', '));
      return;
    }

    try {
      // Reserve seats one by one
      await Promise.all(
        selectionState.selectedSeats.map(selected =>
          seatingAPIService.reserveSeat({
            seatId: selected.seat.id,
            sessionId: selectionState.sessionId!
          })
        )
      );
      
      onSelectionComplete(selectionState);
    } catch (err: any) {
      console.error('Failed to reserve seats:', err);
      toast.error(err.message || 'Failed to reserve seats');
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
          seats={layout.seats}
          selectedSeats={selectionState.selectedSeats.map(s => s.seat.id)}
          onSeatClick={handleSeatClick}
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
            onProceed={handleProceedToCheckout}
            onClear={handleClearSelection}
          />
        </>
      )}
    </div>
  );
};

export default SeatingLayoutV2;
