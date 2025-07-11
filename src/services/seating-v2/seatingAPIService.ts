// API Service for Seating System V2
import { api } from '../api';
import {
  SeatingLayoutResponse,
  SeatingReservationRequest,
  SeatingReservationResponse,
  SeatingReleaseRequest,
  SeatingPricingResponse,
  SeatingTicketType
} from '../../types/seating-v2';

export class SeatingAPIService {
  private baseUrl = '/api/seats';

  /**
   * Get seat layout for an event
   */
  async getEventSeatLayout(eventId: number): Promise<SeatingLayoutResponse> {
    try {
      console.log(`[SeatingAPIService] Fetching layout for event ${eventId}`);
      const response = await api.get<SeatingLayoutResponse>(`${this.baseUrl}/event/${eventId}/layout`);
      
      console.log(`[SeatingAPIService] Layout response:`, {
        eventId: response.data.eventId,
        mode: response.data.mode,
        seatsCount: response.data.seats.length,
        ticketTypesCount: response.data.ticketTypes.length
      });
      
      return response.data;
    } catch (error) {
      console.error('[SeatingAPIService] Error fetching seat layout:', error);
      throw new Error('Failed to fetch seat layout');
    }
  }

  /**
   * Reserve a seat
   */
  async reserveSeat(request: SeatingReservationRequest): Promise<SeatingReservationResponse> {
    try {
      console.log(`[SeatingAPIService] Reserving seat ${request.seatId} for session ${request.sessionId}`);
      const response = await api.post<SeatingReservationResponse>(`${this.baseUrl}/reserve`, request);
      
      console.log(`[SeatingAPIService] Seat reserved:`, response.data);
      return response.data;
    } catch (error) {
      console.error('[SeatingAPIService] Error reserving seat:', error);
      throw new Error('Failed to reserve seat');
    }
  }

  /**
   * Release a seat
   */
  async releaseSeat(request: SeatingReleaseRequest): Promise<{ message: string }> {
    try {
      console.log(`[SeatingAPIService] Releasing seat ${request.seatId} for session ${request.sessionId}`);
      const response = await api.post<{ message: string }>(`${this.baseUrl}/release`, request);
      
      console.log(`[SeatingAPIService] Seat released:`, response.data);
      return response.data;
    } catch (error) {
      console.error('[SeatingAPIService] Error releasing seat:', error);
      throw new Error('Failed to release seat');
    }
  }

  /**
   * Get pricing information for an event
   */
  async getEventPricing(eventId: number): Promise<SeatingPricingResponse> {
    try {
      console.log(`[SeatingAPIService] Fetching pricing for event ${eventId}`);
      const response = await api.get<SeatingPricingResponse>(`${this.baseUrl}/event/${eventId}/pricing`);
      
      console.log(`[SeatingAPIService] Pricing response:`, response.data);
      return response.data;
    } catch (error) {
      console.error('[SeatingAPIService] Error fetching pricing:', error);
      throw new Error('Failed to fetch pricing information');
    }
  }

  /**
   * Get ticket types for an event
   */
  async getEventTicketTypes(eventId: number): Promise<SeatingTicketType[]> {
    try {
      console.log(`[SeatingAPIService] Fetching ticket types for event ${eventId}`);
      const response = await api.get<SeatingTicketType[]>(`/api/TicketTypes/event/${eventId}`);
      
      console.log(`[SeatingAPIService] Ticket types response:`, response.data);
      return response.data;
    } catch (error) {
      console.error('[SeatingAPIService] Error fetching ticket types:', error);
      throw new Error('Failed to fetch ticket types');
    }
  }

  /**
   * Batch release seats
   */
  async releaseSeats(seatIds: number[], sessionId: string): Promise<{ message: string }> {
    try {
      console.log(`[SeatingAPIService] Batch releasing ${seatIds.length} seats for session ${sessionId}`);
      
      const releasePromises = seatIds.map(seatId => 
        this.releaseSeat({ seatId, sessionId })
      );
      
      await Promise.all(releasePromises);
      
      console.log(`[SeatingAPIService] All seats released successfully`);
      return { message: 'All seats released successfully' };
    } catch (error) {
      console.error('[SeatingAPIService] Error batch releasing seats:', error);
      throw new Error('Failed to release seats');
    }
  }

  /**
   * Check seat availability
   */
  async checkSeatAvailability(seatId: number): Promise<{ available: boolean; reason?: string }> {
    try {
      console.log(`[SeatingAPIService] Checking availability for seat ${seatId}`);
      const response = await api.get<{ available: boolean; reason?: string }>(`${this.baseUrl}/${seatId}/availability`);
      
      console.log(`[SeatingAPIService] Seat ${seatId} availability:`, response.data);
      return response.data;
    } catch (error) {
      console.error('[SeatingAPIService] Error checking seat availability:', error);
      return { available: false, reason: 'Failed to check availability' };
    }
  }

  /**
   * Get real-time seat status updates
   */
  async getSeatsStatus(eventId: number): Promise<{ [seatId: number]: string }> {
    try {
      console.log(`[SeatingAPIService] Fetching seats status for event ${eventId}`);
      const response = await api.get<{ [seatId: number]: string }>(`${this.baseUrl}/event/${eventId}/status`);
      
      console.log(`[SeatingAPIService] Seats status response:`, response.data);
      return response.data;
    } catch (error) {
      console.error('[SeatingAPIService] Error fetching seats status:', error);
      throw new Error('Failed to fetch seat status');
    }
  }

  /**
   * Reserve multiple seats in a single transaction
   */
  async reserveMultipleSeats(request: { seatIds: number[], sessionId: string, eventId: number }): Promise<any> {
    try {
      console.log(`[SeatingAPIService] Reserving multiple seats: ${request.seatIds.join(', ')} for session ${request.sessionId}`);
      const response = await api.post(`${this.baseUrl}/reserve-multiple`, request);
      
      console.log(`[SeatingAPIService] Multiple seats reserved:`, response.data);
      return response.data;
    } catch (error) {
      console.error('[SeatingAPIService] Error reserving multiple seats:', error);
      throw new Error('Failed to reserve seats');
    }
  }
}

// Export singleton instance
export const seatingAPIService = new SeatingAPIService();

// Export default
export default seatingAPIService;
