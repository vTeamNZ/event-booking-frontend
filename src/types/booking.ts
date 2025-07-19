export interface BookingData {
  eventId: number;
  eventTitle: string;
  bookingType: 'seats' | 'tickets';
  totalAmount: number;
  imageUrl?: string;
  // Event details for consistent display across pages
  eventDetails?: {
    description?: string;
    date?: string;
    location?: string;
    imageUrl?: string;
    organizerName?: string;
    organizationName?: string;
  };
  selectedSeats?: Array<{
    row: string;
    number: number;
    price: number;
    ticketTypeId: number;
    seatNumber: string;
  }>;
  selectedTickets?: Array<{
    ticketTypeId: number;
    quantity: number;
    price: number;
    name: string;
    type: string;
  }>;
  selectedFoodItems?: Array<{
    foodItemId: number;
    quantity: number;
    price: number;
    name: string;
    totalPrice?: number;
    seatTicketId?: string; // NEW: Associate with specific seat/ticket
    seatTicketType?: 'seat' | 'ticket'; // NEW: Type of association
  }>;
}

export interface FoodItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  eventId: number;
}

export interface TicketType {
  id: number;
  type: string;
  name: string;
  price: number;
  description?: string;
  color: string;
  eventId: number;
  seatRowAssignments?: string;
}
