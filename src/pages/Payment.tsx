import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createCheckoutSession } from '../services/checkoutService';
import { message, Button, Space } from 'antd';
import SEO from '../components/SEO';
import { useAuth } from '../hooks/useAuth';
import { reservationService, TicketReservationRequest } from '../services/reservationService';

interface PaymentLocationState {
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

  // Check if we have the required payment state
  useEffect(() => {
    if (!location.state || !('amount' in location.state)) {
      navigate('/');
    }
  }, [location.state, navigate]);

  if (!location.state) {
    return null;
  }

  const { amount, eventTitle, eventId, ticketDetails, selectedFoods } = location.state as PaymentLocationState;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        unitPrice: food.price / food.quantity, // Convert total price back to unit price
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

                {/* Food Summary */}
                {selectedFoods && selectedFoods.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">Food Items</h4>
                    {selectedFoods.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium text-gray-800 border-t pt-2">
                      <span>Food Total:</span>
                      <span>${selectedFoods.reduce((total, item) => total + item.price, 0).toFixed(2)}</span>
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
