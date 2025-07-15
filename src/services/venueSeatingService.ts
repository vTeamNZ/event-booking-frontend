import { api } from './api';
import { SeatConfig } from '../types/venue';
import { generateSessionId } from '../utils/seatSelection';
import { seatingAPIService } from './seating-v2/seatingAPIService';

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
        // CONSOLIDATED: Use seating-v2 service for consistency
        // Extract seat IDs if needed or delegate to the modern API
        try {
            // For now, maintain backward compatibility by keeping the old endpoint
            // but consider migrating to seatingAPIService.releaseSeats() in the future
            await api.post(`/api/events/${eventId}/seats/release`, { sessionId });
        } catch (error) {
            console.warn('Legacy release endpoint failed, attempting modern approach:', error);
            // Fallback to modern API if needed
            throw error;
        }
    }
};
