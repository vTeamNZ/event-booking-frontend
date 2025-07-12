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

  // Calculate the maximum number of seats in any row to size the stage appropriately
  const maxSeatsInRow = useMemo(() => {
    if (!seatsByRow.length) return 0;
    return Math.max(...seatsByRow.map(row => row.seats.length));
  }, [seatsByRow]);

  // Calculate actual seating area width for proper alignment
  const getSeatingAreaWidth = () => {
    if (maxSeatsInRow === 0) return 300; // fallback minimum width
    
    // Base calculation: seat width (28px including wrapper) + gaps (6px) + vertical aisles
    const seatWidth = 28; // 24px seat + 4px wrapper padding
    const gapWidth = 6; // gap-1.5 (converted to px)
    const verticalAisleWidth = (layout?.aisleWidth || 2) * 3;
    
    // Count vertical aisles more accurately by checking all seat numbers in the widest row
    let verticalAisleCount = 0;
    if (seatsByRow.length > 0) {
      // Find the row with maximum seats to ensure we account for all possible aisles
      const widestRow = seatsByRow.find(row => row.seats.length === maxSeatsInRow);
      if (widestRow) {
        for (const seat of widestRow.seats) {
          if (verticalAisleSeats.has(seat.number)) {
            verticalAisleCount++;
          }
        }
      }
    }
    
    const totalWidth = (maxSeatsInRow * seatWidth) + 
                      ((maxSeatsInRow - 1) * gapWidth) + 
                      (verticalAisleCount * verticalAisleWidth);
    
    return totalWidth;
  };

  // Calculate stage width based on seating layout (85% of seating area for proportion)
  const getStageWidth = () => {
    const seatingWidth = getSeatingAreaWidth();
    return Math.min(seatingWidth * 0.85, window.innerWidth * 0.8);
  };

  return (
    <div className={`seating-grid overflow-auto max-h-[calc(100vh-200px)] w-full ${className}`}>
      {/* Stage at the top - centered relative to seating area */}
      <div className="mb-8 flex items-center gap-3 min-h-[32px]">
        {/* Empty space to align with row labels */}
        <div className="w-12 min-w-[3rem] max-w-[3rem] shrink-0"></div>
        
        {/* Stage container aligned with seats */}
        <div className="flex justify-center flex-1">
          <div className="flex justify-center" style={{ width: `${getSeatingAreaWidth()}px` }}>
            <div 
              className="bg-gray-600 text-white py-3 px-8 rounded-lg text-center font-medium"
              style={{ width: `${getStageWidth()}px` }}
            >
              STAGE
            </div>
          </div>
        </div>
      </div>
      
      {/* Main seating container */}
      <div className="flex justify-center w-full">
        {/* Render seating grid with aisles */}
        <div className="flex flex-col space-y-1 w-full">
      {seatsByRow.map((row) => {
        const shouldShowAisle = shouldShowAisleAboveRow(row.row);
        
        return (
          <React.Fragment key={row.row}>
            {/* Render horizontal aisle if needed */}
            {shouldShowAisle && (
              <div className="flex items-center gap-3 min-h-[32px]">
                {/* Empty space to align with row labels */}
                <div className="w-12 min-w-[3rem] max-w-[3rem] shrink-0"></div>
                
                {/* Aisle container aligned with seats and stage */}
                <div className="flex justify-center flex-1">
                  <div className="flex justify-center" style={{ width: `${getSeatingAreaWidth()}px` }}>
                    <div 
                      className="bg-gray-200 rounded flex items-center justify-center relative" 
                      style={{ 
                        width: `${getStageWidth()}px`,
                        height: `${Math.max(aisleWidth * 4, 16)}px`,
                        marginBottom: '8px'
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white px-4 py-1 rounded text-gray-500 text-sm shadow-sm">
                          Aisle
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Render row of seats */}
            <div className="flex items-center gap-3 min-h-[32px]">
              {/* Fixed width row label container */}
              <div className="w-12 min-w-[3rem] max-w-[3rem] flex justify-end items-center text-gray-500 text-sm font-medium shrink-0">
                <span className="truncate">{row.row}</span>
              </div>
              
              {/* Seats container with consistent alignment */}
              <div className="flex justify-center flex-1">
                <div 
                  className="flex items-center gap-1.5" 
                  style={{ width: `${getSeatingAreaWidth()}px` }}
                >
                  {row.seats.map((seat) => {
                    const isVerticalAisle = verticalAisleSeats.has(seat.number);
                    
                    return (
                      <React.Fragment key={`${seat.row}-${seat.number}`}>
                        {isVerticalAisle && (
                          <div 
                            className="bg-gray-200 border rounded" 
                            style={{ 
                              width: `${Math.max(aisleWidth * 4, 16)}px`,
                              height: '25px',
                              minHeight: '25px',
                              margin: '0 2px'
                            }}
                          >
                          </div>
                        )}
                        <div className="flex items-center justify-center">
                          <SeatVisual
                            seat={seat}
                            isSelected={isSelected(seat)}
                            selectedSeat={getSelectedSeat(seat)}
                            canSelect={canSelectSeat(seat, selectedSeats)}
                            onClick={() => onSeatClick?.(seat) || onSeatSelect?.(seat)}
                            isAdmin={isAdmin}
                            onAdminToggle={onAdminToggle}
                          />
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      </div>
      </div>
    </div>
  );
};

export default SeatingGrid;
