// Individual Seat Visual Component
import React from 'react';
import { SeatingLayoutSeat, SeatingSelectedSeat } from '../../types/seating-v2';
import { getSeatColor, getSeatTooltip } from '../../utils/seating-v2/seatingUtils';

interface SeatVisualProps {
  seat: SeatingLayoutSeat;
  isSelected: boolean;
  selectedSeat?: SeatingSelectedSeat;
  canSelect: boolean;
  onClick: () => void;
  className?: string;
}

const SeatVisual: React.FC<SeatVisualProps> = ({
  seat,
  isSelected,
  selectedSeat,
  canSelect,
  onClick,
  className = ''
}) => {
  const seatColor = getSeatColor(seat, isSelected, canSelect);
  const tooltip = getSeatTooltip(seat, selectedSeat);

  return (
    <button
      type="button"
      className={`
        w-8 h-8 rounded 
        ${seatColor}
        ${canSelect ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}
        transition-colors duration-200
        ${className}
      `}
      onClick={onClick}
      disabled={!canSelect}
      title={tooltip}
      aria-label={tooltip}
    >
      {seat.number}
    </button>
  );
};

export default SeatVisual;
