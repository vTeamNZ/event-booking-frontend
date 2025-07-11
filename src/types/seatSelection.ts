import { TicketTypeDisplay } from './ticketTypes';
import { SeatStatus } from './seatStatus';

export enum SeatSelectionMode {
  EventHall = 1,
  GeneralAdmission = 3
}

export interface Venue {
  id: number;
  name: string;
  width: number;
  height: number;
}

export interface Stage {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Seat {
  id: number;
  seatNumber: string;
  row: string;
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  price: number;
  status: SeatStatus;
  ticketTypeId?: number;
  ticketType?: TicketTypeDisplay;
  reservedUntil?: string;
}

export interface SeatLayoutResponse {
  eventId: number;
  mode: SeatSelectionMode;
  venue?: Venue;
  stage?: Stage;
  seats: Seat[];
  ticketTypes: TicketTypeDisplay[];  // TicketTypes for seat coloring and pricing
  
  // Aisle configuration
  hasHorizontalAisles?: boolean;
  horizontalAisleRows?: string;
  hasVerticalAisles?: boolean;
  verticalAisleSeats?: string;
  aisleWidth?: number;
}

export interface PricingResponse {
  eventId: number;
  mode: SeatSelectionMode;
  ticketTypes: TicketTypeDisplay[];
}

export interface ReserveSeatRequest {
  seatId: number;
  sessionId: string;
}

export interface MarkSeatsBookedRequest {
  eventId: number;
  seatNumbers: string[];
  organizerEmail: string;
}

export interface SelectedSeat {
  seat: Seat;
  reservedUntil?: Date;
}

export interface GeneralTicketSelection {
  ticketType: TicketTypeDisplay;
  quantity: number;
}

export interface SeatSelectionState {
  mode: SeatSelectionMode;
  selectedSeats: SelectedSeat[];
  selectedTables: never[]; // Empty array type for backward compatibility
  generalTickets: GeneralTicketSelection[];
  totalPrice: number;
  sessionId: string;
}
