import { api } from './api';

export interface ToggleSeatAvailabilityResponse {
  message: string;
  seatId: number;
  newStatus: string;
  statusValue: number;
}

export const adminSeatService = {
  /**
   * Toggle seat availability status between Available and Unavailable
   * Only admins can call this endpoint
   */
  toggleSeatAvailability: async (seatId: number): Promise<ToggleSeatAvailabilityResponse> => {
    const response = await api.put<ToggleSeatAvailabilityResponse>(
      `/api/Admin/seats/${seatId}/toggle-availability`
    );
    return response.data;
  }
};
