import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  SeatLayoutResponse,
  SeatSelectionMode,
  SeatSelectionState,
  SelectedSeat,
  SelectedTable,
  GeneralTicketSelection,
  SeatStatus
} from '../types/seatSelection';
import { seatSelectionService } from '../services/seatSelectionService';
import { generateSessionId, formatPrice } from '../utils/seatSelection';
import { cn } from '../utils/seatSelection';
import EventHallLayout from './EventHallLayout';
import TableSeatingLayout from './TableSeatingLayout';
import GeneralAdmissionTickets from './GeneralAdmissionTickets';
import SeatSelectionSummary from './SeatSelectionSummary';
import ReservationTimer from './ReservationTimer';

interface SeatSelectionProps {
  eventId: number;
  onSelectionComplete: (selection: SeatSelectionState) => void;
  className?: string;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  eventId,
  onSelectionComplete,
  className
}) => {
  const [layout, setLayout] = useState<SeatLayoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => generateSessionId());
  
  const [selectionState, setSelectionState] = useState<SeatSelectionState>({
    mode: SeatSelectionMode.GeneralAdmission,
    selectedSeats: [],
    selectedTables: [],
    generalTickets: [],
    totalPrice: 0,
    sessionId
  });

  // Load layout data
  useEffect(() => {
    const loadLayout = async () => {
      try {
        console.log(`************* LOADING SEAT LAYOUT *************`);
        console.log(`Loading seat layout for event ID: ${eventId}`);
        setLoading(true);
        
        // Check if eventId is valid
        if (!eventId) {
          console.error('Invalid eventId:', eventId);
          setError('Invalid event ID. Please try again.');
          return;
        }
        
        console.log(`Making API call to get seat layout for event ${eventId}`);
        const layoutData = await seatSelectionService.getEventSeatLayout(eventId);
        console.log('Seat layout API response:', layoutData);
        
        if (!layoutData) {
          console.error('Layout data is empty');
          setError('No seat layout data received. Please try again.');
          return;
        }
        
        console.log(`Layout mode: ${layoutData.mode}`);
        console.log(`Seats count: ${layoutData.seats?.length || 0}`);
        console.log(`Tables count: ${layoutData.tables?.length || 0}`);
        console.log(`Sections count: ${layoutData.sections?.length || 0}`);
        
        setLayout(layoutData);
        setSelectionState(prev => ({
          ...prev,
          mode: layoutData.mode
        }));
      } catch (err) {
        console.error('************* FAILED TO LOAD SEAT LAYOUT *************');
        console.error('Error object:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));
        
        // Try to get more detailed error information
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data: any, status: number } };
          console.error('API Error Details:', {
            response: axiosError.response?.data,
            status: axiosError.response?.status
          });
        }
        
        setError('Failed to load seat layout. Please try again.');
        toast.error('Failed to load seat layout');
      } finally {
        setLoading(false);
      }
    };

    loadLayout();
  }, [eventId]);

  // Calculate total price whenever selection changes
  useEffect(() => {
    const seatPrice = selectionState.selectedSeats.reduce((sum, selected) => 
      sum + selected.seat.price, 0);
    
    const tablePrice = selectionState.selectedTables.reduce((sum, selected) => 
      sum + selected.selectedSeats.reduce((seatSum, seat) => seatSum + seat.price, 0), 0);
    
    const generalPrice = selectionState.generalTickets.reduce((sum, ticket) => 
      sum + (ticket.ticketType.price * ticket.quantity), 0);

    const totalPrice = seatPrice + tablePrice + generalPrice;

    setSelectionState(prev => ({
      ...prev,
      totalPrice
    }));
  }, [selectionState.selectedSeats, selectionState.selectedTables, selectionState.generalTickets]);

  // Handle seat selection for event hall mode
  const handleSeatSelect = useCallback(async (seatId: number) => {
    if (!layout) return;

    const seat = layout.seats.find(s => s.id === seatId);
    if (!seat) return;

    // Check if seat is already selected
    const isSelected = selectionState.selectedSeats.some(s => s.seat.id === seatId);
    
    if (isSelected) {
      // Deselect seat
      try {
        await seatSelectionService.releaseSeat(seatId, sessionId);
        setSelectionState(prev => ({
          ...prev,
          selectedSeats: prev.selectedSeats.filter(s => s.seat.id !== seatId)
        }));
        toast.success(`Seat ${seat.seatNumber} released`);
      } catch (err) {
        console.error('Failed to release seat:', err);
        toast.error('Failed to release seat');
      }
    } else {
      // Select seat
      if (seat.status !== SeatStatus.Available) {
        toast.error('This seat is not available');
        return;
      }

      try {
        const reservation = await seatSelectionService.reserveSeat({
          seatId,
          sessionId
        });
        
        const selectedSeat: SelectedSeat = {
          seat: { ...seat, status: SeatStatus.Reserved },
          reservedUntil: new Date(reservation.reservedUntil)
        };

        setSelectionState(prev => ({
          ...prev,
          selectedSeats: [...prev.selectedSeats, selectedSeat]
        }));
        
        toast.success(`Seat ${seat.seatNumber} reserved for 10 minutes`);
      } catch (err) {
        console.error('Failed to reserve seat:', err);
        toast.error('Failed to reserve seat');
      }
    }
  }, [layout, selectionState.selectedSeats, sessionId]);

  // Handle table selection
  const handleTableSelect = useCallback(async (tableId: number, seatIds: number[], fullTable: boolean = false) => {
    if (!layout) return;

    const table = layout.tables.find(t => t.id === tableId);
    if (!table) return;

    try {
      const reservation = await seatSelectionService.reserveTable({
        tableId,
        sessionId,
        fullTable,
        seatIds
      });

      const selectedSeats = table.seats.filter(seat => seatIds.includes(seat.id));
      
      const selectedTable: SelectedTable = {
        table,
        selectedSeats,
        isFullTable: fullTable,
        reservedUntil: new Date(reservation.reservedUntil)
      };

      setSelectionState(prev => ({
        ...prev,
        selectedTables: [...prev.selectedTables, selectedTable]
      }));

      const message = fullTable 
        ? `Table ${table.tableNumber} fully reserved`
        : `${selectedSeats.length} seats reserved at Table ${table.tableNumber}`;
      
      toast.success(message);
    } catch (err) {
      console.error('Failed to reserve table:', err);
      toast.error('Failed to reserve table');
    }
  }, [layout, sessionId]);

  // Handle general admission ticket selection
  const handleGeneralTicketChange = useCallback((ticketSelections: GeneralTicketSelection[]) => {
    setSelectionState(prev => ({
      ...prev,
      generalTickets: ticketSelections
    }));
  }, []);

  // Handle reservation expiry
  const handleReservationExpiry = useCallback((seatId: number) => {
    setSelectionState(prev => ({
      ...prev,
      selectedSeats: prev.selectedSeats.filter(s => s.seat.id !== seatId)
    }));
    toast.error('Seat reservation expired');
  }, []);

  // Handle proceed to checkout
  const handleProceedToCheckout = useCallback(() => {
    if (selectionState.totalPrice === 0) {
      toast.error('Please select at least one ticket or seat');
      return;
    }
    onSelectionComplete(selectionState);
  }, [selectionState, onSelectionComplete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !layout) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          {error || 'Failed to load seat layout'}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={cn("seat-selection-container", className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Your Seats
        </h2>
        
        {selectionState.selectedSeats.length > 0 && (
          <ReservationTimer
            reservedSeats={selectionState.selectedSeats}
            onExpiry={handleReservationExpiry}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {layout.mode === SeatSelectionMode.EventHall && (
              <motion.div
                key="event-hall"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EventHallLayout
                  layout={layout}
                  selectedSeats={selectionState.selectedSeats}
                  onSeatSelect={handleSeatSelect}
                />
              </motion.div>
            )}

            {layout.mode === SeatSelectionMode.TableSeating && (
              <motion.div
                key="table-seating"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TableSeatingLayout
                  layout={layout}
                  selectedTables={selectionState.selectedTables}
                  onTableSelect={handleTableSelect}
                />
              </motion.div>
            )}

            {layout.mode === SeatSelectionMode.GeneralAdmission && (
              <motion.div
                key="general-admission"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GeneralAdmissionTickets
                  eventId={eventId}
                  onTicketChange={handleGeneralTicketChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <SeatSelectionSummary
            selectionState={selectionState}
            onProceedToCheckout={handleProceedToCheckout}
          />
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
