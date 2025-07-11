// Seating Grid Component - Displays the main seat layout
import React, { useMemo } from 'react';
import { SeatingGridProps, SeatingLayoutSeat, SeatingSelectedSeat } from '../../types/seating-v2';
import { 
  groupSeatsByRow, 
  sortRows, 
  sortSeatsInRow,
  canSelectSeat,
  parseHorizontalAisleRows,
  parseVerticalAisleSeats
} from '../../utils/seating-v2/seatingUtils';
import SeatVisual from './SeatVisual';

const SeatingGrid: React.FC<SeatingGridProps> = ({
  layout,
  seats,
  selectedSeats,
  onSeatSelect,
  onSeatClick,
  className = '',
  isAdmin = false,
  onAdminToggle
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

  // Process horizontal aisle information
  const horizontalAisleRowsArray = useMemo(() => {
    if (!layout?.hasHorizontalAisles || !layout?.horizontalAisleRows) {
      return [];
    }
    return parseHorizontalAisleRows(layout.horizontalAisleRows);
  }, [layout?.hasHorizontalAisles, layout?.horizontalAisleRows]);

  // Process vertical aisle information
  const verticalAisleSeats = useMemo(() => {
    if (!layout?.hasVerticalAisles || !layout?.verticalAisleSeats) return new Set<number>();
    const parsedSeats = parseVerticalAisleSeats(layout.verticalAisleSeats);
    return new Set<number>(parsedSeats);
  }, [layout?.hasVerticalAisles, layout?.verticalAisleSeats]);

  const aisleWidth = layout?.aisleWidth || 2;

  const isSelected = (seat: SeatingLayoutSeat) =>
    selectedSeats.some(s => s.row === seat.row && s.number === seat.number);

  const getSelectedSeat = (seat: SeatingLayoutSeat): SeatingSelectedSeat | undefined =>
    selectedSeats.find(s => s.row === seat.row && s.number === seat.number);

  // Helper function to convert row label to number
  const getRowNumber = (rowLabel: string): number => {
    // If it's a letter, convert to number (A=1, B=2, etc)
    if (isNaN(parseInt(rowLabel))) {
      return rowLabel.toUpperCase().charCodeAt(0) - 64; // A=1, B=2, etc
    }
    // If it's already a number, parse it
    return parseInt(rowLabel);
  };

  // Helper function to determine if an aisle should be shown above a row
  const shouldShowAisleAboveRow = (rowLabel: string) => {
    if (!layout?.hasHorizontalAisles || horizontalAisleRowsArray.length === 0) {
      return false;
    }
    
    const rowNum = getRowNumber(rowLabel);
    return horizontalAisleRowsArray.includes(rowNum);
  };

  return (
    <div className={`seating-grid ${className}`}>
      {/* Render stage at the top */}
      <div className="mb-8 flex justify-center">
        <div className="bg-gray-600 text-white py-2 px-8 rounded-lg w-3/4 text-center">
          STAGE
        </div>
      </div>

      {/* Render seating grid with aisles */}
      {seatsByRow.map((row) => {
        const shouldShowAisle = shouldShowAisleAboveRow(row.row);
        
        return (
          <React.Fragment key={row.row}>
            {/* Render horizontal aisle if needed */}
            {shouldShowAisle && (
              <div 
                className="w-full bg-gray-200 my-4 rounded flex items-center justify-center relative" 
                style={{ 
                  height: `${Math.max(aisleWidth * 6, 24)}px`,
                  marginBottom: '16px'
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white px-4 py-1 rounded text-gray-500 text-sm shadow-sm">
                    Aisle
                  </div>
                </div>
              </div>
            )}

            {/* Render row of seats */}
            <div className="flex items-center gap-2">
              <div className="w-8 text-right text-gray-500">{row.row}</div>
              <div className="flex gap-1">
                {row.seats.map((seat) => {
                  const isVerticalAisle = verticalAisleSeats.has(seat.number);
                  
                  return (
                    <React.Fragment key={`${seat.row}-${seat.number}`}>
                      {isVerticalAisle && (
                        <div 
                          className="h-full bg-gray-200 mx-2" 
                          style={{ width: `${aisleWidth * 4}px` }}
                        ></div>
                      )}
                      <SeatVisual
                        seat={seat}
                        isSelected={isSelected(seat)}
                        selectedSeat={getSelectedSeat(seat)}
                        canSelect={canSelectSeat(seat, selectedSeats)}
                        onClick={() => onSeatClick?.(seat) || onSeatSelect?.(seat)}
                        isAdmin={isAdmin}
                        onAdminToggle={onAdminToggle}
                      />
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default SeatingGrid;
