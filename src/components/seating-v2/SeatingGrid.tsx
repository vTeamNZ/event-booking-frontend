// Seating Grid Component - Displays the main seat layout
import React, { useMemo } from 'react';
import { SeatingGridProps, SeatingLayoutSeat, SeatingSelectedSeat } from '../../types/seating-v2';
import { 
  groupSeatsByRow, 
  sortRows, 
  sortSeatsInRow,
  canSelectSeat
} from '../../utils/seating-v2/seatingUtils';
import SeatVisual from './SeatVisual';

const SeatingGrid: React.FC<SeatingGridProps> = ({
  layout,
  seats,
  selectedSeats,
  onSeatSelect,
  onSeatClick,
  className = ''
}) => {
  // Group and sort seats by row
  const seatsByRow = useMemo(() => {
    if (!seats) return [];
    
    const grouped = groupSeatsByRow(seats);
    const sortedRowKeys = sortRows(Object.keys(grouped));
    
    return sortedRowKeys.map(rowKey => ({
      row: rowKey,
      seats: sortSeatsInRow(grouped[rowKey])
    }));
  }, [seats]);
  const isSelected = (seat: SeatingLayoutSeat) =>
    selectedSeats.some(s => s.row === seat.row && s.number === seat.number);

  const getSelectedSeat = (seat: SeatingLayoutSeat): SeatingSelectedSeat | undefined =>
    selectedSeats.find(s => s.row === seat.row && s.number === seat.number);

  return (
    <div className={`seating-grid ${className}`}>
      {seatsByRow.map(row => (
        <div key={row.row} className="flex items-center gap-2">
          <div className="w-8 text-right text-gray-500">{row.row}</div>
          <div className="flex gap-1">
            {row.seats.map(seat => (
              <SeatVisual
                key={`${seat.row}-${seat.number}`}
                seat={seat}
                isSelected={isSelected(seat)}
                selectedSeat={getSelectedSeat(seat)}
                canSelect={canSelectSeat(seat, selectedSeats)}
                onClick={() => onSeatClick?.(seat) || onSeatSelect?.(seat)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SeatingGrid;
