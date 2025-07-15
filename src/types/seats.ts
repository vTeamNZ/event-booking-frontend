import { TicketTypeDisplay } from './ticketTypes';

export interface BaseSeat {
  id: number;
  row: string;
  number: number;
  seatNumber?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  price?: number;
  status?: 'Available' | 'Reserved' | 'Booked' | 'Unavailable';
  ticketTypeId?: number;
  ticketType?: TicketTypeDisplay;
}

export interface DisplaySeat extends BaseSeat {
  isReserved: boolean;
  tooltip: string;
  color?: string;
  originalSeat: BaseSeat;
  // For backward compatibility
  ticketTypeColor?: string;  // Color based on ticket type
  sectionColor?: string;     // Legacy color from section
}

export interface SelectedSeat extends DisplaySeat {
  resolvedPrice?: number;
}
