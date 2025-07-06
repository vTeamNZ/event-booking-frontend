import React, { useState } from 'react';
import CustomSeat from './CustomSeat';

interface OptimizedSeatMapProps {
  rows: any[][];
  onSeatSelected: (selectedSeats: any[]) => void;
  maxSeats?: number;
}

const OptimizedSeatMap: React.FC<OptimizedSeatMapProps> = ({ 
  rows = [], 
  onSeatSelected = () => {},
  maxSeats = 10
}) => {
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  
  const handleSeatSelect = (seat: any) => {
    if (selectedSeatIds.includes(seat.id)) {
      // Unselect the seat
      setSelectedSeatIds(prev => prev.filter(id => id !== seat.id));
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      // Check if we've reached max seats
      if (selectedSeatIds.length >= maxSeats) {
        return;
      }
      
      // Select the seat
      setSelectedSeatIds(prev => [...prev, seat.id]);
      setSelectedSeats(prev => [...prev, seat]);
    }
  };
  
  // Effect to notify parent about seat selection changes
  React.useEffect(() => {
    onSeatSelected(selectedSeats);
  }, [selectedSeats, onSeatSelected]);
  
  return (
    <div className="optimized-seat-map">
      {rows.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex items-center mb-2">
          {/* Row label */}
          <div className="w-6 mr-2 text-center font-semibold">
            {String.fromCharCode(65 + rowIndex)}
          </div>
          
          {/* Seats in this row */}
          <div className="flex">
            {row.map((seat, seatIndex) => (
              <div key={`seat-${rowIndex}-${seatIndex}`}>
                <CustomSeat 
                  seat={seat}
                  selectedSeats={selectedSeatIds}
                  selectSeat={() => handleSeatSelect(seat)}
                  unselectSeat={() => handleSeatSelect(seat)}
                />
              </div>
            ))}
          </div>
          
          {/* Row label (right side) */}
          <div className="w-6 ml-2 text-center font-semibold">
            {String.fromCharCode(65 + rowIndex)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OptimizedSeatMap;
