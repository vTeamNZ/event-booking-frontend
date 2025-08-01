import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createCheckoutSession } from '../services/checkoutService';
import { message } from 'antd';
import SEO from '../components/SEO';
import { useAuth } from '../hooks/useAuth';
import { reservationService, TicketReservationRequest } from '../services/reservationService';
import { BookingData } from '../types/booking';
import { qrCodeService, QRCodeGenerationRequest, OrganizerBookingRequest } from '../services/qrCodeService';
import { seatingAPIService } from '../services/seating-v2/seatingAPIService';
import { processingFeeService, ProcessingFeeCalculation } from '../services/processingFeeService';
import { afterPayFeeService, AfterPayFeeSettings, AfterPayFeeCalculation } from '../services/afterPayFeeService';
import { useEventDetails } from '../contexts/BookingContext';
import EventHero from '../components/EventHero';
import TrustIndicators from '../components/TrustIndicators';
import LegalConsent from '../components/LegalConsent';
import BusinessInfo from '../components/BusinessInfo';

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
    seatTicketId?: string; // Optional seat/ticket association
    seatTicketType?: string; // Optional association type
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
  const { fetchEventDetails, eventDetails } = useEventDetails();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isOrganizer } = useAuth();
  const [processingFee, setProcessingFee] = useState<ProcessingFeeCalculation | null>(null);
  const [loadingProcessingFee, setLoadingProcessingFee] = useState(true);
  const [useAfterPay, setUseAfterPay] = useState(false);
  const [afterPaySettings, setAfterPaySettings] = useState<AfterPayFeeSettings | null>(null);
  const [afterPayFee, setAfterPayFee] = useState<AfterPayFeeCalculation | null>(null);
  const [loadingAfterPay, setLoadingAfterPay] = useState(true);
  const [legalConsentValid, setLegalConsentValid] = useState(false);

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
      seatTicketId: food.seatTicketId, // Preserve seat/ticket association
      seatTicketType: food.seatTicketType // Preserve association type
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
    // More detailed validation
    if (!state) {
      navigate('/');
      return;
    }

    if (!eventId) {
      navigate('/');
      return;
    }

    if (!eventTitle) {
      navigate('/');
      return;
    }

    // Check if it's BookingData format
    if (isNewFormat) {
      const bookingData = state as BookingData;
      
      if (bookingData.bookingType === 'tickets' && 
          (!bookingData.selectedTickets || bookingData.selectedTickets.length === 0)) {
        navigate('/');
        return;
      }
      
      if (bookingData.bookingType === 'seats' && 
          (!bookingData.selectedSeats || bookingData.selectedSeats.length === 0)) {
        navigate('/');
        return;
      }
    } else {
      // Legacy format validation
      if (!ticketDetails || ticketDetails.length === 0) {
        navigate('/');
        return;
      }
    }
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

  // Load AfterPay settings
  useEffect(() => {
    const loadAfterPaySettings = async () => {
      try {
        setLoadingAfterPay(true);
        const settings = await afterPayFeeService.getSettings();
        setAfterPaySettings(settings);
        
        // Only set default state if AfterPay is enabled
        if (settings.enabled) {
          setUseAfterPay(false); // Default to unchecked
        }
      } catch (error) {
        console.error('Error loading AfterPay settings:', error);
        setAfterPaySettings(null);
      } finally {
        setLoadingAfterPay(false);
      }
    };

    loadAfterPaySettings();
  }, []);

  // Calculate AfterPay fees when checkbox is toggled
  useEffect(() => {
    const calculateAfterPayFees = async () => {
      if (!useAfterPay || !afterPaySettings?.enabled) {
        setAfterPayFee(null);
        return;
      }

      // Calculate based on base amount including processing fees
      const baseAmount = processingFee && processingFee.processingFeeAmount > 0 
        ? processingFee.totalAmount 
        : amount;

      try {
        const feeCalculation = afterPayFeeService.calculateFeeLocally(baseAmount, afterPaySettings);
        setAfterPayFee(feeCalculation);
      } catch (error) {
        console.error('Error calculating AfterPay fees:', error);
        setAfterPayFee(null);
      }
    };

    calculateAfterPayFees();
  }, [useAfterPay, afterPaySettings, amount, processingFee]);

  // Fetch event details for organizer information
  useEffect(() => {
    if (eventId) {
      fetchEventDetails(eventId);
    }
  }, [eventId, fetchEventDetails]);

  // Calculate final amount to use throughout the component
  const baseAmount = processingFee && processingFee.processingFeeAmount > 0 
    ? processingFee.totalAmount 
    : amount;
  
  // Add AfterPay fee if selected
  const finalAmount = useAfterPay && afterPayFee 
    ? afterPayFee.totalAmount 
    : baseAmount;
  if (!state || !eventId || !eventTitle) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
          <h2 className="text-2xl font-bold text-warning mb-4">Invalid Payment State</h2>
          <p className="text-gray-300 mb-6">
            We couldn't process your payment because some required information is missing.
            Please try again from the event details page.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary hover:bg-primary-dark text-black py-2 px-4 rounded transition-colors font-semibold"
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

      // Validate legal consent
      if (!legalConsentValid) {
        setError('Please accept all legal agreements (Terms and Conditions, Privacy Policy, and Refund Policy) to continue');
        setLoading(false);
        return;
      }

      // ? SIMPLIFIED APPROACH: No API reservation calls needed
      // Just use the seat data directly for payment processing

      // Convert ticket details to the format expected by the API
      const ticketLineItems = ticketDetails.map(ticket => ({
        type: ticket.type,
        quantity: ticket.quantity,
        unitPrice: ticket.price / ticket.quantity,
      }));

      // Convert food details to the format expected by the API
      const foodLineItems = selectedFoods?.map(food => ({
        name: food.name,
        quantity: food.quantity,
        unitPrice: food.price,
        seatTicketId: food.seatTicketId,
        seatTicketType: food.seatTicketType
      })) || [];

      // Get selected seat numbers for checkout
      let selectedSeatNumbers: string[] = [];
      if (isNewFormat) {
        const bookingData = state as BookingData;
        if (bookingData.bookingType === 'seats' && bookingData.selectedSeats) {
          selectedSeatNumbers = bookingData.selectedSeats.map(seat => seat.seatNumber || `${seat.row}${seat.number}`);
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
        successUrl: `${window.location.origin}${process.env.PUBLIC_URL}/payment-success`,
        cancelUrl: `${window.location.origin}${process.env.PUBLIC_URL}/payment-cancelled`,
        ticketDetails: ticketLineItems,
        foodDetails: foodLineItems,
        selectedSeats: selectedSeatNumbers.length > 0 ? selectedSeatNumbers : undefined,
        useAfterPay: useAfterPay,
        // Note: No longer using session ID from localStorage
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
        
        // Note: No longer using session storage cleanup
        
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

      if (seatNumbers.length === 0) {
        setError('No seats selected for booking');
        return;
      }

      // Validate customer details for organizer booking
      if (!customerDetails.email || customerDetails.email.trim() === '') {
        setError('Email address is required for organizer booking');
        return;
      }

      if (!customerDetails.firstName || customerDetails.firstName.trim() === '') {
        setError('First name is required for organizer booking');
        return;
      }

      // Create organizer direct booking using internal API
      const bookingRequest: OrganizerBookingRequest = {
        eventId: eventId,
        firstName: customerDetails.firstName.trim(),
        lastName: customerDetails.lastName?.trim() || undefined,
        buyerEmail: customerDetails.email.trim(),
        mobile: customerDetails.mobile?.trim() || undefined,
        seatNumbers: seatNumbers
      };

      try {
        const bookingResult = await qrCodeService.createOrganizerDirectBooking(bookingRequest);
        
        // Show success notification with booking details
        message.success({
          content: `Successfully created organizer booking for ${seatNumbers.length} seat(s)! Booking ID: ${bookingResult.bookingId}`,
          duration: 5
        });
        
        // Note: No longer using session storage cleanup
        
        // Reset form after successful booking
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) {
          form.reset();
        }
        
      } catch (error) {
        console.error('Error creating organizer booking:', error);
        message.error('Failed to create organizer booking. Please try again.');
        setError('Failed to create organizer booking. Please try again.');
      }

    } catch (err) {
      console.error('Error generating organizer booking:', err);
      setError('An error occurred while creating organizer booking. Please try again.');
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
      <div className="min-h-screen bg-gray-900">
        {/* Event Hero Section - Prioritize fresh data over cached context */}
        <EventHero 
          title={eventTitle}
          imageUrl={(state as any)?.imageUrl || eventDetails?.imageUrl}
          description="Complete your booking"
          organizationName={eventDetails?.organizationName}
          className="mb-8"
        />

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Complete Payment</h1>
            <p className="text-gray-400">Secure checkout with Stripe</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Payment Form Panel */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                
                {/* Customer Details Form */}
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-6">Customer Information</h2>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div className="mt-6">
                      <label htmlFor="mobile" className="block text-sm font-medium text-gray-300 mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        id="mobile"
                        name="mobile"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Enter mobile number (optional)"
                      />
                    </div>

                    {/* AfterPay Option */}
                    {!loadingAfterPay && afterPaySettings?.enabled && (
                      <div className="mt-6 p-4 bg-gray-750 border border-gray-600 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id="useAfterPay"
                            checked={useAfterPay}
                            onChange={(e) => setUseAfterPay(e.target.checked)}
                            className="mt-1 h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-600 rounded bg-gray-700"
                          />
                          <div className="flex-1">
                            <label htmlFor="useAfterPay" className="flex items-center text-sm font-medium text-white cursor-pointer">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-4 bg-teal-400 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">A</span>
                                </div>
                                <span>Use AfterPay</span>
                              </div>
                            </label>
                            <p className="text-xs text-gray-400 mt-1">
                              {afterPaySettings.description}
                            </p>
                            {useAfterPay && afterPayFee && (
                              <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-700/50 rounded text-xs">
                                <div className="text-yellow-300">
                                  <div>AfterPay Fee: ${afterPayFee.afterPayFeeAmount.toFixed(2)}</div>
                                  <div>New Total: ${afterPayFee.totalAmount.toFixed(2)}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mb-6 text-error text-sm bg-error/20 border border-error/20 p-4 rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Legal Consent */}
                  <LegalConsent onConsentChange={setLegalConsentValid} className="mb-6" />

                  {/* Trust Indicators */}
                  <TrustIndicators variant="payment" className="mb-6" />

                  {/* Action Buttons */}
                  <div className="border-t border-gray-700 pt-6">
                    {isAuthenticated && isOrganizer() ? (
                      <div className="space-y-4">
                        <button
                          type="submit"
                          disabled={loading || !legalConsentValid}
                          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                            loading || !legalConsentValid
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                              : 'bg-primary hover:bg-primary-dark text-black'
                          }`}
                        >
                          {loading ? 'Processing...' : `Pay $${finalAmount.toFixed(2)}`}
                        </button>
                        
                        <button
                          type="button"
                          disabled={loading || !legalConsentValid}
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
                          className="w-full py-3 px-6 border border-success rounded-lg font-semibold text-success hover:text-black hover:bg-success transition-colors duration-200"
                        >
                          {loading ? 'Generating...' : 'Generate QR Tickets (Organizer Only)'}
                        </button>
                        
                        <p className="text-xs text-gray-400 text-center">
                          As an organizer, you can generate QR tickets directly using your details.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <button
                          type="submit"
                          disabled={loading || !legalConsentValid}
                          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                            loading || !legalConsentValid
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                              : 'bg-primary hover:bg-primary-dark text-black'
                          }`}
                        >
                          {loading ? 'Creating Checkout...' : `Pay $${finalAmount.toFixed(2)}`}
                        </button>
                        
                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>You will be securely redirected to Stripe to complete your payment.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Order Summary Panel */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden sticky top-4">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-xl font-semibold text-white">Order Summary</h3>
                </div>

                <div className="p-6">
                  {/* Tickets Summary */}
                  {ticketDetails.length > 0 && (
                    <div className="mb-6 p-4 bg-gray-750 rounded-lg border border-gray-600">
                      <h4 className="text-white font-medium mb-3">Tickets</h4>
                      {ticketDetails.map((ticket, idx) => (
                        <div key={idx} className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">{ticket.quantity}x {ticket.type}</span>
                          <span className="text-white">${ticket.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Food Summary */}
                  {selectedFoods.length > 0 && (
                    <div className="mb-6 p-4 bg-gray-750 rounded-lg border border-gray-600">
                      <h4 className="text-white font-medium mb-3">Food & Beverages</h4>
                      {selectedFoods.map((item, idx) => {
                        const itemTotal = item.quantity * item.price;
                        return (
                          <div key={idx} className="flex justify-between text-sm mb-2">
                            <span className="text-gray-300">{item.quantity}x {item.name}</span>
                            <span className="text-white">${itemTotal.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span>${amount.toFixed(2)}</span>
                    </div>
                    
                    {/* Processing Fee */}
                    {processingFee && processingFee.processingFeeAmount > 0 && (
                      <div className="flex justify-between text-gray-400 text-sm">
                        <span>{processingFee.description}</span>
                        <span>${processingFee.processingFeeAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {loadingProcessingFee && (
                      <div className="flex justify-between text-gray-500 text-sm">
                        <span>Calculating processing fee...</span>
                        <span>-</span>
                      </div>
                    )}

                    {/* AfterPay Fee */}
                    {useAfterPay && afterPayFee && (
                      <div className="flex justify-between text-yellow-400 text-sm">
                        <span>AfterPay Fee ({afterPaySettings?.percentage}% + ${afterPaySettings?.fixedAmount})</span>
                        <span>${afterPayFee.afterPayFeeAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between text-xl font-bold text-white">
                        <span>Total Amount</span>
                        <span className="text-primary">
                          ${finalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Security Indicator */}
                  <TrustIndicators variant="checkout" className="mt-6" />

                  {/* Business Information */}
                  <BusinessInfo variant="compact" className="mt-6" />

                  {/* Back Button */}
                  <div className="mt-8">
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

export default Payment;
