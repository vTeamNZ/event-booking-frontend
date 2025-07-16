import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createCheckoutSession } from '../services/checkoutService';
import { message } from 'antd';
import SEO from '../components/SEO';
import { useAuth } from '../hooks/useAuth';
import { reservationService, TicketReservationRequest } from '../services/reservationService';
import { BookingData } from '../types/booking';
import { qrCodeService, QRCodeGenerationRequest } from '../services/qrCodeService';
import { seatSelectionService } from '../services/seatSelectionService';
import { completeBookingCleanup } from '../utils/seating-v2/sessionStorage';
import { processingFeeService, ProcessingFeeCalculation } from '../services/processingFeeService';

interface LegacyPaymentLocationState {
  amount: number;
  eventTitle: string;
  eventId: number;
  imageUrl?: string;
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
  const [processingFee, setProcessingFee] = useState<ProcessingFeeCalculation | null>(null);
  const [loadingProcessingFee, setLoadingProcessingFee] = useState(true);

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

  // Calculate processing fees
  useEffect(() => {
    const calculateProcessingFees = async () => {
      if (!eventId || amount <= 0) {
        setLoadingProcessingFee(false);
        return;
      }

      try {
        setLoadingProcessingFee(true);
        const feeCalculation = await processingFeeService.calculateProcessingFee(eventId, amount);
        setProcessingFee(feeCalculation);
      } catch (error) {
        console.error('Error calculating processing fees:', error);
        // If processing fee calculation fails, continue without fees
        setProcessingFee(null);
      } finally {
        setLoadingProcessingFee(false);
      }
    };

    calculateProcessingFees();
  }, [eventId, amount]);

  // Calculate final amount to use throughout the component
  const finalAmount = processingFee && processingFee.processingFeeAmount > 0 
    ? processingFee.totalAmount 
    : amount;
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

      // Get selected seat numbers if this is a seat booking
      let selectedSeatNumbers: string[] = [];
      if (isNewFormat) {
        const bookingData = state as BookingData;
        if (bookingData.bookingType === 'seats' && bookingData.selectedSeats) {
          selectedSeatNumbers = bookingData.selectedSeats.map(seat => `${seat.row}${seat.number}`);
        }
      }

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
        selectedSeats: selectedSeatNumbers.length > 0 ? selectedSeatNumbers : undefined,
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
        totalAmount: finalAmount
      };
      
      const result = await reservationService.reserveTickets(reservationData);
      
      if (result.success) {
        message.success('Tickets reserved successfully!');
        
        // Clear session storage since reservation is completed
        completeBookingCleanup(eventId, 'reservation_success');
        
        navigate(`/payment/success`, {
          state: {
            eventTitle,
            eventId, // Include eventId in state for cleanup verification
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

  const handleGenerateQRTickets = async (customerDetails: CustomerDetails) => {
    if (!isAuthenticated || !isOrganizer()) {
      message.error('Only organizers can generate QR tickets without payment');
      return;
    }

    if (!eventId) {
      setError('Missing event information');
      return;
    }

    if (!user?.fullName || !user?.email) {
      setError('Missing organizer information');
      return;
    }
    
    setLoading(true);
    
    try {
      // Generate seat numbers based on booking data
      let seatNumbers: string[] = [];
      
      if (isNewFormat) {
        const bookingData = state as BookingData;
        if (bookingData.bookingType === 'seats' && bookingData.selectedSeats) {
          // Use actual selected seats
          seatNumbers = bookingData.selectedSeats.map(seat => `${seat.row}${seat.number}`);
        } else if (bookingData.bookingType === 'tickets' && bookingData.selectedTickets) {
          // Generate sequential seat numbers for ticket-based bookings
          let seatCounter = 1;
          bookingData.selectedTickets.forEach(ticket => {
            for (let i = 0; i < ticket.quantity; i++) {
              seatNumbers.push(`A${seatCounter}`); // Using row A for general tickets
              seatCounter++;
            }
          });
        }
      } else {
        // Legacy format - generate seats based on ticket details
        let seatCounter = 1;
        ticketDetails.forEach(ticket => {
          for (let i = 0; i < ticket.quantity; i++) {
            seatNumbers.push(`A${seatCounter}`);
            seatCounter++;
          }
        });
      }

      // Generate QR codes for each seat
      const qrResults = [];
      for (const seatNo of seatNumbers) {
        const qrRequest: QRCodeGenerationRequest = {
          eventID: eventId.toString(),
          eventName: eventTitle,
          seatNo: seatNo,
          firstName: user.fullName, // Use organizer's name
          paymentGUID: qrCodeService.generateGUID(),
          buyerEmail: user.email, // Use organizer's email as buyer
          organizerEmail: user.email // Use organizer's email as organizer
        };

        try {
          const qrResult = await qrCodeService.generateETicket(qrRequest);
          qrResults.push({ seatNo, result: qrResult });
          
          if (qrResult.isDuplicate) {
            message.warning(`Ticket for seat ${seatNo} already exists - duplicate prevented`);
          }
        } catch (error) {
          console.error(`Failed to generate QR code for seat ${seatNo}:`, error);
          message.error(`Failed to generate QR code for seat ${seatNo}`);
        }
      }

      if (qrResults.length > 0) {
        const successCount = qrResults.filter(r => !r.result.isDuplicate).length;
        const duplicateCount = qrResults.filter(r => r.result.isDuplicate).length;
        
        if (successCount > 0) {
          message.success(`Successfully generated ${successCount} QR ticket(s)!`);
        }
        if (duplicateCount > 0) {
          message.info(`${duplicateCount} ticket(s) already existed and were not regenerated.`);
        }
        
        // Mark seats as booked in the database (only for successfully generated tickets)
        try {
          const successfulSeatNumbers = qrResults
            .filter(r => !r.result.isDuplicate)
            .map(r => r.seatNo);
          
          if (successfulSeatNumbers.length > 0) {
            await seatSelectionService.markSeatsAsBooked({
              eventId: eventId,
              seatNumbers: successfulSeatNumbers,
              organizerEmail: user.email
            });
            console.log(`Successfully marked ${successfulSeatNumbers.length} seats as booked`);
          }
        } catch (seatBookingError) {
          console.error('Error marking seats as booked:', seatBookingError);
          // Don't show error to user since QR codes were already generated successfully
          // This is a non-critical operation that can be handled later if needed
        }
        
        // Clear session storage before navigation since booking is completed
        completeBookingCleanup(eventId, 'qr_ticket_generation');
        
        // Navigate to success page with QR ticket information
        navigate('/payment/success', {
          state: {
            eventTitle,
            eventId, // Include eventId in state for cleanup verification
            isQRTickets: true,
            qrResults: qrResults,
            organizerGenerated: true
          }
        });
      } else {
        setError('No QR tickets were generated. Please try again.');
      }
    } catch (err) {
      console.error('Error generating QR tickets:', err);
      setError('An error occurred while generating QR tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title={`Checkout - ${eventTitle}`}
        description="Complete your booking securely with Stripe payment integration."
      />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative">
          {/* Event Image */}
          <div className="relative h-[300px] w-full overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url('${(state as any)?.imageUrl || '/events/fallback.jpg'}')`,
                filter: 'brightness(0.7)'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />
          </div>

          {/* Event Details Overlay */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
              <button
                onClick={() => navigate(-1)}
                className="text-white/80 hover:text-white mb-6 flex items-center gap-2 transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold mb-2">{eventTitle}</h1>
              <p className="text-lg text-white/90">Complete your booking</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto -mt-10 relative z-10 px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Payment Details</h2>

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
                  <div className="flex justify-between text-base font-medium text-gray-800 mb-2">
                    <span>Subtotal</span>
                    <span>${amount.toFixed(2)}</span>
                  </div>
                  
                  {/* Processing Fee */}
                  {processingFee && processingFee.processingFeeAmount > 0 && (
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{processingFee.description}</span>
                      <span>${processingFee.processingFeeAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {loadingProcessingFee && (
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>Calculating processing fee...</span>
                      <span>-</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                    <span>Total Amount</span>
                    <span className="text-primary">
                      ${processingFee ? processingFee.totalAmount.toFixed(2) : amount.toFixed(2)}
                    </span>
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
                        {loading ? 'Processing...' : `Pay $${finalAmount.toFixed(2)}`}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          const form = document.querySelector('form') as HTMLFormElement;
                          const formData = new FormData(form);
                          const customerDetails = {
                            firstName: formData.get('firstName') as string,
                            lastName: formData.get('lastName') as string,
                            email: formData.get('email') as string,
                            mobile: formData.get('mobile') as string
                          };
                          handleGenerateQRTickets(customerDetails);
                        }}
                        className="w-full flex justify-center py-3 px-4 border border-green-500 rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        {loading ? 'Generating...' : 'Generate QR Tickets (Organizer Only)'}
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        As an organizer, you can generate QR tickets directly using your details.
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
                      {loading ? 'Creating Checkout...' : `Pay $${finalAmount.toFixed(2)}`}
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
