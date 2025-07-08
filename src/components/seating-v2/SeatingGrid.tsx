// Seating Grid Component - Displays the main seat layout
import React, { useState, useMemo } from 'react';
import { SeatingGridProps, SeatingLayoutSeat } from '../../types/seating-v2';
import { 
  groupSeatsByRow, 
  sortRows, 
  sortSeatsInRow
} from '../../utils/seating-v2/seatingUtils';
import { SeatStatus } from '../../types/seatStatus';
import SeatVisual from './SeatVisual';

const SeatingGrid: React.FC<SeatingGridProps> = ({
  seats,
  selectedSeats,
  onSeatClick,
  className = ''
}) => {
  const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);

  // Group and sort seats by row
  const seatsByRow = useMemo(() => {
    const grouped = groupSeatsByRow(seats);
    const sortedRowKeys = sortRows(Object.keys(grouped));
    
    return sortedRowKeys.map(rowKey => ({
      row: rowKey,
      seats: sortSeatsInRow(grouped[rowKey])
    }));
  }, [seats]);

  const isSelected = (seatId: number) => selectedSeats.includes(seatId);

  return (
    <div className={`grid gap-1 ${className}`}>
      {seatsByRow.map(row => (
        <div key={row.row} className="flex gap-1 justify-center">
          <div className="w-8 text-right text-gray-500 pr-2">{row.row}</div>
          <div className="flex gap-1">
            {row.seats.map(seat => (
              <SeatVisual
                key={seat.id}
                seat={seat}
                isSelected={isSelected(seat.id)}
                isHovered={hoveredSeat === seat.id}
                onClick={() => onSeatClick(seat)}
                onMouseEnter={() => setHoveredSeat(seat.id)}
                onMouseLeave={() => setHoveredSeat(null)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SeatingGrid;
