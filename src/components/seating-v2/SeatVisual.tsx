// Individual Seat Visual Component
import React from 'react';
import { SeatingLayoutSeat, SeatingSelectedSeat } from '../../types/seating-v2';
import { getSeatColor, getSeatTooltip } from '../../utils/seating-v2/seatingUtils';
import { SeatStatus } from '../../types/seatStatus';

interface SeatVisualProps {
  seat: SeatingLayoutSeat;
  isSelected: boolean;
  selectedSeat?: SeatingSelectedSeat;
  canSelect: boolean;
  onClick: () => void;
  className?: string;
  isAdmin?: boolean;
  onAdminToggle?: (seatId: number) => void;
}

const SeatVisual: React.FC<SeatVisualProps> = ({
  seat,
  isSelected,
  selectedSeat,
  canSelect,
  onClick,
  className = '',
  isAdmin = false,
  onAdminToggle
}) => {
  const seatColor = getSeatColor(seat, isSelected, canSelect, isAdmin);
  const tooltip = getSeatTooltip(seat, selectedSeat);

  const handleAdminToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent seat selection when clicking admin button
    if (onAdminToggle) {
      onAdminToggle(seat.id);
    }
  };

  // Only show admin toggle for seats that are Available or Unavailable (not Reserved/Booked)
  const canAdminToggle = isAdmin && 
    (seat.status === SeatStatus.Available || seat.status === SeatStatus.Unavailable);

  // Hide unavailable seats completely for non-admin users
  const isUnavailableForNonAdmin = seat.status === SeatStatus.Unavailable && !isAdmin;

  return (
    <div className="relative">
      <button
        type="button"
        className={`
          w-8 h-8 rounded 
          ${seatColor}
          ${canSelect ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}
          transition-colors duration-200
          ${className}
          ${isUnavailableForNonAdmin ? 'pointer-events-none' : ''}
        `}
        onClick={onClick}
        disabled={!canSelect}
        title={isUnavailableForNonAdmin ? '' : tooltip}
        aria-label={isUnavailableForNonAdmin ? '' : tooltip}
      >
        {isUnavailableForNonAdmin ? '' : seat.number}
      </button>
      
      {/* Admin Toggle Button */}
      {canAdminToggle && (
        <button
          type="button"
          onClick={handleAdminToggle}
          className={`
            absolute -top-1 -right-1 w-3 h-3 rounded-full text-[8px] font-bold
            flex items-center justify-center transition-colors duration-200
            ${seat.status === SeatStatus.Available 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
            }
          `}
          title={seat.status === SeatStatus.Available ? 'Make Unavailable' : 'Make Available'}
          aria-label={seat.status === SeatStatus.Available ? 'Make seat unavailable' : 'Make seat available'}
        >
          {seat.status === SeatStatus.Available ? '×' : '✓'}
        </button>
      )}
    </div>
  );
};

export default SeatVisual;
