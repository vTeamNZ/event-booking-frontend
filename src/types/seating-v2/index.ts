// New types for Seating System V2
import { SeatStatus } from '../seatStatus';
import { TicketType } from '../ticketTypes';

export enum SeatSelectionMode {
  EventHall = 1,
  GeneralAdmission = 3
}

export interface SeatingVenue {
  id: number;
  name: string;
  width: number;
  height: number;
}

export interface SeatingStage {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SeatingTicketType extends TicketType {}

export interface SeatingLayoutSeat {
  id: number;
  seatNumber: string;
  row: string;
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  price?: number;
  status: SeatStatus;
  ticketType?: SeatingTicketType;
  reservedUntil?: string | Date;
  properties?: {
    rowLetter?: string;
    seatNumber?: string;
    isVip?: boolean;
    isAccessible?: boolean;
  };
}

export interface SeatingLayoutResponse {
  eventId: number;
  mode: SeatSelectionMode;
  venue?: SeatingVenue;
  stage?: SeatingStage;
  seats: SeatingLayoutSeat[];
  ticketTypes: SeatingTicketType[];
  hasHorizontalAisles?: boolean;
  horizontalAisleRows?: string;
  hasVerticalAisles?: boolean;
  verticalAisleSeats?: string;
  aisleWidth?: number;
  levels?: Array<{
    id: string;
    level: number;
    name: string;
    elements: Array<any>;
  }>;
}

export interface SeatingReservationRequest {
  seatId: number;
  sessionId: string;
}

export interface SeatingReservationResponse {
  message: string;
  reservedUntil: string;
  seatNumber: string;
  price: number;
}

export interface SeatingReleaseRequest {
  seatId: number;
  sessionId: string;
}

export interface SeatingPricingResponse {
  eventId: number;
  mode: SeatSelectionMode;
  ticketTypes: SeatingTicketType[];
}

// UI Component Props
export interface SeatingLayoutProps {
  eventId: number;
  onSelectionComplete: (state: SeatingSelectionState) => void;
  maxSeats?: number;
  showLegend?: boolean;
  className?: string;
}

export interface SeatVisualProps {
  seat: SeatingLayoutSeat;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  className?: string;
}

export interface SeatingGridProps {
  layout: SeatingLayoutResponse;
  selectedSeats: SeatingSelectedSeat[];
  onSeatSelect: (seat: SeatingLayoutSeat) => void;
  className?: string;
}

export interface SeatingLegendProps {
  ticketTypes: SeatingTicketType[];
}

export interface SeatingSummaryProps {
  selectedSeats: SeatingSelectedSeat[];
  totalPrice: number;
  onProceed: () => void;
  onClear: () => void;
}

export interface SeatingSelectedSeat extends SeatingLayoutSeat {
  reservedUntil: Date;
  ticketType?: SeatingTicketType;
  selectedAt: Date;
}

export interface SeatingSelectionState {
  mode: SeatSelectionMode;
  eventId: number;
  selectedSeats: SeatingSelectedSeat[];
  selectedTables: number[];
  generalTickets: SeatingTicketType[];
  totalPrice: number;
  sessionId: string;
  maxSeats: number;
  ticketTypes: TicketType[];
}
