import React, { createContext, useContext, useReducer } from 'react';
import { BookingData } from '../types/booking';

interface BookingState {
  bookingData: BookingData | null;
  loading: boolean;
  error: string | null;
}

type BookingAction =
  | { type: 'SET_BOOKING_DATA'; payload: BookingData }
  | { type: 'UPDATE_SEATS'; payload: BookingData['selectedSeats'] }
  | { type: 'UPDATE_TICKETS'; payload: BookingData['selectedTickets'] }
  | { type: 'UPDATE_FOOD_ITEMS'; payload: BookingData['selectedFoodItems'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

const BookingContext = createContext<{
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
} | null>(null);

const calculateTotal = (bookingData: BookingData): number => {
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
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialState: BookingState = {
    bookingData: null,
    loading: false,
    error: null,
  };

  const reducer = (state: BookingState, action: BookingAction): BookingState => {
    switch (action.type) {
      case 'SET_BOOKING_DATA':
        return {
          ...state,
          bookingData: action.payload,
          error: null,
        };
      case 'UPDATE_SEATS':
        return {
          ...state,
          bookingData: state.bookingData ? {
            ...state.bookingData,
            selectedSeats: action.payload,
            totalAmount: calculateTotal({
              ...state.bookingData,
              selectedSeats: action.payload,
            }),
          } : null,
        };
      case 'UPDATE_TICKETS':
        return {
          ...state,
          bookingData: state.bookingData ? {
            ...state.bookingData,
            selectedTickets: action.payload,
            totalAmount: calculateTotal({
              ...state.bookingData,
              selectedTickets: action.payload,
            }),
          } : null,
        };
      case 'UPDATE_FOOD_ITEMS':
        return {
          ...state,
          bookingData: state.bookingData ? {
            ...state.bookingData,
            selectedFoodItems: action.payload,
            totalAmount: calculateTotal({
              ...state.bookingData,
              selectedFoodItems: action.payload,
            }),
          } : null,
        };
      case 'SET_LOADING':
        return {
          ...state,
          loading: action.payload,
        };
      case 'SET_ERROR':
        return {
          ...state,
          error: action.payload,
        };
      case 'RESET':
        return initialState;
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
