import { api } from './api';

export interface SeatHoldRequest {
  eventId: number;
  row: string;
  number: number;
}

export interface ReservationStatus {
  seat: string;
  isReserved: boolean;
  isHeld: boolean;
  expiresAt?: string;
}

export interface TicketReservationRequest {
  eventId: number;
  userId: string;
  ticketDetails: Array<{
    type: string;
    quantity: number;
    price: number;
  }>;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
  };
  selectedFoods?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}

class ReservationService {
  async holdSeats(seats: SeatHoldRequest[]): Promise<{ message: string; expiresAt: string }> {
    const response = await api.post('/reservations/hold', seats);
    return response.data as { message: string; expiresAt: string };
  }

  async releaseSeats(seats: SeatHoldRequest[]): Promise<{ message: string }> {
    // CONSOLIDATED: This is reservation-specific, keep as-is for now
    // But consider if this can be merged with seatingAPIService in the future
    const response = await api.post('/reservations/release', seats);
    return response.data as { message: string };
  }

  async getReservationStatus(eventId: number): Promise<ReservationStatus[]> {
    const response = await api.get(`/reservations/event/${eventId}/status`);
    return response.data as ReservationStatus[];
  }

  async createReservation(reservation: {
    eventId: number;
    row: string;
    number: number;
    includeFood?: boolean;
  }): Promise<any> {
    const response = await api.post('/reservations', reservation);
    return response.data;
  }

  async reserveTickets(reservationData: TicketReservationRequest): Promise<{ success: boolean; reservationId: string }> {
    const response = await api.post('/reservations/reserve-tickets', reservationData);
    return response.data as { success: boolean; reservationId: string };
  }
}

export const reservationService = new ReservationService();
