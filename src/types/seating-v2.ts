import { SeatStatus } from './seatStatus';

export interface SeatingLayoutProps {
    eventId: number;
    onSelectionComplete: (state: SeatingSelectionState) => void;
    maxSeats?: number;
    showLegend?: boolean;
    className?: string;
    isAdmin?: boolean;
    onAdminToggle?: (seatId: number) => void;
}

export interface SeatingGridProps {
    layout?: SeatingLayoutResponse;
    seats: SeatingLayoutSeat[];
    selectedSeats: SeatingSelectedSeat[];
    onSeatSelect?: (seat: SeatingLayoutSeat) => void;
    onSeatClick?: (seat: SeatingLayoutSeat) => void;
    showLegend?: boolean;
    maxSeats?: number;
    className?: string;
    isAdmin?: boolean;
    onAdminToggle?: (seatId: number) => void;
}

export interface TicketType {
    id: number;
    type: string;
    name: string;
    color: string;
    price: number;
    description?: string;
    seatRowAssignments?: string; // JSON string storing seat row assignments
}

export interface SeatingLayoutSeat {
    id: number;
    row: string;
    number: number;
    seatNumber: string;
    x: number;
    y: number;
    width: number;
    height: number;
    price: number;
    status: SeatStatus;
    ticketType: TicketType; // Changed from section to ticketType
}

export interface SeatingLayoutResponse {
    eventId: number;
    mode?: string;
    seats: SeatingLayoutSeat[];
    ticketTypes: TicketType[];
    // Aisle configuration
    hasHorizontalAisles?: boolean;
    horizontalAisleRows?: string;
    hasVerticalAisles?: boolean;
    verticalAisleSeats?: string;
    aisleWidth?: number;
}

export interface SeatingSelectionState {
    selectedSeats: SeatingSelectedSeat[];
    selectedTables: number[];
    generalTickets: TicketType[];
    totalPrice: number;
    mode: SeatSelectionMode;
    sessionId: string;
    eventId: number;
    maxSeats?: number;
    ticketTypes?: TicketType[];
}

export interface SeatingSelectedSeat extends SeatingLayoutSeat {
    selectedAt?: Date;
    reservedUntil?: Date;
}

export interface SeatingLegendProps {
    ticketTypes: TicketType[];
    maxSeats?: number;
    className?: string;
}

export interface SeatingReservationTimerProps {
    sessionId: string;
    onExpiry: () => void;
    className?: string;
}

export interface SeatingSummaryProps {
    selectedSeats: SeatingSelectedSeat[];
    totalPrice: number;
    onProceed: () => void;
    onClear: () => void;
    onRemoveSeat?: (seat: SeatingSelectedSeat) => void;
    onRefresh?: () => void;
    className?: string;
}

export enum SeatSelectionMode {
    EventHall = 'event-hall',
    Tables = 'tables',
    GeneralAdmission = 'general-admission'
}

// API request/response interfaces
export interface SeatingReservationRequest {
    EventId: number;
    SeatId: number;
    SessionId: string;
    Row: string;
    Number: number;
}

export interface SeatingReservationResponse {
    success: boolean;
    sessionId: string;
    expiresAt: Date;
    reservedSeats: number[];
}

export interface SeatingReleaseRequest {
    SeatId: number;
    SessionId: string;
}

export interface SeatingPricingResponse {
    eventId: number;
    ticketTypes: TicketType[];
    totalPrice: number;
}

export interface SeatingTicketType {
    id: number;
    type: string;
    name: string;
    color: string;
    price: number;
    description?: string;
    eventId: number;
}
