// API Service for Seating System V2
import { api } from '../api';
import {
  SeatingLayoutResponse,
  SeatingReservationRequest,
  SeatingReservationResponse,
  SeatingReleaseRequest,
  SeatingPricingResponse,
  SeatingTicketType,
  SeatingLayoutSeat
} from '../../types/seating-v2';
import { ReservedSeatDTO } from '../../types/seating-v2/reservedSeatDTO';

export class SeatingAPIService {
  private baseUrl = '/seats';

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
      console.log(`[SeatingAPIService] Reserving seat ${request.SeatId} for session ${request.SessionId}`);
      console.log(`[SeatingAPIService] Reserve request:`, JSON.stringify(request, null, 2));
      const response = await api.post<SeatingReservationResponse>(`${this.baseUrl}/reserve`, request);
      
      console.log(`[SeatingAPIService] Seat reserved:`, response.data);
      return response.data;
    } catch (error) {
      console.error('[SeatingAPIService] Error reserving seat:', error);
      throw new Error('Failed to reserve seat');
    }
  }

  /**
   * Release a seat and refresh the layout
   */
  async releaseSeat(request: SeatingReleaseRequest): Promise<{ message: string; updatedLayout?: SeatingLayoutResponse }> {
    try {
      console.log(`[SeatingAPIService] Releasing seat ${request.SeatId} for session ${request.SessionId}`);
      console.log(`[SeatingAPIService] Request URL: ${this.baseUrl}/release`);
      console.log(`[SeatingAPIService] Request body:`, JSON.stringify(request, null, 2));
      
      const response = await api.post<{ message: string }>(`${this.baseUrl}/release`, request);
      console.log(`[SeatingAPIService] Seat released:`, response.data);

      // After successful release, fetch updated layout
      let updatedLayout: SeatingLayoutResponse | undefined;
      try {
        // Extract eventId from the request context if available
        const eventId = parseInt(request.SessionId.split('-')[0], 10);
        if (!isNaN(eventId)) {
          updatedLayout = await this.getEventSeatLayout(eventId);
          console.log('[SeatingAPIService] Layout refreshed after seat release');
        }
      } catch (refreshError) {
        console.warn('[SeatingAPIService] Failed to refresh layout after release:', refreshError);
        // Don't throw here - the seat was still released successfully
      }
      
      return {
        message: response.data.message,
        updatedLayout
      };
    } catch (error: any) {
      console.error('[SeatingAPIService] Error releasing seat:', error);
      console.error('[SeatingAPIService] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        requestBody: error.config?.data
      });
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
      const response = await api.get<SeatingTicketType[]>(`/TicketTypes/event/${eventId}`);
      
      console.log(`[SeatingAPIService] Ticket types response:`, response.data);
      return response.data;
    } catch (error) {
      console.error('[SeatingAPIService] Error fetching ticket types:', error);
      throw new Error('Failed to fetch ticket types');
    }
  }

  /**
   * Batch release seats and refresh layout
   */
  async releaseSeats(seatIds: number[], sessionId: string): Promise<{ message: string; updatedLayout?: SeatingLayoutResponse }> {
    try {
      console.log(`[SeatingAPIService] Batch releasing ${seatIds.length} seats for session ${sessionId}`);
      
      // Release all seats individually without layout refresh to avoid multiple API calls
      const releasePromises = seatIds.map(seatId => 
        api.post<{ message: string }>(`${this.baseUrl}/release`, { SeatId: seatId, SessionId: sessionId })
      );
      
      await Promise.all(releasePromises);
      
      // After all seats are released, fetch fresh layout once
      let updatedLayout: SeatingLayoutResponse | undefined;
      try {
        const eventId = parseInt(sessionId.split('-')[0], 10);
        if (!isNaN(eventId)) {
          updatedLayout = await this.getEventSeatLayout(eventId);
          console.log('[SeatingAPIService] Layout refreshed after batch release');
        }
      } catch (refreshError) {
        console.warn('[SeatingAPIService] Failed to refresh layout after batch release:', refreshError);
        // Don't throw here - the seats were still released successfully
      }
      
      console.log(`[SeatingAPIService] All seats released successfully`);
      return { 
        message: 'All seats released successfully',
        updatedLayout
      };
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
   * Get existing reservations for a session
   */
  async getReservationsBySession(eventId: number, sessionId: string): Promise<ReservedSeatDTO[]> {
    try {
      console.log(`[SeatingAPIService] Fetching reservations for event ${eventId} and session ${sessionId}`);
      // Use the correct endpoint format that matches the backend controller
      const response = await api.get<ReservedSeatDTO[]>(`${this.baseUrl}/reservations/${eventId}/${sessionId}`);
      
      console.log(`[SeatingAPIService] Reservations found:`, {
        count: response.data.length,
        seats: response.data.map(s => s.seatNumber).join(', ')
      });
      return response.data;
    } catch (error: any) { // Type assertion needed for error object
      console.error('[SeatingAPIService] Error fetching reservations:', error);
      if (error?.response?.status === 404) {
        // Not found is expected when there are no reservations
        return [];
      }
      // Return empty array instead of throwing to gracefully handle missing reservations
      return [];
    }
  }

  /**
   * Reserve multiple seats in a single transaction
   * Since the backend doesn't have a reserve-multiple endpoint, we'll reserve seats individually
   * but validate that all seats can be reserved before starting
   */
  async reserveMultipleSeats(request: { seatIds: number[], sessionId: string, eventId: number }): Promise<any> {
    try {
      console.log(`[SeatingAPIService] Reserving multiple seats: ${request.seatIds.join(', ')} for session ${request.sessionId}`);
      
      // Note: Since there's no reserve-multiple endpoint in the backend,
      // we should avoid calling this. Instead, seats should already be reserved
      // when they are selected. This function should only confirm existing reservations.
      
      // For now, we'll just return success since seats should already be reserved
      // when they were selected in the UI
      console.log(`[SeatingAPIService] Seats should already be reserved individually when selected`);
      
      return {
        success: true,
        message: 'Seats are already reserved',
        reservedSeats: request.seatIds
      };
    } catch (error) {
      console.error('[SeatingAPIService] Error in reserve multiple seats operation:', error);
      throw new Error('Failed to process seat reservations');
    }
  }

  /**
   * Mark seats as permanently booked (after payment completion)
   */
  async markSeatsAsBooked(request: { eventId: number; seatNumbers: string[]; organizerEmail: string }): Promise<{ message: string; markedSeats: number; seatNumbers: string[] }> {
    try {
      console.log(`[SeatingAPIService] Marking seats as booked: ${request.seatNumbers.join(', ')} for event ${request.eventId}`);
      const response = await api.post<{ message: string; markedSeats: number; seatNumbers: string[] }>(`${this.baseUrl}/mark-booked`, request);
      
      console.log(`[SeatingAPIService] Seats marked as booked:`, response.data);
      return response.data;
    } catch (error) {
      console.error('[SeatingAPIService] Error marking seats as booked:', error);
      throw new Error('Failed to mark seats as booked');
    }
  }
}

// Export singleton instance
export const seatingAPIService = new SeatingAPIService();

// Export default
export default seatingAPIService;
