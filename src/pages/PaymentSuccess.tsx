import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyCheckoutSession } from '../services/checkoutService';
import SEO from '../components/SEO';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
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
  }, [sessionId]);

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
            {sessionData?.eventTitle ? `Your tickets for ${sessionData.eventTitle} have been booked.` : 'Thank you for your purchase.'}
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
