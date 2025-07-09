import { TicketType } from './ticketTypes';

// These values must match the backend SeatStatus enum
export enum SeatStatus {
  Available = 0,
  Reserved = 1,
  Booked = 2,
  Unavailable = 3
}

// Interface for seat status information including ticket type
export interface SeatStatusInfo {
  status: SeatStatus;
  ticketType: TicketType;
  reservedUntil?: Date;
}

// Type guard to check if a number is a valid SeatStatus
export function isSeatStatus(status: number): status is SeatStatus {
  return Object.values(SeatStatus).includes(status);
}

// Helper to convert from backend numeric enum if needed
export function convertFromBackendStatus(status: number): SeatStatus {
  if (isSeatStatus(status)) {
    return status;
  }
  return SeatStatus.Unavailable;
}

// Helper to get CSS classes for each status
export function getSeatStatusClasses(status: SeatStatus, ticketType?: TicketType): string {
  const baseClasses = 'transition-all duration-200 border-2';
  const ticketColor = ticketType?.color;
  
  switch (status) {
    case SeatStatus.Available:
      return ticketColor 
        ? `${baseClasses} hover:scale-105 cursor-pointer`
        : `${baseClasses} bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:scale-105`;
    case SeatStatus.Reserved:
      return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-300 cursor-not-allowed`;
    case SeatStatus.Booked:
      return `${baseClasses} bg-red-100 text-red-800 border-red-300 cursor-not-allowed`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-500 border-gray-300`;
  }
}

// Helper to get style object for ticket type coloring
export function getTicketTypeStyle(status: SeatStatus, ticketType?: TicketType): React.CSSProperties {
  if (!ticketType?.color) {
    return {};
  }

  const color = ticketType.color;
  
  switch (status) {
    case SeatStatus.Available:
      return {
        backgroundColor: `${color}33`, // Very light (20% opacity)
        borderColor: color,
        color: color
      };
    case SeatStatus.Reserved:
      return {
        backgroundColor: `${color}66`, // 40% opacity
        borderColor: color,
        opacity: 0.7
      };
    case SeatStatus.Booked:
      return {
        backgroundColor: color,
        borderColor: color,
        opacity: 0.5
      };
    default:
      return {
        backgroundColor: `${color}1A`, // 10% opacity
        borderColor: `${color}4D`, // 30% opacity
      };
  }
}
