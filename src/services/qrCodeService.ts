import { api } from './api';

export interface OrganizerTicketRequest {
  ticketTypeId: number;
  quantity: number;
  ticketTypeName?: string; // For display purposes
}

export interface OrganizerBookingRequest {
  eventId: number;
  firstName: string;
  lastName?: string;
  buyerEmail: string;
  mobile?: string;
  seatNumbers: string[];
  ticketRequests: OrganizerTicketRequest[]; // New required field to match backend
}

export interface OrganizerBookingResponse {
  bookingId: number;
  paymentGUID: string;
  message: string;
  eventName: string;
  seatNumbers: string[];
  ticketDetails: TicketDetail[];
}

export interface TicketDetail {
  seatNumber: string;
  ticketPath: string;
  lineItemId: number;
}

export interface QRCodeGenerationRequest {
  eventID: string;
  eventName: string;
  seatNo: string;
  firstName: string;
  paymentGUID: string;
  buyerEmail: string;
  organizerEmail: string;
}

export interface QRCodeGenerationResponse {
  message: string;
  localPath: string;
  bookingId: number;
  isDuplicate?: boolean;
}

class QRCodeService {
  async createOrganizerDirectBooking(request: OrganizerBookingRequest): Promise<OrganizerBookingResponse> {
    try {
      const response = await api.post('/Bookings/organizer-direct', request);
      return response.data as OrganizerBookingResponse;
    } catch (error) {
      console.error('Error creating organizer booking:', error);
      throw error;
    }
  }

  async generateETicket(request: QRCodeGenerationRequest): Promise<QRCodeGenerationResponse> {
    // This method is deprecated - use createOrganizerDirectBooking instead
    throw new Error('External QR API is no longer available. Use createOrganizerDirectBooking for organizer tickets.');
  }

  // Helper method to generate a random GUID
  generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const qrCodeService = new QRCodeService();
