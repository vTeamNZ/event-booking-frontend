import { useState } from 'react';
import { useBooking } from '../contexts/BookingContext';
import { BookingData } from '../types/booking';

export const useBookingFlow = (eventId: number) => {
  const { state, dispatch } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);

  const initializeBooking = async (
    eventId: number,
    eventTitle: string,
    bookingType: BookingData['bookingType']
  ) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      dispatch({
        type: 'SET_BOOKING_DATA',
        payload: {
          eventId,
          eventTitle,
          bookingType,
          totalAmount: 0,
        },
      });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Failed to initialize booking' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateSeats = (seats: BookingData['selectedSeats']) => {
    dispatch({ type: 'UPDATE_SEATS', payload: seats });
  };

  const updateTickets = (tickets: BookingData['selectedTickets']) => {
    dispatch({ type: 'UPDATE_TICKETS', payload: tickets });
  };

  const updateFoodItems = (foodItems: BookingData['selectedFoodItems']) => {
    dispatch({ type: 'UPDATE_FOOD_ITEMS', payload: foodItems });
  };

  const submitBooking = async () => {
    if (!state.bookingData) return;
    
    setIsProcessing(true);
    try {
      // API call to create booking would go here
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state.bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Failed to submit booking' 
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number | undefined): string => {
    if (typeof price !== 'number') return '0.00';
    return price.toFixed(2);
  };

  const calculateTicketTotal = (): number => {
    if (!state.bookingData) return 0;

    if (state.bookingData.bookingType === 'seats' && state.bookingData.selectedSeats) {
      return state.bookingData.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    }

    if (state.bookingData.bookingType === 'tickets' && state.bookingData.selectedTickets) {
      return state.bookingData.selectedTickets.reduce((sum, ticket) => 
        sum + (ticket.price * ticket.quantity), 0);
    }

    return 0;
  };

  const calculateFoodTotal = (): number => {
    if (!state.bookingData?.selectedFoodItems) return 0;
    
    return state.bookingData.selectedFoodItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
  };

  return {
    bookingData: state.bookingData,
    loading: state.loading,
    error: state.error,
    isProcessing,
    initializeBooking,
    updateSeats,
    updateTickets,
    updateFoodItems,
    submitBooking,
    formatPrice,
    calculateTicketTotal,
    calculateFoodTotal,
  };
};
