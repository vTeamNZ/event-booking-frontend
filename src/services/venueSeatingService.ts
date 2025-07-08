import { api } from './api';
import { SeatConfig } from '../types/venue';
import { generateSessionId } from '../utils/seatSelection';

interface BookedSeat {
    row: number;
    number: number;
    reservedUntil?: string;
}

interface ReserveSeatRequest {
    sessionId: string;
    seatId: string;
    row: number;
    number: number;
}

export const venueSeatingService = {
    async getBookedSeats(eventId: number): Promise<BookedSeat[]> {
        const response = await api.get(`/api/events/${eventId}/seats/booked`);
        return response.data as BookedSeat[];
    },

    async reserveSeat(eventId: number, request: ReserveSeatRequest): Promise<void> {
        await api.post(`/api/events/${eventId}/seats/reserve`, request);
    },

    async confirmSeats(eventId: number, seats: SeatConfig[]): Promise<void> {
        const sessionId = generateSessionId();
        await api.post(`/api/events/${eventId}/seats/confirm`, {
            sessionId,
            seats: seats.map(seat => ({
                row: seat.row,
                number: seat.number,
                sectionId: seat.sectionId
            }))
        });
    },

    async releaseSeats(eventId: number, sessionId: string): Promise<void> {
        await api.post(`/api/events/${eventId}/seats/release`, { sessionId });
    }
};
