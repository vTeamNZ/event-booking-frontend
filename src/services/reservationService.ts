import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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

class ReservationService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async holdSeats(seats: SeatHoldRequest[]): Promise<{ message: string; expiresAt: string }> {
    const response = await axios.post(
      `${API_BASE_URL}/reservations/hold`,
      seats,
      { headers: this.getAuthHeader() }
    );
    return response.data as { message: string; expiresAt: string };
  }

  async releaseSeats(seats: SeatHoldRequest[]): Promise<{ message: string }> {
    const response = await axios.post(
      `${API_BASE_URL}/reservations/release`,
      seats,
      { headers: this.getAuthHeader() }
    );
    return response.data as { message: string };
  }

  async getReservationStatus(eventId: number): Promise<ReservationStatus[]> {
    const response = await axios.get(
      `${API_BASE_URL}/reservations/event/${eventId}/status`,
      { headers: this.getAuthHeader() }
    );
    return response.data as ReservationStatus[];
  }

  async createReservation(reservation: {
    eventId: number;
    row: string;
    number: number;
    includeFood?: boolean;
  }): Promise<any> {
    const response = await axios.post(
      `${API_BASE_URL}/reservations`,
      reservation,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }
}

export const reservationService = new ReservationService();
