import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookingData } from '../types/booking';
import SEO from '../components/SEO';
import EventHero from '../components/EventHero';

interface PaymentSummaryProps {}

const PaymentSummary: React.FC<PaymentSummaryProps> = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const bookingData = state as BookingData;

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
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      <div className="min-h-screen bg-gray-50">
        {/* Event Hero Section */}
        <div className="relative">
          <EventHero 
            title={bookingData.eventTitle}
            imageUrl={(bookingData as any).imageUrl}
            description="Review your order"
            className="h-[300px]"
          />
          
          {/* Back Button Overlay */}
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={() => navigate(-1)}
              className="text-white/80 hover:text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Ticket/Seat Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {bookingData.bookingType === 'seats' ? 'Selected Seats' : 'Selected Tickets'}
              </h3>
              
              {bookingData.bookingType === 'seats' && bookingData.selectedSeats && (
                <div className="space-y-2">
                  {bookingData.selectedSeats.map((seat, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span>Seat {seat.row}{seat.number}</span>
                      <span className="font-medium">${formatPrice(seat.price)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 font-medium">
                    <span>Seats Subtotal:</span>
                    <span>${formatPrice(ticketSubtotal)}</span>
                  </div>
                </div>
              )}

              {bookingData.bookingType === 'tickets' && bookingData.selectedTickets && (
                <div className="space-y-2">
                  {bookingData.selectedTickets.map((ticket, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <div className="font-medium">{ticket.name}</div>
                        <div className="text-sm text-gray-600">
                          {ticket.quantity} × ${formatPrice(ticket.price)}
                        </div>
                      </div>
                      <span className="font-medium">${formatPrice(ticket.price * ticket.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 font-medium">
                    <span>Tickets Subtotal:</span>
                    <span>${formatPrice(ticketSubtotal)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Food Items */}
            {bookingData.selectedFoodItems && bookingData.selectedFoodItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Food Items</h3>
                <div className="space-y-2">
                  {bookingData.selectedFoodItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} × ${formatPrice(item.price)}
                        </div>
                      </div>
                      <span className="font-medium">${formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 font-medium">
                    <span>Food Subtotal:</span>
                    <span>${formatPrice(foodSubtotal)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center text-2xl font-bold text-gray-800">
                <span>Total Amount:</span>
                <span>${formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleProceedToPayment}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSummary;
