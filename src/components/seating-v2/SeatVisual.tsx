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
  isReservedByCurrentSession?: boolean;
}

const SeatVisual: React.FC<SeatVisualProps> = ({
  seat,
  isSelected,
  selectedSeat,
  canSelect,
  onClick,
  className = '',
  isAdmin = false,
  onAdminToggle,
  isReservedByCurrentSession = false
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

  // Get background color from ticket type for available seats
  const getBackgroundStyle = () => {
    if (isUnavailableForNonAdmin) return {};
    if (isSelected) return { backgroundColor: '#3B82F6' }; // bg-blue-500
    if (seat.status === SeatStatus.Booked) return { backgroundColor: '#EF4444' }; // bg-red-500
    
    // For reserved seats, check if it's reserved by current session
    if (seat.status === SeatStatus.Reserved) {
      // If this seat is owned by the current session, use a special style
      if (isReservedByCurrentSession) {
        return { 
          backgroundColor: seat.ticketType?.color || '#6B7280',
          borderColor: '#3B82F6', // Blue border
          borderWidth: '2px',
          borderStyle: 'dashed'
        };
      }
      return { backgroundColor: seat.ticketType?.color || '#6B7280' };
    }
    
    if (seat.status === SeatStatus.Available) return { backgroundColor: seat.ticketType?.color || '#6B7280' };
    return { backgroundColor: '#6B7280' }; // Default gray
  };

  return (
    <div className="relative flex-shrink-0 flex items-center justify-center w-7 h-7">
      <button
        type="button"
        className={`
          w-6 h-6 rounded 
          ${seatColor}
          ${canSelect ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}
          transition-colors duration-200
          flex items-center justify-center
          text-xs font-medium
          ${className}
          ${isUnavailableForNonAdmin ? 'pointer-events-none' : ''}
        `}
        style={getBackgroundStyle()}
        onClick={onClick}
        disabled={!canSelect}
        title={isUnavailableForNonAdmin ? '' : tooltip}
        aria-label={isUnavailableForNonAdmin ? '' : tooltip}
      >
        {isUnavailableForNonAdmin ? '' : (
          seat.ticketType?.name?.toLowerCase().includes('standing') ? '' : seat.number
        )}
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
