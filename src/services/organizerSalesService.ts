import { api } from './api';

export interface TicketTypeSales {
  ticketTypeId: number;
  ticketTypeName: string;
  ticketPrice: number;
  ticketsSold: number;
  grossRevenue: number;
  netRevenue: number;
}

export interface EventSalesSummary {
  eventId: number;
  eventTitle: string;
  eventDate: Date | null;
  status: string;
  totalTicketsSold: number;
  totalNetRevenue: number;
  ticketSales: TicketTypeSales[];
}

export interface OrganizerDashboardSummary {
  totalEvents: number;
  totalTicketsSold: number;
  totalNetRevenue: number;
  events: EventSalesSummary[];
}

export interface EventSalesDetail {
  eventId: number;
  eventTitle: string;
  eventDate: Date | null;
  eventLocation: string;
  status: string;
  totalCapacity: number;
  totalTicketsSold: number;
  totalGrossRevenue: number;
  totalProcessingFees: number;
  totalNetRevenue: number;
  ticketSales: TicketTypeSales[];
}

class OrganizerSalesService {
  /**
   * Get dashboard summary for the authenticated organizer
   */
  async getDashboardSummary(): Promise<OrganizerDashboardSummary> {
    const response = await api.get('/organizer/dashboard/summary');
    
    // Convert date strings to Date objects
    const data = response.data as OrganizerDashboardSummary;
    data.events = data.events.map((event) => ({
      ...event,
      eventDate: event.eventDate ? new Date(event.eventDate) : null
    }));
    
    return data;
  }

  /**
   * Get detailed sales information for a specific event
   */
  async getEventSalesDetail(eventId: number): Promise<EventSalesDetail> {
    const response = await api.get(`/organizer/events/${eventId}/sales-detail`);
    
    // Convert date strings to Date objects
    const data = response.data as EventSalesDetail;
    data.eventDate = data.eventDate ? new Date(data.eventDate) : null;
    
    return data;
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | null): string {
    if (!date) return 'TBA';
    
    return new Intl.DateTimeFormat('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Format event status for display
   */
  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

export const organizerSalesService = new OrganizerSalesService();
