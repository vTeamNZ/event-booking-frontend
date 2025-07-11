import { api } from './api';

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
  private readonly QR_API_BASE_URL = process.env.REACT_APP_QR_API_BASE_URL || 'http://localhost:5075';

  async generateETicket(request: QRCodeGenerationRequest): Promise<QRCodeGenerationResponse> {
    try {
      // Make request directly to QR Code Generator API
      const response = await fetch(`${this.QR_API_BASE_URL}/api/etickets/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`QR Code generation failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data as QRCodeGenerationResponse;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
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
