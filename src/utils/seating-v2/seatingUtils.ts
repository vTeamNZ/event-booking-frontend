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
  return selectionState.selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0);
};

/**
 * Calculate detailed price breakdown by ticket type
 */
export const calculatePriceBreakdown = (
  selectionState: SeatingSelectionState
): Array<{ 
  ticketTypeId: number; 
  name: string; 
  count: number; 
  unitPrice: number; 
  totalPrice: number;
  color?: string; 
}> => {
  const breakdown: Record<number, { 
    ticketTypeId: number; 
    name: string; 
    count: number; 
    unitPrice: number; 
    totalPrice: number;
    color?: string;
  }> = {};

  // Group selected seats by ticket type
  selectionState.selectedSeats.forEach(selected => {
    const ticketType = selected.ticketType;
    if (!ticketType) return;
    
    const typeId = ticketType.id;
    if (!breakdown[typeId]) {
      breakdown[typeId] = {
        ticketTypeId: typeId,
        name: ticketType.name || ticketType.type || 'General Admission',
        count: 0,
        unitPrice: ticketType.price,
        totalPrice: 0,
        color: ticketType.color
      };
    }
    
    breakdown[typeId].count += 1;
    breakdown[typeId].totalPrice += ticketType.price;
  });
  
  return Object.values(breakdown).sort((a, b) => b.unitPrice - a.unitPrice);
};

/**
 * Check if a seat can be selected
 */
export const canSelectSeat = (
  seat: SeatingLayoutSeat,
  selectedSeats: SeatingSelectedSeat[]
): boolean => {
  // Can't select if already selected (allow deselection)
  if (selectedSeats.some(s => s.id === seat.id)) {
    return true; // Allow clicking on already selected seats to deselect
  }

  // Handle both string and numeric status formats
  const seatStatus = typeof seat.status === 'number' 
    ? seat.status // Use numeric value directly
    : convertToBackendStatus(seat.status); // Convert string status to number

  // Only Available (0) seats can be selected
  if (seatStatus !== 0) { // SeatStatus.Available = 0 in backend
    return false;
  }

  return true;
};

/**
 * Convert backend numeric status to frontend enum
 */
export const convertFromBackendStatus = (status: number): SeatStatus => {
  switch (status) {
    case 0:
      return SeatStatus.Available;
    case 1:
      return SeatStatus.Reserved;
    case 2:
      return SeatStatus.Booked;
    default:
      return SeatStatus.Available;
  }
};

/**
 * Convert frontend string status to backend numeric values
 */
export const convertToBackendStatus = (status: SeatStatus): number => {
  switch (status) {
    case SeatStatus.Available:
      return 0;
    case SeatStatus.Reserved:
      return 1;
    case SeatStatus.Booked:
      return 2;
    default:
      return 3; // Unavailable
  }
};

/**
 * Get the CSS color class for a seat based on its status
 */
export const getSeatColor = (
  seat: SeatingLayoutSeat,
  isSelected: boolean,
  canSelect: boolean,
  isAdmin: boolean = false
): string => {
  if (isSelected) {
    return 'bg-blue-500 text-white';
  }

  switch (seat.status) {
    case SeatStatus.Available:
      return canSelect
        ? 'bg-green-500 text-white hover:bg-green-600'
        : 'bg-green-300 text-gray-700';
    case SeatStatus.Reserved:
      return 'bg-yellow-500 text-white';
    case SeatStatus.Booked:
      return 'bg-red-500 text-white';
    case SeatStatus.Unavailable:
      return isAdmin 
        ? 'bg-gray-500 text-white' 
        : 'bg-transparent text-transparent border-transparent';
    default:
      return 'bg-gray-300 text-gray-700';
  }
};

/**
 * Get the tooltip text for a seat
 */
export const getSeatTooltip = (
  seat: SeatingLayoutSeat,
  selectedSeat?: SeatingSelectedSeat
): string => {
  const base = `Seat ${seat.row}${seat.number}`;
  
  if (selectedSeat) {
    return `${base} - Selected (${selectedSeat.ticketType?.name || 'Unknown ticket type'})`;
  }

  switch (seat.status) {
    case SeatStatus.Available:
      return `${base} - Available${seat.ticketType ? ` (${seat.ticketType.name})` : ''}`;
    case SeatStatus.Reserved:
      return `${base} - Reserved`;
    case SeatStatus.Booked:
      return `${base} - Booked`;
    case SeatStatus.Unavailable:
      return `${base} - Unavailable`;
    default:
      return base;
  }
};

/**
 * Convert numeric status to human-readable label
 */
export const getStatusLabel = (status: number): string => {
  switch (status) {
    case 0: return 'Available';
    case 1: return 'Reserved';
    case 2: return 'Booked';
    case 3: return 'Unavailable';
    default: return 'Unknown';
  }
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

/**
 * Get the ticket type for a specific row
 */
export const getTicketTypeForRow = (
  row: string,
  ticketTypes: TicketType[]
): TicketType | undefined => {
  // First try to find a direct match based on seat row assignments
  for (const ticketType of ticketTypes) {
    if (!ticketType.seatRowAssignments) continue;
    
    try {
      const rowAssignments = JSON.parse(ticketType.seatRowAssignments);
      
      for (const assignment of rowAssignments) {
        if (!assignment.rowStart || !assignment.rowEnd) continue;
        
        // Check if row is within the range
        const startChar = assignment.rowStart.charCodeAt(0);
        const endChar = assignment.rowEnd.charCodeAt(0);
        const rowChar = row.charCodeAt(0);
        
        if (rowChar >= startChar && rowChar <= endChar) {
          return ticketType;
        }
      }
    } catch (e) {
      console.error('Failed to parse seat row assignments', e);
    }
  }
  
  // If no match found, return the first General Admission ticket type
  return ticketTypes.find(t => 
    t.type?.toLowerCase() === 'general' || 
    t.name?.toLowerCase() === 'general admission'
  );
};

/**
 * Calculate seat price based on ticket type
 */
export const calculateSeatPrice = (
  seat: SeatingLayoutSeat,
  ticketTypes: TicketType[]
): number => {
  // If seat already has a price, use it
  if (seat.price && seat.price > 0) {
    return seat.price;
  }
  
  // If seat has a ticket type with price, use it
  if (seat.ticketType?.price) {
    return seat.ticketType.price;
  }
  
  // Find ticket type for this row
  const ticketType = getTicketTypeForRow(seat.row, ticketTypes);
  if (ticketType?.price) {
    return ticketType.price;
  }
  
  // Find the lowest priced ticket type as a fallback
  const lowestPriceTicket = ticketTypes
    .filter(tt => tt.price > 0)
    .sort((a, b) => a.price - b.price)[0];
    
  if (lowestPriceTicket?.price) {
    return lowestPriceTicket.price;
  }
  
  // Default price if nothing else is available
  console.warn(`No valid price found for seat ${seat.row}${seat.number}`);
  return 0;
};

/**
 * Toggle seat selection state
 */
export const toggleSeatSelection = (
  seat: SeatingLayoutSeat,
  state: SeatingSelectionState
): SeatingSelectionState => {
  // Check if seat is already selected
  const existingIndex = state.selectedSeats.findIndex(
    s => s.row === seat.row && s.number === seat.number
  );

  const newSelectedSeats = [...state.selectedSeats];

  // If seat is already selected, remove it
  if (existingIndex >= 0) {
    newSelectedSeats.splice(existingIndex, 1);
  }
  // If seat is not selected and we haven't reached max seats, add it
  else if (state.selectedSeats.length < (state.maxSeats || Infinity)) {
    const selectedSeat: SeatingSelectedSeat = {
      ...seat,
      selectedAt: new Date(),
      reservedUntil: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes reservation
    };
    newSelectedSeats.push(selectedSeat);
  }

  // Calculate new state
  const newState = {
    ...state,
    selectedSeats: newSelectedSeats,
    totalPrice: newSelectedSeats.reduce(
      (sum, seat) => sum + calculateSeatPrice(seat, state.ticketTypes || []),
      0
    )
  };

  return newState;
};

/**
 * Parse horizontal aisle rows from a JSON string or array
 * Handles formats like [5,7] or ["5","7"] or "5,7"
 * @returns Array of row numbers where aisles should appear
 */
export const parseHorizontalAisleRows = (aisleRowsData?: string): number[] => {
  if (!aisleRowsData || aisleRowsData.trim() === '') {
    return [];
  }
  
  try {
    // If it's already in [5,7] format
    if (aisleRowsData.startsWith('[') && aisleRowsData.endsWith(']')) {
      const cleanData = aisleRowsData.replace(/\\"/g, '"').replace(/\s/g, ''); // Remove escapes and whitespace
      const parsed = JSON.parse(cleanData);
      
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          const num = typeof item === 'string' ? parseInt(item) : (typeof item === 'number' ? item : 0);
          return num;
        }).filter(num => num > 0);
      }
    }
    
    // Fallback to comma-separated string
    return aisleRowsData
      .split(',')
      .map(row => {
        const num = parseInt(row.trim());
        return isNaN(num) ? 0 : num;
      })
      .filter(num => num > 0);
    
  } catch (e) {
    console.error('Error parsing horizontal aisle rows:', e);
    return [];
  }
};

/**
 * Parse vertical aisle seats from a JSON string or array
 */
export const parseVerticalAisleSeats = (aisleSeatsData?: string): number[] => {
  if (!aisleSeatsData) return [];
  
  try {
    // Parse JSON string if it's a string
    const parsed = typeof aisleSeatsData === 'string' 
      ? JSON.parse(aisleSeatsData) 
      : aisleSeatsData;
      
    // Return as array of numbers
    if (Array.isArray(parsed)) {
      return parsed.map(item => Number(item));
    }
    
    return [];
  } catch (e) {
    console.error('Failed to parse vertical aisle seats:', e);
    return [];
  }
};
