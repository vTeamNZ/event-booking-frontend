import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createCheckoutSession } from '../services/checkoutService';
import { message, Button, Space } from 'antd';
import SEO from '../components/SEO';
import { useAuth } from '../hooks/useAuth';
import { reservationService, TicketReservationRequest } from '../services/reservationService';
import { BookingData } from '../types/booking';

interface LegacyPaymentLocationState {
  amount: number;
  eventTitle: string;
  eventId: number;
  ticketDetails: Array<{
    type: string;
    quantity: number;
    price: number;
  }>;
  selectedFoods?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string | null;
}

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isOrganizer } = useAuth();

  // Extract state - handle both new BookingData and legacy format
  const state = location.state as (BookingData | LegacyPaymentLocationState) | null;
  
  // Check if it's the new format (BookingData)
  const isNewFormat = state && ('bookingType' in state);
  
  let amount: number, eventTitle: string, eventId: number | undefined, ticketDetails: any[], selectedFoods: any[];
  
  if (isNewFormat) {
    const bookingData = state as BookingData;
    amount = bookingData.totalAmount ?? 0;
    eventTitle = bookingData.eventTitle ?? '';
    eventId = bookingData.eventId;
    
    // For ticket-type bookings
    if (bookingData.bookingType === 'tickets' && bookingData.selectedTickets) {
      // Convert new format to legacy format for display
      ticketDetails = bookingData.selectedTickets.map(ticket => ({
        type: ticket.name || ticket.type,
        quantity: ticket.quantity,
        price: ticket.price,
      }));
    }
    // For seat-based bookings
    else if (bookingData.bookingType === 'seats' && bookingData.selectedSeats) {
      // Group seats by ticket type for better display
      const seatsByTicketType = bookingData.selectedSeats.reduce((acc, seat) => {
        const typeKey = seat.ticketTypeId.toString();
        if (!acc[typeKey]) {
          acc[typeKey] = {
            ticketTypeId: seat.ticketTypeId,
            count: 0,
            totalPrice: 0,
            seatNumbers: []
          };
        }
        acc[typeKey].count++;
        acc[typeKey].totalPrice += seat.price;
        acc[typeKey].seatNumbers.push(`${seat.row}${seat.number}`);
        return acc;
      }, {} as Record<string, { ticketTypeId: number, count: number, totalPrice: number, seatNumbers: string[] }>);
      
      // Convert grouped seats to ticket details
      ticketDetails = Object.values(seatsByTicketType).map(group => ({
        type: `Seat${group.count > 1 ? 's' : ''} (${group.seatNumbers.join(', ')})`,
        quantity: group.count,
        price: group.totalPrice,
      }));
    } else {
      ticketDetails = [];
    }
    
    selectedFoods = bookingData.selectedFoodItems?.map(food => ({
      name: food.name,
      quantity: food.quantity,
      price: food.price, // This is unit price, not the total price for this food item
    })) ?? [];
  } else {
    // Legacy format
    const legacyState = state as LegacyPaymentLocationState | null;
    amount = legacyState?.amount ?? 0;
    eventTitle = legacyState?.eventTitle ?? '';
    eventId = legacyState?.eventId;
    ticketDetails = legacyState?.ticketDetails ?? [];
    selectedFoods = legacyState?.selectedFoods ?? [];
  }

  // Check if we have the required payment state
  useEffect(() => {
    console.log('Payment page received state:', state);
    
    // More detailed validation
    if (!state) {
      console.error('Missing state completely');
      navigate('/');
      return;
    }

    if (!eventId) {
      console.error('Missing eventId in state:', state);
      navigate('/');
      return;
    }

    if (!eventTitle) {
      console.error('Missing eventTitle in state:', state);
      navigate('/');
      return;
    }

    // Check if it's BookingData format
    if (isNewFormat) {
      const bookingData = state as BookingData;
      console.log('BookingData format detected with type:', bookingData.bookingType);
      
      if (bookingData.bookingType === 'tickets' && 
          (!bookingData.selectedTickets || bookingData.selectedTickets.length === 0)) {
        console.error('BookingData format missing selectedTickets:', state);
        navigate('/');
        return;
      }
      
      if (bookingData.bookingType === 'seats' && 
          (!bookingData.selectedSeats || bookingData.selectedSeats.length === 0)) {
        console.error('BookingData format missing selectedSeats:', state);
        navigate('/');
        return;
      }
    } else {
      // Legacy format validation
      if (!ticketDetails || ticketDetails.length === 0) {
        console.error('Legacy format missing ticketDetails:', state);
        navigate('/');
        return;
      }
    }

    console.log('Payment state validation successful');
  }, [state, eventId, eventTitle, ticketDetails, isNewFormat, navigate]);

  // Don't render anything if we don't have valid state
  // We already have a useEffect that redirects if data is invalid
  // This serves as a fallback if the redirect hasn't happened yet
  if (!state || !eventId || !eventTitle) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Payment State</h2>
          <p className="text-gray-600 mb-6">
            We couldn't process your payment because some required information is missing.
            Please try again from the event booking page.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors"
          >
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!eventId) {
      setError('Missing event information');
      setLoading(false);
      return;
    }

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      const mobileValue = formData.get('mobile') as string;
      const customerDetails: CustomerDetails = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        mobile: mobileValue || null,
      };

      // Validate required fields
      if (!customerDetails.firstName || !customerDetails.lastName || !customerDetails.email) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Convert ticket details to the format expected by the API
      const ticketLineItems = ticketDetails.map(ticket => ({
        type: ticket.type,
        quantity: ticket.quantity,
        unitPrice: ticket.price / ticket.quantity, // Convert total price back to unit price
      }));

      // Convert food details to the format expected by the API
      const foodLineItems = selectedFoods?.map(food => ({
        name: food.name,
        quantity: food.quantity,
        unitPrice: food.price, // food.price is already the unit price
      })) || [];

      // Create checkout session
      const checkoutSession = await createCheckoutSession({
        eventId,
        eventTitle,
        email: customerDetails.email,
        firstName: customerDetails.firstName,
        lastName: customerDetails.lastName,
        mobile: customerDetails.mobile || undefined,
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancelled`,
        ticketDetails: ticketLineItems,
        foodDetails: foodLineItems,
      });

      // Redirect to Stripe Checkout
      window.location.href = checkoutSession.url;

    } catch (err: any) {
      console.error('Failed to create checkout session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const handleReserveTickets = async (customerDetails: CustomerDetails) => {
    if (!isAuthenticated || !isOrganizer()) {
      message.error('Only organizers can reserve tickets without payment');
      return;
    }

    if (!eventId) {
      setError('Missing event information');
      return;
    }
    
    setLoading(true);
    
    try {
      const reservationData: TicketReservationRequest = {
        eventId,
        userId: user!.id,
        ticketDetails,
        selectedFoods: selectedFoods || [],
        customerDetails: {
          firstName: customerDetails.firstName,
          lastName: customerDetails.lastName,
          email: customerDetails.email,
          mobile: customerDetails.mobile || undefined
        },
        totalAmount: amount
      };
      
      const result = await reservationService.reserveTickets(reservationData);
      
      if (result.success) {
        message.success('Tickets reserved successfully!');
        navigate(`/payment/success`, {
          state: {
            eventTitle,
            reservationId: result.reservationId,
            isReservation: true
          }
        });
      } else {
        setError('Failed to reserve tickets. Please try again.');
      }
    } catch (err) {
      console.error('Error reserving tickets:', err);
      setError('An error occurred while reserving tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title={`Payment - ${eventTitle}`}
        description="Pay Securely With Stripe. Complete your booking with our secure payment system. Get instant confirmation."
        keywords={['Pay Securely With Stripe', 'Instant Ticket Booking', 'Secure Event Payments']}
      />
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Payment Details</h1>
              <h2 className="text-xl text-gray-600 mb-8">{eventTitle}</h2>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-6 mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                
                {/* Tickets Summary */}
                {ticketDetails.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">Tickets</h4>
                    {ticketDetails.map((ticket, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{ticket.quantity}x {ticket.type} Ticket</span>
                        <span>${ticket.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium text-gray-800 border-t pt-2">
                      <span>Tickets Total:</span>
                      <span>${ticketDetails.reduce((total, item) => total + item.price, 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Food Summary */}
                {selectedFoods.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">Food Items</h4>
                    {selectedFoods.map((item, idx) => {
                      const itemTotal = item.quantity * item.price;
                      return (
                        <div key={idx} className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{item.quantity}x {item.name}</span>
                          <span>${itemTotal.toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between font-medium text-gray-800 border-t pt-2">
                      <span>Food Total:</span>
                      <span>${selectedFoods.reduce((total, item) => total + (item.quantity * item.price), 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Grand Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-primary">${amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Details Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                  <div className="mt-4">
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="border-t border-gray-200 pt-6">
                  {isAuthenticated && isOrganizer() ? (
                    <div className="flex flex-col space-y-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                        }`}
                      >
                        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)} with Stripe`}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          const formData = new FormData(document.querySelector('form') as HTMLFormElement);
                          const customerDetails = {
                            firstName: formData.get('firstName') as string,
                            lastName: formData.get('lastName') as string,
                            email: formData.get('email') as string,
                            mobile: formData.get('mobile') as string
                          };
                          handleReserveTickets(customerDetails);
                        }}
                        className="w-full flex justify-center py-3 px-4 border border-purple-500 rounded-md shadow-sm text-sm font-medium text-purple-500 bg-white hover:bg-purple-50"
                      >
                        {loading ? 'Processing...' : 'Reserve without Payment (Organizer Only)'}
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        As an organizer, you can reserve tickets without payment.
                      </p>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        loading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                      }`}
                    >
                      {loading ? 'Creating Checkout...' : `Pay $${amount.toFixed(2)} with Stripe`}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payment;
