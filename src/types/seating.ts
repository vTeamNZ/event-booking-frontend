export interface BookedSeat {
    row: number;
    number: number;
    reservedUntil?: string;
}

export interface ReserveSeatRequest {
    sessionId: string;
    seatId: string;
    row: number;
    number: number;
}

export interface SeatReservation {
    id: number;
    eventId: number;
    row: number;
    number: number;
    sessionId: string;
    reservedAt: string;
    expiresAt: string;
    isConfirmed: boolean;
    userId?: string;
}
