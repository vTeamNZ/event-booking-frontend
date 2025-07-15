import { NavigateFunction } from 'react-router-dom';
import { BookingData } from '../types/booking';

export class BookingNavigator {
  private static validateBookingData(bookingData: BookingData): boolean {
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

  public static toFoodSelection(navigate: NavigateFunction, bookingData: BookingData, legacyState?: any) {
    if (!this.validateBookingData(bookingData)) {
      console.error('Invalid booking data:', bookingData);
      navigate('/');
      return;
    }

    navigate('/food-selection', {
      state: {
        ...bookingData,
        ...(legacyState || {})
      }
    });
  }

  public static toPaymentSummary(navigate: NavigateFunction, bookingData: BookingData) {
    if (!this.validateBookingData(bookingData)) {
      console.error('Invalid booking data:', bookingData);
      navigate('/');
      return;
    }

    navigate('/payment-summary', {
      state: bookingData
    });
  }

  public static toStripeCheckout(navigate: NavigateFunction, bookingData: BookingData) {
    if (!this.validateBookingData(bookingData)) {
      console.error('Invalid booking data:', bookingData);
      navigate('/');
      return;
    }

    navigate('/checkout', {
      state: bookingData
    });
  }

  public static backToEvent(navigate: NavigateFunction) {
    navigate('/');
  }
}
