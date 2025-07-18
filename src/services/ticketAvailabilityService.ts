import config from '../config/api';

export interface TicketAvailabilityInfo {
  ticketTypeId: number;
  available: number;  // -1 means unlimited
  sold: number;
  hasLimit: boolean;
}

export interface TicketAvailabilityCheckResult {
  ticketTypeId: number;
  requestedQuantity: number;
  isAvailable: boolean;
  availableQuantity: number;  // -1 means unlimited
  hasLimit: boolean;
}

class TicketAvailabilityService {
  private baseUrl = `${config.apiBaseUrl}/TicketAvailability`;

  async getEventTicketAvailability(eventId: number): Promise<Record<number, TicketAvailabilityInfo>> {
    try {
      const response = await fetch(`${this.baseUrl}/event/${eventId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch event ticket availability:', error);
      throw error;
    }
  }

  async getTicketTypeAvailability(ticketTypeId: number): Promise<TicketAvailabilityInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/ticket-type/${ticketTypeId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch ticket type availability:', error);
      throw error;
    }
  }

  async checkTicketAvailability(ticketTypeId: number, quantity: number): Promise<TicketAvailabilityCheckResult> {
    try {
      const response = await fetch(`${this.baseUrl}/ticket-type/${ticketTypeId}/check/${quantity}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to check ticket availability:', error);
      throw error;
    }
  }
}

export const ticketAvailabilityService = new TicketAvailabilityService();
