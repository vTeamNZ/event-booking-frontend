import { api } from './api';

export interface TicketTypeSales {
  ticketTypeId: number;
  ticketTypeName: string;
  ticketPrice: number;
  ticketsSold: number;
  grossRevenue: number;
  netRevenue: number;
}

export interface DailyAnalytics {
  date: Date;
  paidTickets: number;
  organizerTickets: number;
  totalAttendance: number;
  totalRevenue: number;
}

export interface TicketTypeDetail {
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  seatInfo: string;
}

export interface BookingDetailView {
  bookingId: number;
  paymentId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  bookedTime: Date;
  paymentStatus: string;
  totalAmount: number;
  totalTickets: number;
  ticketDetails: TicketTypeDetail[];
  isPaid: boolean;
  isOrganizerBooking: boolean;
}

export interface TicketTypeBreakdown {
  ticketTypeId: number;
  ticketTypeName: string;
  ticketPrice: number;
  paidTickets: number;
  organizerTickets: number;
  totalTickets: number;
  paidRevenue: number;
  totalRevenue: number;
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
   * Get the current organizer ID from the authenticated user
   */
  private async getCurrentOrganizerId(): Promise<number> {
    const userResponse = await api.get('/auth/me');
    const userData = userResponse.data as any;
    
    if (!userData.organizer || !userData.organizer.id) {
      throw new Error('No organizer profile found. Please complete your organizer registration.');
    }
    
    return userData.organizer.id;
  }

  /**
   * Get detailed sales information for a specific event
   */
  async getEventSalesDetail(eventId: number): Promise<EventSalesDetail> {
    try {
      const response = await api.get(`/organizer/events/${eventId}/sales-detail`);
      const data = response.data as any;
      
      return {
        eventId: data.eventId || data.EventId || eventId,
        eventTitle: data.eventTitle || data.EventTitle || 'Unknown Event',
        eventDate: data.eventDate || data.EventDate ? new Date(data.eventDate || data.EventDate) : null,
        eventLocation: data.eventLocation || data.EventLocation || 'TBA',
        status: data.status || data.Status || 'Unknown',
        totalCapacity: data.totalCapacity || data.TotalCapacity || 0,
        totalTicketsSold: data.totalTicketsSold || data.TotalTicketsSold || 0,
        totalGrossRevenue: data.totalGrossRevenue || data.TotalGrossRevenue || 0,
        totalProcessingFees: data.totalProcessingFees || data.TotalProcessingFees || 0,
        totalNetRevenue: data.totalNetRevenue || data.TotalNetRevenue || 0,
        ticketSales: (data.ticketSales || data.TicketSales || []).map((ts: any) => ({
          ticketTypeId: ts.ticketTypeId || ts.TicketTypeId || 0,
          ticketTypeName: ts.ticketTypeName || ts.TicketTypeName || 'Unknown',
          ticketPrice: ts.ticketPrice || ts.TicketPrice || 0,
          ticketsSold: ts.ticketsSold || ts.TicketsSold || 0,
          grossRevenue: ts.grossRevenue || ts.GrossRevenue || 0,
          netRevenue: ts.netRevenue || ts.NetRevenue || 0
        }))
      };
    } catch (error) {
      console.error(`Failed to fetch sales detail for event ${eventId}:`, error);
      // Return a structure with zeros if the API call fails
      return {
        eventId: eventId,
        eventTitle: 'Event Details Not Available',
        eventDate: null,
        eventLocation: 'TBA',
        status: 'Unknown',
        totalCapacity: 0,
        totalTicketsSold: 0,
        totalGrossRevenue: 0,
        totalProcessingFees: 0,
        totalNetRevenue: 0,
        ticketSales: []
      };
    }
  }

  /**
   * Get daily analytics for a specific event
   */
  async getDailyAnalytics(eventId: number, days: number = 30): Promise<DailyAnalytics[]> {
    // Use event-specific endpoint when eventId is provided
    const response = await api.get(`/organizer/events/${eventId}/daily-analytics?days=${days}`);
    
    // Transform the response from OrganizerSalesController format to expected format
    const data = response.data as any[];
    
    return data.map((item: any) => ({
      date: new Date(item.Date || item.date),
      paidTickets: item.PaidTickets || item.paidTickets || 0,
      organizerTickets: item.OrganizerTickets || item.organizerTickets || 0,
      totalAttendance: item.TotalAttendance || item.totalAttendance || 0,
      totalRevenue: item.TotalRevenue || item.totalRevenue || 0
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Get detailed booking information for a specific event
   */
  async getEventBookings(
    eventId: number, 
    page: number = 1, 
    pageSize: number = 50,
    search?: string,
    paymentStatus?: string
  ): Promise<{ bookings: BookingDetailView[], totalCount: number, page: number, pageSize: number }> {
    if (!eventId) {
      return {
        bookings: [],
        totalCount: 0,
        page: page,
        pageSize: pageSize
      };
    }
    
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    
    if (search) params.append('search', search);
    if (paymentStatus) params.append('paymentStatus', paymentStatus);
    
    const response = await api.get(`/organizer/events/${eventId}/bookings?${params}`);
    
    // Transform the response from OrganizerSalesController format to expected format
    const data = response.data as any[];
    
    const processedBookings: BookingDetailView[] = data.map((booking: any) => ({
      bookingId: booking.BookingId || booking.bookingId,
      paymentId: booking.PaymentId || booking.paymentId || 'N/A',
      firstName: booking.FirstName || booking.firstName || '',
      lastName: booking.LastName || booking.lastName || '',
      email: booking.Email || booking.email || '',
      mobile: booking.Mobile || booking.mobile || '',
      bookedTime: new Date(booking.BookedTime || booking.bookedTime),
      paymentStatus: booking.PaymentStatus || booking.paymentStatus || '',
      totalAmount: booking.TotalAmount || booking.totalAmount || 0,
      totalTickets: booking.TotalTickets || booking.totalTickets || 0,
      ticketDetails: (booking.TicketDetails || booking.ticketDetails || []).map((td: any) => ({
        ticketTypeName: td.TicketTypeName || td.ticketTypeName || '',
        quantity: td.Quantity || td.quantity || 0,
        unitPrice: td.UnitPrice || td.unitPrice || 0,
        seatInfo: td.SeatInfo || td.seatInfo || 'General'
      })),
      isPaid: booking.IsPaid || booking.isPaid || false,
      isOrganizerBooking: booking.IsOrganizerBooking || booking.isOrganizerBooking || false
    }));
    
    // Get totalCount from response headers or fallback to array length
    const totalCount = parseInt(response.headers['x-total-count'] || '0') || processedBookings.length;
    
    return {
      bookings: processedBookings,
      totalCount: totalCount,
      page: page,
      pageSize: pageSize
    };
  }

  /**
   * Get comprehensive ticket breakdown for an event (includes both paid and organizer tickets)
   */
  async getEventTicketBreakdown(eventId: number): Promise<TicketTypeBreakdown[]> {
    if (!eventId) {
      return [];
    }
    
    const response = await api.get(`/organizer/events/${eventId}/ticket-breakdown`);
    const data = response.data as any[];
    
    // Transform the response to expected format
    return data.map((breakdown: any) => ({
      ticketTypeId: breakdown.TicketTypeId || breakdown.ticketTypeId,
      ticketTypeName: breakdown.TicketTypeName || breakdown.ticketTypeName || '',
      ticketPrice: breakdown.TicketPrice || breakdown.ticketPrice || 0,
      paidTickets: breakdown.PaidTickets || breakdown.paidTickets || 0,
      organizerTickets: breakdown.OrganizerTickets || breakdown.organizerTickets || 0,
      totalTickets: breakdown.TotalTickets || breakdown.totalTickets || 0,
      paidRevenue: breakdown.PaidRevenue || breakdown.paidRevenue || 0,
      totalRevenue: breakdown.TotalRevenue || breakdown.totalRevenue || 0
    }));
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
