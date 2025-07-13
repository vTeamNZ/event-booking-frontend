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

export interface SeatProperties {
  rowLetter?: string;
  seatNumber?: string;
  isVip?: boolean;
  isAccessible?: boolean;
}

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
  properties?: SeatProperties;
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
  isAdmin?: boolean;
  onAdminToggle?: (seat: SeatingLayoutSeat) => void;
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
  seats: SeatingLayoutSeat[];
  selectedSeats: SeatingSelectedSeat[];
  onSeatClick: (seat: SeatingLayoutSeat) => void;
  isAdmin?: boolean;
  onAdminToggle?: (seat: SeatingLayoutSeat) => void;
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
  onRemoveSeat?: (seat: SeatingSelectedSeat) => void;
  onRefresh?: () => void;
}

export interface SeatingSelectedSeat extends Omit<SeatingLayoutSeat, 'ticketType' | 'reservedUntil'> {
  selectedAt?: Date;
  reservedUntil: string | Date;
  ticketType?: SeatingTicketType;
  price: number;
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
