import React from 'react';

export interface Seat {
  id: number;
  row: string;
  number: number;
  isReserved: boolean;
  tooltip: string;
  sectionColor?: string;
  ticketType?: any;
  ticketTypeColor?: string;
  color?: string;
  originalSeat: any;
  section?: any; // Added to support direct section reference
  price?: number;  // Price from initial calculation
  resolvedPrice?: number; // Explicitly stored resolved price
}

interface SeatSummaryProps {
  selectedSeats: Seat[];
  onConfirm?: () => void;
  onClear?: () => void;
}

const SeatSummary: React.FC<SeatSummaryProps> = ({ selectedSeats, onConfirm, onClear }) => {
  if (selectedSeats.length === 0) {
    return null;
  }

  // Group seats by ticket type
  const seatsByTicketType: { [key: string]: Seat[] } = {};
  selectedSeats.forEach(seat => {
    const ticketType = seat.ticketType?.type || 'General';
    if (!seatsByTicketType[ticketType]) {
      seatsByTicketType[ticketType] = [];
    }
    seatsByTicketType[ticketType].push(seat);
  });

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Selected Seats</h3>

      {/* Summary of ticket types */}
      <div className="space-y-4">
        {Object.entries(seatsByTicketType).map(([ticketType, seats]) => {
          const firstSeat = seats[0];
          // Use the resolved price that was already calculated
          let price;
          
          // If we have the resolvedPrice field, use it directly (this should be the case)
          if (typeof firstSeat.resolvedPrice === 'number' && !isNaN(firstSeat.resolvedPrice)) {
            price = firstSeat.resolvedPrice;
          }
          // Fallback to price field if resolvedPrice is missing
          else if (typeof firstSeat.price === 'number' && !isNaN(firstSeat.price)) {
            price = firstSeat.price; 
          }
          // Last resort - recalculate using same price priority
          else {
            const ticketTypePrice = firstSeat.ticketType?.price;
            const seatPrice = firstSeat.originalSeat?.price;
            const section = firstSeat.section || firstSeat.originalSeat?.section;
            const sectionPrice = section?.basePrice;
            
            if (typeof ticketTypePrice === 'number' && !isNaN(ticketTypePrice) && ticketTypePrice > 0) {
              price = ticketTypePrice;
            } else if (typeof seatPrice === 'number' && !isNaN(seatPrice) && seatPrice > 0) {
              price = seatPrice;
            } else if (typeof sectionPrice === 'number' && !isNaN(sectionPrice) && sectionPrice > 0) {
              price = sectionPrice;
            } else {
              // Extract price from tooltip as last resort
              const priceMatch = firstSeat.tooltip?.match(/Price: \$(\d+\.\d+)/);
              const tooltipPrice = priceMatch ? parseFloat(priceMatch[1]) : 0;
              price = tooltipPrice > 0 ? tooltipPrice : 0;
            }
          }
          
          const ticketColor = firstSeat.ticketTypeColor || firstSeat.sectionColor || '#3B82F6';
          
          return (
            <div key={ticketType} className="border-b border-gray-200 pb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: ticketColor }}
                  />
                  <span className="font-medium text-gray-900">{ticketType}</span>
                </div>
                <span className="font-medium">${price.toFixed(2)} each</span>
              </div>
              
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {seats.map(seat => (
                  <div 
                    key={seat.id}
                    className="px-2 py-1 bg-gray-100 text-xs rounded text-center"
                    title={seat.tooltip}
                  >
                    {seat.row}-{seat.number}
                  </div>
                ))}
              </div>
              
              <div className="mt-2 text-right text-sm">
                Subtotal: ${(seats.length * price).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total amount */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
        <span className="font-bold text-lg">Total Amount:</span>
        <span className="font-bold text-lg text-green-600">
          ${selectedSeats.reduce((total, seat) => total + (seat.price || seat.resolvedPrice || 0), 0).toFixed(2)}
        </span>
      </div>
      
      {/* Count of seats */}
      <div className="text-sm text-gray-600 mt-2">
        Total seats selected: {selectedSeats.length}
      </div>
    </div>
  );
};

export default SeatSummary;
