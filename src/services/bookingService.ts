import { api } from './api';

// Booking DTOs matching backend structure
export interface BookingListDTO {
  id: number;
  eventId: number;
  eventTitle: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  processingFee: number;
  currency: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  itemCount: number;
  ticketCount: number;
  foodCount: number;
}

export interface BookingLineItemDTO {
  id: number;
  itemType: string;
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  seatDetails: string;
  itemDetails: string;
  qrCode: string;
  status: string;
  createdAt: string;
}

export interface BookingDetailDTO {
  id: number;
  eventId: number;
  eventTitle: string;
  eventDate?: string;
  eventLocation: string;
  organizerName?: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerMobile: string;
  totalAmount: number;
  processingFee: number;
  currency: string;
  paymentIntentId: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  metadata: string;
  lineItems: BookingLineItemDTO[];
}

export interface CreateBookingRequest {
  eventId: number;
  totalAmount: number;
  lineItems: Array<{
    type: 'Ticket' | 'Seat' | 'Food';
    ticketTypeId?: number;
    seatId?: number | null;
    foodItemId?: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    description: string;
  }>;
}

export interface UpdateBookingStatusRequest {
  status: string;
}

export interface RefundRequest {
  reason: string;
  amount?: number;
}

export interface BookingFilters {
  eventId?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Service for managing bookings using the new BookingLineItems architecture
 */
export class BookingService {
  
  /**
   * Create a new booking
   */
  static async createBooking(request: CreateBookingRequest): Promise<BookingDetailDTO> {
    const response = await api.post<BookingDetailDTO>('/bookings', request);
    return response.data;
  }
  
  /**
   * Get current user's bookings
   */
  static async getMyBookings(): Promise<BookingListDTO[]> {
    const response = await api.get<BookingListDTO[]>('/bookings/my-bookings');
    return response.data;
  }

  /**
   * Get specific booking details by ID
   */
  static async getBooking(id: number): Promise<BookingDetailDTO> {
    const response = await api.get<BookingDetailDTO>(`/bookings/${id}`);
    return response.data;
  }

  /**
   * Format booking data for display
   */
  static formatBookingForDisplay(booking: BookingDetailDTO): {
    basic: {
      id: number;
      eventTitle: string;
      customerName: string;
      totalAmount: string;
      status: string;
      createdAt: string;
    };
    tickets: Array<{
      name: string;
      quantity: number;
      unitPrice: string;
      totalPrice: string;
      details?: any;
    }>;
    food: Array<{
      name: string;
      quantity: number;
      unitPrice: string;
      totalPrice: string;
    }>;
    metadata: any;
  } {
    const tickets = booking.lineItems
      .filter(item => item.itemType === 'Ticket')
      .map(item => ({
        name: item.itemName,
        quantity: item.quantity,
        unitPrice: `$${item.unitPrice.toFixed(2)}`,
        totalPrice: `$${item.totalPrice.toFixed(2)}`,
        details: this.parseLineItemDetails(item.itemDetails)
      }));

    const food = booking.lineItems
      .filter(item => item.itemType === 'Food')
      .map(item => ({
        name: item.itemName,
        quantity: item.quantity,
        unitPrice: `$${item.unitPrice.toFixed(2)}`,
        totalPrice: `$${item.totalPrice.toFixed(2)}`
      }));

    return {
      basic: {
        id: booking.id,
        eventTitle: booking.eventTitle,
        customerName: `${booking.customerFirstName} ${booking.customerLastName}`.trim(),
        totalAmount: `$${booking.totalAmount.toFixed(2)}`,
        status: booking.status,
        createdAt: new Date(booking.createdAt).toLocaleString()
      },
      tickets,
      food,
      metadata: this.parseBookingMetadata(booking.metadata)
    };
  }

  /**
   * Parse booking metadata from JSON string
   */
  static parseBookingMetadata(metadata: string): any {
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  }

  /**
   * Parse line item details from JSON string
   */
  private static parseLineItemDetails(itemDetails: string): any {
    try {
      return JSON.parse(itemDetails);
    } catch {
      return {};
    }
  }
}

export default BookingService;
