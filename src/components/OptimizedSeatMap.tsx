import React, { useState } from 'react';

interface CustomSeatProps {
  seat: {
    id: number;
    row: string;
    number: number;
    isReserved: boolean;
    tooltip: string;
    sectionColor?: string;
    ticketType?: any;
    ticketTypeColor?: string;
    color?: string; // Combined color based on ticket type or section
  };
  isSelected: boolean;
  onSelect: (seat: any) => void;
}

const CustomSeat: React.FC<CustomSeatProps> = ({ seat, isSelected, onSelect }) => {
  const baseClasses = "w-8 h-8 m-1 rounded flex items-center justify-center text-xs font-medium transition-colors cursor-pointer relative";
  
  let finalClasses = baseClasses;
  let style: React.CSSProperties = {};
  
  if (seat.isReserved) {
    finalClasses += " bg-gray-400 cursor-not-allowed";
  } else if (isSelected) {
    finalClasses += " bg-blue-500 text-white";
  } else {
    // Use the seat color (which is set based on ticket type or section)
    if (seat.color) {
      style.backgroundColor = seat.color;
      style.opacity = 0.8;
      // Make text white for darker colors, black for lighter colors
      const colorValue = seat.color.replace('#', '');
      const r = parseInt(colorValue.substr(0, 2), 16);
      const g = parseInt(colorValue.substr(2, 2), 16);
      const b = parseInt(colorValue.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
      if (brightness < 128) {
        finalClasses += " text-white hover:opacity-100";
      } else {
        finalClasses += " text-gray-800 hover:opacity-100";
      }
    } else {
      finalClasses += " bg-white border-2 border-gray-400 hover:border-blue-500";
    }
  }
  
  return (
    <div
      className={finalClasses}
      style={style}
      onClick={() => !seat.isReserved && onSelect(seat)}
      title={seat.tooltip}
    >
      {seat.number}
    </div>
  );
};

// Interface for the main component
interface OptimizedSeatMapProps {
  rows: any[][];
  maxSeats: number;
  onSeatSelected: (seats: any[]) => void;
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
                  isSelected={selectedSeatIds.includes(seat.id)}
                  onSelect={() => handleSeatSelect(seat)}
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
