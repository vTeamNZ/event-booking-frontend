import { api } from './api';
import {
  SeatLayoutResponse,
  PricingResponse,
  ReserveSeatRequest,
  Seat
} from '../types/seatSelection';
import { TicketType } from '../types/ticketTypes';
import { SeatStatus, convertFromBackendStatus } from '../types/seatStatus';

export type { TicketType } from '../types/ticketTypes';

export const seatSelectionService = {
  // Get seat layout for an event
  async getEventSeatLayout(eventId: number): Promise<SeatLayoutResponse> {
    console.log(`************* SEAT SELECTION SERVICE API CALL *************`);
    console.log(`Making API call to: ${api.defaults.baseURL}/api/seats/event/${eventId}/layout`);
    
    try {
      const response = await api.get<SeatLayoutResponse>(`/api/seats/event/${eventId}/layout`);
      
      // Convert backend numeric status to enum values
      response.data.seats = response.data.seats.map(seat => ({
        ...seat,
        status: typeof seat.status === 'number' ? convertFromBackendStatus(seat.status) : seat.status,
        // Ensure each seat has complete ticket type info
        ticketType: seat.ticketType ? {
          ...seat.ticketType,
          type: seat.ticketType.type || seat.ticketType.name || 'General Admission',
          name: seat.ticketType.name || seat.ticketType.type || 'General Admission',
          eventId: eventId
        } : undefined
      }));

      console.log('Seat layout response:', {
        mode: response.data.mode,
        seatCount: response.data.seats?.length,
        ticketTypeCount: response.data.ticketTypes?.length
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching seat layout:', error);
      throw error;
    }
  },

  // Get pricing information for an event
  async getEventPricing(eventId: number): Promise<PricingResponse> {
    try {
      const response = await api.get<PricingResponse>(`/api/events/${eventId}/pricing`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing:', error);
      throw error;
    }
  },

  // Reserve a single seat
  async reserveSeat(request: ReserveSeatRequest): Promise<{
    message: string;
    reservedUntil: string;
    seatNumber: string;
    price: number;
  }> {
    try {
      const response = await api.post('/api/seats/reserve', request);
      const data = response.data as { message: string; reservedUntil: string; seatNumber: string; price: number; };
      return data;
    } catch (error) {
      console.error('Error reserving seat:', error);
      throw error;
    }
  },

  // Table reservation removed

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

  // Tables functionality removed
  
  // Get ticket types for an event
  async getEventTicketTypes(eventId: number): Promise<TicketType[]> {
    try {
      const response = await api.get<TicketType[]>(`/api/TicketTypes/event/${eventId}`);
      console.log('Received ticket types:', response.data);
      
      // Ensure all required fields are present
      return response.data.map(ticket => ({
        ...ticket,
        type: ticket.type || ticket.name || 'General Admission',
        name: ticket.name || ticket.type || 'General Admission',
        color: ticket.color || '#3B82F6',
        eventId: eventId
      }));
    } catch (error) {
      console.error('Error fetching ticket types:', error);
      throw error;
    }
  }
};
