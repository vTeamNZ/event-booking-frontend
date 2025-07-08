import { api } from './api';
import {
  SeatLayoutResponse,
  PricingResponse,
  ReserveSeatRequest,
  ReserveTableRequest,
  Seat,
  Table
} from '../types/seatSelection';
import { TicketType } from '../types/ticketTypes';
import { SeatStatus, convertFromBackendStatus } from '../types/seatStatus';

export type { TicketType } from '../types/ticketTypes';

// Removed mock data generator function

export const seatSelectionService = {
  // Get seat layout for an event
  async getEventSeatLayout(eventId: number): Promise<SeatLayoutResponse> {
    console.log(`************* SEAT SELECTION SERVICE API CALL *************`);
    console.log(`Making API call to: ${api.defaults.baseURL}/api/seats/event/${eventId}/layout`);
    
    try {
      console.log('API call parameters:', { eventId });
      
      // Check that API base URL is set
      if (!api.defaults.baseURL) {
        console.error('API base URL is not set!');
        throw new Error('API base URL not configured');
      }
      
      const response = await api.get<SeatLayoutResponse>(`/api/seats/event/${eventId}/layout`);
      console.log('Seat layout API response status:', response.status);
      console.log('Seat layout API response data:', response.data);
      
      // Detailed logging for seat data from API
      console.log('===== DETAILED SEAT DATA FROM API =====');
      if (response.data && response.data.seats && response.data.seats.length > 0) {
        // Log the first few seats
        console.log('First 3 seats with full details:');
        response.data.seats.slice(0, 3).forEach((seat: any, index: number) => {
          console.log(`Seat ${index + 1}:`, {
            id: seat.id,
            row: seat.row,
            number: seat.number,
            price: seat.price,
            status: seat.status,
            sectionId: seat.sectionId
          });
        });
        
        // Check how many seats have prices
        const seatsWithPrices = response.data.seats.filter((seat: any) => 
          typeof seat.price === 'number' && seat.price > 0
        );
        console.log(`Seats with prices > 0: ${seatsWithPrices.length} out of ${response.data.seats.length}`);
        
        // Log some of these seats with prices if they exist
        if (seatsWithPrices.length > 0) {
          console.log('Sample seats with prices:');
          seatsWithPrices.slice(0, 3).forEach((seat: any) => {
            console.log(`${seat.row}-${seat.number}: $${seat.price}`);
          });
        } else {
          console.log('WARNING: No seats with prices > 0 found!');
        }
      } else {
        console.log('No seat data found in API response');
      }
      
      // Validate the response structure
      if (!response.data) {
        console.error('Empty response data received');
        throw new Error('Empty response from API');
      } else {
        console.log('Response mode:', response.data.mode);
        console.log('Response event ID:', response.data.eventId);
        console.log('Response seats count:', response.data.seats?.length || 0);
        return response.data;
      }
    } catch (error) {
      console.error('************* ERROR IN SEAT SELECTION SERVICE *************');
      console.error('Error in getEventSeatLayout:', error);
      throw error; // Re-throw the error instead of using mock data
    }
  },

  // Get pricing information for an event
  async getEventPricing(eventId: number): Promise<PricingResponse> {
    const response = await api.get<PricingResponse>(`/api/seats/pricing/${eventId}`);
    return response.data;
  },

  // Reserve a single seat
  async reserveSeat(request: ReserveSeatRequest): Promise<{
    message: string;
    reservedUntil: string;
    seatNumber: string;
    price: number;
  }> {
    const response = await api.post<{
      message: string;
      reservedUntil: string;
      seatNumber: string;
      price: number;
    }>('/api/seats/reserve', request);
    return response.data;
  },

  // Reserve table or specific seats at a table
  async reserveTable(request: ReserveTableRequest): Promise<{
    message: string;
    reservedSeats: number;
    totalPrice: number;
    reservedUntil: string;
  }> {
    const response = await api.post<{
      message: string;
      reservedSeats: number;
      totalPrice: number;
      reservedUntil: string;
    }>('/api/seats/reserve-table', request);
    return response.data;
  },

  // Release a reserved seat
  async releaseSeat(seatId: number, sessionId: string): Promise<{
    message: string;
  }> {
    const response = await api.post<{ message: string }>('/api/seats/release', {
      seatId,
      sessionId
    });
    return response.data;
  },

  // Get all seats for an event (fallback)
  async getSeats(eventId: number): Promise<Seat[]> {
    const response = await api.get<Seat[]>(`/api/seats/event/${eventId}`);
    return response.data;
  },

  // Get all tables for an event (if needed)
  async getTables(): Promise<Table[]> {
    const response = await api.get<Table[]>('/api/tables');
    return response.data;
  },
  
  // Get ticket types for an event
  async getEventTicketTypes(eventId: number): Promise<TicketType[]> {
    try {
      console.log('Fetching ticket types for event:', eventId);
      const response = await api.get<TicketType[]>(`/api/TicketTypes/event/${eventId}`);
      console.log('Received ticket types:', response.data);
      
      // Log each ticket type with its color for debugging
      response.data.forEach(ticket => {
        console.log(`Ticket Type: ${ticket.type}, Color: ${ticket.color}, Price: $${ticket.price}`);
      });
      
      // Process ticket types to parse row assignments if available
      return response.data.map(ticket => {
        // Add parsedAssignments field for easier consumption by components
        return ticket;
      });
    } catch (error) {
      console.error('Error fetching ticket types:', error);
      throw error; // Let the component handle the error instead of using fallback data
    }
  },
};
