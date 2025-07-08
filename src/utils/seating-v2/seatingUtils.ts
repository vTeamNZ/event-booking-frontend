// Utility functions for Seating System V2
import { SeatingLayoutSeat, SeatingSelectedSeat, SeatingSelectionState, TicketType } from '../../types/seating-v2';
import { SeatStatus } from '../../types/seatStatus';

/**
 * Generate a unique session ID
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format time remaining for reservation
 */
export const formatTimeRemaining = (reservedUntil: Date): string => {
  const now = new Date();
  const timeRemaining = reservedUntil.getTime() - now.getTime();
  
  if (timeRemaining <= 0) {
    return 'Expired';
  }
  
  const minutes = Math.floor(timeRemaining / (60 * 1000));
  const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format price with currency
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2
  }).format(price);
};

/**
 * Check if reservation is about to expire
 */
export const isReservationExpiring = (reservedUntil: Date): boolean => {
  const now = new Date();
  const timeUntilExpiry = reservedUntil.getTime() - now.getTime();
  const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
  
  return timeUntilExpiry > 0 && timeUntilExpiry <= twoMinutes;
};

/**
 * Calculate total price for selected seats
 */
export const calculateTotalPrice = (selectionState: SeatingSelectionState): number => {
  return selectionState.selectedSeats.reduce((total, seat) => total + seat.seat.price, 0);
};

/**
 * Check if a seat can be selected
 */
export const canSelectSeat = (
  seat: SeatingLayoutSeat,
  selectedSeats: SeatingSelectedSeat[]
): boolean => {
  // Can't select if already selected
  if (selectedSeats.some(s => s.seat.id === seat.id)) {
    return false;
  }

  // Can't select if not available
  if (seat.status !== SeatStatus.Available) {
    return false;
  }

  return true;
};

/**
 * Get seat color based on status and selection
 */
export const getSeatColor = (
  seat: SeatingLayoutSeat,
  isSelected: boolean,
  isHovered: boolean,
  ticketType?: SeatingTicketType
): string => {
  if (isSelected) {
    return '#10b981'; // green-500
  }
  
  if (seat.status === SeatStatus.Reserved) {
    return '#f59e0b'; // amber-500
  }
  
  if (seat.status === SeatStatus.Booked) {
    return '#ef4444'; // red-500
  }
  
  if (isHovered) {
    return '#3b82f6'; // blue-500
  }
  
  if (ticketType?.color) {
    return ticketType.color;
  }
  
  if (seat.ticketType?.color) {
    return seat.ticketType.color;
  }
  
  return '#e5e7eb'; // gray-200
};

/**
 * Get seat tooltip text
 */
export const getSeatTooltip = (
  seat: SeatingLayoutSeat,
  isSelected: boolean,
  ticketType?: SeatingTicketType
): string => {
  const parts = [
    `${seat.row}${seat.number}`,
    seat.ticketType?.name || 'General',
    formatPrice(seat.price)
  ];

  if (isSelected) {
    parts.unshift('Selected:');
  }

  if (ticketType) {
    parts.splice(2, 0, ticketType.name);
  }

  if (seat.status !== SeatStatus.Available) {
    parts.unshift(`${seat.status}:`);
  }

  return parts.join(' - ');
};

/**
 * Group seats by row
 */
export const groupSeatsByRow = (seats: SeatingLayoutSeat[]): { [key: string]: SeatingLayoutSeat[] } => {
  return seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as { [key: string]: SeatingLayoutSeat[] });
};

/**
 * Sort row keys
 */
export const sortRows = (rows: string[]): string[] => {
  return rows.sort((a, b) => {
    // If both rows start with a letter, sort alphabetically
    if (isNaN(parseInt(a)) && isNaN(parseInt(b))) {
      return a.localeCompare(b);
    }
    // If one row starts with a letter and the other with a number, prioritize letters
    if (isNaN(parseInt(a))) return -1;
    if (isNaN(parseInt(b))) return 1;
    // If both rows start with numbers, sort numerically
    return parseInt(a) - parseInt(b);
  });
};

/**
 * Sort seats in a row by seat number
 */
export const sortSeatsInRow = (seats: SeatingLayoutSeat[]): SeatingLayoutSeat[] => {
  return seats.sort((a, b) => a.number - b.number);
};

/**
 * Validate selection state
 */
export const validateSelectionState = (
  selectionState: SeatingSelectionState
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!selectionState.sessionId) {
    errors.push('Session ID is required');
  }

  if (!selectionState.eventId) {
    errors.push('Event ID is required');
  }

  if (selectionState.selectedSeats.length === 0 &&
      selectionState.selectedTables.length === 0 &&
      selectionState.generalTickets.length === 0) {
    errors.push('No seats or tickets selected');
  }

  if (selectionState.totalPrice <= 0) {
    errors.push('Invalid total price');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
