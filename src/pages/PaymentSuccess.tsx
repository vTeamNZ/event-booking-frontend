import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { verifyPaymentWithPolling } from '../services/checkoutService';
import SEO from '../components/SEO';
import { safeBookingCompletionCleanup, completeBookingCleanup } from '../utils/seating-v2/sessionStorage';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationSource, setVerificationSource] = useState<string>('');
  const [pollingProgress, setPollingProgress] = useState<string>('');

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

    // ✅ DEBUGGING: Let's manually test with the provided session ID
    const debugSessionId = 'cs_live_b1AatAjPoYbWLxQV0uVPiQl0Yth2RWqO83eGKZTbFyEPzl0QpwU5PF45Wx';
    const testSessionId = sessionId || debugSessionId;

    // ✅ NEW: Enhanced payment verification with polling
    const verifyPayment = async () => {
      if (!testSessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        setPollingProgress('Verifying your payment...');
        console.log('DEBUG: Using session ID:', testSessionId);
        
        const result = await verifyPaymentWithPolling(testSessionId, (message, attempt) => {
          setPollingProgress(message);
        });
        
        console.log('DEBUG: Full verification result:', result);
        
        if (result.success && result.sessionData) {
          console.log('DEBUG: SessionData received:', JSON.stringify(result.sessionData, null, 2));
          setSessionData(result.sessionData);
          setVerificationSource(result.source);
          setPollingProgress(result.source === 'webhook' ? 
            `Payment processed by payment system (${result.processingTime || 0}s)` : 
            'Payment verified by backup system');
          
          console.log(`Payment verified via ${result.source}:`, result.sessionData);
        } else {
          setError(result.error || 'Payment was not successful');
          setPollingProgress('Payment verification failed');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Could not verify payment status');
        setPollingProgress('Verification error occurred');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, isQRTicketSuccess, isReservationSuccess]);

  // Clear session storage when booking is completed successfully
  useEffect(() => {
    // Only run cleanup after we have determined the booking was successful
    if (loading) return;

    let shouldCleanup = false;
    let cleanupContext = '';

    if (isQRTicketSuccess) {
      shouldCleanup = true;
      cleanupContext = 'qr_ticket_generation';
    } else if (isReservationSuccess) {
      shouldCleanup = true;
      cleanupContext = 'reservation_success';
    } else if (sessionData && !error) {
      shouldCleanup = true;
      cleanupContext = 'webhook_payment_success';
    }

    if (shouldCleanup) {
      // Try to extract event ID and clear session storage
      const cleanupSuccessful = safeBookingCompletionCleanup(
        searchParams,
        navigationState,
        sessionData,
        cleanupContext
      );

      if (cleanupSuccessful) {
        console.log('[PaymentSuccess] Session storage cleanup completed successfully');
      } else {
        console.warn('[PaymentSuccess] Could not complete session storage cleanup - event ID not found');
      }
    }
  }, [loading, sessionData, error, isQRTicketSuccess, isReservationSuccess, searchParams, navigationState]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Processing Your Payment</h3>
          <p className="text-gray-600 mb-4">{pollingProgress || 'Verifying your payment...'}</p>
          
          {/* ✅ Show verification source if available */}
          {verificationSource && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Verification method: {verificationSource === 'webhook' ? 'Real-time processing' : 'Backup verification'}
            </div>
          )}
          
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">This usually takes just a few seconds...</p>
          </div>
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
          <p className="text-gray-600 mb-4">{error}</p>
          
          {/* ✅ Show additional context */}
          {pollingProgress && (
            <p className="text-sm text-gray-500 mb-4">Status: {pollingProgress}</p>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              Return to Home
            </button>
          </div>
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
          
          <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg inline-flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v10a2 2 0 002 2z"></path>
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
              
              {sessionData.paymentId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Reference:</span>
                  <span className="font-mono text-sm">{sessionData.paymentId}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-bold text-primary">
                  ${sessionData.amountTotal ? (typeof sessionData.amountTotal === 'number' ? sessionData.amountTotal.toFixed(2) : (sessionData.amountTotal / 100).toFixed(2)) : '0.00'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email:</span>
                <span className="text-sm">{sessionData.customerEmail}</span>
              </div>
              
              {sessionData.bookedSeats && Array.isArray(sessionData.bookedSeats) && sessionData.bookedSeats.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Seat(s):</span>
                  <span className="text-sm font-medium">{sessionData.bookedSeats.join(', ')}</span>
                </div>
              )}
              
              {/* ✅ Show QR ticket generation status */}
              {sessionData.qrTicketsGenerated && Array.isArray(sessionData.qrTicketsGenerated) && sessionData.qrTicketsGenerated.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">QR Ticket Status:</h4>
                  <div className="space-y-1">
                    {sessionData.qrTicketsGenerated.map((qr: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Seat {qr.seatNumber}:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          qr.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {qr.success ? '✓ Generated' : '✗ Failed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* ✅ Show booking ID if available */}
              {sessionData.bookingId && sessionData.bookingId !== 0 && (
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Booking ID:</span>
                  <span className="font-mono">{sessionData.bookingId}</span>
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
