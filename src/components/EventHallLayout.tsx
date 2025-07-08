import React from 'react';
import { motion } from 'framer-motion';
import { 
  SeatLayoutResponse, 
  SelectedSeat,
  Seat 
} from '../types/seatSelection';
import { SeatStatus, getSeatStatusClasses } from '../types/seatStatus';
import { cn, formatPrice } from '../utils/seatSelection';

interface EventHallLayoutProps {
  layout: SeatLayoutResponse;
  selectedSeats: SelectedSeat[];
  onSeatSelect: (seatId: number) => void;
}

const EventHallLayout: React.FC<EventHallLayoutProps> = ({
  layout,
  selectedSeats,
  onSeatSelect
}) => {
  const getSeatStatusClass = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.seat.id === seat.id);
    
    if (isSelected) {
      return 'bg-blue-600 text-white border-blue-700 shadow-lg scale-110';
    }
    
    return getSeatStatusClasses(seat.status as SeatStatus);
  };

  const isClickable = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.seat.id === seat.id);
    return isSelected || seat.status === SeatStatus.Available;
  };

  const getSectionColor = (sectionId?: number) => {
    if (!sectionId) return '#3B82F6';
    const section = layout.sections.find(s => s.id === sectionId);
    return section?.color || '#3B82F6';
  };    // Debug log for layout data
  console.log("EventHallLayout rendering with:", {
    venueInfo: layout.venue,
    sectionsCount: layout.sections?.length || 0,
    seatsCount: layout.seats?.length || 0,
    stageInfo: layout.stage,
    selectedSeatsCount: selectedSeats?.length || 0,
    isMockData: layout.seats && layout.seats.length > 0 && layout.seats[0].seatNumber === "A1" // Check if this is mock data
  });
  
  // Check if we have seats to display
  if (!layout.seats || layout.seats.length === 0) {
    console.error("No seats available in the layout data!");
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4 text-lg">
            No seat layout data available for this event.
          </div>
          <p className="text-gray-600 mb-4">
            There might be an issue with the seat configuration for this event.
          </p>
          
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
            <h4 className="font-bold mb-2">Debug Information:</h4>
            <pre className="text-xs overflow-auto max-h-60">
              {JSON.stringify({
                layoutMode: layout.mode,
                eventId: layout.eventId,
                venueName: layout?.venue?.name,
                sections: layout?.sections?.length || 0,
                mockDataDetected: layout.seats && layout.seats.length > 0 && layout.seats[0].seatNumber === "A1",
                apiURL: "/api/seats/event/" + layout.eventId + "/layout"
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {layout.venue?.name || 'Event Hall'} Layout
        </h3>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 border border-blue-700 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Stage */}
      {layout.stage && (
        <div className="mb-8 flex justify-center">
          <div 
            className="bg-gray-800 text-white text-center py-4 px-8 rounded-lg shadow-lg"
            style={{
              width: `${Math.max(layout.stage.width, 200)}px`,
              height: `${Math.max(layout.stage.height, 60)}px`,
            }}
          >
            <div className="text-lg font-semibold">STAGE</div>
          </div>
        </div>
      )}

      {/* Sections Legend */}
      {layout.sections.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Sections</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {layout.sections.map(section => (
              <div 
                key={section.id}
                className="flex items-center gap-2 p-2 rounded-lg border"
                style={{ borderColor: section.color }}
              >
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: section.color }}
                ></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{section.name}</div>
                  <div className="text-xs text-gray-600">{formatPrice(section.basePrice)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seat Map */}
      <div className="relative overflow-auto">
        <div 
          className="relative bg-gray-50 rounded-lg p-4 min-h-96"
          style={{
            width: Math.max(layout.venue?.width || 800, 600),
            height: Math.max(layout.venue?.height || 600, 400)
          }}
        >
          {layout.seats.map(seat => (
            <motion.button
              key={seat.id}
              className={cn(
                'absolute border-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center',
                getSeatStatusClass(seat)
              )}
              style={{
                left: `${seat.x}px`,
                top: `${seat.y}px`,
                width: `${seat.width}px`,
                height: `${seat.height}px`,
                borderColor: getSectionColor(seat.sectionId)
              }}
              onClick={() => isClickable(seat) && onSeatSelect(seat.id)}
              disabled={!isClickable(seat)}
              whileHover={isClickable(seat) ? { scale: 1.1 } : {}}
              whileTap={isClickable(seat) ? { scale: 0.95 } : {}}
              title={`Seat ${seat.seatNumber} - ${formatPrice(seat.price)}`}
            >
              <span className="select-none">{seat.seatNumber}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mobile-friendly seat grid for small screens */}
      <div className="md:hidden mt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-3">Seats (Mobile View)</h4>
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
          {layout.seats
            .sort((a, b) => a.row.localeCompare(b.row) || a.number - b.number)
            .map(seat => (
              <motion.button
                key={seat.id}
                className={cn(
                  'aspect-square border-2 rounded text-xs font-medium transition-all duration-200 flex items-center justify-center',
                  getSeatStatusClass(seat)
                )}
                onClick={() => isClickable(seat) && onSeatSelect(seat.id)}
                disabled={!isClickable(seat)}
                whileHover={isClickable(seat) ? { scale: 1.1 } : {}}
                whileTap={isClickable(seat) ? { scale: 0.95 } : {}}
                title={`Seat ${seat.seatNumber} - ${formatPrice(seat.price)}`}
              >
                <span className="select-none">{seat.seatNumber}</span>
              </motion.button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default EventHallLayout;
