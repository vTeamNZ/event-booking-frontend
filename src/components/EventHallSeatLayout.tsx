import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { reservationService, ReservationStatus } from '../services/reservationService';
import AisleRenderer from './venue/AisleRenderer';
import toast from 'react-hot-toast';

interface SeatLayoutProps {
  eventId: number;
  onSeatSelect: (seatId: number, selected: boolean) => void;
  selectedSeats: number[];
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
  ticketTypeId?: number;
  ticketType?: {
    id: number;
    name: string;
    color: string;
    price: number;
  };
}

interface TicketType {
  id: number;
  name: string;
  price: number;
  description: string;
  color: string;
  seatRowAssignments?: string;
}

interface EventHallLayout {
  seats: Seat[];
  ticketTypes: TicketType[];
  stagePosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  // Aisle configuration
  hasHorizontalAisles?: boolean;
  horizontalAisleRows?: string;
  hasVerticalAisles?: boolean;
  verticalAisleSeats?: string;
  aisleWidth?: number;
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
  const [ticketTypeRowMap, setTicketTypeRowMap] = useState<Record<string, { color: string, name: string, price: number }>>({});
  
  useEffect(() => {
    const loadLayout = async () => {
      console.log('=== EVENT HALL SEAT LAYOUT - LOADING DATA ===');
      console.log('Loading layout for event:', eventId);
      
      try {
        setLoading(true);
        console.log('Making API requests...');
        
        // Get layout data first - this is essential
        const layoutResponse = await api.get<EventHallLayout>(`/seats/event/${eventId}/layout`);
        console.log('Layout response:', layoutResponse.data);
        
        const layoutData = layoutResponse.data;
        
        if (!layoutData || !Array.isArray(layoutData.seats)) {
          console.error('Invalid layout data structure:', layoutData);
          throw new Error('Invalid layout data received');
        }
        
        console.log('Processed layout data:', {
          seatsCount: layoutData.seats.length,
          ticketTypesCount: layoutData.ticketTypes?.length || 0,
          sampleSeat: layoutData.seats[0]
        });
        
        setLayout(layoutData);
        
        // Try to get reservation status, but don't fail if it's not available
        try {
          console.log('Attempting to fetch reservation status...');
          const statusResponse = await reservationService.getReservationStatus(eventId);
          console.log('Status response:', statusResponse);
          setReservationStatus(statusResponse);
        } catch (statusError: any) {
          console.warn('Failed to load reservation status, continuing without it:', statusError.message);
          setReservationStatus([]); // Set empty array as fallback
        }
      } catch (err: any) {
        console.error('Error loading seat layout:', err);
        setError(err.message || 'Failed to load seat layout');
        toast.error(err.message || 'Failed to load seat layout');
      } finally {
        setLoading(false);
      }
    };

    loadLayout();
  }, [eventId]);

  // Prepare ticket type mapping when layout data is loaded
  useEffect(() => {
    if (layout?.ticketTypes) {
      const rowToTicketType: Record<string, { color: string, name: string, price: number }> = {};
      
      console.log('Processing ticket types for coloring:', layout.ticketTypes);
      
      layout.ticketTypes.forEach(ticketType => {
        // Make sure the ticketType has required properties
        if (!ticketType.name || !ticketType.color) {
          console.warn('Ticket type missing required properties:', ticketType);
          return; // Skip this ticket type
        }

        // Set default color if not provided
        const ticketColor = ticketType.color || '#' + Math.floor(Math.random()*16777215).toString(16);
        
        if (ticketType.seatRowAssignments && typeof ticketType.seatRowAssignments === 'string') {
          try {
            // First try to parse as JSON
            let assignments: Array<{ rowStart: string, rowEnd: string }> = [];
            
            try {
              assignments = JSON.parse(ticketType.seatRowAssignments);
              console.log('Successfully parsed JSON assignments:', assignments);
            } catch (jsonError) {
              // If JSON parse fails, try to parse as a simple range string like "A-D"
              console.log('JSON parse failed, trying as range string:', ticketType.seatRowAssignments);
              const rangeMatch = ticketType.seatRowAssignments.match(/^([A-Z])-([A-Z])$/);
              if (rangeMatch) {
                const [, rowStart, rowEnd] = rangeMatch;
                assignments = [{ rowStart, rowEnd }];
                console.log('Parsed as range:', assignments);
              } else {
                throw new Error(`Invalid format: ${ticketType.seatRowAssignments}`);
              }
            }
            
            // Process each assignment
            assignments.forEach((assignment: { rowStart: string, rowEnd: string }) => {
              if (!assignment.rowStart || !assignment.rowEnd || 
                  typeof assignment.rowStart !== 'string' || 
                  typeof assignment.rowEnd !== 'string') {
                console.warn('Invalid assignment format:', assignment);
                return; // Skip this assignment
              }
              
              const startChar = assignment.rowStart.toUpperCase().charCodeAt(0);
              const endChar = assignment.rowEnd.toUpperCase().charCodeAt(0);
              
              console.log(`Processing row range ${assignment.rowStart}-${assignment.rowEnd} (${startChar}-${endChar})`);
              
              for (let i = startChar; i <= endChar; i++) {
                const row = String.fromCharCode(i);
                rowToTicketType[row] = { 
                  color: ticketColor, 
                  name: ticketType.name,
                  price: ticketType.price || 0
                };
                console.log(`Assigned row ${row} to ticket type ${ticketType.name} (${ticketColor})`);
              }
            });
          } catch (err) {
            console.error(`Error parsing seat row assignments for ticket type ${ticketType.name}:`, err);
          }
        } else {
          console.log(`Ticket type ${ticketType.name} has no seat row assignments`);
        }
      });
      
      setTicketTypeRowMap(rowToTicketType);
    }
  }, [layout]);
  
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
        // Visual feedback through seat color change is sufficient
      } else {
        // Release the seat
        await reservationService.releaseSeats([{
          eventId,
          row: seat.row,
          number: seat.number
        }]);
        // Visual feedback through seat color change is sufficient
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
    
    // For available seats, check if we have a ticket type color for this row
    if (status === 'Available') {
      // Use the ticket type color if available
      const ticketTypeInfo = ticketTypeRowMap[seat.row];
      if (ticketTypeInfo) {
        // Log that we're applying ticket type colors
        console.log(`Applying ticket type color for seat ${seat.row}-${seat.number}:`, ticketTypeInfo);
        
        // Use inline styles instead of Tailwind classes for custom colors
        const customColor = ticketTypeInfo.color;
        
        // Add ticket type info to the seat's data-* attributes for debugging
        const dataAttrs = `data-ticket-type="${ticketTypeInfo.name}" data-price="${ticketTypeInfo.price || 0}"`;
        
        if (isSelected) {
          return `${baseClasses} bg-green-500 border-green-700 text-white ${dataAttrs}`;
        } else {
          // Use style attribute for custom colors
          return `${baseClasses} border-2 text-gray-800 hover:opacity-80 ${dataAttrs} style="border-color: ${customColor}; background-color: ${customColor}80;"`;
        }
      }
    }
    
    // Default coloring based on status
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
      <div className="mb-6 space-y-4">
        {/* Ticket Types */}
        {layout.ticketTypes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Ticket Types</h4>
            <div className="flex flex-wrap gap-4">
              {layout.ticketTypes.map(ticketType => (
                <div key={ticketType.id} className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-2" 
                    style={{ 
                      backgroundColor: ticketType.color + '33',
                      borderColor: ticketType.color,
                      borderWidth: '2px',
                      borderStyle: 'solid'
                    }}
                  ></div>
                  <span>{ticketType.name} - ${ticketType.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Seat Status */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Seat Status</h4>
          <div className="flex flex-wrap gap-4 text-sm">
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
        </div>
      </div>

      {/* Seat Map */}
      <div 
        className="relative border border-gray-300 rounded-lg bg-gray-50 mx-auto overflow-hidden"
        style={{ 
          width: Math.max(600, maxX + 50), 
          height: Math.max(400, maxY + 50),
          minHeight: '400px'
        }}
      >
        {/* Aisles Overlay */}
        <AisleRenderer
          layoutData={layout}
          containerWidth={Math.max(600, maxX + 50)}
          containerHeight={Math.max(400, maxY + 50)}
          rowSpacing={40}
          seatSpacing={30}
        />
        
        {/* Stage */}
        {layout.stagePosition && (
          <div
            className="absolute bg-gray-800 text-white flex items-center justify-center font-bold rounded z-20"
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
        {layout.seats.map((seat) => {
          const isSelected = selectedSeats.includes(seat.id);
          const status = getSeatStatus(seat);
          const ticketTypeInfo = status === 'Available' ? ticketTypeRowMap[seat.row] : null;
          
          // Define style with position and potentially ticket type colors
          const seatStyle: React.CSSProperties = {
            left: seat.x,
            top: seat.y,
            width: seat.width,
            height: seat.height,
            zIndex: 30
          };
          
          // Add ticket type colors directly to the style if available
          if (status === 'Available' && ticketTypeInfo && !isSelected) {
            seatStyle.backgroundColor = ticketTypeInfo.color + '33'; // Very light (20% opacity)
            seatStyle.borderColor = ticketTypeInfo.color;
          }
          
          return (
            <div
              key={seat.id}
              className={getSeatClassName(seat)}
              style={seatStyle}
              onClick={() => handleSeatClick(seat)}
              title={`${seat.seatNumber} - ${ticketTypeInfo?.name || seat.ticketType?.name || 'General'} - $${seat.price}`}
            >
              {seat.seatNumber}
            </div>
          );
        })}
      </div>

      {/* Ticket Types Info */}
      {layout.ticketTypes.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Ticket Types & Pricing</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {layout.ticketTypes.map((type) => (
              <div key={type.id} className="p-3 border rounded-lg">
                <div className="flex items-center mb-1">
                  <div 
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: type.color }}
                  ></div>
                  <span className="font-medium">{type.name}</span>
                </div>
                <p className="text-sm text-gray-600">${type.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
