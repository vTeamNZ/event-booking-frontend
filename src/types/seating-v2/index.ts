// New types for Seating System V2
import { SeatStatus } from '../seatStatus';

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

export interface SeatingTicketType {
  id: number;
  name: string;
  type: string;
  price: number;
  color: string;
  description: string;
  seatRowAssignments: string; // JSON string of row assignments
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
  price: number;
  status: SeatStatus;
  ticketTypeId?: number;
  ticketType?: {
    id: number;
    name: string;
    color: string;
    price: number;
  };
  tableId?: number;
  reservedUntil?: string;
}

export interface SeatingLayoutTable {
  id: number;
  tableNumber: string;
  capacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: string;
  pricePerSeat: number;
  tablePrice?: number;
  sectionId?: number;
  availableSeats: number;
  seats: SeatingLayoutSeat[];
}

export interface SeatingLayoutResponse {
  eventId: number;
  mode: SeatSelectionMode;
  venue?: SeatingVenue;
  stage?: SeatingStage;
  seats: SeatingLayoutSeat[];
  tables: SeatingLayoutTable[];
  ticketTypes: SeatingTicketType[];
  
  // Aisle configuration
  hasHorizontalAisles?: boolean;
  horizontalAisleRows?: string;
  hasVerticalAisles?: boolean;
  verticalAisleSeats?: string;
  aisleWidth?: number;
}

export interface SeatingSelectedSeat {
  seat: SeatingLayoutSeat;
  reservedUntil?: Date;
  ticketType?: SeatingTicketType;
}

export interface SeatingSelectedTable {
  table: SeatingLayoutTable;
  selectedSeats: SeatingLayoutSeat[];
  isFullTable: boolean;
  reservedUntil?: Date;
}

export interface SeatingGeneralTicket {
  ticketType: SeatingTicketType;
  quantity: number;
}

export interface SeatingSelectionState {
  mode: SeatSelectionMode;
  eventId: number;
  selectedSeats: SeatingSelectedSeat[];
  selectedTables: SeatingSelectedTable[];
  generalTickets: SeatingGeneralTicket[];
  totalPrice: number;
  sessionId: string;
  maxSeats?: number;
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
  sectionPricing: Record<string, number>;
  ticketTypes: SeatingTicketType[];
}

// UI Component Props
export interface SeatingLayoutProps {
  eventId: number;
  onSelectionComplete: (selectionState: SeatingSelectionState) => void;
  maxSeats?: number;
  showLegend?: boolean;
  className?: string;
}

export interface SeatVisualProps {
  seat: SeatingLayoutSeat;
  isSelected: boolean;
  isReserved: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  className?: string;
}

export interface SeatingGridProps {
  seats: SeatingLayoutSeat[];
  selectedSeats: number[];
  onSeatClick: (seat: SeatingLayoutSeat) => void;
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

export interface SeatingReservationTimerProps {
  sessionId: string;
  onExpiry: () => void;
}

export interface SeatingErrorMessageProps {
  error: string;
  onRetry: () => void;
}
