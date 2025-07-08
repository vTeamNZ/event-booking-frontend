// Individual Seat Visual Component
import React from 'react';
import { SeatingLayoutSeat } from '../../types/seating-v2';
import { getSeatColor, getSeatTooltip } from '../../utils/seating-v2/seatingUtils';

interface SeatVisualProps {
  seat: SeatingLayoutSeat;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const SeatVisual: React.FC<SeatVisualProps> = ({
  seat,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  // Get seat color based on status and selection
  const seatColor = getSeatColor(seat, isSelected, isHovered);
  
  // Get tooltip text
  const tooltip = getSeatTooltip(seat, isSelected);

  return (
    <div
      title={tooltip}
      className="w-8 h-8 flex items-center justify-center rounded cursor-pointer transition-colors duration-200"
      style={{ backgroundColor: seatColor }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="text-xs">{seat.number}</span>
    </div>
  );
};

export default SeatVisual;
