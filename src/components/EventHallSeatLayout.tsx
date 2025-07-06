import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { reservationService, ReservationStatus } from '../services/reservationService';
import toast from 'react-hot-toast';

interface SeatLayoutProps {
  eventId: number;
  onSeatSelect: (seatId: number, selected: boolean) => void;
  selectedSeats: number[];
}

interface Section {
  id: number;
  name: string;
  color: string;
  basePrice: number;
}

interface Seat {
  id: number;
  row: string;
  number: number;
  seatNumber: string;
  x: number;
  y: number;
  width: number;
  height: number;
  price: number;
  status: 'Available' | 'Reserved' | 'Booked' | 'Unavailable';
  sectionId?: number;
  section?: Section;
}

interface EventHallLayout {
  seats: Seat[];
  sections: Section[];
  stagePosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const EventHallSeatLayout: React.FC<SeatLayoutProps> = ({
  eventId,
  onSeatSelect,
  selectedSeats
}) => {
  const [layout, setLayout] = useState<EventHallLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservationStatus, setReservationStatus] = useState<ReservationStatus[]>([]);

  useEffect(() => {
    const loadLayout = async () => {
      try {
        setLoading(true);
        const [layoutResponse, statusResponse] = await Promise.all([
          api.get(`/api/seats/event/${eventId}/layout`),
          reservationService.getReservationStatus(eventId)
        ]);
        setLayout(layoutResponse.data as EventHallLayout);
        setReservationStatus(statusResponse);
      } catch (err: any) {
        setError('Failed to load seat layout');
        toast.error('Failed to load seat layout');
      } finally {
        setLoading(false);
      }
    };

    loadLayout();
  }, [eventId]);

  const getSeatStatus = (seat: Seat): 'Available' | 'Reserved' | 'Booked' | 'Held' | 'Unavailable' => {
    const seatKey = `${seat.row}-${seat.number}`;
    const reservation = reservationStatus.find(r => r.seat === seatKey);
    
    if (reservation) {
      if (reservation.isReserved) return 'Booked';
      if (reservation.isHeld) return 'Held';
    }
    
    return seat.status as 'Available' | 'Reserved' | 'Booked' | 'Unavailable';
  };

  const handleSeatClick = async (seat: Seat) => {
    const currentStatus = getSeatStatus(seat);
    if (currentStatus !== 'Available') return;
    
    const isSelected = selectedSeats.includes(seat.id);
    
    try {
      if (!isSelected) {
        // Try to hold the seat
        await reservationService.holdSeats([{
          eventId,
          row: seat.row,
          number: seat.number
        }]);
        toast.success(`Seat ${seat.row}-${seat.number} held for 10 minutes`);
      } else {
        // Release the seat
        await reservationService.releaseSeats([{
          eventId,
          row: seat.row,
          number: seat.number
        }]);
        toast.success(`Seat ${seat.row}-${seat.number} released`);
      }
      
      // Update reservation status
      const newStatus = await reservationService.getReservationStatus(eventId);
      setReservationStatus(newStatus);
      
      onSeatSelect(seat.id, !isSelected);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update seat selection');
    }
  };

  const getSeatClassName = (seat: Seat) => {
    const isSelected = selectedSeats.includes(seat.id);
    const baseClasses = "seat absolute cursor-pointer border-2 rounded text-xs flex items-center justify-center font-bold transition-all duration-200 hover:scale-110";
    
    const status = getSeatStatus(seat);
    
    switch (status) {
      case 'Available':
        return `${baseClasses} ${isSelected 
          ? 'bg-green-500 border-green-700 text-white' 
          : 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'}`;
      case 'Held':
        return `${baseClasses} bg-orange-200 border-orange-400 text-orange-800 ${isSelected ? '' : 'cursor-not-allowed'}`;
      case 'Reserved':
        return `${baseClasses} bg-yellow-200 border-yellow-400 text-yellow-800 cursor-not-allowed`;
      case 'Booked':
        return `${baseClasses} bg-red-200 border-red-400 text-red-800 cursor-not-allowed`;
      case 'Unavailable':
        return `${baseClasses} bg-gray-200 border-gray-400 text-gray-600 cursor-not-allowed`;
      default:
        return baseClasses;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading seat layout...</span>
      </div>
    );
  }

  if (error || !layout) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error || 'Failed to load layout'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const maxX = Math.max(...layout.seats.map(s => s.x + s.width));
  const maxY = Math.max(...layout.seats.map(s => s.y + s.height));

  return (
    <div className="seat-layout">
      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 border-2 border-green-700 rounded mr-2"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded mr-2"></div>
          <span>Reserved</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded mr-2"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 border-2 border-gray-400 rounded mr-2"></div>
          <span>Unavailable</span>
        </div>
      </div>

      {/* Seat Map */}
      <div 
        className="relative border border-gray-300 rounded-lg bg-gray-50 mx-auto"
        style={{ 
          width: Math.max(600, maxX + 50), 
          height: Math.max(400, maxY + 50),
          minHeight: '400px'
        }}
      >
        {/* Stage */}
        {layout.stagePosition && (
          <div
            className="absolute bg-gray-800 text-white flex items-center justify-center font-bold rounded"
            style={{
              left: layout.stagePosition.x,
              top: layout.stagePosition.y,
              width: layout.stagePosition.width,
              height: layout.stagePosition.height
            }}
          >
            STAGE
          </div>
        )}

        {/* Seats */}
        {layout.seats.map((seat) => (
          <div
            key={seat.id}
            className={getSeatClassName(seat)}
            style={{
              left: seat.x,
              top: seat.y,
              width: seat.width,
              height: seat.height
            }}
            onClick={() => handleSeatClick(seat)}
            title={`${seat.seatNumber} - ${seat.section?.name || 'General'} - $${seat.price}`}
          >
            {seat.seatNumber}
          </div>
        ))}
      </div>

      {/* Sections Info */}
      {layout.sections.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Sections & Pricing</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {layout.sections.map((section) => (
              <div key={section.id} className="p-3 border rounded-lg">
                <div className="flex items-center mb-1">
                  <div 
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: section.color }}
                  ></div>
                  <span className="font-medium">{section.name}</span>
                </div>
                <p className="text-sm text-gray-600">From ${section.basePrice}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
