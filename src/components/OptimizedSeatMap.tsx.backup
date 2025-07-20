import React, { useState } from 'react';
import { DisplaySeat } from '../types/seats';

interface CustomSeatProps {
  seat: DisplaySeat;
  isSelected: boolean;
  onSelect: (seat: DisplaySeat) => void;
}

interface OptimizedSeatMapProps {
  rows: {
    seats: DisplaySeat[];
  }[];
  selectedSeatIds: number[];
  onSeatSelect: (seat: DisplaySeat) => void;
}

const CustomSeat: React.FC<CustomSeatProps> = ({ seat, isSelected, onSelect }) => {
  const baseClasses = "w-6 h-6 m-1 rounded flex items-center justify-center text-xs font-medium transition-colors cursor-pointer relative";
  
  // Debug logging for seat colors and tooltip info
  console.log(`Rendering seat ${seat.row}-${seat.number}:`, {
    color: seat.color,
    ticketTypeColor: seat.ticketTypeColor,
    sectionColor: seat.sectionColor,
    isReserved: seat.isReserved,
    isSelected,
    tooltip: seat.tooltip
  });
  
  let style: React.CSSProperties = {};
  
  if (seat.isReserved) {
    style.backgroundColor = '#9CA3AF'; // gray-400
    style.cursor = 'not-allowed';
  } else if (isSelected) {
    // Keep the seat's color but add a border and increase opacity for selection
    if (seat.color) {
      style.backgroundColor = seat.color;
      style.opacity = 1;
      style.border = '2px solid #3B82F6'; // blue-500
      style.boxShadow = '0 0 0 2px #93C5FD'; // blue-300
    } else {
      style.backgroundColor = '#3B82F6'; // blue-500
      style.color = 'white';
    }
  } else {
    // Use the seat color (which is set based on ticket type or section)
    if (seat.color) {
      style.backgroundColor = seat.color;
      style.opacity = 0.8;
      style.cursor = 'pointer';
    }
  }
  
  return (
    <div 
      className={baseClasses}
      style={style}
      onClick={() => !seat.isReserved && onSelect(seat)}
      title={seat.tooltip}
    >
      {seat.number}
    </div>
  );
};

const OptimizedSeatMap: React.FC<OptimizedSeatMapProps> = ({ rows, selectedSeatIds, onSeatSelect }) => {
  return (
    <div className="flex flex-col items-center gap-2 overflow-auto max-h-[calc(100vh-200px)]">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex py-0.5">
          {row.seats.map((seat) => (
            <CustomSeat
              key={seat.id}
              seat={seat}
              isSelected={selectedSeatIds.includes(seat.id)}
              onSelect={onSeatSelect}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default OptimizedSeatMap;
