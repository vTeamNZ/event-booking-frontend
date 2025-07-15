import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import OptimizedSeatMap from './OptimizedSeatMap';
import { api } from '../services/api';
import { BaseSeat, DisplaySeat, SelectedSeat } from '../types/seats';
import { SeatSelectionState, SeatSelectionMode, SelectedSeat as SelectedBookingSeat } from '../types/seatSelection';
import { SeatStatus } from '../types/seatStatus';
import SeatSummary from './SeatSummary';

interface LayoutResponse {
  seats: BaseSeat[];
  ticketTypes: any[];
}

interface Props {
  eventId: number;
  onSelectionComplete: (selectionState: SeatSelectionState) => void;
}

const CinemaSeatLayout: React.FC<Props> = ({ eventId, onSelectionComplete }) => {
  const [rows, setRows] = useState<{ seats: DisplaySeat[] }[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);

  useEffect(() => {
    const loadSeats = async () => {
      try {
        setLoading(true);
        const response = await api.get<LayoutResponse>(`/api/seats/event/${eventId}/layout`);
        const layout = response.data;

        // Group seats by row
        const seatsByRow = layout.seats.reduce((acc: { [key: string]: DisplaySeat[] }, seat: BaseSeat) => {
          if (!acc[seat.row]) {
            acc[seat.row] = [];
          }
          
          const seatWithColor: DisplaySeat = {
            id: seat.id,
            row: seat.row,
            number: seat.number,
            isReserved: seat.status !== 'Available',
            tooltip: `${seat.row}${seat.number} - ${seat.ticketType?.type || 'General'} - $${seat.price}`,
            color: seat.ticketType?.color || '#E5E7EB',
            price: seat.price,
            originalSeat: {
              id: seat.id,
              row: seat.row,
              number: seat.number,
              status: seat.status || 'Available',
              ticketType: seat.ticketType,
              price: seat.price
            }
          };
          
          acc[seat.row].push(seatWithColor);
          return acc;
        }, {});

        // Sort rows and convert to array format
        const sortedRows = Object.keys(seatsByRow)
          .sort()
          .map(rowKey => ({
            seats: seatsByRow[rowKey].sort((a: DisplaySeat, b: DisplaySeat) => a.number - b.number)
          }));

        setRows(sortedRows);
        setTicketTypes(layout.ticketTypes || []);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load seats:', err);
        setError(err.message || 'Failed to load seating layout');
        toast.error('Failed to load seating layout');
      } finally {
        setLoading(false);
      }
    };

    loadSeats();
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading seat layout...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ticket Types Legend */}
      {ticketTypes.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Ticket Types</h3>
          <div className="flex flex-wrap gap-4">
            {ticketTypes.map((type) => (
              <div key={type.id} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-2" 
                  style={{ backgroundColor: type.color }}
                />
                <span>{type.name} - ${type.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seat Map */}
      <div className="bg-white p-6 rounded-lg shadow">
        <OptimizedSeatMap
          rows={rows}
          selectedSeatIds={selectedSeats.map(seat => seat.id)}
          onSeatSelect={(newSeat: DisplaySeat) => {
            const isSelected = selectedSeats.some(s => s.id === newSeat.id);
            if (isSelected) {
              setSelectedSeats(prev => prev.filter(s => s.id !== newSeat.id));
            } else {
              setSelectedSeats(prev => [...prev, { ...newSeat, resolvedPrice: newSeat.price }]);
            }
          }}
        />
      </div>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <SeatSummary
          selectedSeats={selectedSeats}
          onConfirm={() => onSelectionComplete({ 
            selectedSeats: selectedSeats.map(seat => ({
              seat: {
                id: seat.originalSeat.id,
                row: seat.originalSeat.row,
                number: seat.originalSeat.number,
                seatNumber: seat.originalSeat.seatNumber || `${seat.originalSeat.row}${seat.originalSeat.number}`,
                x: seat.originalSeat.x || 0,
                y: seat.originalSeat.y || 0,
                width: seat.originalSeat.width || 40,
                height: seat.originalSeat.height || 40,
                price: seat.originalSeat.price || 0,
                status: SeatStatus.Reserved,
                ticketType: {
                  id: seat.originalSeat.ticketType?.id || 0,
                  type: seat.originalSeat.ticketType?.type || 'General',
                  name: seat.originalSeat.ticketType?.name || 'General',
                  color: seat.originalSeat.ticketType?.color || '#888888',
                  price: seat.originalSeat.ticketType?.price || 0,
                  eventId: eventId
                }
              }
            })),
            selectedTables: [],
            generalTickets: [],
            totalPrice: selectedSeats.reduce((total: number, seat) => total + (seat.price || seat.resolvedPrice || 0), 0),
            mode: SeatSelectionMode.EventHall,
            sessionId: `session_${eventId}_${Date.now()}`
          })}
          onClear={() => setSelectedSeats([])}
        />
      )}
    </div>
  );
};

export default CinemaSeatLayout;
