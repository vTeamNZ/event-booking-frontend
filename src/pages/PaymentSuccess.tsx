import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { verifyCheckoutSession } from '../services/checkoutService';
import SEO from '../components/SEO';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const navigationState = location.state as any;

  // Check if this is a QR ticket generation success
  const isQRTicketSuccess = navigationState?.isQRTickets;
  const isReservationSuccess = navigationState?.isReservation;

  useEffect(() => {
    // If we have navigation state (QR tickets or reservation), skip payment verification
    if (isQRTicketSuccess || isReservationSuccess) {
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        const result = await verifyCheckoutSession(sessionId);
        if (result.isSuccessful) {
          setSessionData(result);
        } else {
          setError('Payment was not successful');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Could not verify payment status');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, isQRTicketSuccess, isReservationSuccess]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Use the provided data from sessionData

  // Handle QR ticket generation success
  if (isQRTicketSuccess) {
    const qrResults = navigationState.qrResults || [];
    const eventTitle = navigationState.eventTitle || 'Event';
    
    return (
      <>
        <SEO 
          title="QR Tickets Generated Successfully"
          description="QR tickets have been generated successfully. You can now use these tickets for event entry."
          keywords={['QR Tickets', 'Event Tickets', 'Organizer Access']}
        />
        <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">QR Tickets Generated!</h1>
            <p className="text-gray-600 mb-4">
              Your QR tickets for {eventTitle} have been generated successfully as an organizer.
            </p>
            <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg inline-flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              QR tickets have been saved to the system and can be accessed for event entry.
            </div>
          </div>

          {qrResults.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Generated Tickets</h3>
              <div className="space-y-2">
                {qrResults.map((qrResult: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                    <span className="text-gray-600">Seat {qrResult.seatNo}:</span>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        qrResult.result.isDuplicate 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {qrResult.result.isDuplicate ? 'Already Existed' : 'Generated'}
                      </span>
                      {qrResult.result.bookingId && (
                        <div className="text-xs text-gray-500 mt-1">
                          Booking ID: {qrResult.result.bookingId}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Back to Events
            </button>
          </div>
        </div>
      </>
    );
  }

  // Handle reservation success (existing functionality)
  if (isReservationSuccess) {
    const eventTitle = navigationState.eventTitle || 'Event';
    const reservationId = navigationState.reservationId;
    
    return (
      <>
        <SEO 
          title="Tickets Reserved Successfully"
          description="Your tickets have been reserved successfully without payment."
          keywords={['Ticket Reservation', 'Organizer Access', 'Event Booking']}
        />
        <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tickets Reserved!</h1>
            <p className="text-gray-600 mb-4">
              Your tickets for {eventTitle} have been reserved without payment as an organizer.
            </p>
            {reservationId && (
              <div className="text-sm text-gray-600 bg-purple-50 p-4 rounded-lg inline-flex items-center">
                <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Reservation ID: {reservationId}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Back to Events
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Payment Successful"
        description="Thank you for your booking! Your payment has been processed successfully. A confirmation email has been sent to your inbox."
        keywords={['Booking Confirmation', 'Payment Success', 'Event Tickets Booked']}
      />
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            {sessionData?.eventTitle ? `Your tickets for ${sessionData.eventTitle} have been booked and your e-ticket has been emailed to you.` : 'Thank you for your purchase.'}
          </p>
          <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg inline-flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            A payment receipt has been sent to your email. Please note that it may take a short while for the email to arrive in your inbox.
          </div>
        </div>

        {sessionData && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="space-y-2">
              {sessionData.customerName && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Customer Name:</span>
                  <span className="font-medium">{sessionData.customerName}</span>
                </div>
              )}
              
              {sessionData.ticketReference && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ticket Reference:</span>
                  <span className="font-mono text-sm">{sessionData.ticketReference}</span>
                </div>
              )}
              
              {sessionData.paymentId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Reference:</span>
                  <span className="font-mono text-sm">{sessionData.paymentId}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-bold text-primary">
                  ${sessionData.amountTotal ? (sessionData.amountTotal / 100).toFixed(2) : '0.00'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email:</span>
                <span className="text-sm">{sessionData.customerEmail}</span>
              </div>
              
              {sessionData.bookedSeats && sessionData.bookedSeats.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Seat(s):</span>
                  <span className="text-sm font-medium">{sessionData.bookedSeats.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Back to Events
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
