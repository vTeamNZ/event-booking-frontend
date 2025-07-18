import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const PaymentCancelled: React.FC = () => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    navigate(-1); // Go back to payment page
  };

  return (
    <>
      <SEO 
        title="Payment Cancelled" 
        description="Your payment was cancelled. You can try again or browse other events. No charges have been made to your card." 
        keywords={["Payment Cancelled", "Payment Interrupted", "Retry Payment", "Event Booking"]}
      />
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-4 shadow-2xl rounded-xl sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Cancelled</h2>
              <p className="mt-2 text-sm text-gray-300">
                Your payment was cancelled. No charges have been made to your card.
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleRetryPayment}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Try Payment Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Return to Events
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentCancelled;
