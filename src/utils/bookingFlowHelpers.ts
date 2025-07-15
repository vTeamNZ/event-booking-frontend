import { NavigateFunction } from 'react-router-dom';
import { BookingData } from '../types/booking';

export class BookingFlowHelper {
  private navigate: NavigateFunction;

  constructor(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  // Navigate from event page to seat/ticket selection
  static toSeatSelection(
    navigate: NavigateFunction,
    eventId: number,
    eventTitle: string
  ) {
    navigate(`/events/${eventId}/seats`, {
      state: {
        eventId,
        eventTitle,
        bookingType: 'seats'
      }
    });
  }

  static toTicketSelection(
    navigate: NavigateFunction,
    eventId: number,
    eventTitle: string
  ) {
    navigate(`/events/${eventId}/tickets`, {
      state: {
        eventId,
        eventTitle,
        bookingType: 'tickets'
      }
    });
  }

  // Navigate from seat selection to food selection
  static fromSeatsToFood(
    navigate: NavigateFunction,
    bookingData: BookingData
  ) {
    navigate('/food-selection', {
      state: bookingData
    });
  }

  // Navigate from ticket selection to food selection
  static fromTicketsToFood(
    navigate: NavigateFunction,
    bookingData: BookingData
  ) {
    navigate('/food-selection', {
      state: bookingData
    });
  }

  // Navigate from food selection to payment summary
  static toPaymentSummary(
    navigate: NavigateFunction,
    bookingData: BookingData
  ) {
    navigate('/payment-summary', {
      state: bookingData
    });
  }

  // Navigate to Stripe checkout
  static toStripeCheckout(
    navigate: NavigateFunction,
    bookingData: BookingData
  ) {
    navigate('/checkout', {
      state: bookingData
    });
  }

  // Validate booking data has required fields
  static validateBookingData(bookingData: BookingData): boolean {
    if (!bookingData.eventId || !bookingData.eventTitle) {
      return false;
    }

    if (bookingData.bookingType === 'seats') {
      return !!(bookingData.selectedSeats && bookingData.selectedSeats.length > 0);
    }

    if (bookingData.bookingType === 'tickets') {
      return !!(bookingData.selectedTickets && bookingData.selectedTickets.length > 0);
    }

    return false;
  }

  // Calculate totals
  static calculateTotal(bookingData: BookingData): number {
    let total = 0;

    // Calculate seats total
    if (bookingData.selectedSeats) {
      total += bookingData.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    }

    // Calculate tickets total
    if (bookingData.selectedTickets) {
      total += bookingData.selectedTickets.reduce((sum, ticket) => 
        sum + (ticket.price * ticket.quantity), 0);
    }

    // Calculate food items total
    if (bookingData.selectedFoodItems) {
      total += bookingData.selectedFoodItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0);
    }

    return total;
  }

  // Format price for display
  static formatPrice(price: number | undefined): string {
    if (typeof price !== 'number') return '0.00';
    return price.toFixed(2);
  }
}

// Helper functions for legacy support
export const navigateToFoodSelection = (
  navigate: NavigateFunction,
  eventId: number,
  eventTitle: string,
  ticketPrice: number,
  ticketDetails: Array<{
    type: string;
    quantity: number;
    price: number;
    unitPrice: number;
  }>
) => {
  navigate('/food-selection', {
    state: {
      eventId,
      eventTitle,
      ticketPrice,
      ticketDetails
    }
  });
};

export const navigateToPayment = (
  navigate: NavigateFunction,
  amount: number,
  eventId: number,
  eventTitle: string,
  ticketDetails: any[],
  selectedFoods: any[]
) => {
  navigate('/payment', {
    state: {
      amount,
      eventId,
      eventTitle,
      ticketDetails,
      selectedFoods
    }
  });
};
