import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookingData } from '../types/booking';
import { useEventDetails } from '../contexts/BookingContext';
import SEO from '../components/SEO';
import EventHero from '../components/EventHero';
import TrustIndicators from '../components/TrustIndicators';
import BusinessInfo from '../components/BusinessInfo';

interface PaymentSummaryProps {}

const PaymentSummary: React.FC<PaymentSummaryProps> = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { fetchEventDetails, eventDetails } = useEventDetails();
  const bookingData = state as BookingData;

  // Fetch event details for organizer information
  useEffect(() => {
    if (bookingData?.eventId) {
      fetchEventDetails(bookingData.eventId);
    }
  }, [bookingData?.eventId, fetchEventDetails]);

  const formatPrice = (price: number | undefined): string => {
    if (typeof price !== 'number') return '0.00';
    return price.toFixed(2);
  };

  const calculateTicketSubtotal = (): number => {
    if (!bookingData) return 0;

    if (bookingData.bookingType === 'seats' && bookingData.selectedSeats) {
      return bookingData.selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
    }

    if (bookingData.bookingType === 'tickets' && bookingData.selectedTickets) {
      return bookingData.selectedTickets.reduce((sum, ticket) => 
        sum + (ticket.price * ticket.quantity), 0);
    }

    return 0;
  };

  const calculateFoodSubtotal = (): number => {
    if (!bookingData?.selectedFoodItems) return 0;
    
    return bookingData.selectedFoodItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
  };

  const handleProceedToPayment = () => {
    // Ensure we have valid booking data with required fields
    if (!bookingData || !bookingData.eventId || !bookingData.eventTitle) {
      console.error('Missing required booking data', bookingData);
      return;
    }

    // Check if we have either seats or tickets selected
    const hasTickets = bookingData.bookingType === 'tickets' && 
                      bookingData.selectedTickets && 
                      bookingData.selectedTickets.length > 0;
    
    const hasSeats = bookingData.bookingType === 'seats' && 
                    bookingData.selectedSeats && 
                    bookingData.selectedSeats.length > 0;
    
    if (!hasTickets && !hasSeats) {
      console.error('No tickets or seats selected', bookingData);
      return;
    }

    // Navigate to payment page
    navigate('/payment', {
      state: {
        ...bookingData,
        totalAmount: grandTotal // Ensure total amount is up-to-date
      }
    });
  };

  if (!bookingData) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <p>No booking data found. Please start over.</p>
          <button
            onClick={() => navigate('/events')}
            className="mt-4 px-6 py-2 bg-primary text-black rounded-lg hover:bg-primary-dark"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const ticketSubtotal = calculateTicketSubtotal();
  const foodSubtotal = calculateFoodSubtotal();
  const grandTotal = ticketSubtotal + foodSubtotal;

  return (
    <>
      <SEO 
        title={`Payment Summary - ${bookingData.eventTitle}`}
        description="Review your booking details before completing payment."
        keywords={['payment summary', 'booking review', 'event tickets']}
      />
      <div className="min-h-screen bg-gray-900">
        {/* Event Hero Section - Prioritize fresh data over cached context */}
        <EventHero 
          title={bookingData.eventTitle}
          imageUrl={(bookingData as any).imageUrl || eventDetails?.imageUrl}
          description="Review your order"
          organizationName={eventDetails?.organizationName}
          className="mb-8"
        />

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Order Summary</h1>
            <p className="text-gray-400">Review your booking details before payment</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Order Details Panel */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                
                {/* Ticket/Seat Details */}
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {bookingData.bookingType === 'seats' ? 'Selected Seats' : 'Selected Tickets'}
                  </h3>
                  
                  {bookingData.bookingType === 'seats' && bookingData.selectedSeats && (
                    <div className="space-y-3">
                      {bookingData.selectedSeats.map((seat, index) => (
                        <div key={index} className="flex justify-between items-center py-3 px-4 bg-gray-750 rounded-lg">
                          <span className="text-gray-300">Seat {seat.row}{seat.number}</span>
                          <span className="text-primary font-semibold">${formatPrice(seat.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {bookingData.bookingType === 'tickets' && bookingData.selectedTickets && (
                    <div className="space-y-3">
                      {bookingData.selectedTickets.map((ticket, index) => (
                        <div key={index} className="p-4 bg-gray-750 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-white font-medium">{ticket.name}</div>
                              <div className="text-gray-400 text-sm">
                                {ticket.quantity} × ${formatPrice(ticket.price)}
                              </div>
                            </div>
                            <span className="text-primary font-semibold">${formatPrice(ticket.price * ticket.quantity)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Food Items */}
                {bookingData.selectedFoodItems && bookingData.selectedFoodItems.length > 0 && (
                  <div className="p-6 border-b border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4">Food & Beverages</h3>
                    <div className="space-y-3">
                      {bookingData.selectedFoodItems.map((item, index) => (
                        <div key={index} className="p-4 bg-gray-750 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-white font-medium">{item.name}</div>
                              <div className="text-gray-400 text-sm">
                                {item.quantity} × ${formatPrice(item.price)}
                              </div>
                            </div>
                            <span className="text-primary font-semibold">${formatPrice(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary Panel */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden sticky top-4">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-xl font-semibold text-white">Payment Summary</h3>
                </div>

                <div className="p-6">
                  {/* Price Breakdown */}
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-400">
                      <span>
                        {bookingData.bookingType === 'seats' ? 'Seats' : 'Tickets'}
                      </span>
                      <span>${formatPrice(ticketSubtotal)}</span>
                    </div>
                    
                    {bookingData.selectedFoodItems && bookingData.selectedFoodItems.length > 0 && (
                      <div className="flex justify-between text-gray-400">
                        <span>Food & Beverages</span>
                        <span>${formatPrice(foodSubtotal)}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-600 pt-4">
                      <div className="flex justify-between text-2xl font-bold text-white">
                        <span>Total</span>
                        <span className="text-primary">${formatPrice(grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <TrustIndicators variant="checkout" className="mt-6" />

                  {/* Business Information */}
                  <BusinessInfo variant="compact" className="mt-6" />

                  {/* Action Buttons */}
                  <div className="mt-8 space-y-3">
                    <button
                      onClick={handleProceedToPayment}
                      className="w-full bg-primary hover:bg-primary-dark text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                      Proceed to Payment
                    </button>
                    
                    <button
                      onClick={() => navigate(-1)}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSummary;
