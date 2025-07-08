import { SeatStatus } from './seatStatus';

export interface SeatingLayoutProps {
    eventId: number;
    onSelectionComplete: (state: SeatingSelectionState) => void;
    maxSeats?: number;
    showLegend?: boolean;
    className?: string;
}

export interface TicketType {
    id: number;
    type: string;
    name: string;
    color: string;
    price: number;
    description?: string;
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
    status: SeatStatus;
    ticketType: TicketType; // Changed from section to ticketType
}

export interface SeatingLayoutResponse {
    eventId: number;
    seats: SeatingLayoutSeat[];
    ticketTypes: TicketType[]; // Changed from sections to ticketTypes
}

export interface SeatingSelectionState {
    selectedSeats: SeatingSelectedSeat[];
    selectedTables: number[];
    generalTickets: TicketType[];
    totalPrice: number;
    mode: SeatSelectionMode;
    sessionId: string;
    eventId: number;
}

export interface SeatingSelectedSeat {
    seat: SeatingLayoutSeat;
}

export enum SeatSelectionMode {
    EventHall = 'event-hall',
    Tables = 'tables',
    GeneralAdmission = 'general-admission'
}
