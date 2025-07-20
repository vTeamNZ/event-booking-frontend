import { api } from './api';
import {
  SeatLayoutResponse,
  PricingResponse,
  ReserveSeatRequest,
  MarkSeatsBookedRequest,
  Seat
} from '../types/seatSelection';
import { TicketType } from '../types/ticketTypes';
import { SeatStatus, convertFromBackendStatus } from '../types/seatStatus';
import { seatingAPIService } from './seating-v2/seatingAPIService';

export type { TicketType } from '../types/ticketTypes';

export const seatSelectionService = {
  // Get seat layout for an event
  async getEventSeatLayout(eventId: number): Promise<SeatLayoutResponse> {
    console.log(`************* SEAT SELECTION SERVICE API CALL *************`);
    console.log(`Making API call to: ${api.defaults.baseURL}/seats/event/${eventId}/layout`);
    
    try {
      const response = await api.get<SeatLayoutResponse>(`/seats/event/${eventId}/layout`);
      
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
      const response = await api.get<PricingResponse>(`/events/${eventId}/pricing`);
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
      const response = await api.post('/seats/reserve', request);
      const data = response.data as { message: string; reservedUntil: string; seatNumber: string; price: number; };
      return data;
    } catch (error) {
      console.error('Error reserving seat:', error);
      throw error;
    }
  },

  // Release a reserved seat - CONSOLIDATED: Use seating-v2 service
  async releaseSeat(seatId: number, sessionId: string): Promise<{
    message: string;
  }> {
    // Delegate to the modern seating API service
    const result = await seatingAPIService.releaseSeat({
      SeatId: seatId,
      SessionId: sessionId
    });
    return { message: result.message };
  },

  // Get all seats for an event (fallback)
  async getSeats(eventId: number): Promise<Seat[]> {
    const response = await api.get<Seat[]>(`/seats/event/${eventId}`);
    return response.data;
  },

  // Tables functionality removed
  
  // Get ticket types for an event
  async getEventTicketTypes(eventId: number): Promise<TicketType[]> {
    try {
      const response = await api.get<TicketType[]>(`/TicketTypes/event/${eventId}`);
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
  },

  // Mark seats as booked (organizer only)
  async markSeatsAsBooked(request: MarkSeatsBookedRequest): Promise<{
    message: string;
    markedSeats: number;
    seatNumbers: string[];
  }> {
    try {
      console.log('Marking seats as booked:', request);
      const response = await api.post<{
        message: string;
        markedSeats: number;
        seatNumbers: string[];
      }>('/seats/mark-booked', request);
      console.log('Seats marked as booked successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error marking seats as booked:', error);
      throw error;
    }
  }
};
